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
	b.add_theme_stylebox_override("normal", Palette.button_style(
		Palette.State.HOVER if b.get_meta("primary_action", false) else Palette.State.NORMAL))
	b.add_theme_stylebox_override("hover", Palette.button_style(Palette.State.HOVER))
	b.add_theme_stylebox_override("pressed", Palette.button_style(Palette.State.PRESSED))
	var focus_ring := Palette.button_style(Palette.State.FOCUS_RING)
	focus_ring.draw_center = false
	b.add_theme_stylebox_override("focus", focus_ring)
	b.add_theme_stylebox_override("disabled", Palette.button_style(Palette.State.NORMAL))
	b.add_theme_color_override("font_color", Palette.ink())
	b.add_theme_color_override("font_hover_color", Palette.ink())
	b.add_theme_color_override("font_pressed_color", Palette.ink())
	b.add_theme_color_override("font_hover_pressed_color", Palette.ink())
	b.add_theme_color_override("font_focus_color", Palette.ink())
	b.add_theme_color_override("font_disabled_color", Palette.ink_faint())
	# A control smaller than a fingertip is a control the player misses.
	b.custom_minimum_size.y = maxf(b.custom_minimum_size.y, Metrics.tap_target())
	if b.has_node("NewCityBadge"):
		_fit_button_badge(b)
	Motion.button_feedback(b)
	return b


## Currency stays exact at the point of choice: 350 fen is 3.5 silver, not 3.
static func money(fen: int) -> String:
	var amount := absi(fen)
	var whole := amount / Market.FEN
	var cents := amount % Market.FEN
	var sign_prefix := "-" if fen < 0 else ""
	if cents == 0:
		return "%s%d" % [sign_prefix, whole]
	return ("%s%d.%02d" % [sign_prefix, whole, cents]).trim_suffix("0")


static func explain_reason(reason: String) -> String:
	if reason.begins_with("travel.cannot_afford:"):
		return I18n.t("ui.route.need_fare") % money(int(reason.get_slice(":", 1)))
	return I18n.fmt(reason)


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
	b.set_meta("primary_action", true)
	b.add_theme_stylebox_override("normal", Palette.button_style(Palette.State.HOVER))
	return b


static func label(text: String, size: int, col: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	l.set_meta("font_role", "title" if size == UiScale.title() else "body" if size == UiScale.body() else "ui")
	return l


static func translated_label(key: String, font_size: int, color: Color) -> Label:
	var result := label(I18n.t(key), font_size, color)
	result.set_meta("i18n_key", key)
	return result


static func translated_button(key: String, callback: Callable) -> Button:
	var result := styled_button(I18n.t(key), callback)
	result.set_meta("i18n_key", key)
	return result


## Reading furniture is passive: ornaments never consume pointer events.
static func card_style(kind: String = "story") -> StyleBox:
	if UiScale.high_contrast:
		return Palette.panel_style()
	var paper := StyleBoxTexture.new()
	paper.texture = load("res://assets/art/map-vellum-tile.webp")
	paper.modulate_color = Color("f3f4ee") if kind == "atlas" else Color.WHITE
	paper.content_margin_left = Metrics.lg()
	paper.content_margin_right = Metrics.lg()
	paper.content_margin_top = Metrics.md()
	paper.content_margin_bottom = Metrics.md()
	return paper


static func reading_style() -> StyleBox:
	var s := card_style("story")
	s.content_margin_left = Metrics.xl()
	s.content_margin_right = Metrics.xl()
	s.content_margin_top = Metrics.lg()
	s.content_margin_bottom = Metrics.lg()
	return s


static func apply_card(panel: Control, kind: String) -> void:
	panel.set_meta("card_kind", kind)
	panel.add_theme_stylebox_override("panel", card_style(kind))
	decorate(panel, kind)


static func decorate(panel: Control, kind: String = "story") -> void:
	panel.set_meta("card_kind", kind)
	if panel.has_node("ReadingOrnament"):
		panel.get_node("ReadingOrnament").kind = kind
		panel.get_node("ReadingOrnament").queue_redraw()
		return
	var ornament := ReadingOrnament.new()
	ornament.kind = kind
	ornament.name = "ReadingOrnament"
	ornament.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(ornament)
	panel.move_child(ornament, 0)


class ReadingOrnament extends Control:
	var kind := "story"
	func _ready() -> void:
		resized.connect(queue_redraw)

	func _draw() -> void:
		var color := Palette.edge()
		color.a = 0.65
		# The paper grain remains quiet below text; motifs sit in the margins.
		if kind == "ledger":
			draw_line(Vector2(-10, -4), Vector2(-10, size.y + 4), Palette.RED, 2, true)
			for y in range(0, int(size.y), 28):
				draw_line(Vector2(-8, y), Vector2(-2, y), color, 1, true)
		elif kind == "book":
			for x in [-14, -10, -6]:
				draw_line(Vector2(x, -6), Vector2(x, size.y + 6), color, 1, true)
		elif kind == "notice":
			for x in range(0, int(size.x), 12):
				draw_line(Vector2(x, -5), Vector2(x + 5, -5), color, 1, true)
		for origin in [Vector2(-12, -8), Vector2(size.x + 12, -8), Vector2(-12, size.y + 8), size + Vector2(12, 8)]:
			var direction := Vector2(1 if origin.x < 0 else -1, 1 if origin.y < 0 else -1)
			draw_line(origin, origin + Vector2(18 * direction.x, 0), color, 1.0, true)
			draw_line(origin, origin + Vector2(0, 18 * direction.y), color, 1.0, true)
			if kind == "atlas":
				draw_arc(origin + direction * 5, 5, 0, TAU, 16, color, 1, true)
			else:
				draw_circle(origin + direction * 4, 1.5, color)


static func badge(text: String) -> PanelContainer:
	var p := PanelContainer.new()
	p.name = "NewCityBadge"
	p.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var style := Palette.panel_style()
	style.bg_color = Palette.HC_PANEL if UiScale.high_contrast else Color("dbe2ca")
	style.border_color = Palette.ink() if UiScale.high_contrast else Palette.GREEN
	style.content_margin_left = 7
	style.content_margin_right = 7
	style.content_margin_top = 2
	style.content_margin_bottom = 2
	p.add_theme_stylebox_override("panel", style)
	var text_label := label(text, maxi(12, UiScale.ui() - 2), Palette.ink())
	text_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(text_label)
	return p


static func tag_button(button: Button, text: String) -> void:
	var tag := badge(text)
	button.add_child(tag)
	button.resized.connect(func(): _fit_button_badge(button))
	_fit_button_badge(button)


static func _fit_button_badge(button: Button) -> void:
	var tag := button.get_node("NewCityBadge") as PanelContainer
	tag.size = tag.get_combined_minimum_size()
	tag.position = Vector2(maxf(0, button.size.x - tag.size.x - 10), maxf(0, (button.size.y - tag.size.y) * 0.5))
	for state in ["normal", "hover", "pressed", "disabled", "focus"]:
		var box := button.get_theme_stylebox(state).duplicate() as StyleBox
		box.content_margin_right = tag.size.x + 22
		button.add_theme_stylebox_override(state, box)
	button.custom_minimum_size.y = maxf(button.custom_minimum_size.y, tag.size.y + 12)


static func select_button(button: Button, selected: bool) -> void:
	button.set_meta("selected_tab", selected)
	style_button(button)
	if selected:
		var s := Palette.button_style(Palette.State.PRESSED)
		s.border_width_left = 4
		s.border_color = Palette.edge()
		button.add_theme_stylebox_override("normal", s)
	button.set_pressed_no_signal(selected)


static var _reading_tip_claimed := false

## One onboarding hint per installation, consumed only by a visible overflowing reader.
## No repeated percentages or "finished reading" announcements.
static func reading_hint(scroll: ScrollContainer) -> Label:
	scroll.follow_focus = true
	var hint := label("", maxi(12, UiScale.ui() - 3), Palette.ink_faint())
	hint.name = "ReadingProgress"
	hint.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hint.hide()
	var update := func():
		if not is_instance_valid(hint) or not scroll.is_inside_tree(): return
		var bar := scroll.get_v_scroll_bar()
		if hint.get_meta("tip_owner", false):
			if bar.value > 0 or not scroll.is_visible_in_tree():
				hint.hide()
				hint.set_meta("tip_owner", false)
			return
		hint.hide()
		if _reading_tip_claimed or not scroll.is_visible_in_tree() or bar.max_value - bar.page < 1: return
		var prefs := ConfigFile.new()
		prefs.load(UiScale.CFG)
		if prefs.get_value("ui", "reading_tip_seen", false):
			_reading_tip_claimed = true
			return
		_reading_tip_claimed = true
		prefs.set_value("ui", "reading_tip_seen", true)
		prefs.save(UiScale.CFG)
		hint.text = I18n.t("ui.reading.once")
		hint.set_meta("tip_owner", true)
		hint.show()
	scroll.get_v_scroll_bar().changed.connect(update)
	scroll.get_v_scroll_bar().value_changed.connect(func(_value): update.call())
	scroll.visibility_changed.connect(update)
	update.call_deferred()
	return hint


static func fit_panel(panel: Control, preferred: Vector2) -> void:
	if not panel.is_inside_tree(): return
	panel.custom_minimum_size = preferred.min(panel.get_viewport_rect().size - Vector2(48, 48))
	panel.size = panel.custom_minimum_size


static func ui_theme() -> Theme:
	var result := Theme.new()
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Heiti SC", "Microsoft YaHei", "Noto Sans CJK SC", "WenQuanYi Micro Hei"])
	result.default_font = font
	if I18n.lang() == "en":
		var latin := SystemFont.new()
		latin.font_names = PackedStringArray(["Helvetica Neue", "Arial", "Noto Sans"])
		latin.fallbacks = [font]
		result.default_font = latin
	result.default_font_size = UiScale.ui()
	var track := StyleBoxFlat.new()
	track.bg_color = Palette.PANEL_DEEP if not UiScale.high_contrast else Color.WHITE
	track.content_margin_left = 6
	track.content_margin_right = 6
	var grabber := track.duplicate() as StyleBoxFlat
	grabber.bg_color = Palette.edge()
	grabber.set_corner_radius_all(4)
	result.set_stylebox("scroll", "VScrollBar", track)
	for state in ["grabber", "grabber_highlight", "grabber_pressed"]:
		result.set_stylebox(state, "VScrollBar", grabber)
	return result


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
## A single scrim and opaque paper keep prose distinct from the scene behind it.
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

	# A quiet scrim preserves contrast without adding another illustrated scene.
	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Palette.scrim_color()
	# Let outside clicks bubble to the layer's dismiss handler.
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
	apply_card(panel, "notice")
	panel.custom_minimum_size = min_size
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
	var i := topmost_index(layers)
	if i < 0:
		return false
	if i < closers.size():
		var cb: Callable = closers[i]
		if cb.is_valid():
			cb.call()
	return true


## Mirrors CanvasLayer, inherited z-index and scene-tree drawing order instead
## of relying on the caller to keep a fixed array in the current visual order.
static func topmost_index(layers: Array) -> int:
	var best := -1
	var best_key: Array = []
	for i in layers.size():
		var item = layers[i]
		if not is_instance_valid(item) or not item is Control:
			continue
		if not item.is_visible_in_tree():
			continue
		var key := _draw_order_key(item)
		if best < 0 or _key_is_above(key, best_key):
			best = i
			best_key = key
	return best


static func _draw_order_key(item: Control) -> Array:
	var canvas_layer := 0
	var effective_z := 0
	var inherit_z := true
	var ancestry: Array = []
	var current: Node = item
	while current != null:
		ancestry.push_front(current.get_index())
		if current is CanvasLayer:
			canvas_layer = current.layer
			break
		if current is CanvasItem and inherit_z:
			effective_z += current.z_index
			inherit_z = current.z_as_relative
		current = current.get_parent()
	return [canvas_layer, effective_z] + ancestry


static func _key_is_above(a: Array, b: Array) -> bool:
	for i in mini(a.size(), b.size()):
		if a[i] != b[i]:
			return a[i] > b[i]
	return a.size() > b.size()


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
		if b.has_meta("i18n_key"):
			b.text = I18n.t(b.get_meta("i18n_key"))
		# A flat button is deliberately not a plate — the city's site portraits
		# are flat buttons wrapping an illustration, and dressing them in
		# parchment would box every figure in the scene.
		if not b.flat:
			style_button(b, b.focus_mode != Control.FOCUS_NONE)
	elif root is TextureRect and root.get_meta("decorative_panel_art", false):
		(root as TextureRect).visible = not UiScale.high_contrast and root.texture != null
	elif root is PanelContainer:
		(root as PanelContainer).add_theme_stylebox_override(
			"panel", card_style(String(root.get_meta("card_kind", "notice"))))
	elif root is RichTextLabel:
		(root as RichTextLabel).add_theme_color_override(
			"default_color", Palette.ink())
		root.add_theme_font_size_override("normal_font_size", UiScale.body())
	elif root is Label:
		if root.has_meta("i18n_key"):
			root.text = I18n.t(root.get_meta("i18n_key"))
		root.add_theme_color_override("font_color", Palette.ink())
		var role: String = root.get_meta("font_role", "ui")
		root.add_theme_font_size_override("font_size", UiScale.title() if role == "title" else UiScale.body() if role == "body" else UiScale.ui())
	elif root is ColorRect and (root as ColorRect).custom_minimum_size == Vector2(0, 1):
		var c := Palette.edge()
		c.a = 0.45
		(root as ColorRect).color = c
	for child in root.get_children():
		restyle_tree(child)
