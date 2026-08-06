extends SceneTree

## Acceptance: "到达任意城市，至少直接获得一条前往其它城市的道路".
## A fresh run in a city the character has no road knowledge of (steppe starts
## in Tauris with zero known routes) must still open with at least one known,
## walkable road out — otherwise the roads panel shows "no routes" and the run
## stalls before it begins.

const WATCHDOG := 30.0
var elapsed := 0.0


func _process(delta: float) -> bool:
	elapsed += delta
	if elapsed > WATCHDOG:
		printerr("WATCHDOG")
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch: Dictionary = {}
	for a in n.db.get_table("archetypes"):
		if a.get("id") == "steppe":
			arch = a
			break
	n._begin(arch)
	await process_frame

	var start := String(n.state.city)
	var known: Array = []
	var passable := false
	for r in n.travel.routes_from(start):
		if n.travel.is_route_known(r, n.state):
			known.append(String(r.get("id", "")))
			if n.travel._passable(r, n.state, n.clock.month()):
				passable = true
	var ok := known.size() >= 1 and passable
	print("WAY_OUT_START: start=%s known=%d routes=%s passable=%s"
		% [start, known.size(), str(known), str(passable)])
	print("WAY_OUT_START: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
