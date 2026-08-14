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


## Zayton vertical-slice acceptance (docs/PLAN.md §2): a player standing in
## Zayton must be able to spend real time there and leave changed.
##
## Drives the real dialog: entry choice -> its authored result page -> the
## queued consequence chain -> city sites via the panel's ◆ buttons.


func _first_dialog_choice(n, tag: String) -> String:
    for c in n._dialog._choices.get_children():
        if c is Button and not c.disabled and not c.text.is_empty():
            print("  [%s] choice: %s" % [tag, c.text])
            c.pressed.emit()
            return c.text
    return ""


func _dismiss(n) -> void:
    await process_frame
    n._on_event_dismissed()
    await process_frame


func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "merchant": arch = a
    n._begin(arch)
    await process_frame

    # Put the traveller in Zayton directly; getting there is already tested.
    n.state.city = "zayton"
    n.state.coins = 60000
    n._arrive()
    await process_frame

    print("=== ZAYTON ===")
    if not n._dialog.visible:
        printerr("  entry dialog not shown on arrival")
        quit(1)

    # Resolve the entry event: the choice's authored result text must reach
    # the player BEFORE the queued consequence chain takes over
    # (GDLC Playtest #1 P3: dead texts).
    _first_dialog_choice(n, "entry")
    await process_frame
    var expected_result := I18n.t("ev.ev_zayton_entry.choice_1_result").strip_edges()
    var shown_result: bool = n._dialog.visible \
        and n._dialog._body.text.strip_edges() == expected_result
    print("  entry result shown before chain: %s" % shown_result)
    if not shown_result:
        printerr("  DEAD TEXT: entry result text never displayed")
        quit(1)
    await _dismiss(n)

    # Walk the queued consequence chain (ledger -> resolution) to the city.
    for chain_i in 6:
        await process_frame
        if not n._dialog.visible:
            break
        _first_dialog_choice(n, "chain%d" % chain_i)
        await _dismiss(n)

    var visited := 0
    for pass_i in 8:
        # The roads surface lists the city's sites as ◆ buttons; rebuild it
        # each pass so once-fired sites drop out of the list.
        n._show_roads()
        await process_frame
        var acted := false
        for ch in n._panel.get_children():
            if ch is Button and not ch.disabled and ch.text.begins_with("◆"):
                print("  → %s" % ch.text)
                ch.pressed.emit()
                acted = true
                visited += 1
                break
        if acted:
            await process_frame
            _first_dialog_choice(n, "site")
            await _dismiss(n)
            continue
        break

    print("  sites entered: %d" % visited)
    print("  day=%d coins=%d codex=%d stickers=%d langs=%s divs=%s"
        % [n.state.days_elapsed, n.state.coins, n.state.codex.size(),
           n.state.stickers.size(), str(n.state.languages), str(n.state.learned_divinations)])
    print("  goods=%s" % str(n.state.goods))
    # PLAN.md §7 step 1: nothing may render as a raw key.
    var leaked: Array = []
    for k in I18n.missing_keys():
        if String(k).begins_with("ev.zayton") or String(k).begins_with("codex.cx-zayton") \
           or String(k).begins_with("city.zayton"):
            leaked.append(k)
    print("  raw keys leaked in Zayton: %d %s" % [leaked.size(), str(leaked)])
    print("  untranslated (showing English): %d" % I18n.untranslated_keys().size())
    var ok := leaked.is_empty() and visited >= 3
    print("ZAYTON: %s" % ("OK" if ok else "FAIL — %s" % ("raw keys visible" if not leaked.is_empty() else "no sites visited")))
    quit(0 if ok else 1)
