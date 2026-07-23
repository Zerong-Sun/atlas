class_name GameDate
extends RefCounted

## A day in the world. The Julian Day Number is the ONE authoritative
## representation (docs/CODE_PLAN.md §2.2); every calendar below is a *reading*
## of that number, never a parallel stored value. Storing two calendars means
## they drift, and GDD §7.2 hangs on them never drifting: the same retainer read
## by a Chinese diviner and a Persian astrologer must be the same underlying day.

const GAN := ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const ZHI := ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
const ZODIAC := ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]

var jdn: int = 0


func _init(p_jdn: int = 0) -> void:
	jdn = p_jdn


static func from_gregorian(y: int, m: int, d: int) -> GameDate:
	# Fliegel–Van Flandern. Integer arithmetic throughout: no floats anywhere
	# near the calendar, or determinism dies quietly.
	var a := int((14 - m) / 12.0)
	var y2 := y + 4800 - a
	var m2 := m + 12 * a - 3
	var j := d + int((153 * m2 + 2) / 5.0) + 365 * y2 + int(y2 / 4.0) - int(y2 / 100.0) + int(y2 / 400.0) - 32045
	return GameDate.new(j)


func to_gregorian() -> Dictionary:
	var a := jdn + 32044
	var b := int((4 * a + 3) / 146097.0)
	var c := a - int(146097.0 * b / 4.0)
	var d2 := int((4 * c + 3) / 1461.0)
	var e := c - int(1461.0 * d2 / 4.0)
	var m := int((5 * e + 2) / 153.0)
	return {
		"day": e - int((153 * m + 2) / 5.0) + 1,
		"month": m + 3 - 12 * int(m / 10.0),
		"year": 100 * b + d2 - 4800 + int(m / 10.0),
	}


## 干支 for the day. JDN 0 is a 癸丑 day in the sexagenary cycle; the +49 offset
## aligns the cycle to the conventional reckoning.
func ganzhi_day() -> String:
	var i := (jdn + 49) % 60
	return GAN[i % 10] + ZHI[i % 12]


func ganzhi_year() -> String:
	var y: int = to_gregorian()["year"]
	var i := (y - 4) % 60
	if i < 0:
		i += 60
	return GAN[i % 10] + ZHI[i % 12]


func zodiac() -> String:
	var y: int = to_gregorian()["year"]
	var i := (y - 4) % 12
	return ZODIAC[i if i >= 0 else i + 12]


## Islamic (tabular) calendar. An approximation — the true calendar is
## observational — but it is the same *kind* of approximation every medieval
## almanac made, and it is stable and reversible, which is what the game needs.
func to_islamic() -> Dictionary:
	var l := jdn - 1948440 + 10632
	var n := int((l - 1) / 10631.0)
	l = l - 10631 * n + 354
	var j := int((10985 - l) / 5316.0) * int((50 * l) / 17719.0) + int(l / 5670.0) * int((43 * l) / 15238.0)
	l = l - int((30 - j) / 15.0) * int((17719 * j) / 50.0) - int(j / 16.0) * int((15238 * j) / 43.0) + 29
	var m := int((24 * l) / 709.0)
	return {"year": 30 * n + j - 30, "month": m, "day": l - int((709 * m) / 24.0)}


func month_name_key() -> String:
	return "month.%d" % to_gregorian()["month"]


func iso() -> String:
	var g := to_gregorian()
	return "%04d-%02d-%02d" % [g["year"], g["month"], g["day"]]


## Stable key for seeding per-day randomness (docs/CODE_PLAN.md §2.1).
func date_key() -> String:
	return str(jdn)
