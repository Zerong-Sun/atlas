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
	"holy": "ui.jiaobei.holy",
	"laugh": "ui.jiaobei.laugh",
	"yin": "ui.jiaobei.yin",
}

## Astrodice: ten wanderers, twelve signs, twelve houses. The cast returns
## indices; a player should be told what they landed on. Values are i18n keys
## (ui.astrodice.*); resolved through I18n.t at render time.
const PLANETS := ["ui.astrodice.planet.0", "ui.astrodice.planet.1", "ui.astrodice.planet.2",
		"ui.astrodice.planet.3", "ui.astrodice.planet.4", "ui.astrodice.planet.5",
		"ui.astrodice.planet.6", "ui.astrodice.planet.7", "ui.astrodice.planet.8",
		"ui.astrodice.planet.9"]
const SIGNS := ["ui.astrodice.sign.0", "ui.astrodice.sign.1", "ui.astrodice.sign.2",
		"ui.astrodice.sign.3", "ui.astrodice.sign.4", "ui.astrodice.sign.5",
		"ui.astrodice.sign.6", "ui.astrodice.sign.7", "ui.astrodice.sign.8",
		"ui.astrodice.sign.9", "ui.astrodice.sign.10", "ui.astrodice.sign.11"]
const HOUSES := ["ui.astrodice.house.0", "ui.astrodice.house.1", "ui.astrodice.house.2",
		"ui.astrodice.house.3", "ui.astrodice.house.4", "ui.astrodice.house.5",
		"ui.astrodice.house.6", "ui.astrodice.house.7", "ui.astrodice.house.8",
		"ui.astrodice.house.9", "ui.astrodice.house.10", "ui.astrodice.house.11"]

## Geomancy verdicts, as the figure would be read aloud.
const VERDICTS := {
	"go": "ui.div.verdict.go",
	"hold": "ui.div.verdict.hold",
	"turn": "ui.div.verdict.turn",
	"wait": "ui.div.verdict.wait",
}

## Effect ops in the player's language. An omen that "grants codex" means
## nothing; an omen that "记入图鉴" is a thing that happened in the world.
const OP_NAMES := {
	"coins": "ui.div.op.coins",
	"days": "ui.div.op.days",
	"goods": "ui.div.op.goods",
	"item": "ui.div.op.item",
	"remove_item": "ui.div.op.remove_item",
	"cargo_slots": "ui.div.op.cargo_slots",
	"reputation": "ui.div.op.reputation",
	"faith": "ui.div.op.faith",
	"language": "ui.div.op.language",
	"fate": "ui.div.op.fate",
	"unlock_route": "ui.div.op.unlock_route",
	"reveal_map": "ui.div.op.reveal_map",
	"learn_divination": "ui.div.op.learn_divination",
	"flag": "ui.div.op.flag",
	"unflag": "ui.div.op.unflag",
	"goto": "ui.div.op.goto",
	"sticker": "ui.div.op.sticker",
	"codex": "ui.div.op.codex",
	"recruit": "ui.div.op.recruit",
	"dismiss": "ui.div.op.dismiss",
	"retainer_mood": "ui.div.op.retainer_mood",
	"reveal_birth": "ui.div.op.reveal_birth",
	"etiquette": "ui.div.op.etiquette",
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
	# I Ching casts carry the hexagram index; prefer the full card face when a
	# face exists (01–30 finished, 31–64 placeholders), then fall through.
	if method == "iching" and raw.has("primary"):
		var face := MapArt.hexagram_face(int(raw.get("primary", 0)) % 64)
		if face != null:
			return face
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
			lines.append(I18n.t("ui.div.symbol.iching_primary") % int(raw.get("primary", 0)))
			var moving: Array = raw.get("moving", [])
			if not moving.is_empty():
				var nth: PackedStringArray = []
				for m in moving:
					nth.append(I18n.t("ui.div.symbol.iching_moving") % int(m))
				lines.append(I18n.t("ui.div.symbol.iching_changed") % [
					int(raw.get("derived", 0)), I18n.list(nth)])
		"lot":
			lines.append("%s · %s" % [
				String(raw.get("grade", "")), String(raw.get("title", ""))])
			for line in raw.get("poem", []):
				lines.append(String(line))
		"tarot":
			lines.append(I18n.t(String(raw.get("spreadNameKey", "div.tarot.name"))))
			for c in raw.get("cards", []):
				var mark := I18n.t("ui.div.mark.reversed") if bool(c.get("reversed", false)) \
					else I18n.t("ui.div.mark.upright")
				lines.append(I18n.t("ui.div.symbol.tarot_card") % [
					String(c.get("position", "")), String(c.get("name", "")), mark])
		"bazi":
			var pillars: Dictionary = raw.get("pillars", {})
			lines.append(I18n.t("ui.div.symbol.bazi_year") % [pillars.get("year", ""), pillars.get("month", "")])
			lines.append(I18n.t("ui.div.symbol.bazi_day") % [pillars.get("day", ""), pillars.get("hour", "")])
			lines.append(I18n.t("ui.div.symbol.bazi_master") % String(raw.get("dayMaster", "")))
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
		lines.append(I18n.t("ui.div.symbol.rune_drawn") % rune) if rune != "" \
			else lines.append(I18n.t("ui.div.symbol.rune_blank"))
		if aspect != "":
			lines.append(I18n.t("ui.div.symbol.aspect") % I18n.t(_aspect_name(aspect)))
		return lines

	if raw.has("figure"):
		var fig := String(raw.get("figure", ""))
		lines.append(I18n.t("ui.div.symbol.figure_drawn") % fig) if fig != "" \
			else lines.append(I18n.t("ui.div.symbol.figure_blank"))
		var verdict := String(raw.get("verdict", ""))
		if verdict != "":
			lines.append(I18n.t(String(VERDICTS.get(verdict, verdict))))
		return lines

	# Jiaobei and the soft yes/no methods: two cups, one answer.
	if raw.has("cups"):
		var cups: Array = raw.get("cups", [])
		var faces: PackedStringArray = []
		for c in cups:
			var is_yang := (typeof(c) == TYPE_STRING and String(c) == "yang") \
				or (typeof(c) in [TYPE_INT, TYPE_FLOAT] and int(c) == 1)
			faces.append(I18n.t("ui.div.face.yang") if is_yang else I18n.t("ui.div.face.yin"))
		lines.append(I18n.t("ui.div.symbol.cups_fmt") % "／".join(faces))
		lines.append(I18n.t(String(JIAOBEI_FALL.get(
			String(raw.get("outcome", "")), "ui.div.symbol.cups_unknown"))))
		return lines

	# Astrodice and the soft dice methods: planet, sign, house.
	if raw.has("planet") and raw.has("sign"):
		lines.append(I18n.t("ui.div.symbol.astro_placement") % [
			I18n.t(_pick(PLANETS, int(raw.get("planet", 0)))),
			I18n.t(_pick(SIGNS, int(raw.get("sign", 0)))),
			I18n.t(_pick(HOUSES, int(raw.get("house", 1)) - 1))])
		return lines

	# Chart methods: a figure was drawn up, and its detail is not the point —
	# the reading below is. Naming the houses is enough to make it feel cast.
	if raw.has("houses"):
		lines.append(I18n.t("ui.div.symbol.ziwei_board") % I18n.t(
			_pick(HOUSES, int(raw.get("houses", 0)))))
		return lines

	# Symbol methods: dream, palmistry, coffee grounds, scrying.
	if raw.has("symbol"):
		lines.append(I18n.t("ui.div.symbol.symbol_nth") % (int(raw.get("symbol", 0)) + 1))
		return lines

	# Draw methods: a small handful of lots pulled at once.
	if raw.has("draws"):
		var draws: Array = raw.get("draws", [])
		var nums: PackedStringArray = []
		for d in draws:
			nums.append(str(int(d) + 1))
		lines.append(I18n.t("ui.div.symbol.lots_draw") % [draws.size(), I18n.list(nums)])
		return lines

	# Genuinely unknown payload. Say so plainly rather than printing the
	# dictionary — the reading below still carries the meaning.
	lines.append(I18n.t("ui.div.symbol.closed"))
	return lines


static func _pick(names: Array, i: int) -> String:
	if names.is_empty():
		return "?"
	return String(names[posmod(i, names.size())])


static func _aspect_name(aspect: String) -> String:
	match aspect:
		"delay": return "ui.div.aspect.delay"
		"danger": return "ui.div.aspect.danger"
		"ally": return "ui.div.aspect.ally"
		"travel": return "ui.div.aspect.travel"
		"wealth": return "ui.div.aspect.wealth"
		"rapport": return "ui.div.aspect.rapport"
	return aspect


## One effect, in the player's terms. Returns "" for effects that are pure
## bookkeeping and would only clutter the omen.
static func describe_effect(e: Dictionary) -> String:
	var op := String(e.get("op", ""))
	if op == "":
		return ""
	var name := I18n.t(String(OP_NAMES.get(op, ""))) if OP_NAMES.has(op) else op
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
