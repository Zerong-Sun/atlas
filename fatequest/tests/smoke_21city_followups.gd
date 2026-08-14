extends SceneTree

## P5 21-city site deepening regression. For every deepened site: both authored
## deep-dive choices (index 0 and 1) must open the queued followup and resolve
## back to the city with an empty consequence queue; the instant choice (index 2)
## must resolve without opening it. Hub cities (chamba / badashan / tanpiju)
## exercise both sites.
##
## Every check resets the full mutable world (once_fired, codex, revealed,
## goods, pending queue) so a once-event can never mask a wiring regression.
const _WATCHDOG_SEC := 240.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: 21city followup smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


## (city, site_id, followup_id)
const PAIRS := [
	# B1
	["kerman", "ev-kerman-a", "ev-kerman-a-followup"],
	["camadi", "ev-camadi-a", "ev-camadi-a-followup"],
	["tenduc", "ev-tenduc-a", "ev-tenduc-a-followup"],
	# B2
	["badashan", "ev-badashan-a", "ev-badashan-a-followup"],
	["badashan", "ev-badashan-b", "ev-badashan-b-followup"],
	["camul", "ev-camul-a", "ev-camul-a-followup"],
	["keshimur", "ev-keshimur-a", "ev-keshimur-a-followup"],
	["taican", "ev-taican-a", "ev-taican-a-followup"],
	# B3
	["tanpiju", "ev-tanpiju-a", "ev-tanpiju-a-followup"],
	["tanpiju", "ev-tanpiju-b", "ev-tanpiju-b-followup"],
	["campichu", "ev-campichu-a", "ev-campichu-a-followup"],
	["chinangli", "ev-chinangli-a", "ev-chinangli-a-followup"],
	["kenjanfu", "ev-kenjanfu-a", "ev-kenjanfu-a-followup"],
	["saianfu", "ev-saianfu-a", "ev-saianfu-a-followup"],
	["siju", "ev-siju-a", "ev-siju-a-followup"],
	["sinju", "ev-sinju-a", "ev-sinju-a-followup"],
	["suju", "ev-suju-a", "ev-suju-a-followup"],
	# B4
	["chamba", "ev-chamba-a", "ev-chamba-a-followup"],
	["chamba", "ev-chamba-b", "ev-chamba-b-followup"],
	["aden", "ev-aden-a", "ev-aden-a-followup"],
	["cail", "ev-cail-a", "ev-cail-a-followup"],
	["calatu", "ev-calatu-a", "ev-calatu-a-followup"],
	["esher", "ev-esher-a", "ev-esher-a-followup"],
	["melibar", "ev-melibar-a", "ev-melibar-a-followup"],
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
		var site: Dictionary = n.db.get_record(site_id)
		if site.is_empty():
			failures.append("%s: site record missing" % site_id)
			continue
		# Both authored deep-dive choices must open the same followup.
		for choice_idx in [0, 1]:
			var msg := await _walk_queued(n, city, site, followup_id, choice_idx)
			if not msg.is_empty():
				failures.append(msg)
		# The instant choice must NOT enqueue the followup.
		var instant_msg := await _walk_instant(n, city, site, followup_id)
		if not instant_msg.is_empty():
			failures.append(instant_msg)

	var ok: bool = failures.is_empty()
	print("CITY21_FOLLOWUP: pairs=%d checks=%d %s" % [PAIRS.size(), PAIRS.size() * 3, "OK" if ok else "FAIL"])
	for f in failures:
		printerr("CITY21_FOLLOWUP: %s" % f)
	quit(0 if ok else 1)


## Full world reset: a once site must resolve again on the next check.
func _reset_state(n: Node, city: String) -> void:
	n.state.city = city
	n.state.coins = 60000
	n.state.flags = {}
	n.state.pending_events.clear()
	n.state.active_event = ""
	n.state.once_fired = {}
	n.state.codex.clear()
	n.state.revealed = {}
	n.state.goods = {}


## Choice `choice_idx` must open `followup_id` and resolve back to the city with
## an empty consequence queue. Returns "" or an error message.
func _walk_queued(n: Node, city: String, site: Dictionary, followup_id: String, choice_idx: int) -> String:
	_reset_state(n, city)
	n._show_event(site)
	await process_frame
	var site_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == String(site.get("id", ""))
	n._resolve_choice(site, choice_idx)
	await process_frame
	# Contract (Playtest #5): the choice's authored result page shows first;
	# the followup opens only when the player dismisses it.
	var result_open: bool = n._dialog_layer.visible \
		and n._dialog._title.text == I18n.t("ui.choice_result_title")
	if not result_open:
		return "%s choice %d -> result page did not open (site=%s)" % [String(site.get("id", "")), choice_idx, site_open]
	n._dialog.dismissed.emit()
	await process_frame
	var followup_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == followup_id \
		and not n.state.active_event.is_empty()
	if not followup_open:
		return "%s choice %d -> %s did not open (site=%s)" % [String(site.get("id", "")), choice_idx, followup_id, site_open]
	if not await _resolve_followup(n, followup_id):
		return "%s choice %d -> %s did not resolve back to the city" % [String(site.get("id", "")), choice_idx, followup_id]
	if not n.state.pending_events.is_empty():
		return "%s choice %d -> %s left %d queued events" % [String(site.get("id", "")), choice_idx, followup_id, n.state.pending_events.size()]
	return ""


## Resolve the followup's first choice, dismiss its result page, and verify we
## returned to the city view. Returns true on success.
func _resolve_followup(n: Node, followup_id: String) -> bool:
	n._resolve_choice(n._current_event, 0)
	await process_frame
	if not (n._dialog_layer.visible and n._dialog._title.text == I18n.t("ui.choice_result_title")):
		return false
	n._dialog.dismissed.emit()
	await process_frame
	return not n._dialog_layer.visible and n._city_view.visible


## The instant choice (index 2) must resolve without opening the followup and
## dismiss back to the city. Returns "" or an error message.
func _walk_instant(n: Node, city: String, site: Dictionary, followup_id: String) -> String:
	_reset_state(n, city)
	n._show_event(site)
	await process_frame
	n._resolve_choice(site, 2)
	await process_frame
	if n._dialog_layer.visible and String(n._current_event.get("id", "")) == followup_id:
		return "%s instant choice opened %s" % [String(site.get("id", "")), followup_id]
	if n._dialog_layer.visible and n._dialog._title.text == I18n.t("ui.choice_result_title"):
		n._dialog.dismissed.emit()
		await process_frame
	if not (not n._dialog_layer.visible and n._city_view.visible):
		return "%s instant choice did not return to the city" % String(site.get("id", ""))
	return ""
