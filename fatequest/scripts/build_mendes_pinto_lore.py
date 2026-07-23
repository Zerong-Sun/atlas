#!/usr/bin/env python3
"""Build mendes-pinto-lore.json from extracted episodes."""
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

OUT = BOOKS / "mendes-pinto-lore.json"

BANDS = [
    {"id": "europe", "label": "Europe"},
    {"id": "india", "label": "India"},
    {"id": "maritime_asia", "label": "Maritime Asia"},
    {"id": "china", "label": "China"},
]

# (chapter_nums | list, kind, id_hint, title, band, keywords|None)
ENTRIES: list[tuple] = [
    (0, "story", "prologue-embarkation", "Prologue — Captive Seventeen Times Sold", "europe", None),
    (0, "place", "portugal-india-embarkation", "From Portugal to India", "europe",
     ["portugal", "india", "embark", "youth", "kingdom"]),
    (1, "story", "battle-coja-acem", "Battle with the Corsair Coja Acem", "china",
     ["coja", "acém", "acem", "junk", "lorcha", "artillery", "santiago"]),
    (1, "place", "china-coast-river", "A Pirate River on the China Coast", "china",
     ["river", "enemies", "thieves", "island", "junk"]),
    (1, "story", "diogo-meireles-camel", "Diogo Meireles Fires the Camel Gun", "china",
     ["diogo", "meireles", "camel", "constable", "pillory"]),
    (2, "place", "tintau-river", "The Tintau (Tinlau) River", "china",
     ["tintau", "tinlau", "river", "twenty-four"]),
    (2, "place", "liampo", "Liampó (Ningbo)", "china",
     ["liampó", "liampo", "ningbo", "port"]),
    (2, "story", "storm-to-liampo", "Storm on the Way from Tintau to Liampó", "china",
     ["storm", "shower", "sea", "rowing", "junk"]),
    (3, "story", "after-the-storm", "After the Storm — Captives and Counsel", "china",
     ["storm", "captive", "chinese", "christian", "letter"]),
    (4, "place", "nouday", "Nouday", "china",
     ["nouday", "mandarin"]),
    (4, "story", "letter-to-mandarin", "Letter to the Mandarin of Nouday", "china",
     ["mandarin", "letter", "petition", "captive", "brother of the king", "flogged", "ears"]),
    (5, "story", "raid-on-nouday", "Raid up the River against Nouday", "china",
     ["junk", "river", "mandarin", "door", "embark", "reed"]),
    (5, "story", "corsair-prize", "The Corsair's Prize of Cruzados", "china",
     ["cruzado", "corsair", "junk", "islands", "taborda"]),
]


def main() -> None:
    raw = load_raw("_mendes_pinto_chapters_raw.json")
    by_ch = {c["chapter"]: c for c in raw["chapters"]}

    places: list[dict] = []
    stories: list[dict] = []
    coverage: list[dict] = []
    used: set[str] = set()
    cited: set[str] = set()

    for spec in ENTRIES:
        sec, kind, id_hint, title, band, keywords = spec
        secs = [sec] if isinstance(sec, int) else list(sec)
        chs = [by_ch[s] for s in secs if s in by_ch]
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
        body = condense(body_src, max_words=360)
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

    for c in raw["chapters"]:
        if c["id"] in cited:
            continue
        eid = unique_id(slugify(c["chapterTitle"]), used)
        stories.append({
            "id": eid,
            "title": c["chapterTitle"][:80],
            "band": "china",
            "body": condense(c["rawBody"]),
            "source": cite(c["id"], {"chapterTitle": c["chapterTitle"]}),
        })
        coverage.append({"chapterId": c["id"], "type": "story", "entryId": eid, "band": "china"})
        cited.add(c["id"])

    for s in stories:
        for pid in ("liampo", "nouday", "tintau-river", "china-coast-river"):
            if pid in {p["id"] for p in places} and any(
                tok in slugify(s["title"]) for tok in pid.split("-") if len(tok) > 3
            ):
                s["anchorPlace"] = pid
                break
        if "mandarin" in s["id"] or "nouday" in s["id"] or "raid-on-nouday" in s["id"]:
            if any(p["id"] == "nouday" for p in places):
                s["anchorPlace"] = "nouday"
        if "liampo" in s["id"] or "storm-to-liampo" in s["id"]:
            if any(p["id"] == "liampo" for p in places):
                s["anchorPlace"] = "liampo"

    missing = [c["id"] for c in raw["chapters"] if c["id"] not in cited]
    write_lore(
        OUT,
        title="Fernão Mendes Pinto — Place & Story Lore",
        source="Peregrinação EN excerpt (Cosmópolis / Menéres illustrated selection; MT from Portuguese)",
        bands=BANDS,
        places=places,
        stories=stories,
        coverage=coverage,
        chapter_count=len(raw["chapters"]),
        missing=missing,
    )


if __name__ == "__main__":
    main()
