extends SceneTree

## GDLC Playtest #3 ratchet — market trade application order.
## Authored RED before the fix. Invariant: EVERY press of a market trade
## button applies exactly that trade, immediately — the host must consume
## the pending effects on the same signal. (Found: _buy/_sell/_jettison
## emit `traded` BEFORE assigning _pending, so the first press of a
## session applies nothing and the last press leaves a stale trade that
## can fire in another city later.)
const _WATCHDOG_SEC := 60.0
var _t0 := 0.0
func _process(d: float) -> bool:
	_t0 += d
	if _t0 > _WATCHDOG_SEC:
		printerr("WATCHDOG: exceeded %d s — aborting" % int(_WATCHDOG_SEC))
		quit(1)
	return false

var issues: Array[String] = []
func flag(sev: String, what: String) -> void:
	issues.append("%s %s" % [sev, what])

var n = null


func _press(box, label: String) -> bool:
	for row in box.get_children():
		for ch in row.get_children():
			for b in ch.get_children():
				if b is Button and not b.disabled and b.text == label:
					b.pressed.emit()
					return true
	return false


func _init():
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

	# ---- T1: the first buy press applies immediately ----
	n._open_market()
	await process_frame
	var before: int = n.state.coins
	_press(n._market_view._stock_box, I18n.t("ui.buy"))
	await process_frame
	var applied_buy: bool = n.state.coins < before and not n.state.goods.is_empty()
	if not applied_buy:
		flag("[严重]", "T1: first buy press applied nothing (coins %d -> %d, hold %s)"
			% [before, n.state.coins, str(n.state.goods)])
	if not n._market_view._pending.is_empty():
		flag("[严重]", "T1: pending not consumed after the press: %s" % str(n._market_view._pending))

	# ---- T2: the first sell press applies immediately (liquidation) ----
	var gid := ""
	for g in n.state.goods:
		gid = String(g)
	var before2: int = n.state.coins
	if not _press(n._market_view._hold_box, I18n.t("ui.sell")):
		flag("[严重]", "T2: no enabled sell button for a market-bought good")
	await process_frame
	if n.state.coins <= before2:
		flag("[严重]", "T2: sell press applied nothing (coins %d -> %d)" % [before2, n.state.coins])
	if not n._market_view._pending.is_empty():
		flag("[严重]", "T2: pending not consumed after the sell press")

	# ---- T3: abandon applies on the SECOND press (arm + commit), no silver ----
	n.executor.execute(n.state, [{"op": "goods", "id": "paper-money", "value": 1,
		"reason": "t"}], {})
	await process_frame
	n._market_view.refresh()
	await process_frame
	var before3: int = n.state.coins
	var held3: int = int(n.state.goods.get("paper-money", 0))
	var abandon_label := I18n.t("ui.market.abandon")
	if not _press(n._market_view._hold_box, abandon_label):
		flag("[严重]", "T3: no abandon button on the hold row")
	await process_frame
	if int(n.state.goods.get("paper-money", 0)) != held3:
		flag("[严重]", "T3: first abandon press already destroyed cargo (hold %d -> %d)"
			% [held3, int(n.state.goods.get("paper-money", 0))])
	# Second press commits.
	if not _press(n._market_view._hold_box, I18n.t("ui.market.confirm_abandon")):
		flag("[严重]", "T3: confirm press not offered after arming")
	await process_frame
	if int(n.state.goods.get("paper-money", 0)) != held3 - 1:
		flag("[严重]", "T3: abandon applied nothing (hold %d -> %d)" % [held3, int(n.state.goods.get("paper-money", 0))])
	if n.state.coins != before3:
		flag("[严重]", "T3: abandon moved silver (%d -> %d)" % [before3, n.state.coins])
	if not n._market_view._pending.is_empty():
		flag("[严重]", "T3: pending not consumed after the abandon press")

	print("=== MARKET TRADE ORDER AUDIT ===")
	if issues.is_empty():
		print("  no issues")
	for i in issues:
		print("  " + i)
	print("=== %d issues ===" % issues.size())
	var severe := issues.any(func(issue): return issue.begins_with("[严重]"))
	quit(1 if severe else 0)
