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

    var opening = n.get_node_or_null("BootCenter/BootDesk/OpeningLeaf")
    var intro = n.get_node_or_null("BootCenter/BootDesk/OpeningLeaf/GameIntroduction")
    var verse = n.get_node_or_null("BootCenter/BootDesk/OpeningLeaf/OpeningVerse/OpeningVerseLines")
    var setup = n.get_node_or_null("BootCenter/BootDesk/JourneySetup")
    if opening == null or intro == null or verse == null or setup == null:
        print("BOOT: FAIL (opening leaf incomplete)")
        quit(1)
        return
    if not opening.visible or setup.visible or String(verse.text).count("\n") != 1:
        print("BOOT: FAIL (opening leaf state or verse pair invalid)")
        quit(1)
        return
    n._show_journey_setup()
    if opening.visible or not setup.visible:
        print("BOOT: FAIL (journey setup transition failed)")
        quit(1)
        return

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
