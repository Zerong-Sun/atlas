extends SceneTree

## Tarot and astrology dice are annex-only in the medieval campaign. The old
## smoke bypassed _on_choice with a forged lesson_passed token and asserted an
## unreachable story branch. Test the journey gate and real annex lessons.
const Driver = preload("res://tests/story_ui_driver.gd")
const _WATCHDOG_SEC := 60.0
var _t := 0.0
var _failures := 0

func _process(delta: float) -> bool:
	_t += delta
	if _t > _WATCHDOG_SEC:
		printerr("TAURIS_MENTOR: WATCHDOG")
		quit(1)
	return false

func _ok(value: bool, message: String) -> void:
	if not value:
		_failures += 1
		printerr("FAIL: " + message)

func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	n._begin(n.db.get_record("merchant"))
	await process_frame
	n.state.city = "tauris"
	n.state.coins = 60000
	var learned: Array = n.state.learned_divinations.duplicate()
	var coins: int = n.state.coins
	var day: int = n.state.jdn
	var mentor: Dictionary = n.db.get_record("ev-tauris-mentor-tarot")
	var cases := [["tarot", 0, "ev-tauris-mentor-followup"],
		["astrodice", 1, "ev-tauris-mentor-astrodice-followup"]]
	for fixture in cases:
		var method: String = fixture[0]
		var followup: String = fixture[2]
		var has_queue := false
		for effect in mentor.choices[fixture[1]].get("effects", []):
			has_queue = has_queue or (effect.get("op") == "queue_event" and effect.get("value") == followup)
		_ok(has_queue and not n.db.get_record(followup).is_empty(), "authored followup reference remains valid: " + followup)
		_ok(not n._method_allowed_in_journey(method), "medieval campaign excludes " + method)
		n._show_event(mentor)
		await process_frame
		_ok(Driver.choice(n, fixture[1]), "journey choice dispatches through real UI")
		await process_frame
		_ok(not n._lesson_layer.visible and not n._dialog_layer.visible and n._city_view.visible,
			"unavailable method returns safely to city")
		_ok(n.state.learned_divinations == learned and n.state.coins == coins and n.state.jdn == day
			and n.state.pending_events.is_empty(), "blocked method has no journey effects")
		n._open_divination_annex()
		await process_frame
		var practiced := false
		var method_name := I18n.t(n.db.get_record(method).get("name", method))
		for card in n._annex_view._grid.get_children():
			if card.get_child(0) is Label and card.get_child(0).text == method_name:
				practiced = Driver.press(card, I18n.t("annex.practice"))
				break
		_ok(practiced, "annex offers a real practice button for " + method)
		await process_frame
		_ok(await Driver.finish_lesson(n, method), "annex lesson completes via its controls: " + method)
		_ok(n._annex_layer.visible and n.state.learned_divinations == learned and n.state.coins == coins
			and n.state.jdn == day and n.state.pending_events.is_empty(), "annex practice leaves journey state unchanged")
		_ok(Driver.press(n._annex_view, I18n.t("ui.close")), "annex closes through UI")
		await process_frame
	print("TAURIS_MENTOR: %s" % ("OK" if _failures == 0 else "FAIL"))
	quit(0 if _failures == 0 else 1)
