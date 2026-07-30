class_name SaveManager
extends PanelContainer

signal closed()
signal save_requested(slot: String)
signal load_requested(slot: String)
signal backup_requested(slot: String)

const MANUAL_SLOTS := 5

var db: ContentDb
var _list: VBoxContainer
var _overwrite_dialog: ConfirmationDialog
var _pending_overwrite := ""
var _restore_dialog: ConfirmationDialog
var _pending_restore := ""
var _deep_inspect_slots: Dictionary = {}


func _ready() -> void:
	custom_minimum_size = Vector2(680, 500)
	add_theme_stylebox_override("panel", Palette.panel_style())
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", Metrics.sm())
	add_child(root)
	root.add_child(Panels.heading(I18n.t("ui.save_heading")))
	root.add_child(Panels.label(
		I18n.t("ui.save_desc"),
		UiScale.ui(), Palette.ink_soft()))
	root.add_child(Panels.rule())
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	root.add_child(scroll)
	_list = VBoxContainer.new()
	_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_list.add_theme_constant_override("separation", Metrics.xs())
	scroll.add_child(_list)
	root.add_child(Panels.styled_button(I18n.t("ui.close"), func(): closed.emit()))
	_overwrite_dialog = ConfirmationDialog.new()
	_overwrite_dialog.title = I18n.t("ui.overwrite_manual")
	_overwrite_dialog.confirmed.connect(_confirm_overwrite)
	add_child(_overwrite_dialog)
	_restore_dialog = ConfirmationDialog.new()
	_restore_dialog.title = I18n.t("ui.restore_backup")
	_restore_dialog.dialog_text = I18n.t("ui.restore_confirm")
	_restore_dialog.confirmed.connect(_confirm_restore)
	add_child(_restore_dialog)


func setup(p_db: ContentDb) -> void:
	db = p_db


func refresh() -> void:
	for child in _list.get_children():
		child.queue_free()
	_list.add_child(_slot_row("auto", I18n.t("ui.auto_save"), false))
	for i in range(1, MANUAL_SLOTS + 1):
		_list.add_child(_slot_row("manual-%d" % i, I18n.t("ui.slot_manual_fmt") % i, true))


func mark_slot_for_deep_check(slot: String) -> void:
	_deep_inspect_slots[slot] = true
	refresh()


func trust_slot_header(slot: String) -> void:
	_deep_inspect_slots.erase(slot)
	refresh()


func _slot_row(slot: String, label: String, writable: bool) -> Control:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", Palette.panel_style(true))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", Metrics.sm())
	panel.add_child(row)
	var text := VBoxContainer.new()
	text.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(text)
	text.add_child(Panels.label(label, UiScale.ui(), Palette.ink()))
	var info := SaveGame.inspect_slot(slot, bool(_deep_inspect_slots.get(slot, false)))
	var status := String(info.get("status", "empty"))
	var exists := status == "ok"
	var h: Dictionary = info.get("header", {})
	if exists:
		var city_id := String(h.get("city", ""))
		var city := db.get_record(city_id) if db != null else {}
		var city_name := I18n.t(city.get("name", city_id)) if not city.is_empty() else city_id
		text.add_child(Panels.label(I18n.t("ui.slot_info_fmt") % [
			city_name, int(h.get("days", 0)), String(h.get("saved_at", ""))],
			maxi(UiScale.ui() - 2, 10), Palette.ink_soft()))
	elif status == "empty":
		text.add_child(Panels.label(I18n.t("ui.empty_slot"), maxi(UiScale.ui() - 2, 10), Palette.ink_faint()))
	else:
		var message := I18n.t("ui.save_corrupted") if status == "corrupt" else I18n.t("ui.version_mismatch")
		text.add_child(Panels.label("%s · %s" % [
			message, String(info.get("code", "SAVE_INVALID"))],
			maxi(UiScale.ui() - 2, 10), Palette.loss()))
	if writable:
		var save_btn := Panels.styled_button(
			I18n.t("ui.overwrite") if exists else I18n.t("ui.save_btn"),
			_request_save.bind(slot, exists))
		save_btn.disabled = status not in ["ok", "empty"]
		if save_btn.disabled:
			save_btn.tooltip_text = I18n.t("ui.slot_blocked")
		row.add_child(save_btn)
	var load_btn := Panels.primary_button(I18n.t("ui.load"), func(): load_requested.emit(slot))
	load_btn.disabled = not exists
	row.add_child(load_btn)
	if bool(info.get("backup_available", false)):
		row.add_child(Panels.styled_button(
			I18n.t("ui.restore"), _request_restore.bind(slot)))
	return panel


func _request_save(slot: String, exists: bool) -> void:
	if not exists:
		save_requested.emit(slot)
		return
	_pending_overwrite = slot
	var info := SaveGame.inspect_slot(slot)
	var h: Dictionary = info.get("header", {})
	_overwrite_dialog.dialog_text = I18n.t("ui.overwrite_confirm_fmt") % [
		slot, int(h.get("days", 0)), String(h.get("saved_at", ""))]
	_overwrite_dialog.popup_centered()


func _confirm_overwrite() -> void:
	if _pending_overwrite.is_empty():
		return
	var slot := _pending_overwrite
	_pending_overwrite = ""
	save_requested.emit(slot)


func _request_restore(slot: String) -> void:
	_pending_restore = slot
	_restore_dialog.popup_centered()


func _confirm_restore() -> void:
	if _pending_restore.is_empty():
		return
	var slot := _pending_restore
	_pending_restore = ""
	backup_requested.emit(slot)
