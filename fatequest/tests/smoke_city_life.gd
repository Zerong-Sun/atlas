extends SceneTree

const Life = preload("res://core/city/city_life.gd")
var failures := 0
var checks := 0
var elapsed := 0.0
var executor := EffectExecutor.new()

func _init() -> void: call_deferred("run")
func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > 120:
		printerr("CITY_LIFE watchdog")
		quit(1)
	return false
func check(value: bool, text: String) -> void:
	checks += 1
	if not value:
		failures += 1
		printerr("FAIL: " + text)
func frames(n := 8) -> void:
	for i in n: await process_frame
func apply(state: WorldState, op: String, value: Variant = true):
	return executor.execute(state, [{"op": op, "value": value, "reason": "test-city-life"}])
func work(state: WorldState, job: String, months: int):
	return apply(state, "city_work", {"city": state.city, "job": job, "months": months})
func fresh() -> WorldState:
	var s := WorldState.new()
	s.seed = "city-life-test"
	s.city = "zayton"
	s.jdn = GameDate.from_gregorian(1292, 1, 31).jdn
	s.character = {"archetype_id": "merchant"}
	return s

func run() -> void:
	if not OS.get_user_data_dir().ends_with("FateQuest-UI-Audit"):
		quit(1)
		return
	var db := ContentDb.new()
	db.load_all()
	for city in db.cities():
		for arch in db.get_table("archetypes"):
			var s := fresh()
			s.city = city.id
			s.character.archetype_id = arch.id
			var jobs := Life.jobs(s)
			check(jobs.size() >= 3, "every background has a skilled job in " + city.id)
			check(jobs.any(func(j): return j.id == "laundry"), "laundry is available everywhere")
			check(not work(s, "laundry", 12).applied.is_empty(), "zero-money work is possible")
			check(s.coins == 21600 and s.city == city.id, "one year pays correctly without travelling")
	var s := fresh()
	check(Life.days_for_months(s.jdn, 1) == 29, "Jan 31 clamps to leap-day Feb 29")
	var before := s.duplicate_state()
	var effect := {"op": "city_work", "value": {"city": s.city, "job": "ledger", "months": 24}, "reason": "preview"}
	executor.preview(s, [effect])
	check(s.jdn == before.jdn and s.coins == 0 and Life.work_history(s).is_empty(), "preview is pure")
	check(work(s, "healing", 3).applied.is_empty(), "background gate enforced in core")
	check(work(s, "laundry", -1).applied.is_empty(), "negative duration rejected")
	s.active_event = "ev-zayton-harbour"
	check(work(s, "laundry", 3).applied.is_empty(), "cannot skip active event by working")
	s.active_event = ""
	check(not apply(s, "city_borrow").applied.is_empty() and s.coins == 10000, "borrow pays exactly once")
	s.city = "fuju"
	check(apply(s, "city_borrow").applied.is_empty() and s.coins == 10000, "cannot borrow again in another city")
	check(apply(s, "city_repay").applied.is_empty() and s.coins == 10000, "insufficient repayment is atomic")
	work(s, "laundry", 24)
	check(Life.debt_due(s) == 12000, "one late fee after two years")
	var due := Life.debt_due(s)
	work(s, "laundry", 24)
	check(Life.debt_due(s) == due, "late fee never compounds")
	var saved := SaveGame.serialize(s, WorldClock.new(s.jdn))
	var restored := SaveGame.deserialize(saved)
	check(not restored.is_empty() and restored.state.city_life == s.city_life, "work records and loan survive save")
	var old := saved.duplicate(true)
	old.state.erase("city_life")
	old = SaveGame._seal(old)
	var legacy := SaveGame.deserialize(old)
	check(not legacy.is_empty() and Life.debt_due(legacy.state) == 0, "old saves have no invented debt")
	var coins := s.coins
	check(not apply(s, "city_repay").applied.is_empty() and s.coins == coins - due and Life.debt_due(s) == 0, "repay in another city clears exactly the quoted amount")
	check(apply(s, "city_repay").applied.is_empty(), "cannot repay twice")
	apply(s, "retire_journey", "failed")
	check(Life.retired(s) and not s.life.deceased, "failed expedition ends run without killing character")
	check(work(s, "laundry", 1).applied.is_empty() and apply(s, "coins", 100).applied.is_empty(), "terminal run rejects further mutations")
	var batch := fresh()
	var result := executor.execute(batch, [
		{"op": "retire_journey", "value": "settled", "reason": "test"},
		{"op": "coins", "value": 100, "reason": "test"}])
	check(result.rejected.size() == 1 and batch.coins == 0, "retirement also blocks the rest of its effect batch")
	# Real controls: every action is accessible at compact size and duplicate old clicks are inert.
	var main = load("res://game/screens/main.tscn").instantiate()
	root.add_child(main)
	await frames()
	main._begin(main.db.get_record("merchant"))
	await frames()
	main.state.active_event = ""
	main.state.pending_events.clear()
	main._dialog_layer.hide()
	main.state.coins = 0
	main.state.city = "zayton"
	Motion.reduce_motion = true
	for locale in ["zh", "en"]:
		I18n.load_lang(locale)
		for viewport in [Vector2i(1280, 720), Vector2i(960, 640), Vector2i(640, 480)]:
			root.content_scale_size = viewport
			root.size = viewport
			UiScale.step = UiScale.Size.LARGE
			main._restyle_all()
			main._open_city()
			main._city_view.livelihood_requested.emit()
			await frames()
			var view = main._city_life_view
			check(main._city_life_layer.visible, "city entry opens livelihood")
			for tab in ["work", "credit", "ending"]:
				view._tab = tab
				view._render()
				await frames()
				check(root.get_visible_rect().encloses(view.get_global_rect()), "panel fits " + locale + tab)
				check(root.get_visible_rect().encloses(view._actions.get_global_rect()), "actions pinned " + locale + tab)
				check(view._commit.size.x >= 250 and view._commit.size.y < 90, "primary action is readable, not collapsed")
			main._close_city_life()
	main._open_city_life()
	var view = main._city_life_view
	view._tab = "work"
	view._job = "laundry"
	view._months = 12
	view._render()
	await frames()
	var button: Button = view._commit
	var start: int = main.state.jdn
	button.pressed.emit()
	button.pressed.emit()
	check(main.state.coins == 21600 and main.state.jdn - start in [365, 366], "real double-click pays only once")
	check(main.clock.date.jdn == main.state.jdn, "clock follows work")
	view._tab = "ending"
	view._end_kind = "failed"
	view._render()
	await frames()
	view._commit.pressed.emit()
	check(Life.retired(main.state), "confirmed failure is terminal")
	main._close_city_life()
	check(main._city_life_layer.visible, "Escape cannot resume completed run")
	var doc := SaveGame.serialize(main.state, main.clock)
	check(main._restore_document(doc) and main._city_life_layer.visible, "terminal save resumes at ending")
	check(I18n.missing_keys().is_empty(), "no missing translations")
	print("CITY_LIFE: %s (%d checks)" % ["PASS" if failures == 0 else "FAIL", checks])
	quit(0 if failures == 0 else 1)
