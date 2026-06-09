/**
 * Bundle astrodice icon assets:
 * - Zodiac signs: Co-Star–inspired SVGs (mayaarguelles/Astrology-SVG-Set, educational use)
 * - Planets: @eaprelsky/nocturna-wheel SVGs (MIT)
 * - Houses: generated roman-numeral badges
 */

import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../../apps/web/public/assets/astrodice");
const SIGNS_OUT = path.join(OUT, "signs");
const PLANETS_OUT = path.join(OUT, "planets");
const HOUSES_OUT = path.join(OUT, "houses");

const SIGN_IDS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

const PLANET_FILES = [
  "zodiac-planet-sun",
  "zodiac-planet-moon",
  "zodiac-planet-mercury",
  "zodiac-planet-venus",
  "zodiac-planet-mars",
  "zodiac-planet-jupiter",
  "zodiac-planet-saturn",
  "zodiac-planet-uranus",
  "zodiac-planet-neptune",
  "zodiac-planet-pluto",
];

const ROMAN = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ", "Ⅺ", "Ⅻ"];

const SIGN_BASE =
  "https://raw.githubusercontent.com/mayaarguelles/Astrology-SVG-Set/master/img/SVG";

async function downloadSign(id) {
  const res = await fetch(`${SIGN_BASE}/${id}.svg`);
  if (!res.ok) throw new Error(`Failed sign ${id}: ${res.status}`);
  let svg = await res.text();
  svg = svg.replace(/<path /g, '<path fill="currentColor" ');
  await writeFile(path.join(SIGNS_OUT, `${id}.svg`), svg);
}

async function copyPlanetsFromNocturna() {
  const tmp = path.join(OUT, "_nocturna-tmp");
  await mkdir(tmp, { recursive: true });
  await execFileAsync("npm", ["pack", "@eaprelsky/nocturna-wheel", "--pack-destination", tmp], {
    cwd: tmp,
  });
  const { readdir, copyFile } = await import("node:fs/promises");
  const tgzName = (await readdir(tmp)).find((f) => f.endsWith(".tgz"));
  if (!tgzName) throw new Error("nocturna-wheel tgz not found");
  const tgzPath = path.join(tmp, tgzName);
  await execFileAsync("tar", ["-xzf", tgzPath, "-C", tmp]);
  const srcDir = path.join(tmp, "package/dist/assets/svg/zodiac");
  for (const base of PLANET_FILES) {
    await copyFile(path.join(srcDir, `${base}.svg`), path.join(PLANETS_OUT, `${base}.svg`));
  }
}

async function writeHouseBadges() {
  for (let i = 0; i < 12; i++) {
    const num = String(i + 1).padStart(2, "0");
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="27" stroke="currentColor" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="1" opacity="0.35"/>
  <text x="32" y="40" text-anchor="middle" font-size="26" fill="currentColor" font-family="Georgia, 'Times New Roman', serif">${ROMAN[i]}</text>
</svg>`;
    await writeFile(path.join(HOUSES_OUT, `house-${num}.svg`), svg);
  }
}

async function main() {
  await mkdir(SIGNS_OUT, { recursive: true });
  await mkdir(PLANETS_OUT, { recursive: true });
  await mkdir(HOUSES_OUT, { recursive: true });

  console.log("Downloading zodiac sign SVGs…");
  for (const id of SIGN_IDS) {
    await downloadSign(id);
    console.log(`  sign ${id}`);
  }

  console.log("Copying planet SVGs from nocturna-wheel…");
  await copyPlanetsFromNocturna();
  for (const base of PLANET_FILES) console.log(`  planet ${base}`);

  console.log("Writing house badges…");
  await writeHouseBadges();

  const attribution = `# Astrodice Icon Attribution

## Zodiac signs

- **Source**: [mayaarguelles/Astrology-SVG-Set](https://github.com/mayaarguelles/Astrology-SVG-Set)
- Co-Star–inspired educational icon set (NYU Drawing on the Web, 2018)

## Planets

- **Source**: [@eaprelsky/nocturna-wheel](https://github.com/eaprelsky/nocturna-wheel)
- **License**: MIT

## Houses

- Roman-numeral badges generated for this project (currentColor, matches dice theme)

Refresh assets: \`npm run fetch-astrodice\` in \`packages/corpus-scripts\`.
`;

  await writeFile(path.join(OUT, "ATTRIBUTION.md"), attribution);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
