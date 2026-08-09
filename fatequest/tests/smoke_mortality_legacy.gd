extends SceneTree

const WATCHDOG := 60.0
var _elapsed := 0.0


func _process(delta: float) -> bool:
	_elapsed += delta
	if _elapsed > WATCHDOG:
		printerr("WATCHDOG: mortality legacy smoke")
		quit(1)
	return false


func _init() -> void:
	var context := preload("res://game/autoload/game_context.gd").new()
	context.name = "GameContext"
	root.add_child(context)
	var first = load("res://game/screens/main.tscn").instantiate()
	root.add_child(first)
	await process_frame
	var archetype: Dictionary = first.db.get_record("merchant")
	first._begin(archetype)
	await process_frame
	first.state.codex.append("cx-test-witness")
	first.state.stickers.append("st-test-witness")
	first.state.revealed["zayton"] = 3
	var heirloom := String(first.state.items[0]) if not first.state.items.is_empty() else ""
	first.state.life["deceased"] = true
	first.state.life["stage"] = "deceased"
	first.state.life["cause"] = "road-fever"
	first.state.life["death_jdn"] = first.state.jdn
	first.state.life["legacy_prepared"] = true
	first._open_death()
	await process_frame
	var death_ui_ok: bool = first._ending_ui["layer"].visible \
		and first._ending_ui["successor"].visible \
		and not context.pending_legacy.is_empty()
	var volume_count := (first.state.legacy.get("volumes", []) as Array).size()
	first._open_death()
	var archive_once_ok: bool = (first.state.legacy.get("volumes", []) as Array).size() \
		== volume_count
	var terminal_doc := SaveGame.serialize(first.state, first.clock,
		{"archetype": "merchant"}, "test")
	var restored_ok: bool = first._restore_document(terminal_doc) \
		and first._ending_ui["layer"].visible \
		and (first.state.legacy.get("volumes", []) as Array).size() == volume_count
	var escape := InputEventKey.new()
	escape.pressed = true
	escape.keycode = KEY_ESCAPE
	first._unhandled_key_input(escape)
	var terminal_locked_ok: bool = first._ending_ui["layer"].visible
	context.pending_heirloom = heirloom
	first.queue_free()
	await process_frame

	var successor = load("res://game/screens/main.tscn").instantiate()
	root.add_child(successor)
	await process_frame
	successor._begin(archetype)
	await process_frame
	var inherited_ok: bool = successor.state.legacy.get("generation", 1) == 2 \
		and "cx-test-witness" in successor.state.codex \
		and "st-test-witness" in successor.state.stickers \
		and int(successor.state.revealed.get("zayton", 0)) == 2 \
		and (heirloom.is_empty() or heirloom in successor.state.items) \
		and context.pending_legacy.is_empty()
	var ok := death_ui_ok and archive_once_ok and restored_ok \
		and terminal_locked_ok and inherited_ok
	print("MORTALITY_LEGACY: death_ui=%s once=%s restore=%s locked=%s inherited=%s" % [
		death_ui_ok, archive_once_ok, restored_ok, terminal_locked_ok, inherited_ok])
	print("MORTALITY_LEGACY: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
