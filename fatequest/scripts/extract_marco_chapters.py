#!/usr/bin/env python3
"""Extract Polo narrative chapters from Yule-Cordier PG texts.

Strips Gutenberg boilerplate, Yule NOTE blocks, illustrations, and
footnote markers. Emits assets/books/_marco_chapters_raw.json.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"
OUT = BOOKS / "_marco_chapters_raw.json"

VOL1 = BOOKS / "01_The_Travels_of_Marco_Polo_Vol1_Marco_Polo.txt"
VOL2 = BOOKS / "02_The_Travels_of_Marco_Polo_Vol2_Marco_Polo.txt"

# Inclusive start / exclusive end of the main narrative text windows
WINDOWS = {
    1: (12477, 43602),  # BOOK OF MARCO POLO … before PG end
    2: (1375, 26960),   # BOOK OF MARCO POLO … before APPENDICES
}

CHAPTER_RE = re.compile(
    r"^[ \t]*CHAPTER[ \t]+([IVXLCDM]+)(?:\.[ \t]*AND LAST)?\.[ \t]*$",
    re.MULTILINE,
)
BOOK_RE = re.compile(
    r"^[ \t]*BOOK[ \t]+(I{1,3}|IV|FIRST|SECOND|THIRD|FOURTH)"
    r"\.?(?:[ \t]*[—\-–]?[ \t]*_?(?:CONTINUED|Continued)_?\.?)?[ \t]*$",
    re.MULTILINE | re.IGNORECASE,
)
PROLOGUE_RE = re.compile(r"^[ \t]*PROLOGUE\.[ \t]*$", re.MULTILINE)
NOTE_RE = re.compile(r"^[ \t]*NOTE[ \t]+\d+", re.MULTILINE)
ILLUST_RE = re.compile(r"\[Illustration:[^\]]*\]", re.IGNORECASE | re.DOTALL)
FOOTNOTE_RE = re.compile(r"\{\d+\}")
SOFT_HYPHEN = re.compile(r"(\w)-\n(\w)")


def roman_to_int(s: str) -> int:
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    prev = 0
    for ch in s.upper():
        v = vals[ch]
        total += -v if v > prev else v
        prev = v
    return abs(total) if total < 0 else total  # standard subtractive handled below


def roman_to_int_proper(s: str) -> int:
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


def book_label_to_num(label: str) -> int:
    label = label.upper().strip("._ ")
    mapping = {
        "I": 1, "II": 2, "III": 3, "IV": 4,
        "FIRST": 1, "SECOND": 2, "THIRD": 3, "FOURTH": 4,
    }
    return mapping[label]


def unwrap_paragraphs(text: str) -> str:
    text = ILLUST_RE.sub("", text)
    text = FOOTNOTE_RE.sub("", text)
    text = SOFT_HYPHEN.sub(r"\1\2", text)
    # Drop bracketed editorial asides that are not narrative
    text = re.sub(r"\[[^\]]{0,40}\]", "", text)

    lines = text.splitlines()
    paras: list[str] = []
    buf: list[str] = []

    def flush():
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
        # Skip pure decorative / latin-quote leftovers common in notes bleed
        if raw.strip().startswith("=") and raw.strip().endswith("="):
            continue
        buf.append(raw.strip())
    flush()
    return "\n\n".join(paras)


def cut_notes(body: str) -> str:
    m = NOTE_RE.search(body)
    if m:
        body = body[: m.start()]
    # Also stop at a line that is only spaces + NOTE
    return body


def extract_title(block_after_heading: str) -> str:
    """Title is the ALL-CAPS (or title-case HOW/OF…) lines before the first prose paragraph."""
    lines = block_after_heading.splitlines()
    title_parts: list[str] = []
    for line in lines:
        s = line.strip()
        if not s:
            if title_parts:
                break
            continue
        letters = [c for c in s if c.isalpha()]
        upper_ratio = (sum(1 for c in letters if c.isupper()) / len(letters)) if letters else 0
        # Prose starters — stop (even mid-title collection)
        prose_starts = (
            "Now ", "It ", "When ", "Having ", "And ", "As ", "You ", "Let ",
            "After ", "But ", "For ", "There ", "This ", "The people",
            "Know ", "On ", "In ", "At ", "To return", "We ", "I ", "His ",
            "These ", "Those ", "Moreover", "Also ", "Here ", "Be it",
        )
        # "HERE THE BOOK BEGINS" is a title; "Here you may know" is prose — allow HERE/OF/HOW/CONCERNING titles
        title_prefix = s.upper().startswith((
            "HOW ", "OF ", "CONCERNING ", "DESCRIPTION ", "HERE ", "REHEARSAL ",
            "DISCOURSING ", "THE SAME", "WHAT ", "WHEREIN ", "WHEREOF ",
        ))
        if title_parts and not title_prefix and upper_ratio < 0.72:
            # continuation lines of titles are usually ALL CAPS
            if upper_ratio >= 0.72 and len(s) < 90:
                title_parts.append(s)
                continue
            break
        if any(s.startswith(p) for p in prose_starts) and upper_ratio < 0.55 and not title_prefix:
            break
        if len(s) > 110 and upper_ratio < 0.6:
            break
        if title_prefix or upper_ratio >= 0.55 or (not title_parts and len(s) < 100):
            title_parts.append(s)
            continue
        break
    title = " ".join(title_parts)
    title = re.sub(r"[ \t]+", " ", title).strip(" .")
    title = FOOTNOTE_RE.sub("", title)
    return title or "(untitled)"


def slice_window(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines(True)
    # 1-indexed line numbers from plan / rg
    return "".join(lines[start - 1 : end - 1])


def parse_volume(volume: int, text: str) -> list[dict]:
    # Track book number via markers; prologue = book 0
    events: list[tuple[int, str, object]] = []
    for m in PROLOGUE_RE.finditer(text):
        events.append((m.start(), "prologue", None))
    for m in BOOK_RE.finditer(text):
        events.append((m.start(), "book", book_label_to_num(m.group(1))))
    for m in CHAPTER_RE.finditer(text):
        events.append((m.start(), "chapter", m))
    events.sort(key=lambda x: x[0])

    current_book = 0
    chapters: list[dict] = []
    chapter_events = [(pos, m) for pos, kind, m in events if kind == "chapter"]

    # Also update book from non-chapter events as we walk
    book_at_pos: list[tuple[int, int]] = []
    cur = 0
    for pos, kind, val in events:
        if kind == "prologue":
            cur = 0
            book_at_pos.append((pos, cur))
        elif kind == "book":
            cur = int(val)
            book_at_pos.append((pos, cur))

    def book_for(pos: int) -> int:
        b = 0
        for p, bb in book_at_pos:
            if p <= pos:
                b = bb
            else:
                break
        return b

    for idx, (pos, m) in enumerate(chapter_events):
        chap_num = roman_to_int_proper(m.group(1))
        start = m.end()
        end = chapter_events[idx + 1][0] if idx + 1 < len(chapter_events) else len(text)
        # Don't spill into a BOOK header that isn't a chapter
        next_book = BOOK_RE.search(text, start, end)
        if next_book and next_book.start() < end:
            # Only truncate if the book marker is before next chapter — already bounded by next chapter
            pass
        block = text[start:end]
        title = extract_title(block)
        # Body starts after title lines
        # Re-find title span length approximately
        body_src = block
        # Strip leading blank + title-ish lines
        body_lines = body_src.splitlines()
        consumed = 0
        title_left = title
        rebuilt = []
        for i, line in enumerate(body_lines):
            s = line.strip()
            if not s:
                if rebuilt or consumed:
                    # blank after title → start of body
                    if title_left == "" or consumed:
                        body_lines = body_lines[i + 1 :]
                        break
                continue
            norm = re.sub(r"[ \t]+", " ", s)
            if title_left.startswith(norm.rstrip(".")):
                title_left = title_left[len(norm.rstrip(".")) :].lstrip(" .")
                consumed += 1
                continue
            # fuzzy: if line is substring of original title
            if norm.rstrip(".") in title:
                consumed += 1
                continue
            body_lines = body_lines[i:]
            break
        body_raw = "\n".join(body_lines)
        body_raw = cut_notes(body_raw)
        # Stop before APPENDICES / INDEX bleed
        for stop in ("\nAPPENDICES", "\n                              APPENDICES",
                     "\nINDEX\n", "*** END OF"):
            j = body_raw.find(stop)
            if j != -1:
                body_raw = body_raw[:j]
        body = unwrap_paragraphs(body_raw)
        # Drop empty / tiny
        if len(body) < 40:
            continue
        book = book_for(pos)
        cid = f"v{volume}-b{book}-c{chap_num:03d}"
        chapters.append({
            "id": cid,
            "volume": volume,
            "book": book,
            "chapter": chap_num,
            "chapterTitle": title,
            "rawBody": body,
            "wordCount": len(body.split()),
        })
    return chapters


def main() -> None:
    all_ch: list[dict] = []
    for vol, path in ((1, VOL1), (2, VOL2)):
        start, end = WINDOWS[vol]
        text = slice_window(path, start, end)
        # Normalize fancy chars lightly
        text = unicodedata.normalize("NFC", text)
        chs = parse_volume(vol, text)
        print(f"Vol{vol}: {len(chs)} chapters")
        all_ch.extend(chs)

    # Deduplicate by (book, chapter) preferring lower volume for Book II overlap?
    # Vol1 has Book II c1–34; Vol2 continues c35+. No overlap expected.
    seen = set()
    unique = []
    for c in all_ch:
        key = (c["book"], c["chapter"], c["chapterTitle"][:40])
        if key in seen:
            print("dup skip", c["id"], c["chapterTitle"][:60])
            continue
        seen.add(key)
        unique.append(c)

    OUT.write_text(
        json.dumps({"chapters": unique, "count": len(unique)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(unique)} chapters → {OUT}")


if __name__ == "__main__":
    main()
