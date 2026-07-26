#!/usr/bin/env python3
"""Post-process newly generated art: dealpha → strip_checker → audit.

Generation pipeline still bakes checkerboard into transparent exports.
Always run this after a harvest window before marking assets done.

Usage:
  .venv/bin/python postprocess_art.py                 # all art/*.webp
  .venv/bin/python postprocess_art.py scene-region-*.webp npc-dock-*.webp
"""

from __future__ import annotations

import glob
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ART = ROOT.parent / "assets" / "art"
VENV_PY = ROOT / ".venv" / "bin" / "python"
TOOLS = ROOT.parent / "tools" / "art"


def resolve_targets(patterns: list[str]) -> list[Path]:
    if not patterns:
        return sorted(ART.glob("*.webp"))
    out: list[Path] = []
    for pat in patterns:
        p = Path(pat)
        if p.is_absolute():
            out.extend(sorted(glob.glob(str(p))))
        else:
            out.extend(sorted(ART.glob(pat)))
            out.extend(sorted(ART.glob(p.name)))
    # unique preserve order
    seen: set[str] = set()
    uniq: list[Path] = []
    for f in out:
        fp = str(Path(f).resolve())
        if fp in seen:
            continue
        seen.add(fp)
        uniq.append(Path(fp))
    return uniq


def run_dealpha() -> None:
    script = ROOT / "dealpha.py"
    if not script.exists():
        print("skip dealpha (missing)", flush=True)
        return
    subprocess.run([str(VENV_PY), str(script), "--apply"], cwd=ROOT, check=False)


def main() -> int:
    targets = resolve_targets(sys.argv[1:])
    if not targets:
        print("no target files", flush=True)
        return 1

    print(f"postprocess {len(targets)} files…", flush=True)
    run_dealpha()

    sys.path.insert(0, str(TOOLS))
    import audit as au  # noqa: E402
    import strip_checker as sc  # noqa: E402

    checker = broken = ok = 0
    for path in targets:
        before, killed = sc.process(str(path), write=True)
        state, note, share = au.classify(str(path))
        if state == "CHECKER":
            # strip once more if still flagged
            before2, killed2 = sc.process(str(path), write=True)
            state, note, share = au.classify(str(path))
            killed += killed2
        icon = {"OK": "OK", "CHECKER": "CHECKER", "BROKEN": "BROKEN"}.get(state, state)
        print(
            f"  {path.name:40s} audit={icon:8s} strip_px={killed:6d} {note}",
            flush=True,
        )
        if state == "OK":
            ok += 1
        elif state == "CHECKER":
            checker += 1
        else:
            broken += 1

    print(
        f"summary OK={ok} CHECKER={checker} BROKEN={broken} / {len(targets)}",
        flush=True,
    )
    if checker or broken:
        print(
            "WARN: generation pipeline still embeds checkerboard / failed alpha. "
            "Re-run strip_checker or regenerate failed files.",
            flush=True,
        )
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
