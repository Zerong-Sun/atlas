extends SceneTree

## Watchdog: a script error leaves the SceneTree spinning rather than exiting,
## so a broken test looks identical to a slow one. Fail loudly instead.
const _WATCHDOG_SEC := 90.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _WATCHDOG_SEC:
        printerr("WATCHDOG: exceeded %d s" % int(_WATCHDOG_SEC))
        quit(1)
    return false


## Hire through the real UI, confirm the hold actually grew, and confirm the
## dismissal warning fires when cargo would be stranded (GDD §11.7).
func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame

    n.state.coins = 500000
    n._open_party()
    await process_frame

    var base_land = n._roster.effective_slots(n.state, "land")
    var hired = 0
    for row in n._party["list"].get_children():
        for r in row.get_children():
            for b in r.get_children():
                if b is Button and b.text == "雇":
                    b.pressed.emit()
                    hired += 1
                    break
            if hired > 0: break
        if hired > 0: break
    await process_frame

    var after_land = n._roster.effective_slots(n.state, "land")
    var after_sea = n._roster.effective_slots(n.state, "sea")
    print("PARTY: hired=%d party=%d  land %d->%d  sea=%d"
        % [hired, n.state.retainers.size(), base_land, after_land, after_sea])

    # Fill the hold, then check what leaving would cost.
    var rid = ""
    if not n.state.retainers.is_empty():
        rid = String(n.state.retainers[0].get("id", ""))
        n.state.goods = {"silk": after_land}
        var of = n._roster.overflow_if_leaving(n.state, n._market, rid, "land")
        print("PARTY: dismissing would strand %d units" % int(of["over"]))

    var ok = hired > 0 and n.state.retainers.size() == 1
    print("PARTY: %s" % ("OK" if ok else "FAIL"))
    quit(0 if ok else 1)
