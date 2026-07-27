# 美术接入 · 签契雇佣屏 · Design

**Date:** 2026-07-27  
**Status:** Approved for planning  
**Scope:** Wire 48 newly landed art assets + hire-contract ritual UI (approach B / option 2)

---

## 1. Goal

Bring every new root-level WebP under `assets/art/` into the Godot runtime so the player sees them, not emoji / npc-job fallbacks. The hire flow gets a dedicated parchment ritual screen that uses the four contract pieces.

**In scope**

- 5× `currency-*`, 9× `sticker-*`, 12× `site-{cambaluc,cotan,lop,zayton}-*`
- 18× `retainer-*-{chr,isl}`
- 3× `contract-*` + `seal-wax`
- Rebuild `art_wire_index.json` to **650** stems
- Update ART / STATUS / PLAN / ASSETS counts

**Out of scope**

- Mysterious (`sealed`) recruitment gameplay (GDD §11.3 — chapter 2)
- Generating missing art (Battuta six cities, I Ching 31–64, `scene-region-chr` redraw)
- Fixing the generation pipeline checkerboard defect

---

## 2. Architecture

| Piece | Role |
|---|---|
| `game/map/map_art.gd` | Resolvers: retainer prefer `retainer-*`; `contract_art(mode)`; `seal_wax()` |
| `game/ui/hire_contract.gd` | New modal: open / divined parchment, seal animation, emits hire confirm |
| `game/screens/main.gd` | Party panel: open hire → modal; add divined shortlist section; party rows show sealed/seal decoration |
| `game/map/art_wire_index.json` | Regenerated stem list for audit (650) |
| Docs | ART_TODO, ART_REQUIREMENTS, ASSETS_REQUIREMENTS, STATUS, PLAN |

Currency, sticker, and site plates already resolve via existing `MapArt` APIs once files exist; they only need the wire index + doc updates.

```
Party overlay
  ├─ roster rows → contract-sealed / seal-wax decoration
  ├─ open pool → "雇" → HireContract(mode=open)
  └─ divined shortlist → pick → HireContract(mode=divined)
         ↓
HireContract modal
  parchment → seal-wax stamp → contract-sealed → hire_effects → close
```

---

## 3. HireContract UI

**Shell:** `Panels.overlay`, ~640×480, same stacking pattern as bag / party / ending.

**Layout**

| Region | Content |
|---|---|
| Full-bleed bg | `TextureRect`: `contract-open` or `contract-divined` |
| Left | Portrait ~140×180 via `MapArt.retainer_portrait` |
| Right | Name; one origin line; wage + contract months. **Divined: verdict text only — no fate/stat block** (GDD §11.3) |
| Footer | 「缔结」·「作罢」 |

**Motion** (all through `Motion`)

1. Open: `parchment_expand`
2. Confirm: `seal-wax` at lower-right, scale 0→1 + fade (~0.35s) → swap bg to `contract-sealed` → hold ~0.25s → emit `confirmed` → close
3. `reduce_motion`: stamp is fade-only (no scale/move)
4. Lock buttons on confirm to prevent double-hire

**Signals:** `confirmed(retainer_rec)` / `cancelled()`. Parent (`main.gd`) runs `Roster.hire_effects` + refreshes party; the modal never mutates `WorldState`.

---

## 4. Portrait & contract mapping

### 4.1 Retainer stem short names

| Id / fragment (`JOB_FROM_ID`) | `retainer-*` short |
|---|---|
| guide, porter, guard, scribe | same |
| interpreter, translator, lang | `lang` |
| healer, heal | `heal` |
| sailor, sail | `sail` |
| acolyte, monk | `monk` |
| diviner, mentor, seer | `seer` |

**Resolve order:** `retainer-<short>-<culture_set>` → `npc-job-<job>-<set>` → `npc-<job>-<set>` → venue `market`.

Only chr/isl retainer files exist; con/mazu cities keep using existing `npc-job-*-con/mazu`.

### 4.2 Contract modes

| Mode | Parchment | When |
|---|---|---|
| `open` | `contract-open` | Public hire |
| `divined` | `contract-divined` | After `Roster.divined_shortlist` pick |
| (post-seal) | `contract-sealed` | End of confirm anim; roster row badge |
| — | `seal-wax` | Stamp anim + roster decoration |

**Missing art:** modal still usable as plain panel; missing seal skips stamp and jumps to sealed/hire.

---

## 5. Party panel changes

In `_open_party` / hire rows:

1. Keep open candidate list; 「雇」opens `HireContract` instead of immediate `hire_effects`.
2. Add 「占卜抽选」section when `divined_shortlist` non-empty: show up to 3 names + localized verdict; picking one opens `HireContract(mode=divined)`.
3. Roster rows: small `contract-sealed` or `seal-wax` beside portrait when art exists.

No sealed-recruitment pool UI.

---

## 6. Wire index & docs

- Regenerate `art_wire_index.json` from `assets/art/*.webp` stems; `count` = 650.
- Move currency (5) and stickers (9) from「仍缺」to delivered in ART_TODO / ART_REQUIREMENTS / STATUS.
- Note site plates for cambaluc / cotan / lop / zayton as landed.
- Note retainer + contract ritual as wired.

---

## 7. Error handling

| Case | Behavior |
|---|---|
| Missing contract parchment | Modal uses `Palette.panel_style` only |
| Missing seal | Skip stamp tween; swap to sealed if present, else hire immediately |
| Missing retainer portrait | Existing npc-job / venue fallback |
| Hire fails / already hired | Executor log lines; modal closes; party refresh |
| Double-click 缔结 | Buttons disabled after first press |

---

## 8. Testing / acceptance

- [ ] Open hire → ritual screen → 缔结 → retainer on roster + recruit log line
- [ ] Divined section shows ≤3 + verdict; parchment is `contract-divined`
- [ ] chr/isl city shows `retainer-*` when matching job
- [ ] HUD currency icons and ending stickers resolve new files
- [ ] cambaluc / cotan / lop / zayton city explore uses new `site-*`
- [ ] `art_wire_index.count == 650`
- [ ] `tests/smoke_party.gd` (and retainer unit tests) still green
- [ ] With `Motion.reduce_motion`, confirm still completes without scale/move

---

## 9. File touch list

| Path | Change |
|---|---|
| `game/map/map_art.gd` | retainer prefer + contract helpers |
| `game/ui/hire_contract.gd` | **new** |
| `game/screens/main.gd` | party / hire wiring |
| `game/map/art_wire_index.json` | 650 stems |
| `assets/art/*.webp` (+ `.import` as needed) | add the 48 files to VCS |
| `assets/art/ART_TODO.md` + docs ART/STATUS/PLAN/ASSETS | counts & status |
| `tests/smoke_party.gd` | adjust if hire is no longer one-click |
| `content/i18n/{en,zh}.json` | hire-contract UI strings if not hardcoded Chinese-only |

---

## 10. Decision log

| Decision | Choice |
|---|---|
| Scope | B — 48 assets + real contract UI |
| Approach | 2 — ritual modal, not inline decoration only |
| Mysterious hire | Deferred |
| Divined cost (gold / omen charge) | Not added this pass; shortlist + art only |
| Spec location | `fatequest/docs/superpowers/specs/` |
