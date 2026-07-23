# FateQuest · ART_REQUIREMENTS P3 · Batch Prompts

Source: `docs/ART_REQUIREMENTS.md` §3.4 / §4  
P3 gaps: lot cylinder/sticks (2–3) + nine fate-rank seals (9).

**Style lock:** Cloud-ridge Twilight manuscript UI — forest ink `#0D1411`, parchment `#F0E4D0`, antique gold `#BDA476`, rubric `#B3402E` accent only, mist blue `#7FA3BD`. Flat mineral paint, thick gold contour where needed, readable at small size. NO photorealism, NO neon, NO readable text/letters on the art.

**Windows (max 2):** Lot · Rank

---

## Batch 1 · Lot · temple lot cylinder and sticks

- **Window**: Lot
- **Mode**: separate · **Count**: 3 · **Output per file**: 768×768 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `ritual-lot-tube.webp` — bamboo/wooden temple lot cylinder with many thin sticks inside, gold rim bands, manuscript icon, centered, >=8% padding
  2. `ritual-lot-stick.webp` — single lot stick: slender bamboo slip with blank poem band (NO readable text), gold tip accent
  3. `ritual-lot-draw.webp` — draw moment: one stick rising from the cylinder mouth, others nested, still icon-readable

**Prompt**

Generate exactly 3 SEPARATE transparent-background ritual UI icons (~768x768 each), NOT a contact sheet. Do not write an explanation.
Cloud-ridge Twilight manuscript icons — forest ink #0D1411, parchment #F0E4D0, antique gold #BDA476, rubric #B3402E accent only. Flat mineral fills, thick gold contour, single centered subject, >=8% padding, readable at 64-128px. NO photorealism, NO neon, NO readable text/characters on sticks.
Order 1->3:
1. ritual-lot-tube.webp — standing bamboo lot cylinder filled with sticks, gold bands
2. ritual-lot-stick.webp — one slender lot stick with blank inscription band (no glyphs)
3. ritual-lot-draw.webp — one stick emerging upward from cylinder mouth
Negative: photorealistic, 3D, neon, watermark, readable text, deities, faces.

---

## Batch 2 · Rank · nine fate-grade emblem seals

- **Window**: Rank
- **Mode**: sheet · **Grid**: 3×3 · **Cell**: 256×256 · **Output per file**: 256×256 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `fate-rank-shangshang.webp` — top-top seal: brightest gold + rubric sunburst medallion, abstract (no letters)
  2. `fate-rank-shangzhong.webp` — top-mid seal: gold disc with rising chevron motif
  3. `fate-rank-shangxia.webp` — top-low seal: gold disc with slight downward notch, still auspicious
  4. `fate-rank-zhongshang.webp` — mid-top seal: balanced ochre+gold hexagon badge
  5. `fate-rank-zhongzhong.webp` — mid-mid seal: calm parchment+gold circle, neutral
  6. `fate-rank-zhongxia.webp` — mid-low seal: muted mist-blue+gold, slight instability motif
  7. `fate-rank-xiashang.webp` — low-top seal: darker ink with thin gold hope-thread
  8. `fate-rank-xiazhong.webp` — low-mid seal: storm-grey ink blot with gold rim
  9. `fate-rank-xiaxia.webp` — low-low seal: deepest ink, broken-ring motif, still elegant (not gory)

**Prompt**

Generate exactly ONE 3x3 contact sheet of 9 fate-rank emblem seals on transparent background. Thin dark gutters. Identical Cloud-ridge Twilight manuscript badge style — gold outline, flat mineral fills, round/hex seal shapes, readable at 48px. NO readable text, NO letters, NO characters — communicate grade only by brightness, motif, and color (gold->ochre->mist->ink).
Row1 top-top / top-mid / top-low. Row2 mid-top / mid-mid / mid-low. Row3 low-top / low-mid / low-low.
1. fate-rank-shangshang.webp — brightest gold+rubric sunburst
2. fate-rank-shangzhong.webp — gold rising chevron
3. fate-rank-shangxia.webp — gold with soft down-notch
4. fate-rank-zhongshang.webp — ochre+gold hexagon
5. fate-rank-zhongzhong.webp — neutral parchment+gold circle
6. fate-rank-zhongxia.webp — mist-blue+gold unstable
7. fate-rank-xiashang.webp — dark ink + thin gold thread
8. fate-rank-xiazhong.webp — storm-grey blot + gold rim
9. fate-rank-xiaxia.webp — deepest ink broken-ring (elegant, not bloody)
Negative: photorealistic, 3D, neon, watermark, text, letters, characters, skulls, gore.

---

### Window -> batches
- **Lot**: Batch 1
- **Rank**: Batch 2

```bash
cd fatequest/scripts
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P3.md \
  --max-windows 2 --poll-sec 600 --skip-existing
```
