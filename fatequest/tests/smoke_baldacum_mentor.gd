extends SceneTree

## Baldacum mentor acceptance: the bazi choice enqueues the shared mentor page,
## and the geomancy choice (available both from the bazi mentor event and the
## standalone geomancy mentor event) enqueues the dedicated geomancy page.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Baldacum mentor smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


const Driver = preload("res://tests/story_ui_driver.gd")

func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	n._begin(n.db.get_record("merchant"))
	await process_frame
	n.state.city = "baldacum"
	n.state.coins = 60000
	var ok := true
	var branch_1: bool = await Driver.followup_branch(n, "ev-baldacum-mentor-bazi", 0, "ev-baldacum-mentor-followup", "bazi")
	print("BALDACUM_MENTOR: ev-baldacum-mentor-bazi -> ev-baldacum-mentor-followup: %s" % branch_1)
	ok = branch_1 and ok
	var branch_2: bool = await Driver.followup_branch(n, "ev-baldacum-mentor-bazi", 1, "ev-baldacum-mentor-geomancy-followup", "geomancy")
	print("BALDACUM_MENTOR: ev-baldacum-mentor-bazi -> ev-baldacum-mentor-geomancy-followup: %s" % branch_2)
	ok = branch_2 and ok
	print("BALDACUM_MENTOR: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
