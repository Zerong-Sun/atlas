/**
 * Fetch and crop Das Spiel der Hoffnung (The Game of Hope), 1799 — 36 Lenormand cards.
 * Source: Wikimedia Commons (British Museum scan, public domain).
 *
 * Sheet layout: 6×6 grid on 3900×4900 px. Column 0 is inset 325 px from the left edge.
 */

import { execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../../apps/web/public/assets/lenormand/game-of-hope-1799");

const SOURCE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/a/a6/Das_Spiel_der_Hofnung_%28The_Game_of_Hope%29.png";

const IMG_W = 3900;
const IMG_H = 4900;
const COLS = 6;
const ROWS = 6;
const CELL_W = Math.floor(IMG_W / COLS);
const CELL_H = Math.floor(IMG_H / ROWS);
const COL0_X = 325;

const CARD_SLUGS = [
  "rider",
  "clover",
  "ship",
  "house",
  "tree",
  "cloud",
  "snake",
  "coffin",
  "bouquet",
  "scythe",
  "whip",
  "birds",
  "child",
  "fox",
  "bear",
  "stars",
  "stork",
  "dog",
  "tower",
  "garden",
  "mountain",
  "crossroads",
  "mice",
  "heart",
  "ring",
  "book",
  "letter",
  "man",
  "woman",
  "lily",
  "sun",
  "moon",
  "key",
  "fish",
  "anchor",
  "cross",
];

const CARD_NAMES_ZH = [
  "骑士",
  "三叶草",
  "船",
  "房子",
  "树",
  "云",
  "蛇",
  "棺材",
  "花束",
  "镰刀",
  "鞭子",
  "鸟",
  "小孩",
  "狐狸",
  "熊",
  "星星",
  "鹳",
  "狗",
  "塔",
  "花园",
  "山",
  "十字路口",
  "老鼠",
  "心",
  "戒指",
  "书",
  "信",
  "男人",
  "女人",
  "百合",
  "太阳",
  "月亮",
  "钥匙",
  "鱼",
  "锚",
  "十字架",
];

function cropOrigin(cardNumber) {
  const index = cardNumber - 1;
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = col === 0 ? COL0_X : col * CELL_W;
  const y = row * CELL_H;
  return { x, y };
}

async function downloadSheet(destPath) {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to download sheet: ${res.status}`);
  await pipeline(res.body, createWriteStream(destPath));
}

async function cropWithSips(srcPath, destPath, x, y) {
  await execFileAsync("sips", [
    "--cropToHeightWidth",
    String(CELL_H),
    String(CELL_W),
    "--cropOffset",
    String(y),
    String(x),
    srcPath,
    "--out",
    destPath,
  ]);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const sheetPath = path.join(OUT_DIR, "_sheet.png");
  console.log(`Downloading ${SOURCE_URL}`);
  await downloadSheet(sheetPath);
  console.log(`Cropping 36 cards to ${OUT_DIR}`);

  for (let n = 1; n <= 36; n++) {
    const { x, y } = cropOrigin(n);
    const slug = CARD_SLUGS[n - 1];
    const filename = `${String(n).padStart(2, "0")}-${slug}.jpg`;
    const outPath = path.join(OUT_DIR, filename);
    await cropWithSips(sheetPath, outPath, x, y);
    console.log(`  ${n}/36 ${filename} @ (${x}, ${y})`);
  }

  const attribution = `# Lenormand Card Attribution

## Active deck: Das Spiel der Hoffnung (1799)

- **Deck**: Das Spiel der Hoffnung (The Game of Hope)
- **Author**: Johann Kaspar Hechtel
- **Date**: 1799
- **Collection**: The British Museum (object P_1896-0501-495)
- **Digitization**: Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Das_Spiel_der_Hofnung_(The_Game_of_Hope).png

This is the historical ancestor of the modern Petit Lenormand. Images are in the **public domain**.

## Alternate deck: Ch. Didot c.1890

Bundled at \`didot-1890/\` from Yale Library IIIF (manifest 10994633). Run \`npm run fetch-lenormand:didot\` in \`packages/corpus-scripts\` to refresh.

## Card numbering

Standard Petit Lenormand order (1–36):

| # | File | 中文 |
|---|------|------|
${CARD_SLUGS.map((slug, i) => `| ${i + 1} | ${String(i + 1).padStart(2, "0")}-${slug}.jpg | ${CARD_NAMES_ZH[i]} |`).join("\n")}

## License note

1799 Game of Hope artwork is public domain worldwide. Didot 1890 underlying art is public domain; Yale digitization is for educational use. This project is non-commercial.
`;

  await writeFile(path.join(OUT_DIR, "..", "ATTRIBUTION.md"), attribution);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
