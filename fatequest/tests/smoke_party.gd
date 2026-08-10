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


## The cargo linkage (GDD §11.7) driven entirely through the real UI: hire a
## porter by pressing the button a player would press, watch the hold grow, and
## confirm that dismissing them is *refused* while the extra hold is in use.
##
## The row is located the way a player locates it — by the "+N 格" the interface
## prints — so a build that hires correctly but never shows the bonus fails here
## too. Reaching into the roster for the id would test the kernel a second time
## and leave the screen untested.
func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame

    # Tabriz: a porter is hireable in the open here (content/tables/retainers.json).
    n.state.city = "tauris"
    n.state.coins = 500000
    n._open_party()
    await process_frame

    var base_land: int = n._roster.effective_slots(n.state, "land")
    var base_sea: int = n._roster.effective_slots(n.state, "sea")

    var hire_btn = _find_button(n._party["list"], I18n.t("ui.hire"), "+")
    _ok(hire_btn != null, "the hiring pool shows someone whose cargo bonus is stated")
    if hire_btn == null:
        _done()
        return
    hire_btn.pressed.emit()
    await process_frame
    # Hire opens the parchment ritual; confirm with the localized contract label.
    var seal_btn = _button_in(n, I18n.t("ui.forge_contract"))
    _ok(seal_btn != null, "hire ritual shows 缔结")
    if seal_btn == null:
        _done()
        return
    seal_btn.pressed.emit()
    await n.get_tree().create_timer(1.0).timeout

    var land: int = n._roster.effective_slots(n.state, "land")
    var sea: int = n._roster.effective_slots(n.state, "sea")
    print("PARTY: party=%d  land %d->%d  sea %d->%d"
        % [n.state.retainers.size(), base_land, land, base_sea, sea])
    _ok(n.state.retainers.size() == 1, "confirming the contract puts exactly one person in the party")
    _ok(land > base_land, "a porter's hold shows up on land")
    _ok(sea == base_sea, "and not at sea")

    # Fill the hold past what the player owns alone, then try to let them go.
    n.state.goods = {"silk": land}
    n._open_party()
    await process_frame
    var quit_btn = _find_button(n._party["list"], I18n.t("ui.dismiss"), "")
    _ok(quit_btn != null, "a party member has a 辞退 button")
    if quit_btn != null:
        quit_btn.pressed.emit()
        await process_frame
        _ok(n.state.retainers.size() == 1,
            "§11.7: dismissal is refused while their hold is carrying cargo")
        _ok(n._roster.effective_slots(n.state, "land") == land, "and the hold is unchanged")

    # Sell down, and the same button now works.
    n.state.goods = {}
    n._open_party()
    await process_frame
    quit_btn = _find_button(n._party["list"], I18n.t("ui.dismiss"), "")
    if quit_btn != null:
        quit_btn.pressed.emit()
        await process_frame
    _ok(n.state.retainers.is_empty(), "with an empty hold they can leave")
    _ok(n._roster.effective_slots(n.state, "land") == base_land,
        "and the hold returns to what the player carries alone")

    _done()


func _done() -> void:
    print("PARTY: %s" % ("OK" if _fails == 0 else "FAIL (%d)" % _fails))
    quit(0 if _fails == 0 else 1)


## Find a button by label inside a row whose text also contains `needle`.
## `needle` empty matches any row.
func _find_button(list, label: String, needle: String):
    for panel in list.get_children():
        var text := _text_of(panel)
        if needle != "" and not text.contains(needle):
            continue
        var b = _button_in(panel, label)
        if b != null:
            return b
    return null


func _text_of(node) -> String:
    var s := ""
    if node is Label:
        s += node.text
    for c in node.get_children():
        s += " " + _text_of(c)
    return s


func _button_in(node, label: String):
    if node is Button and node.text == label:
        return node
    for c in node.get_children():
        var b = _button_in(c, label)
        if b != null:
            return b
    return null
