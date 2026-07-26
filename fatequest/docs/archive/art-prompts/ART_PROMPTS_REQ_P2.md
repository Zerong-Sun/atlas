# FateQuest · ART_REQUIREMENTS P2 · Batch Prompts

Source: `docs/ART_REQUIREMENTS.md` §1.1 / §1.2 / §3.2–3.3  
**P2 硬缺口：** 六主城场景 6 + band 底板 21 + 史料小卡 1（顺带事件对话框九宫格）。

**Style lock:** 13th-century manuscript miniature × dusk travel light. Vellum `#E9DBB8`, iron-gall ink `#4A3A1C`, ochre `#8A6234`, rubric `#B3402E`, sea-teal `#3F5F6B`. Flat mineral washes, parchment grain. NO photorealism, NO neon, NO readable text.

**Composition lock (every 16:9 scene / band plate):**
- Opaque full-bleed ~1920×1080
- **Lower-left ~1/3 empty / low-detail** for dialog + portrait
- Landmarks in **center-right / upper half**
- No deities, no crowded lower-left

**Windows (max 2 concurrent):** CitiesA · CitiesB · BandA · BandB · BandC · UI

---

## Batch 1 · CitiesA · 主城 报达／巴里黑／撒马尔罕

- **Window**: CitiesA
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-baldacum-river.webp` — Baghdad/Baldacum on the Tigris: wide river mid-right, caliphate treasury walls and gold-brocade market stalls upper/mid-right, warm dusk; empty lower-left third
  2. `scene-balc-ruins.webp` — Balkh/Balc half-ruined grandeur: broken marble palace columns and fallen arches mid-right, dust haze, once-great city; empty lower-left third
  3. `scene-samarcanda-orchard.webp` — Samarkand orchards: blue-glazed brick walls and fruit trees mid-right, distant stone-column church legend motif (no cross text), soft evening; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 scene backgrounds (~1920×1080 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light — no photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; landmarks center-right / upper half.
Order 1→3:
1. scene-baldacum-river.webp — Baldacum on the Tigris, river, caliphate treasury & gold-brocade market
2. scene-balc-ruins.webp — Balc half-ruined marble palace columns
3. scene-samarcanda-orchard.webp — Samarcanda orchards, blue-glaze brick, fruit trees
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.

---

## Batch 2 · CitiesB · 主城 喀什噶尔／于阗／罗卜

- **Window**: CitiesB
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-cascar-crossroads.webp` — Kashgar/Cascar oasis fork: two caravan roads splitting mid-right, mud-brick town, camels departing different ways; empty lower-left third
  2. `scene-cotan-jaderiver.webp` — Khotan/Cotan: jade river glimmer, cotton fields and vineyards mid-right, low mud walls; empty lower-left third
  3. `scene-lop-desertedge.webp` — Lop desert-edge last town: camel train resupply mid-right, dunes beyond, sparse mud houses; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 scene backgrounds (~1920×1080 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light — no photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; landmarks center-right / upper half.
Order 1→3:
1. scene-cascar-crossroads.webp — Cascar oasis crossroads, caravans splitting north/south
2. scene-cotan-jaderiver.webp — Cotan jade river, cotton fields, vineyards
3. scene-lop-desertedge.webp — Lop last desert-edge town, camel resupply, dunes
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.

---

## Batch 3 · BandA · west_asia + central_asia 底板（7）

- **Window**: BandA
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-west-caravan.webp` — west_asia reusable plate: caravan city silhouette, mud walls, distant minarets; empty lower-left third; generic (no unique landmark)
  2. `scene-band-west-mosque.webp` — west_asia reusable plate: quiet mosque courtyard, arcade shade, pool; empty lower-left third
  3. `scene-band-west-riverport.webp` — west_asia reusable plate: river port quays, barges mid-right; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light.
These are GENERIC plates for many cities — avoid unique famous landmarks; keep silhouettes simple so color/tint can differentiate later.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half.
Order 1→3:
1. scene-band-west-caravan.webp — west Asia caravan city
2. scene-band-west-mosque.webp — west Asia mosque courtyard
3. scene-band-west-riverport.webp — west Asia river port
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities, famous specific monuments.

---

## Batch 4 · BandA2 · west bazaar + central oasis

- **Window**: BandA
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-west-bazaar.webp` — west_asia reusable plate: covered bazaar vaults mid-right, soft shafts of light; empty lower-left third
  2. `scene-band-central-oasis.webp` — central_asia reusable plate: oasis town, poplars, irrigation channels mid-right; empty lower-left third
  3. `scene-band-central-yam.webp` — central_asia reusable plate: mountain-pass yam station, stone posthouse mid-right; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. GENERIC — no unique famous landmarks.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half.
Order 1→3:
1. scene-band-west-bazaar.webp — west Asia covered bazaar
2. scene-band-central-oasis.webp — central Asia oasis town
3. scene-band-central-yam.webp — central Asia mountain yam / posthouse
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.

---

## Batch 5 · BandA3 · central desert/caravanserai + steppe

- **Window**: BandA
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-central-camp.webp` — central_asia reusable plate: desert night camp, tents mid-right, dunes; empty lower-left third
  2. `scene-band-central-caravanserai.webp` — central_asia reusable plate: courtyard caravanserai gates mid-right; empty lower-left third
  3. `scene-band-steppe-yurt.webp` — steppe reusable plate: felt yurt camp on grassland mid-right, wide sky; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk/night camp light. GENERIC plates.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half.
Order 1→3:
1. scene-band-central-camp.webp — central Asia desert camp
2. scene-band-central-caravanserai.webp — central Asia caravanserai
3. scene-band-steppe-yurt.webp — steppe yurt camp
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities.

---

## Batch 6 · BandB · steppe road + china ×3

- **Window**: BandB
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-steppe-yamroad.webp` — steppe reusable plate: long yam road across grassland, distant post mid-right; empty lower-left third
  2. `scene-band-china-canal.webp` — china reusable plate: canal city, arched bridge mid-right, eaves; empty lower-left third
  3. `scene-band-china-yamen.webp` — china reusable plate: yamen / government court hall mid-right; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. GENERIC — no Forbidden City / named temples.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half.
Order 1→3:
1. scene-band-steppe-yamroad.webp — steppe yam road
2. scene-band-china-canal.webp — China canal city
3. scene-band-china-yamen.webp — China yamen court
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities, famous named landmarks.

---

## Batch 7 · BandB2 · china temple/market + india port

- **Window**: BandB
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-china-temple.webp` — china reusable plate: Buddhist/Daoist temple courtyard mid-right, incense haze; empty lower-left third; no deity statues faces
  2. `scene-band-china-bridge.webp` — china reusable plate: market bridge over canal mid-right; empty lower-left third
  3. `scene-band-india-port.webp` — india reusable plate: monsoon harbor, lateen dhows mid-right; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. GENERIC plates. No deity faces/idols detail.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half.
Order 1→3:
1. scene-band-china-temple.webp — China temple courtyard (no deity close-ups)
2. scene-band-china-bridge.webp — China market bridge
3. scene-band-india-port.webp — India monsoon port
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities, idol faces.

---

## Batch 8 · BandC · india + maritime + europe

- **Window**: BandC
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-india-bazaar.webp` — india reusable plate: spice bazaar street mid-right, awnings; empty lower-left third
  2. `scene-band-india-temple.webp` — india reusable plate: temple gopuram silhouette mid-right (no idol faces); empty lower-left third
  3. `scene-band-maritime-spice.webp` — maritime_asia reusable plate: spice harbor, junks and warehouses mid-right; empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. GENERIC. No deity/idol faces.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half.
Order 1→3:
1. scene-band-india-bazaar.webp — India spice bazaar
2. scene-band-india-temple.webp — India temple silhouette (no idols)
3. scene-band-maritime-spice.webp — maritime Asia spice harbor
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities, idol faces.

---

## Batch 9 · BandC2 · maritime shipyard/warehouse + europe stone port

- **Window**: BandC
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-band-maritime-shipyard.webp` — maritime_asia reusable plate: wooden shipyard cradles mid-right; empty lower-left third
  2. `scene-band-maritime-warehouse.webp` — maritime_asia reusable plate: warehouse quay with crates mid-right (keep crates out of lower-left); empty lower-left third
  3. `scene-band-europe-stoneport.webp` — europe reusable plate: stone harbor quay, medieval towers mid-right (prologue); empty lower-left third

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 REUSABLE band background plates (~1920×1080), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. GENERIC — not a named European city skyline.
COMPOSITION LOCK: lower-left ~1/3 empty; interest center-right / upper half. Keep cargo piles out of lower-left.
Order 1→3:
1. scene-band-maritime-shipyard.webp — maritime Asia shipyard
2. scene-band-maritime-warehouse.webp — maritime Asia warehouse quay
3. scene-band-europe-stoneport.webp — Europe stone harbor (prologue)
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left, deities, Venice/San Marco lookalikes.

---

## Batch 10 · UI · 史料小卡 + 事件对话框九宫格

- **Window**: UI
- **Mode**: separate · **Count**: 2 · **Output per file**: 1024×1024 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `ui-lore-card.webp` — 1024×640 landscape lore/source card frame: parchment panel, thin gold corner flourishes, blank center for text, rubric accent line; no readable text
  2. `ui-dialog-nine.webp` — 1024×1024 nine-slice dialog panel sheet: show 9 patches in 3×3 (corners, edges, center fill) of one parchment dialog frame style; thin gutters; no text

**Prompt**

Generate exactly 2 SEPARATE opaque UI plates, NOT game scenes. Do not write an explanation.
Cloud-ridge Twilight UI — parchment #F0E4D0, forest ink #0D1411, antique gold #BDA476, rubric #B3402E accent only. Flat mineral paint, paper grain. No photorealism, no neon, no readable text.
Order:
1. ui-lore-card.webp — ~1024×640 historical-source card: blank parchment center for body text, elegant gold corner ornaments, thin rubric rule under a blank title band. Landscape.
2. ui-dialog-nine.webp — ~1024×1024 contact-like 3×3 of ONE dialog frame's nine-slice patches (4 corners, 4 edges, 1 center fill) with thin dark gutters; same style throughout; center patch is plain parchment fill.
Negative: photorealistic, 3D, neon, watermark, readable text, characters, landscapes.

---

### Window → batches
- **CitiesA**: Batch 1
- **CitiesB**: Batch 2
- **BandA**: Batches 3–5
- **BandB**: Batches 6–7
- **BandC**: Batches 8–9
- **UI**: Batch 10

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P2.md \
  --max-windows 2 --poll-sec 600 --skip-existing
```
