#!/usr/bin/env python3
"""Build marco-polo-lore.json from extracted chapters.

Classifies each chapter as place or story lore, assigns a coarse band,
condenses cleaned Yule prose to game length, and writes coverage metadata.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "books" / "_marco_chapters_raw.json"
OUT = ROOT / "assets" / "books" / "marco-polo-lore.json"

BANDS = [
    {"id": "europe", "label": "Europe"},
    {"id": "west_asia", "label": "West Asia"},
    {"id": "central_asia", "label": "Central Asia"},
    {"id": "steppe", "label": "Steppe"},
    {"id": "china", "label": "China"},
    {"id": "india", "label": "India"},
    {"id": "maritime_asia", "label": "Maritime Asia"},
]

# Keyword → band (checked in order; first match wins on haystack)
BAND_KEYWORDS: list[tuple[str, list[str]]] = [
    ("europe", [
        "venice", "constantinople", "acre", "genoa", "soldaia", "black sea",
        "armenia", "hermenia", "turcomania", "georgia", "ayas", "laias",
        "lesser armenia", "greater hermenia",
    ]),
    ("west_asia", [
        "baudas", "baghdad", "mausul", "mosul", "tauris", "tabriz", "persia",
        "yasdi", "yezd", "kerman", "hormuz", "ormus", "cobinan", "timochain",
        "calif", "caliph", "old man of the mountain", "mulcete", "alamut",
        "assassins", "tonocain", "camadi", "chistan", "reobarle", "syria",
        "mosul", "baldach", "iraques",
    ]),
    ("central_asia", [
        "balc", "balkh", "sapurgan", "badashan", "badakhshan", "vokhan",
        "pamier", "pamir", "cascar", "kashgar", "yarcan", "yarkand", "cotan",
        "khotan", "pein", "carchar", "lop", "samarcand", "samarcan", "bokhara",
        "bocara", "pasciai", "keshimur", "kashmir", "balashan", "vocan",
        "great desert", "gobi",
    ]),
    ("steppe", [
        "tartar", "chinghis", "chingiz", "karakorum", "caracoron", "kaidu",
        "nogai", "barca", "alau", "toctai", "turkey", "kipchak", "comania",
        "northern ocean", "russia", "great turkey",
    ]),
    ("china", [
        "cathay", "cambaluc", "khanbaliq", "quinsai", "kinsay", "manzi",
        "tangut", "sachiu", "campichu", "etzina", "caramoran", "yunnan",
        "carajan", "mien", "acbalec", "sindafu", "chendu", "tibet", "tebet",
        "cuncun", "acbaluc", "pangai", "chinangli", "tadinfu", "sinju",
        "caichu", "pangymangu", "cuyanfu", "pangai", "yangiu", "yangzhou",
        "nanghin", "saianfu", "chinghianfu", "chingyanfu", "suju", "vuju",
        "fugiu", "zayton", "quanzhou", "kelinfu", "uncu", "gampu", "tingui",
        "changlu", "changli", "tundinfu", "sinjumatu", "linju", "piuju",
        "cingiu", "caiju", "mingan", "pangymangu", "chedu", "caindu",
        "karaian", "zar dandan", "mien", "bangala", "aniu", "toloman",
        "cuiju", "sindafu", "cubiai", "cublay", "kaan", "paper money",
        "black stones", "rice-wine", "natigai", "pulisanghin", "taianfu",
        "pianfu", "cacanfu", "acbalec manzi", "pangai", "chinghian",
        "saianfu", "bayam", "facfur", "fo-kien",
    ]),
    ("india", [
        "india", "maabar", "ma'bar", "lar", "cail", "coilum", "quilon",
        "comari", "eli", "melibar", "malabar", "guzzerat", "gujarat",
        "tana", "cambay", "somnath", "kesmacoran", "abash", "aden",
        "escoheria", "warangal", "mutfili", "st. thomas", "sagamoni",
        "ceylan", "seilan", "cape comorin",
    ]),
    ("maritime_asia", [
        "cipangu", "chipangu", "japan", "java", "locac", "chamba", "champa", "basman",
        "samara", "dragoian", "lambri", "fansur", "necuvetan", "angamanain",
        "andaman", "nicobar", "sondur", "condur", "pentam", "malaiur",
        "island of women", "island of men", "madagascar", "madeigascar",
        "zanzibar", "scotra", "socotra", "indian seas", "merchant ships",
        "whale", "roc", "rukh",
    ]),
]

PLACE_TITLE_RE = re.compile(
    r"^(?:HERE THE BOOK BEGINS;\s*AND FIRST IT SPEAKS OF THE |HERE BEGINS THE DESCRIPTION OF THE INTERIOR OF CATHAY,\s*AND FIRST OF THE )?"
    r"(?:OF THE |CONCERNING THE |DESCRIPTION OF THE |CONCERNING )?"
    r"(?:GREAT |NOBLE |KINGDOM OF |PROVINCE OF |CITY OF |CITIES OF |ISLAND OF |COUNTRY OF |TOWN OF )?"
    r"(.+)$",
    re.IGNORECASE,
)

STORY_TITLE_STARTS = (
    "HOW ", "WHAT ", "WHEREIN ", "DISCOURSING ", "REHEARSAL ",
    "THE MESSAGE ", "THE VALIANT ", "THE SAME CONTINUED",
)

PLACE_TITLE_STARTS = (
    "OF ", "CONCERNING ", "DESCRIPTION ", "HERE THE BOOK", "HERE BEGINS",
)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:72] or "entry"


def condense(body: str, max_words: int = 380, min_keep: int = 1) -> str:
    """Keep continuous cleaned Polo prose, truncated at a sentence boundary."""
    # Normalize fleur-de-lis manuscript lacuna summaries into plain prose
    body = body.replace("⚜", "").strip()
    body = re.sub(r"[ \t]+", " ", body)
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    cleaned = []
    for p in paras:
        if p.startswith("_") and p.endswith("_"):
            continue
        if re.match(r"^[=—\-_]{3,}$", p):
            continue
        if p.count("=") >= 2:
            continue
        # Unwrap Yule's parenthesis-only abstracts into sentences
        if p.startswith("(") and p.endswith(")"):
            p = p[1:-1].strip()
        p = p.strip(" ()")
        if p.endswith(", &c."):
            p = p[:-5].rstrip() + "."
        if p.lower().startswith("relates how "):
            p = p[12:].strip()
            if p and p[0].islower():
                p = p[0].upper() + p[1:]
        if p.lower().startswith("description of "):
            p = p[0].upper() + p[1:] if p else p
        cleaned.append(p)
    if not cleaned:
        return body.strip()[:2000]

    text = " ".join(cleaned)
    text = re.sub(r"\s+", " ", text).strip()
    # Light polish for lacuna abstracts that are only one clause
    if len(text.split()) < 40 and not text.endswith((".", "!", "?")):
        text = text.rstrip(".,;:") + "."
    words = text.split()
    if len(words) <= max_words:
        if len(words) <= 220:
            return "\n\n".join(cleaned)
        return text

    cut = " ".join(words[:max_words])
    for punct in (". ", "; ", "! ", "? "):
        idx = cut.rfind(punct)
        if idx > len(cut) * 0.55:
            cut = cut[: idx + 1]
            break
    return cut.strip()

def classify(title: str, body: str) -> str:
    t = title.upper().strip()
    if t.startswith(STORY_TITLE_STARTS):
        return "story"
    # Strong geographic openings stay places even if a campaign is mentioned
    if t.startswith((
        "OF THE CITY", "OF THE GREAT CITY", "OF THE NOBLE CITY",
        "OF THE PROVINCE", "OF THE KINGDOM", "OF THE COUNTRY",
        "OF THE ISLAND", "OF THE GREAT ISLAND", "OF THE GREAT COUNTRY",
        "CONCERNING THE CITY", "CONCERNING THE PROVINCE", "CONCERNING THE ISLAND",
        "CONCERNING THE GREAT ISLAND", "DESCRIPTION OF THE ISLAND",
        "DESCRIPTION OF THE GREAT ISLAND", "HERE THE BOOK BEGINS",
        "HERE BEGINS THE DESCRIPTION",
    )):
        return "place"
    if any(k in t for k in ("DESPATCH OF A HOST", "EXPEDITION AGAINST", "BATTLE",
                            "WAR ", "REVOLT", "VICTORY", "DEFEAT")):
        return "story"
    if t.startswith(PLACE_TITLE_STARTS):
        if any(k in t for k in ("FESTIVAL", "HUNTING", "EMBASSY", "MESSAGE",
                                "ROBES", "BARONS WHO", "ASTROLOGERS", "RELIGION",
                                "CHARITY", "OPPRESSIONS", "HISTORY OF")):
            return "story"
        return "place"
    if re.search(r"\b(battle|war|said unto|addressed|marched)\b", body[:400], re.I):
        return "story"
    return "story"


def haystack_of(ch: dict) -> str:
    return f"{ch['chapterTitle']}\n{ch['rawBody'][:1200]}".lower()


def assign_band(ch: dict) -> str:
    book = ch["book"]
    n = ch["chapter"]
    hay = haystack_of(ch)

    # Prologue follows the Polos' itinerary by chapter order
    if book == 0:
        if n <= 2:
            return "europe"
        if n == 3:
            return "central_asia"
        if 4 <= n <= 7:
            return "china"
        if 8 <= n <= 12:
            return "europe"
        return "china"

    scores = {b["id"]: 0 for b in BANDS}
    for band, keys in BAND_KEYWORDS:
        for k in keys:
            if k in hay:
                scores[band] += 2 if k in ch["chapterTitle"].lower() else 1

    if book == 1:
        scores["west_asia"] += 2
        scores["central_asia"] += 1
        if n <= 20:
            scores["west_asia"] += 3
        elif n <= 40:
            scores["central_asia"] += 3
        else:
            scores["steppe"] += 3
            scores["china"] += 1
    elif book == 2:
        scores["china"] += 4
    elif book == 3:
        scores["maritime_asia"] += 2
        scores["india"] += 2
        if n <= 10:
            scores["maritime_asia"] += 2
        elif n <= 25:
            scores["india"] += 2
        else:
            scores["maritime_asia"] += 1
            scores["india"] += 1
    elif book == 4:
        scores["steppe"] += 4
        scores["central_asia"] += 1

    best = max(scores, key=lambda k: scores[k])
    if scores[best] == 0:
        return {1: "west_asia", 2: "china", 3: "india", 4: "steppe"}.get(book, "west_asia")
    return best


JUNK_PLACE_NAMES = {
    "others", "other", "the", "and", "his", "her", "their", "its", "this",
    "that", "these", "those", "some", "many", "more", "such", "certain",
    "people", "followers", "barons", "host", "army", "country", "province",
    "city", "island", "kingdom", "town", "cities",
}


def place_names_from_title(title: str) -> list[str]:
    t = re.sub(r"\{[^}]+\}", "", title)
    t = re.sub(r"\s+", " ", t).strip(" .")
    # Strip leading formula
    for prefix in (
        "HERE THE BOOK BEGINS; AND FIRST IT SPEAKS OF THE ",
        "HERE BEGINS THE DESCRIPTION OF THE INTERIOR OF CATHAY, AND FIRST OF THE ",
        "DESCRIPTION OF THE ISLAND OF ", "DESCRIPTION OF THE GREAT ISLAND OF ",
        "DESCRIPTION OF THE ", "OF THE GREAT CITY OF ", "OF THE NOBLE CITY OF ",
        "OF THE CITY OF ", "OF THE GREAT COUNTRY OF ", "OF THE COUNTRY OF ",
        "OF THE PROVINCE OF ", "OF THE KINGDOM OF ", "OF THE ISLAND OF ",
        "OF THE GREAT ISLAND OF ", "CONCERNING THE PROVINCE OF ",
        "CONCERNING THE CITY OF ", "CONCERNING THE ISLAND OF ",
        "CONCERNING THE GREAT ISLAND OF ", "CONCERNING THE ",
        "OF THE ", "OF ",
    ):
        if t.upper().startswith(prefix):
            t = t[len(prefix):]
            break
    # Cut trailing clauses (despatch, battles, etc.)
    for sep in (
        ";", ",", " WHICH", " THAT", " AND HOW", " AND THE GREAT KAAN",
        " ALSO", " WITH SOME", " AND OTHERS", " AND THAT OF",
        " AND THE KINGDOMS", " AND HIS",
    ):
        m = re.split(re.escape(sep), t, maxsplit=1, flags=re.I)
        if len(m) > 1:
            t = m[0]
            break
    name = t.strip(" .")
    if not name or len(name) > 60:
        return []
    names = [name]
    # Split only "X AND Y" when both look like place names (short, no verbs)
    if re.search(r"\s+AND\s+", name, re.I) and len(name) < 45:
        parts = re.split(r"\s+AND\s+", name, flags=re.I)
        if 2 <= len(parts) <= 3 and all(len(p.split()) <= 4 for p in parts):
            names = [p.strip() for p in parts if p.strip()]
    out = []
    for n in names:
        if slugify(n) in JUNK_PLACE_NAMES:
            continue
        if len(n) < 3:
            continue
        out.append(n)
    return out

def display_title(ch: dict, kind: str) -> str:
    t = ch["chapterTitle"]
    t = re.sub(r"\s+", " ", t).strip(" .")
    # Soften ALL CAPS for display
    if sum(1 for c in t if c.isupper()) > 0.7 * max(1, sum(1 for c in t if c.isalpha())):
        t = t.title()
        for w in ("Of", "The", "And", "To", "In", "On", "For", "A", "An", "Or", "By", "At", "From"):
            t = re.sub(rf"\b{w}\b", w.lower(), t)
        if t:
            t = t[0].upper() + t[1:]
        # Fix possessive after title(): Kaan'S → Kaan's
        t = re.sub(r"([A-Za-z])'S\b", r"\1's", t)
        t = re.sub(r"([A-Za-z])’S\b", r"\1’s", t)
    return t


def unique_id(base: str, used: set[str]) -> str:
    if base not in used:
        used.add(base)
        return base
    i = 2
    while f"{base}-{i}" in used:
        i += 1
    uid = f"{base}-{i}"
    used.add(uid)
    return uid


def main() -> None:
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    chapters = raw["chapters"]

    places: list[dict] = []
    stories: list[dict] = []
    used_ids: set[str] = set()
    coverage: list[dict] = []

    for ch in chapters:
        kind = classify(ch["chapterTitle"], ch["rawBody"])
        band = assign_band(ch)
        body = condense(ch["rawBody"])
        title = display_title(ch, kind)
        source = {
            "volume": ch["volume"],
            "book": ch["book"],
            "chapter": ch["chapter"],
            "chapterTitle": ch["chapterTitle"],
            "chapterId": ch["id"],
        }

        if kind == "place":
            names = place_names_from_title(ch["chapterTitle"])
            base = slugify(names[0] if names else title)
            pid = unique_id(base, used_ids)
            entry = {
                "id": pid,
                "title": title,
                "band": band,
                "placeNames": names or [title],
                "body": body,
                "source": source,
            }
            places.append(entry)
            coverage.append({"chapterId": ch["id"], "type": "place", "entryId": pid, "band": band})
        else:
            base = slugify(title)
            if base.startswith("how-"):
                base = base[4:]
            sid = unique_id(base, used_ids)
            # Optional anchor: if a clear place name appears in title
            anchor = None
            names = place_names_from_title(ch["chapterTitle"])
            # Try match existing place by shared token later — set soft anchor from title tokens
            entry = {
                "id": sid,
                "title": title,
                "band": band,
                "body": body,
                "source": source,
            }
            stories.append(entry)
            coverage.append({"chapterId": ch["id"], "type": "story", "entryId": sid, "band": band})

    # Second pass: set story anchorPlace when a known place name appears as a whole word
    place_tokens: list[tuple[str, str]] = []  # (token, placeId), longest first
    for p in places:
        tokens = {p["id"]}
        for n in p.get("placeNames", []):
            tokens.add(slugify(n))
        for tok in tokens:
            if len(tok) >= 5 and tok not in JUNK_PLACE_NAMES:
                place_tokens.append((tok, p["id"]))
    place_tokens.sort(key=lambda x: len(x[0]), reverse=True)

    for s in stories:
        hay_parts = set(slugify(s["title"] + " " + s["source"]["chapterTitle"]).split("-"))
        raw = s["source"]["chapterTitle"].lower().replace("’", "'")
        for tok, pid in place_tokens:
            bare = tok.replace("-", "")
            if tok in hay_parts or bare in hay_parts:
                s["anchorPlace"] = pid
                break
            if len(bare) >= 6 and re.search(rf"\b{re.escape(bare)}\b", raw):
                s["anchorPlace"] = pid
                break

    # Range anchors: Baudas miracle cycle (Book I ch. 7–10)
    baudas_id = next((p["id"] for p in places if p["id"] == "baudas" or "baudas" in p["id"]), None)
    if baudas_id:
        for s in stories:
            src = s["source"]
            if src["book"] == 1 and 7 <= src["chapter"] <= 10:
                s.setdefault("anchorPlace", baudas_id)
                s["anchorPlace"] = baudas_id

    cited = {c["chapterId"] for c in coverage}
    missing = [c["id"] for c in chapters if c["id"] not in cited]

    doc = {
        "meta": {
            "title": "Marco Polo Travels — Place & Story Lore",
            "source": "Yule-Cordier (PG 10636 + 12410)",
            "language": "en",
            "zhStatus": "pending",
            "chapterCount": len(chapters),
            "placeCount": len(places),
            "storyCount": len(stories),
            "missingChapterIds": missing,
        },
        "bands": BANDS,
        "places": places,
        "stories": stories,
        "coverage": coverage,
    }
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"places={len(places)} stories={len(stories)} chapters={len(chapters)} missing={len(missing)}")
    print(f"Wrote {OUT}")
    from collections import Counter
    print("bands places", Counter(p["band"] for p in places))
    print("bands stories", Counter(s["band"] for s in stories))


if __name__ == "__main__":
    main()
