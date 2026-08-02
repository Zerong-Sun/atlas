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
## values, so steppe borrows the Confucian set (Karakorum and Chandu sit in the
## Mongol-Chinese orbit) and indian_ocean borrows Mazu, the sea-folk set.
const CULTURE_SET := {
	"latin": "chr",
	"islamic": "isl",
	"east_asia": "con",
	"steppe": "con",
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
	"west_asia": "scene-region-chr",
	"central_asia": "scene-region-chr",
	"steppe": "scene-region-chr",
}

## Venue keywords → portrait stem (npc-<venue>-<set>).
const VENUE_STEMS := ["market", "temple", "inn", "tea", "dock", "healer",
		"scribe", "official"]

## Retainer / event id fragments → job portrait stem.
const JOB_FROM_ID := {
	"guide": "guide",
	"porter": "porter",
	"interpreter": "translator",
	"translator": "translator",
	"sailor": "sailor",
	"guard": "guard",
	"healer": "healer",
	"scribe": "scribe",
	"acolyte": "acolyte",
	"diviner": "diviner",
	"mentor": "diviner",
	"dock": "porter",
	"official": "scribe",
}

## retainer-* filenames use shorter stems than npc-job-* ids.
const RETAINER_ART_SHORT := {
	"guide": "guide",
	"porter": "porter",
	"guard": "guard",
	"scribe": "scribe",
	"translator": "lang",
	"healer": "heal",
	"sailor": "sail",
	"acolyte": "monk",
	"diviner": "seer",
}

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


static func tex(name: String) -> Texture2D:
	if name.is_empty():
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
	var cid := String(city.get("id", ""))
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

	var explicit := String(city.get("scene", ""))
	if explicit != "":
		var t2 := tex(explicit)
		if t2 != null:
			return t2
	return tex(BAND_SCENE.get(String(city.get("band", "")), "scene-region-chr"))


## Site / explore plate for a city interior figure slot (0-based).
static func site_scene(city_id: String, slot: int = 0) -> Texture2D:
	var art_id := art_city_id(city_id)
	var n := clampi(slot, 0, 2) + 1
	var site := tex("site-%s-%d" % [art_id, n])
	if site != null:
		return site
	# explore-* exists for inn/market/temple × 12 cities.
	var venues := ["market", "inn", "temple"]
	var explore := tex("explore-%s-%s" % [venues[slot % venues.size()], art_id])
	if explore != null:
		return explore
	return null


## City-view background: prefer a site plate, then explore market, then city_scene.
static func city_explore_bg(city: Dictionary, slot: int = 0) -> Texture2D:
	var cid := String(city.get("id", ""))
	var site := site_scene(cid, slot)
	if site != null:
		return site
	var art_id := art_city_id(cid)
	for venue in ["market", "inn", "temple"]:
		var t := tex("explore-%s-%s" % [venue, art_id])
		if t != null:
			return t
	return city_scene(city)


static func city_entry(city_id: String) -> Texture2D:
	return tex("city-%s-entry" % art_city_id(city_id))


# --------------------------------------------------------------------------- portraits

static func venue_portrait(venue: String, culture: String) -> Texture2D:
	return tex("npc-%s-%s" % [venue, culture_set(culture)])


static func job_portrait(job_id: String, culture: String) -> Texture2D:
	if job_id.is_empty():
		return null
	var set_name := culture_set(culture)
	# Prefer npc-job-<job>-<set>, then npc-<job>-<set>.
	var t := tex("npc-job-%s-%s" % [job_id, set_name])
	if t != null:
		return t
	return tex("npc-%s-%s" % [job_id, set_name])


## Resolve a portrait from an event (and optional retainer id fragment).
static func event_portrait(ev: Dictionary, culture: String, slot: int = -1) -> Texture2D:
	var id := String(ev.get("id", "")).to_lower()
	var title := String(ev.get("title", "")).to_lower()
	var hay := id + " " + title

	# Explicit job / mentor fields on the record.
	var job := String(ev.get("job", ""))
	if job != "":
		var jp := job_portrait(job, culture)
		if jp != null:
			return jp

	# Mentor events → mentor-<method> when the id encodes the method.
	if hay.contains("mentor"):
		for method in MENTOR_METHOD:
			if hay.contains(method):
				var mp := mentor_portrait(method)
				if mp != null:
					return mp
		var tea := venue_portrait("tea", culture)
		if tea != null:
			return tea

	# Retainer-style job fragments in the id.
	for frag in JOB_FROM_ID:
		if hay.contains(frag):
			var jp2 := job_portrait(String(JOB_FROM_ID[frag]), culture)
			if jp2 != null:
				return jp2

	# Venue keywords.
	var venue := "market"
	if hay.contains("shrine") or hay.contains("temple") or hay.contains("mazu") \
			or hay.contains("mosque") or hay.contains("church"):
		venue = "temple"
	elif hay.contains("serai") or hay.contains("inn") or hay.contains("caravan"):
		venue = "inn"
	elif hay.contains("tea") or hay.contains("school"):
		venue = "tea"
	elif hay.contains("dock") or hay.contains("port") or hay.contains("harbor") \
			or hay.contains("harbour") or hay.contains("quay"):
		venue = "dock"
	elif hay.contains("heal") or hay.contains("physician") or hay.contains("doctor"):
		venue = "healer"
	elif hay.contains("scribe") or hay.contains("clerk") or hay.contains("official"):
		venue = "official" if hay.contains("official") else "scribe"
	elif slot >= 0:
		venue = VENUE_STEMS[slot % VENUE_STEMS.size()]

	var vp := venue_portrait(venue, culture)
	if vp != null:
		return vp
	return venue_portrait("market", culture)


static func retainer_portrait(retainer_id: String, culture: String) -> Texture2D:
	var id := retainer_id.to_lower()
	var set_name := culture_set(culture)
	for frag in JOB_FROM_ID:
		if id.contains(frag):
			var job := String(JOB_FROM_ID[frag])
			var short := String(RETAINER_ART_SHORT.get(job, job))
			var dedicated := tex("retainer-%s-%s" % [short, set_name])
			if dedicated != null:
				return dedicated
			var t := job_portrait(job, culture)
			if t != null:
				return t
	return venue_portrait("market", culture)


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
	var stem := String(MENTOR_METHOD.get(method_id, method_id))
	return tex("mentor-%s" % stem)


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
