extends SceneTree

## Ibn Battuta corpus acceptance (M3b): a battuta-typed traveller arriving in
## Alexandria must resolve the entry event and reach the two Rihla site events;
## a fresh arrival at the Maldives must resolve the new city's entry event and
## its judge site — all with no raw i18n key leaking for any battuta key.

const _WATCHDOG_SEC := 60.0
var _t0 := 0.0
func _process(_d: float) -> bool:
	_t0 += _d
	if _t0 > _WATCHDOG_SEC:
		printerr("WATCHDOG: exceeded %d s — aborting" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _choose_first_dialog(n, tag: String) -> void:
	# The event dialog lists choice buttons; pick the first enabled one.
	for c in n._dialog._choices.get_children():
		if c is Button and not c.disabled and not c.text.is_empty():
			print("  [%s] choice: %s" % [tag, c.text])
			c.pressed.emit()
			return
	printerr("[%s] no enabled dialog choice" % tag)
	quit(1)


func _dismiss(n, tag: String) -> void:
	await process_frame
	# Same path as the dialog's continue/walk-away button.
	n._on_event_dismissed()
	await process_frame


func _enter_city(n, city_id: String, tag: String) -> void:
	n.state.city = city_id
	n.state.coins = 5000
	n._arrive()
	await process_frame
	if not n._dialog.visible:
		printerr("[%s] entry dialog not shown" % tag)
		quit(1)
	_choose_first_dialog(n, tag)
	await _dismiss(n, tag)


func _find_site_button(node) -> Button:
	# City sites render as figure buttons carrying an event_id meta.
	for ch in node.get_children():
		if ch is Button and not ch.disabled and ch.has_meta("event_id"):
			return ch
		var hit := _find_site_button(ch)
		if hit != null:
			return hit
	return null


func _visit_one_site(n, tag: String) -> int:
	var found := 0
	var btn := _find_site_button(n._city_view)
	if btn == null:
		return 0
	print("  [%s] site: %s" % [tag, btn.tooltip_text])
	found += 1
	btn.pressed.emit()
	await process_frame
	_choose_first_dialog(n, tag)
	await _dismiss(n, tag)
	return found


func _init():
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch
	for a in n.db.get_table("archetypes"):
		if a.get("id") == "battuta": arch = a
	n._begin(arch)
	await process_frame

	print("=== BATTUTA ===")
	# 1. Alexandria: entry, then the two Rihla site events.
	await _enter_city(n, "alexandria", "alexandria")
	var sites_a := 0
	sites_a += await _visit_one_site(n, "alexandria")
	sites_a += await _visit_one_site(n, "alexandria")
	print("  alexandria sites entered: %d" % sites_a)

	# 2. Maldives: new city — entry event and judge site.
	await _enter_city(n, "maldive", "maldive")
	var sites_m := await _visit_one_site(n, "maldive")
	print("  maldive sites entered: %d" % sites_m)

	# 3. Nothing under the battuta keys may render as a raw key.
	var leaked: Array = []
	for k in I18n.missing_keys():
		var s := String(k)
		if s.begins_with("ev.maldive") or s.begins_with("city.maldive") \
			or s.begins_with("arch.battuta") or s.begins_with("ev.alexandria.battuta") \
			or s.begins_with("ev.accon.battuta") or s.begins_with("ev.yasdi.battuta") \
			or s.begins_with("ev.bochara.battuta") or s.begins_with("ev.delli.battuta") \
			or s.begins_with("ev.melibar.battuta") or s.begins_with("ev.cail.battuta") \
			or s.begins_with("ev.java-major.battuta") or s.begins_with("ev.zayton.battuta") \
			or s.begins_with("ev.kinsay.battuta"):
			leaked.append(k)
	print("  raw keys leaked: %d %s" % [leaked.size(), str(leaked)])
	var ok := leaked.is_empty() and sites_a >= 2 and sites_m >= 1
	print("BATTUTA: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
