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

# ── I18n text builders ──────────────────────────────────────────────────

def _label_en_zh(city_id, choice_id, city):
    """Return (en_label, zh_label) for a choice."""
    tier = city.get("tier", "town")
    name_src = city.get("lore", {}).get("placeId", "")
    name_display = city_id.replace("-", " ").title()

    en = "Pass through"
    zh = "匆匆穿过"

    templates = {
        "pass": {
            "station": ("Ride on without delay", "继续赶路，不作停留"),
            "town": ("Pass through without stopping", "穿城而过，不加停留"),
            "city": ("Pass through the gate without delay", "匆匆穿过城门"),
            "metropolis": ("Pass through the gate without delay", "快步穿过城门"),
        },
        "rest": {
            "station": ("Rest half a day by the road", "在路边歇半日"),
            "town": ("Rest half a day by the road", "在路边歇半日"),
        },
        "look": {
            "town": ("Rest and ask what men say of this place", "歇脚打听此地有何说头"),
        },
        "market": {
            "city": ("Walk through the market", "穿过集市"),
            "metropolis": ("Walk the great market", "穿过大市"),
        },
        "shrine": {
            "city": ("Visit the shrine", "去庙里看看"),
        },
        "customs": {
            "metropolis": ("Declare your goods with the Governor's clerks", "到府尹衙门报关"),
        },
        "lore": {
            "metropolis": ("Ask what men say of this city", "打听这座城的来历"),
        },
    }

    if choice_id in templates:
        tmpl = templates[choice_id]
        if tier in tmpl:
            en, zh = tmpl[tier]
        elif "city" in tmpl and tier == "city":
            en, zh = tmpl["city"]
        else:
            en, zh = list(tmpl.values())[0]

    return en, zh

# ── Build choices and i18n ──────────────────────────────────────────────

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
    build_all()
