extends SceneTree

## GDLC Playtest #3 shared probe — market experience after the sell-gate.
## Transient playtest instrument (not a regression test — see ratchet).
##
## Modes (user args):
##   liquidation  merchant buys paper-money at the Zayton market, sells it back
##                (spread loss allowed — S2 UX path)
##   gated        merchant holds an event-granted paper-money in Zayton: hold
##                row state (sell disabled + reason + jettison), then jettison
##   hold-report  both flows' hold rows, labels and button states printed raw

const _WATCHDOG_SEC := 60.0
var _t0 := 0.0
func _process(d: float) -> bool:
	_t0 += d
	if _t0 > _WATCHDOG_SEC:
		printerr("WATCHDOG: exceeded %d s — aborting" % int(_WATCHDOG_SEC))
		quit(1)
	return false

var n = null


func _walk_rows(box, tag: String) -> void:
	for row in box.get_children():
		for ch in row.get_children():
			for b in ch.get_children():
				if b is Button:
					print("  [%s] button: '%s' %s" % [tag, b.text, "(disabled)" if b.disabled else ""])
			if ch is Label or ch is RichTextLabel:
				print("  [%s] label: %s" % [tag, ch.text])


func _init():
	var args := OS.get_cmdline_user_args()
	var mode := String(args[0]) if args.size() > 0 else "hold-report"
	n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch
	for a in n.db.get_table("archetypes"):
		if a.get("id") == "merchant": arch = a
	n._begin(arch)
	await process_frame
	n.state.city = "zayton"
	n.state.coins = 200000
	await process_frame

	if mode == "liquidation":
		n._open_market()
		await process_frame
		var before: int = n.state.coins
		var bought := false
		var buy_label := I18n.t("ui.buy")
		for row in n._market_view._stock_box.get_children():
			for ch in row.get_children():
				for b in ch.get_children():
					if b is Button and not b.disabled and b.text == buy_label:
						b.pressed.emit()
						bought = true
						break
				if bought: break
			if bought: break
		await process_frame
		print("=== LIQUIDATION (merchant, zayton) ===")
		print("  bought first stock good: %s, spent %d, hold %s" % [bought, before - n.state.coins, str(n.state.goods)])
		_walk_rows(n._market_view._hold_box, "hold")
		var before2: int = n.state.coins
		var sell_label := I18n.t("ui.sell")
		for row in n._market_view._hold_box.get_children():
			for ch in row.get_children():
				for b in ch.get_children():
					if b is Button and not b.disabled and b.text == sell_label:
						b.pressed.emit()
		await process_frame
		await process_frame
		print("  after sell: purse %d -> %d, hold %s" % [before2, n.state.coins, str(n.state.goods)])
		quit(0)
		return

	if mode == "gated":
		# Event-grant the good through the executor, exactly as an event would.
		n.executor.execute(n.state, [{"op": "goods", "id": "paper-money", "value": 1,
			"reason": "t"}], {})
		await process_frame
		n._open_market()
		await process_frame
		print("=== GATED (merchant, granted paper-money in zayton) ===")
		print("  basis: %s" % str(n.state.purchases.get("paper-money", {})))
		_walk_rows(n._market_view._hold_box, "hold")
		var before: int = n.state.coins
		var jettison_label := I18n.t("ui.market.jettison")
		var pressed := false
		for row in n._market_view._hold_box.get_children():
			for ch in row.get_children():
				for b in ch.get_children():
					if b is Button and not b.disabled and b.text == jettison_label:
						print("  [probe] pressing jettison, pending before: %s" % str(n._market_view._pending))
						b.pressed.emit()
						pressed = true
						print("  [probe] pending after press: %s" % str(n._market_view._pending))
		await process_frame
		await process_frame
		print("  [probe] pressed=%s after jettison: coins %d -> %d, hold %s" % [pressed, before, n.state.coins, str(n.state.goods)])
		quit(0)
		return

	n._open_market()
	await process_frame
	print("=== HOLD-REPORT (fresh merchant, zayton) ===")
	_walk_rows(n._market_view._hold_box, "hold")
	_walk_rows(n._market_view._stock_box, "stock")
	quit(0)
