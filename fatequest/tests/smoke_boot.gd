extends SceneTree

## Boot smoke: the real main scene loads, content is present, and an archetype
## start puts the player somewhere valid. Kept separate from smoke_play so a
## boot regression is distinguishable from a gameplay one.

func _init():
    var scn = load("res://game/screens/main.tscn")
    if scn == null:
        print("BOOT: FAIL (scene did not load)")
        quit(1)
        return
    var n = scn.instantiate()
    root.add_child(n)
    await process_frame

    var cities = n.db.cities()
    var routes = n.db.get_table("routes")
    if cities.is_empty() or routes.is_empty():
        print("BOOT: FAIL (content missing)")
        quit(1)
        return

    var arch
    for a in n.db.get_table("archetypes"):
        if a.get("id") == "polo": arch = a
    n._begin(arch)
    await process_frame

    print("BOOT: cities=%d routes=%d events=%d | start=%s day=%d"
        % [cities.size(), routes.size(), n.db.get_table("events").size(),
           n.state.city, n.clock.year()])
    print("BOOT: OK")
    quit(0)
