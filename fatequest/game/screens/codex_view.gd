extends PanelContainer

## The codex: what the journey has actually accumulated (GDD §13).
##
## The data was already being recorded — `state.codex` and `state.stickers` have
## been filling up since the first city — but there was no way to look at any of
## it. A collection you cannot open is not a collection.
##
## Two columns: the list on the left, the entry on the right. Unfound entries
## are shown as silhouettes with their count, because the shape of what you have
## not seen is part of what makes a collection worth filling.

signal closed()

const SHOW_UNFOUND := true

var db: ContentDb
var state: WorldState

var _tabs: HBoxContainer
var _list: VBoxContainer
var _detail: VBoxContainer
var _tab: String = "codex"
var _all_codex: Array = []
var _all_stickers: Array = []


func setup(p_db: ContentDb) -> void:
	db = p_db
	_scan()
	_build()


## Everything the content can ever award, so the browser can show what is still
## missing rather than only what is held.
func _scan() -> void:
	var cod := {}
	var stk := {}
	for e in db.get_table("events"):
		for c in e.get("choices", []):
			var lists: Array = [c.get("effects", [])]
			if c.has("pass"):
				lists.append(c["pass"].get("effects", []))
			if c.has("fail"):
				lists.append(c["fail"].get("effects", []))
			for l in lists:
				for eff in l:
					match String(eff.get("op", "")):
						"codex": cod[String(eff.get("value", ""))] = true
						"sticker": stk[String(eff.get("value", ""))] = true
	_all_codex = cod.keys()
	_all_codex.sort()
	_all_stickers = stk.keys()
	_all_stickers.sort()


func _build() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	custom_minimum_size = Vector2(880, 540)

	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 10)
	add_child(root)

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 10)
	root.add_child(head)

	_tabs = HBoxContainer.new()
	_tabs.add_theme_constant_override("separation", 6)
	head.add_child(_tabs)
	_tabs.add_child(Panels.styled_button("图鉴", func(): _switch("codex")))
	_tabs.add_child(Panels.styled_button("贴纸", func(): _switch("sticker")))

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(spacer)
	head.add_child(Panels.styled_button("合上", func(): closed.emit()))

	var cols := HBoxContainer.new()
	cols.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cols.add_theme_constant_override("separation", 14)
	root.add_child(cols)

	var left := ScrollContainer.new()
	left.custom_minimum_size = Vector2(300, 0)
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


func open(p_state: WorldState) -> void:
	state = p_state
	visible = true
	_refresh()


func _switch(tab: String) -> void:
	_tab = tab
	_refresh()


func _refresh() -> void:
	for c in _list.get_children():
		c.queue_free()
	for c in _detail.get_children():
		c.queue_free()

	var all: Array = _all_codex if _tab == "codex" else _all_stickers
	var held: Array = state.codex if _tab == "codex" else state.stickers
	var prefix := "codex." if _tab == "codex" else "sticker."

	_list.add_child(Panels.label("%d / %d" % [held.size(), all.size()],
		UiScale.ui(), Palette.ink_soft()))

	var first_found := ""
	for id in all:
		var have: bool = id in held
		if not have and not SHOW_UNFOUND:
			continue
		var title := I18n.t("%s%s.name" % [prefix, id]) if have else "— 未见 —"
		var b := Panels.styled_button(title, Callable())
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		if have:
			b.pressed.connect(_show.bind(id, prefix))
			if first_found == "":
				first_found = id
		else:
			b.disabled = true
		_list.add_child(b)

	if first_found != "":
		_show(first_found, prefix)
	else:
		_detail.add_child(Panels.label("尚无记录。", UiScale.body(), Palette.ink_soft()))


func _show(id: String, prefix: String) -> void:
	for c in _detail.get_children():
		c.queue_free()

	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	_detail.add_child(head)

	if prefix.begins_with("sticker"):
		var art := MapArt.sticker_icon(id)
		if art != null:
			var tr := TextureRect.new()
			tr.texture = art
			tr.custom_minimum_size = Vector2(72, 72)
			tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			head.add_child(tr)
	else:
		# Codex entries reuse goods / ritual icons when the id matches.
		var art2 := MapArt.goods_icon(id)
		if art2 == null:
			art2 = MapArt.tex("ic-misc-books")
		if art2 != null:
			var tr2 := TextureRect.new()
			tr2.texture = art2
			tr2.custom_minimum_size = Vector2(48, 48)
			tr2.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tr2.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			head.add_child(tr2)

	head.add_child(Panels.label(I18n.t("%s%s.name" % [prefix, id]),
		UiScale.title(), Palette.ink()))

	var body_key := "%s%s.body" % [prefix, id]
	var body := I18n.t(body_key)
	if body != body_key:
		var rt := RichTextLabel.new()
		rt.bbcode_enabled = true
		rt.fit_content = true
		rt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		rt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		rt.add_theme_font_size_override("normal_font_size", UiScale.body())
		rt.add_theme_color_override("default_color", Palette.ink())
		rt.text = body
		_detail.add_child(rt)
		if I18n.is_untranslated(body_key):
			_detail.add_child(Panels.label("（尚未译出，暂显英文原文）",
				UiScale.ui() - 2, Palette.ink_soft()))
	else:
		# No body is better than an invented one — GDD §19 keeps record and
		# invention distinguishable, and that applies to the codex most of all.
		_detail.add_child(Panels.label("（此条只录其名。）", UiScale.ui(), Palette.ink_soft()))


func restyle() -> void:
	add_theme_stylebox_override("panel", Palette.panel_style())
	if state != null:
		_refresh()
