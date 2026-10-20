#!/usr/bin/env python3
"""Verify the source fields in the generated cultural review queue.

This is deliberately a structural, offline check. It validates that every
candidate URL came from the local registry, that the three human-facing
source decisions are explicit, and that authored game text is not given a
fake historical citation. It does not turn a candidate into a citation and it
does not treat a network HEAD request as expert review.
"""

from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List


ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "docs" / "library_audit" / "cultural_review_queue.csv"
REGISTRY = ROOT / "tools" / "art" / "historical_source_registry.json"
OUT = ROOT / "docs" / "library_audit" / "historical_source_verification.json"

VALID_RESOLUTIONS = {"已附来源", "明确无来源", "待专家"}


def main() -> int:
    registry_doc: Dict[str, Any] = json.loads(REGISTRY.read_text(encoding="utf-8"))
    registry = {str(item["id"]): item for item in registry_doc.get("sources", [])}
    rows = list(csv.DictReader(QUEUE.open(encoding="utf-8", newline="")))
    errors: List[str] = []
    for row in rows:
        qid = row.get("queue_id", "<missing>")
        resolution = row.get("source_resolution", "")
        status = row.get("source_status", "")
        requested = row.get("source_requested") == "true"
        if resolution not in VALID_RESOLUTIONS:
            errors.append(f"{qid}: invalid source_resolution={resolution}")
        if status == "candidate_needs_expert":
            source_id = row.get("source_id", "")
            if source_id not in registry:
                errors.append(f"{qid}: candidate source_id is not in registry: {source_id}")
            for field in ("source_url", "source_title", "source_accessed_at"):
                if not row.get(field):
                    errors.append(f"{qid}: candidate missing {field}")
            if resolution != "待专家":
                errors.append(f"{qid}: candidate must be 待专家")
        elif status == "no_external_source":
            if row.get("source_url"):
                errors.append(f"{qid}: authored row unexpectedly has source_url")
            if resolution != "明确无来源":
                errors.append(f"{qid}: no_external_source must be 明确无来源")
        elif status == "attached_local_lore":
            if resolution != "已附来源":
                errors.append(f"{qid}: attached local lore must be 已附来源")
        elif status == "local_record_only":
            if resolution not in {"待专家", "明确无来源"}:
                errors.append(f"{qid}: local record has invalid decision={resolution}")
        else:
            errors.append(f"{qid}: unknown source_status={status}")
        if requested and resolution == "待专家" and status != "candidate_needs_expert":
            errors.append(f"{qid}: requested source is pending but has no candidate record")

    resolution_counts = Counter(row.get("source_resolution", "") for row in rows)
    status_counts = Counter(row.get("source_status", "") for row in rows)
    requested_rows = [row for row in rows if row.get("source_requested") == "true"]
    summary = {
        "queue_rows": len(rows),
        "source_requested_rows": len(requested_rows),
        "candidate_rows_with_url": sum(1 for row in rows if row.get("source_status") == "candidate_needs_expert" and row.get("source_url")),
        "explicit_no_external_source_rows": sum(1 for row in rows if row.get("source_status") == "no_external_source"),
        "resolution_counts": dict(sorted(resolution_counts.items())),
        "status_counts": dict(sorted(status_counts.items())),
        "registry_source_count": len(registry),
        "network_check": "not_run; URL reachability and claim-level fit require human review",
        "errors": errors,
    }
    OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
