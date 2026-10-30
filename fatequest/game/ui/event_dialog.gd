extends PanelContainer

signal choice_taken(index: int)
signal dismissed()

var _title: Label
var _origin: Label
var _context: Label
var _body: RichTextLabel
var _scroll: ScrollContainer
var _choices: VBoxContainer
var _choice_scroll: ScrollContainer
var _portrait: TextureRect
var _root: VBoxContainer
var _footer: HBoxContainer
var _leave: Button
var _keyboard_hint: Label
var _generation := 0
var _submitted := false
var _event: Dictionary = {}
var _states: Array = []
var _result_key := ""
var _chain_context := ""


func _ready() -> void:
	clip_contents = true
	_root = VBoxContainer.new()
	_root.add_theme_constant_override("separation", Metrics.md())
	add_child(_root)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", Metrics.lg())
	_root.add_child(head)
	_portrait = TextureRect.new()
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_portrait.visible = false
	head.add_child(_portrait)
	var titles := VBoxContainer.new()
	titles.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(titles)
	_title = Label.new()
	_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	titles.add_child(_title)
	_origin = Label.new()
	_origin.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	titles.add_child(_origin)
	_context = Label.new()
	_context.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	titles.add_child(_context)
	_root.add_child(Panels.rule())
	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_root.add_child(_scroll)
	_body = RichTextLabel.new()
	_body.bbcode_enabled = true
	_body.fit_content = true
	_body.scroll_active = false
	_body.selection_enabled = true
	_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_scroll.add_child(_body)
	_root.add_child(Panels.reading_hint(_scroll))
	_body.resized.connect(func(): _fit_scroll.call_deferred())
	_root.add_child(Panels.rule())
	_choice_scroll = ScrollContainer.new()
	_choice_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_choice_scroll.follow_focus = true
	_root.add_child(_choice_scroll)
	_choices = VBoxContainer.new()
	_choices.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_choices.add_theme_constant_override("separation", Metrics.sm())
	_choice_scroll.add_child(_choices)
	_footer = HBoxContainer.new()
	_footer.add_theme_constant_override("separation", Metrics.md())
	_root.add_child(_footer)
	_keyboard_hint = Panels.label("", maxi(UiScale.ui() - 2, 10), Palette.ink_faint())
	_keyboard_hint.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_keyboard_hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_footer.add_child(_keyboard_hint)
	_leave = Panels.styled_button("", request_dismiss)
	_leave.tooltip_text = I18n.t("ui.event.pause_hint")
	_footer.add_child(_leave)
	get_viewport().size_changed.connect(_fit_scroll)
	restyle()


func restyle() -> void:
	if _root == null:
		return
	add_theme_stylebox_override("panel", Panels.reading_style())
	Panels.decorate(self)
	_title.add_theme_font_size_override("font_size", UiScale.title())
	_title.add_theme_color_override("font_color", Palette.ink())
	for label in [_origin, _context, _keyboard_hint]:
		label.add_theme_font_size_override("font_size", maxi(UiScale.ui() - 2, 10))
		label.add_theme_color_override("font_color", Palette.ink_faint())
	_context.add_theme_color_override("font_color", Palette.accent())
	_body.add_theme_font_size_override("normal_font_size", UiScale.body())
	_body.add_theme_color_override("default_color", Palette.ink())
	_body.add_theme_constant_override("line_separation", int(round(UiScale.body() * 0.25)))
	_body.add_theme_constant_override("paragraph_separation", Metrics.sm())
	_keyboard_hint.text = ""
	_leave.tooltip_text = I18n.t("ui.event.pause_hint")
	if not _event.is_empty() or not _result_key.is_empty():
		_render_page()
	_fit_scroll()


func _clear_choices() -> void:
	for child in _choices.get_children():
		_choices.remove_child(child)
		child.queue_free()


func show_event(ev: Dictionary, choice_states: Array, portrait: Texture2D = null,
		chain_context: String = "") -> void:
	_submitted = false
	_event = ev
	_states = choice_states
	_result_key = ""
	_chain_context = chain_context
	_portrait.texture = portrait
	_portrait.visible = portrait != null
	restyle()
	_scroll.scroll_vertical = 0
	_choice_scroll.scroll_vertical = 0
	visible = true
	call_deferred("_fit_scroll")


func show_result(result_key: String) -> void:
	_submitted = false
	_result_key = result_key
	_event = {}
	_states = []
	_chain_context = ""
	_portrait.texture = null
	_portrait.visible = false
	restyle()
	_scroll.scroll_vertical = 0
	_choice_scroll.scroll_vertical = 0
	visible = true
	animate_choices()
	call_deferred("_fit_scroll")


func _render_page() -> void:
	_generation += 1
	_clear_choices()
	var is_result := not _result_key.is_empty()
	_title.text = I18n.t("ui.choice_result_title") if is_result else I18n.t(_event.get("title", ""))
	_origin.text = I18n.t("ui.source_authored") if is_result else _origin_note(_event)
	_origin.visible = not _origin.text.is_empty()
	_context.text = _chain_context
	_context.visible = not _chain_context.is_empty() and not is_result
	var body_key := _result_key if is_result else String(_event.get("body", ""))
	var text := I18n.t(body_key)
	_body.text = _auto_paragraphs(text if text != body_key else "")
	_footer.visible = not is_result
	if is_result:
		var token := _generation
		var next := Panels.primary_button(I18n.t("ui.continue_pending"),
			func(): _dismiss_page(token))
		_choices.add_child(next)
	else:
		var any_open := false
		for i in _states.size():
			if not _states[i].get("visible", true):
				continue
			any_open = any_open or bool(_states[i]["enabled"])
			_choices.add_child(_make_choice(_states[i], i))
			var cost := _choice_cost_hint(_states[i]["choice"])
			if not cost.is_empty():
				var cost_label := Panels.label(cost, maxi(UiScale.ui() - 2, 11), Palette.ink_soft())
				cost_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
				cost_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
				_choices.add_child(cost_label)
		# Retire the old control as well as its callback. An already queued click
		# must never dismiss the next page synchronously opened by this signal.
		_footer.remove_child(_leave)
		_leave.queue_free()
		var token := _generation
		_leave = Panels.styled_button(
			I18n.t("ui.hold_for_now") if any_open else I18n.t("ui.walk_away"),
			func(): _dismiss_page(token))
		_leave.tooltip_text = I18n.t("ui.event.pause_hint")
		_footer.add_child(_leave)
	if _submitted:
		_disable_actions()


func set_chain_context(text: String) -> void:
	_chain_context = text


func _disable_actions() -> void:
	for child in _choices.get_children():
		if child is BaseButton:
			child.disabled = true
	_leave.disabled = true


func _make_choice(s: Dictionary, index: int) -> Button:
	var btn := Panels.styled_button(I18n.t(s["choice"].get("label", "")), Callable())
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.set_meta("choice_index", index)
	btn.disabled = not s["enabled"]
	if btn.disabled:
		var why: Array[String] = []
		for reason in s["reasons"]:
			why.append(I18n.fmt(String(reason)))
		var joined := I18n.list(PackedStringArray(why))
		btn.text += I18n.gap() + I18n.t("ui.why_fmt") % joined
		btn.tooltip_text = joined
	else:
		var token := _generation
		btn.pressed.connect(func(): _submit_choice(index, token))
	return btn


## Only immediate, unconditional costs are shown. Branch outcomes and gains
## remain discoveries; a player should still know the silver and days they
## commit before pressing a choice.
func _choice_cost_hint(choice: Dictionary) -> String:
	var coins_spent := 0
	var days := 0
	for effect in choice.get("effects", []):
		match String(effect.get("op", "")):
			"coins": coins_spent += maxi(0, -int(effect.get("value", 0)))
			"days": days += maxi(0, int(effect.get("value", 0)))
	var parts: Array[String] = []
	if coins_spent > 0:
		parts.append(I18n.t("ui.choice.cost_coins") % Panels.money(coins_spent))
	if days > 0:
		parts.append(I18n.t("ui.choice.cost_days") % days)
	if parts.is_empty():
		return ""
	return I18n.t("ui.choice.cost_hint") % I18n.list(PackedStringArray(parts))


func _lock_page(token: int) -> bool:
	if token != _generation or _submitted or not is_visible_in_tree():
		return false
	_submitted = true
	_disable_actions()
	return true


func _submit_choice(index: int, token: int) -> void:
	if _lock_page(token):
		choice_taken.emit(index)


func _dismiss_page(token: int) -> void:
	if _lock_page(token):
		dismissed.emit()


func request_dismiss() -> void:
	_dismiss_page(_generation)


func animate_choices() -> void:
	Motion.stagger_in(_choices.get_children(), 0.035, 0.14)


func _fit_scroll() -> void:
	if _root == null:
		return
	var vp := get_viewport_rect().size
	var width := maxf(280.0, minf(Metrics.measure(vp.x), vp.x - 24.0))
	var height := minf(620.0, vp.y - 32.0)
	custom_minimum_size.x = width
	# A portrait introduces a speaker; it must not take half the reading area.
	var portrait_h := minf(96.0 * Metrics.factor(), height * 0.18)
	_portrait.custom_minimum_size = Vector2(portrait_h * 0.8, portrait_h)
	_scroll.custom_minimum_size = Vector2(0,
		minf(maxf(_body.get_content_height() + 12, float(UiScale.body()) * 3.0), height * 0.42))
	var choices_h := _choices.get_combined_minimum_size().y
	_choice_scroll.custom_minimum_size = Vector2(0,
		minf(maxf(choices_h, Metrics.tap_target()), height * 0.28))
	_keyboard_hint.visible = false
	var padding := get_theme_stylebox("panel").get_minimum_size().y
	var fixed := _root.get_combined_minimum_size().y - _scroll.get_combined_minimum_size().y - _choice_scroll.get_combined_minimum_size().y
	var available := maxf(80, height - padding - fixed)
	_choice_scroll.custom_minimum_size.y = minf(maxf(choices_h, Metrics.tap_target()), available * 0.42)
	_scroll.custom_minimum_size.y = minf(maxf(_body.get_content_height() + 12, UiScale.body() * 3.0), available - _choice_scroll.custom_minimum_size.y)
	custom_minimum_size.y = minf(height, maxf(300.0, _root.get_combined_minimum_size().y + padding))
	size = custom_minimum_size


## GDD §19: the player must always be able to tell record from invention.
func _origin_note(ev: Dictionary) -> String:
	var lore: Dictionary = ev.get("lore", {})
	match String(lore.get("origin", "")):
		"source":
			var ref: Dictionary = lore.get("ref", {})
			var ch := String(ref.get("chapterId", ""))
			var book := String(ref.get("book", ""))
			var source_key := "source.book.%s" % book
			var source := I18n.t(source_key) if book in [
				"marco-polo", "ibn-battuta", "ibn-fadlan", "ibn-jubayr",
				"rubruck", "odoric", "conti", "tafur", "yingya-shenglan",
			] else I18n.t("ui.source_record")
			return source + " %s" % ch if ch != "" else source
		"hybrid":
			return I18n.t("ui.source_hybrid")
		"authored":
			return I18n.t("ui.source_authored")
	return ""


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
