extends SceneTree
const _W := 90.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _W: printerr("WATCHDOG"); quit(1)
    return false

## Regression: after exploring every site in a city the player must still be
## able to leave. A city with no exit is a dead end, and the game ends there.
func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame

    # Clear the entry event, then exhaust every site.
    if n._dialog_layer.visible:
        for ch in n._dialog._choices.get_children():
            if ch is Button and not ch.disabled: ch.pressed.emit(); break
        await process_frame

    var visited := 0
    for pass_i in 12:
        await process_frame
        if not n._city_view.visible: break
        var hit = false
        for fig in n._city_view._figures.get_children():
            for b in fig.get_children():
                if b is Button and not b.disabled:
                    b.pressed.emit(); hit = true; visited += 1; break
            if hit: break
        if not hit: break
        await process_frame
        if n._dialog_layer.visible:
            for ch in n._dialog._choices.get_children():
                if ch is Button and not ch.disabled: ch.pressed.emit(); break
        await process_frame

    await process_frame
    var figures = n._city_view._figures.get_child_count() if n._city_view.visible else -1
    print("CITYNAV: visited=%d  city_view=%s  figures_left=%d" % [visited, n._city_view.visible, figures])
    # Every site is once:true, so after exhausting them the remaining figures
    # must all be marked done — a figure that is still live means an event is
    # re-firing and the player is walking in a circle.
    var live := 0
    for fig in n._city_view._figures.get_children():
        for plate in fig.get_children():
            for lbl in plate.get_children():
                if lbl is Label and not String(lbl.text).begins_with("✓"): live += 1
    print("CITYNAV: figures still un-done = %d" % live)

    # Can the player get out? Look for any control that leaves the city.
    var exits := 0
    if n._city_view.visible:
        for c in _walk(n._city_view):
            if c is Button and not c.disabled and String(c.text).length() > 0:
                exits += 1
    print("CITYNAV: usable buttons in city view = %d" % exits)
    # Both regressions this test was written for.
    var ok = exits > 0 and live == 0
    if exits == 0: printerr("  FAIL: dead end — no way out of the city")
    if live != 0: printerr("  FAIL: %d sites still offered after being explored" % live)
    print("CITYNAV: %s" % ("OK" if ok else "FAIL"))
    quit(0 if ok else 1)

func _walk(n: Node) -> Array:
    var out := [n]
    for c in n.get_children(): out.append_array(_walk(c))
    return out
