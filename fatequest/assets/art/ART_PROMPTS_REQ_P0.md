# FateQuest · ART_TODO P0 · Opening / Loading / Character Gen

Source: `ART_TODO.md` P0 + `docs/GDD.md` §3–§4.
Scope: 7 book covers + 1 desk plate + 11 load screens + 4 fate UI + 5 culture + 8 faith = **36 files**.
(`scene-desk-opening.webp` already exists — skip.)

**Style — books/UI icons:** Cloud-ridge Twilight manuscript — forest ink `#0D1411`, parchment `#F0E4D0`, antique gold `#BDA476`, rubric `#B3402E` accent. Flat mineral paint, readable at 64px. NO photorealism, NO neon, NO readable text/letters.

**Style — load screens:** Same palette, **dark dusk tone**, opaque 16:9 ~1920×1080. **Lower ~1/4 empty/low-detail** for overlay proverb text. No figures in lower quarter.

**Windows (max 2):** BookA · BookB · Desk · LoadA · LoadB · LoadC · FateUI · Culture · FaithA · FaithB

---

## Batch 1 · BookA · travel book covers 1–4

- **Window**: BookA
- **Mode**: separate · **Count**: 4 · **Output per file**: 512×700 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `book-rubruck.webp` — Rubruck journey: leather cover, cross-staff + Mongol steppe motif, no title text
  2. `book-polo.webp` — Marco Polo: Venetian merchant cover, compass rose + caravan hint, no title text
  3. `book-battuta.webp` — Ibn Battuta: Maghrebi travel book, crescent arch + desert road motif, no calligraphy
  4. `book-odoric.webp` — Odoric of Pordenone: Franciscan friar cover, palm + monastery silhouette, no text

**Prompt**

Generate exactly 4 SEPARATE upright medieval travel-book cover illustrations on transparent backgrounds (~512×700 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript style — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, rubric #B3402E accent. Flat mineral paint, leather texture suggested by flat color blocks. Centered book cover, 10% margin. NO readable titles, NO letters, NO author names.
Order:
1. book-rubruck.webp — Rubruck: cross-staff, steppe horizon on cover
2. book-polo.webp — Polo: compass + caravan on Venetian leather cover
3. book-battuta.webp — Battuta: crescent arch + desert road (no Arabic script)
4. book-odoric.webp — Odoric: palm + monastery silhouette on friar's cover
Negative: photorealistic, 3D, neon, watermark, text, letters, calligraphy, deities.

---

## Batch 2 · BookB · travel book covers 5–7

- **Window**: BookB
- **Mode**: separate · **Count**: 3 · **Output per file**: 512×700 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `book-zhenghe.webp` — Zheng He voyages: East-Asian naval cover, junk silhouette + wave pattern, no glyphs
  2. `book-tafur.webp` — Pero Tafur: crusader-era cover, castle + pilgrimage road, no text
  3. `book-conti.webp` — Niccolò de' Conti: merchant cover, spice jar + Indian Ocean dhow, no text

**Prompt**

Generate exactly 3 SEPARATE upright medieval travel-book cover illustrations on transparent backgrounds (~512×700 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript style — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, rubric #B3402E accent. Flat mineral paint. NO readable titles, NO letters.
Order:
1. book-zhenghe.webp — Zheng He: junk + waves on lacquer-style cover (no Chinese characters)
2. book-tafur.webp — Tafur: castle + pilgrimage road on leather cover
3. book-conti.webp — Conti: spice jar + dhow on merchant cover
Negative: photorealistic, 3D, neon, watermark, text, letters, glyphs, deities.

---

## Batch 3 · Desk · parchment desk plate

- **Window**: Desk
- **Mode**: separate · **Count**: 1 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `desk-parchment.webp` — 1920×1080 close-up desk surface: spread blank parchment mappa mundi, ink pot edge, candle glow upper-right; lower-left ~1/3 empty for UI; no readable map labels

**Prompt**

Generate exactly ONE opaque 16:9 scene (~1920×1080). Do not write an explanation.
Cloud-ridge Twilight manuscript — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, mist blue #7FA3BD. Flat mineral paint, paper grain, candle/dusk glow. No photorealism, no neon, no readable text.
COMPOSITION: lower-left ~1/3 empty for UI overlay; desk surface fills frame; candle upper-right.
1. desk-parchment.webp — scholar desk close-up: blank portolan parchment spread, ink pot corner, soft candle, no book titles
Negative: photorealistic, 3D, neon, watermark, text, crowded lower-left.

---

## Batch 4 · LoadA · loading screens 1–4

- **Window**: LoadA
- **Mode**: separate · **Count**: 4 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `load-port.webp` — Mediterranean port at dusk: quay mid-right, masts, warm fog; dark overall; lower 1/4 empty
  2. `load-desert.webp` — desert caravan trail: dunes mid-right, camel silhouettes far; dark dusk; lower 1/4 empty
  3. `load-station.webp` — roadside yam/post-station: mud walls mid-right, lantern glow; dark; lower 1/4 empty
  4. `load-monastery.webp` — mountain monastery: stone abbey mid-right, pine silhouettes; dark dusk; lower 1/4 empty

**Prompt**

Generate exactly 4 SEPARATE opaque 16:9 loading-screen backgrounds (~1920×1080 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature, DARK dusk overall — forest ink #0D1411 dominant, parchment #F0E4D0 highlights, antique gold #BDA476 sparingly. Flat mineral washes. No photorealism, no neon, no text.
COMPOSITION LOCK: lower ~1/4 of EVERY image must be empty/low-detail dark space for proverb text overlay; landmarks center-right / upper half only.
Order:
1. load-port.webp — dark Mediterranean port, quay, masts
2. load-desert.webp — dark desert dunes, distant camel silhouettes
3. load-station.webp — dark roadside post-station, lantern
4. load-monastery.webp — dark mountain monastery, pines
Negative: photorealistic, 3D, neon, watermark, text, bright sky, detail in lower quarter.

---

## Batch 5 · LoadB · loading screens 5–8

- **Window**: LoadB
- **Mode**: separate · **Count**: 4 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `load-mosque.webp` — mosque courtyard at dusk: arcade mid-right, pool reflection; dark; lower 1/4 empty; no calligraphy
  2. `load-church.webp` — Romanesque church facade: stone arch mid-right, candle windows; dark dusk; lower 1/4 empty
  3. `load-snowpeak.webp` — snow mountain pass: peaks mid-right, prayer flags; cold dark blue dusk; lower 1/4 empty
  4. `load-steppe.webp` — open steppe grassland: yurt silhouettes mid-right, vast sky; dark dusk; lower 1/4 empty

**Prompt**

Generate exactly 4 SEPARATE opaque 16:9 loading-screen backgrounds (~1920×1080 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature, DARK dusk — forest ink #0D1411, parchment highlights, antique gold sparingly. Flat washes. No text, no neon.
COMPOSITION LOCK: lower ~1/4 empty dark space for text; interest center-right / upper half.
Order:
1. load-mosque.webp — dark mosque courtyard, arcade (no script)
2. load-church.webp — dark Romanesque church facade
3. load-snowpeak.webp — dark snow peaks, prayer flags
4. load-steppe.webp — dark steppe, yurt silhouettes
Negative: photorealistic, 3D, neon, watermark, text, calligraphy, lower-quarter clutter.

---

## Batch 6 · LoadC · loading screens 9–11

- **Window**: LoadC
- **Mode**: separate · **Count**: 3 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `load-canal.webp` — Grand Canal scene: barges mid-right, willow banks; dark dusk; lower 1/4 empty
  2. `load-bazaar.webp` — covered bazaar vault: arches mid-right, spice sacks silhouette; dark; lower 1/4 empty
  3. `load-seaship.webp` — open sea voyage: junk/dhow sails mid-right, dark waves; lower 1/4 empty

**Prompt**

Generate exactly 3 SEPARATE opaque 16:9 loading-screen backgrounds (~1920×1080 each), NOT a contact sheet. Do not write an explanation.
13th-century manuscript miniature, DARK dusk — forest ink #0D1411 dominant. Flat washes. No text.
COMPOSITION LOCK: lower ~1/4 empty for proverb overlay; landmarks center-right / upper half.
Order:
1. load-canal.webp — dark canal with barges and willows
2. load-bazaar.webp — dark bazaar arches, goods silhouettes
3. load-seaship.webp — dark open sea, ship sails
Negative: photorealistic, 3D, neon, watermark, text, lower-quarter detail.

---

## Batch 7 · FateUI · fate wheel + three fate bars

- **Window**: FateUI
- **Mode**: separate · **Count**: 4 · **Output per file**: 512×512 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `fate-wheel.webp` — circular fate wheel disc: 9 segment rings (no numbers), gold+ink, centered ornament
  2. `fate-bar-travel.webp` — horizontal bar END CAP for Travel fortune: camel + road motif, left-facing cap
  3. `fate-bar-rapport.webp` — horizontal bar END CAP for Rapport: handshake + speech scroll motif
  4. `fate-bar-wealth.webp` — horizontal bar END CAP for Wealth: coin stack + spice sack motif

**Prompt**

Generate exactly 4 SEPARATE UI ornaments on transparent backgrounds (~512×512 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript UI — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, rubric #B3402E accent. Flat mineral paint, readable at 48px. NO text, NO numbers, NO letters.
Order:
1. fate-wheel.webp — fate wheel disc with 9 ring segments (no digits)
2. fate-bar-travel.webp — travel fate bar end-cap: camel + road
3. fate-bar-rapport.webp — rapport bar end-cap: hands + scroll
4. fate-bar-wealth.webp — wealth bar end-cap: coins + spice
Negative: photorealistic, 3D, neon, watermark, text, numbers, letters.

---

## Batch 8 · Culture · five culture-circle emblems

- **Window**: Culture
- **Mode**: separate · **Count**: 5 · **Output per file**: 512×512 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `culture-latin.webp` — Latin Christendom: Romanesque arch + cross as small architectural object only
  2. `culture-islamic.webp` — Islamic world: pointed arch + star motif (no calligraphy)
  3. `culture-eastasia.webp` — East Asia: pagoda silhouette + willow branch
  4. `culture-steppe.webp` — Steppe/Mongol: yurt + horse silhouette
  5. `culture-indianocean.webp` — Indian Ocean trade: dhow + spice jar

**Prompt**

Generate exactly 5 SEPARATE culture emblem icons on transparent backgrounds (~512×512 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript icons — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476. Centered single emblem, 10% margin, readable at 64px. NO text, NO letters, NO deity figures.
Order:
1. culture-latin.webp — Romanesque arch + small cross (architecture only)
2. culture-islamic.webp — pointed arch + star (no Arabic script)
3. culture-eastasia.webp — pagoda + willow
4. culture-steppe.webp — yurt + horse
5. culture-indianocean.webp — dhow + spice jar
Negative: photorealistic, 3D, neon, watermark, text, calligraphy, anthropomorphic deities.

---

## Batch 9 · FaithA · faith emblems 1–4

- **Window**: FaithA
- **Mode**: separate · **Count**: 4 · **Output per file**: 512×512 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `faith-latin.webp` — Latin Christianity: chalice + small cross (objects only, no figure)
  2. `faith-orthodox.webp` — Eastern Orthodoxy: double-bar cross + incense censer
  3. `faith-islam.webp` — Islam: prayer rug + crescent moon (no calligraphy, no figure)
  4. `faith-buddhism.webp` — Buddhism: lotus + dharma wheel (no Buddha figure)

**Prompt**

Generate exactly 4 SEPARATE faith emblem icons on transparent backgrounds (~512×512 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript sacred-object icons — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476. Object imagery ONLY — no human figures, no deity statues. Readable at 64px. NO text.
Order:
1. faith-latin.webp — chalice + small cross
2. faith-orthodox.webp — double cross + censer
3. faith-islam.webp — prayer rug + crescent (no script)
4. faith-buddhism.webp — lotus + dharma wheel (no Buddha)
Negative: photorealistic, 3D, neon, watermark, text, human figures, deity statues.

---

## Batch 10 · FaithB · faith emblems 5–8

- **Window**: FaithB
- **Mode**: separate · **Count**: 4 · **Output per file**: 512×512 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `faith-daoism.webp` — Daoism: yin-yang taiji disk + cloud motif (stylized flat)
  2. `faith-nestorian.webp` — Nestorian/East Christian: cross on lotus pedestal (no figure)
  3. `faith-hindu.webp` — Hindu: lamp + lotus (NO deity figure, NO multiple arms)
  4. `faith-folk.webp` — Folk/local faith: mountain spirit shrine stone + offering bowl (no figure)

**Prompt**

Generate exactly 4 SEPARATE faith emblem icons on transparent backgrounds (~512×512 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript sacred-object icons — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476. Object/shrine imagery ONLY — no human or deity figures. NO text.
Order:
1. faith-daoism.webp — taiji disk + cloud
2. faith-nestorian.webp — cross on lotus pedestal
3. faith-hindu.webp — oil lamp + lotus (no deity)
4. faith-folk.webp — spirit stone shrine + bowl
Negative: photorealistic, 3D, neon, watermark, text, human figures, deity statues, multiple arms.

---

### Window -> batches
- **BookA**: Batch 1
- **BookB**: Batch 2
- **Desk**: Batch 3
- **LoadA–LoadC**: Batches 4–6
- **FateUI**: Batch 7
- **Culture**: Batch 8
- **FaithA–FaithB**: Batches 9–10

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P0.md \
  --max-windows 2 --poll-sec 600 --skip-existing
```
