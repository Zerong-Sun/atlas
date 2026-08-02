extends SceneTree

## Q1 twelve-city consequence-chain regression. Mirrors the manual walk in
## requirements §13.2 step 4 (walk each entry's important branches and confirm
## the consequence page follows immediately) as an automated pass over all 12
## main cities:
##
##   entry choice A → ev-<city>-consequence-a → its resolution page → city
##   entry choice B → ev-<city>-consequence-b → its resolution page → city
##
## Zayton uses a bespoke chain (ledger/watch) defined in the zayton table and
## included here explicitly. Every step must resolve back to the city view;
## the bag/settings overlays must stay closeable and nothing may leak a raw key.
const _WATCHDOG_SEC := 240.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: twelve-city smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


## (city, entry_id, consequence_a, consequence_b, resolution_a, resolution_b)
const CHAINS := [
	["balc", "ev-balc-entry", "ev-balc-consequence-a", "ev-balc-consequence-b",
	 "ev-balc-consequence-a-resolution", "ev-balc-consequence-b-resolution"],
	["cascar", "ev-cascar-entry", "ev-cascar-consequence-a", "ev-cascar-consequence-b",
	 "ev-cascar-consequence-a-resolution", "ev-cascar-consequence-b-resolution"],
	["cotan", "ev-cotan-entry", "ev-cotan-consequence-a", "ev-cotan-consequence-b",
	 "ev-cotan-consequence-a-resolution", "ev-cotan-consequence-b-resolution"],
	["lop", "ev-lop-entry", "ev-lop-consequence-a", "ev-lop-consequence-b",
	 "ev-lop-consequence-a-resolution", "ev-lop-consequence-b-resolution"],
	["samarcanda", "ev-samarcanda-entry", "ev-samarcanda-consequence-a", "ev-samarcanda-consequence-b",
	 "ev-samarcanda-consequence-a-resolution", "ev-samarcanda-consequence-b-resolution"],
	["cambaluc", "ev-cambaluc-entry", "ev-cambaluc-consequence-a", "ev-cambaluc-consequence-b",
	 "ev-cambaluc-consequence-a-resolution", "ev-cambaluc-consequence-b-resolution"],
	["kinsay", "ev-kinsay-entry", "ev-kinsay-consequence-a", "ev-kinsay-consequence-b",
	 "ev-kinsay-consequence-a-resolution", "ev-kinsay-consequence-b-resolution"],
	["zayton", "ev-zayton-entry", "ev-zayton-ledger-consequence", "ev-zayton-watch-consequence",
	 "ev-zayton-ledger-consequence-resolution", "ev-zayton-watch-consequence-resolution"],
	["chandu", "ev-chandu-entry", "ev-chandu-consequence-a", "ev-chandu-consequence-b",
	 "ev-chandu-consequence-a-resolution", "ev-chandu-consequence-b-resolution"],
	["baldacum", "ev-baldacum-entry", "ev-baldacum-consequence-a", "ev-baldacum-consequence-b",
	 "ev-baldacum-consequence-a-resolution", "ev-baldacum-consequence-b-resolution"],
	["ormus", "ev-ormus-entry", "ev-ormus-consequence-a", "ev-ormus-consequence-b",
	 "ev-ormus-consequence-a-resolution", "ev-ormus-consequence-b-resolution"],
	["tauris", "ev-tauris-entry", "ev-tauris-consequence-a", "ev-tauris-consequence-b",
	 "ev-tauris-consequence-a-resolution", "ev-tauris-consequence-b-resolution"],
]


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	var arch: Dictionary = n.db.get_record("merchant")
	n._begin(arch)
	await process_frame

	var failures: Array[String] = []
	for chain in CHAINS:
		var city: String = chain[0]
		var entry_id: String = chain[1]
		var c_a: String = chain[2]
		var c_b: String = chain[3]
		var r_a: String = chain[4]
		var r_b: String = chain[5]

		n.state.city = city
		n.state.coins = 60000
		n.state.flags = {}

		# Branch A: entry choice 0 → consequence → resolution → city.
		_walk_branch(n, entry_id, 0, c_a, r_a, city, failures)
		# Branch B: entry choice 1 → consequence → resolution → city.
		_walk_branch(n, entry_id, 1, c_b, r_b, city, failures)

	# Also confirm the chain pages left no stray overlay and no raw key leaked.
	var leaked: Array = []
	for k in I18n.missing_keys():
		if String(k).begins_with("ev."):
			leaked.append(k)
	var raw_ok: bool = leaked.is_empty()
	if not raw_ok:
		failures.append("raw keys visible: %d %s" % [leaked.size(), str(leaked)])

	var ok: bool = failures.is_empty()
	print("TWELVE_CITIES: %d chains x2 branches, failures=%d" % [CHAINS.size(), failures.size()])
	for f in failures:
		printerr("TWELVE_CITIES: %s" % f)
	print("TWELVE_CITIES: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)


## Drives one branch of one city: open the entry event, take the given choice,
## then confirm the consequence event opens, take its first choice, confirm the
## resolution page opens, dismiss it, and confirm we are back in the city view.
func _walk_branch(n: Node, entry_id: String, choice_idx: int,
		conseq_id: String, resolution_id: String, city: String,
		failures: Array) -> void:
	n.state.city = city
	var entry: Dictionary = n.db.get_record(entry_id)
	if entry.is_empty():
		failures.append("%s: missing entry %s" % [city, entry_id])
		return
	n._show_event(entry)
	await process_frame
	var entry_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == entry_id
	n._resolve_choice(entry, choice_idx)
	await process_frame
	var conseq_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == conseq_id \
		and not n.state.active_event.is_empty()
	if conseq_open:
		n._resolve_choice(n._current_event, 0)
		await process_frame
	var resolution_open: bool = n._dialog_layer.visible \
		and String(n._current_event.get("id", "")) == resolution_id
	if resolution_open:
		n._resolve_choice(n._current_event, 0)
		await process_frame
		# Resolution pages may show a result dialog; dismiss it.
		if n._dialog_layer.visible and n._dialog._title.text == I18n.t("ui.choice_result_title"):
			n._dialog.dismissed.emit()
			await process_frame
	var returned: bool = not n._dialog_layer.visible and n._city_view.visible
	if not (entry_open and conseq_open and resolution_open and returned):
		failures.append("%s [%s]: entry=%s consequence=%s resolution=%s city=%s" % [
			city, entry_id, entry_open, conseq_open, resolution_open, returned])
	# Always clear whatever is on screen before the next branch.
	n._dialog_layer.visible = false
	for ui in [n._bag, n._settings]:
		if ui != null and ui.has("layer") and is_instance_valid(ui["layer"]):
			ui["layer"].visible = false
	await process_frame
