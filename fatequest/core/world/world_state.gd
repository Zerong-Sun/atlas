class_name WorldState
extends RefCounted

## The entire mutable world. See docs/CODE_PLAN.md §2.4.
##
## INVARIANT: only EffectExecutor writes this. Every other module reads.
## CI門禁 G9 greps core/ for assignments to state fields outside
## narrative/effect_executor.gd. If you find yourself wanting to mutate this
## from elsewhere, the answer is to emit an effect instead — that is the whole
## point of the instruction set (docs/ARCHITECTURE.md §2.1).

var seed: String = ""
var jdn: int = 0                      ## Julian Day Number — the one authoritative date
var city: String = ""                 ## current location id

var coins: int = 0                    ## in fen (1/100 of a coin); integers only, never float
var days_elapsed: int = 0
var faith: String = "latin"

var fate: Dictionary = {"travel": 15, "rapport": 15, "wealth": 15}
var languages: Array[String] = []
var items: Array[String] = []
var goods: Dictionary = {}            ## good_id -> count
var cargo_slots: int = 4

var revealed: Dictionary = {}         ## city_id/route_id -> 0..3 intel level
var unlocked_routes: Array[String] = []
var learned_divinations: Array[String] = []
var flags: Dictionary = {}            ## flag_id -> true
var city_reputation: Dictionary = {}
var band_reputation: Dictionary = {}
var retainers: Array = []
var once_fired: Dictionary = {}       ## event_id -> true
var stickers: Array[String] = []
var codex: Array[String] = []
var etiquette: Dictionary = {}         ## culture_region -> level (CODE_PLAN §3.2)
var birthdate_jdn: int = -1           ## player natal day for bazi; -1 = unset

## Journey record (GDD §14). The epilogue has to name the road this player
## actually walked, so the facts it needs are recorded as they happen rather
## than reconstructed at the end. `revealed` is deliberately not reused here:
## reading a map reveals a city, and a book of travels may not claim a place
## its author only heard about.
var start_city: String = ""           ## set on the first departure, never after
var visited: Array[String] = []       ## every city stood in, in arrival order
var longest_leg: Dictionary = {}      ## {route, km, days} — the hardest single road
var best_trade: Dictionary = {}       ## {good, profit} — the most profitable sale

## Cost basis per good: good_id -> {band, unit}. Needed to say what a sale
## actually earned, and to charge the money-changer for carrying silver across
## a currency frontier — until this existed, the caller passed the *selling*
## city's band as the buying band, so the exchange penalty could never fire.
var purchases: Dictionary = {}


func duplicate_state() -> WorldState:
	## Deep copy for EffectExecutor.preview(). Must stay in sync with the fields
	## above — a missed field makes preview silently diverge from execute, which
	## is worse than no preview at all.
	var s := WorldState.new()
	s.seed = seed
	s.jdn = jdn
	s.city = city
	s.coins = coins
	s.days_elapsed = days_elapsed
	s.faith = faith
	s.fate = fate.duplicate(true)
	s.languages = languages.duplicate()
	s.items = items.duplicate()
	s.goods = goods.duplicate(true)
	s.cargo_slots = cargo_slots
	s.revealed = revealed.duplicate(true)
	s.unlocked_routes = unlocked_routes.duplicate()
	s.learned_divinations = learned_divinations.duplicate()
	s.flags = flags.duplicate(true)
	s.city_reputation = city_reputation.duplicate(true)
	s.band_reputation = band_reputation.duplicate(true)
	s.retainers = retainers.duplicate(true)
	s.once_fired = once_fired.duplicate(true)
	s.stickers = stickers.duplicate()
	s.codex = codex.duplicate()
	s.etiquette = etiquette.duplicate(true)
	s.birthdate_jdn = birthdate_jdn
	s.start_city = start_city
	s.visited = visited.duplicate()
	s.longest_leg = longest_leg.duplicate(true)
	s.best_trade = best_trade.duplicate(true)
	s.purchases = purchases.duplicate(true)
	return s


func reputation(scope: String, id: String) -> int:
	var table: Dictionary = city_reputation if scope == "city" else band_reputation
	return table.get(id, 0)
