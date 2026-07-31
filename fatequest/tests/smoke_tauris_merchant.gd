extends SceneTree

## Tauris site interaction acceptance: the foreign-merchants choice must open a
## second authored page, and the second page's result must remain readable
## before the player returns to city exploration.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Tauris merchant smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame
	var merchant: Dictionary = n.db.get_record("ev-tauris-a")
	n.state.city = "tauris"
	n.state.coins = 60000
	n._show_event(merchant)
	await process_frame

	var original_open: bool = n._dialog_layer.visible and String(n._current_event.get("id", "")) == "ev-tauris-a"
	n._resolve_choice(merchant, 0)
	await process_frame
	var followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == "ev-tauris-a-merchants-followup" \
		and not n.state.active_event.is_empty()

	n._resolve_choice(n._current_event, 0)
	await process_frame
	var result_visible: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title") \
		and (n._dialog._body.text.contains("Ctesiphon") or n._dialog._body.text.contains("泰西封"))
	n._dialog.dismissed.emit()
	await process_frame
	var returned_to_city: bool = not n._dialog_layer.visible and n._city_view.visible
	var road_revealed := int(n.state.revealed.get("ctesiphon", 0)) > 0

	var ok: bool = original_open and followup_open and result_visible and returned_to_city and road_revealed
	print("TAURIS_MERCHANT: original=%s followup=%s result=%s city=%s road=%s" % [
		original_open, followup_open, result_visible, returned_to_city, road_revealed])
	print("TAURIS_MERCHANT: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
