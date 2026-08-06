class_name I18n
extends RefCounted

## Text lives in content/i18n/{lang}.json, keyed. Records store keys, never prose
## (docs/DATA_MODEL.md §4).
##
## FALLBACK CHAIN: requested language -> English -> the key itself.
##
## English is the lead language: the corpus is the Yule-Cordier translation, so
## new prose is authored in English first and Chinese long-form arrives through
## the review-translation pass (docs/LORE_PIPELINE.md §4). Without the fallback,
## a Chinese player would read `ev.zayton.entry.body` in the gap between those
## two steps — English prose is a far better placeholder than a raw key.
##
## The key itself remains the LAST resort rather than blank: a visible key says
## "text missing here", whereas blank reads as a broken renderer.

const LEAD_LANG := "en"

static var _strings: Dictionary = {}
static var _fallback: Dictionary = {}
static var _lang: String = "zh"
static var _missing: Dictionary = {}
static var _untranslated: Dictionary = {}


static func load_lang(lang: String) -> void:
	_lang = lang
	_strings = _load(lang)
	_fallback = {} if lang == LEAD_LANG else _load(LEAD_LANG)
	_missing.clear()
	_untranslated.clear()


static func _load(lang: String) -> Dictionary:
	var f := FileAccess.open("res://content/i18n/%s.json" % lang, FileAccess.READ)
	if f == null:
		push_warning("I18n: no strings for '%s'" % lang)
		return {}
	var doc = JSON.parse_string(f.get_as_text())
	return doc if typeof(doc) == TYPE_DICTIONARY else {}


static func t(key: String) -> String:
	if key == null or key == "":
		return ""
	if _strings.has(key):
		return _strings[key]
	if _fallback.has(key):
		# Present but not yet translated — distinct from missing entirely.
		_untranslated[key] = true
		return _fallback[key]
	_missing[key] = true
	return key


## True when the string came from the lead language rather than the requested
## one. The UI can mark such text so a reader knows it awaits translation.
static func is_untranslated(key: String) -> bool:
	return _untranslated.has(key)


static func missing_keys() -> Array:
	var out := _missing.keys()
	out.sort()
	return out


## Keys that exist in English but not in the current language — the backlog for
## the translation pass, countable at runtime instead of guessed at.
static func untranslated_keys() -> Array:
	var out := _untranslated.keys()
	out.sort()
	return out


static func coverage() -> Dictionary:
	var total: int = _fallback.size() if not _fallback.is_empty() else _strings.size()
	return {
		"lang": _lang,
		"translated": _strings.size(),
		"lead_total": total,
		"missing": _missing.size(),
	}


static func lang() -> String:
	return _lang


## Enumeration join: "、" for CJK text, ", " for Latin. The separator differs by
## script and cannot live in a key — the story compiler trims trailing
## whitespace, which would eat the Latin ", ".
static func list(items: PackedStringArray) -> String:
	return "、".join(items) if _lang == "zh" else ", ".join(items)


## Script-aware gap for a phrase the code appends after a translated label. A
## key cannot carry it either: the compiler trims leading whitespace, so the
## "　" (CJK) / " " (Latin) choice has to be made here.
static func gap() -> String:
	return "　" if _lang == "zh" else " "


## Parameterised keys, as produced by ConditionEvaluator.explain():
##   "explain.need_language:chinese"  ->  "需要通晓：汉语"
##
## The argument is itself looked up when a string exists for it, so a language
## or item id renders in the reader's language rather than as a bare slug. An
## earlier build passed these through t() unchanged and leaked
## `explain.need_language:chinese` onto a greyed-out button.
static func fmt(key: String) -> String:
	if key == null or key == "":
		return ""
	var colon := key.find(":")
	if colon < 0:
		return t(key)
	var base := key.substr(0, colon)
	var arg := key.substr(colon + 1)
	var arg_text := arg
	for candidate in ["lang.%s" % arg, "item.%s" % arg, "div.%s.name" % arg, "good.%s.name" % arg]:
		if _strings.has(candidate) or _fallback.has(candidate):
			arg_text = t(candidate)
			break
	var tmpl := t(base)
	if tmpl == base:
		# No template for this reason yet: show the argument, not the key.
		return arg_text
	return "%s%s" % [tmpl, arg_text]
