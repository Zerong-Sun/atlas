class_name I18n
extends RefCounted

## Text lives in content/i18n/{lang}.json, keyed. Records store keys, never prose
## (docs/DATA_MODEL.md §4).

static var _strings: Dictionary = {}
static var _lang: String = "zh"
static var _missing: Dictionary = {}


static func load_lang(lang: String) -> void:
	_lang = lang
	_strings.clear()
	_missing.clear()
	var f := FileAccess.open("res://content/i18n/%s.json" % lang, FileAccess.READ)
	if f == null:
		push_warning("I18n: no strings for '%s'; keys will show raw" % lang)
		return
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) == TYPE_DICTIONARY:
		_strings = doc


## Missing keys render as the key itself, NOT as blank. 102 city names are
## currently unwritten (docs/STORY_REQUIREMENTS.md §1); showing `city.lop.name`
## makes the gap obvious, whereas a blank label reads as a broken renderer.
static func t(key: String) -> String:
	if key == null or key == "":
		return ""
	if _strings.has(key):
		return _strings[key]
	_missing[key] = true
	return key


static func missing_keys() -> Array:
	var out := _missing.keys()
	out.sort()
	return out


static func lang() -> String:
	return _lang
