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
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		printerr("CHARACTER_DRAW: use tools/test/run_isolated_godot.mjs")
		quit(1)
		return
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
		main._draw_rng = Rng.new("character-smoke")
		begin.pressed.emit()
		await _settle()
		var opening_cards := main._draw_card.get_node("CharacterCandidates") as GridContainer
		var first_accept := opening_cards.get_child(0).find_child(
			"AcceptCharacterButton", true, false) as Button
		_check(main.get_viewport().gui_get_focus_owner() == first_accept,
			language + ": keyboard focus enters the character choices")
		var era_context := main._draw_card.find_child("EraContext", true, false) as Label
		var shared_era: Dictionary = main.db.get_record(String(main._draw_candidates[0].era_id))
		_check(era_context != null and era_context.text.contains(I18n.t(shared_era.name)),
			language + ": the shared historical setting appears above all choices")
		for index in main._draw_candidates.size():
			var candidate: Dictionary = main._draw_candidates[index]
			_check(candidate.era_id == shared_era.id,
				language + ": candidate belongs to the displayed era")
			var card: Control = opening_cards.get_child(index)
			var identity := card.find_child("CharacterName", true, false) as Label
			_check(identity != null and identity.text == I18n.t(candidate.person_name),
				language + ": generated person's name appears on the card")
			var role := card.find_child("CharacterRole", true, false) as Label
			_check(role != null and role.text == I18n.t(candidate.name),
				language + ": occupational identity appears on the card")
			var description := card.find_child("CharacterDescription", true, false) as Label
			_check(description != null and description.text == I18n.t(candidate.description)
				and not description.text.begins_with("arch."),
				language + ": identity background appears on the actual candidate card")
			var kit := card.find_child("CharacterKit", true, false) as Label
			_check(kit != null and kit.text.contains(str(int(candidate.startKit.coins) / Market.FEN))
				and kit.text.contains(I18n.t("lang.%s" % candidate.startKit.languages[0])),
				language + ": funds and language appear before the choice")
			var goal := card.find_child("CharacterGoal", true, false) as Label
			_check(goal != null and goal.text.contains(
				main._city_name(String(candidate.goal.target))),
				language + ": the role's goal appears before the choice")
			if not candidate.startKit.items.is_empty():
				var items := card.find_child("CharacterItems", true, false) as Label
				_check(items != null and items.text.contains(I18n.t(
					"item.%s" % candidate.startKit.items[0])),
					language + ": starting items appear before the choice")
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
			root.content_scale_size = Vector2i(1280, 720)
			root.size = Vector2i(1280, 720)
			await _settle()
			scroll.scroll_vertical = 0
			await _settle()
			await RenderingServer.frame_post_draw
			main.get_viewport().get_texture().get_image().save_png(
				"res://build/playtest/character-draw-large-%s.png" % language)
		main._return_to_opening()
		await _settle()
		_check(main._desk.get_node("OpeningLeaf").visible,
			language + ": return opens the reading desk")
		_check(main.get_viewport().gui_get_focus_owner() == begin,
			language + ": return restores focus to the new journey action")
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
		_check(main.state != null and main.state.character.get("person_name", "") == chosen.person_name
			and main.state.character.get("era_id", "") == chosen.era_id,
			language + ": chosen name and era enter the persistent character state")
		_check(main.state.coins == int(chosen.startKit.coins)
			and main.state.faith == chosen.faith and main.state.fate == chosen.fate,
			language + ": displayed funds, faith and fate become gameplay values")
		for spoken in chosen.startKit.languages:
			_check(String(spoken) in main.state.languages,
				language + ": displayed language becomes a gameplay language")
		_check(main.state.jdn == GameDate.from_gregorian(int(chosen.start_date.year),
			int(chosen.start_date.month), int(chosen.start_date.day)).jdn
			and main.state.birthdate_jdn == GameDate.from_gregorian(int(chosen.birth.year),
				int(chosen.birth.month), int(chosen.birth.day)).jdn,
			language + ": displayed era and birth date set the actual clocks")
		var saved := SaveGame.serialize(main.state, main.clock)
		var restored := SaveGame.deserialize(saved)
		_check(not restored.is_empty() and restored["state"].character.get("person_name", "")
			== chosen.person_name and restored["state"].character.get("era_id", "") == chosen.era_id,
			language + ": save and load preserve the chosen name and era")
		main.queue_free()
		await _settle()
	# The third card was chosen above; verify the other two button bindings too.
	for chosen_index in [0, 1]:
		var main = load("res://game/screens/main.tscn").instantiate()
		root.add_child(main)
		await _settle()
		main._draw_rng = Rng.new("position:%d" % chosen_index)
		var begin := main._desk.get_node("OpeningLeaf/BeginNewJourneyButton") as Button
		begin.pressed.emit()
		await _settle()
		var chosen: Dictionary = main._draw_candidates[chosen_index]
		var cards := main._draw_card.get_node("CharacterCandidates") as GridContainer
		var accept := cards.get_child(chosen_index).find_child(
			"AcceptCharacterButton", true, false) as Button
		accept.pressed.emit()
		await _settle()
		_check(main.state != null and main.state.city == chosen.start
			and main.state.character.get("archetype_id", "") == chosen.id
			and main.state.character.get("person_name", "") == chosen.person_name,
			"candidate button %d starts its own person and city" % chosen_index)
		main.queue_free()
		await _settle()
	for failure in failures:
		printerr("FAIL: " + failure)
	print("CHARACTER_DRAW: %s (%d failures; zh/en LARGE; 960x640 and 1280x720)" % [
		"PASS" if failures.is_empty() else "FAIL", failures.size()])
	quit(0 if failures.is_empty() else 1)
