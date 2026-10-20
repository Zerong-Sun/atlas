extends SceneTree

var failures := 0
var commits: Array = []
var cancels := 0

func _init() -> void:
	call_deferred("_run")

func _ok(value: bool, message: String) -> void:
	if not value:
		failures += 1
		printerr("FAIL: " + message)

func _run() -> void:
	I18n.load_lang("zh")
	var viewport := SubViewport.new()
	viewport.size = Vector2i(390, 640)
	root.add_child(viewport)
	var host := Control.new()
	host.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(host)
	var contract := HireContract.new()
	contract.build(host)
	contract.confirmed.connect(func(rec: Dictionary): commits.append(rec))
	contract.cancelled.connect(func(): cancels += 1)
	var record := {"id": "no-audited-portrait", "name": "一位姓名很长的旅行同伴，来自遥远城市的向导与搬运工", "wage": {"amount": 350}, "contract": {"months": 12}}
	UiScale.step = UiScale.Size.LARGE
	contract.restyle()
	contract.open(record, "latin", "open")
	for i in 5:
		await process_frame
	var rect := contract._panel.get_global_rect()
	_ok(rect.position.x >= 0 and rect.end.x <= viewport.size.x + 1, "long name fits narrow viewport width")
	_ok(rect.position.y >= 0 and rect.end.y <= viewport.size.y + 1, "contract stays inside narrow viewport height")
	_ok(not contract._portrait.visible and contract._portrait.texture == null, "missing portrait has no empty placeholder")
	_ok(contract._detail_l.text.contains("3.5"), "fractional monthly wage is displayed without underquoting")
	UiScale.high_contrast = true
	contract.restyle()
	_ok(not contract._bg.visible, "high contrast removes illustrated contract background")
	UiScale.high_contrast = false
	contract.restyle()
	_ok(contract._name_l.autowrap_mode != TextServer.AUTOWRAP_OFF, "long name wraps")
	for button in [contract._btn_ok, contract._btn_cancel]:
		var button_rect: Rect2 = button.get_global_rect()
		_ok(button_rect.position.y >= 0 and button_rect.end.y <= viewport.size.y + 1, "contract actions remain visible without scrolling")
	contract._btn_ok.pressed.emit()
	_ok(commits.size() == 1, "hiring commits synchronously without waiting for motion")
	_ok(not contract._layer.visible, "confirmed contract immediately releases the modal")
	contract._btn_ok.pressed.emit()
	contract._on_cancel()
	_ok(commits.size() == 1 and cancels == 0, "repeat activation cannot double-hire or cancel a committed contract")
	await create_timer(0.5).timeout
	_ok(commits.size() == 1, "no delayed animation callback repeats the transaction")
	contract.open(record, "latin", "open")
	contract._on_cancel()
	contract._on_cancel()
	contract._run_confirm()
	_ok(cancels == 1 and commits.size() == 1, "cancellation is immediate and closes the stale confirm path")
	I18n.load_lang("en")
	Motion.reduce_motion = true
	contract.open(record, "latin", "open")
	_ok(contract._btn_ok.text == I18n.t("ui.forge_contract") and contract._btn_cancel.text == I18n.t("ui.pass"), "reopening after language switch refreshes action labels")
	contract._run_confirm()
	_ok(commits.size() == 2, "reduced motion keeps identical instant confirmation")
	Motion.reduce_motion = false
	contract.open(record, "latin", "open")
	# The receiver is allowed to tear down the UI within the signal callback.
	contract.confirmed.connect(func(_rec: Dictionary): host.queue_free())
	contract._run_confirm()
	await process_frame
	await create_timer(0.3).timeout
	_ok(commits.size() == 3, "freeing the screen during confirmation leaves no suspended task")
	viewport.queue_free()
	await process_frame
	UiScale.step = UiScale.Size.NORMAL
	print("HIRE CONTRACT: %s" % ("PASS" if failures == 0 else "FAIL (%d)" % failures))
	quit(0 if failures == 0 else 1)
