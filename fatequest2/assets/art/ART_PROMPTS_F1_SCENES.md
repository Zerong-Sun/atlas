# FateQuest 2.0 · §F1 Scene Backgrounds · 16× 1920×1080

Companion to [`ART_TODO_MAP.md`](./ART_TODO_MAP.md) §F1.  
**Write / review this file first, then upload to ChatGPT.** Save outputs to `assets/art/` with exact filenames.

## Style lock (every batch)

13th-century manuscript miniature × dusk travel light. Vellum `#E9DBB8`, iron-gall ink `#4A3A1C`, ochre `#8A6234`, rubric `#B3402E`, sea-teal `#3F5F6B`. Visible brush, wash, parchment grain. NO modern flat vector, NO photorealism, NO neon glow, NO readable text/watermarks.

## Composition lock (CRITICAL — every image)

- Aspect **16:9**, opaque full-bleed, logical ~1920×1080.
- Keep the **lower-left ~1/3 empty / low-detail negative space** for the dialog box (bottom) and a half-body portrait (left).
- Place landmark architecture / terrain interest in the **center-right and upper half**.
- Do **not** put stalls, cargo piles, near figures, animals, or high-contrast detail in the lower-left safe zone.
- No anthropomorphic deities.

## Upload order

| Window | Batches | Notes |
|---|---|---|
| F1 | Batch 1–2 | Cities & roads set A (8) — may already exist; regen only if composition fails safe-zone |
| F1 | Batch 3–4 | Halls, harbors, region generics (8) — still missing |

Prefer **Mode: separate** (N individual images per reply) for full-res faces.

---

## Batch 1 · F1 · Cities & roads A1 (4)

- **Window**: F1
- **Mode**: separate · **Count**: 4 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-venice-quay.webp` — Venice quay at dawn: lagoon water, gondolas mid-right, San Marco campanile silhouette upper-right, morning mist; empty lower-left third
  2. `scene-acre-wall.webp` — Acre night walls: crusader battlements center-right, torchlight, distant Mediterranean, stars; empty lower-left third
  3. `scene-tabriz-bazaar.webp` — Tabriz bazaar: arched bazaar vaults mid-ground, carpets, rooftop observatory instrument upper-right; empty lower-left third
  4. `scene-hormuz-port.webp` — Hormuz port: heat haze, dhows at dock mid-right, date palms, small astrologer stall far-right (not lower-left); empty lower-left third

**Prompt**

```
Generate exactly 4 SEPARATE opaque 16:9 scene backgrounds (~1920×1080 each), NOT a contact sheet.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk/candle light only — no photorealism, no neon, no text.
COMPOSITION LOCK for EVERY image: leave the lower-left ~1/3 as empty low-detail space for UI dialog + portrait; put landmarks in center-right and upper half.
Order 1→4:
1. scene-venice-quay.webp — Venice quay dawn, lagoon, gondolas, San Marco campanile silhouette, mist
2. scene-acre-wall.webp — Acre night walls, crusader battlements, torches, Mediterranean, stars
3. scene-tabriz-bazaar.webp — Tabriz arched bazaar, carpets, rooftop astrolabe/observatory
4. scene-hormuz-port.webp — Hormuz port, dhows, date palms, hot wind, dock stall kept out of lower-left
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.
```

---

## Batch 2 · F1 · Cities & roads A2 (4)

- **Window**: F1
- **Mode**: separate · **Count**: 4 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-kerman-dunes.webp` — Kerman sand sea: dunes mid-right, camel silhouettes, sunset, half-buried posthouse; empty lower-left third
  2. `scene-herat-road.webp` — Herat caravan road: caravanserai mid-right, poplars, snow peaks afar; empty lower-left third
  3. `scene-pamir-pass.webp` — Pamir pass: snowline, prayer flags, yaks mid-right, pale-blue campfire; empty lower-left third
  4. `scene-shangdu-palace.webp` — Shangdu marble palace: grassland, white palace, golden tents upper/mid-right; empty lower-left third

**Prompt**

```
Generate exactly 4 SEPARATE opaque 16:9 scene backgrounds (~1920×1080 each), NOT a contact sheet.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light — no photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; landmarks center-right / upper half.
Order 1→4:
1. scene-kerman-dunes.webp — Kerman dunes, camel silhouettes, sunset, half-buried posthouse
2. scene-herat-road.webp — Herat road, caravanserai, poplars, distant snow mountains
3. scene-pamir-pass.webp — Pamir pass, snowline, prayer flags, yaks, pale-blue campfire
4. scene-shangdu-palace.webp — Shangdu grassland, white marble palace, golden tents
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.
```

---

## Batch 3 · F1 · Capitals & sea B1 (4)

- **Window**: F1
- **Mode**: separate · **Count**: 4 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-khanbaliq-hall.webp` — Khanbaliq night banquet hall: giant pillars, candle sea, screens mid-right; empty lower-left third
  2. `scene-hangzhou-lake.webp` — West Lake painted boat: stone bridge mid-right, lanterns, distant hills; empty lower-left third
  3. `scene-quanzhou-harbor.webp` — Zayton / Quanzhou harbor: mast forest, Tianfei temple eaves, incense; empty lower-left third
  4. `scene-voyage-sea.webp` — Homeward sea voyage: four-masted deck mid-right, storm-building clouds above; empty lower-left third

**Prompt**

```
Generate exactly 4 SEPARATE opaque 16:9 scene backgrounds (~1920×1080 each), NOT a contact sheet.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, candle/dusk light — no photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; landmarks center-right / upper half.
Order 1→4:
1. scene-khanbaliq-hall.webp — Khanbaliq night banquet hall, pillars, candle sea, screens
2. scene-hangzhou-lake.webp — West Lake, stone bridge, painted pleasure boat, lanterns, hills
3. scene-quanzhou-harbor.webp — Quanzhou Zayton harbor, mast forest, Tianfei eaves, incense
4. scene-voyage-sea.webp — four-masted junk deck, storm clouds gathering
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.
```

---

## Batch 4 · F1 · Civilization travel generics B2 (4)

- **Window**: F1
- **Mode**: separate · **Count**: 4 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-region-chr.webp` — Christendom travel road: European hills, abbey silhouette far-right; empty lower-left third
  2. `scene-region-isl.webp` — Crescent travel road: trade path, camels mid-right, minaret far; empty lower-left third
  3. `scene-region-con.webp` — Confucian/Daoist travel: mountain path, post pavilion, flying eaves far; empty lower-left third
  4. `scene-region-mazu.webp` — Mazu sea travel: waves and sails mid-right, seabirds; empty lower-left third

**Prompt**

```
Generate exactly 4 SEPARATE opaque 16:9 scene backgrounds (~1920×1080 each), NOT a contact sheet.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light — no photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; scenic interest center-right / upper half.
Order 1→4:
1. scene-region-chr.webp — Christendom hills road, distant abbey
2. scene-region-isl.webp — Crescent caravan road, camels, distant minaret
3. scene-region-con.webp — mountain courier path, post pavilion, distant flying eaves
4. scene-region-mazu.webp — open sea travel, sails, waves, seabirds
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.
```
