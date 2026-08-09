extends SceneTree

const WATCHDOG := 60.0
var _elapsed := 0.0


func _process(delta: float) -> bool:
	_elapsed += delta
	if _elapsed > WATCHDOG:
		printerr("WATCHDOG: character draw smoke")
		quit(1)
	return false


func _inside(rect: Rect2, viewport: Vector2) -> bool:
	return rect.position.x >= -0.5 and rect.position.y >= -0.5 \
		and rect.end.x <= viewport.x + 0.5 and rect.end.y <= viewport.y + 0.5


func _init() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await process_frame
	UiScale.step = UiScale.Size.LARGE
	main._restyle_all()
	main._draw_character()
	await process_frame
	await process_frame
	var cards: HBoxContainer = main._draw_card.get_child(1)
	var viewport: Vector2 = main.get_viewport().get_visible_rect().size
	var cards_ok: bool = cards.get_child_count() == 3
	for card in cards.get_children():
		cards_ok = cards_ok and _inside(card.get_global_rect(), viewport)
	var compact_ok: bool = _inside(main._draw_card.get_global_rect(), viewport)
	var intro_hidden_ok: bool = true
	for intro in main._desk_intro_nodes:
		intro_hidden_ok = intro_hidden_ok and not intro.visible
	main._return_to_era_selection()
	await process_frame
	var restored_ok: bool = true
	for intro in main._desk_intro_nodes:
		restored_ok = restored_ok and intro.visible
	var ok: bool = cards_ok and compact_ok and intro_hidden_ok and restored_ok
	print("CHARACTER_DRAW: cards=%s compact=%s intro=%s restored=%s" % [
		cards_ok, compact_ok, intro_hidden_ok, restored_ok])
	print("CHARACTER_DRAW: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
