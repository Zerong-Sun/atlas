#!/usr/bin/env node
/**
 * Apply T3 city site batches into events, city tables, and story markdown.
 *   node tools/lore/_gen/apply_t3.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import b1 from "./t3_batch1.mjs";
import b2 from "./t3_batch2.mjs";
import b3 from "./t3_batch3.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const cities = [...b1, ...b2, ...b3];

function appendStory(unit, lang, blocks) {
  const p = join(ROOT, "content/story", unit, `${lang}.md`);
  let text = readFileSync(p, "utf8");
  for (const [key, value] of blocks) {
    const heading = `## ${key}`;
    if (text.includes(heading + "\n") || text.includes(heading + "\r\n")) {
      // Replace existing section body until next ## or EOF
      const re = new RegExp(`## ${key.replace(/\./g, "\\.")}\\n\\n[\\s\\S]*?(?=\\n## |$)`);
      text = text.replace(re, `${heading}\n\n${value.trim()}\n`);
    } else {
      if (!text.endsWith("\n")) text += "\n";
      text += `\n${heading}\n\n${value.trim()}\n`;
    }
  }
  writeFileSync(p, text);
}

// --- site.json ---
const sitePath = join(ROOT, "content/tables/events/site.json");
const siteDoc = JSON.parse(readFileSync(sitePath, "utf8"));
const existing = new Set(siteDoc.records.map((r) => r.id));
let added = 0;
for (const c of cities) {
  for (const s of c.sites) {
    const id = `ev-${c.id}-${s.letter}`;
    if (existing.has(id)) {
      siteDoc.records = siteDoc.records.filter((r) => r.id !== id);
    }
    const rec = {
      id,
      kind: "site",
      title: `ev.${c.id}.${s.letter}.title`,
      when: { cities: [c.id] },
      scene: { bg: c.sceneBg, region: c.band },
      body: `ev.${c.id}.${s.letter}.body`,
      once: true,
      choices: s.choices.map((ch) => {
        const out = {
          label: `ev.${c.id}.${s.letter}.choice.${ch.slug}`,
          effects: ch.effects,
        };
        if (ch.needs) out.needs = ch.needs;
        return out;
      }),
      lore: { origin: "authored" },
    };
    // Prefer source lore if city has source backing
    siteDoc.records.push(rec);
    added++;
  }
}
writeFileSync(sitePath, JSON.stringify(siteDoc, null, 2) + "\n");
console.log(`site.json: +${added} events (total ${siteDoc.records.length})`);

// --- city sites wiring ---
const cityDir = join(ROOT, "content/tables/cities");
for (const f of readdirSync(cityDir).filter((x) => x.endsWith(".json"))) {
  const p = join(cityDir, f);
  const doc = JSON.parse(readFileSync(p, "utf8"));
  let changed = 0;
  for (const rec of doc.records) {
    const def = cities.find((c) => c.id === rec.id);
    if (!def) continue;
    rec.sites = def.sites.map((s) => `ev-${rec.id}-${s.letter}`);
    // Attach source lore onto site events when city has it
    if (rec.lore?.origin === "source" && rec.lore.ref) {
      for (const s of def.sites) {
        const ev = siteDoc.records.find((r) => r.id === `ev-${rec.id}-${s.letter}`);
        if (ev) {
          ev.lore = {
            placeId: rec.lore.placeId,
            origin: "source",
            ref: rec.lore.ref,
          };
        }
      }
    }
    changed++;
  }
  if (changed) writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  if (changed) console.log(`  ${f}: wired ${changed} cities`);
}
writeFileSync(sitePath, JSON.stringify(siteDoc, null, 2) + "\n");

// --- story markdown ---
for (const c of cities) {
  const enBlocks = [];
  const zhBlocks = [];
  for (const s of c.sites) {
    enBlocks.push([`ev.${c.id}.${s.letter}.title`, s.titleEn]);
    enBlocks.push([`ev.${c.id}.${s.letter}.body`, s.bodyEn]);
    zhBlocks.push([`ev.${c.id}.${s.letter}.title`, s.titleZh]);
    zhBlocks.push([`ev.${c.id}.${s.letter}.body`, s.bodyZh]);
    for (const ch of s.choices) {
      enBlocks.push([`ev.${c.id}.${s.letter}.choice.${ch.slug}`, ch.labelEn]);
      zhBlocks.push([`ev.${c.id}.${s.letter}.choice.${ch.slug}`, ch.labelZh]);
    }
  }
  appendStory(c.id, "en", enBlocks);
  appendStory(c.id, "zh", zhBlocks);
  console.log(`  story ${c.id}: +${enBlocks.length} keys ×2 langs`);
}

console.log("done");
