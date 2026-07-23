class_name ContentDb
extends RefCounted

## Loads content/tables/**.json into memory. Content is data (ARCHITECTURE D7);
## nothing here knows what a city or an event MEANS, only how to find one.

var tables: Dictionary = {}          ## table name -> Array of records
var by_id: Dictionary = {}           ## id -> record (global, ids are unique)


func load_all(root: String = "res://content/tables") -> int:
	tables.clear()
	by_id.clear()
	_walk(root)
	return by_id.size()


func _walk(dir_path: String) -> void:
	var d := DirAccess.open(dir_path)
	if d == null:
		push_error("ContentDb: cannot open " + dir_path)
		return
	d.list_dir_begin()
	var name := d.get_next()
	while name != "":
		var p := dir_path + "/" + name
		if d.current_is_dir():
			if not name.begins_with("."):
				_walk(p)
		elif name.ends_with(".json"):
			_load_file(p)
		name = d.get_next()
	d.list_dir_end()


func _load_file(path: String) -> void:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("ContentDb: cannot read " + path)
		return
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) != TYPE_DICTIONARY or not doc.has("table"):
		push_error("ContentDb: malformed table file " + path)
		return
	var t: String = doc["table"]
	if not tables.has(t):
		tables[t] = []
	for r in doc.get("records", []):
		var rec: Dictionary = _normalize(r)
		tables[t].append(rec)
		if rec.has("id"):
			by_id[rec["id"]] = rec


## Godot's JSON parser returns EVERY number as a float, and Array.has() /
## `in` compare variants strictly — so `4 in [1.0, 2.0, 3.0, 4.0]` is FALSE.
## That silently breaks every numeric comparison against content: season
## windows never open, `years` conditions never match, and nothing errors.
##
## Normalising integral floats to ints once, here at the boundary, fixes the
## whole class. The alternative — casting at each comparison site — is a bug
## waiting to be reintroduced by the next person who writes `month in open`.
static func _normalize(v: Variant) -> Variant:
	match typeof(v):
		TYPE_FLOAT:
			return int(v) if v == floor(v) and absf(v) < 9007199254740992.0 else v
		TYPE_ARRAY:
			var out := []
			for x in v:
				out.append(_normalize(x))
			return out
		TYPE_DICTIONARY:
			var d := {}
			for k in v:
				d[k] = _normalize(v[k])
			return d
	return v


func get_table(t: String) -> Array:
	return tables.get(t, [])


func get_record(rid: String) -> Dictionary:
	return by_id.get(rid, {})


func cities() -> Array:
	return get_table("cities")
