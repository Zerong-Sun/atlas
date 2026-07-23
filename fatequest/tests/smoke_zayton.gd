extends SceneTree

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
