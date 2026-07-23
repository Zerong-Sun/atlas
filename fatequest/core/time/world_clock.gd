class_name WorldClock
extends RefCounted

## Advancing time is not just "jdn += n". Seasons open and close routes, and
## yearly retainer shifts hang off it, so advance() RETURNS the things that
## happened — callers must not have to remember to go looking for them
## (docs/CODE_PLAN.md §2.2).

var date: GameDate


func _init(start_jdn: int = 0) -> void:
	date = GameDate.new(start_jdn)


func advance(days: int) -> Array:
	var events: Array = []
	if days <= 0:
		return events
	var before := date.to_gregorian()
	date = GameDate.new(date.jdn + days)
	var after := date.to_gregorian()

	if before["year"] != after["year"]:
		events.append({"kind": "year_turned", "year": after["year"]})
	if before["month"] != after["month"]:
		events.append({"kind": "month_turned", "month": after["month"]})
	return events


func month() -> int:
	return date.to_gregorian()["month"]


func year() -> int:
	return date.to_gregorian()["year"]


## GDD §2.1: the birth pool runs 1253–1453. Outside that window the historical
## fixtures (rulers, plagues, route closures) have nothing to say.
func in_window() -> bool:
	var y := year()
	return y >= 1253 and y <= 1453
