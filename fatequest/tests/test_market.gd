extends RefCounted

## Trade correctness plus the G6 balance gate (ARCHITECTURE §9, GDD §9.2).
##
## The headline numbers look absurd — buy at 150, sell at 900 — and they are
## meant to. What has to be true is that the FULL circuit, after fares, spread,
## spoilage, theft and money-changers, lands in a sane band. A world where a
## single run turns 220 silver into 20,000 is a spreadsheet, not a journey.
##
## This is the first test that pays off the determinism rule directly: ten
## thousand simulated runs need no window and no frames.

const RUNS := 4000

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var mk := Market.new(db)
	var exec := EffectExecutor.new()

	_correctness(db, mk, exec)
	_determinism(db, mk)
	_balance(db, mk, exec)

	print("test_market: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0


# ------------------------------------------------------------- correctness

func _correctness(db: ContentDb, mk: Market, exec: EffectExecutor) -> void:
	var zayton := db.get_record("zayton")
	var venice_good := db.get_record("murano-glass")   # europe origin
	var silk := db.get_record("silk")                  # china origin

	_ok(mk.demand_tier(silk, zayton) == 0, "Zayton makes silk: home tier")
	_ok(mk.demand_tier(venice_good, zayton) == 2, "Zayton craves Murano glass: hot tier")

	var jdn := GameDate.from_gregorian(1292, 4, 11).jdn
	var home := mk.mid_price(silk, zayton, jdn, "s")
	var hot := mk.mid_price(venice_good, zayton, jdn, "s")
	_ok(hot > home * 3, "a craved good costs far more than a local one (%d vs %d)" % [hot, home])

	# The spread always works against the player, in both directions.
	_ok(mk.buy_price(silk, zayton, jdn, "s") > mk.sell_price(silk, zayton, jdn, "s"),
		"buying costs more than selling pays")

	# Cargo accounting.
	var st := WorldState.new()
	st.seed = "t"
	st.city = "zayton"
	st.coins = 500000
	st.cargo_slots = 4
	exec.execute(st, mk.buy_effects(silk, zayton, jdn, "t"), {"event_id": "buy"})
	_ok(st.goods.get("silk", 0) == 1, "purchase adds the good")
	_ok(mk.cargo_used(st) == int(silk.get("bulk", 1)), "cargo counts by bulk")

	# A full hold blocks the next purchase, and says so.
	var full := WorldState.new()
	full.seed = "t"
	full.city = "zayton"
	full.coins = 5000000
	full.cargo_slots = 1
	full.goods = {"porcelain": 1}       # bulk 2 > 1 slot
	var chk := mk.can_buy(silk, zayton, full, jdn)
	_ok(not chk["ok"], "a full hold blocks a purchase")
	_ok(chk["reasons"].any(func(r): return String(r).begins_with("trade.no_cargo_room")),
		"and the reason names the cargo, not just 'no'")

	# Poverty blocks it too.
	var poor := WorldState.new()
	poor.seed = "t"
	poor.city = "zayton"
	poor.coins = 1
	poor.cargo_slots = 9
	_ok(not mk.can_buy(silk, zayton, poor, jdn)["ok"], "no money, no purchase")

	# Crossing a currency zone costs.
	_ok(mk.exchange_penalty("china", "europe", 10000) > 0, "cross-currency sale loses on exchange")
	_ok(mk.exchange_penalty("china", "china", 10000) == 0, "same currency loses nothing")


# ------------------------------------------------------------ determinism

func _determinism(db: ContentDb, mk: Market) -> void:
	var c := db.get_record("kinsay")
	var g := db.get_record("pepper")
	var jdn := GameDate.from_gregorian(1300, 1, 1).jdn
	_ok(mk.mid_price(g, c, jdn, "seed-a") == mk.mid_price(g, c, jdn, "seed-a"),
		"same city, day and seed quote the same price")
	_ok(mk.mid_price(g, c, jdn, "seed-a") != mk.mid_price(g, c, jdn + 40, "seed-a"),
		"prices move between days")
	_ok(mk.mid_price(g, c, jdn, "seed-a") != mk.mid_price(g, c, jdn, "seed-b"),
		"different runs see different markets")


# --------------------------------------------------------------- G6 balance

## Simulates a merchant: buy at home, carry it a leg, sell into demand, pay the
## fare. Reports the distribution of return on the whole circuit.
func _balance(db: ContentDb, mk: Market, exec: EffectExecutor) -> void:
	var travel := Travel.new(db, exec)
	var cities: Array = db.cities().filter(func(c): return c.has("market"))
	var routes: Array = db.get_table("routes")
	var by_city := {}
	for r in routes:
		for end_key in ["from", "to"]:
			var k := String(r[end_key])
			if not by_city.has(k):
				by_city[k] = []
			by_city[k].append(r)

	var returns: Array[float] = []
	var busts := 0

	for i in RUNS:
		var rng := Rng.new("balance:%d" % i)
		var origin: Dictionary = cities[rng.next_int(cities.size())]
		var goods := mk.stock(origin)
		if goods.is_empty():
			continue
		var good: Dictionary = goods[rng.next_int(goods.size())]

		var legs: Array = by_city.get(origin["id"], [])
		if legs.is_empty():
			continue
		var route: Dictionary = legs[rng.next_int(legs.size())]
		var dest := db.get_record(travel.other_end(route, String(origin["id"])))
		if dest.is_empty() or not dest.has("market"):
			continue

		var jdn := GameDate.from_gregorian(1292, 1, 1).jdn + rng.next_int(300)

		var st := WorldState.new()
		st.seed = "balance:%d" % i
		st.city = String(origin["id"])
		st.coins = 40000
		st.cargo_slots = 10
		var start_coins := st.coins

		# Buy as much as purse and hold allow — the greedy play, which is the
		# one that would break the economy if anything does.
		var bought := 0
		while bought < 6 and mk.can_buy(good, origin, st, jdn)["ok"]:
			exec.execute(st, mk.buy_effects(good, origin, jdn, st.seed), {"event_id": "b"})
			bought += 1
		if bought == 0:
			continue

		# Carry it. Fare, days, and losses en route.
		var mode := String((route.get("modes", ["caravan"]) as Array)[0])
		var days := travel.total_days(route, mode)
		var fare := travel.total_cost(route, mode)
		st.coins -= fare
		exec.execute(st, mk.travel_losses(st, route, days, rng.fork("legloss")), {"event_id": "loss"})
		var arrive_jdn := jdn + days

		# Sell everything that survived.
		var left := int(st.goods.get(good["id"], 0))
		for k in left:
			exec.execute(st, mk.sell_effects(good, dest, arrive_jdn, st.seed,
				String(origin.get("band", ""))), {"event_id": "s"})

		if st.coins <= 0:
			busts += 1
		returns.append(float(st.coins - start_coins) / float(start_coins))

	_ok(returns.size() > RUNS / 4, "enough viable circuits to judge (%d)" % returns.size())
	if returns.is_empty():
		return

	returns.sort()
	var median: float = returns[returns.size() / 2]
	var p90: float = returns[int(returns.size() * 0.9)]
	var p10: float = returns[int(returns.size() * 0.1)]
	var mean := 0.0
	for r in returns:
		mean += r
	mean /= float(returns.size())

	print("    G6 %d circuits · median %+.1f%% · p10 %+.1f%% · p90 %+.1f%% · busts %d"
		% [returns.size(), median * 100.0, p10 * 100.0, p90 * 100.0, busts])

	# A single leg must be able to lose money, or there is no decision to make.
	_ok(p10 < 0.0, "the bottom decile loses money (p10 %+.1f%%)" % (p10 * 100.0))
	# And it must not be a licence to print it.
	_ok(p90 < 4.0, "the top decile is not a money printer (p90 %+.1f%%)" % (p90 * 100.0))
	_ok(median > -0.5, "the median run is not ruinous (%.1f%%)" % (median * 100.0))
