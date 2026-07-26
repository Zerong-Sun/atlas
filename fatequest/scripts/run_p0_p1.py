#!/usr/bin/env python3
"""Run art pipeline: P0+P1 parallel → P2 (currency+stickers) → I Ching 31–64."""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV = str(ROOT / ".venv" / "bin" / "python")

PHASE_PARALLEL = [
    ("P0", "ART_PROMPTS_REQ_P0.md"),
    ("P1", "ART_PROMPTS_REQ_P1.md"),
]
PHASE_SEQUENTIAL = [
    ("P2", "ART_PROMPTS_REQ_P2_CONTENT.md"),
    ("Iching", "ART_PROMPTS_ICHING_DECK.md"),
]

ORCH_ARGS = [
    "--max-windows",
    "1",
    "--poll-sec",
    "600",
    "--skip-existing",
    "--wait-login-ms",
    "600000",
    "--rate-limit-ms",
    "600000",
]


def pending_count(prompts_file: str) -> int:
    r = subprocess.run(
        [VENV, "orchestrate_req.py", "--prompts-file", prompts_file, "--dry-run", "--skip-existing"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    out = (r.stdout or "") + (r.stderr or "")
    if "Queue: 0 windows" in out or "Nothing pending" in out:
        return 0
    n = 0
    for line in out.splitlines():
        if line.startswith("  ") and "batches" in line and ":" in line:
            n += 1
    return n


def run_phase(label: str, prompts_file: str) -> int:
    print(f"\n========== {label} {prompts_file} (1 tab) ==========", flush=True)
    if pending_count(prompts_file) <= 0:
        print(f"  {label} nothing pending", flush=True)
        return 0
    return subprocess.run(
        [VENV, "orchestrate_req.py", "--prompts-file", prompts_file, *ORCH_ARGS],
        cwd=ROOT,
    ).returncode


def run_parallel_phase() -> int:
    pending = [(label, pf) for label, pf in PHASE_PARALLEL if pending_count(pf) > 0]
    if not pending:
        print("P0 + P1: nothing pending.", flush=True)
        return 0

    print(f"Parallel mode: {len(pending)} orchestrator(s), max 2 ChatGPT tabs", flush=True)
    for label, pf in pending:
        print(f"  {label}: {pending_count(pf)} windows left in {pf}", flush=True)

    procs: list[tuple[str, subprocess.Popen]] = []
    for label, pf in pending:
        print(f"\n>>> launch {label}", flush=True)
        p = subprocess.Popen(
            [VENV, "orchestrate_req.py", "--prompts-file", pf, *ORCH_ARGS],
            cwd=ROOT,
        )
        procs.append((label, p))
        time.sleep(3)

    rc = 0
    for label, p in procs:
        code = p.wait()
        print(f"  {label} exit={code}", flush=True)
        if code != 0:
            rc = code
    return rc


def postprocess() -> None:
    subprocess.run([VENV, "postprocess_art.py"], cwd=ROOT)


def main() -> int:
    subprocess.run([VENV, "copy_p1_legacy_scenes.py"], cwd=ROOT)

    rc = run_parallel_phase()
    if rc == 0:
        postprocess()
        print("\nP0 + P1 phase finished.", flush=True)
    else:
        print(f"\nP0/P1 stopped with exit {rc} — skipping P2/Iching.", flush=True)
        postprocess()
        return rc

    for label, pf in PHASE_SEQUENTIAL:
        code = run_phase(label, pf)
        if code != 0:
            print(f"\n{label} stopped with exit {code}", flush=True)
            postprocess()
            return code
        postprocess()
        print(f"\n{label} phase finished.", flush=True)

    print("\nFull pipeline (P0 → P1 → P2 → Iching) finished.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
