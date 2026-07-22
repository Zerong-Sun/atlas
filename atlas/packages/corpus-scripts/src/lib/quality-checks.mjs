import {
  REQUIRED_CHUNK_FIELDS,
  REQUIRED_SOURCE_TYPES,
} from "./chunk-schema.mjs";

const COPYRIGHT_FIELDS = ["source_type", "license_note"];

export function runQualityChecks({ manifest, chunks }) {
  const errors = [];
  const warnings = [];
  const stats = {
    chunk_count: chunks.length,
    copyright_coverage: 0,
    empty_required: 0,
    unknown_source_id: 0,
    duplicate_ids: 0,
    public_domain_missing_original: 0,
  };

  const manifestSourceIds = new Set(manifest.sources.map((s) => s.id));
  const seenIds = new Set();

  for (const chunk of chunks) {
    for (const field of REQUIRED_CHUNK_FIELDS) {
      if (!(field in chunk)) {
        errors.push(`chunk ${chunk.id ?? "?"}: missing field ${field}`);
        stats.empty_required++;
      } else if (
        field !== "keywords" &&
        field !== "verbatim_allowed" &&
        typeof chunk[field] === "string" &&
        chunk[field].trim() === ""
      ) {
        if (field === "original_text" && chunk.source_type === "self_authored") {
          /* allowed empty original for self_authored */
        } else {
          errors.push(`chunk ${chunk.id}: empty required field ${field}`);
          stats.empty_required++;
        }
      }
    }

    if (!chunk.keywords?.length) {
      errors.push(`chunk ${chunk.id}: keywords must be non-empty array`);
    }

    if (!REQUIRED_SOURCE_TYPES.has(chunk.source_type)) {
      errors.push(`chunk ${chunk.id}: invalid source_type ${chunk.source_type}`);
    }

    const hasCopyright = COPYRIGHT_FIELDS.every(
      (f) => typeof chunk[f] === "string" && chunk[f].trim() !== "",
    );
    if (hasCopyright) stats.copyright_coverage++;

    if (!manifestSourceIds.has(chunk.source_id)) {
      errors.push(`chunk ${chunk.id}: unknown source_id ${chunk.source_id}`);
      stats.unknown_source_id++;
    }

    if (chunk.source_type === "public_domain" && !chunk.original_text?.trim()) {
      errors.push(`chunk ${chunk.id}: public_domain requires original_text`);
      stats.public_domain_missing_original++;
    }

    if (
      chunk.source_type === "self_authored" &&
      !chunk.translation_zh?.trim() &&
      !chunk.annotation_zh?.trim()
    ) {
      errors.push(`chunk ${chunk.id}: self_authored requires translation_zh or annotation_zh`);
    }

    if (seenIds.has(chunk.id)) {
      errors.push(`duplicate chunk id: ${chunk.id}`);
      stats.duplicate_ids++;
    }
    seenIds.add(chunk.id);
  }

  stats.copyright_coverage_pct =
    chunks.length === 0 ? 0 : Math.round((stats.copyright_coverage / chunks.length) * 100);

  for (const src of manifest.sources) {
    for (const f of ["id", "title", "tradition", "source_type", "license_note"]) {
      if (!src[f]?.trim?.() && !src[f]) {
        errors.push(`manifest source ${src.id ?? "?"}: missing ${f}`);
      }
    }
  }

  if (chunks.length < 500) {
    errors.push(`chunk count ${chunks.length} < MVP minimum 500`);
  }

  if (stats.copyright_coverage_pct < 100) {
    errors.push(`copyright field coverage ${stats.copyright_coverage_pct}% (required 100%)`);
  }

  return { ok: errors.length === 0, errors, warnings, stats };
}
