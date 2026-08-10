# FateQuest 2.0 · §F2c Retainer Portraits · 18× 900×1300 + mentor-tarot 重绘 1×

Companion to [`ART_TODO_MAP.md`](./ART_TODO_MAP.md) §F2c.
**18 retainers (Confucian `con` + Mazu `mazu` sets) + 1 mentor-tarot repaint.** Write / review this file first, then upload to ChatGPT. Save to `assets/art/` with exact filenames.

## Why this batch

`retainers.json` carries 58+ hireable retainers across `east_asia` / `indian_ocean` / `latin` / `islamic` / `steppe` cultures. Portraits exist only for the Christendom (`chr`) and Islamic (`isl`) sets; `east_asia` maps to `con`, `indian_ocean` maps to `mazu`, so those retainers currently fall back to the generic `npc-job-*` portrait. This batch supplies the two missing sets.

## Style lock (every batch)

13th-century manuscript illumination figure style. Vellum feel, iron-gall `#4A3A1C` contours, mineral flats, antique gold `#BDA476` accents sparingly. Candlelight / dusk only. NO photorealism, NO 3D, NO neon, NO text, NO watermarks, **NO anthropomorphic deities**.

## Composition lock (CRITICAL — every image)

- **Half-body portrait**, figure **facing right**, **transparent background**.
- Canvas ~**900×1300** (portrait).
- Bottom **~15% is a dialog-safe zone** — feet / lower robe may sit there and be covered; face, shoulders, and held props must stay in the upper **85%** and remain readable when shrunk.
- Single figure, centered slightly left of middle so they read as “standing on the left of the scene,” generous empty margin on transparent field.
- Costume should telegraph role + civilization at a glance.

## Upload order

| Window | Batch | Contents |
|---|---|---|
| F2c | R1 | Retainers con 1–5 (guide / porter / guard / scribe / lang) |
| F2c | R2 | Retainers con 6–9 (heal / sail / monk / seer) |
| F2c | R3 | Retainers mazu 1–5 (guide / porter / guard / scribe / lang) |
| F2c | R4 | Retainers mazu 6–9 (heal / sail / monk / seer) |
| F2 | R5 | mentor-tarot repaint (1) |

Prefer **Mode: separate**.

---

## Batch R1 · F2c · Retainers con A (5)

- **Window**: F2c
- **Mode**: separate · **Count**: 5 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-guide-con.webp` — Confucian road guide: half-body facing right, bamboo rain hat, map tube, cotton travel coat; bottom 15% dialog-safe
  2. `retainer-porter-con.webp` — Confucian pack-porter: half-body facing right, shoulder pole with rope-wrapped baskets; bottom 15% dialog-safe
  3. `retainer-guard-con.webp` — Confucian yamen guard: half-body facing right, short saber, dark official jacket, cloth cap; bottom 15% dialog-safe
  4. `retainer-scribe-con.webp` — Confucian clerk: half-body facing right, brush and scroll, scholar robe; bottom 15% dialog-safe
  5. `retainer-lang-con.webp` — Confucian clerk-translator: half-body facing right, folded official documents, folding fan; bottom 15% dialog-safe

**Prompt**

```
Generate exactly 5 SEPARATE half-body retainer portraits on transparent backgrounds (~900×1300 each), NOT a contact sheet.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flat color, parchment grain, candlelight only. No photorealism, no neon, no text.
COMPOSITION LOCK for EVERY image: half-body facing RIGHT; bottom ~15% may be covered by dialog (keep face/shoulders/props in upper 85%); transparent field; single figure.
Costume: East-Asian (Yuan-era) dress — cotton robes, bamboo hats, cloth caps; mineral ochre and indigo flats.
Order 1→5:
1. retainer-guide-con.webp — road guide with bamboo rain hat and map tube
2. retainer-porter-con.webp — pack-porter with shoulder pole and rope-wrapped baskets
3. retainer-guard-con.webp — yamen guard with short saber and official jacket
4. retainer-scribe-con.webp — clerk with brush and scroll in scholar robe
5. retainer-lang-con.webp — clerk-translator with documents and folding fan
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, European or West-Asian facial features on East-Asian figures.
```

---

## Batch R2 · F2c · Retainers con B (4)

- **Window**: F2c
- **Mode**: separate · **Count**: 4 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-heal-con.webp` — Confucian physician: half-body facing right, medicine chest, bundled moxa herbs; bottom 15% dialog-safe
  2. `retainer-sail-con.webp` — Inland river boatman: half-body facing right, punt pole, straw rain cape; bottom 15% dialog-safe
  3. `retainer-monk-con.webp` — Buddhist monk: half-body facing right, plain robe, prayer beads (object, no deity); bottom 15% dialog-safe
  4. `retainer-seer-con.webp` — Confucian diviner: half-body facing right, turtle-shell and bronze coins (objects); bottom 15% dialog-safe

**Prompt**

```
Generate exactly 4 SEPARATE half-body retainer portraits on transparent backgrounds (~900×1300 each), NOT a contact sheet.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flat color, parchment grain, candlelight only. No photorealism, no neon, no text.
COMPOSITION LOCK for EVERY image: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%; transparent; single figure.
Costume: East-Asian (Yuan-era) dress; divination tools as OBJECTS only — no deity figures.
Order 1→4:
1. retainer-heal-con.webp — physician with medicine chest and moxa bundle
2. retainer-sail-con.webp — inland boatman with punt pole and straw rain cape
3. retainer-monk-con.webp — Buddhist monk with prayer beads
4. retainer-seer-con.webp — diviner with turtle-shell and bronze coins
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, European or West-Asian facial features on East-Asian figures.
```

---

## Batch R3 · F2c · Retainers mazu A (5)

- **Window**: F2c
- **Mode**: separate · **Count**: 5 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-guide-mazu.webp` — Maritime pilot-guide: half-body facing right, compass plate, sea cloak; bottom 15% dialog-safe
  2. `retainer-porter-mazu.webp` — Dockside pack-porter: half-body facing right, heavy sack, coil of rope; bottom 15% dialog-safe
  3. `retainer-guard-mazu.webp` — Ship-fleet guard: half-body facing right, curved sword, head wrap, sea jacket; bottom 15% dialog-safe
  4. `retainer-scribe-mazu.webp` — Harbor accountant: half-body facing right, abacus and ledger; bottom 15% dialog-safe
  5. `retainer-lang-mazu.webp` — Port polyglot broker: half-body facing right, tally tokens, cargo list; bottom 15% dialog-safe

**Prompt**

```
Generate exactly 5 SEPARATE half-body retainer portraits on transparent backgrounds (~900×1300 each), NOT a contact sheet.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flat color, parchment grain, candlelight only. No photorealism, no neon, no text.
COMPOSITION LOCK for EVERY image: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%; transparent; single figure.
Costume: coastal Chinese / Southeast-Asian maritime dress — sea cloaks, head wraps, sun-darkened faces; indigo and teal mineral flats.
Order 1→5:
1. retainer-guide-mazu.webp — pilot-guide with compass plate and sea cloak
2. retainer-porter-mazu.webp — dockside porter with sack and rope coil
3. retainer-guard-mazu.webp — fleet guard with curved sword and head wrap
4. retainer-scribe-mazu.webp — harbor accountant with abacus and ledger
5. retainer-lang-mazu.webp — polyglot broker with tally tokens and cargo list
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, European or West-Asian facial features on East-Asian figures.
```

---

## Batch R4 · F2c · Retainers mazu B (4)

- **Window**: F2c
- **Mode**: separate · **Count**: 4 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `retainer-heal-mazu.webp` — Ship's physician: half-body facing right, medicine satchel, small saw token; bottom 15% dialog-safe
  2. `retainer-sail-mazu.webp` — Sail hand: half-body facing right, winch handle, sea robe; bottom 15% dialog-safe
  3. `retainer-monk-mazu.webp` — Tianfei temple attendant: half-body facing right, incense holder, ritual robe, no deity figure; bottom 15% dialog-safe
  4. `retainer-seer-mazu.webp` — Mazu medium: half-body facing right, moon blocks (jiaobei), incense charm (objects); bottom 15% dialog-safe

**Prompt**

```
Generate exactly 4 SEPARATE half-body retainer portraits on transparent backgrounds (~900×1300 each), NOT a contact sheet.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flat color, parchment grain, candlelight only. No photorealism, no neon, no text.
COMPOSITION LOCK for EVERY image: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/props in upper 85%; transparent; single figure.
Costume: coastal Chinese / Southeast-Asian maritime dress; ritual items as OBJECTS only — no deity figures.
Order 1→4:
1. retainer-heal-mazu.webp — ship's physician with medicine satchel
2. retainer-sail-mazu.webp — sail hand with winch handle and sea robe
3. retainer-monk-mazu.webp — Tianfei attendant with incense holder
4. retainer-seer-mazu.webp — medium with moon blocks and incense charm
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, anthropomorphic deities, European or West-Asian facial features on East-Asian figures.
```

---

## Batch R5 · F2 · mentor-tarot repaint (1)

- **Window**: F2
- **Mode**: separate · **Count**: 1 · **Output per file**: 900×1300 · **Background**: transparent
- **Output dir**: art
- **Files**:
  1. `mentor-tarot.webp` — Frankish widow card-reader of Tabriz: half-body facing right, tarot spread on table, widow's wimple (widow's coif), Latin-featured elderly face, candlelight; bottom 15% dialog-safe

**Prompt**

```
Generate exactly 1 half-body portrait on a transparent background (~900×1300), NOT a contact sheet.
Style: 13th-century manuscript illumination, iron-gall outlines, mineral flat color, parchment grain, candlelight only. No photorealism, no neon, no text.
COMPOSITION LOCK: half-body facing RIGHT; bottom ~15% dialog-safe; face/shoulders/signature props in upper 85%; transparent; single figure.
Character: an elderly Frankish (Latin / European) widow who settled in Tabriz, Persia — Christian widow's wimple covering her hair, dark widow's veil, worn travel cloak, hands dealing a tarot spread of painted cards across a low table beside her.
Order 1→1:
1. mentor-tarot.webp — the Frankish widow laying out a tarot spread on the table
Negative: photorealistic, 3D, neon, watermark, text, full-body, facing left, deities, East Asian facial features on European or West-Asian figures, men, young faces.
```
