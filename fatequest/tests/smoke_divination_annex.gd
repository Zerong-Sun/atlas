extends SceneTree

const WATCHDOG := 60.0
var _elapsed := 0.0


func _process(delta: float) -> bool:
	_elapsed += delta
	if _elapsed > WATCHDOG:
		printerr("WATCHDOG: annex smoke")
		quit(1)
	return false


func _init() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	main._begin(main.db.get_record("merchant"))
	await process_frame
	var before: Array[String] = main.state.learned_divinations.duplicate()
	main.state.learned_divinations.append("tarot")
	main._on_choice({"id": "ev-test-anachronism", "choices": [{
		"label": "test", "divination": "tarot",
		"effects": [{"op": "flag", "value": "fl-anachronism-leaked",
			"reason": "must-not-run"}],
	}]}, 0)
	var cast_block_ok: bool = not main.state.flags.has("fl-anachronism-leaked")
	main.state.learned_divinations = before.duplicate()
	main._open_divination_annex()
	await process_frame
	var cards_ok: bool = main._annex_view._grid.get_child_count() == 24
	var era_block_ok: bool = not main.divination_catalog.available_in_journey("tarot", "era-1292")
	main._practice_annex_method("tarot")
	await process_frame
	var lesson_ok: bool = main._lesson_layer.visible and main._lesson_annex \
		and main._lesson_ui._lesson.get("ritual", {}).get("motion") == "shuffle"
	main._on_lesson_skipped("tarot")
	await process_frame
	var isolated_ok: bool = main.state.learned_divinations == before and main._annex_layer.visible
	var ok: bool = cards_ok and era_block_ok and cast_block_ok and lesson_ok and isolated_ok
	print("ANNEX: cards=%s era=%s cast=%s lesson=%s isolated=%s" % [
		cards_ok, era_block_ok, cast_block_ok, lesson_ok, isolated_ok])
	print("ANNEX: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
