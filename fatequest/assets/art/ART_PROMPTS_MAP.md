# FateQuest 2.0 · Map & Journey Missing Textures · Batch Prompts

Source: [`ART_TODO_MAP.md`](./ART_TODO_MAP.md).
Same category → one ChatGPT **window**; batches in that window run sequentially.
Different categories → **separate windows** (A / B / C / D / E / F1 / F2 / F / G).

**Style lock:** 13th-century manuscript map (mappa mundi / portolan) — vellum `#E9DBB8`, iron-gall ink `#4A3A1C`, ochre `#8A6234`, rubric `#B3402E`, sea-teal `#3F5F6B`. Visible brush, wash, parchment grain. NO modern flat vector, NO photorealism, NO glow/neon.

**Windows:** A (textures) · B (terrain) · C (cities) · D (beasts) · E (transport) · G (realms).  
§F1 scenes + §F2 NPCs (26) use dedicated prompt files — upload these first:

- [`ART_PROMPTS_F1_SCENES.md`](./ART_PROMPTS_F1_SCENES.md) — 16× 1920×1080 (lower-left 1/3 empty)
- [`ART_PROMPTS_F2_NPCS.md`](./ART_PROMPTS_F2_NPCS.md) — 26× 900×1300 (16 gatekeepers + 10 mentors)

Batches 8–12 below are legacy sheet packs; prefer the dedicated files when regenerating.

Output: `assets/art/<filename>` (skip `_pad-blank.webp`).

---

## Batch 1 · A1 · Map vellum base

- **Window**: A
- **Mode**: separate · **Count**: 1 · **Output per file**: 1640×840 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `map-vellum.webp` — Full map vellum base 1640×840: authentic parchment scan feel — fibers, water stains, tiny wormholes, toasted edges; LARGE clean center for city placement; no text

**Prompt**

Generate exactly ONE map/journey image (opaque full-bleed). Do not write an explanation. 13th-century manuscript map style: vellum, iron-gall ink, mineral washes. No modern flat vector, no photorealism, no neon, no readable text.

---

## Batch 2 · A2 · Map tiles (sea + civilization ornaments)

- **Window**: A
- **Mode**: sheet · **Grid**: 5×1 · **Cell**: 256×256 · **Output per file**: 256×256 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-sea.webp` — Tileable medieval sea: fine parallel waves + fish-scale ripples, portolan style
  2. `map-orn-chr.webp` — Tileable Gothic quatrefoil / traceried window lattice, blue-grey ink
  3. `map-orn-isl.webp` — Tileable Islamic girih octagram packing, green ink lines
  4. `map-orn-con.webp` — Tileable auspicious clouds + meander border, ochre ink
  5. `map-orn-mazu.webp` — Tileable fish-scale waves + tangled water-weed, teal ink

**Prompt**

Generate exactly ONE 5×1 contact sheet of 5 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 3 · B · Terrain elevation pieces (side elevation)

- **Window**: B
- **Mode**: sheet · **Grid**: 3×2 · **Cell**: 512×280 · **Output per file**: 512×280 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-mtn-snow.webp` — Snow peaks Pamir 512×280: three staggered peaks, white caps, left-light right-hatch, flat base + soft drop shadow
  2. `map-mtn-rock.webp` — Rocky ridges Alps/Central plains 512×280: brown rock, texture strokes, flat base + shadow
  3. `map-dune.webp` — Triple dunes Kerman desert 512×180: gold sand, wind ripples, flat base
  4. `map-forest.webp` — Conifer cluster Europe 320×220: 5–7 trees, side view, flat base
  5. `map-river.webp` — Canal brush stroke 512×64: ink ribbon tapering at ends, horizontal
  6. `map-reef.webp` — Reef shoals Mazu sea 320×140: rocks and shallow water, flat base

**Prompt**

Generate exactly ONE 3×2 contact sheet of 6 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 4 · C · City & shrine elevations

- **Window**: C
- **Mode**: sheet · **Grid**: 3×2 · **Cell**: 320×260 · **Output per file**: 256×220 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-city-chr.webp` — Christendom fort 256×220: crenellated wall + pointed belfry + arch gate, side elevation, no text
  2. `map-city-isl.webp` — Crescent realm fort 256×220: dome + minaret + pointed arch, side elevation, no text
  3. `map-city-con.webp` — Confucian/Daoist fort 256×220: flying eaves tower + rammed-earth wall, side elevation, no text
  4. `map-city-mazu.webp` — Port fort 256×220: pier + Fuzhou-junk masts + Mazu temple eave, side elevation, no text
  5. `map-court-con.webp` — Palace Shangdu/Dadu 320×260: multi-eave halls + white terrace base, no text
  6. `map-shrine.webp` — Generic shrine niche/small temple 200×180, usable for any civilization, no text

**Prompt**

Generate exactly ONE 3×2 contact sheet of 6 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 5 · D · Map beasts and ornaments

- **Window**: D
- **Mode**: sheet · **Grid**: 4×2 · **Cell**: 420×260 · **Output per file**: 420×260 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `map-beast-serpent.webp` — Sea serpent 420×160: three-fold body in waves, manuscript monster style
  2. `map-beast-whale.webp` — Whale/sea-monster 380×200: spout, scales, round eye, manuscript style
  3. `map-beast-roc.webp` — Roc bird 420×260: wing-spread silhouette, claws gripping something
  4. `map-beast-griffin.webp` — Griffin 320×260: half-eagle half-lion guarding a gold pile
  5. `map-rose.webp` — Compass rose 320×320: 8-point star, rubric north pointer, outer tick ring
  6. `map-wind-head.webp` — Wind head 160×160: cheek-puffed profile blowing
  7. `map-cartouche.webp` — Title cartouche 640×120: blank scroll with curled ends, empty for UI text
  8. `map-border.webp` — Horizontal map border band 512×48: tileable weave/vine motif

**Prompt**

Generate exactly ONE 4×2 contact sheet of 8 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 6 · E1 · Land transport (facing right)

- **Window**: E
- **Mode**: sheet · **Grid**: 5×1 · **Cell**: 256×160 · **Output per file**: 256×160 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `tr-caravan.webp` — Camel caravan 2–3 humps + driver, side view facing right
  2. `tr-mule.webp` — Mule train, side view facing right
  3. `tr-yam.webp` — Yam relay horse with saddle plaque, facing right
  4. `tr-yak.webp` — Yak train in snow, facing right
  5. `tr-foot.webp` — Foot traveler staff + pack 200×160, facing right

**Prompt**

Generate exactly ONE 5×1 contact sheet of 5 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 7 · E2 · Sea & mythical transport (facing right)

- **Window**: E
- **Mode**: sheet · **Grid**: 4×2 · **Cell**: 400×260 · **Output per file**: 360×200 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `tr-galley.webp` — Mediterranean galley 320×180 double oar banks, facing right
  2. `tr-dhow.webp` — Sewn dhow 320×180 lateen sail, facing right
  3. `tr-junk.webp` — Chinese junk 360×200 four masts twelve sails, facing right
  4. `tr-barge.webp` — Canal barge 300×160 flat bottom canopy roof, facing right
  5. `tr-roc.webp` — Roc carrying people/boat in claws 360×260, facing right
  6. `tr-griffin.webp` — Griffin mount with rider 320×240, facing right
  7. `tr-serpent.webp` — Sea serpent towing a boat 400×200, facing right
  8. `_pad-blank.webp` — Blank parchment cell with thin gold frame only — discard after crop

**Prompt**

Generate exactly ONE 4×2 contact sheet of 8 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 8 · F1a · Scene backgrounds set 1 (16:9)

- **Window**: F1
- **Mode**: sheet · **Grid**: 4×2 · **Cell**: 480×270 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-venice-quay.webp` — Venice quay: lagoon, gondolas, San Marco campanile silhouette, morning mist; keep lower-left 1/3 empty for UI
  2. `scene-acre-wall.webp` — Acre night walls: crusader battlements, torches, distant Mediterranean, stars; empty lower-left 1/3
  3. `scene-tabriz-bazaar.webp` — Tabriz bazaar/observatory: arched bazaar, carpets, rooftop astrolabe; empty lower-left 1/3
  4. `scene-hormuz-port.webp` — Hormuz port: hot wind, dhows, date palms, dock astrologer stall; empty lower-left 1/3
  5. `scene-kerman-dunes.webp` — Kerman dunes: sand sea, camel silhouettes, sunset, half-buried posthouse; empty lower-left 1/3
  6. `scene-herat-road.webp` — Herat road: caravanserai, poplar rows, snow mountains afar; empty lower-left 1/3
  7. `scene-pamir-pass.webp` — Pamir pass: snowline, prayer flags, yaks, pale-blue campfire; empty lower-left 1/3
  8. `scene-shangdu-palace.webp` — Shangdu marble palace: grassland, white palace, golden tents; empty lower-left 1/3

**Prompt**

Generate exactly ONE 4×2 contact sheet of 8 map/journey assets (opaque parchment/scene background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 9 · F1b · Scene backgrounds set 2 (16:9)

- **Window**: F1
- **Mode**: sheet · **Grid**: 4×2 · **Cell**: 480×270 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-khanbaliq-hall.webp` — Khanbaliq night banquet hall: giant pillars, candle sea, screens; empty lower-left 1/3
  2. `scene-hangzhou-lake.webp` — Hangzhou West Lake: stone bridge, painted boat, lanterns, distant hills; empty lower-left 1/3
  3. `scene-quanzhou-harbor.webp` — Quanzhou Zayton harbor: forest of masts, Tianfei temple eaves, incense; empty lower-left 1/3
  4. `scene-voyage-sea.webp` — Homeward sea: four-masted deck, storm-building clouds; empty lower-left 1/3
  5. `scene-region-chr.webp` — Christendom travel: European hills, abbey far silhouette; empty lower-left 1/3
  6. `scene-region-isl.webp` — Crescent travel: trade road, camels, minaret far; empty lower-left 1/3
  7. `scene-region-con.webp` — Confucian/Daoist travel: mountain path, post pavilion, flying eaves far; empty lower-left 1/3
  8. `scene-region-mazu.webp` — Mazu sea travel: waves, sails, seabirds; empty lower-left 1/3

**Prompt**

Generate exactly ONE 4×2 contact sheet of 8 map/journey assets (opaque parchment/scene background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 10 · F2a · NPC half-body portraits set 1

- **Window**: F2
- **Mode**: sheet · **Grid**: 4×2 · **Cell**: 450×650 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-market-chr.webp` — Venetian cloth merchant Giovanni, half-body facing right
  2. `npc-market-isl.webp` — Spice seller Yusuf, half-body facing right
  3. `npc-market-con.webp` — Silk shopkeeper Zhou, half-body facing right
  4. `npc-market-mazu.webp` — Ship cargo broker A-Hai, half-body facing right
  5. `npc-temple-chr.webp` — Christian deacon monk, half-body facing right
  6. `npc-temple-isl.webp` — Mosque keeper Abdul, half-body facing right
  7. `npc-temple-con.webp` — Daoist temple receptionist, half-body facing right
  8. `npc-temple-mazu.webp` — Tianfei temple attendant, half-body facing right

**Prompt**

Generate exactly ONE 4×2 contact sheet of 8 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 11 · F2b · NPC half-body portraits set 2

- **Window**: F2
- **Mode**: sheet · **Grid**: 4×2 · **Cell**: 450×650 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `npc-tea-chr.webp` — Tavern landlady, half-body facing right
  2. `npc-tea-isl.webp` — Caravanserai tea master, half-body facing right
  3. `npc-tea-con.webp` — Roadside storyteller, half-body facing right
  4. `npc-tea-mazu.webp` — Dock tea-shed granny, half-body facing right
  5. `npc-inn-chr.webp` — Innkeeper Christendom, half-body facing right
  6. `npc-inn-isl.webp` — Caravanserai host, half-body facing right
  7. `npc-inn-con.webp` — Waystation steward, half-body facing right
  8. `npc-inn-mazu.webp` — Boat inn landlord, half-body facing right

**Prompt**

Generate exactly ONE 4×2 contact sheet of 8 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 12 · F · Mentor half-body portraits

- **Window**: F
- **Mode**: sheet · **Grid**: 5×2 · **Cell**: 450×650 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `mentor-tarot.webp` — Frankish widow card-reader of Tabriz, half-body facing right
  2. `mentor-lenormand.webp` — Card-shop daughter Caterina, half-body facing right
  3. `mentor-runes.webp` — Varangian guard Harald, half-body facing right
  4. `mentor-astrodice.webp` — Astronomer Tebrizi, half-body facing right
  5. `mentor-western.webp` — Dock astrologer Nadira, half-body facing right
  6. `mentor-meihua.webp` — Westbound monk Mingyuan, half-body facing right
  7. `mentor-iching.webp` — Historiographer Master Yelu, half-body facing right
  8. `mentor-dream.webp` — Dream-interpreter Saliman, half-body facing right
  9. `mentor-bazi.webp` — Fate-hall Master Shen Wu, half-body facing right
  10. `mentor-jiaobei.webp` — Tianfei temple Matron Chen, half-body facing right

**Prompt**

Generate exactly ONE 5×2 contact sheet of 10 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

## Batch 13 · G · Realm icons (512)

- **Window**: G
- **Mode**: sheet · **Grid**: 5×2 · **Cell**: 512×512 · **Output per file**: 512×512 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `realm-tarot.webp` — Tarot tradition emblem: upright card object, mauve+gold
  2. `realm-iching.webp` — I Ching emblem: cash coins, verdigris+gold
  3. `realm-bazi.webp` — Bazi emblem: compact compass palace grid, ochre+gold
  4. `realm-western.webp` — Western astrology emblem: zodiac tick ring, mist-blue+gold
  5. `realm-runes.webp` — Runes emblem: rune pouch, grey-blue+gold
  6. `realm-dream.webp` — Dream emblem: pillow with crescent
  7. `realm-astrodice.webp` — Astrodice emblem: three dice cluster
  8. `realm-jiaobei.webp` — Jiaobei emblem: pair of moon blocks
  9. `realm-meihua.webp` — Meihua emblem: plum blossom branch
  10. `realm-lenormand.webp` — Lenormand emblem: small card + clover, sepia+gold

**Prompt**

Generate exactly ONE 5×2 contact sheet of 10 map/journey assets (transparent background). Thin dark gutters between cells. Identical 13th-century mappa mundi / portolan hand-drawn style across all cells — vellum, iron-gall ink, mineral washes. No text labels, filenames, or watermarks on the sheet. Cell order left-to-right, top-to-bottom matches the numbered list.

---

### Window → batches
- **A**: Batch 1, Batch 2
- **B**: Batch 3
- **C**: Batch 4
- **D**: Batch 5
- **E**: Batch 6, Batch 7
- **F1**: Batch 8, Batch 9
- **F2**: Batch 10, Batch 11
- **F**: Batch 12
- **G**: Batch 13

Run (one window per category, sequential batches inside):

```bash
cd fatequest2/scripts
.venv/bin/python gen_map_prompts.py
.venv/bin/python submit_map_windows.py --skip-existing --poll-sec 180
```
