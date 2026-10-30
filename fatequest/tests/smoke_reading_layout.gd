extends SceneTree

var failures := 0
var checks := 0
var elapsed := 0.0

func _init() -> void:
	call_deferred("_run")

func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 150:
		printerr("READING LAYOUT: watchdog")
		quit(1)
	return false

func check(value: bool, message: String) -> void:
	checks += 1
	if not value:
		failures += 1
		printerr("FAIL: " + message)

func frames() -> void:
	for i in 6:
		await process_frame

func fits(control: Control) -> bool:
	return root.get_visible_rect().grow(1).encloses(control.get_global_rect())

func bottom(scroll: ScrollContainer) -> void:
	scroll.scroll_vertical = int(scroll.get_v_scroll_bar().max_value)
	await frames()
	var bar := scroll.get_v_scroll_bar()
	check(absf(bar.value - maxf(0, bar.max_value - bar.page)) < 2, "scroll reaches final line")

func _run() -> void:
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await frames()
	main._begin(main.db.get_record("merchant"))
	await frames()
	main._dialog_layer.hide()
	Motion.reduce_motion = true
	UiScale.step = UiScale.Size.LARGE
	for locale in ["zh", "en"]:
		I18n.load_lang(locale)
		for viewport_size in [Vector2i(1280, 720), Vector2i(960, 640)]:
			root.content_scale_size = viewport_size
			root.size = viewport_size
			main._restyle_all()
			await frames()
			for book in main._book_view._books:
				main._open_book(String(book.id))
				await frames()
				var reader = main._book_view
				check(fits(reader), "book fits: " + locale + "/" + book.id)
				check(reader._heading.size.y < UiScale.title() * 2, "book header stays horizontal")
				check(reader._right.size.x > 400, "book has a readable text measure")
				check(reader._heading.text == I18n.t("ui.books_desk"), "book title follows language")
				await bottom(reader._right)
				var final: Control = reader._detail.get_child(reader._detail.get_child_count() - 1)
				check(final.get_global_rect().end.y <= reader._right.get_global_rect().end.y + 2, "last book paragraph is reachable")
			main._book_layer.hide()
			main.state.codex.assign([main._codex_view._all_codex[0]])
			main._open_codex()
			main._codex_view._switch("codex")
			await frames()
			check(fits(main._codex_view), "codex fits")
			check(main._codex_view._tabs.get_child(0).get_meta("selected_tab", false), "codex tab selection is visible")
			main._codex_view._switch("sticker")
			await frames()
			check(main._codex_view._tabs.get_child(1).get_meta("selected_tab", false), "sticker tab selection moves")
			main._codex_layer.hide()
			main._rebuild_settings_text()
			main._settings.layer.show()
			await frames()
			var settings_close: Control = main._settings.scroll.get_parent().get_child(1)
			check(fits(settings_close), "settings close visible before scrolling")
			await bottom(main._settings.scroll)
			check(fits(settings_close), "settings close visible after scrolling")
			main._settings.layer.hide()
			var routes: Array = main.travel.routes_from(main.state.city)
			main._on_depart(routes[0], String(routes[0].modes[0]))
			await frames()
			var depart = main._travel_confirm
			check(fits(depart), "departure fits")
			check(depart._intro.size.x > 500, "departure prose has real width")
			depart._intro.text = ("Long readable passage. " if locale == "en" else "这是一段用来检查阅读末尾的长文字。 ").repeat(120)
			await frames()
			await bottom(depart._scroll)
			check(fits(depart._confirm), "departure action stays visible for long prose")
			main._travel_confirm_layer.hide()
		# Every practice type at the compact size, including long English labels.
		for method in main.divination_catalog.methods():
			main._practice_annex_method(method)
			await frames()
			var lesson = main._lesson_ui
			check(fits(lesson), "practice fits compact: " + locale + "/" + method)
			check(fits(lesson._challenge_view._toolbar), "practice actions are pinned: " + method)
			var scroll: ScrollContainer = lesson._challenge_view.get_node("ChallengeReadingArea")
			await bottom(scroll)
			check(fits(lesson._challenge_view._toolbar), "practice exit stays visible at bottom")
			main._on_lesson_skipped(method)
	# All glyphs of the previously broken heading are available on this host.
	var font: Font = main.get_theme_default_font()
	for character in "远行诸书图鉴":
		check(font.has_char(character.unicode_at(0)), "heading glyph exists: " + character)
	check(I18n.missing_keys().is_empty(), "audited screens expose no missing translation keys: " + str(I18n.missing_keys()))
	print("READING LAYOUT: %d checks, %d failures" % [checks, failures])
	quit(0 if failures == 0 else 1)
