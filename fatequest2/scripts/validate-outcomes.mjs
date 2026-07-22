#!/usr/bin/env node
/* Validate outcome matrices for fatequest2 (and optionally fatequest 1.0). */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, "..");
const JS = path.join(root, "js");

function load() {
  const window = { FQ: {} };
  const ctx = { window, FQ: window.FQ, console };
  vm.createContext(ctx);
  const pre = "var FQ = window.FQ;\n";
  const files = [
    "data-tarot.js", "data-hexagrams.js", "data-misc.js", "data-lore.js", "data-journey.js",
    "outcomes/lots-expanded.js", "outcomes/outcome-keys.js"
  ];
  for (const f of files) {
    const p = path.join(JS, f);
    if (!fs.existsSync(p)) continue;
    vm.runInContext(pre + fs.readFileSync(p, "utf8"), ctx);
    ctx.FQ = ctx.window.FQ;
  }
  const outDir = path.join(JS, "outcomes");
  for (const f of fs.readdirSync(outDir).filter(x => x.startsWith("marco-") && x.endsWith(".js"))) {
    vm.runInContext(fs.readFileSync(path.join(outDir, f), "utf8"), ctx);
    ctx.FQ = ctx.window.FQ;
  }
  return ctx.window.FQ;
}

const FQ = load();
const report = FQ.validateOutcomes();
let fail = 0;
for (const r of report) {
  const mark = r.ok ? "OK" : "FAIL";
  if (!r.ok) fail++;
  console.log(`${mark}  ${r.id.padEnd(14)} type=${r.type.padEnd(12)} count=${r.count} missing=${r.missing} bad=${r.bad}`);
}
console.log(`\n${report.length} gates, ${fail} failing, min count ${Math.min(...report.map(r => r.count))}`);
process.exit(fail ? 1 : 0);
