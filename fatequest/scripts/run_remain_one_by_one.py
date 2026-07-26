#!/usr/bin/env python3
"""Run ART_PROMPTS_REQ_REMAIN.md one window at a time until empty.

After each finished window, run postprocess_art.py (dealpha → strip_checker →
audit). The generation pipeline still bakes checkerboard into transparent
exports — never skip the audit step.
"""

from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VENV_PY = ROOT / ".venv" / "bin" / "python"
ART = ROOT.parent / "assets" / "art"
PROMPTS = "ART_PROMPTS_REQ_REMAIN.md"
WINDOWS = ["Region", "VenueDock", "VenueOfficial", "VenueHeal", "VenueScribe"]
COOLDOWN = 90

# Expected output globs per window (for postprocess + audit)
WINDOW_GLOBS = {
    "Region": ["scene-region-*.webp"],
    "VenueDock": ["npc-dock-*.webp"],
    "VenueOfficial": ["npc-official-*.webp"],
    "VenueHeal": ["npc-healer-*.webp"],
    "VenueScribe": ["npc-scribe-*.webp"],
}


def dry_pending() -> list[str]:
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
    if "Queue: 0 windows" in out or "Nothing pending" in out:
        return []
    pending: list[str] = []
    for w in WINDOWS:
        if f"  {w}:" in out:
            pending.append(w)
    return pending


def postprocess_window(window: str) -> int:
    globs = WINDOW_GLOBS.get(window, [])
    if not globs:
        return 0
    print(f"\n=== POSTPROCESS+AUDIT {window}: {globs} ===", flush=True)
    return subprocess.run(
        [str(VENV_PY), "postprocess_art.py", *globs],
        cwd=ROOT,
    ).returncode


def run_window(window: str) -> int:
    print(f"\n=== ONE WINDOW: {window} ===", flush=True)
    return subprocess.run(
        [
            str(VENV_PY),
            "orchestrate_req.py",
            "--prompts-file",
            PROMPTS,
            "--window-order",
            window,
            "--max-windows",
            "1",
            "--poll-sec",
            "600",
            "--skip-existing",
            "--wait-login-ms",
            "600000",
            "--rate-limit-ms",
            "600000",
        ],
        cwd=ROOT,
    ).returncode


def main() -> int:
    while True:
        pending = dry_pending()
        if not pending:
            print("ALL REMAIN COMPLETE — final audit pass", flush=True)
            # audit every remain target once more
            all_globs = [g for gs in WINDOW_GLOBS.values() for g in gs]
            subprocess.run([str(VENV_PY), "postprocess_art.py", *all_globs], cwd=ROOT)
            return 0
        window = pending[0]
        before = {p.name for p in ART.glob("*.webp")}
        code = run_window(window)
        print(f"window {window} exit={code}", flush=True)
        pending2 = dry_pending()
        # postprocess whenever this window dropped off the queue
        if window not in pending2:
            pp = postprocess_window(window)
            after = {p.name for p in ART.glob("*.webp")}
            print(f"new files this window: {sorted(after - before)}", flush=True)
            if pp != 0:
                print(
                    f"WARN: audit flagged issues for {window} (exit={pp})",
                    flush=True,
                )
        if not pending2:
            print("ALL REMAIN COMPLETE — final audit pass", flush=True)
            all_globs = [g for gs in WINDOW_GLOBS.values() for g in gs]
            subprocess.run([str(VENV_PY), "postprocess_art.py", *all_globs], cwd=ROOT)
            return 0
        if window in pending2:
            print(f"{window} still pending; cooldown {COOLDOWN}s…", flush=True)
            time.sleep(COOLDOWN)
        else:
            print(f"{window} done; next={pending2[0]}", flush=True)


if __name__ == "__main__":
    raise SystemExit(main())
