# FateQuest · P3 · scene-region-chr redraw

Source: `docs/ART_REQUIREMENTS.md` §1.1 · `ART_TODO.md` P3.
Overwrite `scene-region-chr.webp` (existing file has wrong Islamic content).

**Style:** Cloud-ridge Twilight / 13th-century manuscript miniature × dusk. Warm brown low saturation matching other band plates (`scene-region-con` / `mazu` / `isl`). Vellum #E9DBB8, iron-gall #4A3A1C, ochre #8A6234, antique gold #BDA476, rubric #B3402E rare accent, mist blue #7FA3BD. Flat mineral washes, parchment grain. NO photorealism, NO neon, NO readable text.

**Composition:** Opaque full-bleed 1920×1080. Mid-ground architecture + optional foreground market stalls/silhouettes. Lower-left ~1/3 relatively open for dialog overlay. Landmarks center-right / upper half.

**Windows:** ChrRedraw

---

## Batch 1 · ChrRedraw · Latin Christendom region plate

- **Window**: ChrRedraw
- **Mode**: separate · **Count**: 1 · **Output per file**: 1920×1080 · **Background**: opaque
- **Output dir**: art
- **Files**:
  1. `scene-region-chr.webp` — Latin Christian world plate: Romanesque or early-Gothic stone church side facade (pointed/round arches, NOT onion dome), market square with wooden stalls and cloth awnings plus stone well or fountain, stone caravan inn or city-gate arch; optional distant crenellated walls and a small Latin-cross banner (no modern heraldry); warm brown low-saturation dusk; empty lower-left third. MUST be European Latin West.

**Prompt**

Generate exactly 1 SEPARATE opaque 16:9 scene background (~1920x1080). Do not write an explanation.
Style: Cloud-ridge Twilight medieval manuscript miniature, warm brown low saturation, vellum #E9DBB8, iron-gall #4A3A1C, ochre #8A6234, antique gold #BDA476, parchment grain, dusk candlelight only. Flat mineral washes. No photorealism, no neon, no text.
COMPOSITION LOCK: lower-left ~1/3 open for dialog; stone church, market square, and inn/gate in center-right / upper half.
MUST SHOW: (1) Romanesque or early Gothic stone church facade with spire or pitched roof (NOT onion dome); (2) market square with wooden stalls, cloth awnings, stone well or fountain; (3) stone inn or city-gate arch; optional distant battlements and tiny Latin-cross banner (no identifiable modern coats of arms).
FORBIDDEN: mosque dome, minaret, crescent, camel caravan as main subject, desert dune sea, East Asian pavilion or paifang gate.
1. scene-region-chr.webp — Latin Christendom region plate as specified
Negative: photorealistic, 3D, neon, watermark, readable text, mosque, minaret, camel train main subject, desert dunes main subject, Chinese architecture, anime, deities.

---

### Window -> batches
- **ChrRedraw**: Batch 1

```bash
cd fatequest/scripts/art-gen-kit
# IMPORTANT: file already exists with wrong content — force regenerate
.venv/bin/python orchestrate_req.py --prompts-file ART_PROMPTS_REQ_P3_CHR_REDRAW.md \
  --max-windows 1 --poll-sec 600 --no-skip-existing
```
