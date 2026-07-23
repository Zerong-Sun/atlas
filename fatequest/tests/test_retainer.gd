extends RefCounted

## Retainers (GDD §11), with the cargo linkage first.
##
## §11.7 is the mechanic the whole system exists for: a retainer's hold leaves
## when they do, and the player has to deal with cargo that no longer fits.
## Everything else — wages, contracts, verdicts — is texture around that.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var ros := Roster.new(db)
	var exec := EffectExecutor.new()
	var mk := Market.new(db)

	_hiring(db, ros, exec)
	_cargo(db, ros, exec, mk)
	_wages(db, ros, exec)
	_departure(db, ros, exec)
	_birth(db, ros, exec)

	print("test_retainer: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0


func _st(city: String = "tauris") -> WorldState:
	var s := WorldState.new()
	s.seed = "ret"
	s.city = city
	s.coins = 200000
	s.jdn = GameDate.from_gregorian(1292, 4, 11).jdn
	return s


# ------------------------------------------------------------------ hiring

func _hiring(db: ContentDb, ros: Roster, exec: EffectExecutor) -> void:
	var st := _st()
	var open_pool := ros.candidates(st, "tauris", "open")
	_ok(not open_pool.is_empty(), "Tabriz has an open hiring pool")
	# Mentors teach; they do not join the party.
	_ok(not open_pool.any(func(r): return r.has("teaches")),
		"mentors are not offered as travelling companions")

	var who: Dictionary = open_pool[0]
	exec.execute(st, ros.hire_effects(who), {"event_id": "hire"})
	_ok(ros.has(st, String(who["id"])), "hiring puts them in the party")
	_ok(st.retainers.size() == 1, "exactly one")

	# Hiring the same person twice must not stack.
	var again := exec.execute(st, ros.hire_effects(who), {"event_id": "hire2"})
	_ok(st.retainers.size() == 1, "cannot hire the same person twice")
	_ok(not again.rejected.is_empty(), "and the attempt is reported as rejected")

	var m := ros.member(st, String(who["id"]))
	_ok(int(m.get("mood", -1)) == 16, "starts at an even mood")
	_ok(int(m.get("seal", -1)) == 3, "birth starts sealed")
	_ok(int(m.get("joined_jdn", 0)) == st.jdn, "join date recorded for the contract")

	# The divined shortlist gives readings, not stat blocks.
	var short := ros.divined_shortlist(st, "tauris", Rng.new("s"))
	if not short.is_empty():
		_ok(short.size() <= 3, "the shortlist is at most three")
		_ok(String(short[0].get("verdict", "")).begins_with("verdict."),
			"a candidate comes with a verdict, not numbers")
		var same := ros.divined_shortlist(st, "tauris", Rng.new("s"))
		_ok(str(same.map(func(x): return x["retainer"]["id"]))
			== str(short.map(func(x): return x["retainer"]["id"])),
			"the same day gives the same three — no rerolling by re-entering")


# ------------------------------------------------------------------- cargo

func _cargo(db: ContentDb, ros: Roster, exec: EffectExecutor, mk: Market) -> void:
	var st := _st()
	var base := st.cargo_slots

	# A porter carries on land and is no help at sea.
	var porter := db.get_record("npc-tauris-porter")
	_ok(not porter.is_empty(), "the porter exists")
	exec.execute(st, ros.hire_effects(porter), {"event_id": "h"})

	var land := ros.effective_slots(st, "land")
	var sea := ros.effective_slots(st, "sea")
	_ok(land > base, "a porter adds hold on land (%d -> %d)" % [base, land])
	_ok(sea == base, "and adds none at sea (%d)" % sea)

	# A sailor is the mirror image.
	var sailor := db.get_record("npc-ormus-sailor")
	if not sailor.is_empty():
		var st2 := _st("ormus")
		exec.execute(st2, ros.hire_effects(sailor), {"event_id": "h"})
		_ok(ros.effective_slots(st2, "sea") > st2.cargo_slots, "a sailor adds hold at sea")
		_ok(ros.effective_slots(st2, "land") == st2.cargo_slots, "and none on land")

	# §11.7: losing them strands cargo. This is the consequence that makes a
	# retainer a decision rather than a stat.
	st.goods = {"silk": 6}
	var used := mk.cargo_used(st)
	_ok(used <= land, "the cargo fits while the porter is with you")
	var of := ros.overflow_if_leaving(st, mk, "npc-tauris-porter", "land")
	_ok(int(of["over"]) > 0,
		"dismissing the porter strands %d units of cargo" % int(of["over"]))
	_ok(int(of["slots_after"]) == base, "and the hold returns to the base size")

	# After they actually go, the hold really is smaller.
	exec.execute(st, ros.dismiss_effects("npc-tauris-porter"), {"event_id": "d"})
	_ok(ros.effective_slots(st, "land") == base, "the hold shrinks when they leave")
	_ok(not ros.has(st, "npc-tauris-porter"), "and they are out of the party")


# ------------------------------------------------------------------- wages

func _wages(db: ContentDb, ros: Roster, exec: EffectExecutor) -> void:
	var st := _st()
	var who: Dictionary = ros.candidates(st, "tauris", "open")[0]
	exec.execute(st, ros.hire_effects(who), {"event_id": "h"})

	_ok(ros.wages_due(st, 10) == 0, "no wages inside the first month")
	var due := ros.wages_due(st, 60)
	_ok(due > 0, "two months on the road owes two months' wages")
	_ok(due == ros.wages_due(st, 30) * 2, "and it scales with the months")

	var before := st.coins
	exec.execute(st, ros.pay_effects(st, 30), {"event_id": "w"})
	_ok(st.coins < before, "wages come out of the purse")

	# Cannot pay: mood falls rather than the purse going negative.
	var poor := _st()
	poor.coins = 1
	exec.execute(poor, ros.hire_effects(who), {"event_id": "h"})
	var mood_before := int(ros.member(poor, String(who["id"])).get("mood", 16))
	exec.execute(poor, ros.pay_effects(poor, 30), {"event_id": "w"})
	_ok(poor.coins >= 0, "an unpayable wage never drives the purse negative")
	_ok(int(ros.member(poor, String(who["id"])).get("mood", 16)) < mood_before,
		"it costs goodwill instead")


# --------------------------------------------------------------- departure

func _departure(db: ContentDb, ros: Roster, exec: EffectExecutor) -> void:
	var st := _st()
	var who: Dictionary = ros.candidates(st, "tauris", "open")[0]
	exec.execute(st, ros.hire_effects(who), {"event_id": "h"})
	_ok(ros.departures(st).is_empty(), "a content companion stays")

	# Ground the mood down and they go.
	for i in 6:
		exec.execute(st, [{"op": "retainer_mood", "id": String(who["id"]),
			"value": -4, "reason": "t"}], {"event_id": "m"})
	var leaving := ros.departures(st)
	_ok(not leaving.is_empty(), "an unhappy companion leaves")
	if not leaving.is_empty():
		_ok(String(leaving[0].get("reason", "")).begins_with("leave."),
			"and the departure names a reason")

	# Mood is clamped like every other bar.
	exec.execute(st, [{"op": "retainer_mood", "id": String(who["id"]),
		"value": -999, "reason": "t"}], {"event_id": "m"})
	_ok(int(ros.member(st, String(who["id"])).get("mood", -1)) == 0, "mood clamps at 0")
	exec.execute(st, [{"op": "retainer_mood", "id": String(who["id"]),
		"value": 999, "reason": "t"}], {"event_id": "m"})
	_ok(int(ros.member(st, String(who["id"])).get("mood", -1)) == 31, "and at 31")

	# A contract runs out.
	var st2 := _st()
	exec.execute(st2, ros.hire_effects(who), {"event_id": "h"})
	st2.jdn += 400 * 30
	_ok(not ros.departures(st2).is_empty(), "an expired contract ends the arrangement")


# ------------------------------------------------------------------- birth

func _birth(db: ContentDb, ros: Roster, exec: EffectExecutor) -> void:
	var st := _st()
	var who: Dictionary = ros.candidates(st, "tauris", "open")[0]
	var rid := String(who["id"])
	exec.execute(st, ros.hire_effects(who), {"event_id": "h"})

	_ok(ros.birth_known(st, rid) == "birth.unknown", "a new companion's birth is sealed")
	_ok(ros.can_reveal(st, rid), "and can be uncovered")

	exec.execute(st, [{"op": "reveal_birth", "id": rid, "value": 1, "reason": "t"}], {})
	_ok(ros.birth_known(st, rid) == "birth.season", "first layer: the season")
	exec.execute(st, [{"op": "reveal_birth", "id": rid, "value": 1, "reason": "t"}], {})
	_ok(ros.birth_known(st, rid) == "birth.date_approx", "second: roughly the date")
	exec.execute(st, [{"op": "reveal_birth", "id": rid, "value": 1, "reason": "t"}], {})
	_ok(ros.birth_known(st, rid) == "birth.full", "third: the whole reckoning")
	_ok(not ros.can_reveal(st, rid), "and there is nothing left to uncover")

	exec.execute(st, [{"op": "reveal_birth", "id": rid, "value": 5, "reason": "t"}], {})
	_ok(ros.birth_known(st, rid) == "birth.full", "revealing again does not go past full")
