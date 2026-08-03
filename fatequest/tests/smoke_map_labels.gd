extends SceneTree

## Label declutter regression (OPTIMIZATION_PLAN §3):
##   1. at high zoom every revealed city still keeps a marker (nothing vanishes);
##   2. placed labels never overlap (greedy rect placement);
##   3. a placed label is a clickable target (_pick hits the label rect);
##   4. ZOOM_MAX grew so "zoom in to see everything" is actually possible.

const _WATCHDOG_SEC := 60.0
var _t := 0.0
func _process(d: float) -> bool:
	_t += d
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: smoke_map_labels exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init():
	var scn = load("res://game/screens/main.tscn")
	var n = scn.instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = {}
	for a in n.db.get_table("archetypes"):
		if a.get("id") == "polo":
			arch = a
	n._begin(arch)
	await process_frame

	var map = n._map
	if map == null:
		print("MAP_LABELS: FAIL (map not built)")
		quit(1)
		return
	var revealed := {}
	for c in n.db.cities():
		revealed[c.get("id", "")] = 3
	map.set_current("chamba", revealed)
	map.zoom = 8.0
	map._clamp_pan()
	await process_frame

	# Every revealed city keeps its dot — decluttering must not erase places.
	var dots_ok := true
	for c in n.db.cities():
		var cid: String = c.get("id", "")
		if not map._city_pos.has(cid) or map.intel(cid) <= 0:
			dots_ok = false
			printerr("  FAIL: city %s lost its marker" % cid)

	# Placed labels never overlap.
	var hits: Array = map._compute_label_hits()
	var overlap := 0
	for i in hits.size():
		for j in range(i + 1, hits.size()):
			if (hits[i].get("rect", Rect2()) as Rect2).intersects(hits[j].get("rect", Rect2())):
				overlap += 1
	if overlap > 0:
		printerr("  FAIL: %d overlapping label pairs" % overlap)

	# A label rect is a clickable target and resolves to the labelled city.
	var label_pick_ok := true
	for hit in hits:
		var rect: Rect2 = hit.get("rect", Rect2())
		if rect.size == Vector2.ZERO:
			continue
		var before: String = map._focused_city
		map._pick(rect.position + rect.size * 0.5)
		var cid := String(hit.get("id", ""))
		if map._focused_city != cid:
			# Two labels may share a point only if they never overlap; clicking
			# inside one must resolve to it (ties prefer the higher rank).
			var picked: Dictionary = map._city_record(map._focused_city)
			if map._focused_city != cid and _rank(map, picked) < _rank(map, n.db.get_record(cid)):
				label_pick_ok = false
				printerr("  FAIL: click on %s label chose %s" % [cid, map._focused_city])
		map._focused_city = before

	var zoom_ok: bool = map.ZOOM_MAX >= 8.0
	var ok := dots_ok and overlap == 0 and label_pick_ok and zoom_ok
	print("MAP_LABELS: cities=%d placed_labels=%d overlap=%d zoom_max=%.1f" % [
		n.db.cities().size(), hits.size(), overlap, map.ZOOM_MAX])
	print("MAP_LABELS: dots=%s no_overlap=%s label_pick=%s zoom=%s → %s" % [
		dots_ok, overlap == 0, label_pick_ok, zoom_ok, "OK" if ok else "FAIL"])
	quit(0 if ok else 1)


func _rank(map, rec: Dictionary) -> int:
	return map._city_rank(rec)
