#!/usr/bin/env python3
"""Generate placeholder faces for I Ching hexagrams 31–64.

The real 31–64 faces are pending AI generation (see ART_PROMPTS_ICHING_REMAIN.md).
Until then, ship a legible placeholder so the deck is complete and the runtime
can resolve every one of the 64 faces: same 512×768 manuscript card layout as
the real faces (hexagram lines, Chinese name, English subtitle) plus an obvious
PLACEHOLDER marker so the swap-in is mechanical.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from gen_iching_prompts import HEXAGRAMS, KW_TABLE, TRIGRAMS, hex_symbol, trigrams_for  # noqa: E402

OUT = HERE.parents[0] / "assets" / "decks" / "iching"
W, H = 512, 768

PARCHMENT = (240, 228, 208, 255)
TEAL = (85, 128, 109, 255)
GOLD = (189, 164, 118, 255)
INK = (13, 20, 17, 255)
RUBRIC = (179, 64, 46, 255)

FONT_ZH = "/System/Library/Fonts/Supplemental/Songti.ttc"
FONT_EN = "/System/Library/Fonts/STHeiti Light.ttc"


def rounded_rect(d: ImageDraw.ImageDraw, box, r, fill, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def make_card(n: int, zh: str, en: str) -> Image.Image:
    li, ui = trigrams_for(n)
    _l_id, _l_zh, l_en, _l_sym, l_lines = TRIGRAMS[li]
    _u_id, _u_zh, u_en, _u_sym, u_lines = TRIGRAMS[ui]
    lines = l_lines + u_lines  # bottom-to-top, index 0 = lowest line

    img = Image.new("RGBA", (W, H), PARCHMENT)
    d = ImageDraw.Draw(img)

    # ---- manuscript frame: teal outer, gold inner, corner studs ----
    d.rectangle([8, 8, W - 9, H - 9], outline=TEAL, width=4)
    d.rectangle([20, 20, W - 21, H - 21], outline=GOLD, width=2)
    for cx, cy in [(24, 24), (W - 25, 24), (24, H - 25), (W - 25, H - 25)]:
        rounded_rect(d, [cx - 6, cy - 6, cx + 6, cy + 6], 3, GOLD)

    # ---- top band: hexagram index + PLACEHOLDER marker ----
    f_small = ImageFont.truetype(FONT_EN, 22)
    d.text((W / 2, 44), "第 %02d 卦 · PLACEHOLDER 占位" % n, font=f_small,
           fill=INK, anchor="mm")

    # ---- hexagram lines (upper third), lowest line drawn first at the bottom ----
    top = 120
    bottom = 240
    gap = (bottom - top) / 5.0
    lw = 150
    for i, yang in enumerate(lines):
        cy = bottom - i * gap
        if yang:
            d.line([W / 2 - lw, cy, W / 2 + lw, cy], fill=INK, width=14)
        else:
            seg = lw - 8
            d.line([W / 2 - lw, cy, W / 2 - 8, cy], fill=INK, width=14)
            d.line([W / 2 + 8, cy, W / 2 + lw, cy], fill=INK, width=14)

    # trigram names, small, flanking the lines
    f_trig = ImageFont.truetype(FONT_EN, 20)
    d.text((26, 180), l_en, font=f_trig, fill=TEAL, anchor="mm")
    d.text((W - 26, 180), u_en, font=f_trig, fill=TEAL, anchor="mm")

    # ---- centre: Chinese name + unicode hexagram symbol ----
    f_zh = ImageFont.truetype(FONT_ZH, 110)
    zh_w = d.textlength(zh, font=f_zh)
    d.text((W / 2 - zh_w / 2, 300), zh, font=f_zh, fill=RUBRIC)
    f_sym = ImageFont.truetype(FONT_ZH, 90)
    d.text((W / 2, 432), hex_symbol(n), font=f_sym, fill=GOLD, anchor="mm")

    # ---- bottom band: English name + placeholder note ----
    f_en = ImageFont.truetype(FONT_EN, 34)
    d.text((W / 2, 560), en, font=f_en, fill=INK, anchor="mm")
    d.line([W / 2 - 120, 600, W / 2 + 120, 600], fill=GOLD, width=2)
    f_note = ImageFont.truetype(FONT_EN, 20)
    d.text((W / 2, 636), "临时占位牌面 · 待正式出图替换", font=f_note,
           fill=(140, 90, 60, 255), anchor="mm")

    # ---- PLACEHOLDER stamp diagonal in the scene area ----
    stamp = Image.new("RGBA", (300, 90), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stamp)
    f_stamp = ImageFont.truetype(FONT_EN, 30)
    sd.text((150, 45), "PLACEHOLDER", font=f_stamp, fill=(150, 110, 80, 160),
            anchor="mm")
    stamp = stamp.rotate(-18, expand=True)
    img.alpha_composite(stamp, (int(W / 2 - stamp.width / 2), 340))

    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    for n, zh, en, _scene in HEXAGRAMS:
        if n < 31:
            continue
        fn = OUT / ("iching-%02d-%s-full.webp" % (
            n, __import__("re").sub(r"[^a-z0-9]+", "-", en.lower()).strip("-")[:40]))
        if fn.exists():
            print("skip existing", fn.name)
            continue
        make_card(n, zh, en).convert("RGB").save(fn, "WEBP", quality=88)
        print("wrote", fn.name)
        made += 1
    print("done: %d placeholder faces (31–64)" % made)


if __name__ == "__main__":
    main()
