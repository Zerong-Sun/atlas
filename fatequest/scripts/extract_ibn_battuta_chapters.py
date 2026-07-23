#!/usr/bin/env python3
"""Extract narrative chapters from Lee's Travels of Ibn Battuta.

Strips front matter, numbered footnotes, poetry blocks where isolable.
Emits assets/books/_ibn_battuta_chapters_raw.json.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"
SRC = BOOKS / "03_The_Travels_of_Ibn_Battuta.txt"
OUT = BOOKS / "_ibn_battuta_chapters_raw.json"

CHAPTER_RE = re.compile(r"^CHAPTER\s+([IVXLCDM]+)\.\s*$", re.MULTILINE)
SECTION_MARKER_RE = re.compile(
    r"^############################################################\n"
    r"# Chapter [IVXLCDM]+\n"
    r"############################################################\n",
    re.MULTILINE,
)
FOOTNOTE_BLOCK_RE = re.compile(
    r"(?m)^(\d{1,2})\s+(?=[A-ZÉÈÊÂÎÔÛÄÖÜ])"  # start of numbered note
)
SOFT_HYPHEN = re.compile(r"(\w)-\n(\w)")
INLINE_LETTER_MARK = re.compile(r"(?<![A-Za-z])[a-z](?=[A-Z])")  # aAlexandria style


def roman_to_int(s: str) -> int:
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    s = s.upper()
    i = 0
    n = 0
    while i < len(s):
        if i + 1 < len(s) and vals[s[i]] < vals[s[i + 1]]:
            n += vals[s[i + 1]] - vals[s[i]]
            i += 2
        else:
            n += vals[s[i]]
            i += 1
    return n


def unwrap_paragraphs(text: str) -> str:
    text = SOFT_HYPHEN.sub(r"\1\2", text)
    text = INLINE_LETTER_MARK.sub("", text)
    # Drop superscript-style bare numbers mid-sentence remnants like "Tanjiers,3"
    text = re.sub(r"(?<=[A-Za-z\)])\d{1,2}(?=[,.;:\s\)])", "", text)

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
        if not raw.strip():
            flush()
            continue
        if re.match(r"^[-–—]{3,}$", raw.strip()):
            continue
        if raw.strip().startswith("#"):
            continue
        buf.append(raw.strip())
    flush()
    return "\n\n".join(paras)


def strip_footnotes(body: str) -> str:
    """Remove Lee's end-of-chapter numbered notes.

    Notes start after the narrative: lines beginning with `1 `, `2 `, …
    Heuristic: find the first line that is `N ` + capital letter where N is
    small and the preceding content looks like narrative end / poetry end.
    Prefer cutting at the first standalone `^1 ` that appears after ~40% of
    the chapter (Lee notes always restart at 1).
    """
    lines = body.splitlines()
    if len(lines) < 20:
        return body

    # Scan from midway for a line matching footnote start "1 "
    start_search = max(10, len(lines) // 3)
    cut_at: int | None = None
    for i in range(start_search, len(lines)):
        m = re.match(r"^1\s+[A-Z]", lines[i])
        if not m:
            continue
        # Confirm a run of numbered notes follows
        following_nums = 0
        for j in range(i, min(i + 40, len(lines))):
            if re.match(r"^\d{1,2}\s+\S", lines[j]):
                following_nums += 1
        if following_nums >= 2:
            cut_at = i
            break
    if cut_at is not None:
        body = "\n".join(lines[:cut_at])
    return body


def extract_route_title(block: str) -> str:
    """First non-blank line after CHAPTER heading is usually the route dash-list."""
    lines = block.splitlines()
    for line in lines:
        s = line.strip()
        if not s or re.match(r"^[-–—]{3,}$", s):
            continue
        if s.upper().startswith("CHAPTER"):
            continue
        if s.startswith("#"):
            continue
        # Route lines contain em-dashes or many place names
        if "—" in s or "–" in s or s.count("-") >= 3:
            return s.rstrip(".")
        # Otherwise take first substantive line as title seed
        if len(s) > 20:
            return s[:160].rstrip(".")
    return "(untitled)"


def main() -> None:
    text = unicodedata.normalize("NFC", SRC.read_text(encoding="utf-8", errors="replace"))
    # Drop everything before Chapter I
    m0 = CHAPTER_RE.search(text)
    if not m0:
        raise SystemExit("No CHAPTER I found")
    text = text[m0.start() :]

    matches = list(CHAPTER_RE.finditer(text))
    chapters: list[dict] = []
    for idx, m in enumerate(matches):
        chap_num = roman_to_int(m.group(1))
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        block = text[start:end]
        title = extract_route_title(block)
        # Body: skip underline + route title line
        body_lines = block.splitlines()
        consumed = 0
        for i, line in enumerate(body_lines):
            s = line.strip()
            if not s or re.match(r"^[-–—]{3,}$", s):
                consumed = i + 1
                continue
            if s == title or s.rstrip(".") == title.rstrip("."):
                consumed = i + 1
                continue
            # stop consuming once we hit prose
            if consumed and s:
                body_lines = body_lines[i:]
                break
            consumed = i + 1
        else:
            body_lines = body_lines[consumed:]

        body_raw = "\n".join(body_lines)
        body_raw = strip_footnotes(body_raw)
        # Drop appendix markers bleed
        for stop in ("\n############################################################\n# Chapter",):
            j = body_raw.find(stop)
            if j != -1:
                body_raw = body_raw[:j]
        body = unwrap_paragraphs(body_raw)
        if len(body) < 80:
            continue
        cid = f"battuta-c{chap_num:03d}"
        chapters.append({
            "id": cid,
            "chapter": chap_num,
            "chapterTitle": title,
            "rawBody": body,
            "wordCount": len(body.split()),
        })

    OUT.write_text(
        json.dumps({"chapters": chapters, "count": len(chapters)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(chapters)} chapters → {OUT}")
    for c in chapters:
        print(f"  {c['id']:16s} {c['wordCount']:5d}w  {c['chapterTitle'][:70]}")


if __name__ == "__main__":
    main()
