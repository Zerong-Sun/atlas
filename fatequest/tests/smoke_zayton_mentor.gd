extends SceneTree

## Zayton mentor acceptance: both learn choices (lot and jiaobei) must enqueue
## their own consequence page, and each follow-up must resolve before the player
## returns to city exploration. The lot branch reuses the shared mentor page
## while the jiaobei branch opens a dedicated page.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Zayton mentor smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


const Driver = preload("res://tests/story_ui_driver.gd")

func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	n._begin(n.db.get_record("merchant"))
	await process_frame
	n.state.city = "zayton"
	n.state.coins = 60000
	var ok := true
	var branch_1: bool = await Driver.followup_branch(n, "ev-zayton-mentor", 0, "ev-zayton-mentor-followup", "lot")
	print("ZAYTON_MENTOR: ev-zayton-mentor -> ev-zayton-mentor-followup: %s" % branch_1)
	ok = branch_1 and ok
	var branch_2: bool = await Driver.followup_branch(n, "ev-zayton-mentor", 1, "ev-zayton-mentor-jiaobei-followup", "jiaobei")
	print("ZAYTON_MENTOR: ev-zayton-mentor -> ev-zayton-mentor-jiaobei-followup: %s" % branch_2)
	ok = branch_2 and ok
	print("ZAYTON_MENTOR: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
