extends SceneTree
func _init():
    var ok := true
    for p in ["res://tests/test_rng.gd", "res://tests/test_kernel.gd", "res://tests/test_divination.gd"]:
        ok = load(p).new().run() and ok
    print("SUITE: ", "PASS" if ok else "FAIL")
    quit(0 if ok else 1)
