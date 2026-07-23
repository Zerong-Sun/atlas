class_name Panels
extends RefCounted

## Two overlay panels the game had no way to show at all: what you are carrying,
## and what you can change.
##
## Both are built here rather than as scenes so they can be raised from anywhere
## — the city interior covers the whole screen, so a panel that only existed on
## the map screen would be unreachable exactly where the player wants it.

static func styled_button(text: String, cb: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", UiScale.ui())
	b.add_theme_stylebox_override("normal", Palette.button_style())
	b.add_theme_stylebox_override("hover", Palette.button_style(true))
	b.add_theme_stylebox_override("pressed", Palette.button_style(true))
	b.add_theme_color_override("font_color", Palette.ink())
	b.add_theme_color_override("font_disabled_color", Palette.ink_soft())
	if cb.is_valid():
		b.pressed.connect(cb)
	return b


static func label(text: String, size: int, col: Color) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	return l


## A full-screen dim + centred panel. Returns {layer, box}.
static func overlay(parent: Node, min_size: Vector2) -> Dictionary:
	var layer := Control.new()
	layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.visible = false
	parent.add_child(layer)

	var scrim := ColorRect.new()
	scrim.set_anchors_preset(Control.PRESET_FULL_RECT)
	scrim.color = Color(0.06, 0.05, 0.03, 0.5)
	layer.add_child(scrim)

	var centre := CenterContainer.new()
	centre.set_anchors_preset(Control.PRESET_FULL_RECT)
	centre.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(centre)

	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", Palette.panel_style())
	panel.custom_minimum_size = min_size
	centre.add_child(panel)

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	panel.add_child(box)

	return {"layer": layer, "box": box, "panel": panel}
