extends PanelContainer

## Desk reader for the seven travellers' books (GDD §3).
## List on the left, cover + blurb + passage on the right — same rhythm as the
## codex, so a player who has opened one collection already knows this one.

signal closed()

var db: ContentDb
var state: WorldState
var _list: VBoxContainer
var _detail: VBoxContainer
var _books: Array = []
var _current: String = ""


func setup(p_db: ContentDb) -> void:
	db = p_db
	_books = db.get_table("books")
	_build()


func _build() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	custom_minimum_size = Vector2(880, 540)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 10)
	add_child(root)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 10)
	root.add_child(head)
	head.add_child(Panels.label(I18n.t("ui.books_desk"), UiScale.title(), Palette.ink()))
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(spacer)
	head.add_child(Panels.styled_button(I18n.t("ui.close"), func(): closed.emit()))

	var cols := HBoxContainer.new()
	cols.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cols.add_theme_constant_override("separation", 14)
	root.add_child(cols)

	var left := ScrollContainer.new()
	left.custom_minimum_size = Vector2(260, 0)
	left.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	cols.add_child(left)
	_list = VBoxContainer.new()
	_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_list.add_theme_constant_override("separation", 3)
	left.add_child(_list)

	var right := ScrollContainer.new()
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	cols.add_child(right)
	_detail = VBoxContainer.new()
	_detail.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_detail.add_theme_constant_override("separation", 8)
	right.add_child(_detail)


func open(book_id: String = "", p_state: WorldState = null) -> void:
	state = p_state
	visible = true
	_refresh_list()
	var want := book_id
	if want.is_empty() and not _books.is_empty():
		want = String(_books[0].get("id", ""))
	if not want.is_empty():
		_show(want)


func _refresh_list() -> void:
	for c in _list.get_children():
		c.queue_free()
	for rec in _books:
		var id := String(rec.get("id", ""))
		var title := I18n.t(String(rec.get("title", "")))
		var b := Panels.styled_button(title, Callable())
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.pressed.connect(_show.bind(id))
		_list.add_child(b)


func _resolve_book(book_id: String) -> Dictionary:
	## Accept either the table id (`vol-polo`) or the desk cover id (`polo`).
	for b in _books:
		if String(b.get("id", "")) == book_id:
			return b
		if String(b.get("cover", "")) == book_id:
			return b
	return {}


func _show(book_id: String) -> void:
	_current = book_id
	for c in _detail.get_children():
		c.queue_free()

	var rec: Dictionary = _resolve_book(book_id)
	if rec.is_empty():
		_detail.add_child(Panels.label(I18n.t("ui.book_missing"), UiScale.body(), Palette.ink_soft()))
		return
	_current = String(rec.get("id", book_id))

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	_detail.add_child(head)

	var cover_id := String(rec.get("cover", book_id))
	var cover: Texture2D = null
	if not cover_id.is_empty():
		cover = MapArt.book_cover(cover_id)
	if cover != null:
		var tr := TextureRect.new()
		tr.texture = cover
		tr.custom_minimum_size = Vector2(72, 96)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		head.add_child(tr)

	var titles := VBoxContainer.new()
	titles.add_theme_constant_override("separation", 4)
	head.add_child(titles)
	titles.add_child(Panels.label(I18n.t(String(rec.get("title", ""))),
		UiScale.title(), Palette.ink()))
	titles.add_child(Panels.label(I18n.t(String(rec.get("subtitle", ""))),
		UiScale.ui(), Palette.ink_soft()))
	var years := String(rec.get("years", ""))
	if not years.is_empty():
		titles.add_child(Panels.label(years, UiScale.ui() - 1, Palette.ink_soft()))

	var status := String(rec.get("status", ""))
	var status_key := "ui.book_status_%s" % status
	var status_txt := I18n.t(status_key)
	if status_txt != status_key:
		_detail.add_child(Panels.label(status_txt, UiScale.ui(), Palette.ink_soft()))

	_add_section(I18n.t("ui.book_about"), String(rec.get("blurb", "")))
	_add_section(I18n.t("ui.book_passage"), String(rec.get("passage", "")))

	var origin := String(rec.get("origin", "authored"))
	var origin_note := I18n.t("ui.book_origin_%s" % origin)
	if origin_note.begins_with("ui.book_origin_"):
		origin_note = origin
	_detail.add_child(Panels.label(origin_note, UiScale.ui() - 2, Palette.ink_soft()))

	_award_related_codex(rec)


func _award_related_codex(rec: Dictionary) -> void:
	if state == null:
		return
	var awarded := false
	for cid in rec.get("relatedCodex", []):
		var id := String(cid)
		if id.is_empty() or id in state.codex:
			continue
		state.codex.append(id)
		awarded = true
	if awarded:
		_detail.add_child(Panels.label(I18n.t("ui.book_codex_gained"),
			UiScale.ui() - 1, Palette.ink_soft()))


func _add_section(heading: String, key: String) -> void:
	if key.is_empty():
		return
	_detail.add_child(Panels.label(heading, UiScale.ui(), Palette.ink_soft()))
	var body := I18n.t(key)
	var rt := RichTextLabel.new()
	rt.bbcode_enabled = true
	rt.fit_content = true
	rt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	rt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rt.add_theme_font_size_override("normal_font_size", UiScale.body())
	rt.add_theme_color_override("default_color", Palette.ink())
	rt.text = body if body != key else I18n.t("ui.book_passage_pending")
	_detail.add_child(rt)
	if body != key and I18n.is_untranslated(key):
		_detail.add_child(Panels.label(I18n.t("ui.untranslated_note"),
			UiScale.ui() - 2, Palette.ink_soft()))


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	if not _current.is_empty():
		_show(_current)
	else:
		_refresh_list()
