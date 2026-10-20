extends SceneTree

const WATCHDOG := 90.0
var _elapsed := 0.0
var failures: Array[String] = []

func _process(delta: float) -> bool:
	_elapsed += delta
	if _elapsed > WATCHDOG:
		printerr("WATCHDOG: character draw smoke")
		quit(1)
	return false

func _inside(rect: Rect2, viewport: Vector2) -> bool:
	return rect.position.x >= -0.5 and rect.position.y >= -0.5 \
		and rect.end.x <= viewport.x + 0.5 and rect.end.y <= viewport.y + 0.5

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func _settle() -> void:
	for frame in range(5):
		await process_frame

func _init() -> void:
	# Let the native window/render surface initialize before the first resize.
	await process_frame
	for language in ["zh", "en"]:
		root.content_scale_size = Vector2i(960, 640)
		root.size = Vector2i(960, 640)
		var main = load("res://game/screens/main.tscn").instantiate()
		root.add_child(main)
		I18n.load_lang(language)
		UiScale.step = UiScale.Size.LARGE
		await _settle()
		var scroll := main.get_node("BootCenter/BootScroll") as ScrollContainer
		var viewport: Vector2 = main.get_viewport_rect().size
		_check(_inside(scroll.get_global_rect(), viewport), language + ": opening reading viewport fits")
		var begin := main._desk.get_node("OpeningLeaf/BeginNewJourneyButton") as Button
		scroll.ensure_control_visible(begin)
		await _settle()
		_check(_inside(begin.get_global_rect(), viewport), language + ": beginning button reachable")
		begin.pressed.emit()
		await _settle()
		var setup := main._desk.get_node("JourneySetup") as Control
		var draw := setup.get_node("CharacterDrawButton") as Button
		scroll.ensure_control_visible(draw)
		await _settle()
		_check(_inside(draw.get_global_rect(), viewport), language + ": draw button reachable")
		draw.pressed.emit()
		await _settle()
		for size_value in [Vector2i(960, 640), Vector2i(1280, 720), Vector2i(960, 640)]:
			root.content_scale_size = size_value
			root.size = size_value
			await _settle()
			viewport = main.get_viewport_rect().size
			var cards := main._draw_card.get_node("CharacterCandidates") as GridContainer
			_check(cards.get_child_count() == 3, language + ": three candidates")
			_check(_inside(scroll.get_global_rect(), viewport), language + ": scroll bounded after resize")
			_check(cards.get_global_rect().position.x >= 0 and cards.get_global_rect().end.x <= viewport.x,
				language + ": no horizontal card overflow")
			for card in cards.get_children():
				var accept := card.find_child("AcceptCharacterButton", true, false) as Button
				accept.grab_focus()
				scroll.ensure_control_visible(accept)
				await _settle()
				_check(_inside(accept.get_global_rect(), viewport), language + ": every candidate accepts within viewport")
			_check(scroll.get_h_scroll_bar().max_value <= scroll.size.x + 1, language + ": no hidden horizontal scroll")
		var intro_hidden := true
		for intro in main._desk_intro_nodes:
			intro_hidden = intro_hidden and not intro.visible
		_check(intro_hidden, language + ": opening leaves hidden while choosing")
		var actions := main._draw_card.get_node("CharacterDrawActions") as Control
		scroll.ensure_control_visible(actions)
		await _settle()
		_check(_inside(actions.get_global_rect(), viewport), language + ": reroll and return reachable")
		if DisplayServer.get_name() != "headless":
			scroll.scroll_vertical = 0
			await _settle()
			await RenderingServer.frame_post_draw
			main.get_viewport().get_texture().get_image().save_png(
				"res://build/playtest/character-draw-large-%s.png" % language)
		main._return_to_era_selection()
		await _settle()
		_check(setup.visible and not main._desk.get_node("OpeningLeaf").visible,
			language + ": change era returns to actionable setup")
		main._draw_character()
		main._draw_character()
		_check(main._draw_card.get_child_count() == 3,
			language + ": immediate reroll detaches old cards before new layout")
		await _settle()
		var cards := main._draw_card.get_node("CharacterCandidates") as GridContainer
		var chosen: Dictionary = main._draw_candidates[2]
		var accept := cards.get_child(2).find_child("AcceptCharacterButton", true, false) as Button
		scroll.ensure_control_visible(accept)
		await _settle()
		accept.pressed.emit()
		await _settle()
		_check(main.state != null and main.state.city == chosen.get("start", ""),
			language + ": third candidate enters their own starting city")
		main.queue_free()
		await _settle()
	for failure in failures:
		printerr("FAIL: " + failure)
	print("CHARACTER_DRAW: %s (%d failures; zh/en LARGE; 960x640 and 1280x720)" % [
		"PASS" if failures.is_empty() else "FAIL", failures.size()])
	quit(0 if failures.is_empty() else 1)
