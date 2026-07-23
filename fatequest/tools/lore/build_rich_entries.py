#!/usr/bin/env python3
"""
build_rich_entries.py — Upgrade ~100 entry event stubs to rich mechanism-based choices.

Strategy by tier:
  station → 2 choices (pass-through + quick look)
  town    → 2 choices (pass-through + look about / ask locals)
  city    → 3 choices (pass-through + market + shrine/variant)
  metropolis → 3-4 choices (customs/enter + lore + market + optional language gate)

The script reads entry.json, all city data, and Polo lore, then writes updated
entry.json + new i18n keys to en.json / zh.json.
"""

import json
import re
from pathlib import Path
from collections import OrderedDict

ROOT = Path(__file__).resolve().parent.parent.parent
EVENTS_PATH = ROOT / "content/tables/events/entry.json"
I18N_EN_PATH = ROOT / "content/i18n/en.json"
I18N_ZH_PATH = ROOT / "content/i18n/zh.json"
CITIES_DIR = ROOT / "content/tables/cities"
LORE_PATH = ROOT / "assets/books/marco-polo-lore.json"

CITY_BAND_FILES = {
    "west_asia": "west_asia.json",
    "central_asia": "central_asia.json",
    "china": "china.json",
    "steppe": "steppe.json",
    "india": "india.json",
    "maritime_asia": "maritime_asia.json",
}

# ── Polo lore excerpts used for choice flavor ──────────────────────────
# Keyed by city ID. Only filled for cities with source lore.
LORE_EXCERPTS = {}

def load_lore():
    """Load Polo lore and index by placeId for quick lookup."""
    with open(LORE_PATH, "r", encoding="utf-8") as f:
        lore_data = json.load(f)
    # Build placeId → body mapping
    place_map = {}
    for place in lore_data.get("places", []):
        place_map[place["id"]] = place["body"]
    return lore_data, place_map

def load_cities():
    """Load all cities indexed by city ID."""
    cities = {}
    for band, fname in CITY_BAND_FILES.items():
        path = CITIES_DIR / fname
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for rec in data.get("records", []):
                rec["_band_file"] = band
                cities[rec["id"]] = rec
    return cities

def load_events():
    with open(EVENTS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def load_i18n(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f, object_pairs_hook=OrderedDict)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✓ wrote {path.name} ({len(data.get('records', data))} records)")

# ── Choice text builders ────────────────────────────────────────────────

def format_choices(city_id, city, lore_body):
    """Generate the choices list for a city's entry event."""
    tier = city.get("tier", "town")
    name_en = city_id.replace("-", " ").title()
    shrine = city.get("shrine")
    specialty = city.get("specialty")
    culture = city.get("culture", "")
    band = city.get("band", "")
    faiths = city.get("faiths", [])
    has_market = bool(city.get("market", {}).get("goods"))
    has_lore = bool(lore_body)

    if tier == "station":
        return _station_choices(city_id, city, lore_body)
    elif tier == "town":
        return _town_choices(city_id, city, lore_body)
    elif tier == "city":
        return _city_choices(city_id, city, lore_body)
    elif tier == "metropolis":
        return _metropolis_choices(city_id, city, lore_body)
    else:
        return _default_choices(city_id)

def _station_choices(city_id, city, lore_body):
    """Station: 2 choices — pass through + rest a day."""
    choices = [
        {
            "label": f"ev.{city_id}.entry.choice.pass",
            "effects": [
                {"op": "reveal_map", "value": city_id, "reason": "passed-through-here"}
            ]
        },
        {
            "label": f"ev.{city_id}.entry.choice.rest",
            "effects": [
                {"op": "days", "value": 1, "reason": "rested-a-day-at-the-station"},
                {"op": "reveal_map", "value": city_id, "reason": "rested-and-noted-the-place"}
            ]
        },
    ]
    return choices

def _town_choices(city_id, city, lore_body):
    """Town: 2-3 choices — pass through + look about."""
    choices = [
        {
            "label": f"ev.{city_id}.entry.choice.pass",
            "effects": [
                {"op": "reveal_map", "value": city_id, "reason": "passed-through-here"}
            ]
        },
        {
            "label": f"ev.{city_id}.entry.choice.look",
            "effects": _town_look_effects(city_id, city, lore_body)
        },
    ]
    return choices

def _town_look_effects(city_id, city, lore_body):
    """Build effects for a town 'look about' choice."""
    effects = [{"op": "reveal_map", "value": city_id, "reason": "looked-about-the-town"}]
    if lore_body:
        effects.append({"op": "codex", "value": f"cx-{city_id}", "reason": "heard-what-men-say-of-this-place"})
    effects.append({"op": "days", "value": 1, "reason": "spent-a-day-looking-about"})
    return effects

def _city_choices(city_id, city, lore_body):
    """City: 3 choices — pass through + market + shrine."""
    shrine = city.get("shrine")
    choices = [
        {
            "label": f"ev.{city_id}.entry.choice.pass",
            "effects": [
                {"op": "reveal_map", "value": city_id, "reason": "entered-and-left-quickly"}
            ]
        },
        {
            "label": f"ev.{city_id}.entry.choice.market",
            "effects": _city_market_effects(city_id, city, lore_body)
        },
        {
            "label": f"ev.{city_id}.entry.choice.shrine" if shrine else f"ev.{city_id}.entry.choice.look",
            "effects": _city_shrine_effects(city_id, city, lore_body)
        },
    ]
    return choices

def _city_market_effects(city_id, city, lore_body):
    effects = [{"op": "days", "value": 1, "reason": "walked-the-market"}]
    if lore_body:
        effects.append({"op": "codex", "value": f"cx-{city_id}", "reason": "heard-the-market-talk"})
        effects.append({"op": "reveal_map", "value": city_id, "reason": "merchants-named-the-quarters"})
    else:
        effects.append({"op": "reveal_map", "value": city_id, "reason": "walked-the-market"})
    return effects

def _city_shrine_effects(city_id, city, lore_body):
    shrine = city.get("shrine")
    effects = []
    if shrine:
        effects.append({"op": "reputation", "value": 1, "scope": "city", "id": city_id, "reason": "paid-respect-at-the-shrine"})
        if lore_body:
            # Grant a sticker for a significant shrine visit
            effects.append({"op": "sticker", "value": f"st-{city_id}-shrine", "reason": "visited-the-shrine"})
    else:
        effects.append({"op": "days", "value": 1, "reason": "spent-a-day-resting"})
        if lore_body:
            effects.append({"op": "codex", "value": f"cx-{city_id}", "reason": "learned-about-this-place"})
    effects.append({"op": "reveal_map", "value": city_id, "reason": "found-the-way"})
    return effects

def _metropolis_choices(city_id, city, lore_body):
    """Metropolis: 3+ choices matching zayton pattern."""
    shrine = city.get("shrine")
    choices = [
        {
            "label": f"ev.{city_id}.entry.choice.customs",
            "effects": [
                {"op": "days", "value": 2, "reason": "waited-at-the-customs"},
                {"op": "codex", "value": f"cx-{city_id}", "reason": "declared-goods-and-heard-the-law"},
                {"op": "reveal_map", "value": city_id, "reason": "clerks-named-the-quarters"}
            ]
        },
        {
            "label": f"ev.{city_id}.entry.choice.lore",
            "effects": _metropolis_lore_effects(city_id, city, lore_body)
        },
        {
            "label": f"ev.{city_id}.entry.choice.market",
            "effects": _metropolis_market_effects(city_id, city)
        },
    ]
    return choices

def _metropolis_lore_effects(city_id, city, lore_body):
    effects = [
        {"op": "codex", "value": f"cx-{city_id}", "reason": "learned-the-citys-story"},
    ]
    # Use existing sticker names if available (from site events)
    existing_stickers = {
        "balc": "st-balc-ruins",
        "baldacum": "st-baldacum-palace",
        "cambaluc": "st-cambaluc-hill",
        "cascar": "st-cascar-garden",
        "chandu": "st-chandu-palace",
        "cotan": "st-cotan-jade",
        "kinsay": "st-kinsay-lake",
        "ormus": "st-ormus-wind",
        "samarcanda": "st-samarcanda-dome",
        "tauris": "st-tauris-view",
    }
    sticker = existing_stickers.get(city_id)
    if sticker:
        effects.append({"op": "sticker", "value": sticker, "reason": "heard-the-tale"})
    else:
        effects.append({"op": "sticker", "value": f"st-{city_id}-entry", "reason": "stood-at-the-gates"})
    effects.append({"op": "days", "value": 1, "reason": "listened-to-the-tales"})
    return effects

def _metropolis_market_effects(city_id, city):
    specialty = city.get("specialty", "")
    effects = [
        {"op": "days", "value": 1, "reason": "walked-the-great-market"},
        {"op": "codex", "value": f"cx-{city_id}", "reason": "bargained-with-the-merchants"},
    ]
    # Give a coin or goods effect based on specialty
    if specialty in ("jade", "camlet", "damascus-steel", "dehua-porcelain"):
        effects.append({"op": "goods", "id": specialty, "value": 1, "reason": "bought-local-specialty"})
    return effects

def _default_choices(city_id):
    return [{
        "label": f"ev.{city_id}.entry.choice.enter",
        "effects": [{"op": "reveal_map", "value": city_id, "reason": "arrived-and-looked-about"}]
    }]

# ── Regional / faith-aware terminology ──────────────────────────────────

CUSTOMS_BY_BAND = {
    # China (Yuan): shìbó sī / 市舶司 — keep Chinese bureaucratic flavour
    "china": (
        "Declare your goods at the shìbó sī (市舶司)",
        "到市舶司报关",
    ),
    # Steppe: Mongol overseer
    "steppe": (
        "Declare your goods to the darughachi (overseer)",
        "向 darughachi（监守官）报税",
    ),
    # West Asia (Ilkhanate): tamghā-khāna
    "west_asia": (
        "Declare your goods at the tamghā-khāna (tax-house)",
        "到 tamghā-khāna（税署）报关",
    ),
    # Central Asia (Chagatai): bājgāh
    "central_asia": (
        "Declare your goods at the bājgāh (toll-house)",
        "到 bājgāh（税卡）报关",
    ),
    # India / maritime: fall back to tamghā (Mongol commercial tax term known on the coasts)
    "india": (
        "Declare your goods at the customs house",
        "到税署报关",
    ),
    "maritime_asia": (
        "Declare your goods at the harbour customs",
        "到港务税署报关",
    ),
}

SHRINE_BY_FAITH = {
    "islam": (
        "Visit the masjid (mosque)",
        "去 masjid（清真寺）看看",
    ),
    "hindu": (
        "Visit the mandir (temple)",
        "去 mandir（神庙）看看",
    ),
    "buddhism": (
        "Visit the sì (Buddhist monastery)",
        "去佛寺看看",
    ),
    "daoism": (
        "Visit the guàn (Daoist temple)",
        "去道观看看",
    ),
    "nestorian": (
        "Visit the church",
        "去教堂看看",
    ),
    "folk": (
        "Visit the sacred place",
        "去圣所看看",
    ),
    "latin": (
        "Visit the church",
        "去教堂看看",
    ),
    "orthodox": (
        "Visit the church",
        "去教堂看看",
    ),
}

# Special shrine labels (narrative overrides faith mapping)
SHRINE_BY_CITY = {
    "balc": (
        "Visit the ātashkadeh (fire-temple of the Magi)",
        "去 ātashkadeh（祆教火祠）看看",
    ),
    "zayton": (
        "Visit the Temple of the Sea",
        "去天妃宫看看",
    ),
}

MARKET_BY_BAND = {
    "china": ("Walk through the market", "穿过市集"),
    "steppe": ("Walk through the market", "穿过市集"),
    "west_asia": ("Walk through the bāzār", "穿过 bāzār（集市）"),
    "central_asia": ("Walk through the bāzār", "穿过 bāzār（集市）"),
    "india": ("Walk through the bāzār", "穿过 bāzār（集市）"),
    "maritime_asia": ("Walk through the harbour market", "穿过港口市集"),
}

GATE_BY_BAND = {
    "china": ("Pass through the gate without delay", "匆匆穿过城门"),
    "steppe": ("Pass through the gate without delay", "匆匆穿过城门"),
    "west_asia": ("Pass through the darvāzeh without delay", "匆匆穿过 darvāzeh（城门）"),
    "central_asia": ("Pass through the darvāzeh without delay", "匆匆穿过 darvāzeh（城门）"),
    "india": ("Pass through the darvāzā without delay", "匆匆穿过 darvāzā（城门）"),
    "maritime_asia": ("Pass through the gate without delay", "匆匆穿过城门"),
}


def _customs_label(city):
    band = city.get("band", "china")
    return CUSTOMS_BY_BAND.get(band, CUSTOMS_BY_BAND["china"])


def _shrine_label(city_id, city):
    if city_id in SHRINE_BY_CITY:
        return SHRINE_BY_CITY[city_id]
    faith = (city.get("shrine") or {}).get("faith", "folk")
    band = city.get("band", "")
    # Steppe folk shrines → ovoo (sacred cairn)
    if faith == "folk" and band == "steppe":
        return ("Visit the ovoo (sacred cairn)", "去 ovoo（敖包）看看")
    return SHRINE_BY_FAITH.get(faith, SHRINE_BY_FAITH["folk"])


def _market_label(city, tier):
    band = city.get("band", "china")
    en, zh = MARKET_BY_BAND.get(band, MARKET_BY_BAND["china"])
    if tier == "metropolis":
        if band in ("west_asia", "central_asia", "india"):
            return ("Walk the great bāzār", "穿过大 bāzār")
        return ("Walk the great market", "穿过大市")
    return en, zh


def _pass_label(city, tier):
    if tier == "station":
        return ("Ride on without delay", "继续赶路，不作停留")
    if tier == "town":
        return ("Pass through without stopping", "穿城而过，不加停留")
    band = city.get("band", "china")
    return GATE_BY_BAND.get(band, GATE_BY_BAND["china"])


# ── I18n text builders ──────────────────────────────────────────────────

def _label_en_zh(city_id, choice_id, city):
    """Return (en_label, zh_label) for a choice — region- and faith-aware."""
    tier = city.get("tier", "town")

    if choice_id == "pass":
        return _pass_label(city, tier)
    if choice_id == "rest":
        return ("Rest half a day by the road", "在路边歇半日")
    if choice_id == "look":
        return ("Rest and ask what men say of this place", "歇脚打听此地有何说头")
    if choice_id == "market":
        return _market_label(city, tier)
    if choice_id == "shrine":
        return _shrine_label(city_id, city)
    if choice_id == "customs":
        return _customs_label(city)
    if choice_id == "lore":
        return ("Ask what men say of this city", "打听这座城的来历")

    return ("Pass through", "匆匆穿过")

# ── Build choices and i18n ──────────────────────────────────────────────

def relabel_all():
    """Force-refresh entry choice i18n labels from city band/faith (no structure change)."""
    print("Relabeling entry choice i18n from city data...")
    cities = load_cities()
    events = load_events()
    i18n_en = load_i18n(I18N_EN_PATH)
    i18n_zh = load_i18n(I18N_ZH_PATH)

    updated = 0
    for record in events["records"]:
        m = re.match(r"ev-(.+)-entry", record["id"])
        if not m:
            continue
        city_id = m.group(1)
        city = cities.get(city_id)
        if not city:
            continue
        for ch in record.get("choices", []):
            label_key = ch.get("label", "")
            m2 = re.match(r"ev\.(.+)\.entry\.choice\.(.+)", label_key)
            if not m2:
                continue
            cid, choice_id = m2.group(1), m2.group(2)
            if choice_id in ("arrive", "ask", "rest") and city_id in ("sachiu", "lop"):
                # Preserve hand-authored rich labels for lop / sachiu
                if choice_id != "rest" or city_id == "lop":
                    if choice_id in ("ask", "arrive"):
                        continue
            en_label, zh_label = _label_en_zh(cid, choice_id, city)
            if choice_id in ("pass", "rest", "look", "market", "shrine", "customs", "lore"):
                i18n_en[label_key] = en_label
                i18n_zh[label_key] = zh_label
                updated += 1

    i18n_en = OrderedDict(sorted(i18n_en.items()))
    i18n_zh = OrderedDict(sorted(i18n_zh.items()))
    save_json(I18N_EN_PATH, i18n_en)
    save_json(I18N_ZH_PATH, i18n_zh)
    print(f"\nDone: relabeled {updated} entry choice keys")


def build_all():
    print("Loading data...")
    lore_data, place_map = load_lore()
    cities = load_cities()
    events = load_events()
    i18n_en = load_i18n(I18N_EN_PATH)
    i18n_zh = load_i18n(I18N_ZH_PATH)

    new_en = {}
    new_zh = {}
    updated_events = []
    skipped = 0
    upgraded = 0

    for record in events["records"]:
        ev_id = record["id"]
        # Extract city_id from event id, e.g. "ev-accon-entry" → "accon"
        m = re.match(r"ev-(.+)-entry", ev_id)
        if not m:
            updated_events.append(record)
            continue
        city_id = m.group(1)

        city = cities.get(city_id)
        if not city:
            print(f"  ⚠ city not found: {city_id}, keeping as-is")
            updated_events.append(record)
            skipped += 1
            continue

        # Check if already rich (2+ choices with different labels)
        existing_choices = record.get("choices", [])
        choice_labels = [c.get("label", "") for c in existing_choices]
        has_enter = any(l.endswith(".enter") for l in choice_labels)
        has_rich = len(existing_choices) >= 2 and not has_enter

        # Skip already-rich events (lop, zayton)
        if has_rich:
            updated_events.append(record)
            skipped += 1
            continue

        # Preserve sachiu (already has sticker+codex)
        if city_id == "sachiu" and len(existing_choices) > 0 and "arrive" in choice_labels[0]:
            updated_events.append(record)
            skipped += 1
            continue

        # Get lore body if available
        lore_place_id = city.get("lore", {}).get("placeId")
        lore_body = place_map.get(lore_place_id, "") if lore_place_id else ""

        # Generate choices
        new_choices = format_choices(city_id, city, lore_body)

        # Build new event record
        new_record = dict(record)
        new_record["choices"] = new_choices

        # Generate i18n keys
        for ch in new_choices:
            label_key = ch["label"]  # e.g. ev.accon.entry.choice.pass
            m2 = re.match(r"ev\.(.+)\.entry\.choice\.(.+)", label_key)
            if m2:
                cid, choice_id = m2.group(1), m2.group(2)
                en_label, zh_label = _label_en_zh(cid, choice_id, city)
                new_en[label_key] = en_label
                new_zh[label_key] = zh_label

        updated_events.append(new_record)
        upgraded += 1

    # Write events
    events["records"] = updated_events
    save_json(EVENTS_PATH, events)

    # Merge i18n keys (keep existing, add new)
    for k, v in new_en.items():
        i18n_en[k] = v
    for k, v in new_zh.items():
        i18n_zh[k] = v

    # Sort i18n keys
    i18n_en = OrderedDict(sorted(i18n_en.items()))
    i18n_zh = OrderedDict(sorted(i18n_zh.items()))

    save_json(I18N_EN_PATH, i18n_en)
    save_json(I18N_ZH_PATH, i18n_zh)

    print(f"\nDone: upgraded {upgraded} entry events, skipped {skipped} (already rich)")

if __name__ == "__main__":
    import sys
    if "--relabel" in sys.argv:
        relabel_all()
    else:
        build_all()
