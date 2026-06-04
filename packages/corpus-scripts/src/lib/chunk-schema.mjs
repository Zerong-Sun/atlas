/** Required fields on every seed chunk (copyright + retrieval). */
export const REQUIRED_CHUNK_FIELDS = [
  "id",
  "source_id",
  "tradition",
  "chapter",
  "section",
  "original_text",
  "translation_zh",
  "annotation_zh",
  "keywords",
  "source_type",
  "license_note",
  "verbatim_allowed",
];

export const REQUIRED_SOURCE_TYPES = new Set([
  "public_domain",
  "licensed",
  "self_authored",
]);

export function makeChunk({
  id,
  source_id,
  tradition,
  chapter,
  section,
  original_text,
  translation_zh,
  annotation_zh,
  keywords,
  source_type,
  license_note,
  source_url = null,
  verbatim_allowed = true,
  review_status = "ai_reviewed",
}) {
  return {
    id,
    source_id,
    tradition,
    chapter,
    section,
    original_text: original_text?.trim() ?? "",
    translation_zh: translation_zh?.trim() ?? "",
    annotation_zh: annotation_zh?.trim() ?? "",
    keywords: Array.isArray(keywords) ? keywords : [],
    source_type,
    license_note: license_note?.trim() ?? "",
    source_url,
    verbatim_allowed,
    review_status,
  };
}
