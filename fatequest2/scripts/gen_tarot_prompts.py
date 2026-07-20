#!/usr/bin/env python3
"""Generate ART_PROMPTS_TAROT_DECK.md — 78 RWS tarot full faces, 8×10 batches."""

from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "art" / "ART_PROMPTS_TAROT_DECK.md"

STYLE = (
    "**Style lock (every batch):** Cloud-ridge Twilight manuscript tarot. Identical ornate "
    "cloud-thunder gold border `#BDA476`, blank nameplate band at bottom, parchment cream field "
    "`#F0E4D0`, forest-ink outer edge `#0D1411` on EVERY image. Tarot mauve `#9A6B84` micro-accents. "
    "Flat mineral paint, thick contours, readable at small size. No readable titles, numerals, or watermarks."
)

SEPARATE_PROMPT_TAIL = (
    "Generate exactly {n} SEPARATE tarot card face images in this single response (NOT a contact sheet, "
    "NOT a grid — {n} individual images). Each image vertical 2:3 ratio, opaque, 512×768 logical. "
    "CRITICAL: every image shares the identical manuscript card frame and blank nameplate — only center "
    "illustration changes. Output images in numbered order 1→{n}. Cloud-ridge Twilight dusk glow, "
    "paper grain, candlelit gold — never neon. No photorealism, no 3D, no anime."
)

MAJOR = [
    ("tarot-fool-full.webp", "The Fool (0): bundle on staff, cliff-edge step, small dog silhouette"),
    ("tarot-magician-full.webp", "The Magician (I): ritual table with wand cup sword pentacle as flat icons, one hand raised one lowered, lemniscate above"),
    ("tarot-high-priestess-full.webp", "The High Priestess (II): seated between two pillars B and J, crescent moon at feet, half-hidden scroll, veiled silhouette no facial detail"),
    ("tarot-empress-full.webp", "The Empress (III): crown of wheat, venus shield on cushion throne, scepter, fertile garden silhouette"),
    ("tarot-emperor-full.webp", "The Emperor (IV): ram-head throne, orb and scepter, stark mountain silhouette backdrop"),
    ("tarot-hierophant-full.webp", "The Hierophant (V): triple crown, crossed keys at feet, two kneeling monk silhouettes"),
    ("tarot-lovers-full.webp", "The Lovers (VI): angel blessing above, two figures below, tree with serpent and flame tree"),
    ("tarot-chariot-full.webp", "The Chariot (VII): armored charioteer under star canopy, two sphinxes black and white"),
    ("tarot-strength-full.webp", "Strength (VIII): lion head, gentle hand on muzzle, infinity mark above"),
    ("tarot-hermit-full.webp", "The Hermit (IX): lantern whose wick is a six-pointed star, staff, no face"),
    ("tarot-wheel-full.webp", "Wheel of Fortune (X): wheel with TARO/ROTA letter ring, sword pointer, four corner creatures as tiny silhouettes"),
    ("tarot-justice-full.webp", "Justice (XI): upright sword and balanced scales, centered figure no detailed face"),
    ("tarot-hanged-man-full.webp", "The Hanged Man (XII): figure suspended by one foot, halo, serene inverted pose"),
    ("tarot-death-full.webp", "Death (XIII): white butterfly emerging from open cocoon or bone-door, no gore"),
    ("tarot-temperance-full.webp", "Temperance (XIV): angel pouring between two cups, one foot in water one on land, iris path"),
    ("tarot-devil-full.webp", "The Devil (XV): horned figure on block pedestal, two chained silhouettes below, chains visibly loose"),
    ("tarot-tower-full.webp", "The Tower (XVI): spire struck by lightning, crown falling, two figures leaping as silhouettes"),
    ("tarot-star-full.webp", "The Star (XVII): eight-pointed star pouring two streams into a pool, bird on branch silhouette"),
    ("tarot-moon-full.webp", "The Moon (XVIII): eclipse crescent, one wave line, one dew drop, dog and wolf silhouettes distant"),
    ("tarot-sun-full.webp", "The Sun (XIX): radiant gold sun-wheel, compass-face center, no realistic child faces"),
    ("tarot-judgement-full.webp", "Judgement (XX): angel with trumpet, rising figures as silhouettes from open coffins"),
    ("tarot-world-full.webp", "The World (XXI): laurel oval wreath, four corner evangelist creatures as silhouettes, central dancer figure"),
]

def minor(suit: str, accent: str) -> list[tuple[str, str]]:
    pre = f"tarot-{suit}-"
    a = accent
    pip = {
        "ace": f"Ace of {suit.title()}: {a}",
        "02": f"Two of {suit.title()}: paired motif, flat manuscript scene",
        "03": f"Three of {suit.title()}: three {a} arranged in triangle composition",
        "04": f"Four of {suit.title()}: four {a} stable square composition",
        "05": f"Five of {suit.title()}: five {a} tense crossed composition",
        "06": f"Six of {suit.title()}: six {a} harmonious flow composition",
        "07": f"Seven of {suit.title()}: seven {a} challenge or vision composition",
        "08": f"Eight of {suit.title()}: eight {a} dynamic diagonal motion",
        "09": f"Nine of {suit.title()}: nine {a} culmination near-weariness composition",
        "10": f"Ten of {suit.title()}: ten {a} burden or fulfillment composition",
        "page": f"Page of {suit.title()}: youthful figure with {a}, standing portrait",
        "knight": f"Knight of {suit.title()}: armored rider with {a}, charging or moving portrait",
        "queen": f"Queen of {suit.title()}: seated on throne holding {a}, regal silhouette",
        "king": f"King of {suit.title()}: seated ruler with {a}, commanding silhouette",
    }
    # suit-specific pip scenes
    scenes = {
        "wands": {
            "ace": "single wand sprouting leaves held in cloud hand silhouette",
            "02": "two crossed wands with dove above",
            "03": "three wands on ramparts overlooking distant ships",
            "04": "four wands forming flower canopy, figures dancing silhouette",
            "05": "five wands crossed in playful struggle",
            "06": "six wands victory parade with wreath rider silhouette",
            "07": "seven wands defended on high ground against odds",
            "08": "eight wands flying diagonal like arrows",
            "09": "nine wands bandaged sentinel behind fence",
            "10": "ten wands figure burdened carrying bundle",
            "page": "youth studying wand sprout in desert",
            "knight": "armored rider charging with raised wand",
            "queen": "throne with wand and sunflower lion cat silhouette",
            "king": "seated with wand and salamander on throne",
        },
        "cups": {
            "ace": "hand from cloud offering overflowing cup, dove descending",
            "02": "two figures exchanging cups, caduceus lion above",
            "03": "three cups raised in toast celebration",
            "04": "figure under tree contemplating cup, three cups on grass",
            "05": "five spilled cups, mourning hooded silhouette",
            "06": "six cups nostalgia with child silhouettes and flowers",
            "07": "seven cups visions floating in cloud shapes",
            "08": "eight cups stacked abandoned, figure walking away",
            "09": "nine cups on shelf, satisfied figure arms crossed",
            "10": "ten cups rainbow arch over happy home silhouette",
            "page": "dreamy youth holding cup with fish jumping",
            "knight": "romantic armored rider offering cup",
            "queen": "throne by water holding ornate lidded cup",
            "king": "seated ruler with cup and ship under stern gaze",
        },
        "swords": {
            "ace": "hand from cloud gripping crowned upright sword",
            "02": "blindfolded figure holding two crossed swords",
            "03": "heart pierced by three swords, rain streaks",
            "04": "knight tomb meditation, three swords on wall, one on chest",
            "05": "figure with bandaged head, five swords behind",
            "06": "ferryman poling boat with six swords aboard",
            "07": "figure sneaking away with five swords, two left behind",
            "08": "bound figure surrounded by eight swords on ground",
            "09": "figure sitting head in hands, nine swords on dark wall",
            "10": "fallen figure, ten swords in back, storm sky",
            "page": "wind-swept youth carrying sword through gusts",
            "knight": "charging armored rider sword raised through storm",
            "queen": "throne figure right hand raised sword, storm sea backdrop",
            "king": "seated judge with upright sword and butterflies",
        },
        "pentacles": {
            "ace": "hand from cloud offering golden pentacle coin",
            "02": "juggler balancing two linked pentacles on infinity ribbon",
            "03": "artisan three pentacles in cathedral arch with monk patrons",
            "04": "figure clutching one pentacle, four fixed stable",
            "05": "two figures in snow passing five pentacles in stained glass",
            "06": "scales charity, six pentacles exchanged between rich and poor silhouettes",
            "07": "gardener leaning on staff, seven pentacles growing on vine",
            "08": "apprentice hammering eight pentacles on bench",
            "09": "hooded figure in vineyard with nine pentacles on vine",
            "10": "family silhouettes under arch with ten pentacles arranged heraldic",
            "page": "youth studying pentacle in flowering meadow",
            "knight": "slow heavy armored rider holding pentacle",
            "queen": "throne in rose garden holding pentacle with rabbit",
            "king": "seated merchant king with pentacle, bull and grape vines",
        },
    }
    ranks = ["ace", "02", "03", "04", "05", "06", "07", "08", "09", "10", "page", "knight", "queen", "king"]
    out = []
    for r in ranks:
        fn = f"{pre}{r}-full.webp"
        desc = scenes[suit][r]
        out.append((fn, desc))
    return out


ALL_CARDS = MAJOR + minor("wands", "wands / fire emblems") + minor("cups", "cups / water emblems") + minor(
    "swords", "swords / air emblems"
) + minor("pentacles", "pentacles / earth coins")


def chunks(items, size=10):
    for i in range(0, len(items), size):
        yield items[i : i + size]


BATCH_TITLES = [
    "Major Arcana I (0–9)",
    "Major Arcana II (10–19)",
    "Major Arcana III + Wands I",
    "Wands II + Cups I",
    "Cups II",
    "Swords I",
    "Swords II + Pentacles I",
    "Pentacles II",
]


def main():
    batches = list(chunks(ALL_CARDS, 10))
    lines = [
        "# FateQuest 2.0 · Full Tarot Deck · 78 Card Faces · Separate Image Batches",
        "",
        "78 cards (22 Major + 56 Minor) → **8 batches** · **Mode: separate** (one ChatGPT request → N individual images → download each).",
        "English prompts only. Style: **Cloud-ridge Twilight**. Output: `assets/decks/tarot/*.webp` at 512×768.",
        "",
        STYLE,
        "",
        "---",
        "",
    ]
    for i, batch in enumerate(batches, 1):
        title = BATCH_TITLES[i - 1] if i <= len(BATCH_TITLES) else f"Batch {i}"
        n = len(batch)
        lines.append(f"## Batch {i} · {title}")
        lines.append("")
        lines.append(f"- **Mode**: separate · **Count**: {n} · **Output per file**: 512×768 · **Background**: opaque")
        lines.append("- **Output dir**: decks/tarot")
        lines.append("- **Files**:")
        for j, (fn, desc) in enumerate(batch, 1):
            lines.append(f"  {j}. `{fn}` — {desc}")
        lines.append("")
        lines.append("**Prompt**")
        lines.append("")
        lines.append(SEPARATE_PROMPT_TAIL.format(n=n))
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.extend([
        "*78 cards · 8 batches · run:*",
        "",
        "```bash",
        "cd fatequest2/scripts",
        ".venv/bin/python chatgpt_gen_art.py --batch --batch-separate --prompts-file ART_PROMPTS_TAROT_DECK.md --skip-existing",
        "```",
        "",
    ])
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(ALL_CARDS)} cards, {len(batches)} batches)")


if __name__ == "__main__":
    main()
