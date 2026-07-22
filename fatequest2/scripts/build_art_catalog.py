#!/usr/bin/env python3
"""Build ART_CATALOG.json and embed EXIF descriptions into existing art files."""

from __future__ import annotations

import argparse
from batch_art_utils import ART_DIR, collect_catalog, embed_catalog_descriptions, write_catalog


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--embed", action="store_true", help="Write EXIF ImageDescription into .webp files")
    args = ap.parse_args()

    catalog = collect_catalog(ART_DIR)
    path = write_catalog(catalog)
    print(f"Wrote {path} ({catalog['count']} assets)")

    if args.embed:
        n = embed_catalog_descriptions(catalog, ART_DIR)
        print(f"Embedded descriptions in {n} file(s).")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
