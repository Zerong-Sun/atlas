#!/usr/bin/env python3
"""
Inventory FateQuest emoji usage → ART_EMOJI_INVENTORY.md + ART_EMOJI_MAP.json
+ ART_PROMPTS_EMOJI.md (batch prompts, one ChatGPT window per category).

Existing named art (mode-/realm-/sym-/item-/…) is reused via the map.
Only `ic-*` stems are generated as new contact sheets.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "assets" / "art"
JS = ROOT / "js"

STYLE = (
    "**Style lock (Cloud-ridge Twilight):** medieval manuscript × dusk wilderness. "
    "Palette — forest ink `#0D1411`, parchment `#F0E4D0`, antique gold `#BDA476`, "
    "rubric `#B3402E` (accent only), mist blue `#7FA3BD`, cloud-peach `#E8B28A`. "
    "Flat mineral paint, thick gold contour, readable at 64px. "
    "Transparent background. NO photorealism, NO neon, NO text/watermarks, "
    "NO anthropomorphic deities."
)

# emoji (normalized, no FE0F) → existing art stem (no .webp)
# Method/realm reuse; trump batches overwrite 🌙/☀️/etc. when building map.
REUSE: dict[str, str] = {
    "🐪": "mode-journey",
    "🗼": "mode-tower",
    "🔮": "realm-tarot",
    "☯": "realm-iching",
    "♈": "realm-western",
    "🎲": "realm-astrodice",
    "🌗": "realm-jiaobei",
    "🌸": "realm-meihua",
    "🃁": "realm-lenormand",
    "📿": "item-beads",
    "🧭": "item-compass",
}

# Normalize keys without VS16
def norm(s: str) -> str:
    return s.replace("\uFE0F", "").replace("\u200D", "")


# ---- New icon batches: (window, title, files[(stem, emoji, desc)]) ----
# Each batch ≤10 for 5×2 sheet. stem is without ic- prefix here; we prefix ic-
BATCHES: list[tuple[str, str, list[tuple[str, str, str]]]] = [
    (
        "Nav",
        "Nav · Tabs & chrome",
        [
            ("nav-home", "✦", "Compass four-point star / rayed medallion, home tab"),
            ("nav-lineage", "✒️", "Calligraphy nib / ink brush, lineage tab"),
            ("nav-codex", "📖", "Open illuminated book, codex tab"),
            ("nav-profile", "☯", "Yin-yang disk in gold rim, profile tab"),
            ("icon-fullscreen", "⛶", "Four-corner expand / viewport frame"),
            ("icon-sound-on", "🔔", "Small bronze bell"),
            ("icon-sound-off", "🔕", "Bell with slash / muted stroke"),
            ("icon-check", "✓", "Gold manuscript check mark"),
            ("icon-lock", "🔒", "Iron padlock, locked realm"),
            ("icon-unknown", "❔", "Parchment card with question flourish"),
        ],
    ),
    (
        "Status",
        "Status · Currency & toast FX",
        [
            ("fx-sparkle", "✨", "Stardust sparkles / gold mote cluster"),
            ("fx-xp", "✧", "White four-point star, XP pip"),
            ("fx-nazar", "🧿", "Nazar / protective eye amulet, glass blue"),
            ("fx-shield", "🛡", "Heraldic kite shield"),
            ("fx-bolt", "⚡", "Lightning bolt glyph"),
            ("fx-heart", "❤️", "Heraldic heart, rubric red + gold rim"),
            ("fx-rainbow", "🌈", "Arc of muted mineral rainbow"),
            ("fx-target", "🎯", "Archery target / omen bullseye"),
            ("fx-warn", "⚠️", "Warning triangle with gold edge"),
            ("fx-fastfwd", "⏩", "Double chevron forward"),
        ],
    ),
    (
        "DreamA",
        "Dream · Dictionary symbols A",
        [
            ("dream-fly", "🕊️", "Dove in flight silhouette"),
            ("dream-fall", "🌀", "Downward spiral / cyclone glyph"),
            ("dream-snake", "🐍", "Coiled serpent manuscript beast"),
            ("dream-water", "🌊", "Wave crest"),
            ("dream-tooth", "🦷", "Single tooth emblem, stylized not gory"),
            ("dream-chase", "🏃", "Running figure silhouette staff-side"),
            ("dream-exam", "⏰", "Hourglass or alarm-bell clock"),
            ("dream-house", "🏠", "Simple house elevation"),
            ("dream-fire", "🔥", "Tongue of flame"),
            ("dream-baby", "👶", "Swaddled infant silhouette, no face detail"),
        ],
    ),
    (
        "DreamB",
        "Dream · Dictionary symbols B",
        [
            ("dream-lost", "🧭", "Compass rose small"),
            ("dream-cat", "🐈", "Cat silhouette sitting"),
            ("dream-dog", "🐕", "Dog silhouette loyal stance"),
            ("dream-treasure", "💰", "Tied money pouch"),
            ("dream-bridge", "🌉", "Arch bridge silhouette"),
            ("dream-mountain", "⛰️", "Triple peak mountain"),
            ("dream-rain", "🌧️", "Cloud with rain strokes"),
            ("dream-door", "🚪", "Arched wooden door ajar"),
            ("dream-stars", "✨", "Crescent + star pair (dream stars&moon)"),
            ("dream-death", "🦋", "Butterfly emerging from cocoon"),
        ],
    ),
    (
        "Ritual",
        "Ritual · Methods & tools leftover",
        [
            ("ritual-pouch", "👝", "Rune drawstring pouch"),
            ("ritual-candle", "🕯️", "Lit candle with soft halo"),
            ("ritual-scroll", "📜", "Rolled parchment scroll"),
            ("ritual-coin", "🪙", "Chinese cash coin round with square hole"),
            ("ritual-lantern", "🏮", "Paper lantern / temple lantern"),
            ("ritual-crescent", "🌒", "Waxing crescent moon"),
            ("ritual-waning", "🌘", "Waning crescent moon"),
            ("ritual-fog", "🌫️", "Fog bank wisps"),
            ("ritual-basket", "🧺", "Woven market basket"),
            ("ritual-amphora", "🏺", "Temperance amphora / pouring vessel"),
        ],
    ),
    (
        "Place",
        "Place · Scene & building icons",
        [
            ("place-tea", "🍵", "Teacup without handle"),
            ("place-teapot", "🫖", "Teapot"),
            ("place-wine", "🍷", "Wine cup"),
            ("place-church", "⛪", "Church with cross gable, side elevation"),
            ("place-mosque", "🕌", "Mosque dome + minaret silhouette"),
            ("place-synagogue", "🕍", "Synagogue facade with tablets hint"),
            ("place-shrine", "⛩️", "Torii / shrine gate simplified"),
            ("place-temple", "🛕", "Stepped temple / pagoda eave"),
            ("place-classical", "🏛️", "Classical columns pediment"),
            ("place-bed", "🛏️", "Simple bed / inn cot"),
        ],
    ),
    (
        "Travel",
        "Travel · Mounts & vessels",
        [
            ("travel-sail", "⛵", "Lateen / small sailboat"),
            ("travel-canoe", "🛶", "Canoe side view"),
            ("travel-row", "🚣", "Rowboat with oars"),
            ("travel-ship", "🛳️", "Passenger junk / cog silhouette"),
            ("travel-ferry", "⛴️", "Ferry boat"),
            ("travel-bactrian", "🐫", "Two-hump camel"),
            ("travel-horse", "🐴", "Horse head / mount"),
            ("travel-ox", "🐂", "Ox head"),
            ("travel-eagle", "🦅", "Eagle / roc wing"),
            ("travel-boot", "🥾", "Hiking boot"),
        ],
    ),
    (
        "Tower",
        "Tower · Combat & ordeal FX",
        [
            ("tower-swords", "⚔️", "Crossed swords"),
            ("tower-ok", "✅", "Heavy check in gold square seal"),
            ("tower-fail", "❌", "Cross mark / wax X seal"),
            ("tower-reroll", "🔄", "Anticlockwise arrows cycle"),
            ("tower-ice", "🧊", "Ice crystal / frozen cube"),
            ("tower-skull", "💀", "Heraldic skull (ornament, not gore)"),
            ("tower-pill", "💊", "Apothecary pill / capsule"),
            ("tower-drop", "💧", "Water droplet"),
            ("tower-broom", "🧹", "Broom (cleanse)"),
            ("tower-chain", "⛓️", "Broken or linked chain"),
        ],
    ),
    (
        "TrumpA",
        "Trump · Major Arcana emoji A (0–9)",
        [
            ("trump-00-fool", "🃏", "Fool: satchel + cliff edge + small dog"),
            ("trump-01-magician", "🎩", "Magician: top hat + wand on table"),
            ("trump-02-priestess", "🌙", "Priestess: crescent + veil columns"),
            ("trump-03-empress", "🌾", "Empress: grain sheaf + Venus hint"),
            ("trump-04-emperor", "🏛️", "Emperor: throne / columned seat"),
            ("trump-05-hierophant", "🕍", "Hierophant: keys crossed + shrine"),
            ("trump-06-lovers", "💞", "Lovers: two hearts linked"),
            ("trump-07-chariot", "🏇", "Chariot: horse armor / chariot wheel"),
            ("trump-08-strength", "🦁", "Strength: lion head + infinity above"),
            ("trump-09-hermit", "🏮", "Hermit: lantern with star flame"),
        ],
    ),
    (
        "TrumpB",
        "Trump · Major Arcana emoji B (10–21)",
        [
            ("trump-10-wheel", "🎡", "Wheel of Fortune: spinning wheel disk"),
            ("trump-11-justice", "⚖️", "Justice: scales"),
            ("trump-12-hanged", "🙃", "Hanged Man: figure inverted by ankle (silhouette)"),
            ("trump-13-death", "🦋", "Death: white butterfly from gate"),
            ("trump-14-temperance", "🏺", "Temperance: two cups pouring"),
            ("trump-15-devil", "⛓️", "Devil: chains on blank card"),
            ("trump-16-tower", "🗼", "Tower: struck spire crown falling"),
            ("trump-17-star", "⭐", "Star: eight-point pouring into pool"),
            ("trump-18-moon", "🌕", "Moon: eclipsed moon over water"),
            ("trump-19-sun", "☀️", "Sun: rayed solar disk with compass face"),
        ],
    ),
    (
        "TrumpC",
        "Trump · Major Arcana emoji C + extras",
        [
            ("trump-20-judgement", "🎺", "Judgement: trumpet / angel-call horn only"),
            ("trump-21-world", "🌍", "World: orb in wreath / mandorla"),
            ("misc-crown", "👑", "Royal crown"),
            ("misc-trophy", "🏆", "Trophy cup"),
            ("misc-cap", "🎓", "Scholar cap"),
            ("misc-seed", "🌱", "Seedling sprout"),
            ("misc-leaf", "🍃", "Fluttering leaf"),
            ("misc-map", "🗺️", "Folded portolan map"),
            ("misc-books", "📚", "Stack of books"),
            ("misc-speech", "💬", "Speech scroll balloon manuscript style"),
        ],
    ),
    (
        "Misc",
        "Misc · UI leftovers",
        [
            ("misc-calendar", "📅", "Calendar plaque"),
            ("misc-clipboard", "📋", "Clipboard / tally board"),
            ("misc-diamond", "◆", "Solid diamond lozenge ornament"),
            ("misc-orn-star", "❖", "Ornamental diamond-star"),
            ("misc-scales", "⚖️", "Balance scales (UI)"),
            ("misc-comet", "☄️", "Comet with tail"),
            ("misc-tornado", "🌪️", "Tornado column"),
            ("misc-storm", "⛈️", "Storm cloud with bolt"),
            ("misc-snow", "❄️", "Snowflake"),
            ("misc-ghost", "👻", "Soft ghost silhouette (ordeal, not cute)"),
        ],
    ),
    (
        "Creature",
        "Creature · Beasts & figures",
        [
            ("creature-dragon", "🐉", "East-Asian dragon coil silhouette"),
            ("creature-owl", "🦉", "Owl facing forward"),
            ("creature-troll", "🧌", "Mountain spirit / troll silhouette hooded"),
            ("creature-mage", "🧙", "Hooded mage with staff, no face"),
            ("creature-walker", "🚶", "Pedestrian traveler with staff"),
            ("creature-mirror", "🪞", "Hand mirror"),
            ("creature-key", "🗝️", "Old ornate key"),
            ("creature-dagger", "🗡️", "Dagger knife"),
            ("creature-hole", "🕳️", "Dark pit / hole"),
            ("creature-newmoon", "🌑", "New moon disk"),
        ],
    ),
]


def scan_usage() -> dict[str, list[str]]:
    seq_re = re.compile(
        r"(?:"
        r"[\U0001F300-\U0001FAFF]"
        r"|[\u2600-\u27BF]"
        r"|[\u2300-\u23FF]"
        r"|[\u2B00-\u2BFF]"
        r")(?:\uFE0F|\u200D[\U0001F300-\U0001FAFF])*"
    )
    extra = set("✦✧◆◇★☆✓✔✕✖⛶❖☯")
    locs: dict[str, list[str]] = defaultdict(list)
    files = list(JS.rglob("*.js")) + [ROOT / "index.html"] + list((ROOT / "css").glob("*.css"))
    for fp in files:
        text = fp.read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines(), 1):
            for m in seq_re.finditer(line):
                locs[m.group(0)].append(f"{fp.relative_to(ROOT)}:{i}")
            for ch in line:
                if ch in extra:
                    locs[ch].append(f"{fp.relative_to(ROOT)}:{i}")
    return locs


def build_map() -> dict[str, str]:
    """emoji → art stem (ic-* or reused)."""
    m: dict[str, str] = {}
    for e, stem in REUSE.items():
        m[e] = stem
        m[norm(e)] = stem
    for _win, _title, files in BATCHES:
        for stem, emoji, _desc in files:
            full = f"ic-{stem}"
            m[emoji] = full
            m[norm(emoji)] = full
    return m


def write_inventory(locs: dict[str, list[str]], emo_map: dict[str, str]) -> None:
    lines = [
        "# FateQuest · Emoji inventory → art replacements",
        "",
        "Scanned `js/`, `index.html`, `css/`. Content glyphs kept as Unicode "
        "(planets, zodiac, hexagrams, runes, arrows) are listed under **Keep**.",
        "",
        "Runtime: `FQ.emo(emoji)` / `ART_EMOJI_MAP.json` → `assets/art/<stem>.webp`.",
        "",
        "## Keep as Unicode (not painted)",
        "",
        "- Planetary / zodiac / node symbols in `data-misc.js` (astrodice line art exists)",
        "- Trigrams / hexagrams / runic letters as text content",
        "- Typographic arrows `→ ← ↳ ⇒`",
        "",
        "## Map (emoji → art stem)",
        "",
        "| Emoji | Stem | Uses | Notes |",
        "|---|---|---:|---|",
    ]
    keep = set("☉☽☾☿♀♂♃♄♅♆♇☊⚷♈♉♊♋♌♍♎♏♐♑♒♓☰☱☲☳☴☵☶☷→←↳⇒")
    for s, places in sorted(locs.items(), key=lambda x: (-len(x[1]), x[0])):
        if all(c in keep or c in "\uFE0F\u200D" for c in s) or s in keep:
            continue
        stem = emo_map.get(s) or emo_map.get(norm(s)) or "—"
        note = "reuse" if stem in REUSE.values() or (stem and not stem.startswith("ic-")) else "new"
        if stem == "—":
            note = "unmapped"
        try:
            name = unicodedata.name(s[0])
        except Exception:
            name = "?"
        lines.append(f"| {s} | `{stem}` | {len(places)} | {note} · {name} |")

    unmapped = []
    for s in locs:
        if all(c in keep or c in "\uFE0F\u200D" for c in s) or s in keep:
            continue
        if not (emo_map.get(s) or emo_map.get(norm(s))):
            unmapped.append(s)
    lines += ["", f"### Unmapped ({len(unmapped)})", ""]
    if unmapped:
        lines.append(" ".join(unmapped))
    else:
        lines.append("_None — all pictographic UI emojis mapped._")
    lines.append("")
    (ART / "ART_EMOJI_INVENTORY.md").write_text("\n".join(lines), encoding="utf-8")


def write_prompts() -> None:
    lines = [
        "# FateQuest 2.0 · Emoji → Manuscript Icon Replacements",
        "",
        "Source inventory: [`ART_EMOJI_INVENTORY.md`](./ART_EMOJI_INVENTORY.md). "
        "Lookup: [`ART_EMOJI_MAP.json`](./ART_EMOJI_MAP.json).",
        "",
        "Same category → one ChatGPT **window**; different categories → separate windows.",
        "",
        STYLE,
        "",
        "**Output**: `assets/art/ic-<stem>.webp` · 512×512 transparent.",
        "",
        "---",
        "",
    ]
    windows: dict[str, list[str]] = {}
    bi = 0
    for win, title, files in BATCHES:
        bi += 1
        n = len(files)
        cols, rows = (5, 2) if n == 10 else ((5, 1) if n == 5 else (n, 1))
        if n == 8:
            cols, rows = 4, 2
        lines.append(f"## Batch {bi} · {title}")
        lines.append("")
        lines.append(f"- **Window**: {win}")
        lines.append(
            f"- **Mode**: sheet · **Grid**: {cols}×{rows} · **Cell**: 512×512 · "
            f"**Output per file**: 512×512 · **Background**: transparent"
        )
        lines.append("- **Output dir**: art")
        lines.append("- **Files**:")
        for i, (stem, emoji, desc) in enumerate(files, 1):
            lines.append(f"  {i}. `ic-{stem}.webp` — replaces {emoji} — {desc}")
        lines.append("")
        lines.append("**Prompt**")
        lines.append("")
        listing = "\n".join(
            f"{i}. ic-{stem}.webp (replaces {emoji}): {desc}"
            for i, (stem, emoji, desc) in enumerate(files, 1)
        )
        lines.append(
            f"Generate exactly ONE {cols}×{rows} contact sheet of {n} game UI icons "
            f"on transparent background. Thin dark gutters. Identical Cloud-ridge Twilight "
            f"manuscript style — gold outline, flat mineral fills, single centered subject, "
            f"≥8% padding, readable at 64px. No text, filenames, or watermarks. "
            f"Cell order left-to-right, top-to-bottom:\n\n{listing}"
        )
        lines.append("")
        lines.append("---")
        lines.append("")
        windows.setdefault(win, []).append(f"Batch {bi}")

    lines.append("### Window → batches")
    for w, bs in windows.items():
        lines.append(f"- **{w}**: {', '.join(bs)}")
    lines.append("")
    lines.append("```bash")
    lines.append("cd fatequest/scripts")
    lines.append(".venv/bin/python gen_emoji_prompts.py")
    lines.append(
        ".venv/bin/python submit_map_windows.py --prompts-file ART_PROMPTS_EMOJI.md "
        "--skip-existing --poll-sec 120"
    )
    lines.append("```")
    lines.append("")
    (ART / "ART_PROMPTS_EMOJI.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote ART_PROMPTS_EMOJI.md ({bi} batches, {len(windows)} windows)")


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    locs = scan_usage()

    # Detect unmapped pictographs → Extra batch (auto slug)
    keep = set("☉☽☾☿♀♂♃♄♅♆♇☊⚷♈♉♊♋♌♍♎♏♐♑♒♓☰☱☲☳☴☵☶☷→←↳⇒♥")
    mapped_emojis: set[str] = set()
    for e in REUSE:
        mapped_emojis.add(e)
        mapped_emojis.add(norm(e))
    for _w, _t, files in BATCHES:
        for _stem, emoji, _d in files:
            mapped_emojis.add(emoji)
            mapped_emojis.add(norm(emoji))

    extra: list[tuple[str, str, str]] = []
    for s in sorted(locs.keys(), key=lambda x: (-len(locs[x]), x)):
        if all(c in keep or c in "\uFE0F\u200D" for c in s) or s in keep:
            continue
        if s in mapped_emojis or norm(s) in mapped_emojis:
            continue
        # skip hexagrams / runes / alchemical if any slipped through
        o = ord(s[0])
        if 0x4DC0 <= o <= 0x4DFF or 0x16A0 <= o <= 0x16FF:
            continue
        try:
            name = unicodedata.name(s[0]).lower().replace(" ", "-")
        except Exception:
            name = f"u{o:04x}"
        slug = re.sub(r"[^a-z0-9]+", "-", name).strip("-")[:28] or f"u{o:04x}"
        extra.append((f"extra-{slug}", s, f"Manuscript icon replacing {s} ({unicodedata.name(s[0], '?')})"))

    # chunk Extra into windows of 10
    for i in range(0, len(extra), 10):
        chunk = extra[i : i + 10]
        suffix = "" if i == 0 else f"{i // 10 + 1}"
        BATCHES.append(
            (f"Extra{suffix}", f"Extra · Unmapped leftovers {i // 10 + 1}", chunk)
        )

    emo_map: dict[str, str] = {}
    for e, stem in REUSE.items():
        emo_map[e] = stem
        emo_map[norm(e)] = stem
    # method realms that FQ.art already uses
    emo_map["🏮"] = "realm-bazi"
    emo_map[norm("🏮")] = "realm-bazi"
    emo_map["🌙"] = "realm-dream"
    emo_map[norm("🌙")] = "realm-dream"
    for _w, _t, files in BATCHES:
        for stem, emoji, _d in files:
            emo_map[emoji] = f"ic-{stem}"
            emo_map[norm(emoji)] = f"ic-{stem}"

    (ART / "ART_EMOJI_MAP.json").write_text(
        json.dumps(emo_map, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    write_inventory(locs, emo_map)
    write_prompts()
    n_ic = sum(len(f) for _, _, f in BATCHES)
    print(f"Inventory: {len(locs)} unique glyphs scanned")
    print(f"Map entries: {len(emo_map)} · new ic-* icons: {n_ic}")
    print(f"Extra auto icons: {len(extra)}")
    print(f"Wrote {ART / 'ART_EMOJI_INVENTORY.md'}")
    print(f"Wrote {ART / 'ART_EMOJI_MAP.json'}")


if __name__ == "__main__":
    main()
