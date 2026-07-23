class_name DivinationData
extends RefCounted

## Thin readers over ContentDb tables under content/tables/divination/.

static var _db: ContentDb = null


static func bind(db: ContentDb) -> void:
	_db = db


static func db() -> ContentDb:
	return _db


static func all_cards() -> Array:
	return _db.get_table("tarot_cards") if _db else []


static func get_spread(spread_id: String) -> Dictionary:
	if _db == null:
		return {}
	for s in _db.get_table("tarot_spreads"):
		if String(s.get("id", "")) == spread_id:
			return s
	return {}


static func lot_signs(temple: String = "mixed") -> Array:
	if _db == null:
		return []
	var all: Array = _db.get_table("lot_signs")
	if temple == "" or temple == "mixed":
		return all
	var out: Array = []
	for s in all:
		if String(s.get("temple", "")) == temple:
			out.append(s)
	return out


static func hexagram(index: int) -> Dictionary:
	if _db == null:
		return {}
	var rec: Dictionary = _db.get_record("hex-%d" % index)
	return rec


static func lichun_jdn(year: int) -> int:
	if _db == null:
		return -1
	var rec: Dictionary = _db.get_record("ephem-%d" % year)
	return int(rec.get("lichunJdn", -1))


static func solar_terms() -> Array:
	return _db.get_table("ephemeris_solar_terms") if _db else []


static func result_text_key(method_id: String, idx: int) -> String:
	return "div.%s.result.%02d" % [method_id, idx]
