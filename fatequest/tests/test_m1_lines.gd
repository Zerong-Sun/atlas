extends RefCounted

## M1 acceptance (GDD §16): the three character lines can be walked END TO END.
##
## This is deliberately NOT the same check as gate G13. G13 asserts a path
## exists in the route graph — a graph-theoretic property. M1 claims a PLAYER
## can walk it, which additionally requires: affordable fares the whole way,
## an open season at each leg, satisfied unlock conditions, and a mode the
## traveller can actually use. A world can pass G13 and still be unplayable.
##
## So this simulates an actual traveller: real archetype, real purse, real
## clock, greedy-but-legal route choice, and it fails if the journey stalls.

const MAX_LEGS := 80

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()

	var lines := [
		{"arch": "polo", "from": "tauris", "to": "cambaluc", "ship_only": false},
		{"arch": "steppe", "from": "tauris", "to": "chandu", "ship_only": false},
		{"arch": "merchant", "from": "ormus", "to": "zayton", "ship_only": true},
	]

	for line in lines:
		var arch: Dictionary = {}
		for a in db.get_table("archetypes"):
			if a.get("id") == line["arch"]:
				arch = a
		_ok(not arch.is_empty(), "archetype %s exists" % line["arch"])
		if arch.is_empty():
			continue
		_ok(arch.get("start") == line["from"],
			"%s starts at %s" % [line["arch"], line["from"]])
		_walk(db, arch, line)

	print("test_m1_lines: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0


func _walk(db: ContentDb, arch: Dictionary, line: Dictionary) -> void:
	var exec := EffectExecutor.new()
	var travel := Travel.new(db, exec)
	var rng := Rng.new("m1:%s" % line["arch"])

	var st := WorldState.new()
	st.seed = "m1:%s" % line["arch"]
	st.city = String(line["from"])
	st.coins = int(arch.get("startKit", {}).get("coins", 500000))
	var clock := WorldClock.new(GameDate.from_gregorian(1292, 4, 11).jdn)
	st.jdn = clock.date.jdn

	# Plan first, then walk. An earlier version steered greedily toward the
	# goal's bearing and failed the maritime line — the monsoon circuit runs
	# SOUTH-WEST down Arabia before it turns east, so a walker that only
	# accepts distance-reducing legs can never take the first one. That was a
	# defect in the test, not in the world: a real traveller has a route in
	# mind, not just a compass.
	var plan := _cheapest_path(db, travel, String(line["from"]), String(line["to"]), line["ship_only"])
	_ok(not plan.is_empty(), "line %s: a fare-payable route exists" % line["arch"])
	if plan.is_empty():
		return

	var legs := 0
	var stalled_reason := ""

	for step in plan:
		var r: Dictionary = step["route"]
		var m: String = step["mode"]
		var av := travel.availability(r, st, clock.month(), m)
		if not av["ok"]:
			# Season is the one constraint a traveller answers by waiting.
			var waited := 0
			while not av["ok"] and "travel.closed_season" in av["reasons"] and waited < 6:
				st.jdn += 30
				st.days_elapsed += 30
				clock = WorldClock.new(st.jdn)
				waited += 1
				av = travel.availability(r, st, clock.month(), m)
			if not av["ok"]:
				stalled_reason = "leg %s->%s by %s in month %d (coins %d): %s" % [
					st.city, travel.other_end(r, st.city), m, clock.month(), st.coins,
					", ".join(PackedStringArray(av["reasons"]))]
				break
		var trip := travel.depart(r, m, st, rng)
		clock = WorldClock.new(st.jdn)
		legs += 1

	var arrived := st.city == String(line["to"])
	_ok(arrived, "line %s: %s -> %s walkable end to end%s" % [
		line["arch"], line["from"], line["to"],
		"" if arrived else "  [stalled at %s after %d legs: %s]" % [st.city, legs, stalled_reason]])

	if arrived:
		var years := float(st.days_elapsed) / 365.0
		print("    %-9s %2d legs · %4d days (%.1f yr) · %d coins left" % [
			line["arch"], legs, st.days_elapsed, years, st.coins / 100])
		# A line nobody can afford is not walkable in any useful sense.
		_ok(st.coins >= 0, "line %s: purse never went negative" % line["arch"])


func _dist(a: Array, b: Array) -> float:
	var dx := float(a[0]) - float(b[0])
	var dy := float(a[1]) - float(b[1])
	return sqrt(dx * dx + dy * dy) * 111.0


## Dijkstra over fare. Returns [{route, mode}, ...] from `from` to `to`.
func _cheapest_path(db: ContentDb, travel: Travel, from: String, to: String, ship_only: bool) -> Array:
	var dist := {from: 0}
	var prev := {}
	var frontier := [from]
	while not frontier.is_empty():
		# Small graph; a linear scan is clearer than a heap and fast enough.
		var best_i := 0
		for i in frontier.size():
			if int(dist.get(frontier[i], 1 << 40)) < int(dist.get(frontier[best_i], 1 << 40)):
				best_i = i
		var node: String = frontier[best_i]
		frontier.remove_at(best_i)
		if node == to:
			break
		for r in travel.routes_from(node):
			var nxt := travel.other_end(r, node)
			for mode in r.get("modes", []):
				var m := String(mode)
				if ship_only and m != "ship":
					continue
				var fare := travel.total_cost(r, m)
				var nd := int(dist.get(node, 0)) + fare
				if nd < int(dist.get(nxt, 1 << 40)):
					dist[nxt] = nd
					prev[nxt] = {"from": node, "route": r, "mode": m}
					if nxt not in frontier:
						frontier.append(nxt)
	if not prev.has(to) and from != to:
		return []
	var out: Array = []
	var cur := to
	while prev.has(cur):
		var step: Dictionary = prev[cur]
		out.push_front(step)
		cur = String(step["from"])
	return out
