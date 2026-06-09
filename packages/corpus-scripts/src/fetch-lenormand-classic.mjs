/**
 * Fetch complete Petit Lenormand card faces (Dondorf-style, 36 individual scans).
 * Source URL list: look-fate/tarot-lab Script/simple-lenormand.txt
 * Images hosted at taluowa.com — one JPEG per card, no sheet cropping.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../../apps/web/public/assets/lenormand/classic-dondorf");

const BASE_URL = "https://www.taluowa.com/lenormand";

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

async function downloadCard(cardNumber) {
  const url = `${BASE_URL}/${cardNumber}.jpg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const slug = CARD_SLUGS[cardNumber - 1];
  const filename = `${String(cardNumber).padStart(2, "0")}-${slug}.jpg`;
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

## Active deck: Classic Dondorf (individual scans)

- **Style**: 19th-century German Petit Lenormand (Dondorf / Wahrsagekarten tradition)
- **Format**: 36 separate card JPEGs (350×550), no sheet cropping
- **Digitization**: [taluowa.com](https://www.taluowa.com) — URL list in [look-fate/tarot-lab](https://github.com/look-fate/tarot-lab) (\`Script/simple-lenormand.txt\`)
- **Underlying art**: Public domain (19th-century card designs)

Refresh: \`npm run fetch-lenormand\` in \`packages/corpus-scripts\`.

## Alternate decks

| Deck | Command | Directory | Notes |
|------|---------|-----------|-------|
| British Museum Dondorf 1896,0501.308 | \`npm run fetch-lenormand:bm\` | \`bm-dondorf-308/\` | From 2 BM Commons photos; **CC BY-NC-SA 4.0** |
| Game of Hope 1799 | \`npm run fetch-lenormand:game-of-hope\` | \`game-of-hope-1799/\` | Sheet-cropped, may clip edges |
| Ch. Didot c.1890 (Yale IIIF) | \`npm run fetch-lenormand:didot\` | \`didot-1890/\` | Sheet-cropped, may clip edges |

## Card numbering

Standard Petit Lenormand order (1–36):

| # | File | 中文 |
|---|------|------|
${CARD_SLUGS.map((slug, i) => `| ${i + 1} | ${String(i + 1).padStart(2, "0")}-${slug}.jpg | ${CARD_NAMES_ZH[i]} |`).join("\n")}

## License note

Historic Lenormand artwork is public domain. Hosted scans are used for non-commercial educational divination UI. Verify rights for your deployment.
`;

  await writeFile(path.join(OUT_DIR, "..", "ATTRIBUTION.md"), attribution);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
