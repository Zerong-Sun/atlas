extends SceneTree
const _W := 90.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _W: printerr("WATCHDOG"); quit(1)
    return false
func _init():
    var n = load("res://game/screens/main.tscn").instantiate()
    root.add_child(n)
    await process_frame
    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame
    n.state.codex.assign(["cx-balc", "cx-monsoon"])
    n.state.stickers.assign(["st-zayton-haven"])
    n._open_codex()
    await process_frame
    var rows = n._codex_view._list.get_child_count()
    var detail = n._codex_view._detail.get_child_count()
    print("CODEX: list rows=%d  detail blocks=%d" % [rows, detail])
    # switching tabs must not break
    n._codex_view._switch("sticker")
    await process_frame
    print("CODEX: sticker rows=%d" % n._codex_view._list.get_child_count())
    var ok = rows > 2 and detail > 0
    print("CODEX: %s" % ("OK" if ok else "FAIL"))
    quit(0 if ok else 1)
