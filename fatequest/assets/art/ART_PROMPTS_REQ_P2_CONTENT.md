# FateQuest · ART_TODO P2 · Currency + Stickers

Source: `ART_TODO.md` P2 §B/C. Order: currency 5 → stickers 9 (before iching deck).
Goods icons skipped (GOODS_ART_MAP.json).

**Style:** Cloud-ridge Twilight manuscript icons — forest ink `#0D1411`, parchment `#F0E4D0`, antique gold `#BDA476`, rubric `#B3402E` accent. Flat mineral paint, readable at 48px. NO photorealism, NO neon, NO modern banknotes.

**Windows:** Currency · Sticker

---

## Batch 1 · Currency · five currency emblems

- **Window**: Currency
- **Mode**: separate · **Count**: 5 · **Output per file**: 256×256 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `currency-ducat.webp` — Venetian gold ducat coin obverse, heraldic lion, medieval minted coin NOT paper
  2. `currency-dinar.webp` — Islamic gold dinar, circular with central calligraphy-free star motif
  3. `currency-dirham.webp` — silver dirham coin stack, Central Asian trade coin style
  4. `currency-cash.webp` — Song/Yuan copper cash coins on square hole string, Han trade currency
  5. `currency-sycee.webp` — Chinese silver sycee ingot boat-shape, merchant stamp mark (no letters)

**Prompt**

Generate exactly 5 SEPARATE currency icon illustrations on transparent backgrounds (~256×256 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript object icons — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476. Medieval COINS and INGOTS only — NO paper money, NO readable text, NO letters, NO Arabic script.
Order:
1. currency-ducat.webp — Venetian gold ducat
2. currency-dinar.webp — gold dinar coin
3. currency-dirham.webp — silver dirham coins
4. currency-cash.webp — copper cash on string
5. currency-sycee.webp — silver sycee ingot
Negative: photorealistic, 3D, neon, watermark, text, paper currency, modern coins.

---

## Batch 2 · Sticker · ending commemorative stickers 1–5

- **Window**: Sticker
- **Mode**: separate · **Count**: 5 · **Output per file**: 256×256 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `sticker-stop.webp` — wax-seal sticker: closed pen on folded booklet, rubric wax edge
  2. `sticker-polo.webp` — wax-seal sticker: Khanbaliq palace window lattice silhouette
  3. `sticker-market.webp` — wax-seal sticker: market scale with bolt of cloth
  4. `sticker-diviner.webp` — wax-seal sticker: three divination coins in triangle
  5. `sticker-map.webp` — wax-seal sticker: torn unfolded map fragment with compass rose hint

**Prompt**

Generate exactly 5 SEPARATE commemorative sticker icons on transparent backgrounds (~256×256 each), NOT a contact sheet. Do not write an explanation.
Hand-drawn wax-seal / travel-journal sticker aesthetic — parchment #F0E4D0, forest ink #0D1411, antique gold #BDA476, rubric #B3402E wax rim. Slightly rough sticker edge. NO readable text.
Order:
1. sticker-stop.webp — pen and booklet seal
2. sticker-polo.webp — palace window seal
3. sticker-market.webp — scale and cloth seal
4. sticker-diviner.webp — three coins seal
5. sticker-map.webp — map fragment seal
Negative: photorealistic, 3D, neon, watermark, text, letters.

---

## Batch 3 · Sticker · ending commemorative stickers 6–9

- **Window**: Sticker
- **Mode**: separate · **Count**: 4 · **Output per file**: 256×256 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `sticker-silk.webp` — wax-seal sticker: silk roll with tassel
  2. `sticker-no-return.webp` — wax-seal sticker: broken bridge at sunset silhouette
  3. `sticker-translate.webp` — wax-seal sticker: two blank manuscript pages side by side (no glyphs)
  4. `sticker-battuta.webp` — wax-seal sticker: pilgrimage arc with palm and dome silhouette (no deity)

**Prompt**

Generate exactly 4 SEPARATE commemorative sticker icons on transparent backgrounds (~256×256 each), NOT a contact sheet. Do not write an explanation.
Wax-seal travel-journal sticker style — parchment, forest ink, gold, rubric wax rim. NO readable text, NO calligraphy.
Order:
1. sticker-silk.webp — silk roll seal
2. sticker-no-return.webp — broken bridge at dusk seal
3. sticker-translate.webp — dual blank pages seal
4. sticker-battuta.webp — pilgrimage arc seal
Negative: photorealistic, 3D, neon, watermark, text, deities.

---

### Window -> batches
- **Currency**: Batch 1
- **Sticker**: Batches 2–3

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P2_CONTENT.md \
  --max-windows 1 --poll-sec 600 --skip-existing
```
