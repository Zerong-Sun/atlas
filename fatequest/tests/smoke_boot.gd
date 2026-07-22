extends SceneTree
# Headless boot smoke: instantiate the real main scene, let _ready run, then
# drive the "set out" transition and a city click without a window.
func _init():
    var scn = load("res://game/screens/main.tscn")
    if scn == null: print("BOOT: FAIL (scene did not load)"); quit(1); return
    var n = scn.instantiate()
    root.add_child(n)
    await process_frame
    n._enter_map()
    await process_frame
    var cities = n.db.cities()
    var lop
    for c in cities: if c.get("id") == "lop": lop = c
    n._on_city(lop)
    print("BOOT: map nodes=%d  info=%s" % [cities.size(), n._info.text.replace("\n"," / ")])
    print("BOOT: OK")
    quit(0)
