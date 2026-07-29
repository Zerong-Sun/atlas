extends SceneTree

## A script error leaves the SceneTree spinning rather than exiting, so a broken
## test looks identical to a slow one. Fail loudly instead.
const _WATCHDOG_SEC := 180.0
var _t := 0.0
func _process(d: float) -> bool:
    _t += d
    if _t > _WATCHDOG_SEC:
        printerr("WATCHDOG: suite exceeded %d s" % int(_WATCHDOG_SEC))
        quit(1)
    return false

func _init():
    var ok := true
    for p in ["res://tests/test_rng.gd", "res://tests/test_kernel.gd",
              "res://tests/test_divination.gd", "res://tests/test_divination_reach.gd",
              "res://tests/test_lesson_engine.gd",
              "res://tests/test_i18n.gd", "res://tests/test_narrative.gd", "res://tests/test_time.gd",
              "res://tests/test_journey.gd",
              "res://tests/test_m1_lines.gd", "res://tests/test_audio.gd",
              "res://tests/test_motion.gd", "res://tests/test_market.gd", "res://tests/test_save.gd", "res://tests/test_retainer.gd",
              "res://tests/test_ending.gd"]:
        ok = load(p).new().run() and ok
    print("SUITE: ", "PASS" if ok else "FAIL")
    quit(0 if ok else 1)
