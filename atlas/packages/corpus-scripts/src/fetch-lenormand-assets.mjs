/**
 * Fetch and crop Yale Cary Collection Ch. Didot c.1890 Lenormand (36 cards).
 * Manifest: https://collections.library.yale.edu/manifests/10994633
 *
 * Cards are digitized as four 3×3 sheets (nos. 1–9, 10–18, 19–27, 28–36).
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../../apps/web/public/assets/lenormand/didot-1890");

const IIIF_BASE = "https://collections.library.yale.edu/iiif/2";

/** Sheet image IDs in card order 1–36 */
const SHEETS = [
  { imageId: "11001632", startCard: 1 },
  { imageId: "11001633", startCard: 10 },
  { imageId: "11001634", startCard: 19 },
  { imageId: "11001635", startCard: 28 },
];

const SHEET_WIDTH = 4334;
const SHEET_HEIGHT = 5121;
const COLS = 3;
const ROWS = 3;
const CELL_W = Math.floor(SHEET_WIDTH / COLS);
const CELL_H = Math.floor(SHEET_HEIGHT / ROWS);

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

function regionUrl(imageId, x, y, w, h) {
  return `${IIIF_BASE}/${imageId}/${x},${y},${w},${h}/full/0/default.jpg`;
}

async function downloadCard(cardNumber) {
  const sheet = SHEETS.find((s) => cardNumber >= s.startCard && cardNumber < s.startCard + 9);
  if (!sheet) throw new Error(`No sheet for card ${cardNumber}`);
  const indexOnSheet = cardNumber - sheet.startCard;
  const col = indexOnSheet % COLS;
  const row = Math.floor(indexOnSheet / COLS);
  const x = col * CELL_W;
  const y = row * CELL_H;
  const slug = CARD_SLUGS[cardNumber - 1];
  const filename = `${String(cardNumber).padStart(2, "0")}-${slug}.jpg`;
  const url = regionUrl(sheet.imageId, x, y, CELL_W, CELL_H);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(OUT_DIR, filename), buf);
  return filename;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Writing to ${OUT_DIR}`);

  for (let n = 1; n <= 36; n++) {
    const file = await downloadCard(n);
    console.log(`  ${n}/36 ${file}`);
  }

  const attribution = `# Lenormand Card Attribution

## Source

- **Deck**: Wahrsagekarten der berühmten Kartenlegerin Lenormand
- **Publisher**: Ch. Didot, Paris, c. 1890
- **Collection**: Yale University Library, Beinecke Rare Book and Manuscript Library, Cary Collection of Playing Cards
- **Call number**: PLAYING CARDS GEN 1152
- **Catalog**: https://collections.library.yale.edu/catalog/10994633

## Card numbering

Standard Petit Lenormand order (1–36):

| # | File | 中文 |
|---|------|------|
${CARD_SLUGS.map((slug, i) => `| ${i + 1} | ${String(i + 1).padStart(2, "0")}-${slug}.jpg | ${CARD_NAMES_ZH[i]} |`).join("\n")}

## License note

The underlying 19th-century card artwork is in the public domain. Digitized images were obtained via Yale Library IIIF for non-commercial educational use. Verify rights for your deployment context.
`;

  await writeFile(path.join(OUT_DIR, "..", "ATTRIBUTION.md"), attribution);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
