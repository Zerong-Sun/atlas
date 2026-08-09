class_name DivinationCatalog
extends RefCounted

## Historical availability and presentation metadata for every method.

var _by_method: Dictionary = {}


func configure(records: Array) -> void:
	_by_method.clear()
	for record in records:
		if record is Dictionary:
			var method := String(record.get("method", ""))
			if not method.is_empty():
				_by_method[method] = record


func get_entry(method: String) -> Dictionary:
	return _by_method.get(method, {})


func available_in_journey(method: String, era_id: String) -> bool:
	var entry := get_entry(method)
	return not entry.is_empty() \
		and "journey" in entry.get("playSpaces", []) \
		and era_id in entry.get("journeyEras", [])


func available_in_annex(method: String) -> bool:
	var entry := get_entry(method)
	return not entry.is_empty() and "annex" in entry.get("playSpaces", [])


func merge_lesson(method: String, lesson: Dictionary) -> Dictionary:
	var merged := lesson.duplicate(true)
	var entry := get_entry(method)
	if not entry.is_empty():
		merged["ritual"] = entry.get("ritual", {}).duplicate(true)
		merged["historicity"] = entry.get("historicity", "")
		merged["epistemicMode"] = entry.get("epistemicMode", "")
	return merged


func methods() -> Array[String]:
	var result: Array[String] = []
	for method in _by_method:
		result.append(String(method))
	result.sort()
	return result
