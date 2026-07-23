class_name MapArt
extends RefCounted

## Texture lookup for the map layer (docs/ART_REQUIREMENTS.md §2).
##
## Every texture is loaded once and cached: the map redraws on every reveal and
## every arrival, and load() inside _draw() would re-read from disk each time.
##
## A missing file returns null rather than throwing, and the caller falls back
## to the primitive it drew before. Art should never be able to break the map.

const ART := "res://assets/art/%s.webp"

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

## Cartouche size follows tier, so the map reads its own hierarchy at a glance.
const TIER_SIZE := {
	"metropolis": "l",
	"city": "m",
	"town": "s",
	"station": "s",
}

static var _cache: Dictionary = {}


static func tex(name: String) -> Texture2D:
	if _cache.has(name):
		return _cache[name]
	var path := ART % name
	var t: Texture2D = null
	if ResourceLoader.exists(path):
		t = load(path) as Texture2D
	_cache[name] = t
	return t


static func city_icon(culture: String, tier: String) -> Texture2D:
	var set_name: String = CULTURE_SET.get(culture, "con")
	var size: String = TIER_SIZE.get(tier, "s")
	return tex("map-city-%s-%s" % [set_name, size])


## Station nodes get no cartouche — a waypoint is not a city, and drawing one
## would overstate what is there.
static func has_city_icon(tier: String) -> bool:
	return tier != "station"


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
