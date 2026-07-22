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
		tables[t].append(r)
		if r.has("id"):
			by_id[r["id"]] = r


func get_table(t: String) -> Array:
	return tables.get(t, [])


func get_record(rid: String) -> Dictionary:
	return by_id.get(rid, {})


func cities() -> Array:
	return get_table("cities")
