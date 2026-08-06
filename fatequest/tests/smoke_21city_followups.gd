extends SceneTree

## P5 21-city site deepening regression. For each city-tier node that has a
## deepened site, walk site → queued followup → resolve → return to city.
## Hub cities (chamba / badashan / tanpiju) exercise both sites.
const _WATCHDOG_SEC := 240.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: 21city followup smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


## (city, site_id, followup_id, choice_idx_on_site)
const PAIRS := [
	# B1
	["kerman", "ev-kerman-a", "ev-kerman-a-followup", 0],
	["camadi", "ev-camadi-a", "ev-camadi-a-followup", 0],
	["tenduc", "ev-tenduc-a", "ev-tenduc-a-followup", 0],
	# B2
	["badashan", "ev-badashan-a", "ev-badashan-a-followup", 0],
	["badashan", "ev-badashan-b", "ev-badashan-b-followup", 0],
	["camul", "ev-camul-a", "ev-camul-a-followup", 0],
	["keshimur", "ev-keshimur-a", "ev-keshimur-a-followup", 0],
	["taican", "ev-taican-a", "ev-taican-a-followup", 0],
	# B3
	["tanpiju", "ev-tanpiju-a", "ev-tanpiju-a-followup", 0],
	["tanpiju", "ev-tanpiju-b", "ev-tanpiju-b-followup", 0],
	["campichu", "ev-campichu-a", "ev-campichu-a-followup", 0],
	["chinangli", "ev-chinangli-a", "ev-chinangli-a-followup", 0],
	["kenjanfu", "ev-kenjanfu-a", "ev-kenjanfu-a-followup", 0],
	["saianfu", "ev-saianfu-a", "ev-saianfu-a-followup", 0],
	["siju", "ev-siju-a", "ev-siju-a-followup", 0],
	["sinju", "ev-sinju-a", "ev-sinju-a-followup", 0],
	["suju", "ev-suju-a", "ev-suju-a-followup", 0],
	# B4
	["chamba", "ev-chamba-a", "ev-chamba-a-followup", 0],
	["chamba", "ev-chamba-b", "ev-chamba-b-followup", 0],
	["aden", "ev-aden-a", "ev-aden-a-followup", 0],
	["cail", "ev-cail-a", "ev-cail-a-followup", 0],
	["calatu", "ev-calatu-a", "ev-calatu-a-followup", 0],
	["esher", "ev-esher-a", "ev-esher-a-followup", 0],
	["melibar", "ev-melibar-a", "ev-melibar-a-followup", 0],
]


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	var failures: Array[String] = []
	for pair in PAIRS:
		var city: String = pair[0]
		var site_id: String = pair[1]
		var followup_id: String = pair[2]
		var choice_idx: int = pair[3]
		n.state.city = city
		n.state.coins = 60000
		n.state.flags = {}
		n.state.pending_events.clear()
		n.state.active_event = ""

		var site: Dictionary = n.db.get_record(site_id)
		if site.is_empty():
			failures.append("%s: site record missing" % site_id)
			continue
		n._show_event(site)
		await process_frame
		var site_open: bool = n._dialog_layer.visible \
			and String(n._current_event.get("id", "")) == site_id
		n._resolve_choice(site, choice_idx)
		await process_frame
		var followup_open: bool = n._dialog_layer.visible \
			and String(n._current_event.get("id", "")) == followup_id \
			and not n.state.active_event.is_empty()
		if followup_open:
			n._resolve_choice(n._current_event, 0)
			await process_frame
			if n._dialog_layer.visible and n._dialog._title.text == I18n.t("ui.choice_result_title"):
				n._dialog.dismissed.emit()
				await process_frame
		var returned: bool = not n._dialog_layer.visible and n._city_view.visible
		if not (site_open and followup_open and returned):
			failures.append("%s -> %s (site=%s followup=%s city=%s)" % [
				site_id, followup_id, site_open, followup_open, returned])

	var ok: bool = failures.is_empty()
	print("CITY21_FOLLOWUP: pairs=%d %s" % [PAIRS.size(), "OK" if ok else "FAIL"])
	for f in failures:
		printerr("CITY21_FOLLOWUP: %s" % f)
	quit(0 if ok else 1)
