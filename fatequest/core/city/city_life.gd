class_name CityLife
extends RefCounted

## Quotes are pure; only EffectExecutor commits employment, loans and retirement.
const MONTHS := [1, 3, 6, 12, 24]
const PRINCIPAL := 10000
const LOAN_FEE := 1000
const LATE_FEE := 1000
const JOBS := [
	{"id": "laundry", "pay": 1800, "backgrounds": []},
	{"id": "inn", "pay": 2200, "backgrounds": []},
	{"id": "ledger", "pay": 3800, "backgrounds": ["merchant", "polo"]},
	{"id": "horses", "pay": 3400, "backgrounds": ["steppe"]},
	{"id": "maps", "pay": 3600, "backgrounds": ["cartographer"]},
	{"id": "teaching", "pay": 3200, "backgrounds": ["pilgrim-scholar", "battuta"]},
	{"id": "interpreting", "pay": 3800, "backgrounds": ["translator"]},
	{"id": "healing", "pay": 3600, "backgrounds": ["healer"]},
	{"id": "copying", "pay": 3400, "backgrounds": ["scribe"]},
]

static func retired(state: WorldState) -> bool:
	return not state.city_life.get("ending", {}).is_empty()

static func blocked_reason(state: WorldState) -> String:
	if retired(state) or bool(state.life.get("deceased", false)):
		return "ui.stay.ended"
	if state.city.is_empty() or not state.active_journey.is_empty() \
			or not state.active_event.is_empty() or not state.pending_events.is_empty():
		return "ui.stay.pending"
	return ""

static func jobs(state: WorldState) -> Array:
	var out: Array = []
	var background := String(state.character.get("archetype_id", ""))
	for job in JOBS:
		if job.backgrounds.is_empty() or background in job.backgrounds:
			out.append(job.duplicate(true))
	# Put the familiar trade first without hiding ordinary local work.
	out.sort_custom(func(a: Dictionary, b: Dictionary): return a.pay > b.pay)
	return out

static func days_for_months(jdn: int, months: int) -> int:
	var date := GameDate.new(jdn).to_gregorian()
	var month_index := int(date.month) - 1 + months
	var year := int(date.year) + month_index / 12
	var month := month_index % 12 + 1
	var next_month := GameDate.from_gregorian(year + (1 if month == 12 else 0), month % 12 + 1, 1)
	var month_end := GameDate.new(next_month.jdn - 1).to_gregorian()
	var target := GameDate.from_gregorian(year, month, mini(int(date.day), int(month_end.day)))
	return target.jdn - jdn

static func work_quote(state: WorldState, job_id: String, months: int) -> Dictionary:
	var reason := blocked_reason(state)
	if not reason.is_empty(): return {"ok": false, "reason": reason}
	if months not in MONTHS: return {"ok": false, "reason": "ui.stay.invalid"}
	for job in jobs(state):
		if job.id != job_id: continue
		var days := days_for_months(state.jdn, months)
		# Food and lodging are included, companions find their own work in town.
		return {"ok": true, "job": job_id, "months": months, "days": days,
			"income": int(job.pay) * months,
			"reputation": mini(maxi(1, months / 3), maxi(0, 15 - state.reputation("city", state.city)))}
	return {"ok": false, "reason": "ui.stay.invalid"}

static func debt_due(state: WorldState) -> int:
	var debt: Dictionary = state.city_life.get("debt", {})
	if debt.is_empty(): return 0
	return int(debt.get("repayment", PRINCIPAL + LOAN_FEE)) \
		+ (LATE_FEE if state.jdn > int(debt.get("due_jdn", state.jdn)) else 0)

static func work_history(state: WorldState) -> Array:
	return state.city_life.get("work_history", [])
