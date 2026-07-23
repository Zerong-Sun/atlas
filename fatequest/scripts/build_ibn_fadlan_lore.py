#!/usr/bin/env python3
"""Build ibn-fadlan-lore.json from extracted sections.

Merges fine subsection headings into game-ready place/story entries.
Every raw section id is cited in coverage (possibly via merge groups).
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from travel_lore_lib import (  # noqa: E402
    BOOKS,
    cite,
    condense,
    load_raw,
    slugify,
    unique_id,
    write_lore,
)

OUT = BOOKS / "ibn-fadlan-lore.json"

BANDS = [
    {"id": "west_asia", "label": "West Asia"},
    {"id": "central_asia", "label": "Central Asia"},
    {"id": "steppe", "label": "Steppe & Far North"},
    {"id": "northern_europe", "label": "Northern Europe"},
    {"id": "europe", "label": "Europe"},
]

# Merge groups for Parts I–II: (kind, id_hint, title, band, section_id_list)
# Section ids are fadlan-p1-NNN / fadlan-p2-NNN as emitted by the extractor.
P12_GROUPS: list[tuple[str, str, str, str, list[str]]] = [
    # Part I — journey west→east
    ("story", "mission-from-baghdad", "The Caliph's Mission to the King of the Saqaliba", "west_asia",
     [f"fadlan-p1-{n:03d}" for n in range(1, 4)]),
    ("place", "bukhara", "Bukhara", "central_asia",
     ["fadlan-p1-004", "fadlan-p1-005"]),
    ("place", "khwarazm", "Khwarazm", "central_asia",
     ["fadlan-p1-006", "fadlan-p1-007"]),
    ("story", "cold-of-hell", "The Cold of Hell on the Jayhun", "central_asia",
     [f"fadlan-p1-{n:03d}" for n in range(8, 13)]),
    ("story", "caravan-to-the-turks", "The Caravan into the Land of the Turks", "steppe",
     ["fadlan-p1-013", "fadlan-p1-014"]),
    ("place", "ghuzz-turks", "The Ghuzz Turks", "steppe",
     [f"fadlan-p1-{n:03d}" for n in range(15, 35)]),
    ("place", "pechenegs", "The Pechenegs (Bajanak)", "steppe",
     ["fadlan-p1-035", "fadlan-p1-036"]),
    ("place", "bashkirs", "The Bashkirs (Bashghirds)", "steppe",
     [f"fadlan-p1-{n:03d}" for n in range(37, 42)]),
    ("place", "volga-bulghars", "The Volga Bulghars (Saqaliba)", "steppe",
     [f"fadlan-p1-{n:03d}" for n in range(42, 82)]),
    ("story", "northern-lights-white-nights", "Northern Lights and the White Nights", "steppe",
     ["fadlan-p1-050", "fadlan-p1-051"]),
    ("story", "gog-magog-giant", "A Giant, and Tales of Gog and Magog", "steppe",
     ["fadlan-p1-072", "fadlan-p1-073"]),
    ("place", "rus-vikings", "The Rus (Vikings) on the Volga", "steppe",
     [f"fadlan-p1-{n:03d}" for n in range(82, 101)]),
    ("story", "rus-ship-burial", "The Ship Burial and the Angel of Death", "steppe",
     [f"fadlan-p1-{n:03d}" for n in range(90, 100)]),
    ("place", "khazars", "The Khazars", "steppe",
     [f"fadlan-p1-{n:03d}" for n in range(101, 107)]),
    # Part II — Abu Hamid
    ("story", "abu-hamid-caspian", "Abu Hamid among the Caspian Islands", "steppe",
     [f"fadlan-p2-{n:03d}" for n in range(107, 111)]),
    ("place", "saqsin", "Saqsin", "steppe",
     [f"fadlan-p2-{n:03d}" for n in range(111, 119)]),
    ("place", "bulghar-abu-hamid", "Bulghar in Abu Hamid's Day", "steppe",
     [f"fadlan-p2-{n:03d}" for n in range(119, 125)]),
    ("story", "beavers-and-mammoths", "Beavers, Mammoth Ivory, and the Bones of Ad", "steppe",
     ["fadlan-p2-122", "fadlan-p2-123", "fadlan-p2-125"]),
    ("story", "sea-of-darkness", "The Sea of Darkness, Silent Barter, and Skis", "steppe",
     [f"fadlan-p2-{n:03d}" for n in range(126, 136)]),
    ("place", "saqaliba-lands", "The Lands of the Saqaliba", "northern_europe",
     [f"fadlan-p2-{n:03d}" for n in range(136, 147)]),
    ("place", "hungary", "Hungary under Geza II", "northern_europe",
     [f"fadlan-p2-{n:03d}" for n in range(147, 163)]),
    ("story", "giants-of-iram", "Giants, Iram, and the Enchanted Mosque", "central_asia",
     ["fadlan-p2-160", "fadlan-p2-161", "fadlan-p2-167"]),
    ("story", "abu-hamid-return", "Abu Hamid's Return via Khwarazm to Baghdad", "central_asia",
     [f"fadlan-p2-{n:03d}" for n in range(163, 170)]),
]

# Part III: classify each excerpt 1–43
P3_META: dict[int, tuple[str, str, str, str]] = {
    # num: (kind, id_hint, title, band)
    1: ("story", "alexander-in-china", "Qudama on Alexander in China", "central_asia"),
    2: ("story", "sallam-alexanders-wall", "Sallam the Interpreter and Alexander's Wall", "central_asia"),
    3: ("story", "viking-sack-of-seville", "Viking Attack on Seville (844)", "europe"),
    4: ("story", "zuhri-viking-ships", "Zuhri on Viking Ships", "europe"),
    5: ("story", "radhaniya-routes", "Routes of the Radhaniya and the Rus", "west_asia"),
    6: ("story", "ibn-al-faqih-radhaniya", "Ibn al-Faqih on the Radhaniya", "west_asia"),
    7: ("story", "mediterranean-exports", "Exports from the Western Mediterranean", "europe"),
    8: ("place", "khazars-ibn-rusta", "Ibn Rusta on the Khazars", "steppe"),
    9: ("place", "burtas", "Ibn Rusta on the Burtas", "steppe"),
    10: ("place", "bulgars-ibn-rusta", "Ibn Rusta on the Bulgars", "steppe"),
    11: ("place", "magyars-ibn-rusta", "Ibn Rusta on the Magyars", "northern_europe"),
    12: ("place", "saqaliba-ibn-rusta", "Ibn Rusta on the Saqaliba", "northern_europe"),
    13: ("place", "rus-ibn-rusta", "Ibn Rusta on the Rus", "steppe"),
    14: ("place", "iron-gates", "Masudi on the Iron Gates", "west_asia"),
    15: ("place", "khazar-capital", "Masudi on the Khazar Capital", "steppe"),
    16: ("place", "khazars-masudi", "Masudi on the Khazars", "steppe"),
    17: ("story", "khazar-khaqan", "Masudi on the Khazar Khaqan", "steppe"),
    18: ("place", "bulghars-masudi", "Masudi on the Bulghars", "steppe"),
    19: ("story", "midnight-sun", "Masudi on the Land of the Midnight Sun", "steppe"),
    20: ("place", "saqaliba-masudi", "Masudi on the Saqaliba", "northern_europe"),
    21: ("place", "rus-masudi", "Masudi on the Rus", "steppe"),
    22: ("story", "viking-raid-caspian", "Viking Raid on the Caspian", "steppe"),
    23: ("story", "rus-raid-bardhaa", "Rus Raid on Bardha'a", "west_asia"),
    24: ("place", "khazars-istakhri", "Istakhri on the Khazars and Their Neighbours", "steppe"),
    25: ("story", "fur-trade-masudi", "Masudi on the Fur Trade", "steppe"),
    26: ("place", "northern-europe-ibrahim", "Ibrahim ibn Yaqub on Northern Europe", "northern_europe"),
    27: ("story", "exports-from-bulghar", "Muqaddasi on Exports from Bulghar", "steppe"),
    28: ("place", "khazar-land-muqaddasi", "Muqaddasi on the Land of the Khazars", "steppe"),
    29: ("story", "trade-in-eunuchs", "Ibn Hawqal on the Trade in Eunuchs", "west_asia"),
    30: ("story", "rus-attack-itil", "Ibn Hawqal on the Fur Trade and Rus Attack on Itil", "steppe"),
    31: ("place", "khwarazm-trade", "Ibn Hawqal on Khwarazm and Its Trade", "central_asia"),
    32: ("story", "destruction-of-itil", "Ibn Hawqal on the Rus Destruction of Itil", "steppe"),
    33: ("story", "dog-sleds-silent-barter", "Biruni on Dog Sleds, Skates and Silent Barter", "steppe"),
    34: ("story", "enclosed-nations", "The Enclosed Nations of the Far North", "steppe"),
    35: ("place", "rus-marwazi", "Marwazi on the Rus", "steppe"),
    36: ("place", "bulghar-marwazi", "Marwazi on Bulghar and the Far North", "steppe"),
    37: ("place", "saqaliba-marwazi", "Marwazi on the Saqaliba", "northern_europe"),
    38: ("place", "hungary-yaqut", "Yaqut on Hungary", "northern_europe"),
    39: ("story", "gog-magog-qazwini", "Qazwini on Gog and Magog", "steppe"),
    40: ("story", "marco-polo-darkness", "Marco Polo on Dog Sleds and the Land of Darkness", "steppe"),
    41: ("story", "battuta-land-of-darkness", "Ibn Battuta on Travel in the Land of Darkness", "steppe"),
    42: ("story", "battuta-new-sarai", "Ibn Battuta's Winter Journey to New Sarai", "steppe"),
    43: ("story", "siberia-alexanders-tower", "Al-Umari on Siberia and Alexander's Tower", "steppe"),
}


def main() -> None:
    raw = load_raw("_ibn_fadlan_chapters_raw.json")
    chapters = {c["id"]: c for c in raw["chapters"]}

    places: list[dict] = []
    stories: list[dict] = []
    coverage: list[dict] = []
    used: set[str] = set()
    cited: set[str] = set()

    def emit(kind: str, id_hint: str, title: str, band: str, ids: list[str]) -> None:
        bodies = []
        present = []
        for cid in ids:
            ch = chapters.get(cid)
            if not ch:
                continue
            present.append(cid)
            bodies.append(ch["rawBody"])
        if not present:
            return
        body = condense("\n\n".join(bodies), max_words=380)
        eid = unique_id(slugify(id_hint), used)
        source = cite(present, {"chapterTitle": title})
        if kind == "place":
            places.append({
                "id": eid,
                "title": title,
                "band": band,
                "placeNames": [title.split("(")[0].strip()],
                "body": body,
                "source": source,
            })
        else:
            stories.append({
                "id": eid,
                "title": title,
                "band": band,
                "body": body,
                "source": source,
            })
        for cid in present:
            coverage.append({"chapterId": cid, "type": kind, "entryId": eid, "band": band})
            cited.add(cid)

    for kind, id_hint, title, band, ids in P12_GROUPS:
        emit(kind, id_hint, title, band, ids)

    # Part III one-to-one (with optional tiny merges already handled above)
    for ch in raw["chapters"]:
        if ch["part"] != 3:
            continue
        if ch["id"] in cited:
            continue
        num = ch["section"]
        meta = P3_META.get(num)
        if not meta:
            kind, id_hint, title, band = "story", f"excerpt-{num}", ch["chapterTitle"], "steppe"
        else:
            kind, id_hint, title, band = meta
        emit(kind, id_hint, title, band, [ch["id"]])

    # Orphan Part I/II sections not in any group
    for ch in raw["chapters"]:
        if ch["id"] in cited:
            continue
        if ch["part"] == 3:
            continue
        band = "steppe" if ch["part"] in (1, 2) else "steppe"
        title = ch["chapterTitle"]
        kind = "story"
        # place-like titles
        if any(title.lower().startswith(p) for p in (
            "bukh", "khw", "saqs", "bulgh", "hungar", "ghuzz", "khazar", "the rus",
        )):
            kind = "place"
        emit(kind, slugify(title), title, band, [ch["id"]])

    # Anchors
    place_ids = {p["id"] for p in places}
    for s in stories:
        for cand in ("rus-vikings", "volga-bulghars", "khazars", "hungary", "saqsin", "bukhara"):
            if cand in place_ids and cand.replace("-", "") in slugify(s["title"]).replace("-", ""):
                s["anchorPlace"] = cand
                break
        if "ship-burial" in s["id"] or "angel" in s["id"]:
            if "rus-vikings" in place_ids:
                s["anchorPlace"] = "rus-vikings"

    missing = [c["id"] for c in raw["chapters"] if c["id"] not in cited]
    write_lore(
        OUT,
        title="Ibn Fadlan and the Land of Darkness — Place & Story Lore",
        source="Paul Lunde & Caroline Stone (Penguin, 2012)",
        bands=BANDS,
        places=places,
        stories=stories,
        coverage=coverage,
        chapter_count=len(raw["chapters"]),
        missing=missing,
    )


if __name__ == "__main__":
    main()
