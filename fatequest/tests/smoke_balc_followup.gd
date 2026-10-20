extends SceneTree

## Balc site/multi-round acceptance: the first and second choices of each
## Balc site open an authored follow-up page, and each follow-up resolves back
## to city exploration. Guards the T1 multi-round wiring for the first city.
const _WATCHDOG_SEC := 90.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: Balc followup smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


const Driver = preload("res://tests/story_ui_driver.gd")

func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	n._begin(n.db.get_record("merchant"))
	await process_frame
	n.state.city = "balc"
	n.state.coins = 60000
	var ok := true
	var branch_1: bool = await Driver.followup_branch(n, "ev-balc-a", 0, "ev-balc-a-followup", "")
	print("BALC_FOLLOWUP: ev-balc-a -> ev-balc-a-followup: %s" % branch_1)
	ok = branch_1 and ok
	var branch_2: bool = await Driver.followup_branch(n, "ev-balc-b", 2, "ev-balc-b-followup", "")
	print("BALC_FOLLOWUP: ev-balc-b -> ev-balc-b-followup: %s" % branch_2)
	ok = branch_2 and ok
	var branch_3: bool = await Driver.followup_branch(n, "ev-balc-c", 1, "ev-balc-c-followup", "")
	print("BALC_FOLLOWUP: ev-balc-c -> ev-balc-c-followup: %s" % branch_3)
	ok = branch_3 and ok
	var branch_4: bool = await Driver.followup_branch(n, "ev-balc-mentor", 1, "ev-balc-mentor-followup", "")
	print("BALC_FOLLOWUP: ev-balc-mentor -> ev-balc-mentor-followup: %s" % branch_4)
	ok = branch_4 and ok
	print("BALC_FOLLOWUP: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
