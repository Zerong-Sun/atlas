extends SceneTree
func _init():
    var ok := true
    for p in ["res://tests/test_rng.gd", "res://tests/test_kernel.gd",
              "res://tests/test_divination.gd", "res://tests/test_journey.gd",
              "res://tests/test_m1_lines.gd", "res://tests/test_audio.gd",
              "res://tests/test_motion.gd"]:
        ok = load(p).new().run() and ok
    print("SUITE: ", "PASS" if ok else "FAIL")
    quit(0 if ok else 1)
