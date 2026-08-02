extends SceneTree

## Zayton mentor acceptance: both learn choices (lot and jiaobei) must enqueue
## their own consequence page, and each follow-up must resolve before the player
## returns to city exploration. The lot branch reuses the shared mentor page
## while the jiaobei branch opens a dedicated page.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Zayton mentor smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	# ------------------------------------------------- lot branch
	var mentor: Dictionary = n.db.get_record("ev-zayton-mentor")
	n.state.city = "zayton"
	n.state.coins = 60000
	n._show_event(mentor)
	await process_frame
	var lot_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-zayton-mentor"
	n._resolve_choice(mentor, 0, "lot")
	await process_frame
	var lot_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-zayton-mentor-followup" \
		and not n.state.active_event.is_empty()
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var lot_learned: bool = "lot" in n.state.learned_divinations
	var lot_ready: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	n._dialog.dismissed.emit()
	await process_frame

	# ------------------------------------------------- jiaobei branch
	n.state.city = "zayton"
	n._show_event(mentor)
	await process_frame
	var jb_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-zayton-mentor"
	n._resolve_choice(mentor, 1, "jiaobei")
	await process_frame
	var jb_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-zayton-mentor-jiaobei-followup" \
		and not n.state.active_event.is_empty()
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var jb_learned: bool = "jiaobei" in n.state.learned_divinations
	var jb_ready: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	n._dialog.dismissed.emit()
	await process_frame
	var returned_to_city: bool = not n._dialog_layer.visible and n._city_view.visible

	var ok: bool = lot_open and lot_followup_open and lot_ready and lot_learned \
		and jb_open and jb_followup_open and jb_ready and jb_learned and returned_to_city
	print("ZAYTON_MENTOR: lot=%s/%s/%s/%s jiaobei=%s/%s/%s/%s city=%s" % [
		lot_open, lot_followup_open, lot_ready, lot_learned,
		jb_open, jb_followup_open, jb_ready, jb_learned, returned_to_city])
	print("ZAYTON_MENTOR: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
