#!/usr/bin/env python3
"""Extract monthly records from Broadhurst's Travels of Ibn Jubayr.

Narrative window: Chronicle opening + 26 monthly records.
Strips Notes / Glossary / Indexes.
Emits assets/books/_ibn_jubayr_chapters_raw.json.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"
SRC = BOOKS / "05_The_Travels_of_Ibn_Jubayr.txt"
OUT = BOOKS / "_ibn_jubayr_chapters_raw.json"

HASH_SECTION_RE = re.compile(
    r"^############################################################\n"
    r"# (.+?)\n"
    r"############################################################\n",
    re.MULTILINE,
)
SOFT_HYPHEN = re.compile(r"(\w)-\n(\w)")
SUP_NUM = re.compile(r"(?<=[A-Za-z\)’'])\d{1,3}(?=[,.;:\s\)\]])")
BRACKET_GLOSS = re.compile(r"\[[^\]]*\]")


def unwrap_paragraphs(text: str) -> str:
    text = SOFT_HYPHEN.sub(r"\1\2", text)
    text = SUP_NUM.sub("", text)
    # Keep place-name glosses like [Jaen] by converting to parenthetical,
    # but drop pure date brackets and long editorial asides.
    def gloss_sub(m: re.Match) -> str:
        inner = m.group(0)[1:-1].strip()
        if re.search(r"\d{3,4}|of March|of April|of May|of June|of July|"
                     r"of August|of September|of October|of November|"
                     r"of December|of January|of February|A\.H\.|i\.e\.", inner, re.I):
            return ""
        if len(inner) > 60:
            return ""
        if inner.lower().startswith(("saladin", "i.e.", "from the")):
            return f" ({inner})"
        # Short place glosses: keep
        if len(inner) <= 40:
            return f" ({inner})"
        return ""

    text = BRACKET_GLOSS.sub(gloss_sub, text)

    lines = text.splitlines()
    paras: list[str] = []
    buf: list[str] = []

    def flush() -> None:
        nonlocal buf
        if not buf:
            return
        joined = " ".join(x.strip() for x in buf if x.strip())
        joined = re.sub(r"[ \t]+", " ", joined).strip()
        # Drop pure pious one-liners that are only "Praise be to God…"
        if joined:
            paras.append(joined)
        buf = []

    for line in lines:
        raw = line.rstrip()
        if not raw.strip():
            flush()
            continue
        if re.match(r"^[-–—=#]{3,}$", raw.strip()):
            continue
        if raw.strip().startswith("#"):
            continue
        buf.append(raw.strip())
    flush()
    return "\n\n".join(paras)


def main() -> None:
    text = unicodedata.normalize("NFC", SRC.read_text(encoding="utf-8", errors="replace"))
    sections = list(HASH_SECTION_RE.finditer(text))

    narrative: list[tuple[str, int, int]] = []  # title, start_body, end
    capture = False
    for idx, m in enumerate(sections):
        title = m.group(1).strip()
        body_start = m.end()
        body_end = sections[idx + 1].start() if idx + 1 < len(sections) else len(text)

        if title == "The Chronicle":
            capture = True
            narrative.append((title, body_start, body_end))
            continue
        if title.startswith("THE EASTERN HALF"):
            continue
        if title.startswith("The Month of"):
            capture = True
            narrative.append((title, body_start, body_end))
            continue
        if title == "Notes":
            break
        if capture and title.startswith("THE "):
            continue

    chapters: list[dict] = []
    for i, (title, start, end) in enumerate(narrative):
        raw = text[start:end]
        body = unwrap_paragraphs(raw)
        if len(body) < 60:
            continue
        cid = f"jubayr-m{i:03d}"
        chapters.append({
            "id": cid,
            "section": i,
            "chapterTitle": title,
            "rawBody": body,
            "wordCount": len(body.split()),
        })

    OUT.write_text(
        json.dumps({"chapters": chapters, "count": len(chapters)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(chapters)} sections → {OUT}")
    for c in chapters:
        print(f"  {c['id']:14s} {c['wordCount']:5d}w  {c['chapterTitle'][:70]}")


if __name__ == "__main__":
    main()
