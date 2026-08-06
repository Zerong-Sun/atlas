extends RefCounted

## F-6: i18n fallback chain, fmt(), missing_keys().

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c: printerr("  FAIL: %s" % w); _f += 1


func run() -> bool:
	I18n.load_lang("zh")
	# Known key from corpus
	var zh_name := I18n.t("div.lot.name")
	_ok(zh_name != "" and zh_name != "div.lot.name", "zh resolves div.lot.name")

	# List separator differs by script: 、 for zh, ", " for en.
	var zh_list := I18n.list(PackedStringArray(["silk", "pepper"]))
	_ok(zh_list == "silk、pepper", "zh list joins with 、 (got \"%s\")" % zh_list)
	var zh_gap := I18n.gap()
	_ok(zh_gap == "　", "zh gap is ideographic space (got \"%s\")" % zh_gap)

	# Fallback: invent a key present only if we inject into lead — use missing key
	var missing := I18n.t("test.missing.key.f6")
	_ok(missing == "test.missing.key.f6", "zh → en → key falls back to key")
	_ok(I18n.missing_keys().has("test.missing.key.f6") or "test.missing.key.f6" in I18n.missing_keys(),
		"missing_keys tracks absent key")

	# fmt with colon argument
	var explained := I18n.fmt("explain.need_language:chinese")
	_ok(explained != "explain.need_language:chinese", "fmt resolves template+arg")

	I18n.load_lang("en")
	var en_name := I18n.t("div.lot.name")
	_ok(en_name != "" and en_name != "div.lot.name", "en resolves div.lot.name")

	var en_list := I18n.list(PackedStringArray(["silk", "pepper"]))
	_ok(en_list == "silk, pepper", "en list joins with \", \" (got \"%s\")" % en_list)
	var en_gap := I18n.gap()
	_ok(en_gap == " ", "en gap is regular space (got \"%s\")" % en_gap)

	print("test_i18n: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
