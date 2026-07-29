extends SceneTree
const _W := 90.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _W: printerr("WATCHDOG"); quit(1)
    return false

## Save, walk further, load, and confirm the world came back to where it was.
func _init():
    SaveGame.erase("manual"); SaveGame.erase("auto")
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame

    n.state.coins = 55555
    n.state.codex.append("cx-monsoon")
    var mark_city = n.state.city
    var mark_day = n.state.days_elapsed
    var ok_save = n._save("manual")
    print("SAVE: wrote=%s at %s day %d coins %d" % [ok_save, mark_city, mark_day, n.state.coins])

    # Move on, then load back.
    n.state.coins = 1
    n.state.city = "kinsay"
    n.state.days_elapsed = 999
    n.state.codex.clear()
    var ok_load = n._load("manual")
    await process_frame
    print("LOAD: %s -> %s day %d coins %d codex %d"
        % [ok_load, n.state.city, n.state.days_elapsed, n.state.coins, n.state.codex.size()])

    var ok = ok_save and ok_load and n.state.city == mark_city \
        and n.state.days_elapsed == mark_day and n.state.coins == 55555 \
        and n.state.codex.size() == 1
    # Arrival must remain playable when an existing auto slot is damaged, and
    # the failure must be visible instead of silently promising protection.
    n._save("auto")
    var broken_auto = FileAccess.open(SaveGame.slot_path("auto"), FileAccess.WRITE)
    broken_auto.store_string("{\"broken\":true}")
    broken_auto.close()
    var before_failed_auto = n.state.city
    n._autosave()
    var auto_failure_visible = "自动保存失败" in n._log.text \
        and n.state.city == before_failed_auto
    ok = ok and auto_failure_visible
    print("AUTOSAVE_FAILURE: visible=%s journey_continues=%s" % [
        "自动保存失败" in n._log.text, n.state.city == before_failed_auto])
    print("SAVE: %s" % ("OK" if ok else "FAIL"))
    SaveGame.erase("manual"); SaveGame.erase("auto")
    n.queue_free()
    await process_frame
    quit(0 if ok else 1)
