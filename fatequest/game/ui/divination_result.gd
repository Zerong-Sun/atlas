class_name DivinationResultView
extends RefCounted

## Formats a Registry.cast() payload into three UI panels (symbol / reading / effects).
## Readings may include omen language (大吉 / 大凶); that is intentional.

## Method → preferred sym-* stems (first hit wins).
const METHOD_SYMBOLS := {
	"iching": ["qian", "kun", "li", "kan", "gen", "dui", "zhen", "xun", "jin", "ge"],
	"tarot": ["fool", "hermit", "moon", "star", "sun", "strength", "wheel", "death",
			"tarot-tower"],
	"runes": ["fehu", "uruz", "thurisaz", "ansuz", "raidho", "kenaz", "gebo", "wunjo",
			"hagalaz", "nauthiz", "isa", "jera", "eihwaz", "perthro", "algiz", "sowilo"],
	"lot": ["qian15"],
	"jiaobei": ["qian15"],
	"bazi": ["qian"],
	"astrodice": ["star"],
	"geomancy": ["wheel"],
	"meihua": ["qian"],
	"lenormand": ["star"],
	"dream": ["moon"],
}


static func ritual_texture(method: String) -> Texture2D:
	if method in ["lot", "jiaobei"]:
		var t := MapArt.ritual_lot("tube")
		if t != null:
			return t
		return MapArt.ritual_lot("stick")
	return symbol_texture({"method": method, "raw": {}})


static func symbol_texture(cast_result: Dictionary) -> Texture2D:
	var method := String(cast_result.get("method", ""))
	var raw: Dictionary = cast_result.get("raw", {})
	# Prefer a stem encoded in the cast payload when present.
	for key in ["symbol", "sym", "cardId", "rune", "hexagram"]:
		if raw.has(key):
			var t := MapArt.symbol_icon(String(raw[key]).to_lower())
			if t != null:
				return t
	var candidates: Array = METHOD_SYMBOLS.get(method, [])
	for stem in candidates:
		var t2 := MapArt.symbol_icon(String(stem))
		if t2 != null:
			return t2
	return MapArt.mentor_portrait(method)


static func format(cast_result: Dictionary) -> Dictionary:
	var raw: Dictionary = cast_result.get("raw", {})
	var method: String = String(cast_result.get("method", ""))
	var symbol_lines: PackedStringArray = []
	var reading_lines: PackedStringArray = []
	var effect_lines: PackedStringArray = []

	match method:
		"iching":
			symbol_lines.append("易 · 本卦 %d" % int(raw.get("primary", 0)))
			if not (raw.get("moving", []) as Array).is_empty():
				symbol_lines.append("变卦 %d · 动爻 %s" % [
					int(raw.get("derived", 0)), str(raw.get("moving", [])),
				])
		"lot":
			symbol_lines.append("%s · %s" % [String(raw.get("grade", "")), String(raw.get("title", ""))])
			for line in raw.get("poem", []):
				symbol_lines.append(String(line))
		"tarot":
			symbol_lines.append(I18n.t(String(raw.get("spreadNameKey", "div.tarot.name"))))
			for c in raw.get("cards", []):
				var mark := "逆" if bool(c.get("reversed", false)) else "正"
				symbol_lines.append("%s · %s（%s）" % [
					String(c.get("position", "")), String(c.get("name", "")), mark,
				])
		"bazi":
			var pillars: Dictionary = raw.get("pillars", {})
			symbol_lines.append("年 %s 月 %s" % [pillars.get("year", ""), pillars.get("month", "")])
			symbol_lines.append("日 %s 时 %s" % [pillars.get("day", ""), pillars.get("hour", "")])
			symbol_lines.append("日主 %s" % String(raw.get("dayMaster", "")))
		_:
			symbol_lines.append(I18n.t("div.%s.name" % method))
			symbol_lines.append(str(raw))

	for key in cast_result.get("reading", []):
		var t := I18n.t(String(key))
		if t != "":
			reading_lines.append(t)

	for e in cast_result.get("effects", []):
		effect_lines.append("%s — %s" % [String(e.get("op", "")), String(e.get("reason", ""))])

	return {
		"symbol_title": I18n.t("ui.divination.symbol"),
		"reading_title": I18n.t("ui.divination.reading"),
		"effects_title": I18n.t("ui.divination.effects"),
		"symbol": "\n".join(symbol_lines),
		"reading": "\n".join(reading_lines),
		"effects": "\n".join(effect_lines),
		"method": method,
	}


static func as_richtext(cast_result: Dictionary) -> String:
	var f := format(cast_result)
	return "[b]%s[/b]\n%s\n\n[b]%s[/b]\n%s\n\n[b]%s[/b]\n%s" % [
		f["symbol_title"], f["symbol"],
		f["reading_title"], f["reading"],
		f["effects_title"], f["effects"],
	]
