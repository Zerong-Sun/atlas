class_name CharacterGenerator
extends RefCounted

## Builds the opening slate without touching WorldState.
##
## A candidate is a complete snapshot: era, identity, birth date, starting
## knowledge and fate values all come from the same named RNG branch.  The UI
## must render this snapshot verbatim and pass it to world creation; it must
## never roll any of those fields a second time.

const DEFAULT_AGE_MIN := 18
const DEFAULT_AGE_MAX := 60
const FATE_KEYS := ["travel", "rapport", "wealth"]


static func generate_slate(archetypes: Array, era: Dictionary, rng: Rng,
		count: int = 3) -> Array:
	if archetypes.is_empty() or era.is_empty() or count <= 0:
		return []
	var pool := rng.fork("archetype-order").shuffle(archetypes)
	var out: Array = []
	for i in mini(count, pool.size()):
		out.append(generate_candidate(pool[i], era, rng.fork("candidate:%d" % i), i))
	return out


static func generate_candidate(archetype: Dictionary, era: Dictionary, rng: Rng,
		index: int = 0) -> Dictionary:
	var start: Dictionary = era.get("startDate", {})
	var start_year := int(start.get("year", 1292))
	var age_range: Array = era.get("ageRange", [DEFAULT_AGE_MIN, DEFAULT_AGE_MAX])
	var age_min := int(age_range[0]) if age_range.size() >= 1 else DEFAULT_AGE_MIN
	var age_max := int(age_range[1]) if age_range.size() >= 2 else DEFAULT_AGE_MAX
	if age_max < age_min:
		var swap := age_min
		age_min = age_max
		age_max = swap
	var age := age_min + rng.fork("age").next_int(age_max - age_min + 1)
	var birth_month := 1 + rng.fork("birth-month").next_int(12)
	var birth_day := 1 + rng.fork("birth-day").next_int(28)
	# Preserve the displayed age on the exact campaign start date.  Merely
	# subtracting years makes a December birthday one year too young in an April
	# start scenario.
	var start_month := int(start.get("month", 4))
	var start_day := int(start.get("day", 11))
	var birthday_still_ahead := birth_month > start_month \
		or (birth_month == start_month and birth_day > start_day)
	var birth_year := start_year - age - (1 if birthday_still_ahead else 0)

	var fate := {"travel": 15, "rapport": 15, "wealth": 15}
	for key in FATE_KEYS:
		var jitter := rng.fork("fate:%s" % key).next_int(7) - 3
		var authored := int(archetype.get("bonus", {}).get(key, 0)) \
			+ int(archetype.get("malus", {}).get(key, 0))
		fate[key] = clampi(15 + jitter + authored, 0, 31)

	var candidate := archetype.duplicate(true)
	var fingerprint := "%s:%s:%d:%d-%02d-%02d:%d-%d-%d" % [
		String(era.get("id", "era")), String(archetype.get("id", "traveller")), index,
		birth_year, birth_month, birth_day, fate.travel, fate.rapport, fate.wealth]
	candidate["candidate_id"] = "%s:%s:%08x" % [String(era.get("id", "era")),
		String(archetype.get("id", "traveller")), Rng.hash_seed(fingerprint)]
	candidate["era_id"] = String(era.get("id", ""))
	candidate["start_date"] = {
		"year": start_year,
		"month": int(start.get("month", 4)),
		"day": int(start.get("day", 11)),
	}
	candidate["birth"] = {
		"year": birth_year,
		"month": birth_month,
		"day": birth_day,
		"age": age,
	}
	candidate["fate"] = fate
	return candidate


static func age_on_date(birth: Dictionary, date: Dictionary) -> int:
	var age := int(date.get("year", 0)) - int(birth.get("year", 0))
	var before_birthday := int(date.get("month", 1)) < int(birth.get("month", 1)) \
		or (int(date.get("month", 1)) == int(birth.get("month", 1)) \
		and int(date.get("day", 1)) < int(birth.get("day", 1)))
	return age - (1 if before_birthday else 0)


static func validate_candidate(candidate: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for field in ["id", "candidate_id", "era_id", "start", "birth", "start_date", "fate"]:
		if not candidate.has(field):
			errors.append("CHARACTER_FIELD_MISSING:%s" % field)
	var birth: Dictionary = candidate.get("birth", {})
	var start: Dictionary = candidate.get("start_date", {})
	if int(birth.get("age", -1)) < DEFAULT_AGE_MIN:
		errors.append("CHARACTER_AGE_TOO_LOW")
	if int(birth.get("age", -1)) > DEFAULT_AGE_MAX:
		errors.append("CHARACTER_AGE_TOO_HIGH")
	if age_on_date(birth, start) != int(birth.get("age", -1)):
		errors.append("CHARACTER_AGE_DATE_MISMATCH")
	if int(birth.get("year", 9999)) >= int(start.get("year", 0)):
		errors.append("CHARACTER_BIRTH_AFTER_START")
	for key in FATE_KEYS:
		var value := int(candidate.get("fate", {}).get(key, -1))
		if value < 0 or value > 31:
			errors.append("CHARACTER_FATE_OUT_OF_RANGE:%s" % key)
	return errors
