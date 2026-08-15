extends SceneTree

## P6 town/station site deepening regression. For every deepened site: both
## authored deep-dive choices (index 0 and 1) must open the queued followup and
## resolve back to the city with an empty consequence queue; the instant choice
## (index 2) must resolve without opening it. Same contract as
## smoke_21city_followups.gd, applied to the 61 town/station cities that were
## entry-only before P6.
##
## Every check resets the full mutable world (once_fired, codex, revealed,
## goods, pending queue) so a once-event can never mask a wiring regression.
const _WATCHDOG_SEC := 240.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: town/station followup smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


## (city, site_id, followup_id)
const PAIRS := [
	["charchan", "ev-charchan-a", "ev-charchan-a-followup"],
	["samara", "ev-samara-a", "ev-samara-a-followup"],
	["cacanfu", "ev-cacanfu-a", "ev-cacanfu-a-followup"],
	["cachanfu", "ev-cachanfu-a", "ev-cachanfu-a-followup"],
	["caiju", "ev-caiju-a", "ev-caiju-a-followup"],
	["chinghianfu", "ev-chinghianfu-a", "ev-chinghianfu-a-followup"],
	["chinginju", "ev-chinginju-a", "ev-chinginju-a-followup"],
	["coigangiu", "ev-coigangiu-a", "ev-coigangiu-a-followup"],
	["coiganju", "ev-coiganju-a", "ev-coiganju-a-followup"],
	["etzina", "ev-etzina-a", "ev-etzina-a-followup"],
	["fuju", "ev-fuju-a", "ev-fuju-a-followup"],
	["linju", "ev-linju-a", "ev-linju-a-followup"],
	["mien", "ev-mien-a", "ev-mien-a-followup"],
	["nanghin", "ev-nanghin-a", "ev-nanghin-a-followup"],
	["paukin", "ev-paukin-a", "ev-paukin-a-followup"],
	["sindafu", "ev-sindafu-a", "ev-sindafu-a-followup"],
	["sinjumatu", "ev-sinjumatu-a", "ev-sinjumatu-a-followup"],
	["tiju", "ev-tiju-a", "ev-tiju-a-followup"],
	["cabul", "ev-cabul-a", "ev-cabul-a-followup"],
	["merva", "ev-merva-a", "ev-merva-a-followup"],
	["pein", "ev-pein-a", "ev-pein-a-followup"],
	["sachiu", "ev-sachiu-a", "ev-sachiu-a-followup"],
	["sapurgan", "ev-sapurgan-a", "ev-sapurgan-a-followup"],
	["yarcan", "ev-yarcan-a", "ev-yarcan-a-followup"],
	["axuma", "ev-axuma-a", "ev-axuma-a-followup"],
	["cambaet", "ev-cambaet-a", "ev-cambaet-a-followup"],
	["coilum", "ev-coilum-a", "ev-coilum-a-followup"],
	["dongola", "ev-dongola-a", "ev-dongola-a-followup"],
	["dufar", "ev-dufar-a", "ev-dufar-a-followup"],
	["maabar", "ev-maabar-a", "ev-maabar-a-followup"],
	["mecha", "ev-mecha-a", "ev-mecha-a-followup"],
	["medina", "ev-medina-a", "ev-medina-a-followup"],
	["semenat", "ev-semenat-a", "ev-semenat-a-followup"],
	["tana", "ev-tana-a", "ev-tana-a-followup"],
	["antiochia", "ev-antiochia-a", "ev-antiochia-a-followup"],
	["babylonia-cairus", "ev-babylonia-cairus-a", "ev-babylonia-cairus-a-followup"],
	["basora", "ev-basora-a", "ev-basora-a-followup"],
	["berrhoea", "ev-berrhoea-a", "ev-berrhoea-a-followup"],
	["bethleem", "ev-bethleem-a", "ev-bethleem-a-followup"],
	["cobinan", "ev-cobinan-a", "ev-cobinan-a-followup"],
	["constantinopolis", "ev-constantinopolis-a", "ev-constantinopolis-a-followup"],
	["ctesiphon", "ev-ctesiphon-a", "ev-ctesiphon-a-followup"],
	["damascus", "ev-damascus-a", "ev-damascus-a-followup"],
	["edessa", "ev-edessa-a", "ev-edessa-a-followup"],
	["ephesus", "ev-ephesus-a", "ev-ephesus-a-followup"],
	["hierusalem", "ev-hierusalem-a", "ev-hierusalem-a-followup"],
	["ispahan", "ev-ispahan-a", "ev-ispahan-a-followup"],
	["moscovia", "ev-moscovia-a", "ev-moscovia-a-followup"],
	["nicaea", "ev-nicaea-a", "ev-nicaea-a-followup"],
	["ninive", "ev-ninive-a", "ev-ninive-a-followup"],
	["novogardia", "ev-novogardia-a", "ev-novogardia-a-followup"],
	["petra", "ev-petra-a", "ev-petra-a-followup"],
	["smyrna", "ev-smyrna-a", "ev-smyrna-a-followup"],
	["tana-azov", "ev-tana-azov-a", "ev-tana-azov-a-followup"],
	["tarsus", "ev-tarsus-a", "ev-tarsus-a-followup"],
	["trapezus", "ev-trapezus-a", "ev-trapezus-a-followup"],
	["tripolis", "ev-tripolis-a", "ev-tripolis-a-followup"],
	["tyrus", "ev-tyrus-a", "ev-tyrus-a-followup"],
	["pentam", "ev-pentam-a", "ev-pentam-a-followup"],
	["caracoron", "ev-caracoron-a", "ev-caracoron-a-followup"],
	["egrigaia", "ev-egrigaia-a", "ev-egrigaia-a-followup"],
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
	print("TS_FOLLOWUP: pairs=%d checks=%d %s" % [PAIRS.size(), PAIRS.size() * 3, "OK" if ok else "FAIL"])
	for f in failures:
		printerr("TS_FOLLOWUP: %s" % f)
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
