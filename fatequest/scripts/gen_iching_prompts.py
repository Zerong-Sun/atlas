#!/usr/bin/env python3
"""Generate ART_PROMPTS_ICHING_DECK.md — 64 hexagram full faces, 7×10 batches."""

from __future__ import annotations

import re
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "art" / "ART_PROMPTS_ICHING_DECK.md"

TRIGRAMS = [
    ("qian", "乾", "Heaven", "☰", [1, 1, 1]),
    ("dui", "兑", "Lake", "☱", [1, 1, 0]),
    ("li", "离", "Fire", "☲", [1, 0, 1]),
    ("zhen", "震", "Thunder", "☳", [1, 0, 0]),
    ("xun", "巽", "Wind", "☴", [0, 1, 1]),
    ("kan", "坎", "Water", "☵", [0, 1, 0]),
    ("gen", "艮", "Mountain", "☶", [0, 0, 1]),
    ("kun", "坤", "Earth", "☷", [0, 0, 0]),
]

KW_TABLE = [
    [1, 43, 14, 34, 9, 5, 26, 11],
    [10, 58, 38, 54, 61, 60, 41, 19],
    [13, 49, 30, 55, 37, 63, 22, 36],
    [25, 17, 21, 51, 42, 3, 27, 24],
    [44, 28, 50, 32, 57, 48, 18, 46],
    [6, 47, 64, 40, 59, 29, 4, 7],
    [33, 31, 56, 62, 53, 39, 52, 15],
    [12, 45, 35, 16, 20, 8, 23, 2],
]

HEXAGRAMS = [
    (1, "乾", "The Creative", "Pure creative force; celestial gate of six yang lines, dragon coil silhouette in cloud"),
    (2, "坤", "The Receptive", "Receptive earth; broad plain vessel holding offering, soft hills"),
    (3, "屯", "Difficulty at the Beginning", "Sprouting through stones; tender shoot amid rocky soil"),
    (4, "蒙", "Youthful Folly", "Spring at mountain foot; teacher and pupil silhouettes in mist"),
    (5, "需", "Waiting", "Clouds heaping in sky above; banquet set but untouched, patience"),
    (6, "讼", "Conflict", "Heaven and water diverging; two figures back to back, tension lines"),
    (7, "师", "The Army", "Discipline in camp; rows of spears, water stored in earth trenches"),
    (8, "比", "Holding Together", "Water spread on earth; clasped hands over flowing stream"),
    (9, "小畜", "Small Taming", "Dense clouds without rain; wind taming scattered clouds"),
    (10, "履", "Treading", "Figure treading tiger tail; cautious step on narrow path"),
    (11, "泰", "Peace", "Heaven and earth communing; small figures passing freely between"),
    (12, "否", "Standstill", "Heaven and earth not meeting; closed gate between sky and plain"),
    (13, "同人", "Fellowship", "Fire under heaven; circle of figures around shared flame"),
    (14, "大有", "Great Possession", "Fire in heaven; great sun-wheel over treasure vessels"),
    (15, "谦", "Modesty", "Mountain hidden inside earth; peak lower than plain, humble posture"),
    (16, "豫", "Enthusiasm", "Thunder erupting from earth; dancers silhouettes, drums"),
    (17, "随", "Following", "Lake with thunder below; figure following winding path downhill"),
    (18, "蛊", "Work on the Decayed", "Wind under mountain; clearing rotten vines, mending roots"),
    (19, "临", "Approach", "Earth above lake; benevolent figure approaching gathered people"),
    (20, "观", "Contemplation", "Wind over earth; watchtower silhouette, banner fluttering"),
    (21, "噬嗑", "Biting Through", "Thunder and fire joined; jaws or bolt closing on obstacle"),
    (22, "贲", "Grace", "Fire at mountain foot; ornamental patterns framing simple stone"),
    (23, "剥", "Splitting Apart", "Mountain on earth eroding; tiles falling from wall base"),
    (24, "复", "Return", "Thunder within earth; single bright sprout in dark soil, spring return"),
    (25, "无妄", "Innocence", "Heaven with thunder; figure walking straight path under sky"),
    (26, "大畜", "Great Taming", "Heaven inside mountain; great stored strength, penned ox silhouette"),
    (27, "颐", "Nourishment", "Thunder on mountain; mouth/jaw motif nurturing, bowl and speech scroll"),
    (28, "大过", "Great Excess", "Lake over wind; sagging roof beam, extraordinary weight"),
    (29, "坎", "The Abysmal", "Water doubled abyss; spiral gorge, sincere traveler with rope"),
    (30, "离", "The Clinging", "Fire clinging twice; twin flames, bright clarity not realistic eye"),
    (31, "咸", "Influence", "Lake on mountain; two hearts/mountains touching, mutual pull"),
    (32, "恒", "Duration", "Thunder with wind; paired birds nesting, enduring loop motif"),
    (33, "遁", "Retreat", "Heaven over mountain; figure withdrawing up mountain path"),
    (34, "大壮", "Great Power", "Thunder in heaven; great horned power held by discipline rope"),
    (35, "晋", "Progress", "Fire rising from earth; sun half-disk climbing horizon"),
    (36, "明夷", "Darkening of the Light", "Earth over fire; wounded sun buried, hidden lamp within"),
    (37, "家人", "The Family", "Wind from fire; hearth with family silhouettes around flame"),
    (38, "睽", "Opposition", "Fire above lake; two oxen pulling apart, estranged paths"),
    (39, "蹇", "Obstruction", "Water on mountain; blocked pass, traveler turning back"),
    (40, "解", "Deliverance", "Thunder and rain; knots loosening, buds bursting open"),
    (41, "损", "Decrease", "Lake below mountain; lower cup poured upward, sacrifice motif"),
    (42, "益", "Increase", "Wind and thunder aiding; wind blowing blessings downward to fields"),
    (43, "夬", "Breakthrough", "Lake above heaven; banner declared, decisive cut through cloud"),
    (44, "姤", "Coming to Meet", "Heaven with wind; unexpected meeting under spreading tree"),
    (45, "萃", "Gathering", "Lake over earth; vessels gathered around central cauldron"),
    (46, "升", "Pushing Upward", "Earth with wind/wood; tree growing upward through soil layers"),
    (47, "困", "Oppression", "Lake without water; empty basin, exhausted figure seated"),
    (48, "井", "The Well", "Water over wind; stone well with bucket rope, shared source"),
    (49, "革", "Revolution", "Lake and fire; animal shedding skin outline, molting not gore"),
    (50, "鼎", "The Cauldron", "Fire over wind; bronze tripod cauldron on ritual fire"),
    (51, "震", "The Arousing", "Thunder repeated; shock waves rippling, then stillness"),
    (52, "艮", "Keeping Still", "Mountain doubled; monumental still peak, meditating figure"),
    (53, "渐", "Gradual Progress", "Wind on mountain; wild geese ascending in stages"),
    (54, "归妹", "The Marrying Maiden", "Thunder over lake; bridal procession, careful steps"),
    (55, "丰", "Abundance", "Thunder and fire; full noon sun with lightning halo, peak moment"),
    (56, "旅", "The Wanderer", "Fire on mountain; small campfire, traveler bundle and staff"),
    (57, "巽", "The Gentle", "Wind doubled; gentle penetrating breeze through reeds"),
    (58, "兑", "The Joyous", "Lake joined; two lakes reflecting, friends in conversation silhouettes"),
    (59, "涣", "Dispersion", "Wind over water; ice breaking, hearts regathering as droplets"),
    (60, "节", "Limitation", "Water over lake; bamboo joints as measure, balanced dam"),
    (61, "中孚", "Inner Truth", "Wind over lake; hollow vessel holding sincerity, fish and pig offerings"),
    (62, "小过", "Small Excess", "Thunder on mountain; small bird flying low, modest excess"),
    (63, "既济", "After Completion", "Water over fire; kettle boiling balanced, almost finished crossing"),
    (64, "未济", "Before Completion", "Fire over water; fox mid-river on ice, cautious last step"),
]

STYLE = (
    "**Style lock (every batch):** Cloud-ridge Twilight I Ching manuscript cards. Identical "
    "cloud-thunder border in verdigris teal `#55806D` and antique gold `#BDA476`, parchment cream "
    "field `#F0E4D0`, forest-ink edge `#0D1411`. Each card MUST show three layers: (1) HEXAGRAM "
    "FIGURE — six stacked horizontal lines (solid yang / broken yin) in upper third; (2) SCENE — "
    "flat emblematic illustration in center; (3) NAMEPLATE — bottom band with the Chinese hexagram "
    "name character(s) in rubric red `#B3402E` plus small English subtitle in gold. Flat mineral paint, "
    "thick contours, readable at small size."
)

SEPARATE_PROMPT_TAIL = (
    "Generate exactly {n} SEPARATE I Ching divination card face images in this single response "
    "(NOT a contact sheet, NOT a grid — {n} individual images). Each vertical 2:3, opaque, 512×768. "
    "CRITICAL: identical manuscript frame on every image; each card shows hexagram lines + scene + "
    "Chinese name on nameplate with English subtitle. Render requested Chinese name characters legibly "
    "on the nameplate. Output images in numbered order 1→{n}. Cloud-ridge Twilight, paper grain, "
    "candlelit gold — never neon. No photorealism, no 3D, no anime."
)


def trigrams_for(n: int) -> tuple[int, int]:
    for li in range(8):
        for ui in range(8):
            if KW_TABLE[li][ui] == n:
                return li, ui
    raise ValueError(n)


def line_description(lines: list[int]) -> str:
    parts = []
    for i, v in enumerate(reversed(lines), 1):
        parts.append(f"line{i}={'solid yang' if v else 'broken yin'}")
    return ", ".join(parts) + " (top to bottom)"


def hex_symbol(n: int) -> str:
    return chr(0x4DC0 + n - 1)


def zh_unicode_refs(zh: str) -> str:
    return " ".join(f"U+{ord(c):04X}" for c in zh)


def card_description(n: int, zh: str, en: str, scene: str) -> str:
    li, ui = trigrams_for(n)
    _id, tzh, ten, tsym, tlines = TRIGRAMS[li]
    _id2, tzh2, ten2, tsym2, tlines2 = TRIGRAMS[ui]
    lines = tlines + tlines2
    sym = hex_symbol(n)
    refs = zh_unicode_refs(zh)
    return (
        f"King Wen #{n:02d} {en} — NAMEPLATE: render Chinese hexagram name ({refs}) plus English \"{en}\" in gold. "
        f"HEXAGRAM FIGURE: six-line stack ({line_description(lines)}); lower trigram {ten} {tsym}, "
        f"upper trigram {ten2} {tsym2}; may echo unicode {sym} as thin reference only. "
        f"SCENE: {scene}."
    )


def slug_en(en: str) -> str:
    s = en.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:40]


def chunks(items, size=10):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def main() -> None:
    cards: list[tuple[str, str]] = []
    for n, zh, en, scene in HEXAGRAMS:
        fn = f"iching-{n:02d}-{slug_en(en)}-full.webp"
        desc = card_description(n, zh, en, scene)
        cards.append((fn, desc))

    batches = list(chunks(cards, 10))
    lines = [
        "# FateQuest 2.0 · I Ching 64 Hexagrams · Full Card Faces · Separate Image Batches",
        "",
        "64 hexagrams (King Wen order) → **7 batches** · **Mode: separate** (one request → N images → download each).",
        "Each card includes **name (卦名) + hexagram lines (卦象) + scene (图像)** on the face.",
        "English prompts only (Chinese rendered on-card as specified). Output: `assets/decks/iching/*.webp` at 512×768.",
        "",
        STYLE,
        "",
        "---",
        "",
    ]

    for i, batch in enumerate(batches, 1):
        start = (i - 1) * 10 + 1
        end = start + len(batch) - 1
        lines.append(f"## Batch {i} · Hexagrams {start:02d}–{end:02d}")
        lines.append("")
        lines.append(f"- **Mode**: separate · **Count**: {len(batch)} · **Output per file**: 512×768 · **Background**: opaque")
        lines.append("- **Output dir**: decks/iching")
        lines.append("- **Files**:")
        for j, (fn, desc) in enumerate(batch, 1):
            lines.append(f"  {j}. `{fn}` — {desc}")
        lines.append("")
        lines.append("**Prompt**")
        lines.append("")
        lines.append(SEPARATE_PROMPT_TAIL.format(n=len(batch)))
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.extend([
        "*64 hexagrams · 7 batches · run:*",
        "",
        "```bash",
        "cd fatequest/scripts",
        ".venv/bin/python gen_iching_prompts.py",
        ".venv/bin/python chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_ICHING_DECK.md --skip-existing --timeout-ms 600000",
        "```",
        "",
    ])
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(cards)} cards, {len(batches)} batches)")


if __name__ == "__main__":
    main()
