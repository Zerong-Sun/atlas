# FateQuest 2.0 · UI & Detail Art · Batch Prompts

Companion to [`ART_BRIEF.md`](./ART_BRIEF.md). Each batch = **one ChatGPT request → one 5×2 contact sheet → 10 files**.

Save outputs to `assets/art/` using filenames below. English prompts only.

## Style lock (all batches)

Cloud-ridge Twilight: medieval manuscript × dusk mountain wilderness. Palette — forest ink `#0D1411`, parchment cream `#F0E4D0`, antique gold `#BDA476`, rubric crimson `#B3402E` (accent only), mist blue `#7FA3BD`, cloud-peach `#E8B28A`. Flat mineral-paint look, thick gold contours where needed, subtle paper grain / gold-leaf flecks, candlelight or dusk glow only. No photorealism, no 3D, no neon, no text labels on the sheet.

---

## Batch 1 · Button skins (horizontal pills)

- **Grid**: 5×2 · **Cell**: 512×128 · **Output per file**: 512×128 · **Background**: opaque
- **Files**:
  1. `ui-btn-primary.webp` — default gold-foil primary button fill, warm gradient top-lit
  2. `ui-btn-primary-pressed.webp` — same shape, darker, pressed-in shadow
  3. `ui-btn-ghost.webp` — dark lacquer ghost button, thin gold border
  4. `ui-btn-ghost-hover.webp` — ghost with brighter gold rim glow
  5. `ui-btn-sm.webp` — smaller pill proportion, compact foil button
  6. `ui-btn-cinnabar.webp` — rubric red accent button for rare confirm actions
  7. `ui-btn-disabled.webp` — desaturated grey-green disabled state
  8. `ui-btn-tab-active.webp` — short wide pill, bright gold active tab indicator strip
  9. `ui-btn-tab-idle.webp` — muted idle tab chip on dark glass
  10. `ui-btn-round.webp` — circular icon button, gold ring on dark fill

**Prompt**

Generate exactly ONE image: a 5 columns × 2 rows contact sheet with thin dark gutters between cells. Each cell is one horizontal pill-shaped game UI button texture (no text, no icons). Cell order left-to-right, top-to-bottom matches the 10 descriptions above. Manuscript gold-foil game UI, flat painted, tileable horizontal edges where sensible. Forest ink shadows beneath pills. Readable at small size. No letters, no numbers, no watermark.

---

## Batch 2 · Background tiles & surfaces

- **Grid**: 5×2 · **Cell**: 512×512 · **Output**: as listed · **Background**: mostly opaque; `ui-bg-modal-scrim` very dark translucent feel
- **Files**:
  1. `ui-bg-panel.webp` — tileable lacquer panel with paper grain (512×512)
  2. `ui-bg-card.webp` — slightly lighter card surface, subtle double-rule hint in corners
  3. `ui-bg-realm-tile.webp` — square realm picker tile background, faint tradition-color wash
  4. `ui-bg-input.webp` — input field inset background, soft inner shadow
  5. `ui-bg-badge.webp` — small pill/badge background, gold outline
  6. `ui-bg-xpbar-track.webp` — horizontal XP bar trough, 512×64 effective in cell
  7. `ui-bg-xpbar-fill.webp` — horizontal XP bar fill strip, glowing gold, 512×64 effective
  8. `ui-bg-divider.webp` — horizontal gold rule divider, 512×32 effective
  9. `ui-bg-tabbar.webp` — wide dock strip 512×128, dark glass + grain
  10. `ui-bg-modal-scrim.webp` — soft dark vignette scrim, center lighter for modal

**Prompt**

Generate exactly ONE 5×2 contact sheet. Each cell is a distinct UI background texture for a dark fantasy divination game. Tileable where noted. Manuscript parchment grain on forest-ink lacquer. Gold hairline accents only. No characters, no text, no logos. Order matches the 10 descriptions above left-to-right, top-to-bottom.

---

## Batch 3 · Ornaments & frame pieces

- **Grid**: 5×2 · **Cell**: 256×256 · **Output**: 256×256 · **Background**: transparent
- **Files**:
  1. `ui-orn-corner-tl.webp` — top-left double-rule manuscript corner
  2. `ui-orn-corner-tr.webp` — top-right corner mirror
  3. `ui-orn-corner-bl.webp` — bottom-left corner
  4. `ui-orn-corner-br.webp` — bottom-right corner
  5. `ui-orn-rule-h.webp` — horizontal gold divider segment
  6. `ui-orn-rule-v.webp` — vertical gold divider segment
  7. `ui-orn-star.webp` — compass star ✦ ornament
  8. `ui-orn-diamond.webp` — lozenge ◆ ornament
  9. `ui-orn-cloud.webp` — cloud-thunder curl segment (yunlei)
  10. `ui-orn-seal.webp` — wax seal / stamp accent, rubric red dot

**Prompt**

Generate exactly ONE 5×2 contact sheet on transparent background. Each cell is one isolated ornamental UI piece for medieval manuscript-style frames. Thick antique gold linework, flat fills, generous padding inside each cell. No text. Order matches the 10 descriptions above. Must read clearly at 32–64px when cropped.

---

## Batch 4 · Navigation & chrome icons

- **Grid**: 5×2 · **Cell**: 512×512 · **Output**: 512×512 · **Background**: transparent
- **Files**:
  1. `ui-tab-home.webp` — compass star home icon (replaces ✦)
  2. `ui-tab-codex.webp` — codex / open book icon (replaces 📖)
  3. `ui-tab-profile.webp` — yin-yang / balance profile icon (replaces ☯)
  4. `ui-icon-back.webp` — back chevron / return arrow, gold
  5. `ui-icon-close.webp` — close X in circle
  6. `ui-icon-info.webp` — info sigil, small i in hexagon
  7. `ui-icon-lock.webp` — locked realm padlock
  8. `ui-icon-settings.webp` — gear / astrolabe hybrid
  9. `ui-icon-coin.webp` — single Chinese cash coin
  10. `ui-icon-lot.webp` — fortune lot / cylinder stick bundle

**Prompt**

Generate exactly ONE 5×2 contact sheet of game UI icons on transparent background. Centered single subject per cell, thick gold outline, flat color silhouettes, Balatro-level readability at 64px. No text labels. Order matches the 10 descriptions above. Cloud-ridge Twilight palette.

---

## Batch 5 · Atmospheric overlays & FX plates

- **Grid**: 5×2 · **Cell**: 512×512 · **Output**: as listed · **Background**: mostly transparent except noted
- **Files**:
  1. `ui-fx-vignette.webp` — soft edge vignette, transparent center (512×512)
  2. `ui-fx-glow-gold.webp` — radial gold candle glow, transparent
  3. `ui-fx-glow-azure.webp` — cool mist-blue glow, transparent
  4. `ui-fx-grain.webp` — tileable paper grain overlay, transparent grey
  5. `ui-fx-fog.webp` — light fog wisp, transparent
  6. `ui-fx-spark.webp` — tiny sparkle / dust motes, transparent
  7. `ui-fx-sweep.webp` — diagonal highlight sweep for button shine, transparent
  8. `ui-fx-frame.webp` — rectangular double-gold frame with empty center, transparent
  9. `ui-fx-title-bg.webp` — title screen backdrop plate, opaque 512×512
  10. `ui-fx-toast-bg.webp` — toast notification pill background, opaque horizontal

**Prompt**

Generate exactly ONE 5×2 contact sheet of UI overlay textures for a dark manuscript fantasy UI. Mostly transparent cells with soft luminous edges; cells 9–10 opaque. No text, no characters. Flat painted light, not neon. Order matches descriptions above.

---

## Batch 6 · Realm icons (missing gameplay set)

- **Grid**: 5×2 · **Cell**: 512×512 · **Output**: 512×512 · **Background**: transparent
- **Files**:
  1. `realm-tarot.webp` — upright tarot card emblem, mauve + gold
  2. `realm-iching.webp` — Chinese cash coin, verdigris + gold
  3. `realm-bazi.webp` — compact compass palace grid, ochre + gold
  4. `realm-western.webp` — zodiac ring ticks, mist-blue + gold
  5. `realm-runes.webp` — rune drawstring pouch, grey-blue + gold
  6. `realm-dream.webp` — pillow with crescent moon, gentle
  7. `realm-astrodice.webp` — three dice cluster
  8. `realm-jiaobei.webp` — pair of moon blocks
  9. `realm-meihua.webp` — plum blossom branch, tiny rubric blossom
  10. `realm-lenormand.webp` — Lenormand card + clover motif, warm sepia + gold

**Prompt**

Generate exactly ONE 5×2 contact sheet of ten divination tradition icons on transparent background. Each cell one object emblem, centered, flat manuscript style, civilization accent colors as listed. No human faces, no readable text. Order left-to-right top-to-bottom matches list.

---

## Batch 7 · Journey items (10)

- **Grid**: 5×2 · **Cell**: 256×256 · **Output**: 256×256 · **Background**: transparent
- **Files**:
  1. `item-compass.webp`
  2. `item-crystal.webp`
  3. `item-beads.webp`
  4. `item-silk.webp`
  5. `item-spice.webp`
  6. `item-glass.webp`
  7. `item-lampoil.webp`
  8. `item-astrolabe.webp`
  9. `item-paiza.webp`
  10. `item-mazucharm.webp` — incense charm with wave + lamp only, no deity figure

**Prompt**

Generate exactly ONE 5×2 contact sheet of ten small trade/ritual object icons on transparent background. Flat, gold outline, readable at 64px. Objects: compass; crystal ball; prayer beads; silk bolt; spice pouch; glass bottle; lamp-oil flask; astrolabe; golden paiza plaque with abstract marks; Mazu charm packet with wave and lamp motifs only. No people.

---

## Batch 8 · Curses, companions, runes (10)

- **Grid**: 5×2 · **Cell**: 512×512 · **Output**: 512×512 · **Background**: transparent
- **Files**:
  1. `curse-shadow.webp` — light-eating purple-black ink blot
  2. `curse-chain.webp` — chains on blank card
  3. `curse-leak.webp` — holed money pouch dripping coins
  4. `curse-dread.webp` — coiled serpent heraldic
  5. `comp-tebrizi.webp` — turbaned astronomer half-body silhouette with astrolabe, no facial detail
  6. `comp-lin.webp` — boatwoman with conical hat and oar, incense charm, no facial detail
  7. `sym-algiz.webp` — Algiz ᛉ on stone with elk antler, grey-blue + gold
  8. `sym-fehu.webp` — Fehu ᚠ on stone with cattle horn
  9. `sym-isa.webp` — Isa ᛁ on stone with icicle
  10. `sym-sowilo.webp` — Sowilo ᛋ on stone with sun-wheel

**Prompt**

Generate exactly ONE 5×2 contact sheet on transparent background. Cells 1–4 purple-black curse icons with gold contours. Cells 5–6 respectful companion silhouettes without detailed faces. Cells 7–10 rune stones with carved runes and small motif. Flat manuscript game icons. Order matches list.

---

## Batch 9 · Remaining runes & journey markers (10)

- **Grid**: 5×2 · **Cell**: 512×512 (markers 128×128 centered in cell) · **Background**: transparent
- **Files**:
  1. `sym-raidho.webp` — Raidho ᚱ + wagon wheel
  2. `sym-perthro.webp` — Perthro ᛈ + dice cup
  3. `sym-uruz.webp` — Uruz ᚢ + aurochs silhouette
  4. `sym-gen.webp` — Gen hexagram still mountain, verdigris + gold
  5. `sym-jin.webp` — Jin sun rising from earth, verdigris + gold
  6. `card-back.webp` — same design language as tower card back: compass star + cloud border (mini icon version)
  7. `marker-camel.webp` — side-view camel facing right, tiny
  8. `marker-ship.webp` — side-view ship facing right
  9. `marker-boat.webp` — side-view small boat facing right
  10. `bg-parchment.webp` — tileable parchment paper texture 512×512 (for future map)

**Prompt**

Generate exactly ONE 5×2 contact sheet. Cells 1–5 rune/hex symbols on transparent background. Cell 6 small ornate card-back emblem. Cells 7–9 tiny party markers facing right, bold silhouettes. Cell 10 tileable parchment texture, opaque warm cream with foxing. Flat manuscript style. No text labels on sheet.

---

## Batch 10 · Region banners (4 + extras)

- **Grid**: 5×2 · **Cell**: 512×200 · **Output**: 1024×400 upscaled · **Background**: opaque
- **Files**:
  1. `region-chr.webp` — Christian world horizon: bell towers and masts
  2. `region-isl.webp` — Islamic world: minarets and camel silhouettes
  3. `region-con.webp` — East Asian eaves and mountains, ochre accent
  4. `region-mazu.webp` — sea lamps, waves, boats; no goddess figure
  5. `map-parchment.webp` — wide parchment map base with corner flourishes, center blank
  6. `bg-nocturne-alt.webp` — alternate subtle star-nocturne plate (very dark)
  7. `ui-bg-scroll.webp` — vertical scroll paper strip
  8. `ui-bg-ribbon.webp` — diagonal silk ribbon banner
  9. `ui-bg-stamp.webp` — square wax stamp texture
  10. `ui-bg-bookmark.webp` — bookmark ribbon corner

**Prompt**

Generate exactly ONE 5×2 contact sheet of landscape-format UI plates. Cells 1–4 civilization horizon banners, simplified silhouettes, dusk sky, flat manuscript cutouts. Cell 5 map parchment with empty center. Cells 6–10 supplementary UI paper assets. No readable text, no maps with labels. Order matches list.

---

*10 batches × 10 files = 100 assets · use `chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_UI.md`*
