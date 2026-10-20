extends SceneTree

var failures := 0
var submitted := 0

func _init() -> void:
	call_deferred("_run")

func check(ok: bool, message: String) -> void:
	if not ok:
		failures += 1
		printerr("FAIL: " + message)

func settle() -> void:
	for i in 4:
		await process_frame

func labels(node: Node) -> String:
	var text := String(node.text) if node is Label else ""
	for child in node.get_children():
		text += labels(child)
	return text

func _run() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await settle()
	main._draw_character()
	var old_card: Node = main._draw_card.get_node("CharacterCandidates").get_child(0)
	var old_button: Button = old_card.find_child("AcceptCharacterButton", true, false)
	main._draw_character()
	old_button.pressed.emit()
	check(main.state == null, "a retired candidate cannot start a rerolled journey")
	main._begin(main.db.get_record("battuta"))
	await settle()

	var record: Dictionary = main.db.get_table("retainers").filter(func(rec):
		return int(rec.get("wage", {}).get("amount", 0)) == 350)[0]
	var hire_row: Control = main._hire_row(record)
	check(labels(hire_row).contains("3.5"), "recruitment list discloses fractional silver wages")
	hire_row.free()

	var dialog = load("res://game/ui/event_dialog.gd").new()
	root.add_child(dialog)
	var ev: Dictionary = main.db.get_record("ev-alexandria-welcome-gate")
	main.state.active_event = String(ev.id)
	main._pending_pages_in_sequence = 2
	main._show_event(ev)
	I18n.load_lang("en")
	main._restyle_all()
	check(main._dialog._context.text == main._pending_context(),
		"language changes retranslate active narrative progress")
	var choices := [{"choice": {"label": "ev.alexandria.welcome.gate.tears"},
		"visible": true, "enabled": true, "reasons": []}]
	dialog.choice_taken.connect(func(_index): submitted += 1)
	dialog.show_event(ev, choices)
	dialog._choices.get_child(0).pressed.emit()
	check(submitted == 1, "first selection submits")
	dialog.restyle()
	dialog._choices.get_child(0).pressed.emit()
	check(submitted == 1 and dialog._choices.get_child(0).disabled,
		"restyling cannot unlock a submitted page")
	dialog.show_event(ev, choices)
	dialog.hide()
	dialog._choices.get_child(0).pressed.emit()
	check(submitted == 1, "hidden pages reject stale submissions")
	dialog.show_event(ev, [])
	await settle()
	check(not dialog._leave.disabled, "empty choice list retains its exit")
	dialog.queue_free()
	print("REVIEW EDGES: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
