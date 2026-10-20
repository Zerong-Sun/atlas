extends SceneTree

## Deck path smoke: each deck resolver must return its own face, and missing
## tarot cards must fail closed instead of silently borrowing another card.

var failures: Array[String] = []
var checks := 0


func _init() -> void:
	_check(MapArt.tarot_card("major-0") != null, "Tarot major-0 resolves Fool")
	_check(MapArt.tarot_card("wands-0") != null, "Tarot wands-0 resolves Ace")
	_check(MapArt.tarot_card("wands-13") != null, "Tarot wands-13 resolves King")
	_check(MapArt.tarot_card("swords-0") == null, "Missing sword card fails closed")
	_check(MapArt.tarot_card("major-99") == null, "Invalid tarot id fails closed")

	var lenormand_ok := true
	for i in 36:
		lenormand_ok = lenormand_ok and MapArt.lenormand_card(i) != null
	_check(lenormand_ok, "All 36 Lenormand faces resolve")
	_check(MapArt.lenormand_card(-1) == null and MapArt.lenormand_card(36) == null,
		"Lenormand bounds fail closed")

	var astro_ok := true
	for i in 10:
		astro_ok = astro_ok and MapArt.astrodice_symbol("planet", i) != null
	for i in 12:
		astro_ok = astro_ok and MapArt.astrodice_symbol("sign", i) != null
		astro_ok = astro_ok and MapArt.astrodice_symbol("house", i) != null
	_check(astro_ok, "All 34 Astrodice SVG faces resolve")
	_check(MapArt.astrodice_symbol("planet", 10) == null and MapArt.astrodice_symbol("unknown", 0) == null,
		"Astrodice bounds fail closed")

	var tarot_result := DivinationResultView.symbol_texture({
		"method": "tarot", "raw": {"cards": [{"id": "major-0"}]}})
	_check(tarot_result == MapArt.tarot_card("major-0"), "Tarot result uses authored card face")
	var lenormand_result := DivinationResultView.symbol_texture({
		"method": "lenormand", "raw": {"draws": [0, 35]}})
	_check(lenormand_result == MapArt.lenormand_card(0), "Lenormand result uses first drawn face")
	var astro_result := DivinationResultView.symbol_texture({
		"method": "astrodice", "raw": {"planet": 5, "sign": 2, "house": 3}})
	_check(astro_result == MapArt.astrodice_symbol("planet", 5), "Astrodice result uses planet face")

	for failure in failures:
		printerr("FAIL: " + failure)
	print("DIVINATION_DECKS: %s (%d checks, %d failures)" % [
		"PASS" if failures.is_empty() else "FAIL", checks, failures.size()])
	quit(0 if failures.is_empty() else 1)


func _check(condition: bool, message: String) -> void:
	checks += 1
	if not condition:
		failures.append(message)
