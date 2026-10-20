"""Inventory artwork; visual observations apply only to reviewed file hashes."""
import csv
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/library_audit"
IMAGE_EXTENSIONS = {".webp", ".png", ".jpg", ".jpeg", ".svg"}


def visual_observation(path, sha256, records):
    """Do not inherit a visual verdict merely because a filename is unchanged."""
    record = records.get(path)
    if record is None:
        return None
    if sha256 != record["sha256"]:
        return {
            "visual_review": "needs_re_review",
            "content_status": "changed_asset_unreviewed",
            "note": "Asset changed since agent observation; prior SHA256 " + record["sha256"],
        }
    return {
        "visual_review": record["visual_review"],
        "content_status": record["content_status"],
        "note": record["observation"] + "; agent visual observation only; human art/history signoff pending",
    }


def image_metadata(path):
    try:
        if path.suffix.lower() == ".svg":
            svg = ET.fromstring(path.read_text())
            dimensions = svg.get("viewBox", "") or svg.get("width", "") + "x" + svg.get("height", "")
            return dimensions, "xml_parses_visual_unchecked", ""
        with Image.open(path) as image:
            image.load()
            dimensions = f"{image.width}x{image.height}"
            if image.width < 4 or image.height < 4:
                return dimensions, "degenerate_dimensions", ""
            if "A" in image.getbands() and image.getchannel("A").getextrema()[1] == 0:
                return dimensions, "fully_transparent", ""
            return dimensions, "decodes", ""
    except Exception as error:
        return "", "decode_error", str(error)


def missing_row(path, category, evidence, note, role="expected_missing"):
    return dict(path=path, category=category, role=role, exists="no", bytes=0,
                sha256="", dimensions="", technical_status="missing_file",
                registry_index="no", wiring_evidence="not_available", reference_paths=evidence,
                visual_review="not_applicable", content_status="missing_file", note=note)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    registry = set(json.loads((ROOT / "game/map/art_wire_index.json").read_text())["stems"])
    snapshot = json.loads((OUT / "art_visual_review_snapshot.json").read_text())
    records = dict(snapshot["records"])
    tarot_review = ROOT / "assets/decks/tarot/RWS_VISUAL_REVIEW.json"
    if tarot_review.exists():
        records.update(json.loads(tarot_review.read_text())["records"])
    for record in records.values():
        assert re.fullmatch(r"[a-f0-9]{64}", record["sha256"]), "invalid review hash"
        assert record["visual_review"].startswith("agent_visual_"), "non-agent review label"
    files = sorted(path for base in ["assets/art", "assets/decks", "assets/astrodice"]
                   for path in (ROOT / base).rglob("*") if path.is_file() and path.name != ".DS_Store")
    texts = {str(path.relative_to(ROOT)): path.read_text(errors="replace")
             for base in ["game", "core", "content/tables"] for path in (ROOT / base).rglob("*")
             if path.suffix in [".gd", ".json", ".tscn"] and path.name != "art_wire_index.json"}
    rows = []
    for path in files:
        relative = path.relative_to(ROOT).as_posix()
        extension, stem = path.suffix.lower(), path.stem
        is_image = extension in IMAGE_EXTENSIONS
        role = "archive" if "/_archive/" in relative or "/_legacy_cloud_ridge/" in relative else (
            "source_reference" if "/_sources_rws/" in relative else (
            "source_sheet" if "/_sheets/" in relative else "production_candidate"))
        category = "metadata"
        if is_image:
            category = "art/" + stem.split("-")[0] if path.parent == ROOT / "assets/art" else \
                "/".join(path.relative_to(ROOT / "assets").parts[:2])
        sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
        dimensions, technical, note = image_metadata(path) if is_image else ("", "not_image", "")
        references = [filename for filename, text in texts.items()
                      if relative in text or '"' + stem + '"' in text or "'" + stem + "'" in text] if is_image else []
        wiring = role + "_not_runtime" if role != "production_candidate" else (
            "literal_reference_not_runtime_proof" if references else (
                "registry_only_not_runtime_proof" if stem in registry else "no_literal_reference_found"))
        content = "unknown_requires_review" if is_image else "not_applicable"
        if relative.startswith("assets/decks/iching/") and extension == ".webp":
            wiring = "runtime_manifest_resolver"
            references = ["game/map/map_art.gd:hexagram_face", "assets/decks/iching/DECK_MANIFEST.json"]
        if path.parent == ROOT / "assets/decks/tarot" and extension == ".webp":
            wiring = "runtime_resolver"
            references = ["game/map/map_art.gd:tarot_card", "game/ui/divination_result.gd"]
            note = "Complete RWS profile resolves through hash-traced DECK_MANIFEST.json; lossless conversion only; human art/history signoff pending"
        if relative.startswith("assets/decks/lenormand/") and extension == ".jpg":
            wiring = "runtime_resolver"
            references = ["game/map/map_art.gd:lenormand_card", "game/ui/divination_result.gd"]
            note = "JPG resolves through MapArt.lenormand_card; source attribution is separate and full-deck review is pending"
        if relative.startswith("assets/astrodice/") and is_image:
            wiring = "runtime_resolver"
            references = ["game/map/map_art.gd:astrodice_symbol", "game/ui/divination_result.gd"]
            note = "SVG resolves through MapArt.astrodice_symbol; symbol-by-symbol visual review is pending"
        row = dict(path=relative, category=category, role=role, exists="yes", bytes=path.stat().st_size,
                   sha256=sha256, dimensions=dimensions, technical_status=technical,
                   registry_index="yes" if stem in registry else "no", wiring_evidence=wiring,
                   reference_paths=";".join(references), visual_review="not_visually_reviewed" if is_image else "not_applicable",
                   content_status=content, note=note)
        observation = visual_observation(relative, sha256, records)
        if observation is not None:
            row.update(observation)
        rows.append(row)
    tarot = sorted(set(re.findall(r"`(tarot-[\w-]+\.webp)`",
                                 (ROOT / "assets/art/ART_PROMPTS_TAROT_DECK.md").read_text())))
    expected = [(f"assets/decks/tarot/{name}", "decks/tarot") for name in tarot]
    expected += [(f"assets/art/retainer-{job}-{culture}.webp", "art/retainer")
                 for culture in ["con", "mazu"]
                 for job in ["guide", "porter", "guard", "scribe", "lang", "heal", "sail", "monk", "seer"]]
    for path, category in expected:
        if not (ROOT / path).exists():
            rows.append(missing_row(path, category, "assets/art/ART_PROMPTS_TAROT_DECK.md" if "tarot" in path
                                    else "docs/ART_REQUIREMENTS.md section 7.3",
                                    "Historical requirement; review identity and scene requirements before new art"))
    present_rows = {row["path"] for row in rows}
    for path, record in records.items():
        if path not in present_rows:
            rows.append(missing_row(path, "review_snapshot", "docs/library_audit/art_visual_review_snapshot.json",
                                    "Previously observed source is missing; reviewed SHA256 " + record["sha256"],
                                    role="reviewed_asset_missing"))
    with (OUT / "art_inventory.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    images = [row for row in rows if row["technical_status"] not in ["not_image", "missing_file"]]
    summary = dict(files=len(files), rows=len(rows), images=len(images),
                   image_counts_by_role=dict(Counter(row["role"] for row in images)),
                   visual_review_counts=dict(Counter(row["visual_review"] for row in images)),
                   art_root=len(list((ROOT / "assets/art").glob("*.webp"))), registry=len(registry),
                   technical=dict(Counter(row["technical_status"] for row in rows)),
                   missing=dict(Counter(row["category"] for row in rows if row["exists"] == "no")),
                   tarot_expected=len(tarot), tarot_actual=len(list((ROOT / "assets/decks/tarot").glob("*.webp"))),
                   iching_actual=len(list((ROOT / "assets/decks/iching").glob("*.webp"))))
    (OUT / "art_inventory_summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
