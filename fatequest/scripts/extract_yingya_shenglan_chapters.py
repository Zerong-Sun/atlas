#!/usr/bin/env python3
"""Extract country sections from Yingya Shenglan Ji (EN).

Zhang Sheng's abridgement of Ma Huan — 19 polities visited on Zheng He's voyages.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOKS = ROOT / "assets" / "books"
SRC = BOOKS / "07_Yingya_Shenglan_Ji_EN.txt"
OUT = BOOKS / "_yingya_shenglan_chapters_raw.json"

HASH_SECTION_RE = re.compile(
    r"^############################################################\n"
    r"# (.+?)\n"
    r"############################################################\n",
    re.MULTILINE,
)

# Chinese heading → canonical English place name(s)
PLACE_MAP: dict[str, tuple[str, list[str]]] = {
    "占城": ("Champa", ["Champa", "Zhancheng", "Xinzhou"]),
    "爪哇": ("Java", ["Java", "Majapahit", "Tuban", "Gresik", "Surabaya"]),
    "旧港国": ("Palembang (Old Port / Srivijaya)", ["Palembang", "Old Port", "Srivijaya", "Jiugang"]),
    "暹罗": ("Siam", ["Siam", "Ayutthaya", "Xianluo"]),
    "满刺加": ("Malacca", ["Malacca", "Melaka", "Manlajia"]),
    "哑鲁国 【 小国也】": ("Aru", ["Aru", "Yalu"]),
    "哑鲁国": ("Aru", ["Aru", "Yalu"]),
    "苏门荅刺　那孤儿 【 小国】 黎伐国 【 亦小】": (
        "Samudra-Pasai, Nakur, and Lide",
        ["Samudra", "Pasai", "Sumatra", "Nakur", "Lide"],
    ),
    "黎伐": ("Lide (Lifa)", ["Lide", "Lifa", "Li Fa"]),
    "南泥里": ("Lambri (Nanboli)", ["Lambri", "Nanboli", "Aceh"]),
    "锡兰　裸形": ("Ceylon and the Naked Isle", ["Ceylon", "Sri Lanka", "Xilan", "Nicobar"]),
    "小葛兰": ("Quilon (Xiaogelan)", ["Quilon", "Kollam", "Xiaogelan"]),
    "柯枝": ("Cochin (Kezhi)", ["Cochin", "Kochi", "Kezhi"]),
    "古俚": ("Calicut (Guli)", ["Calicut", "Kozhikode", "Guli"]),
    "溜山": ("Maldives (Liushan)", ["Maldives", "Liushan"]),
    "祖法儿": ("Dhofar (Zufar)", ["Dhofar", "Zufar", "Zafar"]),
    "阿丹国": ("Aden", ["Aden", "Adan"]),
    "榜葛刺国": ("Bengal", ["Bengal", "Banggela", "Sonargaon"]),
    "忽鲁谟厮国": ("Hormuz", ["Hormuz", "Ormuz", "Hulumosi"]),
}


def clean_body(text: str) -> str:
    # Drop ○ title line if present
    text = re.sub(r"^○[^\n]+\n+", "", text.strip())
    # Drop colophon at end of Hormuz
    text = re.sub(
        r"(?s)Correctional Officer.*$",
        "",
        text,
    )
    # Soften OCR junk markers
    text = re.sub(r"■\s*[〈<][^〉>]+[〉>]", "", text)
    text = re.sub(r"■\s*\"[^\"]+\"", "", text)
    # Insert spaces after sentence punctuation glued to next capital
    text = re.sub(r"([.!?])([A-Z])", r"\1 \2", text)
    # Break into paragraphs roughly by sentence clusters
    text = re.sub(r"\s+", " ", text).strip()
    # Split into ~3–6 sentence paragraphs for condense()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    paras: list[str] = []
    buf: list[str] = []
    for s in sentences:
        if not s.strip():
            continue
        buf.append(s.strip())
        if len(buf) >= 3:
            paras.append(" ".join(buf))
            buf = []
    if buf:
        paras.append(" ".join(buf))
    return "\n\n".join(paras)


def main() -> None:
    text = unicodedata.normalize("NFC", SRC.read_text(encoding="utf-8", errors="replace"))
    sections = list(HASH_SECTION_RE.finditer(text))
    chapters: list[dict] = []
    seq = 0

    for idx, m in enumerate(sections):
        heading = m.group(1).strip()
        if heading.upper().startswith("PREFACE"):
            continue
        start = m.end()
        end = sections[idx + 1].start() if idx + 1 < len(sections) else len(text)
        body_raw = text[start:end]
        mapped = PLACE_MAP.get(heading)
        if not mapped:
            # fuzzy: strip bracket notes
            key = re.sub(r"\s*【.*?】", "", heading).strip()
            mapped = PLACE_MAP.get(key) or PLACE_MAP.get(heading.split()[0] if heading else "")
        if mapped:
            title, names = mapped
        else:
            # fall back to ○ English title line
            om = re.search(r"^○\s*(.+)$", body_raw, re.MULTILINE)
            title = om.group(1).strip() if om else heading
            names = [title]
        body = clean_body(body_raw)
        if len(body.split()) < 30:
            continue
        seq += 1
        cid = f"yingya-c{seq:03d}"
        chapters.append({
            "id": cid,
            "chapter": seq,
            "chapterTitle": title,
            "placeNames": names,
            "zhHeading": heading,
            "rawBody": body,
            "wordCount": len(body.split()),
        })

    OUT.write_text(
        json.dumps({"chapters": chapters, "count": len(chapters)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(chapters)} countries → {OUT}")
    for c in chapters:
        print(f"  {c['id']:14s} {c['wordCount']:4d}w  {c['chapterTitle']}")


if __name__ == "__main__":
    main()
