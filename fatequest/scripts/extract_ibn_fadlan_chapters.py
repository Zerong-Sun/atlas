#!/usr/bin/env python3
"""Extract narrative sections from Ibn Fadlan and the Land of Darkness.

Parts I–II: subsection headings (underlined).
Part III: numbered excerpts 1–43.
Emits assets/books/_ibn_fadlan_chapters_raw.json.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"
SRC = BOOKS / "04_Ibn_Fadlan_and_the_Land_of_Darkness.txt"
OUT = BOOKS / "_ibn_fadlan_chapters_raw.json"

HASH_SECTION_RE = re.compile(
    r"^############################################################\n"
    r"# (.+?)\n"
    r"############################################################\n",
    re.MULTILINE,
)
UNDERLINE_HEADING_RE = re.compile(
    r"(?m)^([A-ZÀ-Ÿ][^\n]{2,90})\n(-{3,})\n"
)
SOFT_HYPHEN = re.compile(r"(\w)-\n(\w)")
def unwrap_paragraphs(text: str) -> str:
    text = SOFT_HYPHEN.sub(r"\1\2", text)
    # Footnote digits glued to words: name19the / word.3Next
    text = re.sub(r"(?<=\w)\d{1,3}(?=[A-Za-z])", " ", text)
    text = re.sub(r"(?<=[A-Za-z\)’'])\d{1,3}(?=[,.;:\s\)\]])", "", text)
    text = re.sub(r"(?<=[A-Za-z,’'\)])\d{1,3}\b", "", text)
    # Drop translator square-bracket date glosses of form [25th of …]
    text = re.sub(r"\[[^\]]{0,80}\]", "", text)

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
        if re.match(r"^[-–—=#]{3,}$", raw.strip()):
            continue
        if raw.strip().startswith("#"):
            continue
        buf.append(raw.strip())
    flush()
    return "\n\n".join(paras)


def slug_part(label: str) -> str:
    label = unicodedata.normalize("NFKD", label)
    label = label.encode("ascii", "ignore").decode("ascii")
    label = label.lower()
    return re.sub(r"[^a-z0-9]+", "-", label).strip("-")[:48] or "sec"


def extract_subsections(part_id: str, part_label: str, body: str) -> list[dict]:
    """Split a Part I/II body on underlined headings."""
    matches = list(UNDERLINE_HEADING_RE.finditer(body))
    sections: list[dict] = []

    # Preamble before first heading
    if matches:
        pre = body[: matches[0].start()].strip()
        if len(pre) > 120:
            sections.append({
                "title": f"{part_label} — Opening",
                "raw": pre,
            })
    else:
        if len(body.strip()) > 120:
            sections.append({"title": part_label, "raw": body})
        return sections

    for idx, m in enumerate(matches):
        title = m.group(1).strip()
        # Skip front-matter-ish headings that leaked
        if title.lower() in {"introduction", "chronology", "note on the texts", "list of maps"}:
            continue
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(body)
        raw = body[start:end]
        if len(raw.strip()) < 40:
            continue
        sections.append({"title": title, "raw": raw})
    return sections


def main() -> None:
    text = unicodedata.normalize("NFC", SRC.read_text(encoding="utf-8", errors="replace"))
    sections_meta = list(HASH_SECTION_RE.finditer(text))

    chapters: list[dict] = []
    seq = 0

    # Identify narrative windows
    part1_start = part2_start = part3_start = appendix_start = None
    part3_excerpts: list[tuple[int, str, int]] = []  # (pos, title, num)

    for m in sections_meta:
        title = m.group(1).strip()
        if title.startswith("The Book of Ahmad Ibn Fadl"):
            part1_start = m.end()
            part1_title = title
        elif title.startswith("The Travels of Ab"):
            part2_start = m.start()
            part2_title = title
            part2_body_start = m.end()
        elif re.match(r"^\d+\.\s+", title):
            num = int(re.match(r"^(\d+)", title).group(1))
            part3_excerpts.append((m.start(), title, num))
            if part3_start is None:
                part3_start = m.start()
        elif title.startswith("Appendix"):
            if appendix_start is None:
                appendix_start = m.start()

    if not part1_start or not part2_start:
        raise SystemExit(f"Missing parts: p1={part1_start} p2={part2_start}")

    # Part I body ends at Part II marker
    part1_body = text[part1_start:part2_start]
    part2_body = text[part2_body_start:part3_start if part3_start else len(text)]

    for part_code, part_label, body in (
        ("p1", "Ibn Fadlan", part1_body),
        ("p2", "Abu Hamid", part2_body),
    ):
        for sec in extract_subsections(part_code, part_label, body):
            cleaned = unwrap_paragraphs(sec["raw"])
            if len(cleaned) < 60:
                continue
            seq += 1
            cid = f"fadlan-{part_code}-{seq:03d}"
            chapters.append({
                "id": cid,
                "part": 1 if part_code == "p1" else 2,
                "section": seq,
                "chapterTitle": sec["title"],
                "rawBody": cleaned,
                "wordCount": len(cleaned.split()),
            })

    # Part III excerpts
    end_bound = appendix_start or len(text)
    for idx, (pos, title, num) in enumerate(part3_excerpts):
        # body starts after the hash block
        m = HASH_SECTION_RE.search(text, pos)
        if not m:
            continue
        start = m.end()
        if idx + 1 < len(part3_excerpts):
            end = part3_excerpts[idx + 1][0]
        else:
            end = end_bound
        raw = text[start:end]
        # Drop editorial headnote paragraphs that start with author bio
        cleaned = unwrap_paragraphs(raw)
        if len(cleaned) < 40:
            continue
        seq += 1
        cid = f"fadlan-p3-{num:03d}"
        chapters.append({
            "id": cid,
            "part": 3,
            "section": num,
            "chapterTitle": title,
            "rawBody": cleaned,
            "wordCount": len(cleaned.split()),
        })

    OUT.write_text(
        json.dumps({"chapters": chapters, "count": len(chapters)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(chapters)} sections → {OUT}")
    from collections import Counter
    print("parts", Counter(c["part"] for c in chapters))
    for c in chapters[:8]:
        print(f"  {c['id']:20s} {c['wordCount']:5d}w  {c['chapterTitle'][:60]}")
    print("  …")
    for c in chapters[-5:]:
        print(f"  {c['id']:20s} {c['wordCount']:5d}w  {c['chapterTitle'][:60]}")


if __name__ == "__main__":
    main()
