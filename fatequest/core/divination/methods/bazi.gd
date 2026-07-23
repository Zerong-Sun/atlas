class_name BaziMethod
extends DivinationMethod

## 八字 — four pillars from birthdate_jdn + ephemeris_years / solar terms.
## Port of Atlas bazi.ts core path without lunar-javascript (game ephemeris).

const STEMS := ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const BRANCHES := ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]


func id() -> String:
	return "bazi"


func inputs() -> Array:
	return ["birthdate"]


func reads() -> Array:
	return ["self", "retainer", "year"]


func cast(ctx: DivinationContext) -> Dictionary:
	var jdn: int = ctx.birthdate_jdn
	if jdn < 0:
		jdn = ctx.state.jdn if ctx.state else 2100000

	var year := _gregorian_year_approx(jdn)
	var lichun := DivinationData.lichun_jdn(year)
	if lichun > 0 and jdn < lichun:
		year -= 1
		lichun = DivinationData.lichun_jdn(year)

	# Year pillar: 1984 was 甲子; use offset from a known anchor near our range.
	# JDN of 1253-02-04 Li Chun approx stored in ephemeris; stem-branch from year.
	var year_idx := posmod(year - 4, 60)  # 4 CE ≈ 甲子 year in common ganzhi epoch
	var year_stem: String = STEMS[year_idx % 10]
	var year_branch: String = BRANCHES[year_idx % 12]

	var month_branch := _month_branch_for_jdn(jdn, year, lichun)
	var month_branch_i := BRANCHES.find(month_branch)
	if month_branch_i < 0:
		month_branch_i = 0
	# Month stem from year stem (五虎遁)
	var year_stem_i := year_idx % 10
	var month_stem_bases: Array[int] = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]
	var month_stem_base: int = month_stem_bases[year_stem_i]
	var month_stem: String = STEMS[(month_stem_base + month_branch_i) % 10]

	# Day pillar from JDN (classic: JDN + 49 mod 60 ≈ 甲子 alignment for noon)
	var day_idx := posmod(jdn + 49, 60)
	var day_stem: String = STEMS[day_idx % 10]
	var day_branch: String = BRANCHES[day_idx % 12]

	# Hour default 午 (noon travel casting)
	var hour_branch_i := 6
	var day_stem_i := day_idx % 10
	var hour_stem_bases: Array[int] = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]
	var hour_stem_base: int = hour_stem_bases[day_stem_i]
	var hour_stem: String = STEMS[(hour_stem_base + hour_branch_i) % 10]
	var hour_branch: String = BRANCHES[hour_branch_i]

	return {
		"year": year,
		"pillars": {
			"year": year_stem + year_branch,
			"month": month_stem + month_branch,
			"day": day_stem + day_branch,
			"hour": hour_stem + hour_branch,
		},
		"dayMaster": day_stem,
		"idx": day_idx % 30,
	}


func to_effects(raw: Dictionary, ctx: DivinationContext) -> Array:
	var subject: String = ctx.subject if ctx.subject != "" else ctx.state.city
	return [
		{"op": "reveal_birth", "value": 1, "reason": "bazi-read-the-pillars"},
		{"op": "reveal_map", "value": subject, "reason": "bazi-named-a-season-window"},
		{"op": "codex", "value": "cx-four-pillars", "reason": "bazi-recorded-the-chart"},
	]


func reading_keys(raw: Dictionary, _ctx: DivinationContext) -> Array:
	return [DivinationData.result_text_key("bazi", int(raw.get("idx", 0)) % 30)]


func _gregorian_year_approx(jdn: int) -> int:
	# Inverse of approximate JDN ≈ 1721425.5 + y*365.2425
	return int(floor((float(jdn) - 1721425.5) / 365.2425))


func _month_branch_for_jdn(jdn: int, year: int, lichun: int) -> String:
	var terms: Array = DivinationData.solar_terms()
	if terms.is_empty() or lichun < 0:
		return "寅"
	var doy := jdn - lichun + 35  # lichun ~ doy 35
	if doy < 0:
		doy += 365
	var best: String = "寅"
	var best_doy := -9999
	for t in terms:
		var td: int = int(t.get("doy", 0))
		if td <= doy and td >= best_doy:
			best_doy = td
			best = String(t.get("monthBranch", "寅"))
	return best
