# FateQuest · ART_REQUIREMENTS remain · Batch Prompts

Source: `docs/ART_REQUIREMENTS.md` §1 content-mismatch + §3.1 venue expansion.
Scope **B**: redraw 2 wrong region plates + 16 new venue NPCs (dock / official / healer / scribe × 4 cultures).

**Style — scenes:** 13th-century manuscript miniature × dusk travel light. Vellum #E9DBB8, iron-gall #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain. NO photorealism, NO neon, NO readable text.

**Composition — scenes (16:9):** Opaque full-bleed ~1920×1080. Lower-left ~1/3 empty for dialog+portrait. Landmarks center-right / upper half. No deities.

**Style — venue NPCs:** Same as existing city-view portraits. Iron-gall #4A3A1C contours, mineral flats, antique gold #BDA476 sparingly, parchment grain, candle/dusk only. NO photorealism, NO neon, NO text, NO deities.

**Composition — NPCs:** Half-body facing RIGHT, transparent field, ~900×1300. Bottom ~15% dialog-safe. Face/shoulders/props in upper 85%.

**Windows (run one at a time):** Region · VenueDock · VenueOfficial · VenueHeal · VenueScribe

---

## Batch 1 · Region · redraw Islamic world plate (was wrongly Chinese lake)

- **Window**: Region
- **Mode**: separate · **Count**: 1 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-region-isl.webp` — Islamic Silk-Road world plate: caravanserai courtyards, mosque courtyard arches (NO calligraphy, NO deity), date palms, mud-brick walls, desert-fringe hills; warm dusk; empty lower-left third. MUST look West/Central Asian Islamic — NOT Chinese lake, lanterns, painted boats, or arched garden bridges.

**Prompt**

Generate exactly 1 SEPARATE opaque 16:9 scene background (~1920x1080). Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. No photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; landmarks center-right / upper half.
1. scene-region-isl.webp — Islamic Silk-Road region: caravanserai courtyard, mosque arches without calligraphy, date palms, mud-brick town, desert fringe. Explicitly NOT a Chinese landscape (no lanterns, no painted pleasure boats, no willow lake gardens, no stone moon bridges).
Negative: photorealistic, 3D, neon, watermark, text, Chinese lake scenery, lanterns, deities, crowded lower-left.

---

## Batch 2 · Region · redraw Christendom plate (was wrongly desert caravan)

- **Window**: Region
- **Mode**: separate · **Count**: 1 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-region-chr.webp` — Latin Christendom region plate: Romanesque stone church facade (cross as small architectural object only), walled medieval town, green hills and oak copses, pilgrim road; cool-warm dusk; empty lower-left third. MUST look European Latin West — NOT Central Asian desert dunes or camel caravan desert.

**Prompt**

Generate exactly 1 SEPARATE opaque 16:9 scene background (~1920x1080). Do not write an explanation.
Style: 13th-century manuscript miniature, vellum #E9DBB8, iron-gall #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. Flat mineral washes, parchment grain, dusk light. No photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 empty for dialog + portrait; landmarks center-right / upper half.
1. scene-region-chr.webp — Latin Christendom: Romanesque church facade, stone town walls, green hills, oak trees, pilgrim road. Explicitly NOT a Central Asian desert caravan scene (no dune sea, no desert-only camel train as main subject).
Negative: photorealistic, 3D, neon, watermark, text, desert dunes as main subject, deities, crowded lower-left.

---

## Batch 3 · VenueDock · harbor workers chr + isl

- **Window**: VenueDock
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-dock-chr.webp` — Christendom dockworker / stevedore, half-body facing right, rope coil + cargo hook; bottom 15% dialog-safe
  2. `npc-dock-isl.webp` — Islamic port laborer, half-body facing right, palm-fiber rope + bale hook; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-dock-chr.webp — Christendom dockworker with rope and cargo hook
2. npc-dock-isl.webp — Islamic port laborer with palm-fiber rope and bale
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 4 · VenueDock · harbor workers con + mazu

- **Window**: VenueDock
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-dock-con.webp` — East-Asian riverside dockhand, half-body facing right, bamboo pole + hemp coil; bottom 15% dialog-safe
  2. `npc-dock-mazu.webp` — Maritime harbor stevedore, half-body facing right, ship rope + crate stamp board; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-dock-con.webp — East-Asian riverside dockhand with bamboo pole and hemp coil
2. npc-dock-mazu.webp — Maritime harbor stevedore with ship rope and crate board
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 5 · VenueOfficial · clerks / magistrates chr + isl

- **Window**: VenueOfficial
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-official-chr.webp` — Christendom town clerk / bailiff, half-body facing right, sealed scroll + ink pouch; bottom 15% dialog-safe
  2. `npc-official-isl.webp` — Islamic market inspector / qadi clerk, half-body facing right, ledger tablet + seal ring (no calligraphy); bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-official-chr.webp — Christendom town clerk with sealed scroll and ink pouch
2. npc-official-isl.webp — Islamic market inspector with blank ledger tablet and seal ring
Negative: photorealistic, 3D, neon, watermark, text, calligraphy, full-body, facing left, deities.

---

## Batch 6 · VenueOfficial · clerks con + mazu

- **Window**: VenueOfficial
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-official-con.webp` — East-Asian yamen clerk, half-body facing right, wooden tablet + brush case (blank slips, no glyphs); bottom 15% dialog-safe
  2. `npc-official-mazu.webp` — Port customs clerk, half-body facing right, tally stick + harbor stamp (no letters); bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-official-con.webp — East-Asian yamen clerk with wooden tablet and brush case (blank)
2. npc-official-mazu.webp — Port customs clerk with tally stick and harbor stamp (no letters)
Negative: photorealistic, 3D, neon, watermark, text, glyphs, full-body, facing left, deities.

---

## Batch 7 · VenueHeal · city healers chr + isl

- **Window**: VenueHeal
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-healer-chr.webp` — Christendom apothecary / barber-surgeon attendant, half-body facing right, herb pouch + mortar; bottom 15% dialog-safe
  2. `npc-healer-isl.webp` — Islamic bimaristan attendant, half-body facing right, medicine jar + linen roll; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-healer-chr.webp — Christendom apothecary with herb pouch and mortar
2. npc-healer-isl.webp — Islamic hospital attendant with medicine jar and linen
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 8 · VenueHeal · city healers con + mazu

- **Window**: VenueHeal
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-healer-con.webp` — East-Asian herbal clinic attendant, half-body facing right, medicine gourd + pestle; bottom 15% dialog-safe
  2. `npc-healer-mazu.webp` — Port ship-surgeon aide, half-body facing right, salve box + bandage roll; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-healer-con.webp — East-Asian herbal clinic attendant with medicine gourd and pestle
2. npc-healer-mazu.webp — Port ship-surgeon aide with salve box and bandage roll
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 9 · VenueScribe · city scribes chr + isl

- **Window**: VenueScribe
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-scribe-chr.webp` — Christendom scriptorium clerk, half-body facing right, quill + blank parchment roll; bottom 15% dialog-safe
  2. `npc-scribe-isl.webp` — Islamic copyist / secretary, half-body facing right, reed pen + blank folio board (no script); bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-scribe-chr.webp — Christendom scriptorium clerk with quill and blank parchment
2. npc-scribe-isl.webp — Islamic copyist with reed pen and blank folio (no script)
Negative: photorealistic, 3D, neon, watermark, text, calligraphy, full-body, facing left, deities.

---

## Batch 10 · VenueScribe · city scribes con + mazu

- **Window**: VenueScribe
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-scribe-con.webp` — East-Asian copyist, half-body facing right, brush + blank paper roll (no glyphs); bottom 15% dialog-safe
  2. `npc-scribe-mazu.webp` — Harbor letter-writer, half-body facing right, ink stone + blank slip board (no letters); bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-scribe-con.webp — East-Asian copyist with brush and blank paper roll
2. npc-scribe-mazu.webp — Harbor letter-writer with ink stone and blank slip board
Negative: photorealistic, 3D, neon, watermark, text, glyphs, full-body, facing left, deities.

---

### Window -> batches
- **Region**: Batches 1–2
- **VenueDock**: Batches 3–4
- **VenueOfficial**: Batches 5–6
- **VenueHeal**: Batches 7–8
- **VenueScribe**: Batches 9–10

```bash
# Archive wrong region plates first, then run ONE window at a time:
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_REMAIN.md \
  --window-order Region --max-windows 1 --poll-sec 600 --skip-existing
```
