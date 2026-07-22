/**
 * Fetch British Museum Petit Lenormand deck (1896,0501.308) as 36 individual crops.
 *
 * BM publishes the complete 36-card Dondorf chromolithograph pack as two composite
 * photos on Wikimedia Commons (not 36 separate museum files). This script downloads
 * those photos and extracts each card via OpenCV template matching.
 *
 * Prerequisites:
 *   python3 -m venv .venv && .venv/bin/pip install -r requirements-lenormand-bm.txt
 *
 * Reference card faces (for matching only) come from classic-dondorf/ or taluowa.com.
 * Output photos: CC BY-NC-SA 4.0 (British Museum). Underlying card art: public domain.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.resolve(__dirname, "../../../apps/web/public/assets/lenormand/bm-dondorf-308");
const REF_DIR = path.resolve(__dirname, "../../../apps/web/public/assets/lenormand/classic-dondorf");
const WORK_DIR = path.resolve(PKG_ROOT, ".cache/lenormand-bm");
const EXTRACT_SCRIPT = path.join(__dirname, "extract-lenormand-bm.py");

const BM_SOURCES = [
  {
    filename: "bm308-a.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Print%2C_playing-card_%28BM_1896%2C0501.308%29.jpg",
    commons: "https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308).jpg",
  },
  {
    filename: "bm308-b.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/77/Print%2C_playing-card_%28BM_1896%2C0501.308_1%29.jpg",
    commons: "https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308_1).jpg",
  },
];

const TALUOWA_BASE = "https://www.taluowa.com/lenormand";

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

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function ensureReferences() {
  const firstRef = path.join(REF_DIR, "01-rider.jpg");
  if (await fileExists(firstRef)) {
    console.log(`Using reference deck: ${REF_DIR}`);
    return REF_DIR;
  }

  const cacheRefs = path.join(WORK_DIR, "refs");
  await mkdir(cacheRefs, { recursive: true });
  console.log(`Downloading reference thumbnails to ${cacheRefs}`);

  for (let n = 1; n <= 36; n++) {
    const slug = CARD_SLUGS[n - 1];
    const filename = `${String(n).padStart(2, "0")}-${slug}.jpg`;
    const dest = path.join(cacheRefs, filename);
    if (!(await fileExists(dest))) {
      await download(`${TALUOWA_BASE}/${n}.jpg`, dest);
    }
  }

  return cacheRefs;
}

async function resolvePython() {
  const candidates = [
    path.join(PKG_ROOT, ".venv/bin/python"),
    path.join(PKG_ROOT, ".venv/bin/python3"),
    "python3",
  ];

  for (const bin of candidates) {
    try {
      await access(bin, constants.X_OK);
      return bin;
    } catch {
      // try next
    }
  }

  throw new Error(
    "Python with OpenCV not found. Run:\n" +
      "  cd packages/corpus-scripts\n" +
      "  python3 -m venv .venv\n" +
      "  .venv/bin/pip install -r requirements-lenormand-bm.txt",
  );
}

function runPython(python, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(python, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Python exited with code ${code}`));
    });
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(WORK_DIR, { recursive: true });

  const sourcePaths = [];
  for (const source of BM_SOURCES) {
    const dest = path.join(WORK_DIR, source.filename);
    if (!(await fileExists(dest))) {
      console.log(`Downloading ${source.commons}`);
      await download(source.url, dest);
    } else {
      console.log(`Using cached ${source.filename}`);
    }
    sourcePaths.push(dest);
  }

  const refDir = await ensureReferences();
  const python = await resolvePython();
  const metaPath = path.join(WORK_DIR, "extraction-meta.json");

  console.log(`Extracting 36 cards to ${OUT_DIR}`);
  await runPython(python, [
    EXTRACT_SCRIPT,
    "--sources",
    ...sourcePaths,
    "--refs",
    refDir,
    "--out",
    OUT_DIR,
    "--meta",
    metaPath,
  ]);

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
| British Museum Dondorf 1896,0501.308 | \`npm run fetch-lenormand:bm\` | \`bm-dondorf-308/\` | Extracted from 2 BM Commons photos; **CC BY-NC-SA 4.0** |
| Game of Hope 1799 | \`npm run fetch-lenormand:game-of-hope\` | \`game-of-hope-1799/\` | Sheet-cropped, may clip edges |
| Ch. Didot c.1890 (Yale IIIF) | \`npm run fetch-lenormand:didot\` | \`didot-1890/\` | Sheet-cropped, may clip edges |

### British Museum deck (bm-dondorf-308)

- **Museum object**: [1896,0501.308](https://www.britishmuseum.org/collection/object/P_1896-0501-308) — complete pack of 36 Mlle. Lenormand fortune-telling cards, B. Dondorf chromolithograph
- **Source photos** (Wikimedia Commons):
  - [Print, playing-card (BM 1896,0501.308)](https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308).jpg)
  - [Print, playing-card (BM 1896,0501.308 1)](https://commons.wikimedia.org/wiki/File:Print,_playing-card_(BM_1896,0501.308_1).jpg)
- **Extraction**: OpenCV template matching against reference faces; cards are cropped from scattered layouts (not individual BM catalogue files)
- **Photo license**: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — British Museum — **non-commercial use**
- **Card art**: Public domain (19th century)

## Card numbering

Standard Petit Lenormand order (1–36):

| # | File | 中文 |
|---|------|------|
${CARD_SLUGS.map((slug, i) => `| ${i + 1} | ${String(i + 1).padStart(2, "0")}-${slug}.jpg | ${CARD_NAMES_ZH[i]} |`).join("\n")}

## License note

Historic Lenormand artwork is public domain. Hosted scans are used for non-commercial educational divination UI. Verify rights for your deployment — especially the BM deck (NC license on photographs).
`;

  await writeFile(path.join(OUT_DIR, "..", "ATTRIBUTION.md"), attribution);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
