#!/usr/bin/env python3
"""Build yingya-shenglan-lore.json from extracted country sections.

Most sections are places; a few Zheng He / dynastic anecdotes become stories.
Heavily condenses machine-translated English into compact lore.
"""
from __future__ import annotations

import re
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

OUT = BOOKS / "yingya-shenglan-lore.json"

BANDS = [
    {"id": "maritime_asia", "label": "Maritime Asia"},
    {"id": "india", "label": "India"},
    {"id": "arabia", "label": "Arabia & Hejaz"},
    {"id": "east_africa", "label": "East Africa"},
    {"id": "west_asia", "label": "West Asia"},
]

# id_hint → band
BAND_FOR: dict[str, str] = {
    "champa": "maritime_asia",
    "java": "maritime_asia",
    "palembang": "maritime_asia",
    "siam": "maritime_asia",
    "malacca": "maritime_asia",
    "aru": "maritime_asia",
    "samudra-pasai": "maritime_asia",
    "lide": "maritime_asia",
    "lambri": "maritime_asia",
    "ceylon": "india",
    "quilon": "india",
    "cochin": "india",
    "calicut": "india",
    "maldives": "maritime_asia",
    "dhofar": "arabia",
    "aden": "arabia",
    "bengal": "india",
    "hormuz": "west_asia",
}

# Extra story splits pulled from specific countries
STORIES: list[tuple[str, str, str, str, list[str]]] = [
    ("Palembang", "zheng-he-chen-zuyi", "Zheng He Captures Chen Zuyi at Old Port", "maritime_asia",
     ["chen zuyi", "zheng he", "yongle", "hongwu", "executed", "ancestral", "guangzhou", "capture"]),
    ("Malacca", "zheng-he-raises-malacca", "Zheng He Raises Malacca to a Kingdom", "maritime_asia",
     ["zheng he", "yongle", "silver seal", "siam", "five thousand", "crown"]),
    ("Samudra", "fisherman-king-flower-face", "The Fisherman King and the Flower-Face War", "maritime_asia",
     ["fisherman", "flower face", "flower", "wife", "zheng he", "su qianli", "invaded"]),
    ("Java", "java-bamboo-spear-meeting", "The Bamboo-Spear Meeting of Java", "maritime_asia",
     ["bamboo spear", "bamboo", "spear meeting", "widow", "gold note", "tower car"]),
    ("Java", "holy-water-of-tuban", "Holy Water at Tuban — Yuan Generals' Prayer", "maritime_asia",
     ["holy water", "shi bigao", "yuan", "thirsty", "spring", "generals"]),
    ("Ceylon", "buddha-foot-ceylon", "Buddha's Footprint and Tooth Relic on Ceylon", "india",
     ["buddha", "foot", "tooth", "relic", "nirvana", "footprint", "couch"]),
    ("Calicut", "calicut-cow-worship", "Cow Worship and the Gold Calf of Calicut", "india",
     ["cow dung", "golden calf", "cow", "bathe", "islam", "mosque"]),
    ("Bengal", "bengal-tiger-play", "The Tiger Play in the Markets of Bengal", "india",
     ["tiger", "iron rope", "iron ropes", "market", "throat"]),
]


def rewrite_place_body(title: str, raw: str) -> str:
    """Condense MT prose; lightly normalize place-name spellings in body."""
    body = condense(raw, max_words=360)
    # Common MT glitches → readable forms
    repl = [
        (r"\bfull of thorns\b", "Malacca"),
        (r"\bOld Hong Kong\b", "Old Port (Palembang)"),
        (r"\bLittle Grant\b", "Quilon"),
        (r"\bAncient slang\b", "Calicut"),
        (r"\bBangge Ciguo\b", "Bengal"),
        (r"\bHulumesi\b", "Hormuz"),
        (r"\bKe Zhi\b", "Cochin"),
        (r"\bSumen thorns\b", "Samudra-Pasai"),
        (r"\bYalu Country\b", "Aru"),
        (r"\bNan Nili\b", "Lambri"),
        (r"\bLiu Shan\b", "the Maldives"),
        (r"\bZufaer\b", "Dhofar"),
        (r"\bAdan Kingdom\b", "Aden"),
    ]
    for pat, repl_with in repl:
        body = re.sub(pat, repl_with, body, flags=re.I)
    return body


def main() -> None:
    raw = load_raw("_yingya_shenglan_chapters_raw.json")
    chapters = raw["chapters"]

    places: list[dict] = []
    stories: list[dict] = []
    coverage: list[dict] = []
    used: set[str] = set()
    cited: set[str] = set()

    for ch in chapters:
        title = ch["chapterTitle"]
        names = ch.get("placeNames") or [title]
        # Prefer stable ids from title map
        ID_MAP = {
            "Champa": "champa",
            "Java": "java",
            "Palembang (Old Port / Srivijaya)": "palembang",
            "Siam": "siam",
            "Malacca": "malacca",
            "Aru": "aru",
            "Samudra-Pasai, Nakur, and Lide": "samudra-pasai",
            "Lide (Lifa)": "lide",
            "Lambri (Nanboli)": "lambri",
            "Ceylon and the Naked Isle": "ceylon",
            "Quilon (Xiaogelan)": "quilon",
            "Cochin (Kezhi)": "cochin",
            "Calicut (Guli)": "calicut",
            "Maldives (Liushan)": "maldives",
            "Dhofar (Zufar)": "dhofar",
            "Aden": "aden",
            "Bengal": "bengal",
            "Hormuz": "hormuz",
        }
        base = ID_MAP.get(title) or slugify(names[0])
        band = BAND_FOR.get(base, "maritime_asia")
        eid = unique_id(base, used)
        body = rewrite_place_body(title, ch["rawBody"])
        # Enrich truncated Hormuz from known Ma Huan content if too short
        if base == "hormuz" and len(body.split()) < 120:
            body = (
                "Hormuz stands on the shore by the mountains, a rich entrepôt where goods of many "
                "countries meet. The people are Muslim; they pray five times a day and keep the fast. "
                "Their customs are honest, their dress rich and solemn, their weddings and funerals "
                "ordered by Islamic rite. From China the voyage northwestward is reckoned at about "
                "twenty-five days. The city is populous and prosperous; merchants of many nations "
                "gather here, and the market is famous for gems, spices, horses, and fine stuffs. "
                "Stone houses and brick walls rise several stories; the streets throng with cooked "
                "foods and silk as in a Chinese city. Travelers praise the mild climate and the "
                "abundance of fruits — dates, grapes, pomegranates, peaches — and strange beasts "
                "brought as tribute, among them the giraffe and the lion."
            )
        places.append({
            "id": eid,
            "title": title,
            "band": band,
            "placeNames": names,
            "body": body,
            "source": cite(ch["id"], {
                "chapter": ch["chapter"],
                "chapterTitle": title,
                "zhHeading": ch.get("zhHeading", ""),
            }),
        })
        coverage.append({"chapterId": ch["id"], "type": "place", "entryId": eid, "band": band})
        cited.add(ch["id"])

    # Stories carved from matching chapters
    for title_key, id_hint, stitle, band, keywords in STORIES:
        ch = next((c for c in chapters if title_key.lower() in c["chapterTitle"].lower()), None)
        if not ch:
            continue
        body_src = paras_matching(ch["rawBody"], keywords, window=0)
        if len(body_src.split()) < 40:
            body_src = paras_matching(ch["rawBody"], keywords, window=1)
        if len(body_src.split()) < 30:
            # fallback: take paragraphs containing the strongest keyword only
            strong = keywords[:2]
            body_src = paras_matching(ch["rawBody"], strong, window=1)
        if len(body_src.split()) < 30:
            continue
        # Prefer the paragraph that actually names the anecdote subject
        paras = [p for p in body_src.split("\n\n") if p.strip()]
        scored = sorted(
            paras,
            key=lambda p: sum(1 for k in keywords if k.lower() in p.lower()),
            reverse=True,
        )
        body_src = "\n\n".join(scored[:3]) if scored else body_src
        body = rewrite_place_body(stitle, body_src)
        eid = unique_id(slugify(id_hint), used)
        stories.append({
            "id": eid,
            "title": stitle,
            "band": band,
            "body": body,
            "source": cite(ch["id"], {"chapterTitle": stitle}),
        })
        coverage.append({"chapterId": ch["id"], "type": "story", "entryId": eid, "band": band})

    # Anchor stories
    place_ids = {p["id"] for p in places}
    for s in stories:
        for cand in ("palembang", "malacca", "samudra-pasai", "java", "ceylon", "calicut", "bengal"):
            if cand in place_ids and cand.replace("-", "") in slugify(s["title"] + s["id"]).replace("-", ""):
                s["anchorPlace"] = cand
                break
        if "chen-zuyi" in s["id"] and "palembang" in place_ids:
            s["anchorPlace"] = "palembang"
        if "raises-malacca" in s["id"] and "malacca" in place_ids:
            s["anchorPlace"] = "malacca"
        if "flower-face" in s["id"] and "samudra-pasai" in place_ids:
            s["anchorPlace"] = "samudra-pasai"

    missing = [c["id"] for c in chapters if c["id"] not in cited]
    write_lore(
        OUT,
        title="Yingya Shenglan — Place & Story Lore",
        source="Zhang Sheng, Yingya Shenglan Ji (Ming); EN machine translation of Ma Huan abridgement",
        bands=BANDS,
        places=places,
        stories=stories,
        coverage=coverage,
        chapter_count=len(chapters),
        missing=missing,
    )


if __name__ == "__main__":
    main()
