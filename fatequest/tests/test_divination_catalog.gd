extends RefCounted

const CatalogCore = preload("res://core/divination/catalog.gd")
var _ok := true


func run() -> bool:
	var catalog = CatalogCore.new()
	catalog.configure([
		{"method": "old", "implementation": "native", "journeyEras": ["era-1292"],
			"playSpaces": ["journey", "annex"], "ritual": {"motion": "flip"}},
		{"method": "new", "implementation": "adapter", "journeyEras": [], "playSpaces": ["annex"],
			"ritual": {"motion": "shuffle"}},
	])
	_check(catalog.available_in_journey("old", "era-1292"), "period method enters its era")
	_check(not catalog.available_in_journey("old", "era-1405"), "era filter is enforced")
	_check(not catalog.available_in_journey("new", "era-1292"), "post-window method stays out of journey")
	_check(catalog.available_in_annex("new"), "post-window method remains playable in annex")
	var merged := catalog.merge_lesson("old", {"method": "old", "type": "throw"})
	_check(merged.get("ritual", {}).get("motion") == "flip", "catalog ritual decorates lesson")
	print("test_divination_catalog: ", "PASS" if _ok else "FAIL")
	return _ok


func _check(value: bool, label: String) -> void:
	if not value:
		_ok = false
		push_error("FAIL: " + label)
