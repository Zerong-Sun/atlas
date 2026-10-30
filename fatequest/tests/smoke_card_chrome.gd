extends SceneTree
var failures := 0
var elapsed := 0.0
func _init(): call_deferred("run")
func _process(dt: float) -> bool:
	elapsed += dt
	if elapsed > 30: quit(1)
	return false
func check(ok: bool, label: String) -> void:
	if not ok:
		failures += 1
		printerr("FAIL: " + label)
func frames() -> void:
	for i in 12: await process_frame
func run() -> void:
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		quit(1)
		return
	I18n.load_lang("zh")
	var prefs := ConfigFile.new()
	prefs.load(UiScale.CFG)
	prefs.set_value("ui", "reading_tip_seen", false)
	prefs.save(UiScale.CFG)
	Panels._reading_tip_claimed = false
	var container := VBoxContainer.new()
	container.size = Vector2(500, 400)
	root.add_child(container)
	var hints: Array[Label] = []
	var scrolls: Array[ScrollContainer] = []
	for i in 2:
		var scroll := ScrollContainer.new()
		scroll.custom_minimum_size = Vector2(400, 100)
		container.add_child(scroll)
		var text := Label.new()
		text.text = "A long reading page.\n".repeat(80)
		scroll.add_child(text)
		var hint := Panels.reading_hint(scroll)
		container.add_child(hint)
		hints.append(hint)
		scrolls.append(scroll)
	await frames()
	var shown := hints.filter(func(h): return h.is_visible_in_tree())
	check(shown.size() == 1, "two readers share exactly one tutorial hint")
	var idx := hints.find(shown[0]) if shown.size() == 1 else 0
	scrolls[idx].scroll_vertical = 60
	await frames()
	check(hints.all(func(h): return not h.visible), "scrolling dismisses the one hint")
	container.hide()
	container.show()
	await frames()
	check(hints.all(func(h): return not h.visible), "reopening does not repeat the hint")
	prefs.load(UiScale.CFG)
	check(prefs.get_value("ui", "reading_tip_seen", false), "hint consumption survives app restart")
	for kind in ["story", "ledger", "atlas", "book", "notice"]:
		check(Panels.card_style(kind) is StyleBoxTexture, kind + " uses paper texture")
	UiScale.high_contrast = true
	check(Panels.card_style("story") is StyleBoxFlat, "high contrast retains clean reading surface")
	UiScale.high_contrast = false
	check(Panels.explain_reason("travel.cannot_afford:150").contains("1.5"), "fare shortage uses silver, not raw fen")
	var btn := Panels.styled_button("A new city with a long name", Callable())
	btn.custom_minimum_size.x = 420
	btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	Panels.tag_button(btn, I18n.t("ui.route.new_badge"))
	container.add_child(btn)
	await frames()
	var tag: Control = btn.get_node("NewCityBadge")
	check(btn.get_global_rect().encloses(tag.get_global_rect()), "new-city badge fits its route button")
	check(btn.get_theme_stylebox("normal").content_margin_right > tag.size.x, "route text reserves room for badge")
	print("CARD_CHROME: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
