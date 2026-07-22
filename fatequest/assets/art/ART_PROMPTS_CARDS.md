# FateQuest 2.0 · Tarot & I Ching Full Card Faces · Batch Prompts

One request → one **5×2 contact sheet** → ten **512×768** opaque card faces (`sym-*-full.webp`).
English prompts only. Style: **Cloud-ridge Twilight** (see ART_BRIEF).

**Style lock (every batch):** Identical manuscript card frame on all ten cells — same cloud-thunder gold border width, same blank nameplate band at bottom, same parchment cream field `#F0E4D0`, same forest-ink outer edge `#0D1411`. Only the center illustration changes per cell. Mauve `#9A6B84` accent for Tarot; verdigris `#55806D` + gold for I Ching.

---

## Batch 1 · Tarot full faces (Major Arcana set in game)

- **Grid**: 5×2 · **Cell**: 200×300 · **Output per file**: 512×768 · **Background**: opaque
- **Files**:
  1. `sym-fool-full.webp` — The Fool: bundle on staff, cliff-edge step, small dog silhouette
  2. `sym-sun-full.webp` — The Sun: radiant gold sun-wheel, compass-face center, no realistic face
  3. `sym-moon-full.webp` — The Moon: eclipse crescent, one wave line, one dew drop
  4. `sym-star-full.webp` — The Star: eight-pointed star pouring two streams into a pool
  5. `sym-strength-full.webp` — Strength: lion head, gentle hand on muzzle, infinity mark above
  6. `sym-wheel-full.webp` — Wheel of Fortune: wheel with TARO/ROTA letter ring, sword pointer
  7. `sym-tarot-tower-full.webp` — The Tower: spire struck by lightning, crown falling
  8. `sym-death-full.webp` — Death/Rebirth: white butterfly from open cocoon or bone-door, no gore
  9. `sym-hermit-full.webp` — The Hermit: lantern whose wick is a six-pointed star, no face
  10. `sym-tarot-frame-master.webp` — blank template card: identical border and nameplate, empty center compass watermark only (style master)

**Prompt**

Generate exactly ONE 5×2 contact sheet of ten vertical tarot card faces (2:3 ratio in each cell). CRITICAL: all ten cells must share the **same** ornate manuscript border, same blank nameplate strip at bottom, same parchment field — only the center artwork changes. Tarot mauve `#9A6B84` micro-accents allowed; antique gold `#BDA476` linework; flat mineral paint, thick contours, readable at small size. No readable card titles, no Roman numerals, no watermarks. Cell order left-to-right, top-to-bottom matches the ten descriptions above. Cloud-ridge Twilight dusk illumination, subtle paper grain, candlelit gold — never neon.

---

## Batch 2 · I Ching full hexagram faces (all eight in game)

- **Grid**: 5×2 · **Cell**: 200×300 · **Output per file**: 512×768 · **Background**: opaque
- **Files**:
  1. `sym-qian-full.webp` — Qian (Creative): six solid yang lines forming a celestial gate / sky portal
  2. `sym-kun-full.webp` — Kun (Receptive): broad earth vessel holding a simple offering form
  3. `sym-kan-full.webp` — Kan (Abyss): deep double-abyss whirlpool as flat spiral
  4. `sym-li-full.webp` — Li (Radiance): twin flames as abstract bright clarity, not a realistic eye
  5. `sym-qian15-full.webp` — Qian/Humility (hexagram 15): mountain silhouette nested low inside earth
  6. `sym-ge-full.webp` — Ge (Revolution): animal silhouette shedding a skin outline, transformation not gore
  7. `sym-jin-full.webp` — Jin (Progress): sun half-disk rising above earth line
  8. `sym-gen-full.webp` — Gen (Stillness): single monumental still mountain
  9. `sym-jin.webp` — Jin icon version: same rising-sun motif, centered emblem for 512×512 use inside card proportions
  10. `sym-gen.webp` — Gen icon version: same still mountain emblem, centered emblem 512×512 for icon use

**Prompt**

Generate exactly ONE 5×2 contact sheet of ten vertical I Ching divination card faces (2:3 in each cell). CRITICAL: cells 1–8 share the **same** I Ching manuscript card frame — verdigris teal `#55806D` and antique gold `#BDA476`, cloud-thunder border, blank nameplate at bottom, parchment cream field. Only center hexagram emblem changes. Cells 9–10 are simpler centered emblems (Jin and Gen) on the same parchment field with matching gold border but no extra scene clutter. Flat painted, geometric hexagram shapes clear, no Chinese characters, no text labels. Unified style across all ten cells. Cloud-ridge Twilight, dusk glow, paper grain, no neon.

---

*2 batches × 10 = 20 files (17 unique gameplay cards + 1 tarot master frame + 2 iching icon fills)*

Run:

```bash
.venv/bin/python chatgpt_gen_art.py --batch --prompts-file ART_PROMPTS_CARDS.md --skip-existing
```
