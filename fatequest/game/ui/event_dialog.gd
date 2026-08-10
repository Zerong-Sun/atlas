extends PanelContainer

## The event popup: title, prose, choices, source card.
##
## Replaces a fixed-pixel panel that overflowed its own bounds as soon as the
## text ran long or the font grew. Everything here is container-driven and
## scrolls, so no amount of prose or font size can push content off screen —
## that was the actual defect, not the size of any one number.

signal choice_taken(index: int)
signal dismissed()

## Kept for anything still reading it. The live measure now comes from
## Metrics.measure(), which grows the column with the type rather than pinning
## large print to the same 760 px as small.
const MAX_W := 760.0

var _title: Label
var _origin: Label
var _context: Label
var _body: RichTextLabel
var _scroll: ScrollContainer
var _choices: VBoxContainer
var _portrait: TextureRect
var _root: VBoxContainer


func _ready() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	custom_minimum_size = Vector2(560, 260)

	_root = VBoxContainer.new()
	_root.add_theme_constant_override("separation", Metrics.md())
	add_child(_root)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", Metrics.md() + Metrics.xs())
	_root.add_child(head)

	_portrait = TextureRect.new()
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT
	_portrait.custom_minimum_size = Vector2(120, 150)
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

	_context = Label.new()
	_context.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_context.visible = false
	head_col.add_child(_context)

	# A hairline between the heading and the prose. Title, provenance note and
	# first paragraph used to run together as one block of text with only a
	# size difference to separate them.
	_root.add_child(Panels.rule())

	# The body scrolls. Long chapters must never push the choices off screen.
	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_root.add_child(_scroll)

	_body = RichTextLabel.new()
	_body.bbcode_enabled = true
	_body.fit_content = true
	_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_scroll.add_child(_body)

	# And another above the choices, so the moment of deciding is visibly
	# separate from the moment of reading.
	_root.add_child(Panels.rule())

	_choices = VBoxContainer.new()
	_choices.add_theme_constant_override("separation", Metrics.sm())
	_root.add_child(_choices)

	restyle()


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	_origin.add_theme_font_size_override("font_size", maxi(UiScale.ui() - 2, 10))
	# A provenance note is a footnote, not a subtitle — it should read as an
	# aside under the title rather than competing with it.
	_origin.add_theme_color_override("font_color", Palette.ink_faint())
	_context.add_theme_font_size_override("font_size", maxi(UiScale.ui() - 2, 10))
	_context.add_theme_color_override("font_color", Palette.accent())
	_body.add_theme_font_size_override("normal_font_size", UiScale.body())
	_body.add_theme_color_override("default_color", Palette.ink())
	# Leading. Set solid, long medieval prose in a narrow column is a wall;
	# roughly a third of the type size between lines is what makes it a page.
	_body.add_theme_constant_override("line_separation",
		int(round(float(UiScale.body()) * 0.34)))
	_body.add_theme_constant_override("paragraph_separation", Metrics.sm())

	# Portrait scales with the type, or a 120 px figure beside 26 pt text reads
	# as a stamp rather than a person. Capped to a third of the window height so
	# a 200%-step portrait cannot push the panel past the viewport by itself.
	var vp := get_viewport_rect().size
	var pw := minf(120.0 * Metrics.factor(), vp.y * 0.34)
	_portrait.custom_minimum_size = Vector2(pw, pw * 1.25)

	# The prose window is at least four lines tall whatever the step, so the
	# reader is never handed a two-line slit to scroll a chapter through. The
	# 200%-step ceiling is enforced in _fit_scroll once the choices are in.
	_scroll.custom_minimum_size = Vector2(0, float(UiScale.body()) * 6.0)

	# Width follows the window but never grows past a comfortable measure:
	# prose set across 1400px is unreadable however large the type.
	custom_minimum_size = Vector2(
		Metrics.measure(vp.x),
		minf(vp.y - float(Metrics.xl()) * 4.0, 560.0))


func show_event(ev: Dictionary, choice_states: Array, portrait: Texture2D = null,
		chain_context: String = "") -> void:
	restyle()
	_title.text = I18n.t(ev.get("title", ""))
	_origin.text = _origin_note(ev)
	_context.text = chain_context
	_context.visible = not chain_context.is_empty()

	var body_key := String(ev.get("body", ""))
	var text := I18n.t(body_key)
	if text == body_key:
		text = ""
	_body.text = _auto_paragraphs(text)
	if I18n.is_untranslated(body_key):
		_body.text += "\n[i][color=#6b5a3c]%s[/color][/i]" % I18n.t("ui.i18n.pending")

	_portrait.texture = portrait
	_portrait.visible = portrait != null

	for c in _choices.get_children():
		c.queue_free()
	var any_open := false
	for i in choice_states.size():
		if not choice_states[i].get("visible", true):
			continue
		if choice_states[i]["enabled"]:
			any_open = true
		_choices.add_child(_make_choice(choice_states[i], i))

	# An event whose every choice is barred — no coin, no language, no art —
	# must still be leavable. Without this the player is trapped reading the
	# same page: the same defect the city screen had, one level down.
	var leave := Panels.styled_button(
		I18n.t("ui.walk_away") if not any_open else I18n.t("ui.hold_for_now"),
		func(): dismissed.emit())
	leave.alignment = HORIZONTAL_ALIGNMENT_LEFT
	# Walking away is always available but never the point of the panel, so it
	# stays visibly quieter than the choices it sits under.
	leave.add_theme_color_override("font_color", Palette.ink_faint())
	_choices.add_child(leave)

	_scroll.scroll_vertical = 0
	_fit_scroll()
	visible = true


## A result is a page in the conversation, not a line that disappears into the
## journal. Site choices often resolve immediately, so give their authored
## feedback the same readable surface as the event body and an explicit way
## to continue.
func show_result(result_key: String) -> void:
	restyle()
	_title.text = I18n.t("ui.choice_result_title")
	_origin.text = I18n.t("ui.source_authored")
	_context.text = ""
	_context.visible = false
	_portrait.texture = null
	_portrait.visible = false

	var text := I18n.t(result_key)
	_body.text = _auto_paragraphs(text)
	if I18n.is_untranslated(result_key):
		_body.text += "\n[i][color=#6b5a3c]%s[/color][/i]" % I18n.t("ui.i18n.pending")

	for c in _choices.get_children():
		c.queue_free()
	var continue_btn := Panels.primary_button(I18n.t("ui.continue_pending"), func(): dismissed.emit())
	continue_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	_choices.add_child(continue_btn)

	_scroll.scroll_vertical = 0
	_fit_scroll()
	visible = true


## N3 — stagger choice buttons (ANIMATION_PLAN §2.1 · 40 ms offset).
func animate_choices() -> void:
	var kids: Array = []
	for c in _choices.get_children():
		kids.append(c)
	Motion.stagger_in(kids, 0.04, 0.18)


func _make_choice(s: Dictionary, index: int) -> Button:
	var btn := Panels.styled_button(I18n.t(s["choice"].get("label", "")), Callable())
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART

	if not s["enabled"]:
		btn.disabled = true
		# GDD §7.1: say WHY. A bare grey button teaches the player nothing.
		var why: Array[String] = []
		for r in s["reasons"]:
			why.append(I18n.fmt(String(r)))
		var joined := I18n.list(PackedStringArray(why))
		btn.text += I18n.gap() + I18n.t("ui.why_fmt") % joined
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
			return I18n.t("ui.source_polo") + " %s" % ch if ch != "" else I18n.t("ui.source_record")
		"hybrid":
			return I18n.t("ui.source_hybrid")
		"authored":
			return I18n.t("ui.source_authored")
	return ""


## The prose window has a floor (restyle) but the panel has a ceiling: at the
## 200% type step the fixed head + choices can already reach 500–600 px, and the
## six-line floor would push the whole dialog past the window. Once the choices
## are in, measure what the head and buttons actually need and compress the
## scroll to fit, keeping at least two readable lines.
func _fit_scroll() -> void:
	var vp := get_viewport_rect().size
	var cap := minf(vp.y - float(Metrics.xl()) * 4.0, 560.0)
	var scroll_min := float(_scroll.custom_minimum_size.y)
	var fixed := _root.get_minimum_size().y - scroll_min
	var floor_h := float(UiScale.body()) * 2.0
	var want := clampf(scroll_min, floor_h, maxf(floor_h, cap - fixed))
	if absf(want - scroll_min) > 0.5:
		_scroll.custom_minimum_size = Vector2(0, want)


## A wall of unbroken prose is hard to track however wide the column, and the
## entry chapters in the tables are written as one long paragraph. When a body
## has no blank-line breaks and runs long, split it at sentence ends so each
## paragraph stays within a comfortable reading length.
static func _auto_paragraphs(text: String, max_chars: int = 120) -> String:
	if text.is_empty() or text.contains("\n\n") or text.length() <= max_chars:
		return text
	var out := ""
	var buf := ""
	var ends := "。！？；.!?;"
	for i in text.length():
		var ch := text[i]
		buf += ch
		if ends.contains(ch) and buf.length() >= max_chars:
			out += buf.strip_edges() + "\n\n"
			buf = ""
	out += buf
	return out.strip_edges()
