class_name Roster
extends RefCounted

## The travelling party (GDD §11).
##
## The mechanic this system exists for is the cargo linkage (§11.7): a porter
## adds land slots, a sailor adds sea slots, and when they leave — dismissed,
## sick, or gone in the night — those slots go with them and the player has to
## deal with cargo that no longer fits. Without that, retainers are a stat card
## with a wage attached.
##
## Party membership lives in WorldState.retainers as plain dictionaries so it
## saves and migrates like everything else. This class only reads and computes;
## every change goes out as an effect (ARCHITECTURE §2.1).

const WAGE_DAYS := 30


var db: ContentDb


func _init(p_db: ContentDb) -> void:
	db = p_db


# ------------------------------------------------------------------- party

func party(state: WorldState) -> Array:
	return state.retainers


func has(state: WorldState, rid: String) -> bool:
	for r in state.retainers:
		if String(r.get("id", "")) == rid:
			return true
	return false


func member(state: WorldState, rid: String) -> Dictionary:
	for r in state.retainers:
		if String(r.get("id", "")) == rid:
			return r
	return {}


func record(rid: String) -> Dictionary:
	return db.get_record(rid)


# -------------------------------------------------------------------- cargo

## Slots a retainer contributes on the journey about to be made.
##
## `condition` is the whole point: a porter's mules are no use at sea and a
## sailor's hold is no use in the Taklamakan. A party that looks large can still
## leave the player short of room on the wrong kind of road.
func slots_from(rec: Dictionary, mode_kind: String) -> int:
	var cargo: Dictionary = rec.get("cargo", {})
	if cargo.is_empty():
		return 0
	match String(cargo.get("condition", "always")):
		"land_only":
			if mode_kind == "sea":
				return 0
		"sea_only":
			if mode_kind != "sea":
				return 0
	return int(cargo.get("slots", 0))


## Total party cargo for a kind of travel. `mode_kind` is land|sea|river.
func party_slots(state: WorldState, mode_kind: String) -> int:
	var total := 0
	for m in state.retainers:
		if not bool(m.get("present", true)):
			continue
		total += slots_from(record(String(m.get("id", ""))), mode_kind)
	return total


## Base hold plus whatever the party carries for this kind of road.
func effective_slots(state: WorldState, mode_kind: String) -> int:
	return state.cargo_slots + party_slots(state, mode_kind)


## Goods that will not fit once `leaving` departs — the consequence the player
## must deal with (§11.7). Returns {over: int, slots_after: int}.
func overflow_if_leaving(state: WorldState, market: Market, leaving_id: String,
		mode_kind: String) -> Dictionary:
	var after := state.cargo_slots
	for m in state.retainers:
		if String(m.get("id", "")) == leaving_id:
			continue
		if not bool(m.get("present", true)):
			continue
		after += slots_from(record(String(m.get("id", ""))), mode_kind)
	var used := market.cargo_used(state)
	return {"over": maxi(0, used - after), "slots_after": after, "used": used}


# ------------------------------------------------------------------- wages

## Wages fall due every thirty days on the road. Unpaid wages are not a debt —
## they are a reason to leave, which is more interesting and easier to reason
## about than a negative balance.
func wages_due(state: WorldState, days: int) -> int:
	var periods := int(floor(float(days) / float(WAGE_DAYS)))
	if periods <= 0:
		return 0
	var total := 0
	for m in state.retainers:
		if not bool(m.get("present", true)):
			continue
		var rec := record(String(m.get("id", "")))
		total += int(rec.get("wage", {}).get("amount", 0)) * periods
	return total


func pay_effects(state: WorldState, days: int) -> Array:
	var due := wages_due(state, days)
	if due <= 0:
		return []
	if state.coins >= due:
		return [{"op": "coins", "value": -due, "reason": "wages-on-the-road"}]
	# Cannot pay: everyone's mood drops. The ones who go are decided by
	# `leaveIf`, checked on arrival, so the player gets a warning first.
	var out: Array = []
	for m in state.retainers:
		out.append({"op": "retainer_mood", "id": String(m.get("id", "")), "value": -4,
			"reason": "wages-unpaid"})
	return out


# ------------------------------------------------------------- recruitment

## Who can be hired here, and how. GDD §11.2: small places have no pool.
func candidates(state: WorldState, city_id: String, mode: String) -> Array:
	var out: Array = []
	for r in db.get_table("retainers"):
		if has(state, String(r.get("id", ""))):
			continue
		if r.has("teaches"):
			continue                      # mentors teach, they do not travel
		if mode not in (r.get("hireMode", []) as Array):
			continue
		for v in r.get("recruitAt", []):
			if String(v.get("cityId", "")) == city_id:
				out.append(r)
				break
	return out


## The divined shortlist: three candidates "well matched to your fate right
## now". What the player is shown is a reading, not a stat block (§11.3) — so
## this returns the picks and a verdict key, never the numbers behind them.
func divined_shortlist(state: WorldState, city_id: String, rng: Rng) -> Array:
	var pool := candidates(state, city_id, "divined")
	if pool.is_empty():
		return []
	var picked := rng.fork("hire:%s:%d" % [city_id, state.jdn]).shuffle(pool)
	var out: Array = []
	for i in mini(3, picked.size()):
		var r: Dictionary = picked[i]
		out.append({"retainer": r, "verdict": _verdict(r, state)})
	return out


## Reads the candidate's fate bars against the player's, and names the reading
## rather than the arithmetic. GDD §11.3's phrasings.
func _verdict(rec: Dictionary, state: WorldState) -> String:
	var f: Dictionary = rec.get("fate", {})
	var company := int(f.get("company", 0))
	var road := int(f.get("road", 0))
	var success := int(f.get("success", 0))
	if company >= 22 and road >= 18:
		return "verdict.fit_for_the_year"
	if road >= 22 and company < 14:
		return "verdict.good_road_poor_company"
	if success >= 22 and road < 14:
		return "verdict.trade_not_travel"
	if company < 12:
		return "verdict.short_term_only"
	return "verdict.unremarkable"


func hire_effects(rec: Dictionary) -> Array:
	return [{"op": "recruit", "value": String(rec.get("id", "")),
		"reason": "hired-at-%s" % String(rec.get("origin", {}).get("city", "?"))}]


func dismiss_effects(rid: String) -> Array:
	return [{"op": "dismiss", "value": rid, "reason": "parted-ways"}]


# ------------------------------------------------------- departure & change

## Who leaves, and why. Checked on arrival so the player is never stranded
## mid-road by a decision they could not see coming.
func departures(state: WorldState) -> Array:
	var out: Array = []
	for m in state.retainers:
		if not bool(m.get("present", true)):
			continue
		var rid := String(m.get("id", ""))
		var rec := record(rid)
		var cond: Dictionary = rec.get("leaveIf", {})
		var mood := int(m.get("mood", 16))

		if cond.has("loyaltyBelow") and mood < int(cond["loyaltyBelow"]):
			out.append({"id": rid, "reason": "leave.unpaid_or_unhappy"})
			continue
		var faiths: Array = cond.get("playerFaithChangedTo", [])
		if not faiths.is_empty() and state.faith in faiths:
			out.append({"id": rid, "reason": "leave.faith"})
			continue
		# Contract expiry: months are counted from the day they joined.
		var months := int(rec.get("contract", {}).get("months", 12))
		var joined := int(m.get("joined_jdn", state.jdn))
		if months > 0 and state.jdn - joined > months * 30:
			out.append({"id": rid, "reason": "leave.contract_ended"})
	return out


## Yearly fate shifts (§11.6). The data already carries `yearly`; this applies
## the entry for the year just entered, if any.
func yearly_effects(state: WorldState, year: int) -> Array:
	var out: Array = []
	for m in state.retainers:
		var rec := record(String(m.get("id", "")))
		for y in rec.get("yearly", []):
			if int(y.get("year", 0)) != year:
				continue
			var deltas: Dictionary = y.get("deltas", {})
			if deltas.has("company"):
				out.append({"op": "retainer_mood", "id": String(m.get("id", "")),
					"value": int(deltas["company"]), "reason": "yearly-turn"})
	return out


# ------------------------------------------------------------ birth reveal

## Three layers, 3 -> 0 (§11.4). Returns what is currently known.
func birth_known(state: WorldState, rid: String) -> String:
	var m := member(state, rid)
	if m.is_empty():
		return "birth.unknown"
	var rec := record(rid)
	var seal := int(m.get("seal", rec.get("birth", {}).get("sealLevel", 3)))
	match seal:
		0: return "birth.full"
		1: return "birth.date_approx"
		2: return "birth.season"
	return "birth.unknown"


func can_reveal(state: WorldState, rid: String) -> bool:
	var m := member(state, rid)
	if m.is_empty():
		return false
	var rec := record(rid)
	return int(m.get("seal", rec.get("birth", {}).get("sealLevel", 3))) > 0
