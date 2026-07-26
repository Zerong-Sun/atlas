extends RefCounted

## F-6: GameDate julian/gregorian and civil(culture).

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c: printerr("  FAIL: %s" % w); _f += 1


func run() -> bool:
	# 1253-01-01 and 1453-05-29-ish boundaries (Fliegel–Van Flandern round-trip)
	var d1253 := GameDate.from_gregorian(1253, 1, 1)
	var g1253: Dictionary = d1253.to_gregorian()
	_ok(int(g1253["year"]) == 1253 and int(g1253["month"]) == 1 and int(g1253["day"]) == 1,
		"1253 gregorian round-trip")

	var d1453 := GameDate.from_gregorian(1453, 5, 29)
	var g1453: Dictionary = d1453.to_gregorian()
	_ok(int(g1453["year"]) == 1453 and int(g1453["month"]) == 5 and int(g1453["day"]) == 29,
		"1453 gregorian round-trip")

	var jul: Dictionary = d1253.to_julian()
	_ok(jul.has("year") and jul.has("month") and jul.has("day"), "to_julian fields")
	# In 1253 Julian lags Gregorian by ~7 days — years should still be 1252/1253
	_ok(int(jul["year"]) == 1252 or int(jul["year"]) == 1253, "julian year near 1253")

	_ok(GameDate.civil_for("latin") == "julian", "latin → julian")
	_ok(GameDate.civil_for("islamic") == "islamic", "islamic → islamic")
	_ok(GameDate.civil_for("east_asia") == "chinese", "east_asia → chinese")

	var civil_l: Dictionary = d1253.civil("latin")
	_ok(civil_l.has("year"), "civil(latin) returns date")
	var civil_i: Dictionary = d1253.civil("islamic")
	_ok(civil_i.has("year"), "civil(islamic) returns date")
	var civil_e: Dictionary = d1253.civil("east_asia")
	_ok(civil_e.has("ganzhi"), "civil(east_asia) includes ganzhi")

	print("test_time: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
