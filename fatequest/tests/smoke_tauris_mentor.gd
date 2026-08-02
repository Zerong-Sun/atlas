extends SceneTree

## Tauris mentor acceptance: the tarot choice enqueues the shared mentor page,
## and the astrodice choice (available both from the tarot mentor event and the
## standalone astrodice mentor event) enqueues the dedicated astrodice page.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Tauris mentor smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	# ------------------------------------------------- tarot branch
	var tarot_mentor: Dictionary = n.db.get_record("ev-tauris-mentor-tarot")
	n.state.city = "tauris"
	n.state.coins = 60000
	n._show_event(tarot_mentor)
	await process_frame
	var tarot_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-tauris-mentor-tarot"
	n._resolve_choice(tarot_mentor, 0, "tarot")
	await process_frame
	var tarot_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-tauris-mentor-followup" \
		and not n.state.active_event.is_empty()
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var tarot_learned: bool = "tarot" in n.state.learned_divinations
	var tarot_ready: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	n._dialog.dismissed.emit()
	await process_frame

	# ------------------------------------------------- astrodice via tarot mentor
	n.state.city = "tauris"
	n._show_event(tarot_mentor)
	await process_frame
	var ad_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-tauris-mentor-tarot"
	n._resolve_choice(tarot_mentor, 1, "astrodice")
	await process_frame
	var ad_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-tauris-mentor-astrodice-followup" \
		and not n.state.active_event.is_empty()
	n._resolve_choice(n._current_event, 0)
	await process_frame
	var ad_learned: bool = "astrodice" in n.state.learned_divinations
	var ad_ready: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	n._dialog.dismissed.emit()
	await process_frame
	var returned_to_city: bool = not n._dialog_layer.visible and n._city_view.visible

	var ok: bool = tarot_open and tarot_followup_open and tarot_ready and tarot_learned \
		and ad_open and ad_followup_open and ad_ready and ad_learned and returned_to_city
	print("TAURIS_MENTOR: tarot=%s/%s/%s/%s astrodice=%s/%s/%s/%s city=%s" % [
		tarot_open, tarot_followup_open, tarot_ready, tarot_learned,
		ad_open, ad_followup_open, ad_ready, ad_learned, returned_to_city])
	print("TAURIS_MENTOR: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
