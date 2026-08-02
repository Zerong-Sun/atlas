class_name Panels
extends RefCounted

## Shared UI furniture: buttons, labels, rules, and the overlay shell.
##
## Overlays are built here rather than as scenes so they can be raised from
## anywhere — the city interior covers the whole screen, so a panel that only
## existed on the map screen would be unreachable exactly where the player
## wants it.
##
## Every button in the game is now dressed by `style_button` below. That code
## used to be copied into five files, which is why the states drifted: some
## call sites set three, some set two, and the map's own control bar dropped
## its hover style entirely whenever the font size changed. One function means
## a button cannot end up half-styled.

## Applies the full state set to a button — normal / hover / pressed / focus /
## disabled — plus a pointer cursor and a keyboard-reachable focus ring.
##
## `focusable` defaults to true because the whole game was FOCUS_NONE: Tab did
## nothing, arrow keys did nothing, and the game could not be played without a
## mouse. Only decorative controls (a portrait you click) should opt out.
static func style_button(b: Button, focusable: bool = true) -> Button:
	b.focus_mode = Control.FOCUS_ALL if focusable else Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.add_theme_font_size_override("font_size", UiScale.ui())
	b.add_theme_stylebox_override("normal", Palette.button_style(Palette.State.NORMAL))
	b.add_theme_stylebox_override("hover", Palette.button_style(Palette.State.HOVER))
	b.add_theme_stylebox_override("pressed", Palette.button_style(Palette.State.PRESSED))
	b.add_theme_stylebox_override("focus", Palette.button_style(Palette.State.FOCUS_RING))
	b.add_theme_stylebox_override("disabled", Palette.button_style(Palette.State.NORMAL))
	b.add_theme_color_override("font_color", Palette.ink())
	b.add_theme_color_override("font_hover_color", Palette.ink())
	b.add_theme_color_override("font_pressed_color", Palette.ink())
	b.add_theme_color_override("font_focus_color", Palette.ink())
	b.add_theme_color_override("font_disabled_color", Palette.ink_faint())
	# A control smaller than a fingertip is a control the player misses.
	b.custom_minimum_size.y = maxf(b.custom_minimum_size.y, Metrics.tap_target())
	return b


static func styled_button(text: String, cb: Callable) -> Button:
	var b := Button.new()
	b.text = text
	style_button(b)
	if cb.is_valid():
		b.pressed.connect(cb)
	return b


## The one action a panel exists to offer — buy, hire, depart, stop writing.
## Carries the gold edge at rest so it can be found without reading every
## label on the panel first.
static func primary_button(text: String, cb: Callable) -> Button:
	var b := styled_button(text, cb)
	b.add_theme_stylebox_override("normal", Palette.button_style(Palette.State.HOVER))
	return b


static func label(text: String, size: int, col: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	return l


## A section heading inside a panel. Overlays used to run one flat list of rows
## top to bottom, so "what I am carrying" and "what it is worth here" had the
## same visual weight and the eye had nowhere to rest.
static func heading(text: String) -> Label:
	return label(text, UiScale.ui(), Palette.ink_soft())


## A hairline rule — cheaper than a nested panel for separating groups.
static func rule() -> Control:
	var r := ColorRect.new()
	var c := Palette.edge()
	c.a = 0.45
	r.color = c
	r.custom_minimum_size = Vector2(0, 1)
	r.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return r


## Elastic gap — pushes whatever follows to the far edge of its box.
static func spring(vertical: bool = false) -> Control:
	var s := Control.new()
	if vertical:
		s.size_flags_vertical = Control.SIZE_EXPAND_FILL
	else:
		s.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	s.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return s


## A full-screen dim + centred panel. Returns {layer, box, panel, scroll}.
##
## The scrim used to be drawn twice — an illustrated plate at 55% alpha with a
## flat brown ColorRect painted at 50% on top of it — so the illustration was
## half-covered by mud and every overlay came out darker than the art intended.
## It is now one or the other.
##
## `scrolling` wraps the content box in its own ScrollContainer. It is opt-in,
## not automatic: several callers already nest a scroll of their own around a
## list, and a ScrollContainer inside a ScrollContainer reports zero minimum
## height, which would collapse those lists to nothing. Pass true only for
## panels that are a plain column of rows — the settings panel, whose nine
## buttons run past the bottom of a small window at the HUGE type step.
static func overlay(parent: Node, min_size: Vector2,
		scrolling: bool = false) -> Dictionary:
	var layer := Control.new()
	layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.visible = false
	parent.add_child(layer)

	# One scrim or the other, never both.
	var scrim_tex := MapArt.ui("bg-modal-scrim")
	if scrim_tex != null:
		var tr := TextureRect.new()
		tr.set_anchors_preset(Control.PRESET_FULL_RECT)
		tr.texture = scrim_tex
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_SCALE
		tr.modulate = Color(1, 1, 1, 0.9)
		# PASS, not STOP: the scrim must still swallow clicks aimed at the map
		# behind it, but it also has to hand them up to the layer, which is what
		# implements click-outside-to-close. STOP consumes the event outright
		# and the layer's gui_input never fires.
		tr.mouse_filter = Control.MOUSE_FILTER_PASS
		layer.add_child(tr)
	else:
		var scrim := ColorRect.new()
		scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
		scrim.color = Palette.scrim_color()
		scrim.mouse_filter = Control.MOUSE_FILTER_PASS
		layer.add_child(scrim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(centre)

	var panel := PanelContainer.new()
	# Belt and braces: a Container cannot be shrunk below its content minimum,
	# so the rows themselves must wrap (see _icon_line). Clipping here only
	# guarantees an overgrown panel can never paint past the window edge.
	panel.clip_contents = true
	panel.add_theme_stylebox_override("panel", Palette.panel_style())
	panel.custom_minimum_size = min_size
	# Optional illustrated panel plate behind the content.
	var plate := MapArt.ui("bg-panel")
	if plate != null:
		var bg := TextureRect.new()
		bg.set_anchors_preset(Control.PRESET_FULL_RECT)
		bg.texture = plate
		bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		bg.stretch_mode = TextureRect.STRETCH_SCALE
		bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		bg.modulate = Color(1, 1, 1, 0.35)
		panel.add_child(bg)
	centre.add_child(panel)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", Metrics.md())
	box.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	var scroll: ScrollContainer = null
	if scrolling:
		scroll = ScrollContainer.new()
		scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
		panel.add_child(scroll)
		scroll.add_child(box)
	else:
		panel.add_child(box)

	return {"layer": layer, "box": box, "panel": panel, "scroll": scroll}


## Click-outside-to-close for an overlay built above. Kept out of `overlay()`
## itself so a screen that must not be dismissed by accident — the ending
## confirmation — can decline it.
##
## Before this, an overlay could only be left by finding its own close button,
## and `overlay()` supplied none: anything built on it that forgot to add one
## trapped the player on that panel.
static func make_dismissable(layer: Control, panel: Control, on_close: Callable) -> void:
	layer.gui_input.connect(func(ev: InputEvent) -> void:
		if not _is_outside_click(ev, panel):
			return
		layer.accept_event()
		if on_close.is_valid():
			on_close.call())


## True when `ev` is a left press that landed on the dim rather than on the
## panel. Split out so the lambda above stays a straight line of statements.
static func _is_outside_click(ev: InputEvent, panel: Control) -> bool:
	if not (ev is InputEventMouseButton):
		return false
	var mb := ev as InputEventMouseButton
	if not mb.pressed or mb.button_index != MOUSE_BUTTON_LEFT:
		return false
	if panel == null or not is_instance_valid(panel):
		return true
	return not panel.get_global_rect().has_point(mb.global_position)


## Escape handling across a stack of overlays. Closes the topmost visible one
## only — pressing Escape with the bag open over the city should close the bag,
## not the city too. Returns true if something was closed.
static func close_topmost(layers: Array, closers: Array) -> bool:
	for i in range(layers.size() - 1, -1, -1):
		var l = layers[i]
		if l == null or not is_instance_valid(l) or not (l is Control):
			continue
		if not (l as Control).visible:
			continue
		if i < closers.size():
			var cb: Callable = closers[i]
			if cb.is_valid():
				cb.call()
		return true
	return false


## Re-applies the current palette to every button and panel under `root`.
##
## `_restyle_all` previously walked only the screens that happened to expose a
## `restyle()` method, so the bag, party, ending, settings and hire overlays
## kept their old parchment styling after a switch to high contrast — the
## panels a struggling reader most needs legible were the ones that did not
## change.
##
## Font *sizes* are deliberately left alone here except on buttons: a title set
## at UiScale.title() must not be flattened to UiScale.ui() by a blind sweep.
## Overlay bodies are rebuilt from data each time they open, which is where
## sizes get picked up.
static func restyle_tree(root: Node) -> void:
	if root is Button:
		var b := root as Button
		# A flat button is deliberately not a plate — the city's site portraits
		# are flat buttons wrapping an illustration, and dressing them in
		# parchment would box every figure in the scene.
		if not b.flat:
			style_button(b, b.focus_mode != Control.FOCUS_NONE)
	elif root is PanelContainer:
		(root as PanelContainer).add_theme_stylebox_override(
			"panel", Palette.panel_style())
	elif root is RichTextLabel:
		(root as RichTextLabel).add_theme_color_override(
			"default_color", Palette.ink())
	elif root is ColorRect and (root as ColorRect).custom_minimum_size == Vector2(0, 1):
		var c := Palette.edge()
		c.a = 0.45
		(root as ColorRect).color = c
	for child in root.get_children():
		restyle_tree(child)
