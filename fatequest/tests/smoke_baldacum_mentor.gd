extends SceneTree

## Baldacum mentor acceptance: the bazi choice enqueues the shared mentor page,
## and the geomancy choice (available both from the bazi mentor event and the
## standalone geomancy mentor event) enqueues the dedicated geomancy page.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Baldacum mentor smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	# ------------------------------------------------- bazi branch
	var bazi_mentor: Dictionary = n.db.get_record("ev-baldacum-mentor-bazi")
	n.state.city = "baldacum"
	n.state.coins = 60000
	n._show_event(bazi_mentor)
	await process_frame
	var bazi_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-baldacum-mentor-bazi"
	n._resolve_choice(bazi_mentor, 0, "bazi")
	await process_frame
	var bazi_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-baldacum-mentor-followup" \
		and not n.state.active_event.is_empty()
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var bazi_learned: bool = "bazi" in n.state.learned_divinations
	var bazi_ready: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	n._dialog.dismissed.emit()
	await process_frame

	# ------------------------------------------------- geomancy via bazi mentor
	n.state.city = "baldacum"
	n._show_event(bazi_mentor)
	await process_frame
	var gm_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-baldacum-mentor-bazi"
	n._resolve_choice(bazi_mentor, 1, "geomancy")
	await process_frame
	var gm_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-baldacum-mentor-geomancy-followup" \
		and not n.state.active_event.is_empty()
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var gm_learned: bool = "geomancy" in n.state.learned_divinations
	var gm_ready: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	n._dialog.dismissed.emit()
	await process_frame
	var returned_to_city: bool = not n._dialog_layer.visible and n._city_view.visible

	var ok: bool = bazi_open and bazi_followup_open and bazi_ready and bazi_learned \
		and gm_open and gm_followup_open and gm_ready and gm_learned and returned_to_city
	print("BALDACUM_MENTOR: bazi=%s/%s/%s/%s geomancy=%s/%s/%s/%s city=%s" % [
		bazi_open, bazi_followup_open, bazi_ready, bazi_learned,
		gm_open, gm_followup_open, gm_ready, gm_learned, returned_to_city])
	print("BALDACUM_MENTOR: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
