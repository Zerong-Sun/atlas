#!/usr/bin/env python3
"""Audit every art asset: does it exist, is it used, is it damaged?

Four states, because "we have the file" answers none of the questions that
matter:

  GENERATED   the file exists and decodes
  USED        something in game/ core/ or content/ actually references it
  CHECKER     the editor's transparency checkerboard was baked in as pixels
              (see tools/art/strip_checker.py — a defect of the generation
              pipeline, invisible to a min/max alpha check)
  BROKEN      will not decode, is empty, or is entirely transparent

Writes a Markdown table for docs/ART_REQUIREMENTS.md.

    python3 tools/art/audit.py            # summary
    python3 tools/art/audit.py --md       # Markdown table
    python3 tools/art/audit.py --unused   # list assets nothing references
"""
import argparse
import glob
import json
import os
import re
import sys
from collections import defaultdict

try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.exit("needs pillow + numpy")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from strip_checker import background_mask  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# Below this share of visible pixels, a background hit is antialiasing on the
# sprite's outer edge, not a baked checkerboard.
CHECKER_THRESHOLD = 0.03


def scan_references() -> set:
    """Every asset name mentioned anywhere the game reads."""
    refs = set()
    pattern = re.compile(r"[\w-]+(?=\.webp)|(?<=[\"'/])[a-z][a-z0-9-]{3,}(?=[\"'])")
    for sub in ("game", "core", "content", "tools"):
        base = os.path.join(ROOT, sub)
        for dirpath, _, files in os.walk(base):
            for fn in files:
                if not fn.endswith((".gd", ".json", ".tscn", ".gdshader", ".mjs", ".py")):
                    continue
                try:
                    text = open(os.path.join(dirpath, fn), encoding="utf-8").read()
                except Exception:
                    continue
                refs.update(pattern.findall(text))
    return refs


def classify(path: str):
    try:
        im = Image.open(path).convert("RGBA")
    except Exception as e:
        return "BROKEN", f"will not decode: {e}", 0.0
    a = np.array(im)
    visible = int((a[..., 3] > 16).sum())
    if visible == 0:
        return "BROKEN", "fully transparent", 0.0
    if im.size[0] < 4 or im.size[1] < 4:
        return "BROKEN", f"degenerate size {im.size}", 0.0
    bg = background_mask(a)
    checker = int((bg & (a[..., 3] > 16)).sum())
    share = checker / max(visible, 1)
    if share >= CHECKER_THRESHOLD:
        return "CHECKER", f"{share * 100:.0f}% of visible pixels are backdrop", share
    return "OK", "", share


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--md", action="store_true")
    ap.add_argument("--unused", action="store_true")
    args = ap.parse_args()

    refs = scan_references()
    files = sorted(glob.glob(os.path.join(ROOT, "assets/art/*.webp")))

    rows = []
    counts = defaultdict(int)
    for f in files:
        name = os.path.basename(f)[:-5]
        state, note, share = classify(f)
        used = name in refs
        counts[state] += 1
        counts["USED" if used else "UNUSED"] += 1
        rows.append((name, state, used, note, share))

    if args.unused:
        for name, _, used, _, _ in rows:
            if not used:
                print(name)
        return

    if args.md:
        print("| 素材 | 状态 | 已接线 | 说明 |")
        print("|---|---|---|---|")
        for name, state, used, note, _ in rows:
            if state == "OK" and used:
                continue  # only surface what needs attention
            icon = {"OK": "✅", "CHECKER": "⚠️ 棋盘格", "BROKEN": "❌ 损坏"}[state]
            print(f"| `{name}` | {icon} | {'✅' if used else '—'} | {note} |")
        return

    total = len(files)
    print(f"素材总数 {total}")
    print(f"  ✅ 完好      {counts['OK']}")
    print(f"  ⚠️  棋盘格缺陷 {counts['CHECKER']}")
    print(f"  ❌ 损坏      {counts['BROKEN']}")
    print(f"  已接线      {counts['USED']}   未接线 {counts['UNUSED']}")
    if counts["CHECKER"]:
        print("\n  修复：python3 tools/art/strip_checker.py --write --glob 'assets/art/*.webp'")


if __name__ == "__main__":
    main()
