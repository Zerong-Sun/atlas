#!/usr/bin/env python3
"""Build ibn-battuta-lore.json from extracted chapters."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from travel_lore_lib import (  # noqa: E402
    BOOKS,
    cite,
    condense,
    load_raw,
    paras_matching,
    slugify,
    unique_id,
    write_lore,
)

OUT = BOOKS / "ibn-battuta-lore.json"

BANDS = [
    {"id": "north_africa", "label": "North Africa"},
    {"id": "egypt", "label": "Egypt & Nile"},
    {"id": "arabia", "label": "Arabia & Hejaz"},
    {"id": "levant", "label": "Levant"},
    {"id": "west_asia", "label": "West Asia"},
    {"id": "central_asia", "label": "Central Asia"},
    {"id": "steppe", "label": "Steppe & Far North"},
    {"id": "europe", "label": "Europe"},
    {"id": "india", "label": "India"},
    {"id": "maritime_asia", "label": "Maritime Asia"},
    {"id": "china", "label": "China"},
    {"id": "east_africa", "label": "East Africa"},
    {"id": "sub_saharan_africa", "label": "Sub-Saharan Africa"},
]

# Default band by chapter number (Lee's itinerary order)
CHAPTER_BAND = {
    1: "north_africa",
    2: "egypt",
    3: "egypt",
    4: "levant",
    5: "levant",
    6: "west_asia",
    7: "west_asia",
    8: "west_asia",
    9: "arabia",  # also east_africa — entries override
    10: "west_asia",
    11: "west_asia",  # Anatolia
    12: "steppe",
    13: "central_asia",
    14: "india",
    15: "india",
    16: "india",
    17: "india",
    18: "india",
    19: "maritime_asia",
    20: "maritime_asia",
    21: "india",
    22: "maritime_asia",
    23: "china",
    24: "west_asia",
    25: "sub_saharan_africa",
}

# Extra place/story entries carved from chapters: (chapter, kind, id_hint, title, band, keywords)
# keywords used to pull matching paragraphs; empty → use whole chapter condensed
SPLITS: list[tuple[int, str, str, str, str, list[str]]] = [
    # Ch I Maghreb
    (1, "place", "tangier", "Tangier (Tanjiers)", "north_africa",
     ["left his native", "tanjiers", "tilims", "milyāna", "first city"]),
    (1, "place", "tunis", "Tunis and the Maghreb Road", "north_africa",
     ["tūnis", "tunis", "bijāya", "kosantīna", "safākus", "kābis", "tarābulus", "tripoli"]),
    (1, "story", "judge-of-alexandria-omen", "The Poor Scholar Named Judge at Alexandria's Gate", "egypt",
     ["fakhr oddīn", "gate of the", "mr. judge", "alexandria"]),
    # Ch II Egypt
    (2, "place", "alexandria", "Alexandria", "egypt", ["alexandria"]),
    (2, "place", "cairo", "Cairo", "egypt", ["caïro", "cairo", "misr"]),
    (2, "story", "borhan-oddins-prophecy", "Borhan Oddin's Prophecy of Distant Brothers", "egypt", ["borhān", "borhan", "farīd", "china", "india"]),
    # Ch III Upper Egypt
    (3, "place", "upper-egypt", "Upper Egypt and the Nile", "egypt", ["esyūt", "ekhmīm", "kanā", "kaus", "edfū", "aidhāb"]),
    (3, "place", "aidhab", "Aidhab on the Red Sea", "egypt", ["aidhāb", "aidhab"]),
    # Ch IV Sinai–Palestine
    (4, "place", "gaza-hebron", "Gaza and Hebron (El Khalil)", "levant", ["gaza", "khalīl", "khalil", "hebron"]),
    # Ch V Levant
    (5, "place", "jerusalem", "Jerusalem", "levant", ["jerusalem", "temple", "sakhr"]),
    (5, "place", "damascus", "Damascus", "levant", ["damascus", "dimashk"]),
    (5, "place", "aleppo", "Aleppo", "levant", ["aleppo", "halab"]),
    (5, "story", "abu-yaakub-alchemy", "Abu Yaakub and the Transmutation of Copper", "levant", ["yaakūb", "yaakub", "copper", "gold", "alchemy"]),
    # Ch VI Iraq
    (6, "place", "basra", "Basra and Lower Mesopotamia", "west_asia", ["basra", "oballa", "abbādān"]),
    (6, "place", "najaf", "Meshhed Ali (Najaf)", "west_asia", ["meshhed", "alī", "najaf"]),
    # Ch VII Persia
    (7, "place", "shiraz", "Shiraz", "west_asia", ["shīrāz", "shiraz"]),
    (7, "story", "saints-of-fars", "Saints and Shrines of Fars", "west_asia", ["maj d", "khafīf", "sheikh", "miracle"]),
    # Ch VIII Baghdad–Mosul–Mecca return
    (8, "place", "baghdad", "Baghdad", "west_asia", ["bagdad", "baghdad"]),
    (8, "place", "mosul", "Mosul and Upper Iraq", "west_asia", ["mosul", "nisībīn", "mardīn", "sinjār"]),
    # Ch IX Arabia / East Africa
    (9, "place", "mecca", "Mecca", "arabia", ["mecca", "kaaba", "kaabah", "haram"]),
    (9, "place", "aden", "Aden", "arabia", ["aden"]),
    (9, "place", "mogadishu", "Mogadishu (Makdashu)", "east_africa", ["makdashū", "mogadishu", "makdashu"]),
    (9, "place", "kilwa", "Kilwa (Kalwa) and the Swahili Coast", "east_africa", ["kalwā", "kilwa", "mombasa", "zaila"]),
    (9, "place", "oman", "Oman — Zafar, Kolhat, Nazwa", "arabia", ["zafār", "kolhāt", "nazwā", "hadramaut", "omān"]),
    # Ch X Gulf / return Anatolia start
    (10, "place", "hormuz", "Hormuz", "west_asia", ["hormuz", "harauna"]),
    (10, "place", "pearl-fisheries", "Pearl Fisheries of the Gulf", "west_asia", ["pearl", "kaisa", "sīrāf", "siraf"]),
    (10, "place", "alanya", "Alanya (El Alaya)", "west_asia", ["alāyā", "alaya", "alanya"]),
    # Ch XI Anatolia
    (11, "place", "konya", "Konya and the Grave of Rumi", "west_asia", ["kūnia", "konya", "rūmī", "rumi"]),
    (11, "place", "anatolian-beyliks", "The Turkish Beyliks of Anatolia", "west_asia", ["burūsa", "bursa", "sīvās", "amāsia", "birki", "yazmīr"]),
    # Ch XII Steppe / Crimea
    (12, "place", "crimea", "Crimea and the Kipchak Desert", "steppe", ["crim", "kafā", "kifjāk", "kipchak", "kirash"]),
    (12, "place", "sarai", "Sarai and the Camp of Uzbek Khan", "steppe", ["sarai", "uzbek", "bish tāg", "astrachan", "bulgār"]),
    # Ch XIII Constantinople / Central Asia
    (13, "place", "constantinople", "Constantinople", "europe", ["constantinople", "mahtūlī"]),
    (13, "place", "bukhara-samarkand", "Bukhara and Samarkand", "central_asia", ["bokhāra", "bukhara", "samarkand"]),
    (13, "place", "kabul-hindu-kush", "Kabul and the Hindu Kush", "central_asia", ["kābul", "kabul", "hindū kush", "ghizna", "afghān"]),
    (13, "story", "jengiz-khan-origin", "The Origin and Progress of Jengiz Khan", "central_asia", ["jengiz", "chingiz", "tartar"]),
    # Ch XIV India arrival
    (14, "place", "multan-sind", "Multan and the Indus (Sinde)", "india", ["sinde", "multān", "sīvastān", "lahari"]),
    (14, "place", "delhi", "Delhi", "india", ["dehli", "delhi"]),
    (14, "story", "widow-burning", "Widow-Burning on the Road to Delhi", "india", ["widow", "burn", "sati", "suttee"]),
    # Ch XV history (summarize as story)
    (15, "story", "delhi-sultanate-history", "Abstract of the History of Hindustan and the Conquest of Delhi", "india", []),
    (15, "story", "gwalior-fortress", "The Fortress of Gwalior", "india", ["gwālior", "gwalior"]),
    # Ch XVI court
    (16, "story", "judge-of-delhi", "Ibn Battuta Appointed Judge of Delhi", "india", ["judge", "emperor", "queen", "office"]),
    (16, "story", "cruelties-of-the-sultan", "The Character and Cruelties of the Delhi Sultan", "india", ["cruel", "panegyric", "danger", "religious"]),
    # Ch XVII embassy / Malabar start
    (17, "story", "embassy-to-china-wreck", "Embassy to China and Capture by Hindus", "india", ["embassy", "china", "prisoner", "gold mine"]),
    (17, "place", "daulatabad", "Daulatabad (Dawlatabad)", "india", ["dawlatābād", "daulatabad", "mahratta"]),
    (17, "place", "malabar", "Malabar Coast", "india", ["malabar", "pepper", "hinaur", "goa", "kambāya"]),
    # Ch XVIII Calicut
    (18, "place", "calicut", "Calicut (Kalikut)", "india", ["kālikūt", "calicut", "junk"]),
    (18, "story", "chinese-junks-wreck", "Chinese Junks and the Wreck of the Embassy", "india", ["junk", "wreck", "embassy", "kawlam"]),
    # Ch XIX Maldives
    (19, "place", "maldives", "The Maldive Islands", "maritime_asia", ["maldive", "mulūk", "cowrie", "palm"]),
    (19, "story", "maldives-judge-marriages", "Judge, Three Marriages, and Flight from the Maldives", "maritime_asia", ["judge", "vizier", "wife", "divor"]),
    # Ch XX Ceylon
    (20, "place", "ceylon", "Ceylon (Sri Lanka)", "maritime_asia", ["ceylon", "battāla", "pearl", "ruby"]),
    (20, "story", "adams-peak", "Pilgrimage to Adam's Peak", "maritime_asia", ["adam", "peak", "foot", "pilgrim"]),
    # Ch XXI Coromandel / Bengal
    (21, "place", "coromandel", "Coromandel Coast", "india", ["coromandel", "fattan", "matarāh", "ghīāth"]),
    (21, "place", "bengal", "Bengal and the Blue River", "india", ["bengal", "kāmrū", "blue river", "barahnakār", "tebrīzī"]),
    # Ch XXII Sumatra
    (22, "place", "sumatra", "Sumatra", "maritime_asia", ["sumatra", "camphor", "clove", "frankincense"]),
    (22, "story", "tawalisi-queen", "The Land of Tawalisi and Its Warlike Queen", "maritime_asia", ["tawālīsī", "tawalisi", "queen", "women"]),
    # Ch XXIII China
    (23, "place", "zaitun", "Zaitun (Quanzhou)", "china", ["zaitūn", "zaitun", "porcelain"]),
    (23, "place", "hangzhou", "El Khansa (Hangzhou)", "china", ["khansā", "hangzhou", "el khansā"]),
    (23, "story", "paper-money-china", "Paper Money, Painters, and the Registry of Ships", "china", ["paper money", "painter", "registry", "revenue"]),
    # Ch XXIV return
    (24, "story", "homeward-voyage", "The Long Homeward Voyage to Fez", "west_asia", ["sumatra", "zafār", "hormuz", "damascus", "fez", "gibraltar"]),
    (24, "place", "andalusia", "Andalusia", "europe", ["andalūs", "gibraltar", "spain"]),
    # Ch XXV Mali
    (25, "place", "sijilmasa", "Sijilmasa", "north_africa", ["sigilmāsa", "sijilmasa"]),
    (25, "place", "mali", "The Mali Empire", "sub_saharan_africa", ["mālī", "mali", "abu-lātin"]),
    (25, "place", "timbuktu", "Timbuktu (Tambactu)", "sub_saharan_africa", ["tambactū", "timbuktu", "kawkaw", "nakda"]),
    (25, "story", "crossing-the-sahara", "Crossing the Great Desert to Mali", "sub_saharan_africa", ["desert", "thagārī", "tās-hāla", "hippopotam"]),
]


def by_chapter(chapters: list[dict]) -> dict[int, dict]:
    return {c["chapter"]: c for c in chapters}


def main() -> None:
    raw = load_raw("_ibn_battuta_chapters_raw.json")
    chapters = raw["chapters"]
    by_ch = by_chapter(chapters)

    places: list[dict] = []
    stories: list[dict] = []
    coverage: list[dict] = []
    used: set[str] = set()
    cited: set[str] = set()

    for chap_num, kind, id_hint, title, band, keywords in SPLITS:
        ch = by_ch.get(chap_num)
        if not ch:
            continue
        if keywords:
            body_src = paras_matching(ch["rawBody"], keywords, window=1)
            if len(body_src.split()) < 40:
                body_src = paras_matching(ch["rawBody"], keywords, window=2)
            if len(body_src.split()) < 30:
                # fall back to start of chapter for place-list chapters
                body_src = ch["rawBody"]
        else:
            body_src = ch["rawBody"]
        body = condense(body_src, max_words=360)
        eid = unique_id(slugify(id_hint), used)
        source = cite(ch["id"], {"chapter": chap_num, "chapterTitle": ch["chapterTitle"]})
        if kind == "place":
            entry = {
                "id": eid,
                "title": title,
                "band": band,
                "placeNames": [title.split("(")[0].strip()] + (
                    [title[title.find("(") + 1 : title.find(")")]] if "(" in title else []
                ),
                "body": body,
                "source": source,
            }
            places.append(entry)
        else:
            entry = {
                "id": eid,
                "title": title,
                "band": band,
                "body": body,
                "source": source,
            }
            stories.append(entry)
        coverage.append({"chapterId": ch["id"], "type": kind, "entryId": eid, "band": band})
        cited.add(ch["id"])

    # Ensure every chapter is cited: if a chapter had no split hit, add a whole-chapter entry
    for ch in chapters:
        if ch["id"] in cited:
            continue
        band = CHAPTER_BAND.get(ch["chapter"], "west_asia")
        title = ch["chapterTitle"]
        if len(title) > 80:
            title = title[:77] + "…"
        eid = unique_id(slugify(f"chapter-{ch['chapter']}"), used)
        body = condense(ch["rawBody"])
        places.append({
            "id": eid,
            "title": title,
            "band": band,
            "placeNames": [p.strip() for p in title.replace("—", ",").split(",") if p.strip()][:5],
            "body": body,
            "source": cite(ch["id"], {"chapter": ch["chapter"], "chapterTitle": ch["chapterTitle"]}),
        })
        coverage.append({"chapterId": ch["id"], "type": "place", "entryId": eid, "band": band})
        cited.add(ch["id"])

    # Soft-anchor stories to places by shared tokens
    place_tokens = []
    for p in places:
        for n in p.get("placeNames", []) + [p["id"]]:
            tok = slugify(n)
            if len(tok) >= 4:
                place_tokens.append((tok, p["id"]))
    place_tokens.sort(key=lambda x: len(x[0]), reverse=True)
    for s in stories:
        hay = slugify(s["title"])
        for tok, pid in place_tokens:
            if tok in hay or tok in slugify(s.get("body", "")[:200]):
                s["anchorPlace"] = pid
                break

    missing = [c["id"] for c in chapters if c["id"] not in cited]
    write_lore(
        OUT,
        title="Ibn Battuta Travels — Place & Story Lore",
        source="Samuel Lee (1829) abridgement of Tuhfat al-nuzzar",
        bands=BANDS,
        places=places,
        stories=stories,
        coverage=coverage,
        chapter_count=len(chapters),
        missing=missing,
    )


if __name__ == "__main__":
    main()
