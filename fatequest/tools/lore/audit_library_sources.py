#!/usr/bin/env python3
"""Inventory local book evidence; reference counts are not editorial approval."""
import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOKS = ROOT / "assets/books"
OUT = ROOT / "docs/library_audit"
RAW = {
    "marco-polo": ("_marco_chapters_raw.json", [
        "01_The_Travels_of_Marco_Polo_Vol1_Marco_Polo.txt",
        "02_The_Travels_of_Marco_Polo_Vol2_Marco_Polo.txt"]),
    "ibn-battuta": ("_ibn_battuta_chapters_raw.json", ["03_The_Travels_of_Ibn_Battuta.txt"]),
    "ibn-fadlan": ("_ibn_fadlan_chapters_raw.json", ["04_Ibn_Fadlan_and_the_Land_of_Darkness.txt"]),
    "ibn-jubayr": ("_ibn_jubayr_chapters_raw.json", ["05_The_Travels_of_Ibn_Jubayr.txt"]),
    "mendes-pinto": ("_mendes_pinto_chapters_raw.json", [
        "06_Peregrinacao_Fernao_Mendes_Pinto_PT.txt", "06_Peregrinacao_Fernao_Mendes_Pinto_EN.txt"]),
    "yingya-shenglan": ("_yingya_shenglan_chapters_raw.json", [
        "07_Yingya_Shenglan_Ji_ZH.txt", "07_Yingya_Shenglan_Ji_EN.txt"]),
}


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def table(name):
    paths = sorted((ROOT / f"content/tables/{name}").glob("*.json"))
    return [r for p in paths for r in read(p).get("records", [])]


def write_csv(name, rows):
    assert rows
    with (OUT / name).open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    desk = {b["corpus"]: b for b in read(ROOT / "content/tables/books.json")["records"]}
    cities, events = table("cities"), table("events")
    cards = read(BOOKS / "reading_cards.json")["cards"]
    corpus_rows, passage_rows = [], []
    for path in sorted(BOOKS.glob("*-lore.json")):
        corpus = path.name.removesuffix("-lore.json")
        data = read(path)
        meta = data.get("meta", {})
        chapter_file, raw_files = RAW.get(corpus, ("", []))
        chapters = read(BOOKS / chapter_file)["chapters"] if chapter_file else []
        chapter_ids = {c["id"] for c in chapters}
        linked_cities = [c["id"] for c in cities
                         if c.get("lore", {}).get("ref", {}).get("book") == corpus]
        linked_alt = [c["id"] for c in cities if any(
            ref.get("book") == corpus for ref in c.get("altRefs", []))]
        linked_events = [e["id"] for e in events
                         if e.get("lore", {}).get("ref", {}).get("book") == corpus]
        linked_cards = [c["id"] for c in cards if (c.get("source") or {}).get("book") == corpus]
        notes = ["逐条原书核对及编辑签署未齐"]
        if not raw_files:
            notes.append("活动书库无完整原文与拆章文件；不能称整书拆解")
        if corpus in {"ibn-fadlan", "ibn-jubayr"}:
            notes.append("现代译本版本记录与旧公域总声明冲突；授权或替代底本待核验")
        if corpus == "ibn-fadlan":
            notes.append("212节为多作者选集；逐节作者/年代须拆分")
        if corpus == "yingya-shenglan":
            notes.append("中文语料与EN拆章ID不一致；补中文原文锚点及跨语种映射")
        if corpus == "mendes-pinto":
            notes.append("明确机译/OCR残损；保持desk_only，重校前不作城市证据")
        if corpus == "mandeville":
            notes.append("仅传说用途；不得作城市事实证据")
        corpus_rows.append({
            "corpus": corpus, "path": str(path.relative_to(ROOT)),
            "places": len(data.get("places", [])), "stories": len(data.get("stories", [])),
            "source_declaration": meta.get("source", ""),
            "raw_files": ";".join("assets/books/" + f for f in raw_files),
            "raw_files_present": all((BOOKS / f).is_file() for f in raw_files) if raw_files else False,
            "chapter_file": "assets/books/" + chapter_file if chapter_file else "",
            "chapter_count": len(chapters),
            "zh_status_declared": meta.get("zhStatus", ""),
            "desk_status_declared": desk.get(corpus, {}).get("status", "not_on_desk"),
            "city_primary_refs": len(linked_cities), "city_alt_refs": len(linked_alt),
            "event_direct_refs": len(linked_events), "verified_source_cards": len(linked_cards),
            "linked_city_ids": ";".join(linked_cities), "linked_alt_city_ids": ";".join(linked_alt),
            "linked_event_ids": ";".join(linked_events),
            "audit_status": "待逐条原典/文化/编辑复核", "gaps": "；".join(notes),
        })
        for kind in ("places", "stories"):
            for row in data.get(kind, []):
                body = row.get("body", "")
                source = row.get("source", {})
                refs = source.get("chapterIds") or [source.get("chapterId", "")]
                refs = [ref for ref in refs if ref]
                flags = []
                if "\ufffd" in body:
                    flags.append("确定含Unicode替代字符")
                if re.search(r"[\u3400-\u9fff]\?[\u3400-\u9fff]", body):
                    flags.append("疑似中文OCR缺字，待对原文")
                if not raw_files:
                    flags.append("无本地原文定位")
                if refs and any(ref not in chapter_ids for ref in refs):
                    flags.append("未在本地拆章ID找到对应；不等于运行引用失效")
                passage_rows.append({
                    "corpus": corpus, "kind": kind, "id": row["id"],
                    "title": row.get("title", ""), "path": str(path.relative_to(ROOT)),
                    "chapter_refs": ";".join(refs), "body_chars": len(body),
                    "body_sha256": hashlib.sha256(body.encode()).hexdigest(),
                    "replacement_char_count": body.count("\ufffd"),
                    "chapter_ids_resolve_locally": bool(refs) and all(ref in chapter_ids for ref in refs),
                    "review_state": "待逐条原典及改编审核",
                    "evidence_flags": "；".join(flags),
                })
    write_csv("book_inventory.csv", corpus_rows)
    write_csv("book_passage_review.csv", passage_rows)
    summary = {
        "corpora": len(corpus_rows), "passages": len(passage_rows),
        "places": sum(r["places"] for r in corpus_rows),
        "stories": sum(r["stories"] for r in corpus_rows),
        "with_raw_and_chapters": sum(r["raw_files_present"] and r["chapter_count"] > 0 for r in corpus_rows),
        "desk_books": len(desk), "reading_cards": len(cards),
        "reading_card_statuses": dict(Counter(c["status"] for c in cards)),
        "replacement_character_passages": sum(r["replacement_char_count"] > 0 for r in passage_rows),
        "caution": "Declared references and source labels are inventory facts, not approval or legal conclusions.",
    }
    (OUT / "book_audit_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
