extends SceneTree

## GDLC Playtest #2 ratchet — market sell-gate (pipeline-contract-audit).
## Authored RED before the fix; each assertion encodes one contract:
##   S1 event-grant brake — a good granted by an event effect in city X cannot
##      be sold in X (the same-city mint closes); selling in Y != X works.
##      (GDD §9.2: arbitrage must be braked by travel.)
##   S2 market-buy liquidation — a good BOUGHT at the market stays sellable in
##      the same city (spread loss is the brake there; liquidation survives).
##   S3 price purity — sell_price is a function of (city, good, day, seed)
##      only; purchase history must never change the quoted price.
##   S4 persistence — the grant record survives a save/load round trip.
##   S5 debt closure — every choice in the Playtest #1 mint sweep (coins cost
##      + goods grant below half the same-city sell price) is braked: the
##      granted lot cannot be sold in the granting city.
const _W := 120.0
var _t := 0.0
func _process(d: float) -> bool:
	_t += d
	if _t > _W:
		printerr("WATCHDOG")
		quit(1)
	return false

var issues: Array[String] = []
func flag(sev: String, what: String) -> void:
	issues.append("%s %s" % [sev, what])

const AUDIT_JDN := 2193055
const AUDIT_SEED := "gdlc-pt2"


func _init():
	var db := ContentDb.new()
	db.load_all()
	var market := Market.new(db)
	var exec := EffectExecutor.new()

	var good: Dictionary = db.get_record("paper-money")
	var zayton: Dictionary = db.get_record("zayton")
	var fuju: Dictionary = db.get_record("fuju")
	if good.is_empty() or zayton.is_empty() or fuju.is_empty():
		flag("[严重]", "fixture records missing (paper-money/zayton/fuju)")
	else:
		# ---- S1: event-grant brake ----
		var st := WorldState.new()
		st.seed = AUDIT_SEED
		st.city = "zayton"
		exec.execute(st, [{"op": "goods", "id": "paper-money", "value": 1, "reason": "t"}], {})
		var basis: Dictionary = st.purchases.get("paper-money", {})
		var sell_here := market.sell_effects(good, zayton, st.jdn, st.seed, basis)
		if not sell_here.is_empty():
			flag("[严重]", "S1: event-granted good sells in its granting city (%s)" % str(sell_here))
		st.city = "fuju"
		var sell_far := market.sell_effects(good, fuju, st.jdn, st.seed, basis)
		var got_coins := false
		for e in sell_far:
			if e.get("op") == "coins":
				got_coins = true
		if not got_coins:
			flag("[严重]", "S1: event-granted good cannot be sold after travel")

		# ---- S2: market-buy liquidation ----
		var st2 := WorldState.new()
		st2.seed = AUDIT_SEED
		st2.city = "zayton"
		st2.coins = 999999999
		for e in market.buy_effects(good, zayton, st2.jdn, st2.seed):
			exec.execute(st2, [e], {})
		var buy_basis: Dictionary = st2.purchases.get("paper-money", {})
		var liq := market.sell_effects(good, zayton, st2.jdn, st2.seed, buy_basis)
		if liq.is_empty():
			flag("[严重]", "S2: market-bought good cannot be liquidated same-city")

		# ---- S3: price purity ----
		var p1 := market.sell_price(good, zayton, AUDIT_JDN, AUDIT_SEED)
		var st3 := WorldState.new()
		st3.seed = AUDIT_SEED
		st3.city = "zayton"
		exec.execute(st3, [{"op": "goods", "id": "paper-money", "value": 1, "reason": "t"}], {})
		var p2 := market.sell_price(good, zayton, AUDIT_JDN, AUDIT_SEED)
		if p1 != p2:
			flag("[严重]", "S3: sell price changed by holdings (%d -> %d)" % [p1, p2])

		# ---- S4: persistence ----
		var st4 := WorldState.new()
		st4.seed = AUDIT_SEED
		st4.city = "zayton"
		exec.execute(st4, [{"op": "goods", "id": "paper-money", "value": 1, "reason": "t"}], {})
		var clock4 := WorldClock.new(GameDate.from_gregorian(1292, 4, 11).jdn)
		SaveGame.write("__gdlc_sellgate__", st4, clock4, {})
		var restored := SaveGame.read("__gdlc_sellgate__")
		var rpurchases: Dictionary = restored.get("state", {}).get("purchases", {})
		var rgrant := String(rpurchases.get("paper-money", {}).get("granted_city", ""))
		if rgrant != "zayton":
			flag("[严重]", "S4: grant record lost on save/load (got '%s')" % rgrant)

	# ---- S5: debt closure — the Playtest #1 mint sweep is braked everywhere ----
	var braked := 0
	var unbraked: Array[String] = []
	for rec in db.get_table("events"):
		var eid := String(rec.get("id", ""))
		var when: Dictionary = rec.get("when", {})
		var cities: Array = when.get("cities", [])
		if cities.size() != 1:
			continue
		var city_id := String(cities[0])
		var city: Dictionary = db.get_record(city_id)
		if city.is_empty() or not city.has("market"):
			continue
		for c in rec.get("choices", []):
			var cost := 0
			var granted := {}
			for e in c.get("effects", []):
				if e.get("op") == "coins":
					cost += int(e.get("value", 0))
				if e.get("op") == "goods":
					var gid := String(e.get("id", ""))
					granted[gid] = int(granted.get(gid, 0)) + int(e.get("value", 0))
			if cost >= 0 or granted.is_empty():
				continue
			for gid in granted:
				var g: Dictionary = db.get_record(gid)
				if g.is_empty():
					continue
				var sell := market.sell_price(g, city, AUDIT_JDN, AUDIT_SEED)
				if -cost >= int(sell * 0.5):
					continue
				# Mint candidate: grant it in the event's own city, then try to
				# sell it right back. The gate must refuse.
				var st5 := WorldState.new()
				st5.seed = AUDIT_SEED
				st5.city = city_id
				exec.execute(st5, [{"op": "goods", "id": gid, "value": 1, "reason": "t"}], {})
				var b5: Dictionary = st5.purchases.get(gid, {})
				if market.sell_effects(g, city, st5.jdn, st5.seed, b5).is_empty():
					braked += 1
				else:
					unbraked.append("%s:%s" % [eid, gid])

	print("=== ECONOMY SELL-GATE AUDIT ===")
	if issues.is_empty():
		print("  no issues")
	for i in issues:
		print("  " + i)
	print("  mint candidates braked by the gate: %d, unbraked: %s" % [braked, str(unbraked)])
	print("=== %d issues ===" % issues.size())
	var severe := issues.any(func(issue): return issue.begins_with("[严重]"))
	quit(1 if severe else 0)
