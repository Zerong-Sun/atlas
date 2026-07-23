#!/usr/bin/env python3
"""Extract narrative episodes from Mendes Pinto EN excerpt.

Source is an illustrated Cosmópolis selection (ch. I + 59–67), not the full
Peregrinação. Hash markers are page headers — strip them. Split on episode
titles of the form "As António…" / "How António…".
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"
SRC = BOOKS / "06_Peregrinacao_Fernao_Mendes_Pinto_EN.txt"
OUT = BOOKS / "_mendes_pinto_chapters_raw.json"

HASH_BLOCK = re.compile(
    r"^############################################################\n"
    r"# .*?\n"
    r"############################################################\n?",
    re.MULTILINE,
)
SPACED_HEADER = re.compile(
    r"(?m)^(?:[A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ\-—'](?:\s+[A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ\-—']){1,40})\s*$"
)
PAGE_NUM = re.compile(r"(?m)^\d{1,3}\s*$")
SOFT_HYPHEN = re.compile(r"(\w)-\n(\w)")
# OCR digit/letter swaps common in this text
OCR_FIXES = [
    (re.compile(r"\b6e\b"), "se"),
    (re.compile(r"\b6uce"), "succe"),
    (re.compile(r"\bU6\b"), "Us"),
    (re.compile(r"\b6ucedeu\b"), "succeeded"),
    (re.compile(r"corr6ary"), "corsair"),
    (re.compile(r"cor6ário"), "corsair"),
    (re.compile(r"i660"), "it"),
    (re.compile(r"\b60\b(?= about)"), ""),
    (re.compile(r"nova6\s*d06"), "now had"),
    (re.compile(r"portuguese6e6"), "Portuguese"),
    (re.compile(r"(\w)6(\w)"), r"\1s\2"),  # OCR 6↔s mid-word
    (re.compile(r"paMei"), "passei"),
]

EPISODE_RE = re.compile(
    r"(?m)^((?:As|How)\s+Ant[oó]nio(?:\s+de)?\s+Faria[^\n]{0,160})$"
)


def unwrap(text: str) -> str:
    text = SOFT_HYPHEN.sub(r"\1\2", text)
    for rx, repl in OCR_FIXES:
        text = rx.sub(repl, text)
    lines = text.splitlines()
    paras: list[str] = []
    buf: list[str] = []

    def flush() -> None:
        nonlocal buf
        if not buf:
            return
        joined = " ".join(x.strip() for x in buf if x.strip())
        joined = re.sub(r"[ \t]+", " ", joined).strip()
        if joined:
            paras.append(joined)
        buf = []

    for line in lines:
        raw = line.rstrip()
        s = raw.strip()
        if not s:
            flush()
            continue
        if PAGE_NUM.match(s) or SPACED_HEADER.match(s):
            continue
        if re.match(r"^[-–—]{3,}$", s):
            continue
        # Drop residual publisher / illustration crumbs
        if re.search(r"ISBN|Fotocompos|Grafisels|EXPO 98|Luis Filipe", s, re.I):
            continue
        if re.match(r"^FERN[AÃ]O|^MENDES|^PINTO|^CHICK$", s, re.I):
            continue
        buf.append(s)
    flush()
    return "\n\n".join(paras)


def main() -> None:
    text = unicodedata.normalize("NFC", SRC.read_text(encoding="utf-8", errors="replace"))
    # Drop title banner
    text = re.sub(r"^={3,}.*?={3,}\n+", "", text, count=1, flags=re.DOTALL)
    text = HASH_BLOCK.sub("\n", text)
    text = unwrap(text)

    # Skip publisher / illustrated-edition front matter until real narrative
    start_markers = (
        "When I sometimes look",
        "Than paMei in my",  # OCR of "Do que passei"
        "As António de Faria",
    )
    cut = None
    for marker in start_markers:
        i = text.find(marker)
        if i != -1:
            cut = i if cut is None else min(cut, i)
    if cut is not None and cut > 0:
        # Prefer starting at youth prologue if present
        youth = text.find("When I sometimes look")
        if youth == -1:
            youth = text.find("Than paMei in my")
        if youth != -1:
            text = text[youth:]
        else:
            text = text[cut:]

    # Drop leftover title-page debris paragraphs
    cleaned_paras = []
    for p in text.split("\n\n"):
        low = p.lower()
        if any(x in low for x in (
            "maria alberta", "tais pancadas", "costa da china", "pilgrimage",
            "see\"ôo", "luis filipe", "isbn", "lisbon, february", "expo 98",
            "and such beats have",
        )):
            continue
        if re.match(r"^[A-Z \-—']{8,}$", p.strip()):
            continue
        cleaned_paras.append(p)
    text = "\n\n".join(cleaned_paras)

    matches = list(EPISODE_RE.finditer(text))
    chapters: list[dict] = []

    # Prologue before first episode
    if matches:
        pre = text[: matches[0].start()].strip()
        if len(pre.split()) > 80:
            chapters.append({
                "id": "pinto-c000",
                "chapter": 0,
                "chapterTitle": "Prologue — Youth and Embarkation for India",
                "rawBody": pre,
                "wordCount": len(pre.split()),
            })
    else:
        chapters.append({
            "id": "pinto-c000",
            "chapter": 0,
            "chapterTitle": "Peregrination (excerpt)",
            "rawBody": text,
            "wordCount": len(text.split()),
        })

    for idx, m in enumerate(matches):
        title = re.sub(r"\s+", " ", m.group(1)).strip().rstrip(".")
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        # Title often continues on the next short paragraph(s)
        if len(title.split()) <= 5:
            bits = body.split("\n\n")
            eaten = 0
            for bit in bits[:3]:
                b = bit.strip()
                if not b or len(b.split()) > 28:
                    break
                if re.match(r"^(We |Then |After |When |The first|They )", b):
                    break
                title = (title + " " + b).strip()
                eaten += 1
            if eaten:
                body = "\n\n".join(bits[eaten:]).strip()
        title = re.sub(r"\s+", " ", title).strip(" .")
        if len(body.split()) < 40:
            continue
        cid = f"pinto-c{idx + 1:03d}"
        chapters.append({
            "id": cid,
            "chapter": idx + 1,
            "chapterTitle": title,
            "rawBody": body,
            "wordCount": len(body.split()),
        })

    OUT.write_text(
        json.dumps({"chapters": chapters, "count": len(chapters)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(chapters)} episodes → {OUT}")
    for c in chapters:
        print(f"  {c['id']:12s} {c['wordCount']:5d}w  {c['chapterTitle'][:70]}")


if __name__ == "__main__":
    main()
