import { readFileSync } from "fs";
import { MANIFEST_PATH } from "./paths.mjs";

/** Minimal YAML parser for corpus manifest (no external deps). */
export function parseManifestYaml(text) {
  const result = { version: "", language: "", sources: [] };
  let current = null;
  let inSources = false;

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed === "sources:") {
      inSources = true;
      continue;
    }

    if (!inSources) {
      const m = trimmed.match(/^(\w+):\s*(.+)$/);
      if (m) result[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
      continue;
    }

    if (trimmed.startsWith("- id:")) {
      current = { id: trimmed.replace("- id:", "").trim() };
      result.sources.push(current);
      continue;
    }

    if (current && trimmed.includes(":")) {
      const idx = trimmed.indexOf(":");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      current[key] = val;
    }
  }

  return result;
}

export function loadManifest() {
  const text = readFileSync(MANIFEST_PATH, "utf8");
  return parseManifestYaml(text);
}
