#!/usr/bin/env python3
"""Build the key-level text quality/review queue.

This is an evidence inventory, not an automatic literary approval. It records
source/translation hashes, conservative style flags, source declaration and a
stable path back to each authoring section so an editor can sign a batch later.
"""
from __future__ import annotations

import csv
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STORY = ROOT / "content" / "story"
OUT = ROOT / "docs" / "library_audit" / "text_quality_review_inventory.csv"


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def sha(value: str) -> str:
    return hashlib.sha256(norm(value).encode("utf-8")).hexdigest()[:12]


def parse_frontmatter(text: str):
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end < 0:
        return {}
    fields = {}
    for line in text[4:end].splitlines():
        match = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if match:
            fields[match.group(1)] = match.group(2).strip()
    return fields


def parse_entries(text: str):
    matches = list(re.finditer(r"^##\s+(\S+)\s*$", text, re.M))
    entries = {}
    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        entries[match.group(1)] = text[match.end():end].strip()
    return entries


def key_kind(key: str) -> str:
    if ".body" in key:
        return "body"
    if ".choice_" in key or ".choice." in key:
        return "choice_or_result"
    if ".title" in key or key.endswith(".name") or ".subtitle" in key:
        return "title_or_name"
    if ".market." in key:
        return "market"
    if key.startswith("book."):
        return "book"
    if key.startswith("codex.") or key.startswith("sticker."):
        return "codex_or_sticker"
    return "ui_or_other"


def style_flags(key: str, en: str, zh: str):
    flags = []
    if not en or not zh:
        flags.append("missing_text")
    if en and zh and norm(en) == norm(zh):
        flags.append("identical_en_zh")
    if re.search(r"银钱易手|一注钱款进出|囊中为之或增或减|货物易手|货舱又添了几分", zh):
        flags.append("ambiguous_effect_language")
    if re.search(r"或增或减|Money moves|Coin changes hands|a little the better or the worse", en):
        flags.append("ambiguous_effect_language")
    if re.search(r"玩家|源文|译文|效果|事件ID|制作|机器翻译|机译|审校", zh):
        flags.append("production_meta_or_player_label")
    # ``player`` is ordinary period prose too (for example, a pipa player).
    # Flag only explicit production/UI wording so the queue stays actionable.
    if re.search(r"\b(player[- ](?:facing|choice|input|label)|source text|translation|effects|event ID|machine translation)\b", en, re.I):
        flags.append("production_meta_or_player_label")
    if "�" in en or "�" in zh or "[TODO]" in en or "[TODO]" in zh:
        flags.append("replacement_or_placeholder")
    # These patterns are review prompts, not automatic errors.
    if key_kind(key) in {"body", "book"} and len(zh) < 24:
        flags.append("short_body_needs_context_review")
    return ";".join(dict.fromkeys(flags)) or "none"


def history_status(meta: dict, unit: str, key: str) -> str:
    if key.startswith("book.") or unit == "books":
        return "book_source_status_pending"
    if meta.get("role") == "source" and meta.get("voice"):
        return "source_declared_citation_pending"
    if meta.get("role") == "source":
        return "source_declared_citation_pending"
    return "authored_or_unknown_history"


def evidence_path(unit: str, key: str) -> str:
    return f"content/story/{unit}/en.md#{key};content/story/{unit}/zh.md#{key}"


def main() -> None:
    rows = []
    for en_path in sorted(STORY.glob("*/en.md")):
        unit = en_path.parent.name
        zh_path = en_path.with_name("zh.md")
        en_text = en_path.read_text(encoding="utf-8")
        zh_text = zh_path.read_text(encoding="utf-8") if zh_path.exists() else ""
        meta = parse_frontmatter(en_text)
        en_entries = parse_entries(en_text)
        zh_entries = parse_entries(zh_text)
        for key in sorted(set(en_entries) | set(zh_entries)):
            en = en_entries.get(key, "")
            zh = zh_entries.get(key, "")
            flags = style_flags(key, en, zh)
            rows.append({
                "unit": unit,
                "key": key,
                "key_kind": key_kind(key),
                "en_sha256_12": sha(en),
                "zh_sha256_12": sha(zh),
                "en_chars": len(en),
                "zh_chars": len(zh),
                "style_flags": flags,
                "style_status": "flagged_for_editor" if flags != "none" else "machine_clear_pending_human",
                "history_status": history_status(meta, unit, key),
                "review_status": "unreviewed_current_hash",
                "evidence": evidence_path(unit, key),
                "pending_review": "人工确认语言、来源定位、文化语境与运行路径；机器清单不等于签署",
            })
    fields = list(rows[0]) if rows else []
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    flagged = sum(row["style_status"] == "flagged_for_editor" for row in rows)
    print(f"TEXT_QUALITY_INVENTORY: {len(rows)} keys / {len(set(r['unit'] for r in rows))} units / {flagged} flagged")


if __name__ == "__main__":
    main()
