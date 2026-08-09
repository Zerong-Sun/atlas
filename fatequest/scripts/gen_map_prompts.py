#!/usr/bin/env python3
"""Generate ART_PROMPTS_MAP.md from ART_TODO_MAP categories (one window per class)."""

from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "art" / "ART_PROMPTS_MAP.md"

STYLE = (
    "**Style lock:** 13th-century manuscript map (mappa mundi / portolan) — "
    "vellum `#E9DBB8`, iron-gall ink `#4A3A1C`, ochre `#8A6234`, rubric `#B3402E`, "
    "sea-teal `#3F5F6B`. Visible brush, wash, parchment grain. "
    "NO modern flat vector, NO photorealism, NO glow/neon."
)

# (window, title, mode, cols, rows, cell_wh, out_wh, transparent, files[(fn, desc)])
BATCHES: list[tuple] = [
    (
        "A",
        "A1 · Map vellum base",
        "separate",
        1,
        1,
        (1640, 840),
        (1640, 840),
        False,
        [
            (
                "map-vellum.webp",
                "Full map vellum base 1640×840: authentic parchment scan feel — fibers, "
                "water stains, tiny wormholes, toasted edges; LARGE clean center for city "
                "placement; no text",
            ),
        ],
    ),
    (
        "A",
        "A2 · Map tiles (sea + civilization ornaments)",
        "sheet",
        5,
        1,
        (256, 256),
        (256, 256),
        True,
        [
            (
                "map-sea.webp",
                "Tileable medieval sea: fine parallel waves + fish-scale ripples, portolan style",
            ),
            (
                "map-orn-chr.webp",
                "Tileable Gothic quatrefoil / traceried window lattice, blue-grey ink",
            ),
            (
                "map-orn-isl.webp",
                "Tileable Islamic girih octagram packing, green ink lines",
            ),
            (
                "map-orn-con.webp",
                "Tileable auspicious clouds + meander border, ochre ink",
            ),
            (
                "map-orn-mazu.webp",
                "Tileable fish-scale waves + tangled water-weed, teal ink",
            ),
        ],
    ),
    (
        "B",
        "B · Terrain elevation pieces (side elevation)",
        "sheet",
        3,
        2,
        (512, 280),
        (512, 280),
        True,
        [
            (
                "map-mtn-snow.webp",
                "Snow peaks Pamir 512×280: three staggered peaks, white caps, left-light "
                "right-hatch, flat base + soft drop shadow",
            ),
            (
                "map-mtn-rock.webp",
                "Rocky ridges Alps/Central plains 512×280: brown rock, texture strokes, "
                "flat base + shadow",
            ),
            (
                "map-dune.webp",
                "Triple dunes Kerman desert 512×180: gold sand, wind ripples, flat base",
            ),
            (
                "map-forest.webp",
                "Conifer cluster Europe 320×220: 5–7 trees, side view, flat base",
            ),
            (
                "map-river.webp",
                "Canal brush stroke 512×64: ink ribbon tapering at ends, horizontal",
            ),
            (
                "map-reef.webp",
                "Reef shoals Mazu sea 320×140: rocks and shallow water, flat base",
            ),
        ],
    ),
    (
        "C",
        "C · City & shrine elevations",
        "sheet",
        3,
        2,
        (320, 260),
        (256, 220),
        True,
        [
            (
                "map-city-chr.webp",
                "Christendom fort 256×220: crenellated wall + pointed belfry + arch gate, "
                "side elevation, no text",
            ),
            (
                "map-city-isl.webp",
                "Crescent realm fort 256×220: dome + minaret + pointed arch, side elevation, "
                "no text",
            ),
            (
                "map-city-con.webp",
                "Confucian/Daoist fort 256×220: flying eaves tower + rammed-earth wall, "
                "side elevation, no text",
            ),
            (
                "map-city-mazu.webp",
                "Port fort 256×220: pier + Fuzhou-junk masts + Mazu temple eave, side "
                "elevation, no text",
            ),
            (
                "map-court-con.webp",
                "Palace Shangdu/Dadu 320×260: multi-eave halls + white terrace base, no text",
            ),
            (
                "map-shrine.webp",
                "Generic shrine niche/small temple 200×180, usable for any civilization, "
                "no text",
            ),
        ],
    ),
    (
        "D",
        "D · Map beasts and ornaments",
        "sheet",
        4,
        2,
        (420, 260),
        (420, 260),
        True,
        [
            (
                "map-beast-serpent.webp",
                "Sea serpent 420×160: three-fold body in waves, manuscript monster style",
            ),
            (
                "map-beast-whale.webp",
                "Whale/sea-monster 380×200: spout, scales, round eye, manuscript style",
            ),
            (
                "map-beast-roc.webp",
                "Roc bird 420×260: wing-spread silhouette, claws gripping something",
            ),
            (
                "map-beast-griffin.webp",
                "Griffin 320×260: half-eagle half-lion guarding a gold pile",
            ),
            (
                "map-rose.webp",
                "Compass rose 320×320: 8-point star, rubric north pointer, outer tick ring",
            ),
            (
                "map-wind-head.webp",
                "Wind head 160×160: cheek-puffed profile blowing",
            ),
            (
                "map-cartouche.webp",
                "Title cartouche 640×120: blank scroll with curled ends, empty for UI text",
            ),
            (
                "map-border.webp",
                "Horizontal map border band 512×48: tileable weave/vine motif",
            ),
        ],
    ),
    (
        "E",
        "E1 · Land transport (facing right)",
        "sheet",
        5,
        1,
        (256, 160),
        (256, 160),
        True,
        [
            ("tr-caravan.webp", "Camel caravan 2–3 humps + driver, side view facing right"),
            ("tr-mule.webp", "Mule train, side view facing right"),
            ("tr-yam.webp", "Yam relay horse with saddle plaque, facing right"),
            ("tr-yak.webp", "Yak train in snow, facing right"),
            ("tr-foot.webp", "Foot traveler staff + pack 200×160, facing right"),
        ],
    ),
    (
        "E",
        "E2 · Sea & mythical transport (facing right)",
        "sheet",
        4,
        2,
        (400, 260),
        (360, 200),
        True,
        [
            ("tr-galley.webp", "Mediterranean galley 320×180 double oar banks, facing right"),
            ("tr-dhow.webp", "Sewn dhow 320×180 lateen sail, facing right"),
            ("tr-junk.webp", "Chinese junk 360×200 four masts twelve sails, facing right"),
            ("tr-barge.webp", "Canal barge 300×160 flat bottom canopy roof, facing right"),
            ("tr-roc.webp", "Roc carrying people/boat in claws 360×260, facing right"),
            ("tr-griffin.webp", "Griffin mount with rider 320×240, facing right"),
            ("tr-serpent.webp", "Sea serpent towing a boat 400×200, facing right"),
            (
                "_pad-blank.webp",
                "Blank parchment cell with thin gold frame only — discard after crop",
            ),
        ],
    ),
    (
        "F1",
        "F1a · Scene backgrounds set 1 (16:9)",
        "sheet",
        4,
        2,
        (480, 270),
        (1920, 1080),
        False,
        [
            (
                "scene-venice-quay.webp",
                "Venice quay: lagoon, gondolas, San Marco campanile silhouette, morning mist; "
                "keep lower-left 1/3 empty for UI",
            ),
            (
                "scene-acre-wall.webp",
                "Acre night walls: crusader battlements, torches, distant Mediterranean, "
                "stars; empty lower-left 1/3",
            ),
            (
                "scene-tabriz-bazaar.webp",
                "Tabriz bazaar/observatory: arched bazaar, carpets, rooftop astrolabe; "
                "empty lower-left 1/3",
            ),
            (
                "scene-hormuz-port.webp",
                "Hormuz port: hot wind, dhows, date palms, dock astrologer stall; "
                "empty lower-left 1/3",
            ),
            (
                "scene-kerman-dunes.webp",
                "Kerman dunes: sand sea, camel silhouettes, sunset, half-buried posthouse; "
                "empty lower-left 1/3",
            ),
            (
                "scene-herat-road.webp",
                "Herat road: caravanserai, poplar rows, snow mountains afar; empty lower-left 1/3",
            ),
            (
                "scene-pamir-pass.webp",
                "Pamir pass: snowline, prayer flags, yaks, pale-blue campfire; empty lower-left 1/3",
            ),
            (
                "scene-shangdu-palace.webp",
                "Shangdu marble palace: grassland, white palace, golden tents; empty lower-left 1/3",
            ),
        ],
    ),
    (
        "F1",
        "F1b · Scene backgrounds set 2 (16:9)",
        "sheet",
        4,
        2,
        (480, 270),
        (1920, 1080),
        False,
        [
            (
                "scene-khanbaliq-hall.webp",
                "Khanbaliq night banquet hall: giant pillars, candle sea, screens; "
                "empty lower-left 1/3",
            ),
            (
                "scene-hangzhou-lake.webp",
                "Hangzhou West Lake: stone bridge, painted boat, lanterns, distant hills; "
                "empty lower-left 1/3",
            ),
            (
                "scene-quanzhou-harbor.webp",
                "Quanzhou Zayton harbor: forest of masts, Tianfei temple eaves, incense; "
                "empty lower-left 1/3",
            ),
            (
                "scene-voyage-sea.webp",
                "Homeward sea: four-masted deck, storm-building clouds; empty lower-left 1/3",
            ),
            (
                "scene-region-chr.webp",
                "Christendom travel: European hills, abbey far silhouette; empty lower-left 1/3",
            ),
            (
                "scene-region-isl.webp",
                "Crescent travel: trade road, camels, minaret far; empty lower-left 1/3",
            ),
            (
                "scene-region-con.webp",
                "Confucian/Daoist travel: mountain path, post pavilion, flying eaves far; "
                "empty lower-left 1/3",
            ),
            (
                "scene-region-mazu.webp",
                "Mazu sea travel: waves, sails, seabirds; empty lower-left 1/3",
            ),
        ],
    ),
    (
        "F2",
        "F2a · NPC half-body portraits set 1",
        "sheet",
        4,
        2,
        (450, 650),
        (900, 1300),
        True,
        [
            ("npc-market-chr.webp", "Venetian cloth merchant Giovanni, half-body facing right"),
            ("npc-market-isl.webp", "Spice seller Yusuf, half-body facing right"),
            ("npc-market-con.webp", "Silk shopkeeper Zhou, half-body facing right"),
            ("npc-market-mazu.webp", "Ship cargo broker A-Hai, half-body facing right"),
            ("npc-temple-chr.webp", "Christian deacon monk, half-body facing right"),
            ("npc-temple-isl.webp", "Mosque keeper Abdul, half-body facing right"),
            ("npc-temple-con.webp", "Daoist temple receptionist, half-body facing right"),
            ("npc-temple-mazu.webp", "Tianfei temple attendant, half-body facing right"),
        ],
    ),
    (
        "F2",
        "F2b · NPC half-body portraits set 2",
        "sheet",
        4,
        2,
        (450, 650),
        (900, 1300),
        True,
        [
            ("npc-tea-chr.webp", "Tavern landlady, half-body facing right"),
            ("npc-tea-isl.webp", "Caravanserai tea master, half-body facing right"),
            ("npc-tea-con.webp", "Roadside storyteller, half-body facing right"),
            ("npc-tea-mazu.webp", "Dock tea-shed granny, half-body facing right"),
            ("npc-inn-chr.webp", "Innkeeper Christendom, half-body facing right"),
            ("npc-inn-isl.webp", "Caravanserai host, half-body facing right"),
            ("npc-inn-con.webp", "Waystation steward, half-body facing right"),
            ("npc-inn-mazu.webp", "Boat inn landlord, half-body facing right"),
        ],
    ),
    (
        "F",
        "F · Mentor half-body portraits",
        "sheet",
        5,
        2,
        (450, 650),
        (900, 1300),
        True,
        [
            ("mentor-tarot.webp", "Frankish widow card-reader of Tabriz, half-body facing right"),
            ("mentor-lenormand.webp", "Card-shop daughter Caterina, half-body facing right"),
            ("mentor-runes.webp", "Varangian guard Harald, half-body facing right"),
            ("mentor-astrodice.webp", "Astronomer Tebrizi, half-body facing right"),
            ("mentor-western.webp", "Dock astrologer Nadira, half-body facing right"),
            ("mentor-meihua.webp", "Westbound monk Mingyuan, half-body facing right"),
            ("mentor-iching.webp", "Historiographer Master Yelu, half-body facing right"),
            ("mentor-dream.webp", "Dream-interpreter Saliman, half-body facing right"),
            ("mentor-bazi.webp", "Fate-hall Master Shen Wu, half-body facing right"),
            ("mentor-jiaobei.webp", "Tianfei temple Matron Chen, half-body facing right"),
        ],
    ),
    (
        "G",
        "G · Realm icons (512)",
        "sheet",
        5,
        2,
        (512, 512),
        (512, 512),
        True,
        [
            ("realm-tarot.webp", "Tarot tradition emblem: upright card object, mauve+gold"),
            ("realm-iching.webp", "I Ching emblem: cash coins, verdigris+gold"),
            ("realm-bazi.webp", "Bazi emblem: compact compass palace grid, ochre+gold"),
            ("realm-western.webp", "Western astrology emblem: zodiac tick ring, mist-blue+gold"),
            ("realm-runes.webp", "Runes emblem: rune pouch, grey-blue+gold"),
            ("realm-dream.webp", "Dream emblem: pillow with crescent"),
            ("realm-astrodice.webp", "Astrodice emblem: three dice cluster"),
            ("realm-jiaobei.webp", "Jiaobei emblem: pair of moon blocks"),
            ("realm-meihua.webp", "Meihua emblem: plum blossom branch"),
            ("realm-lenormand.webp", "Lenormand emblem: small card + clover, sepia+gold"),
        ],
    ),
]


def sheet_prompt(n: int, cols: int, rows: int, transparent: bool) -> str:
    bg = "transparent background" if transparent else "opaque parchment/scene background"
    return (
        f"Generate exactly ONE {cols}×{rows} contact sheet of {n} map/journey assets ({bg}). "
        f"Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan "
        f"hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. "
        f"No text labels, filenames, or watermarks on the sheet. "
        f"Cell order left-to-right, top-to-bottom matches the numbered list."
    )


def separate_prompt(transparent: bool) -> str:
    bg = "transparent background" if transparent else "opaque full-bleed"
    return (
        f"Generate exactly ONE map/journey image ({bg}). Do not write an explanation. "
        f"13th-century manuscript map style: vellum, iron-gall ink, mineral washes. "
        f"No modern flat vector, no photorealism, no neon, no readable text."
    )


def main() -> None:
    lines = [
        "# FateQuest 2.0 · Map & Journey Missing Textures · Batch Prompts",
        "",
        "Source: [`ART_TODO_MAP.md`](./ART_TODO_MAP.md).",
        "Same category → one ChatGPT **window**; batches in that window run sequentially.",
        "Different categories → **separate windows** (A / B / C / D / E / F1 / F2 / F / G).",
        "",
        STYLE,
        "",
        "**Windows:**",
        "- **A** map textures · **B** terrain · **C** cities · **D** beasts/ornaments · **E** transport",
        "- **F1** scene BGs · **F2** NPC portraits · **F** mentors · **G** realm icons",
        "",
        "Output: `assets/art/<filename>` (skip `_pad-blank.webp`).",
        "",
        "---",
        "",
    ]

    windows: dict[str, list[str]] = {}
    for bi, (win, title, mode, cols, rows, cell, out, transparent, files) in enumerate(
        BATCHES, 1
    ):
        n = len(files)
        cw, ch = cell
        ow, oh = out
        bg = "transparent" if transparent else "opaque"
        lines.append(f"## Batch {bi} · {title}")
        lines.append("")
        lines.append(f"- **Window**: {win}")
        if mode == "sheet":
            lines.append(
                f"- **Mode**: sheet · **Grid**: {cols}×{rows} · **Cell**: {cw}×{ch} · "
                f"**Output per file**: {ow}×{oh} · **Background**: {bg}"
            )
        else:
            lines.append(
                f"- **Mode**: separate · **Count**: {n} · **Output per file**: {ow}×{oh} · "
                f"**Background**: {bg}"
            )
        lines.append("- **Output dir**: art")
        lines.append("- **Files**:")
        for i, (fn, desc) in enumerate(files, 1):
            lines.append(f"  {i}. `{fn}` — {desc}")
        lines.append("")
        lines.append("**Prompt**")
        lines.append("")
        if mode == "sheet":
            lines.append(sheet_prompt(n, cols, rows, transparent))
        else:
            lines.append(separate_prompt(transparent))
        lines.append("")
        lines.append("---")
        lines.append("")
        windows.setdefault(win, []).append(f"Batch {bi}")

    lines.append("### Window → batches")
    for w, bs in windows.items():
        lines.append(f"- **{w}**: {', '.join(bs)}")
    lines.append("")
    lines.append("Run (one window per category, sequential batches inside):")
    lines.append("")
    lines.append("```bash")
    lines.append("cd fatequest/scripts")
    lines.append(".venv/bin/python gen_map_prompts.py")
    lines.append(
        ".venv/bin/python submit_map_windows.py --skip-existing --poll-sec 180"
    )
    lines.append("```")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"Batches: {len(BATCHES)}, windows: {list(windows)}")


if __name__ == "__main__":
    main()
