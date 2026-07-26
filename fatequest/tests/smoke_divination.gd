extends SceneTree
const _W := 90.0
var _t := 0.0
func _process(d: float) -> bool:
	_t += d
	if _t > _W:
		printerr("WATCHDOG")
		quit(1)
	return false

## Opens a real event dialog, casts a learned method, checks reading has no raw keys.
func _init():
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch
	for a in n.db.get_table("archetypes"):
		if a.get("id") == "merchant":
			arch = a
	n._begin(arch)
	await process_frame

	n.state.city = "zayton"
	n.state.coins = 200000
	n.state.learned_divinations.clear()
	n.state.learned_divinations.append("jiaobei")
	n.state.flags["fl-learned-jiaobei"] = true

	var ev: Dictionary = n.db.get_record("ev-zayton-jiaobei-ask")
	if ev.is_empty():
		printerr("SMOKE_DIV: missing ev-zayton-jiaobei-ask")
		quit(1)
		return
	n._show_event(ev)
	await process_frame

	var cast_btn: Button = null
	for ch in n._dialog._choices.get_children():
		if ch is Button and not ch.disabled:
			var t := String(ch.text)
			if "筊" in t or "掷" in t or "Cast" in t or "cup" in t.to_lower():
				cast_btn = ch
				break
	if cast_btn == null:
		for ch in n._dialog._choices.get_children():
			if ch is Button and not ch.disabled and not String(ch.text).begins_with("先") and not String(ch.text).begins_with("就"):
				cast_btn = ch
				break
	if cast_btn == null:
		printerr("SMOKE_DIV: no cast button")
		quit(1)
		return
	cast_btn.pressed.emit()
	await process_frame
	await process_frame

	var blob := String(n._log.text)
	var has_raw: bool = blob.find("div.jiaobei.result.") >= 0
	var ok: bool = (not has_raw) and ("jiaobei" in n.state.learned_divinations) and blob.strip_edges() != ""
	print("SMOKE_DIV: has_raw=%s log_len=%d" % [has_raw, blob.length()])
	print("SMOKE_DIV: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
