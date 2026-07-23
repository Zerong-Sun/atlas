#!/usr/bin/env python3
"""Build ibn-jubayr-lore.json from extracted monthly records."""
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

OUT = BOOKS / "ibn-jubayr-lore.json"

BANDS = [
    {"id": "europe", "label": "Europe"},
    {"id": "north_africa", "label": "North Africa"},
    {"id": "egypt", "label": "Egypt & Nile"},
    {"id": "arabia", "label": "Arabia & Hejaz"},
    {"id": "levant", "label": "Levant"},
    {"id": "west_asia", "label": "West Asia"},
]

# (section_index or list, kind, id_hint, title, band, keywords|None)
# section index matches jubayr-mNNN from extractor (0=Chronicle, 1=Dhu Hijjah 578, …)
ENTRIES: list[tuple] = [
    # Opening sea voyage Granada → Alexandria
    (0, "story", "granada-to-alexandria", "Sea Voyage from Granada to Alexandria", "europe",
     ["granada", "sardinia", "sicily", "crete", "alexandria", "genoe"]),
    (0, "place", "granada", "Granada", "europe", ["granada"]),
    # Egypt
    (1, "place", "alexandria", "Alexandria", "egypt",
     ["alexandria", "lighthouse", "pharos", "customs"]),
    (1, "story", "saladin-welfare", "Saladin's Colleges, Hospitals, and Bread for Strangers", "egypt",
     ["salah al-din", "saladin", "college", "hospital", "loaves", "zakat"]),
    (1, "place", "cairo-misr", "Cairo and Misr", "egypt",
     ["cairo", "misr", "nile", "pyramid"]),
    (2, "place", "upper-egypt-qus", "Upper Egypt to Qus", "egypt",
     ["qus", "usyut", "ikhmim", "qina", "nile"]),
    (3, "story", "eastern-desert-caravan", "The Eastern Desert Caravan to the Red Sea", "egypt",
     ["hajir", "desert", "dinqash", "aydhab", "aydhāb"]),
    (4, "place", "aydhab", "Aydhab and the Red Sea Crossing", "egypt",
     ["aydhab", "aydhāb", "red sea", "jiddah"]),
    (5, "place", "jiddah", "Jiddah", "arabia", ["jiddah", "judda", "jedda"]),
    # Mecca months 6–13 (indices 6..13) — merge
    (list(range(6, 14)), "place", "mecca", "Mecca", "arabia",
     ["mecca", "kaaba", "ka'bah", "haram", "zamzam", "mina"]),
    (list(range(6, 14)), "story", "hajj-rites", "The Hajj Rites at Mecca", "arabia",
     ["hajj", "ihram", "tawaf", "sa'y", "arafat", "mina", "sacrifice"]),
    (list(range(6, 12)), "story", "ramadan-in-mecca", "Ramadan and the Sacred Months in Mecca", "arabia",
     ["ramadan", "fast", "tarawih", "shawwal"]),
    # Medina
    (14, "place", "medina", "Medina", "arabia",
     ["medina", "prophet", "mosque", "quba", "tomb"]),
    (14, "story", "desert-to-iraq", "The Pilgrim Caravan from Medina toward Iraq", "arabia",
     ["fayd", "desert", "caravan", "kufah", "najaf"]),
    # Iraq
    (15, "place", "kufah-najaf", "Kufah and Najaf", "west_asia",
     ["kufah", "najaf", "hillah", "euphrates"]),
    (15, "place", "baghdad", "Baghdad", "west_asia",
     ["baghdad", "nasir", "tigris", "madrasa", "preacher"]),
    (15, "place", "samarra-mosul", "Samarra, Takrit, and Mosul", "west_asia",
     ["samarra", "takrit", "mosul"]),
    (15, "story", "palace-of-chosroes", "The Palace of Chosroes at al-Mada'in", "west_asia",
     ["chosroes", "mada'in", "mada’in", "palace", "arch"]),
    # Syria
    (16, "place", "nisibis-harran", "Nisibis, Dunaysar, and Harran", "west_asia",
     ["nisibin", "nisibis", "dunaysar", "harran", "ras al"]),
    (16, "place", "aleppo", "Aleppo", "west_asia",
     ["aleppo", "halab", "citadel", "manbij", "harran"]),
    (16, "place", "hamah-hims", "Hamah and Hims (Emessa)", "west_asia",
     ["hamah", "hims", "emessa"]),
    ([16, 17, 18], "place", "damascus", "Damascus", "west_asia",
     ["damascus", "umayyad", "mosque", "barada"]),
    (17, "story", "umayyad-mosque", "The Umayyad Mosque of Damascus", "west_asia",
     ["umayyad", "mosque", "mihrab", "minaret"]),
    # Crusader coast
    (19, "place", "acre", "Acre", "levant",
     ["acre", "akka", "akkar"]),
    (19, "place", "tyre", "Tyre (Sur)", "levant",
     ["tyre", "sur", "tyros"]),
    (19, "story", "crusader-frontier", "Crossing the Crusader Frontier", "levant",
     ["banyas", "tibnin", "frank", "christian", "acre"]),
    # Mediterranean return
    (20, "story", "mediterranean-departure", "Departure from Acre into the Mediterranean", "levant",
     ["acre", "sea", "ship", "genoe"]),
    (21, "story", "storm-toward-sicily", "Storms off Crete toward Sicily", "europe",
     ["crete", "sicily", "storm", "archipelago"]),
    # Sicily
    (22, "place", "messina", "Messina", "europe", ["messina"]),
    (22, "place", "palermo", "Palermo", "europe",
     ["palermo", "norman", "william", "court"]),
    (22, "story", "straits-of-messina", "Through the Straits of Messina", "europe",
     ["messina", "strait", "calabria", "current"]),
    (22, "story", "norman-sicily-muslims", "Muslims under Norman Rule in Sicily", "europe",
     ["muslim", "norman", "king", "church", "mosque", "secret"]),
    (22, "place", "cefalu-termini", "Cefalu and Termini", "europe",
     ["cefalu", "termini", "solanto"]),
    ([23, 24, 25], "place", "trapani", "Trapani", "europe",
     ["trapani", "favignana"]),
    ([23, 24], "story", "waiting-at-trapani", "Waiting at Trapani for a Ship Home", "europe",
     ["trapani", "ship", "sail", "wait"]),
    # Return Spain
    (26, "story", "return-to-granada", "Return by Sea to Granada", "europe",
     ["iviza", "denia", "cartagena", "murcia", "granada", "guadix"]),
]


def resolve_ids(sec, chapters_by_sec: dict[int, dict]) -> list[dict]:
    if isinstance(sec, int):
        secs = [sec]
    else:
        secs = list(sec)
    out = []
    for s in secs:
        ch = chapters_by_sec.get(s)
        if ch:
            out.append(ch)
    return out


def main() -> None:
    raw = load_raw("_ibn_jubayr_chapters_raw.json")
    chapters_by_sec = {c["section"]: c for c in raw["chapters"]}
    all_ids = {c["id"] for c in raw["chapters"]}

    places: list[dict] = []
    stories: list[dict] = []
    coverage: list[dict] = []
    used: set[str] = set()
    cited: set[str] = set()

    for spec in ENTRIES:
        sec, kind, id_hint, title, band, keywords = spec
        chs = resolve_ids(sec, chapters_by_sec)
        if not chs:
            continue
        combined = "\n\n".join(c["rawBody"] for c in chs)
        if keywords:
            body_src = paras_matching(combined, keywords, window=1)
            if len(body_src.split()) < 50:
                body_src = paras_matching(combined, keywords, window=2)
            if len(body_src.split()) < 40:
                body_src = combined
        else:
            body_src = combined
        body = condense(body_src, max_words=380)
        eid = unique_id(slugify(id_hint), used)
        ids = [c["id"] for c in chs]
        source = cite(ids, {"chapterTitle": title})
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
        for c in chs:
            coverage.append({"chapterId": c["id"], "type": kind, "entryId": eid, "band": band})
            cited.add(c["id"])

    # Orphans → whole-section place/story
    for c in raw["chapters"]:
        if c["id"] in cited:
            continue
        band = "arabia"
        title = c["chapterTitle"]
        eid = unique_id(slugify(title), used)
        places.append({
            "id": eid,
            "title": title,
            "band": band,
            "placeNames": [title],
            "body": condense(c["rawBody"]),
            "source": cite(c["id"], {"chapterTitle": title}),
        })
        coverage.append({"chapterId": c["id"], "type": "place", "entryId": eid, "band": band})
        cited.add(c["id"])

    for s in stories:
        for p in places:
            if slugify(p["id"]) in slugify(s["title"]) or p["id"] in slugify(s["title"]):
                s["anchorPlace"] = p["id"]
                break
        if "hajj" in s["id"] or "ramadan-in-mecca" in s["id"]:
            s["anchorPlace"] = "mecca" if any(p["id"] == "mecca" for p in places) else s.get("anchorPlace")
        if "umayyad" in s["id"]:
            s["anchorPlace"] = "damascus" if any(p["id"] == "damascus" for p in places) else s.get("anchorPlace")
        if "norman" in s["id"]:
            s["anchorPlace"] = "palermo" if any(p["id"] == "palermo" for p in places) else s.get("anchorPlace")

    missing = sorted(all_ids - cited)
    write_lore(
        OUT,
        title="Ibn Jubayr Travels — Place & Story Lore",
        source="R. J. C. Broadhurst (1952 / Bloomsbury 2020)",
        bands=BANDS,
        places=places,
        stories=stories,
        coverage=coverage,
        chapter_count=len(raw["chapters"]),
        missing=missing,
    )


if __name__ == "__main__":
    main()
