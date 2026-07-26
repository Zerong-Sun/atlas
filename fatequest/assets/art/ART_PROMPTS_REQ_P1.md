# FateQuest · ART_TODO P1 · MVP Twelve Cities

Source: `ART_TODO.md` P1 + `docs/GDD.md` §5–§6.
Scope: 12 city entry + 36 site illustrations + 18 retainer portraits + 4 contract UI = **70 new files**.
Legacy aliases (4): copy existing scenes — see `scripts/copy_p1_legacy_scenes.py`.

**Style — entry/site (960×540):** 13th-century manuscript miniature × dusk. Vellum `#E9DBB8`, iron-gill `#4A3A1C`, ochre `#8A6234`, rubric `#B3402E`, sea-teal `#3F5F6B`. Opaque landscape, cinematic entry perspective. NO photorealism, NO neon, NO readable text.

**Style — retainers:** Same as venue NPCs — half-body facing RIGHT, ~900×1300, transparent, bottom 15% dialog-safe.

**Style — contract UI:** Cloud-ridge Twilight parchment UI — forest ink `#0D1411`, parchment `#F0E4D0`, gold `#BDA476`, rubric `#B3402E`.

**Windows:** CityA · CityB · CityC · SiteA · SiteB · SiteC · RetainerGuide · RetainerLang · RetainerPorter · RetainerGuard · RetainerHeal · RetainerSail · RetainerScribe · RetainerMonk · RetainerSeer · Contract

---

## Batch 1 · CityA · entry views venice–baldacum

- **Window**: CityA
- **Mode**: separate · **Count**: 4 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `city-venice-entry.webp` — entering Venice: lagoon gate ahead, campanile silhouette, morning mist
  2. `city-acre-entry.webp` — entering Acre: crusader gate arch, battlements, Mediterranean glint
  3. `city-tauris-entry.webp` — entering Tabriz/Tauris: bazaar gate, blue dome beyond arches
  4. `city-baldacum-entry.webp` — entering Baldacum/Baghdad: Tigris gate, palms, caliphate walls

**Prompt**

Generate exactly 4 SEPARATE opaque 16:9 entry-view scenes (~960×540 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature, vellum #E9DBB8, iron-gall #4A3A1C, ochre #8A6234, rubric #B3402E, sea-teal #3F5F6B. First-person approaching city gate perspective. Dusk light. No text.
Order:
1. city-venice-entry.webp — Venice lagoon gate, campanile ahead
2. city-acre-entry.webp — Acre crusader gate, walls
3. city-tauris-entry.webp — Tauris bazaar gate, blue dome
4. city-baldacum-entry.webp — Baldacum Tigris gate, palms
Negative: photorealistic, 3D, neon, watermark, text, top-down map view.

---

## Batch 2 · CityB · entry views hormos–cascar

- **Window**: CityB
- **Mode**: separate · **Count**: 4 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `city-hormos-entry.webp` — entering Hormuz: gulf port gate, dhow masts, heat haze
  2. `city-balc-entry.webp` — entering Balc/Balkh: ruined marble gate, dust haze, fallen columns
  3. `city-samarcanda-entry.webp` — entering Samarcanda: blue-glazed gate, orchard trees
  4. `city-cascar-entry.webp` — entering Cascar/Kashgar: oasis crossroads gate, twin roads diverging

**Prompt**

Generate exactly 4 SEPARATE opaque entry-view scenes (~960×540 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature style, dusk light, flat mineral washes. Approaching-gate perspective. No text.
Order:
1. city-hormos-entry.webp — Hormuz port gate, dhows
2. city-balc-entry.webp — Balc ruined marble gate, dust
3. city-samarcanda-entry.webp — Samarcanda blue-glaze gate, orchards
4. city-cascar-entry.webp — Cascar crossroads gate, two roads
Negative: photorealistic, 3D, neon, watermark, text.

---

## Batch 3 · CityC · entry views cotan–zayton

- **Window**: CityC
- **Mode**: separate · **Count**: 4 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `city-cotan-entry.webp` — entering Cotan/Khotan: jade river gate, willows, cotton fields glimpse
  2. `city-lop-entry.webp` — entering Lop: desert-edge mud gate, dunes beyond, camel silhouettes
  3. `city-cambaluc-entry.webp` — entering Cambaluc/Khanbaliq: drum-tower gate, pagoda hint (no deity)
  4. `city-zayton-entry.webp` — entering Zayton/Quanzhou: harbor gate, junk masts, spice wharf

**Prompt**

Generate exactly 4 SEPARATE opaque entry-view scenes (~960×540 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature, dusk light, flat washes. Gate approach perspective. No text, no glyphs.
Order:
1. city-cotan-entry.webp — Cotan river gate, willows
2. city-lop-entry.webp — Lop desert-edge gate, dunes
3. city-cambaluc-entry.webp — Cambaluc drum-tower gate
4. city-zayton-entry.webp — Zayton harbor gate, junks
Negative: photorealistic, 3D, neon, watermark, text, glyphs, deities.

---

## Batch 4 · SiteA · Venice exploration sites 1–3

- **Window**: SiteA
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-venice-1.webp` — Venice temple/shrine: campanile courtyard, lagoon hint
  2. `site-venice-2.webp` — Venice market: Rialto-style arcade, cloth bolts
  3. `site-venice-3.webp` — Venice inn: canal-side inn doorway, gondola

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature, dusk light. Venice shrine · market · inn. No text.
Negative: photorealistic, 3D, neon, watermark, text.

---

## Batch 5 · SiteA · Acre exploration sites 1–3

- **Window**: SiteA
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-acre-1.webp` — Acre chapel/shrine: crusader chapel, coastal fortress
  2. `site-acre-2.webp` — Acre market: spice sacks by port wall
  3. `site-acre-3.webp` — Acre inn: pilgrims' hospice stone walls

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Acre chapel · market · hospice. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 6 · SiteA · Tauris exploration sites 1–3

- **Window**: SiteA
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-tauris-1.webp` — Tauris shrine: blue dome courtyard (no calligraphy)
  2. `site-tauris-2.webp` — Tauris bazaar: carpet rolls under arch
  3. `site-tauris-3.webp` — Tauris caravanserai: courtyard + camel

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Tauris shrine · bazaar · caravanserai. No calligraphy.
Negative: photorealistic, 3D, neon, text, calligraphy.

---

## Batch 7 · SiteA · Baldacum exploration sites 1–3

- **Window**: SiteA
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-baldacum-1.webp` — Baldacum mosque courtyard: Tigris-side arch, palms
  2. `site-baldacum-2.webp` — Baldacum market: gold-brocade stall
  3. `site-baldacum-3.webp` — Baldacum caravanserai: palm + courtyard arch

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Baldacum mosque · market · caravanserai. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 8 · SiteB · Hormos exploration sites 1–3

- **Window**: SiteB
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-hormos-1.webp` — Hormos coastal shrine, dhow silhouette
  2. `site-hormos-2.webp` — Hormos pearl/fish market by dock
  3. `site-hormos-3.webp` — Hormos port rest-house, palm + dhow

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Hormos shrine · market · inn. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 9 · SiteB · Balc exploration sites 1–3

- **Window**: SiteB
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-balc-1.webp` — Balc ruined temple column, dust haze
  2. `site-balc-2.webp` — Balc open-air lapis market
  3. `site-balc-3.webp` — Balc ruined caravanserai arch

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Balc shrine · market · inn. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 10 · SiteB · Samarcanda exploration sites 1–3

- **Window**: SiteB
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-samarcanda-1.webp` — Samarcanda blue-glazed dome shrine, orchard
  2. `site-samarcanda-2.webp` — Samarcanda silk + fruit market
  3. `site-samarcanda-3.webp` — Samarcanda orchard caravanserai

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Samarcanda shrine · market · inn. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 11 · SiteB · Cascar exploration sites 1–3

- **Window**: SiteB
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-cascar-1.webp` — Cascar crossroads shrine, twin roads
  2. `site-cascar-2.webp` — Cascar split-route caravan stall
  3. `site-cascar-3.webp` — Cascar crossroads caravanserai

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Cascar shrine · market · inn. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 12 · SiteC · Cotan exploration sites 1–3

- **Window**: SiteC
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-cotan-1.webp` — Cotan river temple, willow + stream
  2. `site-cotan-2.webp` — Cotan jade + cotton market by river
  3. `site-cotan-3.webp` — Cotan riverside waystation, bridge hint

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Cotan shrine · market · inn. No glyphs.
Negative: photorealistic, 3D, neon, text, glyphs.

---

## Batch 13 · SiteC · Lop exploration sites 1–3

- **Window**: SiteC
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-lop-1.webp` — Lop desert-edge mud shrine, dune horizon
  2. `site-lop-2.webp` — Lop camel-goods market, sand drift
  3. `site-lop-3.webp` — Lop desert inn, well + dune

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Lop shrine · market · inn. No text.
Negative: photorealistic, 3D, neon, text.

---

## Batch 14 · SiteC · Cambaluc exploration sites 1–3

- **Window**: SiteC
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-cambaluc-1.webp` — Cambaluc pagoda/drum-tower shrine (no deity figure)
  2. `site-cambaluc-2.webp` — Cambaluc paper-money market stall + tower
  3. `site-cambaluc-3.webp` — Cambaluc yam post-station, drum-tower

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Cambaluc shrine · market · inn. No deity figures.
Negative: photorealistic, 3D, neon, text, glyphs, deities.

---

## Batch 15 · SiteC · Zayton exploration sites 1–3

- **Window**: SiteC
- **Mode**: separate · **Count**: 3 · **Output per file**: 960×540 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `site-zayton-1.webp` — Zayton harbor temple, junk mast silhouette
  2. `site-zayton-2.webp` — Zayton spice/pepper market, junk dock
  3. `site-zayton-3.webp` — Zayton harbor inn, junk + dock

**Prompt**

Generate exactly 3 SEPARATE opaque POI illustrations (~960×540 each), NOT a contact sheet. 13th-century manuscript miniature, dusk. Zayton shrine · market · inn. No glyphs.
Negative: photorealistic, 3D, neon, text, glyphs.

---

## Batch 16 · RetainerGuide · retainers guide chr + isl

- **Window**: RetainerGuide
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-guide-chr.webp` — Christendom caravan guide, half-body facing right, staff + travel cloak
  2. `retainer-guide-isl.webp` — Islamic desert guide, half-body facing right, turban + camel goad

**Prompt**

Generate exactly 2 SEPARATE retainer half-body portraits (~900×1300, transparent), NOT a contact sheet. Do not write an explanation.
13th-century manuscript illumination. Half-body facing RIGHT; bottom 15% dialog-safe. No text, no deities.
1. retainer-guide-chr.webp — Christendom guide with staff and cloak
2. retainer-guide-isl.webp — Islamic guide with turban and goad
Negative: photorealistic, 3D, neon, text, facing left, full-body.

---

## Batch 8 · RetainerLang · interpreter chr + isl

- **Window**: RetainerLang
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-lang-chr.webp` — Christendom interpreter, half-body facing right, phrase scroll + finger gesture (blank scroll)
  2. `retainer-lang-isl.webp` — Islamic dragoman, half-body facing right, ledger tablet + pointing hand (no script)

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe. No readable text.
1. retainer-lang-chr.webp — Christendom interpreter with blank scroll
2. retainer-lang-isl.webp — Islamic dragoman with blank tablet
Negative: photorealistic, 3D, neon, text, calligraphy, facing left.

---

## Batch 9 · RetainerPorter · porter chr + isl

- **Window**: RetainerPorter
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-porter-chr.webp` — Christendom porter, half-body facing right, shoulder yoke + bales
  2. `retainer-porter-isl.webp` — Islamic porter, half-body facing right, head-load basket + rope

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe.
1. retainer-porter-chr.webp — Christendom porter with yoke
2. retainer-porter-isl.webp — Islamic porter with head-load
Negative: photorealistic, 3D, neon, text, facing left.

---

## Batch 10 · RetainerGuard · guard chr + isl

- **Window**: RetainerGuard
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-guard-chr.webp` — Christendom caravan guard, half-body facing right, mail coif + spear
  2. `retainer-guard-isl.webp` — Islamic guard, half-body facing right, round shield + curved blade

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe.
1. retainer-guard-chr.webp — Christendom guard with spear
2. retainer-guard-isl.webp — Islamic guard with shield
Negative: photorealistic, 3D, neon, text, gore, facing left.

---

## Batch 11 · RetainerHeal · healer chr + isl

- **Window**: RetainerHeal
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-heal-chr.webp` — Christendom physician attendant, half-body facing right, herb pouch + mortar
  2. `retainer-heal-isl.webp` — Islamic physician, half-body facing right, medicine jar + linen roll

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe.
1. retainer-heal-chr.webp — Christendom healer with herb pouch
2. retainer-heal-isl.webp — Islamic healer with medicine jar
Negative: photorealistic, 3D, neon, text, facing left.

---

## Batch 12 · RetainerSail · sailor chr + isl

- **Window**: RetainerSail
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-sail-chr.webp` — Mediterranean sailor, half-body facing right, rope coil + lead line
  2. `retainer-sail-isl.webp` — Indian Ocean navigator, half-body facing right, astrolabe + chart board (no letters)

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe.
1. retainer-sail-chr.webp — Mediterranean sailor with rope
2. retainer-sail-isl.webp — Indian Ocean navigator with astrolabe
Negative: photorealistic, 3D, neon, text, facing left.

---

## Batch 13 · RetainerScribe · scribe chr + isl

- **Window**: RetainerScribe
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-scribe-chr.webp` — Christendom scribe, half-body facing right, quill + blank parchment
  2. `retainer-scribe-isl.webp` — Islamic secretary, half-body facing right, reed pen + blank folio

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe.
1. retainer-scribe-chr.webp — Christendom scribe with quill
2. retainer-scribe-isl.webp — Islamic scribe with reed pen
Negative: photorealistic, 3D, neon, text, calligraphy, facing left.

---

## Batch 14 · RetainerMonk · acolyte chr + isl

- **Window**: RetainerMonk
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-monk-chr.webp` — Franciscan acolyte, half-body facing right, candle + rosary beads (no cross text)
  2. `retainer-monk-isl.webp` — Sufi novice attendant, half-body facing right, incense burner + prayer beads

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe. No deity figures.
1. retainer-monk-chr.webp — Franciscan acolyte with candle
2. retainer-monk-isl.webp — Sufi novice with incense burner
Negative: photorealistic, 3D, neon, text, deities, facing left.

---

## Batch 15 · RetainerSeer · diviner chr + isl

- **Window**: RetainerSeer
- **Mode**: separate · **Count**: 2 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-seer-chr.webp` — Christendom star-reader, half-body facing right, brass astrolabe + star chart (no letters)
  2. `retainer-seer-isl.webp` — Islamic astrologer, half-body facing right, armillary sphere + sand board (no script)

**Prompt**

Generate exactly 2 SEPARATE retainer portraits (~900×1300, transparent). Half-body facing RIGHT; bottom 15% dialog-safe.
1. retainer-seer-chr.webp — Christendom star-reader with astrolabe
2. retainer-seer-isl.webp — Islamic astrologer with armillary sphere
Negative: photorealistic, 3D, neon, text, facing left.

---

## Batch 16 · Contract · recruitment contract UI

- **Window**: Contract
- **Mode**: separate · **Count**: 4 · **Output per file**: 512×768 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `contract-open.webp` — open recruitment contract parchment, blank lines, wax seal corner empty
  2. `contract-divined.webp` — same contract with star/omen watermark (divined hire mode)
  3. `contract-sealed.webp` — rolled sealed contract with rubric wax ribbon
  4. `seal-wax.webp` — standalone wax seal stamp blob, rubric red #B3402E

**Prompt**

Generate exactly 4 SEPARATE contract UI pieces on transparent backgrounds (~512×768 each except seal), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight parchment UI — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, rubric #B3402E. NO readable text or letters on contracts.
Order:
1. contract-open.webp — open blank contract sheet
2. contract-divined.webp — contract with subtle star omen watermark
3. contract-sealed.webp — rolled sealed contract
4. seal-wax.webp — wax seal blob (~256×256 centered on transparent)
Negative: photorealistic, 3D, neon, watermark, readable text, letters.

---

### Window -> batches
- **CityA–CityC**: Batches 1–3 (12 entry views)
- **SiteA–SiteC**: Batches 4–6 (36 site illustrations)
- **Retainer***: Batches 7–15 (18 retainers)
- **Contract**: Batch 16

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P1.md \
  --max-windows 2 --poll-sec 600 --skip-existing
```
