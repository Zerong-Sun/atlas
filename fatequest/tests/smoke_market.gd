extends SceneTree
const _W := 90.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _W: printerr("WATCHDOG"); quit(1)
    return false

## Drives the market through the real UI: open it, buy, verify purse and hold.
func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "merchant": arch = a
    n._begin(arch)
    await process_frame

    n.state.city = "zayton"
    n.state.coins = 200000
    n._open_market()
    await process_frame

    var before_coins = n.state.coins
    print("MARKET: purse=%d hold=%d/%d" % [before_coins, n._market.cargo_used(n.state), n.state.cargo_slots])

    var bought = 0
    for pass_i in 4:
        await process_frame
        var hit = false
        for row in n._market_view._stock_box.get_children():
            for ch in row.get_children():
                for b in ch.get_children():
                    if b is Button and not b.disabled and b.text == "买":
                        b.pressed.emit(); hit = true; bought += 1; break
                if hit: break
            if hit: break
        if not hit: break

    await process_frame
    print("MARKET: bought=%d purse=%d (spent %d) hold=%d goods=%s"
        % [bought, n.state.coins, before_coins - n.state.coins,
           n._market.cargo_used(n.state), str(n.state.goods)])

    var ok = bought > 0 and n.state.coins < before_coins and not n.state.goods.is_empty()
    print("MARKET: %s" % ("OK" if ok else "FAIL"))
    quit(0 if ok else 1)
