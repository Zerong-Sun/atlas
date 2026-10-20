class_name MapArt
extends RefCounted

## Texture lookup for every illustrated surface (docs/ART_REQUIREMENTS.md).
##
## Every texture is loaded once and cached: the map redraws on every reveal and
## every arrival, and load() inside _draw() would re-read from disk each time.
##
## A missing file returns null rather than throwing, and the caller falls back
## to the primitive it drew before. Art should never be able to break the map.

const ART := "res://assets/art/%s.webp"
const GOODS_MAP_PATH := "res://assets/art/GOODS_ART_MAP.json"

## The four illustrated sets are Christian / Confucian / Islamic / Mazu — the
## civilisational silhouettes GDD §5.3 asks for. Data carries five `culture`
## values, so steppe borrows the Islamic set (Karakorum and Chandu sit in the
## Mongol-Chinese orbit, but so does every Central-Asian town the player will
## cross before the desert ends — a Chinese silhouette in Balkh or Samarcand
## read as an anachronism) and indian_ocean borrows Mazu, the sea-folk set.
const CULTURE_SET := {
	"latin": "chr",
	"islamic": "isl",
	"east_asia": "con",
	"steppe": "isl",
	"indian_ocean": "mazu",
}

## culture-* filenames use a flatter spelling than the data `culture` field.
const CULTURE_ART := {
	"latin": "latin",
	"islamic": "islamic",
	"east_asia": "eastasia",
	"steppe": "steppe",
	"indian_ocean": "indianocean",
}

## Cartouche size follows tier, so the map reads its own hierarchy at a glance.
const TIER_SIZE := {
	"metropolis": "l",
	"city": "m",
	"town": "s",
	"station": "s",
}

## Data city ids → art stem city ids (explore / site / entry files).
const CITY_ART_ALIAS := {
	"accon": "acre",
	"ormus": "hormos",
}

## Cities with their own painted scene. Falling back to a region plate loses a
## lot, so named scenes and city-specific entry plates are preferred wherever
## one exists.
const CITY_SCENE := {
	"tauris": "scene-tabriz-bazaar",
	"ormus": "scene-hormuz-port",
	"chandu": "scene-shangdu-palace",
	"cambaluc": "scene-khanbaliq-hall",
	"kinsay": "scene-hangzhou-lake",
	"zayton": "scene-quanzhou-harbor",
	"accon": "scene-acre-wall",
	"kerman": "scene-kerman-dunes",
	"venice": "scene-venice-quay",
	"herat": "scene-herat-road",
}

## Band plates keep the fallback visual language stable when a city has no
## dedicated entry or named scene.
const BAND_SCENE := {
	"china": "scene-region-con",
	"maritime_asia": "scene-region-mazu",
	"india": "scene-region-mazu",
	"europe": "scene-region-chr",
	"west_asia": "scene-region-isl",
	"central_asia": "scene-region-isl",
	"steppe": "scene-region-isl",
}

## Portraits are audited separately from map icons. Geography is not enough to
## infer a person's dress, gender or occupation, and several source images are
## still multi-figure sheets despite having single-character filenames.
const PORTRAIT_MAP_PATH := "res://game/map/portrait_art_map.json"
const RETAINERS_PATH := "res://content/tables/retainers.json"

## Currency id → art stem (files may be absent; callers fall back to emoji).
const CURRENCY_ART := {
	"ducat": "currency-ducat",
	"dinar": "currency-dinar",
	"dirham": "currency-dirham",
	"cash": "currency-cash",
	"sycee": "currency-sycee",
}

## Ending sticker id (st-*) → art stem when a dedicated sticker exists.
const STICKER_ART := {
	"st-returned": "sticker-polo",
	"st-stayed": "sticker-stop",
	"st-witness": "sticker-translate",
	"st-markets": "sticker-market",
	"st-no-return": "sticker-no-return",
	"st-cartographer": "sticker-map",
	"st-diviner": "sticker-diviner",
	"st-lay-down": "sticker-silk",
	"st-battuta": "sticker-battuta",
	"st-stop": "sticker-stop",
	"st-polo": "sticker-polo",
	"st-market": "sticker-market",
	"st-map": "sticker-map",
	"st-silk": "sticker-silk",
	"st-translate": "sticker-translate",
}

## Divination method → mentor portrait / symbol family.
const MENTOR_METHOD := {
	"iching": "iching",
	"bazi": "bazi",
	"lot": "jiaobei",
	"jiaobei": "jiaobei",
	"tarot": "tarot",
	"astrodice": "astrodice",
	"geomancy": "western",
	"runes": "runes",
	"meihua": "meihua",
	"lenormand": "lenormand",
	"dream": "dream",
	"western": "western",
}

const BOOKS := ["polo", "battuta", "conti", "odoric", "rubruck", "tafur", "zhenghe"]

static var _cache: Dictionary = {}
static var _goods_map: Dictionary = {}
static var _goods_index: Dictionary = {}
static var _goods_loaded := false
static var _portrait_map: Dictionary = {}
static var _retainers: Dictionary = {}
static var _portraits_loaded := false


static func tex(name: String) -> Texture2D:
	if name.is_empty() or name.contains("/") or name.contains("\\") \
			or name.contains(".") or name.contains(":"):
		return null
	if _cache.has(name):
		return _cache[name]
	var path := ART % name
	var t: Texture2D = null
	if ResourceLoader.exists(path):
		t = load(path) as Texture2D
	_cache[name] = t
	return t


static func art_city_id(city_id: String) -> String:
	return String(CITY_ART_ALIAS.get(city_id, city_id))


static func culture_set(culture: String) -> String:
	return String(CULTURE_SET.get(culture, "con"))


# --------------------------------------------------------------------------- cities / scenes

static func city_icon(culture: String, tier: String) -> Texture2D:
	var set_name: String = culture_set(culture)
	var size: String = TIER_SIZE.get(tier, "s")
	return tex("map-city-%s-%s" % [set_name, size])


## Station nodes get no cartouche — a waypoint is not a city, and drawing one
## would overstate what is there.
static func has_city_icon(tier: String) -> bool:
	return tier != "station"


static func city_scene(city: Dictionary) -> Texture2D:
	var cid := _art_text(city.get("id", ""))
	var art_id := art_city_id(cid)

	# Named painted scenes first.
	if CITY_SCENE.has(cid):
		var t := tex(CITY_SCENE[cid])
		if t != null:
			return t

	# Dedicated entry plates (city-<art_id>-entry).
	var entry := tex("city-%s-entry" % art_id)
	if entry != null:
		return entry

	var scene_value: Variant = city.get("scene", "")
	if scene_value is String and not _art_text(scene_value).is_empty():
		var t2 := tex(_art_text(scene_value))
		if t2 != null:
			return t2
	return tex(_art_text(BAND_SCENE.get(_art_text(city.get("band", "")), "")))


## Site / explore plate for a city interior figure slot (0-based).
static func site_scene(city_id: String, slot: int = 0) -> Texture2D:
	var art_id := art_city_id(city_id)
	var n := clampi(slot, 0, 2) + 1
	var site := tex("site-%s-%d" % [art_id, n])
	if site != null:
		return site
	# explore-* exists for inn/market/temple × 12 cities.
	var venues := ["market", "inn", "temple"]
	var explore := tex("explore-%s-%s" % [venues[n - 1], art_id])
	if explore != null:
		return explore
	return null


## The city background is stable: availability/order of site cards must not
## silently swap its location. site-* files include unfinished contact sheets.
static func city_explore_bg(city: Dictionary, _slot: int = 0) -> Texture2D:
	return city_scene(city)


## Only explicit scene bindings override the city establishing shot.
static func event_scene(ev: Dictionary, city: Dictionary) -> Texture2D:
	_ensure_portrait_map()
	var binding := _portrait_entry("events", _art_text(ev.get("id", "")))
	var art: Variant = ev.get("art", {})
	var stem := _art_text(binding.get("scene", ""))
	if art is Dictionary:
		stem = _art_text(art.get("scene", stem))
	var scene: Variant = ev.get("scene", {})
	if scene is Dictionary:
		stem = _art_text(scene.get("art", stem))
	var image := tex(stem)
	return image if image != null else city_scene(city)


static func city_entry(city_id: String) -> Texture2D:
	return tex("city-%s-entry" % art_city_id(city_id))


# --------------------------------------------------------------------------- portraits

static func _art_text(value: Variant) -> String:
	return String(value) if value is String or value is StringName else ""


static func _art_dict(value: Variant) -> Dictionary:
	return value if value is Dictionary else {}


static func _portrait_entry(section: String, key: String) -> Dictionary:
	return _art_dict(_art_dict(_portrait_map.get(section, {})).get(key, {}))


static func _ensure_portrait_map() -> void:
	if _portraits_loaded:
		return
	_portraits_loaded = true
	var file := FileAccess.open(PORTRAIT_MAP_PATH, FileAccess.READ)
	if file != null:
		var doc: Variant = JSON.parse_string(file.get_as_text())
		if doc is Dictionary:
			_portrait_map = doc
	file = FileAccess.open(RETAINERS_PATH, FileAccess.READ)
	if file != null:
		var doc: Variant = JSON.parse_string(file.get_as_text())
		if doc is Dictionary and doc.get("records", []) is Array:
			for rec in doc.get("records", []):
				if rec is Dictionary and not _art_text(rec.get("id", "")).is_empty():
					_retainers[_art_text(rec.get("id", ""))] = rec


static func _audited_portrait(stem: String, gender: String = "") -> Texture2D:
	_ensure_portrait_map()
	var rec := _portrait_entry("portraits", stem)
	if rec.is_empty():
		return null
	# A declared female character cannot fall back to a generic male portrait.
	if not gender.is_empty() and _art_text(rec.get("gender", "")) != gender:
		return null
	return tex(stem)


static func venue_portrait(venue: String, culture: String) -> Texture2D:
	_ensure_portrait_map()
	var venues := _portrait_entry("venues", culture)
	return _audited_portrait(_art_text(venues.get(venue, "")))


static func job_portrait(job_id: String, culture: String) -> Texture2D:
	_ensure_portrait_map()
	var jobs := _portrait_entry("jobs", culture)
	return _audited_portrait(_art_text(jobs.get(job_id, "")))


## An event describes an encounter, not necessarily a person. Stable ids or
## explicit authored bindings decide its face; localized title/slot never do.
static func event_portrait(ev: Dictionary, culture: String, _slot: int = -1) -> Texture2D:
	_ensure_portrait_map()
	var binding := _portrait_entry("events", _art_text(ev.get("id", "")))
	var art: Variant = ev.get("art", {})
	var character_id := _art_text(ev.get("characterId", ev.get("retainerId", "")))
	var character := _art_dict(_retainers.get(character_id, {}))
	var gender := _art_text(character.get("gender", ev.get("gender", "")))
	if art is Dictionary and art.has("portrait"):
		return _audited_portrait(_art_text(art["portrait"]), gender)
	if ev.has("portrait"):
		return _audited_portrait(_art_text(ev["portrait"]), gender)
	if binding.has("portrait"):
		return _audited_portrait(_art_text(binding["portrait"]), gender if not gender.is_empty() else _art_text(binding.get("gender", "")))
	if not character_id.is_empty():
		return retainer_portrait(character_id, culture, _art_text(ev.get("gender", "")))
	var job := _art_text(ev.get("job", ""))
	if not job.is_empty():
		var jobs := _portrait_entry("jobs", culture)
		return _audited_portrait(_art_text(jobs.get(job, "")), _art_text(ev.get("gender", "")))
	return null


static func retainer_portrait(retainer_id: String, _culture: String, gender: String = "") -> Texture2D:
	_ensure_portrait_map()
	var rec := _art_dict(_retainers.get(retainer_id, {}))
	if rec.is_empty():
		return null
	var actual_gender := _art_text(rec.get("gender", gender))
	# Use the retainer's recorded origin, so travelling cannot change their face.
	var origin := _art_dict(rec.get("origin", {}))
	var culture := _art_text(origin.get("culture", ""))
	var binding := _portrait_entry("characters", retainer_id)
	if binding.has("portrait"):
		return _audited_portrait(_art_text(binding["portrait"]), actual_gender)
	var jobs := _portrait_entry("jobs", culture)
	var roles: Variant = rec.get("roles", [])
	if not roles is Array:
		return null
	for role in roles:
		var image := _audited_portrait(_art_text(jobs.get(_art_text(role), "")), actual_gender)
		if image != null:
			return image
	return null


static func contract_art(mode: String) -> Texture2D:
	match mode:
		"divined":
			return tex("contract-divined")
		"sealed":
			return tex("contract-sealed")
		_:
			return tex("contract-open")


static func seal_wax() -> Texture2D:
	return tex("seal-wax")


static func mentor_portrait(method_id: String) -> Texture2D:
	_ensure_portrait_map()
	# A method alone identifies neither a person nor their culture. Only
	# inspected single-person plates can be used by generic lesson surfaces.
	return _audited_portrait(_art_text(_art_dict(_portrait_map.get("mentors", {})).get(method_id, "")))


# --------------------------------------------------------------------------- goods / items / stickers / currency

static func _ensure_goods_map() -> void:
	if _goods_loaded:
		return
	_goods_loaded = true
	if not ResourceLoader.exists(GOODS_MAP_PATH) and not FileAccess.file_exists(GOODS_MAP_PATH):
		return
	var f := FileAccess.open(GOODS_MAP_PATH, FileAccess.READ)
	if f == null:
		return
	var doc = JSON.parse_string(f.get_as_text())
	if typeof(doc) != TYPE_DICTIONARY:
		return
	_goods_map = doc
	_goods_index.clear()
	for section in ["goods", "tools", "tokens"]:
		var table: Dictionary = _goods_map.get(section, {})
		for goods_id in table:
			var item: Variant = table[goods_id]
			if typeof(item) == TYPE_DICTIONARY:
				_goods_index[String(goods_id)] = String(item.get("art", ""))


static func goods_icon(goods_id: String) -> Texture2D:
	_ensure_goods_map()
	var stem := String(_goods_index.get(goods_id, ""))
	if stem.is_empty():
		var defaults: Dictionary = _goods_map.get("defaults", {})
		stem = String(defaults.get("goods", "ic-ritual-basket"))
	var t := tex(stem)
	if t != null:
		return t
	# Last-ditch: try item-<id> then ic-good-<id> for forward compatibility.
	t = tex("item-%s" % goods_id)
	if t != null:
		return t
	return tex("ic-good-%s" % goods_id)


static func item_icon(item_id: String) -> Texture2D:
	_ensure_goods_map()
	var tools: Dictionary = _goods_map.get("tools", {})
	var tokens: Dictionary = _goods_map.get("tokens", {})
	if tools.has(item_id):
		return tex(String(tools[item_id].get("art", "")))
	if tokens.has(item_id):
		return tex(String(tokens[item_id].get("art", "")))
	var t := tex("item-%s" % item_id)
	if t != null:
		return t
	return goods_icon(item_id)


static func currency_icon(currency_id: String) -> Texture2D:
	var stem := String(CURRENCY_ART.get(currency_id, "currency-%s" % currency_id))
	var t := tex(stem)
	if t != null:
		return t
	return tex("ui-icon-coin")


static func sticker_icon(sticker_id: String) -> Texture2D:
	var stem := String(STICKER_ART.get(sticker_id, ""))
	if stem != "":
		var t := tex(stem)
		if t != null:
			return t
	# Accept short form without st- prefix, or sticker-<id> direct.
	var short := sticker_id.trim_prefix("st-")
	var t2 := tex("sticker-%s" % short)
	if t2 != null:
		return t2
	return tex("ui-bg-stamp")


# --------------------------------------------------------------------------- chargen / desk / transit / symbols

static func culture_icon(culture: String) -> Texture2D:
	var slug := String(CULTURE_ART.get(culture, culture.replace("_", "")))
	return tex("culture-%s" % slug)


static func faith_icon(faith: String) -> Texture2D:
	return tex("faith-%s" % faith)


static func fate_bar(axis: String) -> Texture2D:
	return tex("fate-bar-%s" % axis)


static func fate_wheel() -> Texture2D:
	return tex("fate-wheel")


static func fate_rank_icon(rank: String) -> Texture2D:
	return tex("fate-rank-%s" % rank)


static func book_cover(book_id: String) -> Texture2D:
	return tex("book-%s" % book_id)


static func desk_parchment() -> Texture2D:
	var t := tex("desk-parchment")
	if t != null:
		return t
	return tex("scene-desk-opening")


static func symbol_icon(sym_id: String) -> Texture2D:
	var t := tex("sym-%s" % sym_id)
	if t != null:
		return t
	return tex("sym-%s-full" % sym_id)


const DECK_TAROT_DIR := "res://assets/decks/tarot/"
const DECK_LENORMAND_DIR := "res://assets/decks/lenormand/"
const DECK_ASTRO_DIR := "res://assets/astrodice/"

const TAROT_MAJOR_STEMS := [
	"fool", "magician", "high-priestess", "empress", "emperor", "hierophant",
	"lovers", "chariot", "strength", "hermit", "wheel", "justice", "hanged-man",
	"death", "temperance", "devil", "tower", "star", "moon", "sun", "judgement", "world",
]
const TAROT_MINOR_RANK_STEMS := ["ace", "02", "03", "04", "05", "06", "07", "08", "09", "10", "page", "knight", "queen", "king"]
const LENORMAND_STEMS := [
	"rider", "clover", "ship", "house", "tree", "cloud", "snake", "coffin", "bouquet", "scythe",
	"whip", "birds", "child", "fox", "bear", "stars", "stork", "dog", "tower", "garden",
	"mountain", "crossroads", "mice", "heart", "ring", "book", "letter", "man", "woman", "lily",
	"sun", "moon", "key", "fish", "anchor", "cross",
]
const ASTRO_PLANETS := ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
const ASTRO_SIGNS := ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
static var _deck_cache: Dictionary = {}


static func _deck_texture(path: String) -> Texture2D:
	if path.is_empty() or path.contains("..") or path.contains("\\"):
		return null
	if _deck_cache.has(path):
		return _deck_cache[path]
	var image: Texture2D = null
	if ResourceLoader.exists(path):
		image = load(path) as Texture2D
	_deck_cache[path] = image
	return image


## Resolves a content tarot id (e.g. `major-0`, `wands-13`) to its deck face.
## Missing cards return null so an incomplete deck can never silently display a
## different card.
static func tarot_card(card_id: String) -> Texture2D:
	var parts := card_id.to_lower().split("-")
	if parts.size() != 2 or not parts[1].is_valid_int():
		return null
	var family := String(parts[0])
	var rank := int(parts[1])
	var stem := ""
	if family == "major":
		if rank < 0 or rank >= TAROT_MAJOR_STEMS.size():
			return null
		stem = "tarot-%s-full.webp" % TAROT_MAJOR_STEMS[rank]
	elif family in ["wands", "cups", "swords", "pentacles"]:
		if rank < 0 or rank >= TAROT_MINOR_RANK_STEMS.size():
			return null
		stem = "tarot-%s-%s-full.webp" % [family, TAROT_MINOR_RANK_STEMS[rank]]
	else:
		return null
	return _deck_texture(DECK_TAROT_DIR + stem)


## Resolves a zero-based Lenormand draw index to the numbered JPG face.
static func lenormand_card(index: int) -> Texture2D:
	if index < 0 or index >= 36:
		return null
	return _deck_texture(DECK_LENORMAND_DIR + "%02d-%s.jpg" % [index + 1, LENORMAND_STEMS[index]])


## Resolves one of the three Astrodice SVG families. `kind` is planet, sign or
## house; indices are the same indices emitted by AstrodiceMethod.
static func astrodice_symbol(kind: String, index: int) -> Texture2D:
	var path := ""
	match kind:
		"planet":
			if index < 0 or index >= ASTRO_PLANETS.size():
				return null
			path = DECK_ASTRO_DIR + "planets/zodiac-planet-%s.svg" % ASTRO_PLANETS[index]
		"sign":
			if index < 0 or index >= ASTRO_SIGNS.size():
				return null
			path = DECK_ASTRO_DIR + "signs/%s.svg" % ASTRO_SIGNS[index]
		"house":
			if index < 0 or index >= 12:
				return null
			path = DECK_ASTRO_DIR + "houses/house-%02d.svg" % (index + 1)
		_:
			return null
	return _deck_texture(path)


const DECK_ICHING_MANIFEST := "res://assets/decks/iching/DECK_MANIFEST.json"
const DECK_ICHING_DIR := "res://assets/decks/iching/"

static var _iching_index: Dictionary = {}
static var _iching_loaded := false


## The 64 full card faces in King Wen order. Hexagrams 01–30 are the finished
## manuscript faces; 31–64 are currently legible placeholders pending the
## generation batch (ART_PROMPTS_ICHING_REMAIN.md). Missing files return null
## and the caller falls back to the method symbol.
static func hexagram_face(index: int) -> Texture2D:
	if not _iching_loaded:
		_iching_loaded = true
		if FileAccess.file_exists(DECK_ICHING_MANIFEST):
			var f := FileAccess.open(DECK_ICHING_MANIFEST, FileAccess.READ)
			if f != null:
				var doc = JSON.parse_string(f.get_as_text())
				if typeof(doc) == TYPE_ARRAY:
					for entry in doc:
						var rec: Dictionary = entry
						var fn := String(rec.get("file", ""))
						var n := fn.get_slice("-", 1).to_int()
						if n > 0:
							_iching_index[n] = fn
	if not _iching_index.has(index):
		return null
	var fn2 := String(_iching_index[index])
	if fn2.is_empty() or not ResourceLoader.exists(DECK_ICHING_DIR + fn2):
		return null
	return load(DECK_ICHING_DIR + fn2) as Texture2D


static func ritual_lot(piece: String = "tube") -> Texture2D:
	return tex("ritual-lot-%s" % piece)


## Universal resolver used by audit + callers that only have a stem.
static func wire_index_path() -> String:
	return "res://game/map/art_wire_index.json"


## Transit / loading plate chosen from route context.
static func transit_scene(ctx: Dictionary = {}) -> Texture2D:
	var kind := String(ctx.get("kind", ctx.get("mode_kind", "land")))
	var band := String(ctx.get("band", ""))
	var culture := String(ctx.get("culture", ""))
	var mode := String(ctx.get("mode", ""))

	if kind == "sea" or mode.contains("ship") or mode.contains("junk") or mode.contains("dhow"):
		var sea := tex("load-seaship")
		if sea != null:
			return sea
		return tex("load-port")
	if band == "steppe" or culture == "steppe":
		return tex("load-steppe")
	if band in ["china", "central_asia"] and kind != "sea":
		var canal := tex("load-canal")
		if canal != null and band == "china":
			return canal
		var desert := tex("load-desert")
		if desert != null:
			return desert
	if band == "west_asia" or culture == "islamic":
		var bazaar := tex("load-bazaar")
		if bazaar != null:
			return bazaar
		return tex("load-mosque")
	if culture == "latin" or band == "europe":
		var church := tex("load-church")
		if church != null:
			return church
	if band in ["india", "maritime_asia"]:
		var port := tex("load-port")
		if port != null:
			return port
	var station := tex("load-station")
	if station != null:
		return station
	return tex("load-desert")


static func ui(name: String) -> Texture2D:
	return tex("ui-%s" % name)


static func map_ornament(name: String) -> Texture2D:
	return tex("map-%s" % name)


static func route_brush(kind: String) -> Texture2D:
	match kind:
		"sea": return tex("map-route-sea")
		"river": return tex("map-route-river")
	return tex("map-route-land")


## Relief silhouettes are chosen by elevation, not at random: an 8000 m spine
## should not be drawn as a foothill. Names are matched first so the Pamir and
## the Taklamakan get their own forms.
static func mountain_icon(name_medieval: String, peak_m: float) -> Texture2D:
	var n := name_medieval.to_lower()
	if n.contains("desert") or n.contains("lop") or n.contains("sand"):
		return tex("map-dune")
	if n.contains("volcan") or n.contains("aetna") or n.contains("vesuv"):
		return tex("map-mtn-volcano")
	if n.contains("karst") or n.contains("guilin"):
		return tex("map-mtn-karst")
	if n.contains("plateau") or n.contains("tibet") or n.contains("pamir"):
		var plateau := tex("map-mtn-plateau")
		if plateau != null:
			return plateau
	if peak_m >= 7000.0:
		return tex("map-mtn-glacier")
	if peak_m >= 5000.0:
		return tex("map-mtn-snow")
	if peak_m >= 3000.0:
		return tex("map-mtn-cliff")
	if peak_m >= 1500.0:
		return tex("map-mtn-rock")
	return tex("map-mtn-foothill")


static func wind_head(dir: String) -> Texture2D:
	return tex("map-wind-%s" % dir)
