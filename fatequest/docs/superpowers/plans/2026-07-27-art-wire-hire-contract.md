# Art Wire + Hire Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire 48 new art assets into Godot and replace one-click hire with a parchment ritual modal (open / divined).

**Architecture:** Extend `MapArt` resolvers; add `HireContract` UI; party panel opens it and owns `hire_effects`. Rebuild `art_wire_index.json` to 650; update ART docs.

**Tech Stack:** Godot 4.7 GDScript · existing `Panels` / `Motion` / `Roster` · WebP under `assets/art/`

## Global Constraints

- Modal never mutates `WorldState`; parent runs `Roster.hire_effects` after `confirmed`.
- Divined mode shows verdict only — no fate/stat block (GDD §11.3).
- No mysterious (`sealed`) recruitment UI this pass.
- All motion goes through `Motion` (honour `reduce_motion`).
- Keep Chinese UI labels consistent with party panel (`雇` / `缔结` / `作罢`); add i18n keys when introducing new player-facing strings that aren't already hardcoded in `main.gd`.

---

## File map

| File | Responsibility |
|---|---|
| `game/map/map_art.gd` | `RETAINER_ART_SHORT`, prefer `retainer-*`, `contract_art`, `seal_wax` |
| `game/ui/hire_contract.gd` | Ritual modal (new) |
| `game/screens/main.gd` | Build/open modal; divined section; seal on roster rows |
| `game/map/art_wire_index.json` | 650 stems |
| `tests/smoke_party.gd` | Press `雇` then `缔结` |
| `assets/art/*` + docs | Add files; update counts |

---

### Task 1: MapArt resolvers

**Files:**
- Modify: `fatequest/game/map/map_art.gd`
- Test: `fatequest/tests/test_map_art_retainer.gd` (new headless script) OR fold asserts into existing runner if no dedicated MapArt test harness — prefer a tiny standalone script run via godot `--script`

**Interfaces:**
- Produces:
  - `MapArt.retainer_portrait(retainer_id: String, culture: String) -> Texture2D` (prefer retainer stems)
  - `MapArt.contract_art(mode: String) -> Texture2D` — `open` / `divined` / `sealed`
  - `MapArt.seal_wax() -> Texture2D`

- [ ] **Step 1: Add constants + helpers**

After `JOB_FROM_ID`, add:

```gdscript
## retainer-* filenames use shorter stems than npc-job-* ids.
const RETAINER_ART_SHORT := {
	"guide": "guide",
	"porter": "porter",
	"guard": "guard",
	"scribe": "scribe",
	"translator": "lang",
	"healer": "heal",
	"sailor": "sail",
	"acolyte": "monk",
	"diviner": "seer",
}
```

Replace `retainer_portrait`:

```gdscript
static func retainer_portrait(retainer_id: String, culture: String) -> Texture2D:
	var id := retainer_id.to_lower()
	var set_name := culture_set(culture)
	for frag in JOB_FROM_ID:
		if id.contains(frag):
			var job := String(JOB_FROM_ID[frag])
			var short := String(RETAINER_ART_SHORT.get(job, job))
			var dedicated := tex("retainer-%s-%s" % [short, set_name])
			if dedicated != null:
				return dedicated
			var t := job_portrait(job, culture)
			if t != null:
				return t
	return venue_portrait("market", culture)
```

Add:

```gdscript
static func contract_art(mode: String) -> Texture2D:
	match mode:
		"divined":
			return tex("contract-divined")
		"sealed":
			return tex("contract-sealed")
		_:
			return tex("contract-open")


static func seal_wax() -> Texture2D:
	return tex("seal-wax")
```

- [ ] **Step 2: Quick load check**

Run from `fatequest/`:

```bash
godot --headless --path . -e 'print(MapArt.contract_art("open")!=null, MapArt.seal_wax()!=null)'
```

If `-e` unavailable, skip to Task 5 smoke / rely on ResourceLoader.exists in a one-off script. Expected: textures non-null once assets are on disk.

- [ ] **Step 3: Commit**

```bash
git add fatequest/game/map/map_art.gd
git commit -m "feat(fatequest): MapArt retainer prefer + contract helpers"
```

---

### Task 2: HireContract modal

**Files:**
- Create: `fatequest/game/ui/hire_contract.gd`
- Consumes: `MapArt.contract_art`, `MapArt.seal_wax`, `MapArt.retainer_portrait`, `Panels`, `Motion`, `I18n`, `UiScale`, `Palette`, `Market`

**Interfaces:**
- Produces class `HireContract` (extends `RefCounted`):
  - `build(parent: Node) -> void`
  - `open(rec: Dictionary, culture: String, mode: String, verdict_key: String = "") -> void`
  - signal `confirmed(rec: Dictionary)`
  - signal `cancelled()`

- [ ] **Step 1: Create `hire_contract.gd`**

```gdscript
class_name HireContract
extends RefCounted

## Parchment hire ritual — open / divined → seal → confirmed.
## Parent owns WorldState mutation after `confirmed`.

signal confirmed(rec: Dictionary)
signal cancelled()

var _layer: Control
var _panel: PanelContainer
var _box: VBoxContainer
var _bg: TextureRect
var _portrait: TextureRect
var _name_l: Label
var _origin_l: Label
var _detail_l: Label
var _verdict_l: Label
var _seal: TextureRect
var _btn_ok: Button
var _btn_cancel: Button
var _rec: Dictionary = {}
var _mode: String = "open"
var _busy := false


func build(parent: Node) -> void:
	var ui := Panels.overlay(parent, Vector2(640, 480))
	_layer = ui["layer"]
	_panel = ui["panel"]
	_box = ui["box"]

	_bg = TextureRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_bg.modulate = Color(1, 1, 1, 0.92)
	_panel.add_child(_bg)
	_panel.move_child(_bg, 0)

	# Clear default empty box children if any; rebuild content.
	for c in _box.get_children():
		c.queue_free()

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	_box.add_child(head)

	_portrait = TextureRect.new()
	_portrait.custom_minimum_size = Vector2(140, 180)
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	head.add_child(_portrait)

	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(col)
	_name_l = Panels.label("", UiScale.title(), Palette.ink())
	col.add_child(_name_l)
	_origin_l = Panels.label("", UiScale.ui() - 2, Palette.ink_soft())
	_origin_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_origin_l)
	_detail_l = Panels.label("", UiScale.ui(), Palette.ink())
	col.add_child(_detail_l)
	_verdict_l = Panels.label("", UiScale.body(), Palette.ink())
	_verdict_l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_verdict_l)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_box.add_child(spacer)

	_seal = TextureRect.new()
	_seal.custom_minimum_size = Vector2(72, 72)
	_seal.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_seal.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_seal.visible = false
	_seal.mouse_filter = Control.MOUSE_FILTER_IGNORE
	# Place seal as overlay on panel (bottom-right).
	_seal.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_seal.offset_left = -100
	_seal.offset_top = -100
	_seal.offset_right = -20
	_seal.offset_bottom = -20
	_panel.add_child(_seal)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	_box.add_child(row)
	_btn_ok = Panels.styled_button("缔结", _on_confirm)
	_btn_cancel = Panels.styled_button("作罢", _on_cancel)
	row.add_child(_btn_ok)
	row.add_child(_btn_cancel)


func open(rec: Dictionary, culture: String, mode: String, verdict_key: String = "") -> void:
	_rec = rec
	_mode = mode
	_busy = false
	_btn_ok.disabled = false
	_btn_cancel.disabled = false
	_seal.visible = false
	_seal.modulate.a = 1.0
	_seal.scale = Vector2.ONE

	var parchment := MapArt.contract_art(mode)
	_bg.texture = parchment
	_bg.visible = parchment != null

	var portrait := MapArt.retainer_portrait(String(rec.get("id", "")), culture)
	_portrait.texture = portrait
	_portrait.visible = portrait != null

	_name_l.text = I18n.t(rec.get("name", String(rec.get("id", ""))))
	_origin_l.text = I18n.t(rec.get("origin", ""))
	var months := int(rec.get("contract", {}).get("months", 12))
	var wage := int(rec.get("wage", {}).get("amount", 0)) / Market.FEN
	_detail_l.text = "月俸 %d 银　合同 %d 月" % [wage, months]
	_detail_l.visible = mode != "divined" or true  # wage always shown; stats never
	if mode == "divined" and verdict_key != "":
		_verdict_l.text = I18n.fmt(verdict_key)
		_verdict_l.visible = true
	else:
		_verdict_l.text = ""
		_verdict_l.visible = false

	_layer.visible = true
	_panel.scale = Vector2.ONE
	Motion.parchment_expand(_panel, 0.40)


func _on_cancel() -> void:
	if _busy:
		return
	_layer.visible = false
	cancelled.emit()


func _on_confirm() -> void:
	if _busy:
		return
	_busy = true
	_btn_ok.disabled = true
	_btn_cancel.disabled = true
	await _play_seal()
	_layer.visible = false
	confirmed.emit(_rec)


func _play_seal() -> void:
	var seal_tex := MapArt.seal_wax()
	var sealed := MapArt.contract_art("sealed")
	if seal_tex != null:
		_seal.texture = seal_tex
		_seal.visible = true
		if Motion.allows(Motion.Kind.SCALE):
			_seal.scale = Vector2(0.01, 0.01)
			_seal.modulate.a = 0.0
			var t := _panel.create_tween()
			t.set_parallel(true)
			t.tween_property(_seal, "scale", Vector2.ONE, Motion.dur(0.35, Motion.Kind.SCALE)) \
				.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
			t.tween_property(_seal, "modulate:a", 1.0, Motion.dur(0.35, Motion.Kind.FADE))
			await t.finished
		else:
			_seal.modulate.a = 0.0
			await Motion.fade(_seal, 1.0, 0.25).finished
	if sealed != null:
		_bg.texture = sealed
		_bg.visible = true
	await _panel.get_tree().create_timer(Motion.dur(0.25, Motion.Kind.FADE)).timeout
```

Note: `_on_confirm` uses `await` — connect via lambda that calls a coroutine-friendly method, or make confirm start an async function:

```gdscript
_btn_ok.pressed.connect(func(): _confirm_async())

func _confirm_async() -> void:
	if _busy:
		return
	_busy = true
	_btn_ok.disabled = true
	_btn_cancel.disabled = true
	await _play_seal()
	_layer.visible = false
	confirmed.emit(_rec)
```

`HireContract` extends `RefCounted` — **cannot await on RefCounted without a SceneTree node**. Fix: store `_panel` and use `_panel.get_tree()` for awaits; connect button to:

```gdscript
func _on_confirm() -> void:
	if _busy:
		return
	_busy = true
	_btn_ok.disabled = true
	_btn_cancel.disabled = true
	_run_confirm()

func _run_confirm() -> void:
	# Called from button; drive async from panel tree.
	var tree := _panel.get_tree()
	await _play_seal()
	_layer.visible = false
	confirmed.emit(_rec)
```

In GDScript, a function that uses `await` called from a signal without awaiting still runs as a coroutine if it has await — **yes, calling an async func from a signal starts it**. So `_btn_ok.pressed.connect(_run_confirm)` works if `_run_confirm` contains await.

- [ ] **Step 2: Commit**

```bash
git add fatequest/game/ui/hire_contract.gd
git commit -m "feat(fatequest): add HireContract parchment ritual UI"
```

---

### Task 3: Wire party panel in main.gd

**Files:**
- Modify: `fatequest/game/screens/main.gd`

**Interfaces:**
- Consumes: `HireContract.build/open`, signals `confirmed` / `cancelled`
- Uses: `_roster.divined_shortlist(state, city, rng)`

- [ ] **Step 1: Add field + build**

Near other UI fields (`_party`, `_dialog`):

```gdscript
var _hire_ui: HireContract
```

In the setup path that calls `_build_party()` (after party built):

```gdscript
_hire_ui = HireContract.new()
_hire_ui.build(self)
_hire_ui.confirmed.connect(_on_hire_confirmed)
_hire_ui.cancelled.connect(func(): pass)
```

```gdscript
func _on_hire_confirmed(rec: Dictionary) -> void:
	var res := executor.execute(state, _roster.hire_effects(rec),
		{"rng": rng, "event_id": "hire"})
	for line in res.log_lines:
		_say("  · %s" % line)
	_refresh_hud()
	_open_party()
```

- [ ] **Step 2: Change `_hire_row` button**

```gdscript
var btn := Panels.styled_button("雇", Callable())
btn.pressed.connect(func():
	var here := db.get_record(state.city)
	var culture := String(here.get("culture", "latin"))
	_hire_ui.open(rec, culture, "open"))
```

- [ ] **Step 3: Add divined section in `_open_party` after open pool**

```gdscript
var short := _roster.divined_shortlist(state, state.city, rng)
if not short.is_empty():
	list.add_child(Panels.label("", UiScale.ui(), Palette.ink()))
	list.add_child(Panels.label("占卜抽选：", UiScale.ui(), Palette.ink()))
	for entry in short:
		list.add_child(_divined_hire_row(entry))
```

```gdscript
func _divined_hire_row(entry: Dictionary) -> Control:
	var rec: Dictionary = entry.get("retainer", {})
	var verdict := String(entry.get("verdict", ""))
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", Palette.panel_style(true))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	panel.add_child(row)
	var here := db.get_record(state.city)
	var culture := String(here.get("culture", "latin"))
	var portrait := MapArt.retainer_portrait(String(rec.get("id", "")), culture)
	if portrait != null:
		var tr := TextureRect.new()
		tr.texture = portrait
		tr.custom_minimum_size = Vector2(48, 60)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		row.add_child(tr)
	var col := VBoxContainer.new()
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(col)
	col.add_child(Panels.label(I18n.t(rec.get("name", "")), UiScale.ui(), Palette.ink()))
	col.add_child(Panels.label(I18n.fmt(verdict), UiScale.ui() - 3, Palette.ink_soft()))
	var btn := Panels.styled_button("雇", Callable())
	btn.pressed.connect(func():
		_hire_ui.open(rec, culture, "divined", verdict))
	row.add_child(btn)
	return panel
```

- [ ] **Step 4: Roster row seal decoration**

In `_party_row`, after portrait (or before dismiss button):

```gdscript
var seal := MapArt.seal_wax()
if seal == null:
	seal = MapArt.contract_art("sealed")
if seal != null:
	var st := TextureRect.new()
	st.texture = seal
	st.custom_minimum_size = Vector2(28, 28)
	st.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	st.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	row.add_child(st)
```

- [ ] **Step 5: Commit**

```bash
git add fatequest/game/screens/main.gd
git commit -m "feat(fatequest): party opens HireContract + divined shortlist"
```

---

### Task 4: Fix smoke_party for ritual confirm

**Files:**
- Modify: `fatequest/tests/smoke_party.gd`

- [ ] **Step 1: After pressing 雇, press 缔结**

Replace the hire block:

```gdscript
    hire_btn.pressed.emit()
    await process_frame
    # Hire now opens the parchment ritual; confirm with 缔结.
    var seal_btn = _find_button_anywhere(n, "缔结")
    _ok(seal_btn != null, "hire ritual shows 缔结")
    if seal_btn == null:
        _done()
        return
    seal_btn.pressed.emit()
    # Seal animation ~0.6s; wait several frames / short timer.
    await n.get_tree().create_timer(1.0).timeout
```

Add helper:

```gdscript
func _find_button_anywhere(root, label: String):
    return _button_in(root, label)
```

- [ ] **Step 2: Run smoke**

```bash
cd fatequest && godot --headless --path . --script tests/smoke_party.gd
```

Expected: `PARTY: OK`

- [ ] **Step 3: Commit**

```bash
git add fatequest/tests/smoke_party.gd
git commit -m "test(fatequest): smoke_party confirms hire ritual"
```

---

### Task 5: Wire index + assets + docs

**Files:**
- Modify: `fatequest/game/map/art_wire_index.json`
- Add: all new `assets/art/{currency,sticker,retainer,contract,seal,site-*}*` (+ `.import` where present)
- Modify: `ART_TODO.md`, `docs/ART_REQUIREMENTS.md`, `docs/ASSETS_REQUIREMENTS.md`, `docs/STATUS.md`, `docs/PLAN.md`

- [ ] **Step 1: Regenerate wire index**

```bash
cd fatequest && python3 - <<'PY'
import json, glob, os
stems = sorted(os.path.basename(p)[:-5] for p in glob.glob("assets/art/*.webp"))
doc = {
  "version": 1,
  "description": "Stems MapArt can resolve at runtime. Present so audit.py counts dynamic wiring.",
  "count": len(stems),
  "stems": stems,
}
json.dump(doc, open("game/map/art_wire_index.json", "w"), indent=2, ensure_ascii=False)
print("count", len(stems))
PY
```

Expected: `count 650`

- [ ] **Step 2: Update docs** — set root art count to 650; mark currency 5 + stickers 9 + retainer 18 + contract 4 + four-city sites 12 as delivered/wired; leave Battuta / I Ching / chr redraw as still missing.

- [ ] **Step 3: Run tests**

```bash
cd fatequest && godot --headless --path . --script tests/run_tests.gd
godot --headless --path . --script tests/smoke_party.gd
```

Expected: all green / `PARTY: OK`

- [ ] **Step 4: Commit**

```bash
git add fatequest/assets/art/ fatequest/game/map/art_wire_index.json \
  fatequest/assets/art/ART_TODO.md fatequest/docs/ART_REQUIREMENTS.md \
  fatequest/docs/ASSETS_REQUIREMENTS.md fatequest/docs/STATUS.md fatequest/docs/PLAN.md
git commit -m "feat(fatequest): land 48 art assets and refresh wire index to 650"
```

---

## Spec coverage check

| Spec § | Task |
|---|---|
| Goal / 48 assets | T5 |
| MapArt retainer + contract | T1 |
| HireContract modal + motion | T2 |
| Party open/divined + sealed decor | T3 |
| smoke_party | T4 |
| art_wire_index 650 + docs | T5 |
| Parent owns hire_effects | T3 |
| reduce_motion stamp | T2 |
| No mysterious hire | — (omitted) |
