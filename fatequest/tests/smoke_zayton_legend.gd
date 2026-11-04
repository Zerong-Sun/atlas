extends SceneTree

const Driver = preload("res://tests/story_ui_driver.gd")
const LEGENDS := [
	"leg-prester-john", "leg-earthly-paradise", "chr-zhenla-city",
	"chr-yelu-xiyou", "chr-changchun-audience", "chr-daoyi-gulong",
	"chr-xingcha-malacca",
]

var _elapsed := 0.0


func _process(delta: float) -> bool:
	_elapsed += delta
	if _elapsed > 30.0:
		printerr("WATCHDOG: Zayton legend smoke timed out")
		quit(1)
	return false


func _scholar_branch(game: Node, legend_choice: int) -> bool:
	game._show_event(game.db.get_record("ev-zayton-fanfang"))
	await process_frame
	if not Driver.choice(game, 0):
		return false
	await process_frame
	if not Driver.continue_result(game):
		return false
	await process_frame
	if game.state.active_event != "ev-zayton-fanfang-followup":
		return false
	if not Driver.choice(game, 3):
		return false
	await process_frame
	if not Driver.continue_result(game):
		return false
	await process_frame
	if game.state.active_event != "ev-codex-legend-seed":
		return false
	if not Driver.choice(game, legend_choice):
		return false
	await process_frame
	if not Driver.continue_result(game):
		return false
	await process_frame
	return game.state.active_event.is_empty() and game.state.pending_events.is_empty()


func _init() -> void:
	var game = load("res://game/screens/main.tscn").instantiate()
	root.add_child(game)
	await process_frame
	game._begin(game.db.get_record("merchant"))
	await process_frame
	game.state.city = "zayton"
	if "persian" not in game.state.languages:
		game.state.languages.append("persian")
	var first_day: int = game.state.days_elapsed
	var reached: bool = await _scholar_branch(game, 0)
	var awarded := true
	for entry in LEGENDS:
		if entry not in game.state.codex:
			awarded = false
	var copied: bool = reached and awarded and game.state.days_elapsed == first_day + 1
	game.queue_free()
	await process_frame

	var declined_game = load("res://game/screens/main.tscn").instantiate()
	root.add_child(declined_game)
	await process_frame
	declined_game._begin(declined_game.db.get_record("merchant"))
	await process_frame
	declined_game.state.city = "zayton"
	declined_game.state.coins = 0
	if "persian" not in declined_game.state.languages:
		declined_game.state.languages.append("persian")
	var decline_day: int = declined_game.state.days_elapsed
	var declined: bool = await _scholar_branch(declined_game, 1)
	for entry in LEGENDS:
		if entry in declined_game.state.codex:
			declined = false
	declined = declined and declined_game.state.days_elapsed == decline_day + 1
	var ok: bool = copied and declined
	print("ZAYTON_LEGEND: copied=%s declined_without_coins=%s result=%s" % [
		copied, declined, "OK" if ok else "FAIL"])
	quit(0 if ok else 1)
