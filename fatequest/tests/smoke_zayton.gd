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
    # Resolve the entry event first; only then does the panel list the sites.
    for ch in n._panel.get_children():
        if ch is Button and not ch.disabled and not ch.text.begins_with("—"):
            print("  entry: %s" % ch.text)
            ch.pressed.emit()
            break
    await process_frame
    # The entry choice's authored result text must reach the player BEFORE the
    # queued consequence chain takes over (GDLC Playtest #1 P3: dead texts).
    var expected_result := I18n.t("ev.ev_zayton_entry.choice_1_result").strip_edges()
    var shown_result: bool = n._dialog.visible \
        and n._dialog._body.text.strip_edges() == expected_result
    print("  entry result shown before chain: %s" % shown_result)
    if not shown_result:
        printerr("  DEAD TEXT: entry result text never displayed")
        quit(1)
    n._on_event_dismissed()
    await process_frame

    var visited := 0
    for pass_i in 8:
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
            # take the first affordable choice of that site
            for ch in n._panel.get_children():
                if ch is Button and not ch.disabled and not ch.text.begins_with("—") and not ch.text.begins_with("◆"):
                    ch.pressed.emit()
                    break
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
    print("ZAYTON: %s" % ("OK" if leaked.is_empty() else "FAIL — raw keys visible"))
    quit(0)
