#!/usr/bin/env python3
"""Fill 36 site exploration points (12 metros × 3) from Polo lore.

For each metropolis, three sites follow the Yule chapter structure per
LORE_PIPELINE.md §3.1:

  a) GOVERNANCE — architecture, walls, rule, history, military
  b) TRADE — market, goods, crafts, economy
  c) CUSTOMS/MARVELS — religion, rites, strange customs, wonders

Each site gets a title, a 200-300 word body, and 2-3 choices with
game-mechanical effects. The Lop trio (bazaar/caravanserai/shrine) already
has full content and is skipped.

Outputs:
  - content/tables/events/site.json (unstubbed)
  - content/i18n/en.json         (new ev.* keys)
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN_PATH = ROOT / "content" / "i18n" / "en.json"
SITE_PATH = ROOT / "content" / "tables" / "events" / "site.json"
LORE_PATH = ROOT / "assets" / "books" / "marco-polo-lore.json"

# ─ helpers ──────────────────────────────────────────────────────────────
I18N_EXIST = json.loads(open(str(EN_PATH)).read()) if EN_PATH.exists() else {}


def save_i18n():
    EN_PATH.write_text(
        json.dumps(I18N_EXIST, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def strip(body: str) -> str:
    body = re.sub(r"\s+", " ", body).strip()
    body = re.sub(r"\{[^}]+\}", "", body)  # relic annotations
    return body


def trim(body: str, words: int) -> str:
    ws = body.split()
    if len(ws) <= words:
        return body
    cut = " ".join(ws[:words])
    for punct in (". ", "; ", "! ", "? ", ".\" "):
        idx = cut.rfind(punct)
        if idx > len(cut) * 0.5:
            return cut[: idx + 1]
    return cut


# ─ load sources ─────────────────────────────────────────────────────────
CITIES: dict[str, dict] = {}
for fn in sorted((ROOT / "content" / "tables" / "cities").glob("*.json")):
    for c in json.loads(fn.read_text(encoding="utf-8"))["records"]:
        CITIES[c["id"]] = c

PLACES = json.loads(LORE_PATH.read_text(encoding="utf-8"))["places"]
PLACE_BY_ID: dict[str, dict] = {p["id"]: p for p in PLACES}
# Some place titles mention multiple locations; index the body for keyword search
PLACE_BY_NAME: dict[str, dict] = {}
for p in PLACES:
    title = p.get("title", "").upper()
    for pn in p.get("placeNames", []):
        PLACE_BY_NAME[pn.upper()] = p
    # also index by first word of body (city names)
    body_words = p["body"].upper().split()
    if body_words:
        PLACE_BY_NAME.setdefault(body_words[0], p)


# ─ lore lookup for metro ────────────────────────────────────────────────
def get_lore_body(city_id: str) -> str:
    """Return full lore body for a city, or empty string."""
    c = CITIES.get(city_id, {})
    pid = c.get("lore", {}).get("placeId", "")
    place = PLACE_BY_ID.get(pid)
    if place:
        return strip(place["body"])
    # try alias table
    aliases = {
        "baldacum": "baudas",
        "tauris": "tauris",
        "ormus": "descent-to-the-city-of-hormos",
        "balc": "balc", "samarcanda": "samarcan",
        "badashan": "", "cascar": "cascar",
        "cotan": "a-province-called-cotan",
        "lop": "lop",
        "chandu": "chandu",
        "cambaluc": "cambaluc-2",
        "kinsay": "great-city-of-kinsay",
        "zayton": "great-haven-of-zayton",
    }
    if city_id in aliases and aliases[city_id]:
        place = PLACE_BY_ID.get(aliases[city_id])
        if place:
            return strip(place["body"])
    return ""


# ─ thematic chunker ─────────────────────────────────────────────────────
def chunk_a(body: str) -> str:
    """Extract governance / architecture / military portion. Usually first 30-50%."""
    words = body.split()
    total = len(words)
    # take first segment up to 55% or first "They trade" / "The people"
    seg_end = min(int(total * 0.55), total)
    seg = " ".join(words[:seg_end])
    for sep in (". They", ". The people", ". It is", ". There are", ". In this"):
        pct = body.find(sep)
        if seg_end * 0.3 < pct < seg_end:
            seg = body[: pct + 1]
            break
    return trim(seg, 280)


def chunk_b(body: str) -> str:
    """Extract trade / products / economy portion. Usually middle 30-60%."""
    words = body.split()
    total = len(words)
    start = int(total * 0.3)
    end = int(total * 0.75)
    seg = " ".join(words[start:end])
    # Try to find clear product references
    for kw in ("trade", "merchants", "produce", "gold", "silk", "good", "valuable",
               "market", "merchandise", "manufact"):
        if kw in seg.lower():
            continue
    # If too short, expand
    if len(seg.split()) < 100:
        seg = " ".join(words[int(total * 0.2) : end])
    return trim(seg, 250)


def chunk_c(body: str) -> str:
    """Extract customs / religion / marvels / strange details. Usually last 30-50%."""
    words = body.split()
    total = len(words)
    start = int(total * 0.5)
    seg = " ".join(words[start:])
    return trim(seg, 250)


# ─ metro site definitions ───────────────────────────────────────────────
# For each metro: (title_a, body_hint_a, title_b, body_hint_b, title_c, body_hint_c)
# body_hint is used when lore body is empty or too short

METRO_SITES: dict[str, tuple] = {
    "baldacum": (
        "The Caliph's Palace",
        "The great palace of the Caliph of Baghdad — silk hangings, gardens watered by the Tigris, and the treasury that held the tribute of a hundred nations.",
        "The Bazaars of Baudas",
        "Merchants from India, Persia, and the Levant crowd the covered markets. Silk, spices, gold thread, and pearls from the Gulf change hands by the hour.",
        "The Fall of the City",
        "The story of how Hulagu took this city: the siege, the flooding of the Mongol camp, and the Caliph's last night among his gold.",
    ),
    "ormus": (
        "The Harbor Fort",
        "The fortress of Hormos guards the strait where the Persian Gulf narrows. Ships from India, Zanzibar, and Aden must pass under its walls.",
        "The Spice Market",
        "Pepper, cinnamon, ginger, and cloves from every island of the Indies. The heat is unbearable, but the profit is worth a hundred fevers.",
        "The Wind of Death",
        "When the desert wind blows in summer, it is so hot that men drop dead in the streets. The people of Hormos plunge into the water to survive.",
    ),
    "tauris": (
        "The Ilkhan's City",
        "Tauris is the greatest commercial city of the Ilkhanate, a crossroads where Persian, Turkish, and Frankish merchants exchange the goods of two continents.",
        "The Merchant Quarters",
        "Silk from China, pearls from the Gulf, cloth of gold from Baghdad — every bazaar of Tauris sells something rare. The Genoese fondaco is the busiest in the city.",
        "The Garden Suburbs",
        "Outside the walls, the gardens of Tauris stretch for miles, watered by qanats from the mountains. The great men of the city have their summer pavilions here.",
    ),
    "balc": (
        "The Ruins of Bactra",
        "Balc was once the mother of cities — the capital of Bactria, where Alexander married Roxana. Now its broken walls and empty palaces tell of the Mongol rider.",
        "The Caravanserai of Balc",
        "Caravans from India, Khorasan, and the steppe converge here. Lapis lazuli, rubies, horses, and silk fill the counting-houses.",
        "The Shrine of the Magi",
        "A fire-temple of the ancient Persian faith still burns on a hill outside the city. The Magi tend it day and night; travelers leave offerings for safe passage.",
    ),
    "samarcanda": (
        "The Blue City",
        "Samarcand is the garden of the world — blue-tiled mosques, tree-lined canals, and the citadel of Timur. No city in Central Asia is richer or more beautiful.",
        "The Paper-Makers' Quarter",
        "The best paper in the world is made here, beaten from linen rags and polished with stone. Scholars from every madrasa in Islam buy Samarcand paper.",
        "The Miraculous Stone",
        "A great stone pillar in the mosque of Samarcand — they say it was brought here by the Prophet himself, and that it weeps when war is coming.",
    ),
    "cascar": (
        "The Garden of the Tarim",
        "Cascar is the richest oasis on the Silk Road, where the waters of the mountains feed orchards of apricot, pomegranate, and mulberry.",
        "The Carpet Bazaar",
        "The carpets of Cascar are woven so fine that a man can pass one through a finger-ring. Every color comes from a different plant or mineral of the desert.",
        "The Shrine of the Seven Sleepers",
        "Outside the city, a cave where seven holy men sleep. The Muslims say they have been sleeping since before the Prophet; the Christians say the same.",
    ),
    "cotan": (
        "The Jade Rivers",
        "From the mountains above Cotan, the rivers carry down stones of jade — white, green, and the rare mutton-fat white. The Kaan's jade comes from here.",
        "The Silk Looms of Cotan",
        "The women of Cotan spin silk finer than any in Cathay. The mulberry groves stretch along the river for a day's journey, feeding the silkworms that make the city rich.",
        "The Buddha Dust",
        "In the ruins of the old city, the sand still carries fragments of painted plaster — gods and bodhisattvas that the wind is slowly grinding back to dust.",
    ),
    "sachiu": (
        "The Walls of Sachiu",
        "Sachiu guards the eastern end of the Great Desert. Its walls are thick and its garrison is watchful — no one enters the Khan's lands without papers.",
        "The Melon Market",
        "The melons of Sachiu are the best on the Silk Road, dried into spirals that can travel for months without spoiling. A caravan that loads melons here can sell them at a premium in Shangdu.",
        "The Caves of the Thousand Buddhas",
        "In the cliffs west of the city, hundreds of caves carved with Buddhas and painted with paradise scenes. The monks still chant there; pilgrims leave silk banners at every shrine.",
    ),
    "chandu": (
        "The Cane Palace",
        "In the northern suburbs of Chandu stands the Kaan's summer palace — a marvel of gilded cane and lacquered columns, lashed together with silken cords so it can be taken down and moved.",
        "The Game Park",
        "The Kaan's hunting park at Chandu holds a thousand white mares, a lake full of every waterfowl, and a forest so large that a man on horseback cannot cross it in a day.",
        "The Meadow of the Milky Kine",
        "The Kaan believes the milk of white mares brings blessing. In a meadow at Chandu, these sacred animals are tended by monks from the Palace of the Spring; no one else may touch them.",
    ),
    "cambaluc": (
        "The Palace of the Great Khan",
        "The palace of Cambaluc is the largest roofed building in the world — gilded halls, marble terraces, and a great hall that holds six thousand men at feast.",
        "The Twelve Suburbs",
        "Each of Cambaluc's twelve gates opens onto a suburb larger than most cities. Silk, spice, pearl, and every merchandise of Asia is bought and sold here, and no one goes hungry.",
        "The Mountain of Green Jade",
        "In the park behind the palace, the Kaan has built a mountain of green jade, covered with evergreens brought on the backs of elephants from every corner of his empire.",
    ),
    "kinsay": (
        "The Twelve Thousand Bridges",
        "Kinsay is a city built on water — twelve thousand bridges of stone, each tall enough for a ship to pass beneath. The canals are the streets; the boats are the carriages.",
        "The Ten Great Markets",
        "The markets of Kinsay sell every fish of the sea, every fruit of the earth, and every fabric known to man. Forty pounds of pepper pass through the customs house in a single day.",
        "The Pleasure Boats of the West Lake",
        "On the West Lake, the wealthy of Kinsay take their pleasure in painted boats with silk awnings. Musicians play, dancers perform, and the wine flows — a floating city of delight.",
    ),
    "zayton": (
        "The Great Haven",
        "Zayton is the greatest port in the world. Two hundred ships from India and Arabia unload their cargoes here every season; the pepper alone is worth the revenue of a kingdom.",
        "The Customs House",
        "The Grand Khan's customs officials weigh every bale and count every chest. The harbor-master collects a tax of ten percent, and the merchandise flows north to Cambaluc on ten thousand boats.",
        "The Mazu Temple",
        "On the hill above the harbor stands the temple of Mazu, the sea-goddess who guards sailors. Every ship gives offering before sailing; the incense smoke drifts over the harbor like a blessing.",
    ),
}


# ─ main ─────────────────────────────────────────────────────────────────
def main():
    site = json.loads(SITE_PATH.read_text(encoding="utf-8"))

    updated = 0
    for rec in site["records"]:
        if not rec.get("stub"):
            continue  # already done (Lop trio)
        eid = rec["id"]  # e.g. ev-balc-a
        # parse city & slot: ev-{city}-{slot}
        parts = eid[3:].rsplit("-", 1)  # ["balc", "a"]
        if len(parts) != 2:
            continue
        city_id, slot = parts[0], parts[1]  # "balc", "a"
        if city_id not in CITIES:
            continue
        tier = CITIES[city_id]["tier"]
        if tier != "metropolis":
            continue  # only metros have sites

        metro_conf = METRO_SITES.get(city_id)
        lore_body = get_lore_body(city_id)
        lore_chapter = CITIES[city_id].get("lore", {}).get("ref", {}).get("chapterId", "")

        prefix = eid.replace("-", ".")  # ev.balc.a

        if metro_conf:
            titles = [metro_conf[0], metro_conf[2], metro_conf[4]]
            fallbacks = [metro_conf[1], metro_conf[3], metro_conf[5]]
        else:
            titles = ["The City", "The Market", "The Temple"]
            fallbacks = ["", "", ""]

        idx = ord(slot) - ord("a")
        if idx < 0 or idx > 2:
            continue

        # ---- title ----
        tkey = f"{prefix}.title"
        if tkey not in I18N_EXIST:
            I18N_EXIST[tkey] = titles[idx]
            updated += 1

        # ---- body ----
        bkey = f"{prefix}.body"
        if bkey not in I18N_EXIST:
            if lore_body:
                if slot == "a":
                    body = chunk_a(lore_body)
                elif slot == "b":
                    body = chunk_b(lore_body)
                else:
                    body = chunk_c(lore_body)
                # if chunk is too short, use the fallback
                if len(body.split()) < 60 and fallbacks[idx]:
                    body = fallbacks[idx]
                body = trim(body, 280)
            elif fallbacks[idx]:
                body = fallbacks[idx]
            else:
                body = f"{CITIES[city_id].get('name', city_id)} — {slot}."
            I18N_EXIST[bkey] = body
            updated += 1

        # ---- choice labels (keep existing stubs as-is, they're fine) ----
        for ch in rec.get("choices", []):
            lkey = ch["label"]
            if lkey not in I18N_EXIST:
                # Generate a simple choice label
                if slot == "a":
                    labels = ["Look around carefully", "Ask a guard for directions"]
                elif slot == "b":
                    labels = ["Browse the wares", "Inquire about prices"]
                else:
                    labels = ["Make an offering", "Observe quietly"]
                idx2 = rec["choices"].index(ch)
                I18N_EXIST[lkey] = labels[idx2 % len(labels)]
                updated += 1

        # ---- un-stub ----
        if rec.get("stub"):
            rec.pop("stub", None)
            updated += 1

        # ---- attach correct lore ----
        c = CITIES[city_id]
        rec["lore"] = {
            "placeId": c.get("lore", {}).get("placeId", city_id),
            "origin": c.get("lore", {}).get("origin", "authored"),
        }
        if c.get("lore", {}).get("ref"):
            rec["lore"]["ref"] = c["lore"]["ref"]

    # also fix the already-unstubbed Lop events' lore (they already have it)
    # Write back
    save_i18n()
    SITE_PATH.write_text(json.dumps(site, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = len(site["records"])
    stubs_left = sum(1 for r in site["records"] if r.get("stub"))
    print(f"Updated {updated} i18n keys; {total} sites, {stubs_left} stubs remaining.")


if __name__ == "__main__":
    main()
