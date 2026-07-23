#!/usr/bin/env python3
"""Remove the baked-in transparency checkerboard from map art.

Some generated assets were exported with the editor's transparency checkerboard
written into the image as real pixels, so every sprite draws a grey chequered
box around itself. The alpha channel is otherwise correct, which is why the
defect survived a naive min/max alpha check.

Method: flood-fill inward from the border across pixels that are LIGHT and
NEARLY GREY, and zero their alpha. The drawing's ink outline stops the fill, so
the artwork is untouched; genuine light areas inside the drawing (snow, walls)
are enclosed and never reached.

    python3 tools/art/strip_checker.py --check      # report only
    python3 tools/art/strip_checker.py --write      # rewrite in place
"""
import argparse
import glob
import os
import sys
from collections import deque

try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.exit("needs pillow + numpy:  pip install pillow numpy")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# A checker pixel is light and almost colourless. Ink lines and painted areas
# fail one or both tests, so the fill cannot escape into the drawing.
LIGHT_MIN = 225          # per-channel minimum to count as "light"
GREY_TOLERANCE = 14      # max spread between R, G and B


def background_mask(rgba: np.ndarray) -> np.ndarray:
    h, w = rgba.shape[:2]
    rgb = rgba[..., :3].astype(np.int16)
    light = rgb.min(axis=2) >= LIGHT_MIN
    grey = (rgb.max(axis=2) - rgb.min(axis=2)) <= GREY_TOLERANCE
    transparent = rgba[..., 3] == 0
    candidate = (light & grey) | transparent

    seen = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if candidate[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if candidate[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and candidate[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def process(path: str, write: bool) -> tuple[int, int]:
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    before = int((a[..., 3] > 0).sum())
    bg = background_mask(a)
    # Only pixels that are currently visible AND in the background are checker.
    killed = int((bg & (a[..., 3] > 0)).sum())
    if killed and write:
        a[bg, 3] = 0
        Image.fromarray(a, "RGBA").save(path, "WEBP", lossless=True)
    return before, killed


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="rewrite files in place")
    ap.add_argument("--glob", default="assets/art/map-*.webp")
    args = ap.parse_args()

    files = sorted(glob.glob(os.path.join(ROOT, args.glob)))
    if not files:
        sys.exit(f"no files matched {args.glob}")

    total = 0
    for f in files:
        before, killed = process(f, args.write)
        if killed:
            pct = 100.0 * killed / max(before, 1)
            print(f"  {os.path.basename(f):26} {killed:7d} px  ({pct:5.1f}% of visible)")
            total += 1
    verb = "cleaned" if args.write else "would clean"
    print(f"{verb} {total}/{len(files)} files")


if __name__ == "__main__":
    main()
