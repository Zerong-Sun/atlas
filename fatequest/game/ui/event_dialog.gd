extends PanelContainer

## The event popup: title, prose, choices, source card.
##
## Replaces a fixed-pixel panel that overflowed its own bounds as soon as the
## text ran long or the font grew. Everything here is container-driven and
## scrolls, so no amount of prose or font size can push content off screen —
## that was the actual defect, not the size of any one number.

signal choice_taken(index: int)
signal dismissed()

const MAX_W := 760.0

var _title: Label
var _origin: Label
var _body: RichTextLabel
var _scroll: ScrollContainer
var _choices: VBoxContainer
var _portrait: TextureRect
var _root: VBoxContainer


func _ready() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	custom_minimum_size = Vector2(560, 260)

	_root = VBoxContainer.new()
	_root.add_theme_constant_override("separation", 10)
	add_child(_root)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	_root.add_child(head)

	_portrait = TextureRect.new()
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT
	_portrait.custom_minimum_size = Vector2(96, 120)
	_portrait.visible = false
	head.add_child(_portrait)

	var head_col := VBoxContainer.new()
	head_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(head_col)

	_title = Label.new()
	_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	head_col.add_child(_title)

	_origin = Label.new()
	_origin.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	head_col.add_child(_origin)

	# The body scrolls. Long chapters must never push the choices off screen.
	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.custom_minimum_size = Vector2(0, 150)
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_root.add_child(_scroll)

	_body = RichTextLabel.new()
	_body.bbcode_enabled = true
	_body.fit_content = true
	_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_scroll.add_child(_body)

	_choices = VBoxContainer.new()
	_choices.add_theme_constant_override("separation", 6)
	_root.add_child(_choices)

	restyle()


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	_origin.add_theme_font_size_override("font_size", UiScale.ui() - 2)
	_origin.add_theme_color_override("font_color", Palette.ink_soft())
	_body.add_theme_font_size_override("normal_font_size", UiScale.body())
	_body.add_theme_color_override("default_color", Palette.ink())
	# Width follows the window but never grows past a comfortable measure:
	# prose set across 1400px is unreadable however large the type.
	var vp := get_viewport_rect().size
	custom_minimum_size = Vector2(minf(MAX_W, vp.x - 80.0), minf(vp.y - 120.0, 520.0))


func show_event(ev: Dictionary, choice_states: Array, portrait: Texture2D = null) -> void:
	restyle()
	_title.text = I18n.t(ev.get("title", ""))
	_origin.text = _origin_note(ev)

	var body_key := String(ev.get("body", ""))
	var text := I18n.t(body_key)
	if text == body_key:
		text = ""
	_body.text = text
	if I18n.is_untranslated(body_key):
		_body.text += "\n[i][color=#6b5a3c](尚未译出，暂显英文原文)[/color][/i]"

	_portrait.texture = portrait
	_portrait.visible = portrait != null

	for c in _choices.get_children():
		c.queue_free()
	for i in choice_states.size():
		_choices.add_child(_make_choice(choice_states[i], i))

	_scroll.scroll_vertical = 0
	visible = true


func _make_choice(s: Dictionary, index: int) -> Button:
	var btn := Button.new()
	btn.text = I18n.t(s["choice"].get("label", ""))
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	btn.add_theme_font_size_override("font_size", UiScale.ui())
	btn.add_theme_stylebox_override("normal", Palette.button_style())
	btn.add_theme_stylebox_override("hover", Palette.button_style(true))
	btn.add_theme_stylebox_override("pressed", Palette.button_style(true))
	btn.add_theme_color_override("font_color", Palette.ink())
	btn.add_theme_color_override("font_disabled_color", Palette.ink_soft())

	if not s["enabled"]:
		btn.disabled = true
		# GDD §7.1: say WHY. A bare grey button teaches the player nothing.
		var why: Array[String] = []
		for r in s["reasons"]:
			why.append(I18n.fmt(String(r)))
		var joined := "、".join(PackedStringArray(why))
		btn.text += "　（%s）" % joined
		btn.tooltip_text = joined
	else:
		btn.pressed.connect(func(): choice_taken.emit(index))
	return btn


## GDD §19: the player must always be able to tell record from invention.
func _origin_note(ev: Dictionary) -> String:
	var lore: Dictionary = ev.get("lore", {})
	match String(lore.get("origin", "")):
		"source":
			var ref: Dictionary = lore.get("ref", {})
			var ch := String(ref.get("chapterId", ""))
			return "据《马可·波罗游记》%s" % ch if ch != "" else "据史料"
		"hybrid":
			return "据原文演绎"
		"authored":
			return "据原文语体新撰"
	return ""
