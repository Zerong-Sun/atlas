#!/usr/bin/env python3
"""Keep running orchestrate_req until ART_PROMPTS_REQ_P4P5 has nothing pending.

Usage:
  .venv/bin/python run_until_done_p45.py
"""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV_PY = ROOT / ".venv" / "bin" / "python"
PROMPTS = "ART_PROMPTS_REQ_P4P5.md"
COOLDOWN = 90


def pending_count() -> int:
    r = subprocess.run(
        [
            str(VENV_PY),
            "orchestrate_req.py",
            "--prompts-file",
            PROMPTS,
            "--dry-run",
            "--skip-existing",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    out = (r.stdout or "") + (r.stderr or "")
    print(out, flush=True)
    if "Nothing pending" in out or "Queue: 0 windows" in out:
        return 0
    # sum ~N files lines
    total = 0
    for line in out.splitlines():
        if "files" in line and "~" in line:
            try:
                total += int(line.split("~")[-1].split()[0])
            except Exception:
                pass
    # if windows listed but parse failed, treat as >0 when Queue: N
    for line in out.splitlines():
        if line.startswith("Prompts") and "Queue:" in line:
            try:
                n = int(line.split("Queue:")[1].split()[0])
                if n == 0:
                    return 0
                if total == 0:
                    return n  # at least windows remain
            except Exception:
                pass
    return total


def main() -> int:
    round_i = 0
    while True:
        left = pending_count()
        print(f"\n=== until-done check: {left} files/windows pending ===", flush=True)
        if left <= 0:
            print("ALL P4/P5 COMPLETE", flush=True)
            return 0
        round_i += 1
        print(f"\n=== launch orchestrator round {round_i} ===", flush=True)
        proc = subprocess.run(
            [
                str(VENV_PY),
                "orchestrate_req.py",
                "--prompts-file",
                PROMPTS,
                "--max-windows",
                "2",
                "--poll-sec",
                "600",
                "--skip-existing",
                "--wait-login-ms",
                "600000",
                "--rate-limit-ms",
                "600000",
            ],
            cwd=ROOT,
        )
        print(f"orchestrator exit={proc.returncode}", flush=True)
        left2 = pending_count()
        if left2 <= 0:
            print("ALL P4/P5 COMPLETE", flush=True)
            return 0
        print(f"still pending ~{left2}; cooldown {COOLDOWN}s then retry…", flush=True)
        time.sleep(COOLDOWN)


if __name__ == "__main__":
    raise SystemExit(main())
