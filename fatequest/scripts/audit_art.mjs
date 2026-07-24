#!/usr/bin/env node
/* Scan the data tables and the engine for every art name the game asks for,
   check which files exist under assets/art/, and rewrite the missing-art
   report. Names come from the data, so the report can never drift from what
   the game actually renders.

     node scripts/audit_art.mjs           # print the report
     node scripts/audit_art.mjs --write   # also rewrite ART_TODO_GENERATED.md
*/
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA = join(ROOT, "assets", "data");
const ART = join(ROOT, "assets", "art");

const read = f => JSON.parse(readFileSync(join(DATA, f), "utf8"));

/* ---------- collect every requested name ---------- */
const want = new Map();   /* name → {kind, where:Set} */
const add = (name, kind, where) => {
  if (!name) return;
  if (!want.has(name)) want.set(name, { kind, where: new Set() });
  want.get(name).where.add(where);
};

const cities = read("cities.json").cities;
const events = [...read("events-west.json").events, ...read("events-east.json").events];
const div = read("divinations.json");
const goods = read("goods.json");
const arch = read("archetypes.json").archetypes;
const transports = read("transports.json").transports;

cities.forEach(c => add(c.art, "city", "cities.json:" + c.id));
events.forEach(e => add(e.art, e.kind === "entry" ? "city" : "site", "events:" + e.id));
div.divinations.forEach(d => add(d.art, "art", "divinations.json:" + d.id));
div.teachers.forEach(t => add(t.art, "mentor", "divinations.json:" + t.id));
goods.goods.forEach(g => add(g.art, "goods", "goods.json:" + g.id));
goods.currencies.forEach(c => add(c.art, "coin", "goods.json:" + c.id));
arch.forEach(a => add(a.art, "archetype", "archetypes.json:" + a.id));
transports.forEach(t => add(t.art, "transport", "transports.json:" + t.id));

/* stickers are referenced by effect ops rather than by an `art` field */
events.forEach(e => e.choices.forEach(ch => {
  [ch.then, ch.pass, ch.fail].forEach(br => {
    (br?.effects || []).forEach(op => {
      if (op.op === "sticker") add(op.id, "sticker", "events:" + e.id);
    });
  });
}));
read("endings.json").endings.forEach(e => add(e.sticker, "sticker", "endings.json:" + e.id));

/* ---------- what exists ---------- */
const have = new Set(
  existsSync(ART)
    ? readdirSync(ART).filter(f => f.endsWith(".webp")).map(f => f.replace(/\.webp$/, ""))
    : []
);

const aliases = existsSync(join(DATA, "art-aliases.json"))
  ? read("art-aliases.json").aliases || {} : {};

const rows = [...want.entries()]
  .map(([name, v]) => {
    const alias = aliases[name];
    return {
      name, kind: v.kind, where: [...v.where],
      have: have.has(name),
      standin: !have.has(name) && alias && have.has(alias) ? alias : null,
      badAlias: alias && !have.has(alias) ? alias : null
    };
  })
  .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));

const missing = rows.filter(r => !r.have);
const bare = missing.filter(r => !r.standin);      /* nothing to show at all */
const broken = rows.filter(r => r.badAlias);       /* alias points at nothing */
const byKind = {};
missing.forEach(r => { (byKind[r.kind] ||= []).push(r); });

/* ---------- report ---------- */
const SPEC = {
  city: ["城市入城图 · city entry plate", "960×540"],
  site: ["探索点插图 · site illustration", "960×540"],
  mentor: ["师父立绘 · teacher portrait, facing right", "900×1300 alpha"],
  archetype: ["行者立绘 · traveler portrait", "900×1300 alpha"],
  art: ["占法徽记 · divination sigil", "512×512 alpha"],
  goods: ["商品图标 · goods icon", "256×256 alpha"],
  coin: ["货币 · coin face", "256×256 alpha"],
  transport: ["交通小像 · conveyance vignette", "256×160 alpha"],
  sticker: ["纪念贴纸 · souvenir sticker", "400×400 alpha"]
};

console.log(`\nart audit — ${rows.length} slots referenced`);
console.log(`  final art      ${rows.length - missing.length}`);
console.log(`  stand-in       ${missing.length - bare.length}   (borrowed plate, playable)`);
console.log(`  placeholder    ${bare.length}   (drawn stand-in, needs art)\n`);
Object.entries(byKind).forEach(([k, list]) => {
  const [desc, size] = SPEC[k] || [k, ""];
  const b = list.filter(r => !r.standin).length;
  console.log(`  ${k.padEnd(10)} ${String(list.length).padStart(3)} missing (${b} bare)   ${desc} — ${size}`);
});
if (broken.length) {
  console.log(`\n  ⚠ ${broken.length} alias(es) point at a file that does not exist:`);
  broken.forEach(r => console.log(`    ${r.name} → ${r.badAlias}`));
}
console.log("");

if (process.argv.includes("--write")) {
  const now = new Date().toISOString().slice(0, 10);
  let md = `# 缺图清单（自动生成） · Generated Art Gaps

> 由 \`node scripts/audit_art.mjs --write\` 生成于 ${now}。**不要手改**——改数据表，然后重跑。
> 名称即文件名：把 \`<引用名>.webp\` 放进 \`assets/art/\`，程序自动替换占位符，无需改代码。

引用总数 **${rows.length}** · 已定稿 **${rows.length - missing.length}** · 借用顶替 **${missing.length - bare.length}** · 纯占位 **${bare.length}**

「顶替」＝ \`assets/data/art-aliases.json\` 里指了一张现成的近似图，能玩，但不是最终稿；出图后删掉那一行即可。
「占位」＝ 程序画的灰底方块，只标名字。

`;
  Object.entries(byKind).forEach(([k, list]) => {
    const [desc, size] = SPEC[k] || [k, ""];
    md += `\n## ${k} — ${desc}\n\n尺寸：${size}\n\n| 引用名 | 现状 | 用在 |\n|---|---|---|\n`;
    list.forEach(r => {
      const st = r.standin ? "顶替 `" + r.standin + "`" : "**占位**";
      md += `| \`${r.name}\` | ${st} | ${r.where.slice(0, 3).join("、")}${r.where.length > 3 ? " …" : ""} |\n`;
    });
  });
  const out = join(ART, "ART_TODO_GENERATED.md");
  writeFileSync(out, md, "utf8");
  console.log("wrote " + out);
}
