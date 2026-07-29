class_name DivinationResultView
extends RefCounted

## Formats a Registry.cast() payload into three UI panels (symbol / reading / effects).
## Readings may include omen language (大吉 / 大凶); that is intentional.
##
## Two things used to leak the engine into the player's journal.
##
## The `match method` block below had cases for four of the twenty-four methods
## and a default arm that ran `str(raw)`. So casting runes, jiaobei, geomancy,
## astrodice or any of the sixteen soft methods printed a debug dictionary into
## the journal, verbatim:
##
##     象
##     卢恩
##     { "aspect": "travel", "idx": 7, "method": "runes", "rune": "Raidho" }
##
## The other twenty-three lines around it were period Chinese prose. Every
## method now has a reading, and the fallback is written for a player rather
## than for whoever was debugging that day.
##
## The effects list had the same problem one level down: it printed the raw op
## name and the internal reason slug — "codex — runes-recorded" — which is a
## commit message, not an omen. Ops are now named in Chinese and the slug is
## dropped.

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

## Jiaobei falls. The cups answer yes, no, or "you have asked the wrong
## question" — worth naming, because the reading text depends on which.
const JIAOBEI_FALL := {
	"holy": "聖筊 · 允",
	"laugh": "笑筊 · 神不置可否",
	"yin": "陰筊 · 不允",
}

## Astrodice: ten wanderers, twelve signs, twelve houses. The cast returns
## indices; a player should be told what they landed on.
const PLANETS := ["日", "月", "水星", "金星", "火星", "木星", "土星",
		"天王", "海王", "北交"]
const SIGNS := ["白羊", "金牛", "双子", "巨蟹", "狮子", "室女",
		"天秤", "天蝎", "人马", "摩羯", "宝瓶", "双鱼"]
const HOUSES := ["命", "财", "兄弟", "田宅", "子女", "奴仆",
		"夫妻", "疾厄", "迁移", "官禄", "福德", "相貌"]

## Geomancy verdicts, as the figure would be read aloud.
const VERDICTS := {
	"go": "宜行",
	"hold": "宜守",
	"turn": "宜改道",
	"wait": "宜待时",
}

## Effect ops in the player's language. An omen that "grants codex" means
## nothing; an omen that "记入图鉴" is a thing that happened in the world.
const OP_NAMES := {
	"coins": "银钱",
	"days": "时日",
	"goods": "货物",
	"item": "得物",
	"remove_item": "失物",
	"cargo_slots": "货格",
	"reputation": "声望",
	"faith": "信心",
	"language": "言语",
	"fate": "命运",
	"unlock_route": "新路",
	"reveal_map": "地理",
	"learn_divination": "习法",
	"flag": "记事",
	"unflag": "了事",
	"goto": "移步",
	"sticker": "贴纸",
	"codex": "图鉴",
	"recruit": "招募",
	"dismiss": "辞别",
	"retainer_mood": "人心",
	"reveal_birth": "身世",
	"etiquette": "礼数",
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


## The name of the method as the player knows it, falling back to the id only
## if the translation is genuinely absent.
static func method_name(method: String) -> String:
	var key := "div.%s.name" % method
	var t := I18n.t(key)
	return method if t == key or t == "" else t


static func format(cast_result: Dictionary) -> Dictionary:
	var raw: Dictionary = cast_result.get("raw", {})
	var method: String = String(cast_result.get("method", ""))
	var symbol_lines: PackedStringArray = symbol_lines_for(method, raw)
	var reading_lines: PackedStringArray = []
	var effect_lines: PackedStringArray = []

	for key in cast_result.get("reading", []):
		var t := I18n.t(String(key))
		if t != "":
			reading_lines.append(t)

	for e in cast_result.get("effects", []):
		var line := describe_effect(e)
		if line != "":
			effect_lines.append(line)

	return {
		"symbol_title": I18n.t("ui.divination.symbol"),
		"reading_title": I18n.t("ui.divination.reading"),
		"effects_title": I18n.t("ui.divination.effects"),
		"symbol": "\n".join(symbol_lines),
		"reading": "\n".join(reading_lines),
		"effects": "\n".join(effect_lines),
		"method": method,
	}


## The 象 block: what the cast actually produced, said in the idiom of the
## method that produced it.
static func symbol_lines_for(method: String, raw: Dictionary) -> PackedStringArray:
	var lines: PackedStringArray = []
	match method:
		"iching":
			lines.append("易 · 本卦 %d" % int(raw.get("primary", 0)))
			var moving: Array = raw.get("moving", [])
			if not moving.is_empty():
				var nth: PackedStringArray = []
				for m in moving:
					nth.append("%d 爻" % int(m))
				lines.append("变卦 %d · 动爻 %s" % [
					int(raw.get("derived", 0)), "、".join(nth)])
		"lot":
			lines.append("%s · %s" % [
				String(raw.get("grade", "")), String(raw.get("title", ""))])
			for line in raw.get("poem", []):
				lines.append(String(line))
		"tarot":
			lines.append(I18n.t(String(raw.get("spreadNameKey", "div.tarot.name"))))
			for c in raw.get("cards", []):
				var mark := "逆" if bool(c.get("reversed", false)) else "正"
				lines.append("%s · %s（%s）" % [
					String(c.get("position", "")), String(c.get("name", "")), mark])
		"bazi":
			var pillars: Dictionary = raw.get("pillars", {})
			lines.append("年 %s 月 %s" % [pillars.get("year", ""), pillars.get("month", "")])
			lines.append("日 %s 时 %s" % [pillars.get("day", ""), pillars.get("hour", "")])
			lines.append("日主 %s" % String(raw.get("dayMaster", "")))
		_:
			lines = _generic_symbol_lines(method, raw)
	return lines


## Everything the four hand-written cases above do not cover — which was, until
## now, twenty of the twenty-four registered methods.
##
## The shape of `raw` is read rather than the method id, so the sixteen soft
## methods (which share five payload shapes between them) are all handled, and
## a method added later gets a reasonable line without touching this file.
static func _generic_symbol_lines(method: String, raw: Dictionary) -> PackedStringArray:
	var lines: PackedStringArray = []
	lines.append(method_name(method))

	# Runes and geomancy: a single named figure with a bearing.
	if raw.has("rune"):
		var rune := String(raw.get("rune", ""))
		var aspect := String(raw.get("aspect", ""))
		lines.append(("抽得 %s" % rune) if rune != "" else "抽得一符")
		if aspect != "":
			lines.append("所主 · %s" % _aspect_name(aspect))
		return lines

	if raw.has("figure"):
		var fig := String(raw.get("figure", ""))
		lines.append(("成象 %s" % fig) if fig != "" else "成象一形")
		var verdict := String(raw.get("verdict", ""))
		if verdict != "":
			lines.append(String(VERDICTS.get(verdict, verdict)))
		return lines

	# Jiaobei and the soft yes/no methods: two cups, one answer.
	if raw.has("cups"):
		var cups: Array = raw.get("cups", [])
		var faces: PackedStringArray = []
		for c in cups:
			var is_yang := (typeof(c) == TYPE_STRING and String(c) == "yang") \
				or (typeof(c) in [TYPE_INT, TYPE_FLOAT] and int(c) == 1)
			faces.append("陽" if is_yang else "陰")
		lines.append("掷筊 · %s" % "／".join(faces))
		lines.append(String(JIAOBEI_FALL.get(
			String(raw.get("outcome", "")), "筊象未明")))
		return lines

	# Astrodice and the soft dice methods: planet, sign, house.
	if raw.has("planet") and raw.has("sign"):
		lines.append("%s 入 %s · %s宫" % [
			_pick(PLANETS, int(raw.get("planet", 0))),
			_pick(SIGNS, int(raw.get("sign", 0))),
			_pick(HOUSES, int(raw.get("house", 1)) - 1)])
		return lines

	# Chart methods: a figure was drawn up, and its detail is not the point —
	# the reading below is. Naming the houses is enough to make it feel cast.
	if raw.has("houses"):
		lines.append("布盘 · 十二宫定，主 %s宫" % _pick(HOUSES, int(raw.get("houses", 0))))
		return lines

	# Symbol methods: dream, palmistry, coffee grounds, scrying.
	if raw.has("symbol"):
		lines.append("现象 · 第 %d 徵" % (int(raw.get("symbol", 0)) + 1))
		return lines

	# Draw methods: a small handful of lots pulled at once.
	if raw.has("draws"):
		var draws: Array = raw.get("draws", [])
		var nums: PackedStringArray = []
		for d in draws:
			nums.append(str(int(d) + 1))
		lines.append("连抽 %d 签 · %s" % [draws.size(), "、".join(nums)])
		return lines

	# Genuinely unknown payload. Say so plainly rather than printing the
	# dictionary — the reading below still carries the meaning.
	lines.append("卦象已成，其详不书")
	return lines


static func _pick(names: Array, i: int) -> String:
	if names.is_empty():
		return "?"
	return String(names[posmod(i, names.size())])


static func _aspect_name(aspect: String) -> String:
	match aspect:
		"delay": return "宜缓"
		"danger": return "有险"
		"ally": return "得助"
		"travel": return "利行"
		"wealth": return "利财"
		"rapport": return "利交"
	return aspect


## One effect, in the player's terms. Returns "" for effects that are pure
## bookkeeping and would only clutter the omen.
static func describe_effect(e: Dictionary) -> String:
	var op := String(e.get("op", ""))
	if op == "":
		return ""
	var name := String(OP_NAMES.get(op, op))
	var v = e.get("value", null)
	# Numeric effects read as a ledger line; the sign is what matters.
	if typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT:
		var n := int(v)
		if n == 0:
			return ""
		return "%s %s%d" % [name, "+" if n > 0 else "−", absi(n)]
	# Everything else is a named thing gained, revealed or set.
	return name


static func as_richtext(cast_result: Dictionary) -> String:
	var f := format(cast_result)
	var out := "[b]%s[/b]\n%s" % [f["symbol_title"], f["symbol"]]
	# Empty sections are omitted rather than printed as a bold heading over
	# nothing — a soft method with no gameplay effects used to end on a bare
	# 「所得」 with a blank line under it.
	if String(f["reading"]) != "":
		out += "\n\n[b]%s[/b]\n%s" % [f["reading_title"], f["reading"]]
	if String(f["effects"]) != "":
		out += "\n\n[b]%s[/b]\n%s" % [f["effects_title"], f["effects"]]
	return out
