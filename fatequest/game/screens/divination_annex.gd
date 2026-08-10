class_name DivinationAnnex
extends PanelContainer

signal practice_requested(method: String)
signal closed

var _db: ContentDb
var _catalog
var _grid: GridContainer


func _ready() -> void:
	custom_minimum_size = Vector2(900, 620)
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)
	root.add_child(Panels.heading(I18n.t("annex.heading")))
	var note := Panels.label(I18n.t("annex.description"), UiScale.ui(), Palette.ink_soft())
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	root.add_child(note)
	root.add_child(Panels.rule())
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(scroll)
	_grid = GridContainer.new()
	_grid.columns = 3
	_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_grid.add_theme_constant_override("h_separation", Metrics.sm())
	_grid.add_theme_constant_override("v_separation", Metrics.sm())
	scroll.add_child(_grid)
	root.add_child(Panels.styled_button(I18n.t("ui.close"), func(): closed.emit()))


func setup(db: ContentDb, catalog) -> void:
	_db = db
	_catalog = catalog
	refresh()


func refresh() -> void:
	if _grid == null or _catalog == null:
		return
	for child in _grid.get_children():
		child.queue_free()
	for method in _catalog.methods():
		if not _catalog.available_in_annex(method):
			continue
		var entry: Dictionary = _catalog.get_entry(method)
		var divination := _db.get_record(method)
		var card := VBoxContainer.new()
		card.custom_minimum_size = Vector2(260, 116)
		card.add_child(Panels.label(I18n.t(String(divination.get("name", method))),
			UiScale.ui(), Palette.ink()))
		var meta := Panels.label(I18n.t("annex.meta_fmt") % [
			I18n.t("lesson.mechanic.%s" % entry.get("lessonMechanic", "observe")),
			I18n.t("annex.historicity.%s" % entry.get("historicity", "broad_category")),
			I18n.t("annex.implementation.%s" % entry.get("implementation", "adapter")),
		], maxi(UiScale.ui() - 2, 10), Palette.ink_soft())
		meta.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		card.add_child(meta)
		card.add_child(Panels.primary_button(I18n.t("annex.practice"),
			func(): practice_requested.emit(method)))
		_grid.add_child(card)
