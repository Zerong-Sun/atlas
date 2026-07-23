#!/usr/bin/env python3
"""Shared helpers for travelogue lore JSON builders."""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:72] or "entry"


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


def polish_prose(text: str) -> str:
    """Fix common OCR/footnote glue in Penguin/Lee/Broadhurst texts."""
    # Digits glued between letters (footnote markers): Jayhānī,19the → Jayhānī, the
    text = re.sub(r"(?<=\w)\d{1,3}(?=[A-Za-z])", " ", text)
    # Footnote digits after letters/quotes — do NOT strip after commas (thousands)
    text = re.sub(r"(?<=[A-Za-z'’\)])\d{1,2}\b", "", text)
    # "word.26As" → "word. As"
    text = re.sub(r"([.!?])(\d{1,3})(?=[A-Z])", r"\1 ", text)
    # Spaces around italic-stripped Arabic tokens: oftheamīr → of the amīr
    for tok in (
        "amīr", "amir", "khutba", "minbar", "farsakh", "dirham", "dānaq",
        "ghulām", "ribāt", "qadi", "qāḍī", "sultan", "sultān", "shaykh",
        "imām", "imam", "zakat", "hajj", "haram", "mihrab",
    ):
        text = re.sub(rf"(?<=[A-Za-z])({tok})", r" \1", text, flags=re.I)
        text = re.sub(rf"({tok})(?=[A-Za-z])", r"\1 ", text, flags=re.I)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text


def condense(body: str, max_words: int = 380) -> str:
    body = polish_prose(body)
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    cleaned: list[str] = []
    for p in paras:
        if re.match(r"^[=—\-_]{3,}$", p):
            continue
        # Drop isolated short pious ejaculations
        if len(p.split()) <= 12 and re.search(
            r"^(praise be|may god|there is no god|god is|and him)", p, re.I
        ):
            continue
        # Skip Lee epitomator boilerplate openings
        if re.match(
            r"^(IN THE NAME OF|PRAISE be ascribed|The poor, and needy|"
            r"The Sheikh Ibn Batūta|Ibn Jazzi El Kelbi states)",
            p,
        ):
            continue
        cleaned.append(p)
    if not cleaned:
        return body.strip()[:2000]
    text = " ".join(cleaned)
    text = re.sub(r"\s+", " ", text).strip()
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


def paras_matching(body: str, keywords: list[str], window: int = 1) -> str:
    """Return paragraphs containing any keyword, plus neighbors."""
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    if not paras:
        return body
    keys = [k.lower() for k in keywords]
    hits: set[int] = set()
    for i, p in enumerate(paras):
        low = p.lower()
        if any(k in low for k in keys):
            for j in range(max(0, i - window), min(len(paras), i + window + 1)):
                hits.add(j)
    if not hits:
        return ""
    return "\n\n".join(paras[i] for i in sorted(hits))


def write_lore(
    out: Path,
    *,
    title: str,
    source: str,
    bands: list[dict],
    places: list[dict],
    stories: list[dict],
    coverage: list[dict],
    chapter_count: int,
    missing: list[str],
) -> None:
    doc = {
        "meta": {
            "title": title,
            "source": source,
            "language": "en",
            "zhStatus": "pending",
            "chapterCount": chapter_count,
            "placeCount": len(places),
            "storyCount": len(stories),
            "missingChapterIds": missing,
        },
        "bands": bands,
        "places": places,
        "stories": stories,
        "coverage": coverage,
    }
    out.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"places={len(places)} stories={len(stories)} chapters={chapter_count} missing={len(missing)}")
    print(f"Wrote {out}")


def load_raw(name: str) -> dict[str, Any]:
    return json.loads((BOOKS / name).read_text(encoding="utf-8"))


def cite(chapter_ids: list[str] | str, extra: dict | None = None) -> dict:
    if isinstance(chapter_ids, str):
        chapter_ids = [chapter_ids]
    src: dict[str, Any] = {"chapterIds": chapter_ids}
    if len(chapter_ids) == 1:
        src["chapterId"] = chapter_ids[0]
    if extra:
        src.update(extra)
    return src
