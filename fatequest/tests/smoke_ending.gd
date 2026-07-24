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


var _fails := 0
func _ok(c: bool, w: String) -> void:
    if not c:
        printerr("  FAIL: %s" % w)
        _fails += 1


## Closing the book through the real UI (GDD §14).
##
## Two things matter on screen and neither is visible from the kernel: that the
## confirmation names the ending BEFORE the player commits, and that pressing
## 停笔 is not itself the commitment — a player who opens the panel to read it
## must be able to walk away and still be travelling.
func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame

    # Walk a little so the panel has a journey to describe.
    for c in ["baldacum", "ormus", "balc"]:
        n.executor.execute(n.state, [{"op": "goto", "value": c, "reason": "smoke"}],
            {"rng": n.rng, "event_id": "walk"})
    n.executor.execute(n.state, [{"op": "days", "value": 500, "reason": "smoke"}],
        {"rng": n.rng, "event_id": "t"})

    n._open_ending()
    await process_frame
    var body = n._ending_ui["body"]
    var preview = String(body.text)
    print("PARTY-FREE ENDING PREVIEW:\n%s" % preview.substr(0, 200))

    _ok(n._ending_ui["layer"].visible, "停笔 opens a panel")
    _ok(n._ending_ui["confirm"].visible, "which offers to go through with it")
    var named = String(n._ending.best(n.state).get("name", ""))
    _ok(preview.contains(I18n.t(named)),
        "and names the ending the player would get before they commit")
    _ok(preview.contains(str(n.state.visited.size())),
        "and counts the cities actually walked")
    _ok(not preview.contains("{"), "no unfilled variable reaches the screen")

    # Walking away must leave the run intact.
    var stickers_before = n.state.stickers.size()
    n._ending_ui["layer"].visible = false
    _ok(n.state.stickers.size() == stickers_before,
        "opening the panel and closing it changes nothing")

    # Now go through with it.
    n._open_ending()
    await process_frame
    n._confirm_ending()
    await process_frame
    var final_text = String(body.text)
    _ok(not n._ending_ui["confirm"].visible, "the confirm button is gone once the book is closed")
    _ok(final_text.length() > 60, "the epilogue is on screen")
    _ok(not final_text.contains("{"), "with every variable filled")
    _ok(n.state.stickers.size() > stickers_before, "and the ending's sticker is recorded")

    print("ENDING: %s" % ("OK" if _fails == 0 else "FAIL (%d)" % _fails))
    quit(0 if _fails == 0 else 1)
