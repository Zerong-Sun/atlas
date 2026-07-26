# FateQuest · ART_REQUIREMENTS P0 + P1 · Batch Prompts

Source: `docs/ART_REQUIREMENTS.md`（先做 P0 的 1 张 + P1 的 ~20 张）。

**Style lock (map):** 13th-century manuscript map (mappa mundi / portolan) — vellum `#E9DBB8`, iron-gall ink `#4A3A1C`, ochre `#8A6234`, rubric `#B3402E`, sea-teal `#3F5F6B`. Visible brush, wash, parchment grain. NO modern flat vector, NO photorealism, NO neon.

**Style lock (desk/scene):** Cloud-ridge Twilight manuscript miniature — forest ink `#0D1411`, parchment `#F0E4D0`, antique gold `#BDA476`, mist blue `#7FA3BD`. Flat mineral paint, candle/dusk light only.

**Windows (max 2 concurrent):** Desk · Tex · City · Mtn · Wind · Route  
已有可跳过：`map-rose`、`map-wind-head`（单张）、`map-city-*` 中号单张、`map-mtn-snow/rock`、beast 组、`map-river`（过窄，本批重做 route）。

---

## Batch 1 · Desk · P0 书案开场

- **Window**: Desk
- **Mode**: separate · **Count**: 1 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-desk-opening.webp` — 1920×1080 desk prologue: several travel books stacked on a spread parchment mappa mundi, brass astrolabe, candlelight, empty lower-left ~1/3 for UI; no readable text

**Prompt**

Generate exactly ONE opaque 16:9 scene (~1920×1080). Do not write an explanation.
Cloud-ridge Twilight manuscript miniature — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, mist blue #7FA3BD, cloud-peach #E8B28A. Flat mineral paint, paper grain, candle/dusk glow only. No photorealism, no neon, no readable text.
COMPOSITION: lower-left ~1/3 low-detail empty for UI; subject interest center-right / upper half.
1. scene-desk-opening.webp — scholar's desk at dusk: stack of 3–4 closed travel books (leather, no titles), open parchment portolan/mappa mundi underneath with blank seas, small brass astrolabe mid-right, soft candle, ink pot; calm prologue mood.
Negative: photorealistic, 3D, neon, watermark, readable text, deities, crowded lower-left.

---

## Batch 2 · Tex · P1 羊皮纸底纹 + 旧墨迷雾

- **Window**: Tex
- **Mode**: separate · **Count**: 2 · **Output per file**: 2048×2048 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `map-vellum-tile.webp` — 2048×2048 seamless tileable parchment: fibers, foxing, faint water stains; NO map drawings, NO text, edge-to-edge tileable
  2. `map-fog-ink.webp` — 2048×2048 irregular iron-gall ink wash fog mask: blotchy soft edges, mostly dark center with torn translucent rim; usable as unexplored-region overlay; no symbols

**Prompt**

Generate exactly 2 SEPARATE opaque square images (~2048×2048 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript map materials — vellum #E9DBB8, iron-gall ink #4A3A1C, ochre #8A6234. Visible paper grain. No photorealism, no neon, no readable text.
Order:
1. map-vellum-tile.webp — seamless tileable blank parchment only (fibers, foxing, tiny wormholes). Must tile without visible seam. No drawings, no borders, no compass.
2. map-fog-ink.webp — irregular dark ink-wash fog plate for masking unexplored map: dense blotchy wash, soft torn edges, mostly opaque dark with translucent fringe. No cities, no monsters, no text.
Negative: photorealistic, 3D, neon, watermark, text, hard geometric grid, modern vector.

---

## Batch 3 · City · P1 城塞小像 4 文明 × 3 级

- **Window**: City
- **Mode**: sheet · **Grid**: 4×3 · **Cell**: 256×220 · **Output per file**: 256×220 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-city-chr-s.webp` — Christendom fort SMALL 160×140: tiny belfry + wall stub, side elevation
  2. `map-city-isl-s.webp` — Crescent fort SMALL 160×140: tiny dome + minaret stub
  3. `map-city-con-s.webp` — East-Asian fort SMALL 160×140: tiny flying-eave tower
  4. `map-city-mazu-s.webp` — Port fort SMALL 160×140: tiny pier + junk mast
  5. `map-city-chr-m.webp` — Christendom fort MEDIUM 256×220: crenellated wall + pointed belfry + arch gate
  6. `map-city-isl-m.webp` — Crescent fort MEDIUM 256×220: dome + minaret + pointed arch
  7. `map-city-con-m.webp` — East-Asian fort MEDIUM 256×220: flying eaves + rammed-earth wall
  8. `map-city-mazu-m.webp` — Port fort MEDIUM 256×220: pier + junk masts + temple eave
  9. `map-city-chr-l.webp` — Christendom fort LARGE 320×280: multi-tower keep + walls, still side elevation icon
  10. `map-city-isl-l.webp` — Crescent fort LARGE 320×280: grand dome cluster + tall minaret
  11. `map-city-con-l.webp` — East-Asian fort LARGE 320×280: multi-eave halls + terrace
  12. `map-city-mazu-l.webp` — Port fort LARGE 320×280: harbor walls + several junks + temple

**Prompt**

Generate exactly ONE 4×3 contact sheet of 12 map city-fort icons on transparent background. Thin dark gutters. Identical 13th-century mappa mundi / portolan hand-drawn style — vellum tones, iron-gall ink, mineral washes. Side elevation only (NOT top-down). Flat base + soft drop shadow. No text, no flags with letters.
Row1 SMALL, Row2 MEDIUM, Row3 LARGE. Columns L→R: Christendom, Crescent/Islamic, East-Asian, Port/Mazu.
1. map-city-chr-s.webp — tiny Christendom fort
2. map-city-isl-s.webp — tiny crescent fort
3. map-city-con-s.webp — tiny East-Asian fort
4. map-city-mazu-s.webp — tiny port fort
5. map-city-chr-m.webp — medium Christendom fort
6. map-city-isl-m.webp — medium crescent fort
7. map-city-con-m.webp — medium East-Asian fort
8. map-city-mazu-m.webp — medium port fort
9. map-city-chr-l.webp — large Christendom fort
10. map-city-isl-l.webp — large crescent fort
11. map-city-con-l.webp — large East-Asian fort
12. map-city-mazu-l.webp — large port fort
Negative: photorealistic, 3D, neon, watermark, text, top-down plan view, deities.

---

## Batch 4 · Mtn · P1 山脉侧视立面补齐

- **Window**: Mtn
- **Mode**: sheet · **Grid**: 3×2 · **Cell**: 512×280 · **Output per file**: 512×280 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-mtn-karst.webp` — Karst / tower peaks 512×280 side elevation, misty bases
  2. `map-mtn-volcano.webp` — Volcanic cone 512×280 side elevation, dark rock, thin smoke wisp (no lava neon)
  3. `map-mtn-plateau.webp` — Flat-top mesa/plateau range 512×280 side elevation
  4. `map-mtn-foothill.webp` — Low rolling foothills 512×200 side elevation
  5. `map-mtn-glacier.webp` — Glacier-tongued peaks 512×280, pale ice, ink hatch
  6. `map-mtn-cliff.webp` — Coastal cliff massif 512×280 side elevation over thin sea strip

**Prompt**

Generate exactly ONE 3×2 contact sheet of 6 mountain SIDE-ELEVATION map pieces on transparent background. Thin dark gutters. 13th-century mappa mundi style — iron-gall ink, ochre washes, flat base + soft shadow. NOT top-down. No text.
1. map-mtn-karst.webp — karst towers
2. map-mtn-volcano.webp — dark cone + thin smoke (no neon lava)
3. map-mtn-plateau.webp — mesa/plateau
4. map-mtn-foothill.webp — low foothills
5. map-mtn-glacier.webp — iced peaks
6. map-mtn-cliff.webp — coastal cliffs
Negative: photorealistic, 3D, neon, watermark, text, top-down contour map.

---

## Batch 5 · Wind · P1 风神头四缘

- **Window**: Wind
- **Mode**: sheet · **Grid**: 2×2 · **Cell**: 200×200 · **Output per file**: 200×200 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-wind-n.webp` — North wind head 200×200: cheek-puffed profile facing down, blowing
  2. `map-wind-e.webp` — East wind head 200×200: cheek-puffed profile facing left, blowing
  3. `map-wind-s.webp` — South wind head 200×200: cheek-puffed profile facing up, blowing
  4. `map-wind-w.webp` — West wind head 200×200: cheek-puffed profile facing right, blowing

**Prompt**

Generate exactly ONE 2×2 contact sheet of 4 wind-head ornaments on transparent background. Thin dark gutters. Manuscript map style — iron-gall ink, ochre flesh, rubric lips accent only. Cheek-puffed classical wind putto/elder heads blowing lines of air. No text.
1. map-wind-n.webp — blows downward
2. map-wind-e.webp — blows leftward
3. map-wind-s.webp — blows upward
4. map-wind-w.webp — blows rightward
Negative: photorealistic, 3D, neon, watermark, text, modern cartoon.

---

## Batch 6 · Route · P1 路线笔触

- **Window**: Route
- **Mode**: sheet · **Grid**: 3×1 · **Cell**: 512×96 · **Output per file**: 512×96 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-route-land.webp` — 512×96 horizontal land caravan path stroke: dashed ochre/ink, tapering ends, stretchable brush feel
  2. `map-route-sea.webp` — 512×96 horizontal sea lane stroke: teal dashed swell marks, tapering ends
  3. `map-route-river.webp` — 512×96 horizontal river ink ribbon: continuous tapering wash, soft banks

**Prompt**

Generate exactly ONE 3×1 contact sheet of 3 horizontal route-brush textures on transparent background. Thin dark gutters. Portolan manuscript style. Each cell is a single stretchable stroke (not a landscape). Tapered ends. No text, no cities.
1. map-route-land.webp — ochre/ink dashed caravan path
2. map-route-sea.webp — teal dashed sea lane
3. map-route-river.webp — continuous iron-gall river ribbon
Negative: photorealistic, 3D, neon, watermark, text, full map scene.

---

### Window → batches
- **Desk**: Batch 1
- **Tex**: Batch 2
- **City**: Batch 3
- **Mtn**: Batch 4
- **Wind**: Batch 5
- **Route**: Batch 6

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --max-windows 2 --poll-sec 600 --skip-existing
```
