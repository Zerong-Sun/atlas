# FateQuest · ART_REQUIREMENTS P4 + P5 · Batch Prompts

Source: `docs/ART_REQUIREMENTS.md` remaining gaps.
P4: cargo/bag slot UI (few) + proper compass rose (P1 leftover).
P5: 9 professions x 4 cultures = 36 half-body NPCs.

**Style — UI/map icons:** Cloud-ridge Twilight manuscript UI — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, rubric #B3402E accent. Flat mineral paint. NO photorealism, NO neon, NO readable text.

**Style — NPCs:** 13th-century manuscript illumination. Iron-gall #4A3A1C contours, mineral flats, antique gold accents sparingly. Candle/dusk only. NO photorealism, NO 3D, NO neon, NO text, NO anthropomorphic deities.

**NPC composition lock:** half-body, facing RIGHT, transparent background, ~900x1300. Bottom ~15% dialog-safe. Face/shoulders/props in upper 85%.

**Windows (max 2):** Rose · Cargo · NpcGuide · NpcLang · NpcPorter · NpcGuard · NpcHeal · NpcSail · NpcScribe · NpcMonk · NpcSeer

---

## Batch 1 · Rose · compass rose (P1 leftover)

- **Window**: Rose
- **Mode**: separate · **Count**: 1 · **Output per file**: 512×512 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-rose.webp` — manuscript compass rose 512x512 with ordinal rays (N/E/S/W indicated by motif only, NO letters), gold+ink, centered, transparent

**Prompt**

Generate exactly 1 SEPARATE transparent-background map ornament (~512x512). Do not write an explanation.
13th-century portolan manuscript style — vellum tones, iron-gall ink #4A3A1C, ochre #8A6234, antique gold #BDA476. Flat brush, parchment grain. NO photorealism, NO neon, NO readable letters/text.
1. map-rose.webp — classic compass rose with 8 or 16 rays, decorative fleur center, ordinal directions by shape only (no N/E/S/W letters)
Negative: photorealistic, 3D, neon, watermark, text, letters.

---

## Batch 2 · Cargo · bag and cargo slot UI (P4)

- **Window**: Cargo
- **Mode**: sheet · **Grid**: 3×2 · **Cell**: 256×256 · **Output per file**: 256×256 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `ui-slot-empty.webp` — empty cargo cell frame, parchment inset, thin gold border
  2. `ui-slot-selected.webp` — same cell with rubric highlight rim (selected)
  3. `ui-slot-locked.webp` — cell with small lock/seal motif (disabled/locked)
  4. `ui-slot-overweight.webp` — cell with cracked rim / warning rubric notch (over capacity)
  5. `ui-bag-panel.webp` — tall bag/inventory panel plate (portrait tile), blank center for grid
  6. `ui-cargo-tag.webp` — small bulk-tag badge (abstract weight mark, no letters)

**Prompt**

Generate exactly ONE 3x2 contact sheet of 6 cargo/inventory UI pieces on transparent background. Thin dark gutters. Cloud-ridge Twilight manuscript UI — parchment #F0E4D0, forest ink #0D1411, antique gold #BDA476, rubric #B3402E accent only. Flat mineral paint, readable at 48px. NO readable text/letters.
1. ui-slot-empty.webp — empty slot frame
2. ui-slot-selected.webp — selected slot with rubric rim
3. ui-slot-locked.webp — locked slot with seal
4. ui-slot-overweight.webp — overloaded/cracked warning slot
5. ui-bag-panel.webp — inventory bag panel plate
6. ui-cargo-tag.webp — tiny bulk/weight tag badge
Negative: photorealistic, 3D, neon, watermark, text, letters, modern UI chrome.

---

## Batch 3 · NpcGuide · guide x4 cultures

- **Window**: NpcGuide
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-guide-chr.webp` — Christendom caravan guide, half-body facing right, staff + travel cloak; bottom 15% dialog-safe
  2. `npc-job-guide-isl.webp` — Islamic desert guide, half-body facing right, turban + camel goad; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-guide-chr.webp — Christendom caravan guide with staff and cloak
2. npc-job-guide-isl.webp — Islamic desert guide with turban and camel goad
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 4 · NpcGuide · guide con + mazu

- **Window**: NpcGuide
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-guide-con.webp` — East-Asian road guide, half-body facing right, bamboo hat + map tube; bottom 15% dialog-safe
  2. `npc-job-guide-mazu.webp` — Maritime pilot-guide, half-body facing right, compass tablet + sea cloak; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-guide-con.webp — East-Asian road guide with bamboo hat and map tube
2. npc-job-guide-mazu.webp — Maritime pilot-guide with compass tablet and sea cloak
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 5 · NpcLang · translator x2

- **Window**: NpcLang
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-translator-chr.webp` — Latin/Persian interpreter, half-body facing right, bilingual ledgers; bottom 15% dialog-safe
  2. `npc-job-translator-isl.webp` — Arabic-Persian translator, half-body facing right, ink kit + scroll; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%. Scrolls show blank bands only (no letters).
Order:
1. npc-job-translator-chr.webp — Christendom interpreter with ledgers
2. npc-job-translator-isl.webp — Islamic translator with ink kit and blank scroll
Negative: photorealistic, 3D, neon, watermark, readable text, full-body, facing left, deities.

---

## Batch 6 · NpcLang · translator con + mazu

- **Window**: NpcLang
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-translator-con.webp` — Chinese-Persian clerk-translator, half-body facing right, brush case; bottom 15% dialog-safe
  2. `npc-job-translator-mazu.webp` — Port polyglot broker, half-body facing right, tally tokens; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-translator-con.webp — East-Asian clerk-translator with brush case
2. npc-job-translator-mazu.webp — Port polyglot broker with tally tokens
Negative: photorealistic, 3D, neon, watermark, readable text, full-body, facing left, deities.

---

## Batch 7 · NpcPorter · porter x2

- **Window**: NpcPorter
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-porter-chr.webp` — Christendom pack-porter, half-body facing right, rope + crate strap; bottom 15% dialog-safe
  2. `npc-job-porter-isl.webp` — Islamic camel-driver porter, half-body facing right, pack harness; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-porter-chr.webp — Christendom pack-porter with rope and strap
2. npc-job-porter-isl.webp — Islamic camel-driver porter with pack harness
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 8 · NpcPorter · porter con + mazu

- **Window**: NpcPorter
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-porter-con.webp` — East-Asian coolie/porter, half-body facing right, shoulder pole; bottom 15% dialog-safe
  2. `npc-job-porter-mazu.webp` — Harbor stevedore, half-body facing right, cargo hook; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-porter-con.webp — East-Asian porter with shoulder pole
2. npc-job-porter-mazu.webp — Harbor stevedore with cargo hook
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 9 · NpcGuard · guard x2

- **Window**: NpcGuard
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-guard-chr.webp` — Christendom caravan guard, half-body facing right, mail coif + spear; bottom 15% dialog-safe
  2. `npc-job-guard-isl.webp` — Islamic caravan guard, half-body facing right, curved blade + shield boss; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-guard-chr.webp — Christendom guard with mail and spear
2. npc-job-guard-isl.webp — Islamic guard with curved blade
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, gore.

---

## Batch 10 · NpcGuard · guard con + mazu

- **Window**: NpcGuard
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-guard-con.webp` — East-Asian escort guard, half-body facing right, glaive + lamellar hints; bottom 15% dialog-safe
  2. `npc-job-guard-mazu.webp` — Ship marine guard, half-body facing right, rattan shield + boarding knife; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-guard-con.webp — East-Asian escort with glaive
2. npc-job-guard-mazu.webp — Ship marine with rattan shield
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, gore.

---

## Batch 11 · NpcHeal · healer x2

- **Window**: NpcHeal
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-healer-chr.webp` — Christendom barber-physician, half-body facing right, herb pouch + knife case; bottom 15% dialog-safe
  2. `npc-job-healer-isl.webp` — Islamic hakim, half-body facing right, medicine box + mortar; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-healer-chr.webp — Christendom barber-physician with herb pouch
2. npc-job-healer-isl.webp — Islamic hakim with medicine box
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 12 · NpcHeal · healer con + mazu

- **Window**: NpcHeal
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-healer-con.webp` — East-Asian traveling doctor, half-body facing right, medicine gourd + needle case; bottom 15% dialog-safe
  2. `npc-job-healer-mazu.webp` — Ship surgeon-herbalist, half-body facing right, bandage roll + salve pot; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-healer-con.webp — East-Asian doctor with medicine gourd
2. npc-job-healer-mazu.webp — Ship herbalist with bandage and salve
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 13 · NpcSail · sailor x2

- **Window**: NpcSail
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-sailor-chr.webp` — Mediterranean sailor, half-body facing right, rope coil + wool cap; bottom 15% dialog-safe
  2. `npc-job-sailor-isl.webp` — Dhow sailor, half-body facing right, lateen rope + sash; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-sailor-chr.webp — Mediterranean sailor with rope coil
2. npc-job-sailor-isl.webp — Dhow sailor with lateen rope
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 14 · NpcSail · sailor con + mazu

- **Window**: NpcSail
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-sailor-con.webp` — Junk sailor, half-body facing right, bamboo hat + oar grip; bottom 15% dialog-safe
  2. `npc-job-sailor-mazu.webp` — South-China-sea navigator, half-body facing right, sounding lead + sea cloak; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-sailor-con.webp — Junk sailor with bamboo hat
2. npc-job-sailor-mazu.webp — Maritime navigator with sounding lead
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities.

---

## Batch 15 · NpcScribe · scribe x2

- **Window**: NpcScribe
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-scribe-chr.webp` — Christendom clerk-scribe, half-body facing right, quill + blank parchment; bottom 15% dialog-safe
  2. `npc-job-scribe-isl.webp` — Islamic calligrapher-clerk, half-body facing right, reed pen + ink pot; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%. Parchment bands blank (no letters).
Order:
1. npc-job-scribe-chr.webp — Christendom scribe with quill
2. npc-job-scribe-isl.webp — Islamic clerk with reed pen
Negative: photorealistic, 3D, neon, watermark, readable text, full-body, facing left, deities.

---

## Batch 16 · NpcScribe · scribe con + mazu

- **Window**: NpcScribe
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-scribe-con.webp` — East-Asian copyist, half-body facing right, brush + blank scroll; bottom 15% dialog-safe
  2. `npc-job-scribe-mazu.webp` — Port cargo clerk, half-body facing right, tally board; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%. Scroll blank (no characters).
Order:
1. npc-job-scribe-con.webp — East-Asian copyist with brush
2. npc-job-scribe-mazu.webp — Port cargo clerk with tally board
Negative: photorealistic, 3D, neon, watermark, readable text, full-body, facing left, deities.

---

## Batch 17 · NpcMonk · religious attendant x2

- **Window**: NpcMonk
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-acolyte-chr.webp` — Christian monastic acolyte, half-body facing right, habit + small cross object; bottom 15% dialog-safe
  2. `npc-job-acolyte-isl.webp` — Mosque attendant apprentice, half-body facing right, keys + lantern; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%. Cross as small object only.
Order:
1. npc-job-acolyte-chr.webp — Christian acolyte with habit
2. npc-job-acolyte-isl.webp — Mosque attendant with keys and lantern
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, idol statues.

---

## Batch 18 · NpcMonk · acolyte con + mazu

- **Window**: NpcMonk
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-acolyte-con.webp` — Buddhist/Daoist temple novice, half-body facing right, incense tools, NO deity figure; bottom 15% dialog-safe
  2. `npc-job-acolyte-mazu.webp` — Tianfei temple attendant apprentice, half-body facing right, incense pouch, NO goddess figure; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%. No deity/goddess figures.
Order:
1. npc-job-acolyte-con.webp — Temple novice with incense tools
2. npc-job-acolyte-mazu.webp — Tianfei attendant apprentice with incense pouch
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, goddess statues.

---

## Batch 19 · NpcSeer · diviner x2

- **Window**: NpcSeer
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-diviner-chr.webp` — Christendom omen-reader, half-body facing right, star tablet + chalk; bottom 15% dialog-safe
  2. `npc-job-diviner-isl.webp` — Islamic astrologer, half-body facing right, astrolabe; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-diviner-chr.webp — Christendom omen-reader with star tablet
2. npc-job-diviner-isl.webp — Islamic astrologer with astrolabe
Negative: photorealistic, 3D, neon, watermark, readable text, full-body, facing left, deities.

---

## Batch 20 · NpcSeer · diviner con + mazu

- **Window**: NpcSeer
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-job-diviner-con.webp` — East-Asian I Ching / lot diviner, half-body facing right, yarrow or lot tube prop; bottom 15% dialog-safe
  2. `npc-job-diviner-mazu.webp` — Port omen-reader, half-body facing right, jiaobei blocks prop; bottom 15% dialog-safe

**Prompt**

Generate exactly 2 SEPARATE half-body NPC portraits on transparent backgrounds (~900x1300 each), NOT a contact sheet. Do not write an explanation.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flats, parchment grain, candlelight only. No photorealism, no neon, no text, no deities.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%.
Order:
1. npc-job-diviner-con.webp — East-Asian diviner with lot/yarrow prop
2. npc-job-diviner-mazu.webp — Port omen-reader with moon-block props
Negative: photorealistic, 3D, neon, watermark, readable text, full-body, facing left, deities.

---

### Window -> batches
- **Rose**: Batch 1
- **Cargo**: Batch 2
- **NpcGuide**: Batches 3-4
- **NpcLang**: Batches 5-6
- **NpcPorter**: Batches 7-8
- **NpcGuard**: Batches 9-10
- **NpcHeal**: Batches 11-12
- **NpcSail**: Batches 13-14
- **NpcScribe**: Batches 15-16
- **NpcMonk**: Batches 17-18
- **NpcSeer**: Batches 19-20

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P4P5.md \
  --max-windows 2 --poll-sec 600 --skip-existing
```
