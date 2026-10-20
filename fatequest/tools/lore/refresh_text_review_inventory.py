#!/usr/bin/env python3
"""Refresh the 140-unit text review ledger against current authoring files.

The ledger's review claims and evidence prose are preserved. Only mechanical
facts (keys, current stamps, hashes and counts) are refreshed so a source edit
cannot leave the inventory claiming an old file revision.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / "docs/library_audit/text_review_inventory.csv"


def file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def norm(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def prose_hash(value: str) -> str:
    return hashlib.sha256(norm(value).encode("utf-8")).hexdigest()[:12]


def parse(path: Path):
    text = path.read_text(encoding="utf-8")
    end = text.find("\n---", 3) if text.startswith("---") else -1
    raw = text[4:end] if end > 0 else ""
    stamps = {}
    nested = False
    for line in raw.splitlines():
        if line.strip() == "stamps:":
            nested = True
            continue
        if nested:
            match = re.match(r"^\s+([\w.-]+):\s*(\S+)", line)
            if match:
                stamps[match.group(1)] = match.group(2)
                continue
            if line and not line[0].isspace():
                nested = False
    body = text[end + 4:] if end > 0 else text
    matches = list(re.finditer(r"^##\s+(\S+)\s*$", body, re.M))
    entries = {}
    for i, match in enumerate(matches):
        stop = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        entries[match.group(1)] = body[match.end():stop].strip()
    return entries, stamps


def main() -> None:
    rows = list(csv.DictReader(LEDGER.open(encoding="utf-8")))
    totals = {"stamp_current": 0, "stamp_stale": 0, "stamp_absent": 0, "identical": 0}
    for row in rows:
        en_path = ROOT / row["en_path"]
        zh_path = ROOT / row["zh_path"]
        en, _ = parse(en_path)
        zh, stamps = parse(zh_path)
        all_keys = set(en) | set(zh)
        missing = sorted(set(en) - set(zh))
        extra = sorted(set(zh) - set(en))
        current = [k for k in en if k in stamps and stamps[k] == prose_hash(en[k])]
        stale = [k for k in en if k in stamps and stamps[k] != prose_hash(en[k])]
        absent = [k for k in en if k not in stamps]
        identical = [k for k in en if k in zh and norm(en[k]) == norm(zh[k])]
        row.update({
            "en_keys": str(len(en)),
            "zh_keys": str(len(zh)),
            "missing_zh_keys": ";".join(missing),
            "extra_zh_keys": ";".join(extra),
            "explicit_stamp_current": str(len(current)),
            "explicit_stamp_stale": str(len(stale)),
            "stamp_absent": str(len(absent)),
            "tool_unparsed_hyphen_stamps": "0",
            "missing_stamp_keys": ";".join(absent),
            "identical_en_zh": str(len(identical)),
            "en_file_sha256": file_sha(en_path),
            "zh_file_sha256": file_sha(zh_path),
        })
        totals["stamp_current"] += len(current)
        totals["stamp_stale"] += len(stale)
        totals["stamp_absent"] += len(absent)
        totals["identical"] += len(identical)
    with LEDGER.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=rows[0].keys(), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    summary_path = ROOT / "docs/library_audit/text_inventory_summary.json"
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    summary.update({
        "stamp_current": totals["stamp_current"],
        "stamp_stale": totals["stamp_stale"],
        "stamp_absent": totals["stamp_absent"],
        "tool_unparsed_hyphen_stamps": 0,
    })
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"TEXT_REVIEW_INVENTORY: {len(rows)} units / {totals['stamp_current']} current / {totals['stamp_stale']} stale / {totals['stamp_absent']} missing")


if __name__ == "__main__":
    main()
