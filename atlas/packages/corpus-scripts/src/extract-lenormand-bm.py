#!/usr/bin/env python3
"""
Extract 36 individual Lenormand card crops from British Museum composite photos.

BM object 1896,0501.308 is published on Wikimedia as two scattered-layout photos.
Template matching (against reference card faces) locates each card; iterative
suppression avoids duplicate assignments.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np

CARD_SLUGS = [
    "rider",
    "clover",
    "ship",
    "house",
    "tree",
    "cloud",
    "snake",
    "coffin",
    "bouquet",
    "scythe",
    "whip",
    "birds",
    "child",
    "fox",
    "bear",
    "stars",
    "stork",
    "dog",
    "tower",
    "garden",
    "mountain",
    "crossroads",
    "mice",
    "heart",
    "ring",
    "book",
    "letter",
    "man",
    "woman",
    "lily",
    "sun",
    "moon",
    "key",
    "fish",
    "anchor",
    "cross",
]

TEMPLATE_W = 155
TEMPLATE_H = 240
PAD_PX = 4
ROUND1_MIN_SCORE = 0.18
ROUND2_MIN_SCORE = 0.15


def load_references(ref_dir: Path) -> dict[int, np.ndarray]:
    refs: dict[int, np.ndarray] = {}
    for path in sorted(ref_dir.glob("*.jpg")):
        num = int(path.name[:2])
        gray = cv2.cvtColor(cv2.imread(str(path)), cv2.COLOR_BGR2GRAY)
        refs[num] = cv2.resize(gray, (TEMPLATE_W, TEMPLATE_H))
    if len(refs) != 36:
        raise RuntimeError(f"Expected 36 reference cards in {ref_dir}, found {len(refs)}")
    return refs


def extract_with_suppression(
    gray: np.ndarray,
    template: np.ndarray,
    suppress_boxes: list[tuple[int, int, int, int]],
) -> tuple[float, tuple[int, int, int, int]]:
    result = cv2.matchTemplate(gray, template, cv2.TM_CCOEFF_NORMED).copy()
    for x1, y1, x2, y2 in suppress_boxes:
        result[
            max(0, y1 - TEMPLATE_H // 2) : min(result.shape[0], y2 + TEMPLATE_H // 2),
            max(0, x1 - TEMPLATE_W // 2) : min(result.shape[1], x2 + TEMPLATE_W // 2),
        ] = -1
    _, max_val, _, max_loc = cv2.minMaxLoc(result)
    x, y = max_loc
    return max_val, (x, y, x + TEMPLATE_W, y + TEMPLATE_H)


def match_all_cards(
    source_paths: list[Path],
    refs: dict[int, np.ndarray],
) -> dict[int, tuple[float, str, tuple[int, int, int, int]]]:
    images = {str(path): cv2.imread(str(path)) for path in source_paths}
    for path, image in images.items():
        if image is None:
            raise RuntimeError(f"Failed to read image: {path}")

    final: dict[int, tuple[float, str, tuple[int, int, int, int]]] = {}
    boxes_by_source: dict[str, list[tuple[int, int, int, int]]] = {str(p): [] for p in source_paths}

    for source_path in source_paths:
        source_key = str(source_path)
        gray = cv2.cvtColor(images[source_key], cv2.COLOR_BGR2GRAY)
        for num in range(1, 37):
            if num in final:
                continue
            score, box = extract_with_suppression(gray, refs[num], boxes_by_source[source_key])
            if score >= ROUND1_MIN_SCORE:
                final[num] = (score, source_key, box)
                boxes_by_source[source_key].append(box)

    for num in range(1, 37):
        if num in final:
            continue
        best: tuple[float, str | None, tuple[int, int, int, int] | None] = (-1, None, None)
        for source_path in source_paths:
            source_key = str(source_path)
            gray = cv2.cvtColor(images[source_key], cv2.COLOR_BGR2GRAY)
            score, box = extract_with_suppression(gray, refs[num], boxes_by_source[source_key])
            if score > best[0]:
                best = (score, source_key, box)
        if best[1] is not None and best[2] is not None and best[0] >= ROUND2_MIN_SCORE:
            final[num] = (best[0], best[1], best[2])
            boxes_by_source[best[1]].append(best[2])

    missing = [n for n in range(1, 37) if n not in final]
    if missing:
        raise RuntimeError(f"Could not locate cards: {missing}")

    return final


def write_crops(
    matches: dict[int, tuple[float, str, tuple[int, int, int, int]]],
    out_dir: Path,
) -> dict[str, object]:
    out_dir.mkdir(parents=True, exist_ok=True)
    metadata: dict[str, object] = {"cards": {}}

    for num in range(1, 37):
        score, source_key, (x1, y1, x2, y2) = matches[num]
        image = cv2.imread(source_key)
        if image is None:
            raise RuntimeError(f"Failed to read source image: {source_key}")

        height, width = image.shape[:2]
        x1 = max(0, x1 - PAD_PX)
        y1 = max(0, y1 - PAD_PX)
        x2 = min(width, x2 + PAD_PX)
        y2 = min(height, y2 + PAD_PX)
        crop = image[y1:y2, x1:x2]

        slug = CARD_SLUGS[num - 1]
        filename = f"{num:02d}-{slug}.jpg"
        cv2.imwrite(
            str(out_dir / filename),
            crop,
            [int(cv2.IMWRITE_JPEG_QUALITY), 92],
        )
        metadata["cards"][str(num)] = {
            "file": filename,
            "score": round(score, 3),
            "source": Path(source_key).name,
            "box": [x1, y1, x2, y2],
        }

    return metadata


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract BM Lenormand cards from composite photos")
    parser.add_argument("--sources", nargs="+", type=Path, required=True, help="BM composite JPEG paths")
    parser.add_argument("--refs", type=Path, required=True, help="Reference deck directory (36 JPGs)")
    parser.add_argument("--out", type=Path, required=True, help="Output directory for extracted cards")
    parser.add_argument("--meta", type=Path, help="Optional JSON metadata output path")
    args = parser.parse_args()

    refs = load_references(args.refs)
    matches = match_all_cards(args.sources, refs)
    metadata = write_crops(matches, args.out)

    if args.meta:
        args.meta.parent.mkdir(parents=True, exist_ok=True)
        args.meta.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")

    low_confidence = [int(n) for n, info in metadata["cards"].items() if info["score"] < 0.22]
    print(f"Extracted 36 cards to {args.out}")
    if low_confidence:
        print(f"Low-confidence matches (review): {low_confidence}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
