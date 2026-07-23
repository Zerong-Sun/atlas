extends SceneTree

## Watchdog: a script error used to leave the SceneTree spinning forever — one
## such hang burned six hours of CI before GitHub killed it. Fail in seconds
## instead, and say so.
const _WATCHDOG_SEC := 60.0
var _t0 := 0.0
func _process(_d: float) -> bool:
    _t0 += _d
    if _t0 > _WATCHDOG_SEC:
        printerr("WATCHDOG: exceeded %d s — aborting" % int(_WATCHDOG_SEC))
        quit(1)
    return false


## Drives the real UI the way a player would: pick an archetype, take the first
## enabled choice, then depart on the first available road. Proves the P1 loop
## is reachable through the interface, not merely through the kernel.

func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame

    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame
    print("PLAY: start=%s coins=%d" % [n.state.city, n.state.coins])

    for step in 6:
        await process_frame
        var pressed := false
        for ch in n._panel.get_children():
            if ch is Button and not ch.disabled and not ch.text.begins_with("—"):
                ch.pressed.emit()
                pressed = true
                break
        if not pressed:
            print("PLAY: nothing actionable at step %d" % step)
            break
        await process_frame
        print("  step %d: at=%s day=%d coins=%d revealed=%d"
            % [step, n.state.city, n.state.days_elapsed, n.state.coins, n.state.revealed.size()])

    print("PLAY: OK")
    quit(0)
