extends SceneTree

## GDLC Playtest #1 ratchet — Zayton Ibn Battuta content contract.
## Four assertions, one per ratchet entry (authored RED before the fix):
##   R1 reveal-reason coherence — a reveal_map/reveal_city reason that names a
##      destination ("...-to-X") must name the revealed thing, one of its
##      endpoints, or a documented flavor alias — never a different place.
##      (Playtest #1 P0: registry choice named "sin-kilan" while the effect
##      reveals rt-kinsay-zayton.)
##   R2 economy bound — a choice that charges coins AND grants a good must
##      charge at least half the good's same-city market sell price.
##      (Playtest #1 P0: 500-fen paper-money grant vs 12,648-fen resale.)
##   R3 site reachability — ev-zayton-battuta-a must be listed in zayton's
##      sites, not reachable only through the one-shot entry fork.
##      (Playtest #1 P1.)
##   R4 needs-label units — a coins gate explains itself in display coins
##      (fen / 100), matching the HUD and market. (Playtest #1 P2.)
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
const AUDIT_SEED := "gdlc-pt1"

## Historical/poetic names a reveal reason may legitimately use for the
## revealed place. Curated by hand from the corpus; extend deliberately.
const REVEAL_ALIASES := {
	"bactra": ["balc"],            # Bactra = ancient name of Balkh
	"khanbaliq": ["cambaluc"],     # Khanbaliq = Mongol name of Cambaluc
	"tyre": ["rt-accon-tyrus", "tyrus"],  # Tyre = Tyrus
	"niniveh": ["ninive"],         # Nineveh
	"the-green-pit": ["yarcan"],   # poetic descriptor for Yarkand
	"the-sea": ["basora"],         # descriptor for the river road to Basora
	"the-river": ["basora"],       # descriptor for the river road to Basora
}


func _endpoints(db: ContentDb, route_id: String) -> Array[String]:
	var r: Dictionary = db.get_record(route_id)
	if r.is_empty():
		return []
	var out: Array[String] = []
	var from_id := String(r.get("from", ""))
	var to_id := String(r.get("to", ""))
	if not from_id.is_empty():
		out.append(from_id)
	if not to_id.is_empty():
		out.append(to_id)
	return out


func _init():
	var db := ContentDb.new()
	db.load_all()
	var market := Market.new(db)

	# ---- R1: reveal reasons must not name an unrevealed place ----
	for rec in db.get_table("events"):
		var eid := String(rec.get("id", ""))
		for c in rec.get("choices", []):
			for e in c.get("effects", []):
				var op := String(e.get("op", ""))
				if op != "reveal_map" and op != "reveal_city":
					continue
				var reason := String(e.get("reason", ""))
				var idx := reason.rfind("-to-")
				if idx < 0:
					continue
				var slug := reason.substr(idx + 4)
				var value := String(e.get("value", ""))
				# A slug with a documented alias for the revealed thing is
				# allowed; anything else that names a place is a defect.
				if REVEAL_ALIASES.has(slug) and value in REVEAL_ALIASES[slug]:
					continue
				var allowed: Array[String] = [value]
				if op == "reveal_map" and value.begins_with("rt-"):
					allowed.append_array(_endpoints(db, value))
				if slug not in allowed:
					flag("[严重]", "%s: reason '%s' names '%s', revealed %s=%s, allowed %s"
						% [eid, reason, slug, op, value, str(allowed)])

	# ---- R2: coins-cost choices granting goods must not mint below half market ----
	for rec in db.get_table("events"):
		var eid := String(rec.get("id", ""))
		var when: Dictionary = rec.get("when", {})
		var cities: Array = when.get("cities", [])
		if cities.size() != 1:
			continue
		var city: Dictionary = db.get_record(String(cities[0]))
		if city.is_empty():
			continue
		# A same-city mint needs a market screen to sell into.
		if not city.has("market"):
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
				var good: Dictionary = db.get_record(gid)
				if good.is_empty():
					continue
				var sell := market.sell_price(good, city, AUDIT_JDN, AUDIT_SEED)
				var bound := int(sell * 0.5)
				if -cost < bound:
					var line := "%s: choice '%s' charges %d fen for %d %s (same-city sell %d fen, half-market bound %d fen)" \
						% [eid, String(c.get("label", "?")), -cost, int(granted[gid]), gid, sell, bound]
					# Playtest #1 P0 covers the Zayton battuta mint. The same
					# pattern exists across 50+ events; Playtest #2 delivered
					# the pipeline-level fix (per-city sell-gate, asserted by
					# audit_economy_sellgate.gd S1–S6) — so these lines are
					# informational pricing notes: direct same-city resale is
					# braked, and the launder/overwrite paths are closed by S6.
					if eid == "ev-zayton-battuta-a":
						flag("[严重]", line)
					else:
						flag("[提示]", line)

	# ---- R3: the battuta tale must be a listed site in every city it has ----
	# (Playtest #1 fixed Zayton; Playtest #4 extends the same dynamic-unlock
	# pattern to the kinsay/cail/melibar cameos, which were still reachable
	# only through their one-shot entry forks.)
	for site_id in ["ev-zayton-battuta-a", "ev-kinsay-battuta-a", "ev-cail-battuta-a", "ev-melibar-battuta-a"]:
		var city_id := String(site_id).trim_prefix("ev-").get_slice("-", 0)
		var city_rec: Dictionary = db.get_record(city_id)
		if city_rec.is_empty():
			flag("[严重]", "R3: no city record for %s" % site_id)
			continue
		if not (city_rec.get("sites", []) as Array).has(site_id):
			flag("[严重]", "R3: %s is not in %s's sites list — reachable only via the one-shot entry fork" % [site_id, city_id])

	# ---- R4: needs labels speak display coins, like the HUD and market ----
	var st := WorldState.new()
	var cond := ConditionEvaluator.new()
	var coins_reason := ""
	for r in cond.explain({"coins": {"min": 500}}, st, {}):
		if String(r).begins_with("explain.need_coins:"):
			coins_reason = String(r)
	if coins_reason != "explain.need_coins:5":
		flag("[严重]", "needs label in fen, not display coins: '%s' (want explain.need_coins:5)" % coins_reason)

	print("=== ZAYTON BATTUTA CONTENT AUDIT ===")
	if issues.is_empty():
		print("  no issues")
	for i in issues:
		print("  " + i)
	print("=== %d issues ===" % issues.size())
	var severe := issues.any(func(issue): return issue.begins_with("[严重]"))
	quit(1 if severe else 0)
