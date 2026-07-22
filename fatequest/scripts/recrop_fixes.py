#!/usr/bin/env python3
"""One-off re-crops for mis-cut art assets (Jul 2026)."""

from __future__ import annotations

from pathlib import Path

from batch_art_utils import (
    ART_DIR,
    SHEETS_DIR,
    BatchFile,
    BatchJob,
    collect_catalog,
    embed_catalog_descriptions,
    parse_batch_prompts_md,
    save_cell_webp,
    split_contact_sheet,
    write_catalog,
)
from PIL import Image

OUT_W, OUT_H = 900, 1300


def split_1x2(
    im: Image.Image,
    out_w: int = OUT_W,
    out_h: int = OUT_H,
    gutter: int = 4,
) -> tuple[Image.Image, Image.Image]:
    w, h = im.size
    mid = w // 2
    left = im.crop((gutter, gutter, mid - gutter, h - gutter))
    right = im.crop((mid + gutter, gutter, w - gutter, h - gutter))
    resample = Image.Resampling.LANCZOS
    return left.resize((out_w, out_h), resample), right.resize((out_w, out_h), resample)


def crop_3x3_cell(im: Image.Image, col: int, row: int) -> Image.Image:
    w, h = im.size
    cw, ch = w // 3, h // 3
    gx = gy = 3
    cell = im.crop((col * cw + gx, row * ch + gy, (col + 1) * cw - gx, (row + 1) * ch - gy))
    return cell.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)


def content_bbox(im: Image.Image, thresh: int = 35) -> tuple[int, int, int, int]:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 8 and r + g + b > thresh:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return 0, 0, w, h
    pad = 8
    return (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad),
        min(h, max_y + pad),
    )


def crop_strip_tile(im: Image.Image, index: int, count: int, size: int = 256) -> Image.Image:
    w, h = im.size
    sw = w / count
    x0 = int(index * sw)
    x1 = int((index + 1) * sw)
    strip = im.crop((x0, 0, x1, h))
    # center square from strip
    sh = strip.height
    side = min(strip.width, sh)
    cx = strip.width // 2
    cy = sh // 2
    half = side // 2
    sq = strip.crop((max(0, cx - half), max(0, cy - half), cx + half, cy + half))
    return sq.resize((size, size), Image.Resampling.LANCZOS)


def crop_to_square(im: Image.Image, size: int) -> Image.Image:
    x0, y0, x1, y1 = content_bbox(im)
    cell = im.crop((x0, y0, x1, y1))
    side = max(cell.width, cell.height)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(cell, ((side - cell.width) // 2, (side - cell.height) // 2), cell)
    return sq.resize((size, size), Image.Resampling.LANCZOS)


def crop_trump_2x6(im: Image.Image, col: int, row: int, size: int = 512) -> Image.Image:
    w, h = im.size
    cols, rows = 6, 2
    cw, ch = w // cols, h // rows
    gx = gy = 4
    cell = im.crop(
        (col * cw + gx, row * ch + gy, (col + 1) * cw - gx, (row + 1) * ch - gy)
    )
    return crop_to_square(cell, size)


def save_npc(cell: Image.Image, filename: str, desc: str = "") -> None:
    path = ART_DIR / filename
    save_cell_webp(cell, path, True, desc, 90)
    print(f"  saved {filename} {cell.size}")


def recrop_f2_npcs() -> None:
    print("F2 NPCs (1×2 chat harvest + 3×3 fallback)")
    gate = Image.open(SHEETS_DIR / "f2-gatekeepers-3x3-source.webp")

    # Chat 1×2 pairs (priority)
    pairs = [
        ("f2-chat-harvest-0.webp", "npc-market-isl.webp", "npc-market-con.webp"),
        ("f2-chat-harvest-2.webp", "npc-tea-chr.webp", "npc-tea-isl.webp"),
        ("f2-chat-harvest-3.webp", "npc-tea-mazu.webp", "npc-tea-con.webp"),
    ]
    for sheet_name, left_fn, right_fn in pairs:
        path = SHEETS_DIR / sheet_name
        if not path.exists():
            print(f"  skip missing {sheet_name}")
            continue
        im = Image.open(path)
        left, right = split_1x2(im)
        save_npc(left, left_fn)
        save_npc(right, right_fn)

    # harvest-1: right half = market-mazu (harbor broker); left skipped (duplicate con)
    h1 = SHEETS_DIR / "f2-chat-harvest-1.webp"
    if h1.exists():
        _, mazu = split_1x2(Image.open(h1))
        save_npc(mazu, "npc-market-mazu.webp")

    # 3×3 fallback for remaining batch-1 gatekeepers (1×2 preferred where harvested)
    three_x3 = [
        (0, 0, "npc-market-chr.webp"),
        (1, 0, "npc-temple-chr.webp"),
        (1, 1, "npc-temple-isl.webp"),
        (1, 2, "npc-temple-con.webp"),
        (2, 2, "npc-temple-mazu.webp"),
    ]
    for col, row, fn in three_x3:
        save_npc(crop_3x3_cell(gate, col, row), fn)


def recrop_trump() -> None:
    print("Trump 10–19 (2×6 sheet)")
    im = Image.open(SHEETS_DIR / "art_prompts_map--10-trump-major-arcana-emoji-b-10-21.webp")
    mapping = [
        ("ic-trump-10-wheel.webp", 0, 0),
        ("ic-trump-11-justice.webp", 1, 0),
        ("ic-trump-12-hanged.webp", 2, 0),
        ("ic-trump-13-death.webp", 3, 0),
        ("ic-trump-14-temperance.webp", 4, 0),
        ("ic-trump-15-devil.webp", 0, 1),
        ("ic-trump-16-tower.webp", 2, 1),
        ("ic-trump-17-star.webp", 3, 1),
        ("ic-trump-18-moon.webp", 4, 1),
        ("ic-trump-19-sun.webp", 5, 1),
    ]
    for fn, col, row in mapping:
        cell = crop_trump_2x6(im, col, row)
        path = ART_DIR / fn
        save_cell_webp(cell, path, True, "", 90)
        print(f"  saved {fn}")


def recrop_map_tiles() -> None:
    print("Map sea + orn-chr (5 horizontal strips)")
    im = Image.open(SHEETS_DIR / "art_prompts_map--2-a2-map-tiles-sea-civilization-ornaments.webp")
    for idx, fn in [(0, "map-sea.webp"), (1, "map-orn-chr.webp")]:
        cell = crop_strip_tile(im, idx, 5, 256)
        path = ART_DIR / fn
        save_cell_webp(cell, path, True, "", 90)
        print(f"  saved {fn}")


def recrop_ui_ornaments() -> None:
    print("UI ornaments star + cloud (content bbox on irregular sheet)")
    im = Image.open(SHEETS_DIR / "art_prompts_ui--3-ornaments-frame-pieces.webp")
    w, h = im.size
    # bottom band holds star/cloud/dividers (y ≈ 55%–100%)
    band = im.crop((0, int(h * 0.72), w, h))
    bw = band.width
    # six items in bottom row, left→right
    slots = [
        ("ui-orn-rule-h.webp", 0),
        ("ui-orn-star.webp", 1),
        ("ui-orn-rule-v.webp", 2),
        ("ui-orn-diamond.webp", 3),
        ("ui-orn-cloud.webp", 4),
        ("ui-orn-seal.webp", 5),
    ]
    count = 6
    for fn, idx in slots:
        if fn not in ("ui-orn-star.webp", "ui-orn-cloud.webp"):
            continue
        sw = bw / count
        x0, x1 = int(idx * sw), int((idx + 1) * sw)
        piece = band.crop((x0, 0, x1, band.height))
        x0b, y0b, x1b, y1b = content_bbox(piece)
        cell = crop_to_square(piece.crop((x0b, y0b, x1b, y1b)), 256)
        path = ART_DIR / fn
        save_cell_webp(cell, path, True, "", 90)
        print(f"  saved {fn}")


def recrop_ui_buttons() -> None:
    """Re-crop cinnabar + tab-idle from 5×2 button contact sheet."""
    sheet = SHEETS_DIR / "art_prompts_ui--1-button-skins.webp"
    if not sheet.exists():
        print("  skip ui buttons: art_prompts_ui--1-button-skins.webp not in _sheets (needs regen)")
        return

    print(f"UI buttons from {sheet.name}")
    jobs = parse_batch_prompts_md(
        (ART_DIR / "ART_PROMPTS_UI.md").read_text(encoding="utf-8"),
        "ART_PROMPTS_UI.md",
    )
    batch1 = jobs[0]
    job = BatchJob(
        name=batch1.name,
        files=batch1.files,
        prompt="",
        cols=5,
        rows=2,
        cell_w=512,
        cell_h=128,
        transparent=False,
    )
    cells = split_contact_sheet(sheet.read_bytes(), job)
    targets = {"ui-btn-cinnabar.webp", "ui-btn-tab-idle.webp"}
    for bf, cell in zip(batch1.files, cells):
        if bf.filename not in targets:
            continue
        out = cell.resize((bf.out_w, bf.out_h), Image.Resampling.LANCZOS)
        save_cell_webp(out, ART_DIR / bf.filename, False, bf.description, 90)
        print(f"  saved {bf.filename}")


def recrop_extra_microbe() -> None:
    """Batch 15 was saved with wrong NPC image; try 3×1 top row if icons present."""
    sheet = SHEETS_DIR / "art_prompts_emoji--15-extra-unmapped-leftovers-2.webp"
    if not sheet.exists():
        print("  skip extra microbe/spool: no sheet")
        return
    im = Image.open(sheet)
    w, h = im.size
    # real batch-15 sheet is 3×1 @ 512; wrong sheet is 1536×1024 NPC pair
    if w == 1536 and h == 1024:
        print("  skip extra microbe/spool: batch-15 sheet is NPC image (needs regen)")
        return
    job = BatchJob(
        name="extra-15",
        files=[
            BatchFile("ic-extra-microbe.webp", "", 512, 512),
            BatchFile("ic-extra-spool-of-thread.webp", "", 512, 512),
        ],
        prompt="",
        cols=3,
        rows=1,
        cell_w=512,
        cell_h=512,
        transparent=True,
    )
    cells = split_contact_sheet(im, job)
    for bf, cell in zip(job.files, cells[1:3]):
        save_cell_webp(cell, ART_DIR / bf.filename, True, "", 90)
        print(f"  saved {bf.filename}")


def delete_targets() -> None:
    targets = [
        "ic-extra-microbe.webp",
        "ic-extra-spool-of-thread.webp",
        "ic-trump-10-wheel.webp",
        "ic-trump-11-justice.webp",
        "ic-trump-12-hanged.webp",
        "ic-trump-13-death.webp",
        "ic-trump-14-temperance.webp",
        "ic-trump-15-devil.webp",
        "ic-trump-16-tower.webp",
        "ic-trump-17-star.webp",
        "ic-trump-18-moon.webp",
        "ic-trump-19-sun.webp",
        "map-orn-chr.webp",
        "map-sea.webp",
        "npc-market-mazu.webp",
        "npc-temple-chr.webp",
        "ui-btn-cinnabar.webp",
        "ui-btn-tab-idle.webp",
        "ui-orn-cloud.webp",
        "ui-orn-star.webp",
    ]
    for fn in targets:
        p = ART_DIR / fn
        if p.exists():
            p.unlink()
            print(f"  deleted {fn}")


def main() -> None:
    print("Deleting bad crops…")
    delete_targets()
    recrop_f2_npcs()
    recrop_trump()
    recrop_map_tiles()
    recrop_ui_ornaments()
    recrop_ui_buttons()
    recrop_extra_microbe()
    catalog = collect_catalog(ART_DIR)
    write_catalog(catalog)
    n = embed_catalog_descriptions(catalog, ART_DIR)
    print(f"Done. ART_CATALOG.json updated; EXIF in {n} files.")


if __name__ == "__main__":
    main()
