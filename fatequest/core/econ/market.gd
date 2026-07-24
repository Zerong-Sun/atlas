class_name Market
extends RefCounted

## Prices, cargo and money. See GDD §9.
##
## Two rules shape everything here:
##
##   1. A price is a FUNCTION of (city, good, day, seed) — never stored state.
##      The same market on the same morning always quotes the same figure, so a
##      player can leave, think, and come back without the world reshuffling
##      under them; and a save needs to record nothing about prices at all.
##
##   2. Arbitrage must be braked by travel (GDD §9.2). Buying at 150 and selling
##      at 900 is the headline, but fares, spread, spoilage, theft and currency
##      loss eat most of it. If they ever stop doing so the game becomes a
##      spreadsheet, which is what gate G6 exists to catch.

## Money is integer fen throughout — 1/100 of a coin. No floats touch a purse.
const FEN := 100

## Currency zones. Crossing one costs you (GDD §9.3): a merchant who trades
## across the Silk Road bleeds a few percent at every money-changer.
const CURRENCY_BY_BAND := {
	"europe": "ducat",
	"west_asia": "dinar",
	"central_asia": "dirham",
	"steppe": "silver-ingot",
	"china": "cash",
	"india": "dinar",
	"maritime_asia": "dinar",
}
const EXCHANGE_LOSS := 0.06


var db: ContentDb


func _init(p_db: ContentDb) -> void:
	db = p_db


# ------------------------------------------------------------------ pricing

## How much this city wants this good: 0 = it makes the stuff, 1 = ordinary
## distance, 2 = high demand.
func demand_tier(good: Dictionary, city: Dictionary) -> int:
	var band := String(city.get("band", ""))
	var origin: Array = good.get("origin", [])
	if band in origin or String(city.get("id", "")) in origin:
		return 0
	if band in (good.get("hot", {}).get("bands", []) as Array):
		return 2
	return 1


## Mid price in fen, before spread. Deterministic in (city, good, day).
func mid_price(good: Dictionary, city: Dictionary, jdn: int, seed: String) -> int:
	var tier := demand_tier(good, city)
	var band_range: Array = good.get("base", [100, 200])
	match tier:
		1: band_range = good.get("far", [200, 300])
		2: band_range = good.get("hot", {}).get("range", [800, 1000])

	var lo := int(band_range[0])
	var hi := int(band_range[1])

	# The day's quote sits somewhere in the band. Seeded per city+good+day so a
	# market is stable within a day and moves between days.
	var rng := Rng.new("%s:price:%s:%s:%d" % [seed, city.get("id", ""), good.get("id", ""), jdn])
	var t := rng.next()

	# A city that produces the good has a glut; a city that craves it has a
	# shortage. Skewing within the band beats widening it, which would make the
	# extremes unreachable.
	if tier == 0:
		t = t * 0.6
	elif tier == 2:
		t = 0.4 + t * 0.6

	return lo + int(round(float(hi - lo) * t))


## What the player pays. The spread is the merchant's cut and always works
## against you in both directions.
func buy_price(good: Dictionary, city: Dictionary, jdn: int, seed: String) -> int:
	var spread := float(city.get("market", {}).get("spread", 0.2))
	return int(round(float(mid_price(good, city, jdn, seed)) * (1.0 + spread * 0.5)))


func sell_price(good: Dictionary, city: Dictionary, jdn: int, seed: String) -> int:
	var spread := float(city.get("market", {}).get("spread", 0.2))
	var gross := float(mid_price(good, city, jdn, seed)) * (1.0 - spread * 0.5)
	return int(round(gross))


## Selling into a different currency zone from where you bought loses on the
## exchange. Tracked per lot so the loss is real rather than notional.
func exchange_penalty(from_band: String, to_band: String, amount: int) -> int:
	var a: String = CURRENCY_BY_BAND.get(from_band, "dinar")
	var b: String = CURRENCY_BY_BAND.get(to_band, "dinar")
	if a == b:
		return 0
	return int(round(float(amount) * EXCHANGE_LOSS))


# -------------------------------------------------------------------- cargo

func cargo_used(state: WorldState) -> int:
	var used := 0
	for gid in state.goods:
		var g := db.get_record(String(gid))
		used += int(g.get("bulk", 1)) * int(state.goods[gid])
	return used


func cargo_free(state: WorldState) -> int:
	return maxi(0, state.cargo_slots - cargo_used(state))


## Everything that blocks a purchase, phrased so the UI can say WHY (GDD §7.1).
func can_buy(good: Dictionary, city: Dictionary, state: WorldState, jdn: int) -> Dictionary:
	var reasons: Array[String] = []
	var price := buy_price(good, city, jdn, state.seed)
	if state.coins < price:
		reasons.append("trade.cannot_afford:%d" % (price / FEN))
	var bulk := int(good.get("bulk", 1))
	if cargo_free(state) < bulk:
		reasons.append("trade.no_cargo_room:%d" % bulk)
	for n in good.get("needs", []):
		if String(n) == "guarded" and not _has_guard(state):
			reasons.append("trade.needs_guard")
	return {"ok": reasons.is_empty(), "price": price, "reasons": reasons}


func _has_guard(_state: WorldState) -> bool:
	# Retainers land in P5; until then valuables travel at the player's risk
	# rather than being unbuyable.
	return true


# ------------------------------------------------------------------- orders

## Effects for a purchase. Trade goes through the effect executor like
## everything else — no system writes WorldState directly (ARCHITECTURE §2.1).
func buy_effects(good: Dictionary, city: Dictionary, jdn: int, seed: String) -> Array:
	var price := buy_price(good, city, jdn, seed)
	var gid := String(good.get("id", ""))
	var why := "bought-%s-at-%s" % [gid, city.get("id", "")]
	return [
		{"op": "coins", "value": -price, "reason": why},
		{"op": "goods", "id": gid, "value": 1, "reason": why},
		# Order matters: `bought` averages against the new holding, so it must
		# run after `goods` has counted this unit.
		{"op": "bought", "id": gid, "value": price,
			"band": String(city.get("band", "")), "reason": why},
	]


## `basis` is this good's purchase record — `state.purchases[gid]`, shaped
## `{band, unit}`. Pass it and the sale knows where the silver came from and
## what the lot cost.
##
## It used to be a bare `bought_band` supplied by the caller, and the one caller
## passed the band of the city doing the *selling* — so the comparison below was
## always band-against-itself and the money-changer never took a cut. A cost
## basis that the kernel records at purchase cannot be got wrong that way.
##
## An empty basis is legitimate: goods also arrive as event rewards. Such a sale
## pays no exchange penalty and is not a candidate for the epilogue's
## {richestTrade} — an assumed cost would put a number in the player's closing
## paragraph that no transaction ever produced.
func sell_effects(good: Dictionary, city: Dictionary, jdn: int, seed: String,
		basis: Dictionary = {}) -> Array:
	var gross := sell_price(good, city, jdn, seed)
	var gid := String(good.get("id", ""))
	var band := String(city.get("band", ""))
	var bought_band := String(basis.get("band", ""))
	var loss := 0
	if bought_band != "" and bought_band != band:
		loss = exchange_penalty(bought_band, band, gross)
	var why := "sold-%s-at-%s" % [gid, city.get("id", "")]
	var out: Array = [
		{"op": "goods", "id": gid, "value": -1, "reason": why},
		{"op": "coins", "value": gross - loss, "reason": why},
	]
	if loss > 0:
		out.append({"op": "flag", "value": "fl-paid-exchange", "reason": "money-changer-took-a-cut"})
	if basis.has("unit"):
		out.append({"op": "trade", "id": gid, "value": gross - loss - int(basis["unit"]),
			"reason": why})
	return out


## Hazards of carrying goods, resolved once per leg of travel. This is half of
## the arbitrage brake: the other half is fares.
func travel_losses(state: WorldState, route: Dictionary, days: int, rng: Rng) -> Array:
	var effects: Array = []
	var risk := int(route.get("risk", 0))
	for gid in state.goods.keys():
		var g := db.get_record(String(gid))
		if g.is_empty():
			continue
		var r: Dictionary = g.get("risk", {})
		var spoil := float(r.get("spoil", 0.0)) * (float(days) / 30.0)
		var theft := float(r.get("theft", 0.0)) * (1.0 + 0.25 * float(risk))
		var lot := int(state.goods[gid])
		for i in lot:
			var f := rng.fork("loss:%s:%s:%d" % [route.get("id", "?"), gid, i])
			if spoil > 0.0 and f.next() < spoil:
				effects.append({"op": "goods", "id": String(gid), "value": -1,
					"reason": "spoiled-on-the-road", "chance": 1.0})
			elif theft > 0.0 and f.next() < theft:
				effects.append({"op": "goods", "id": String(gid), "value": -1,
					"reason": "stolen-on-the-road", "chance": 1.0})
	return effects


## Goods this city trades, as records.
func stock(city: Dictionary) -> Array:
	var out: Array = []
	for gid in city.get("market", {}).get("goods", []):
		var g := db.get_record(String(gid))
		if not g.is_empty():
			out.append(g)
	return out
