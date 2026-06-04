import { createHash } from "crypto";

/** Deterministic UUID v5-style id for stable corpus chunk primary keys. */
export function stableChunkUuid(slug) {
  const ns = Buffer.from("6ba7b8109dad11d180b400c04fd430c8", "hex");
  const hash = createHash("sha1").update(ns).update(`atlas:${slug}`).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = hash.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}
