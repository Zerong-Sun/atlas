extends RefCounted

## One generated art family for every lesson. No legacy-image or vector-object
## fallback: a missing asset is an explicit validation failure.
const BASE := "res://assets/art/lessons/unified/"
const CAST := {
	"zhou": ["mentor-zhou", "china"], "lin": ["mentor-lin", "china"],
	"jin": ["mentor-jin", "china"], "sahl": ["mentor-sahl", "courtyard"],
	"mira": ["mentor-mira", "observatory"], "bjorn": ["mentor-bjorn", "north"],
	"nadir": ["mentor-nadir", "courtyard"], "beatrice": ["mentor-beatrice", "europe"],
	"selma": ["mentor-selma", "courtyard"]
}
const TEACHERS := {
	"iching": "zhou", "liuyao": "zhou", "meihua": "zhou", "qimen": "zhou",
	"bazi": "lin", "bazi-relationship": "lin", "ziwei": "lin", "fengshui": "lin",
	"palmistry": "zhou", "xiangmian": "lin", "jiaobei": "jin", "lot": "jin",
	"geomancy": "sahl", "numerology": "sahl", "western": "mira", "vedic": "mira",
	"astrodice": "mira", "runes": "bjorn", "dream": "nadir", "scrying": "nadir",
	"tarot": "beatrice", "lenormand": "beatrice", "oracle": "beatrice", "coffee": "selma"
}
const ATLASES := {
	"instruments": ["coin_heads", "coin_tails", "block_flat", "block_curved", "sand_tray", "astrolabe", "terrain_map", "palm_chart", "face_chart", "coffee_cup", "water_bowl", "lot_tube", "number_tile", "card_back", "rune_back", "card_face"],
	"symbols": ["chalice", "sword", "baton", "pentacle", "ship", "key", "letter", "tree", "moon", "sun", "lamp", "arch", "seed", "mercury", "venus", "bird"],
	"tokens": ["wood", "fire", "earth", "metal", "water", "mountain", "waypoint", "destination", "traveler", "bead", "yang", "yin", "fehu", "uruz", "thurisaz", "ansuz"]
}
const SUITS := {
	"suits": ["chalice", "sword", "baton", "pentacle"],
	"story": ["ship", "key", "letter", "tree"],
	"oracle": ["moon", "lamp", "arch", "seed"],
	"astro": ["sun", "moon", "mercury", "venus"]
}
const ELEMENTS := ["wood", "fire", "earth", "metal", "water"]
const RUNES := ["fehu", "uruz", "thurisaz", "ansuz"]
const DREAMS := ["ship", "moon", "arch", "bird"]
static var _cache: Dictionary = {}
static var _regions: Dictionary = {}

static func method(config: Dictionary) -> String:
	return String(config.get("title", "challenge.iching.title")).split(".")[1]

static func teacher(config: Dictionary) -> String:
	return String(TEACHERS.get(method(config), "zhou"))

static func texture(name: String) -> Texture2D:
	if not _cache.has(name):
		var path := BASE + name + ".png"
		if not ResourceLoader.exists(path):
			push_error("Missing unified lesson art: " + path)
			return null
		_cache[name] = load(path)
	return _cache[name]

static func portrait(id: String) -> Texture2D:
	return texture("mentor-" + id)

static func scene(config: Dictionary) -> Texture2D:
	var region: String = CAST[teacher(config)][1]
	if method(config) == "vedic": region = "india"
	return texture("scene-" + region)

static func prop(name: String) -> Texture2D:
	var key := "sprite:" + name
	if _cache.has(key): return _cache[key]
	if _regions.is_empty():
		_regions = JSON.parse_string(FileAccess.get_file_as_string(BASE + "regions.json"))
	for sheet_name in ATLASES:
		var index: int = ATLASES[sheet_name].find(name)
		if index < 0: continue
		var sheet := texture(sheet_name)
		if sheet == null: return null
		var atlas := AtlasTexture.new()
		atlas.atlas = sheet
		var box: Array = _regions[sheet_name][index]
		atlas.region = Rect2(box[0], box[1], box[2], box[3])
		atlas.filter_clip = true
		_cache[key] = atlas
		return atlas
	push_error("Unknown unified lesson sprite: " + name)
	return null

static func instrument(config: Dictionary) -> String:
	match String(config.kind):
		"cast": return "block_flat" if config.variant == "blocks" else "coin_heads"
		"parity": return "sand_tray"
		"rings": return "astrolabe"
		"route": return "terrain_map"
		"memory": return "rune_back" if config.variant == "runes" else "card_back"
		"trace": return {"cup": "coffee_cup", "water": "water_bowl", "palm": "palm_chart", "face": "face_chart"}.get(config.variant, "water_bowl")
		"draft": return "card_back"
		"cycle": return "wood"
		"numbers": return "number_tile"
		"timing": return "lot_tube"
	return "coin_heads"

static func suit(config: Dictionary, index: int) -> String:
	return String(SUITS.get(config.variant, SUITS.suits)[index])
