#!/usr/bin/env node
// verify_pck.mjs — O1 PCK export gate.
//
// Parses the Godot 4 PCK directory (format v4, as shipped by Godot 4.7 —
// PR godotengine/godot#105757 moved the directory to the end of the file)
// without launching the engine, and asserts the exported pack carries
// everything a player needs and nothing the source tree shipped for authors:
//   required  res://game/screens/main.tscn, res://content/world/vector_map.json
//   excluded  content/story/**, docs/**, tests/**, tools/**, worldmap/**,
//             assets/art/_archive/**, assets/art/_sheets/**
//
// PCK v4 header:
//   uint32 magic "GDPC"; uint32 version(4); uint32 major/minor/patch;
//   uint32 flags (bit1 = relative file base); uint64 file_base (rel. to magic);
//   uint64 dir_offset (rel. to magic); 16 × uint32 reserved;
// Directory at dir_offset: uint32 file_count, then per file:
//   uint32 name_len; name bytes (UTF-8 + zero pad to 4 bytes, name_len already
//   includes that padding — pck_packer.cpp flush()); uint64 ofs (rel. to
//   file_base); uint64 size; 16 bytes md5; uint32 file_flags.
//
// Usage: node tools/validate/verify_pck.mjs [path-to.pck]

import { readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pckPath = process.argv[2] ?? join(ROOT, "build", "audit", "FateQuest.pck");

if (!existsSync(pckPath)) {
  console.error(`verify_pck: ${pckPath} not found`);
  process.exit(1);
}

const buf = readFileSync(pckPath);

if (buf.toString("latin1", 0, 4) !== "GDPC") {
  console.error("verify_pck: bad magic — not a Godot PCK");
  process.exit(1);
}
let o = 4;
const version = buf.readUInt32LE(o); o += 4;
if (version !== 4) {
  console.error(`verify_pck: unsupported pack version ${version} (expected 4)`);
  process.exit(1);
}
const verMajor = buf.readUInt32LE(o); o += 4;
const verMinor = buf.readUInt32LE(o); o += 4;
const verPatch = buf.readUInt32LE(o); o += 4;
const flags = buf.readUInt32LE(o); o += 4;
const fileBase = Number(buf.readBigUInt64LE(o)); o += 8;
const dirOffset = Number(buf.readBigUInt64LE(o)); o += 8;
o += 16 * 4; // reserved

const dir = dirOffset;
const fileCount = buf.readUInt32LE(dir); o = dir + 4;
const files = [];
for (let i = 0; i < fileCount; i++) {
       const nameLen = buf.readUInt32LE(o); o += 4;
       const name = buf.toString("utf8", o, o + nameLen).replace(/\0+$/, ""); o += nameLen;
       const relOfs = Number(buf.readBigUInt64LE(o)); o += 8;
  const size = Number(buf.readBigUInt64LE(o)); o += 8;
  o += 16; // md5
  const fileFlags = buf.readUInt32LE(o); o += 4;
  files.push({
    path: name,
    offset: fileBase + relOfs,
    size,
    flags: fileFlags,
  });
}

const names = files.map((f) => f.path.replace(/^res:\/\//, ""));
const has = (p) => names.includes(p);

// The main scene ships as a binary .scn behind a .remap shim when the export
// converts text resources, so accept either form.
const hasScene = has("game/screens/main.tscn")
  || has("game/screens/main.tscn.remap");

const required = [
  "game/map/art_wire_index.json",
  "content/world/map_tiles.json",
  "content/world/vector_map.json",
  "content/world/world_config.json",
  "content/world/mountains.json",
  "content/tables/routes.json",
  "content/tables/divinations.json",
  "content/tables/archetypes.json",
  "content/tables/books.json",
  "content/tables/goods.json",
  "content/tables/endings.json",
  "content/tables/retainers.json",
  "content/tables/transports.json",
  "content/tables/divination_lessons.json",
  "content/tables/cities/china.json",
  "content/tables/events/entry.json",
  "content/tables/events/site.json",
  "content/tables/events/consequence_12.json",
  "content/i18n/en.json",
  "content/i18n/zh.json",
];
const requiredMissing = required.filter((p) => !has(p));
if (!hasScene) requiredMissing.push("game/screens/main.tscn");

const excludePrefixes = [
  "content/story/", "docs/", "tests/", "tools/", "worldmap/",
  "assets/art/_archive/", "assets/art/_sheets/",
];
const excludedLeak = names.filter((n) =>
  excludePrefixes.some((p) => n.startsWith(p)));
const removed = files.filter((f) => (f.flags & 2) !== 0).length;

console.log(`verify_pck: ${pckPath}`);
console.log(`  engine ${verMajor}.${verMinor}.${verPatch} pack_v${version} flags=0x${flags.toString(16)}`);
console.log(`  files=${files.length} size=${(statSync(pckPath).size / 1_000_000).toFixed(2)}MB dir@${dirOffset}`);
console.log(`  ${hasScene ? "ok   " : "MISSING "} game/screens/main.tscn ${hasScene ? "(via .remap)" : ""}`);
for (const p of required) {
  const f = files.find((x) => x.path === p || x.path === "res://" + p);
  console.log(`  ${f ? "ok   " : "MISSING "} ${p}${f ? ` (${f.size} B)` : ""}`);
}
if (removed) console.error(`  ${removed} removal-marked files`);
for (const p of requiredMissing) console.error(`  MISSING required ${p}`);
for (const p of excludedLeak) console.error(`  LEAK excluded ${p}`);

const ok = requiredMissing.length === 0 && excludedLeak.length === 0
  && removed === 0;
console.log(`verify_pck: ${ok ? "PASS" : "FAIL"}`);
process.exit(ok ? 0 : 1);
