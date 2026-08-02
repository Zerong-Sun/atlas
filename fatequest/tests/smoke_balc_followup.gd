extends SceneTree

## Balc site/multi-round acceptance: the first and second choices of each
## Balc site open an authored follow-up page, and each follow-up resolves back
## to city exploration. Guards the T1 multi-round wiring for the first city.
const _WATCHDOG_SEC := 90.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Balc followup smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	var failures: Array[String] = []
	n.state.city = "balc"
	n.state.coins = 60000

	var pairs := [
		["ev-balc-a", "ev-balc-a-followup", 0],
		["ev-balc-b", "ev-balc-b-followup", 2],
		["ev-balc-c", "ev-balc-c-followup", 1],
	]
	for pair in pairs:
		var site_id: String = pair[0]
		var followup_id: String = pair[1]
		var choice_idx: int = pair[2]
		var site: Dictionary = n.db.get_record(site_id)
		n.state.flags = {}
		n._show_event(site)
		await process_frame
		var site_open: bool = n._dialog_layer.visible \
			and String(n._current_event.get("id", "")) == site_id
		n._resolve_choice(site, choice_idx)
		await process_frame
		var followup_open: bool = n._dialog_layer.visible \
			and String(n._current_event.get("id", "")) == followup_id \
			and not n.state.active_event.is_empty()
		if followup_open:
			n._resolve_choice(n._current_event, 0)
			await process_frame
			if n._dialog_layer.visible and n._dialog._title.text == I18n.t("ui.choice_result_title"):
				n._dialog.dismissed.emit()
				await process_frame
		var returned: bool = not n._dialog_layer.visible and n._city_view.visible
		if not (site_open and followup_open and returned):
			failures.append("%s -> %s (site=%s followup=%s city=%s)" % [
				site_id, followup_id, site_open, followup_open, returned])

	var mentor: Dictionary = n.db.get_record("ev-balc-mentor")
	n._show_event(mentor)
	await process_frame
	var mentor_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-balc-mentor"
	n._resolve_choice(mentor, 1)
	await process_frame
	var mentor_followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-balc-mentor-followup" \
		and not n.state.active_event.is_empty()
	if mentor_followup_open:
		n._resolve_choice(n._current_event, 0)
		await process_frame
		if n._dialog_layer.visible and n._dialog._title.text == I18n.t("ui.choice_result_title"):
			n._dialog.dismissed.emit()
			await process_frame
	var mentor_returned: bool = not n._dialog_layer.visible and n._city_view.visible
	if not (mentor_open and mentor_followup_open and mentor_returned):
		failures.append("ev-balc-mentor -> ev-balc-mentor-followup (mentor=%s followup=%s city=%s)" % [
			mentor_open, mentor_followup_open, mentor_returned])

	var ok: bool = failures.is_empty()
	print("BALC_FOLLOWUP: %s" % ("OK" if ok else "FAIL"))
	for f in failures:
		printerr("BALC_FOLLOWUP: %s" % f)
	quit(0 if ok else 1)
