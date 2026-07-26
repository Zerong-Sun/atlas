#!/usr/bin/env python3
"""Copy legacy scene aliases for P1 (no generation needed)."""

from __future__ import annotations

import shutil
from pathlib import Path

ART = Path(__file__).resolve().parents[1] / "assets" / "art"

ALIASES = {
    "scene-badashan.webp": "scene-balc-ruins.webp",
    "scene-kashgar.webp": "scene-cascar-crossroads.webp",
    "scene-dunhuang.webp": "scene-band-central-oasis.webp",
    "scene-kinsay.webp": "scene-hangzhou-lake.webp",
}


def main() -> int:
    ok = 0
    for dst, src in ALIASES.items():
        sp = ART / src
        dp = ART / dst
        if not sp.exists():
            print(f"MISS source {src}")
            continue
        if dp.exists():
            print(f"SKIP existing {dst}")
            ok += 1
            continue
        shutil.copy2(sp, dp)
        print(f"COPIED {src} -> {dst}")
        ok += 1
    print(f"legacy scenes: {ok}/{len(ALIASES)}")
    return 0 if ok == len(ALIASES) else 1


if __name__ == "__main__":
    raise SystemExit(main())
