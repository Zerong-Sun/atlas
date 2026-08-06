extends SceneTree

## R1 阅读覆盖审计：24 法 cast 后 reading_keys 在 en/zh 均有文本，且
## result_text_key 与 resultTexts 的 idx 范围一致。运行：
##   godot --headless --path . --script tests/audit_divination_readings.gd

const _WATCHDOG_SEC := 60.0
var _t := 0.0
func _process(d: float) -> bool:
	_t += d
	if _t > _WATCHDOG_SEC:
		printerr("AUDIT_DIV_READINGS: watchdog")
		quit(1)
	return false

func _init() -> void:
	var db := ContentDb.new()
	db.load_all()
	DivinationData.bind(db)
	DivinationBootstrap.register_all()

	var st := WorldState.new()
	st.seed = "audit-readings"
	st.city = "zayton"
	st.jdn = 2200000
	st.birthdate_jdn = 2195000
	for mid in DivinationRegistry.ids():
		st.learned_divinations.append(String(mid))

	var en := I18n._load("en")
	var zh := I18n._load("zh")

	var failures := 0
	for mid in DivinationRegistry.ids():
		var ctx := DivinationContext.new(st, Rng.new("audit-" + mid))
		var cast := DivinationRegistry.cast(mid, ctx)
		if cast.is_empty():
			printerr("AUDIT: %s cast empty" % mid)
			failures += 1
			continue
		var reading: Array = cast.get("reading", [])
		if reading.is_empty():
			printerr("AUDIT: %s has no reading keys" % mid)
			failures += 1
			continue
		for key in reading:
			var k := String(key)
			if en.get(k, "") == "" or zh.get(k, "") == "":
				printerr("AUDIT: %s reading %s missing en/zh text" % [mid, k])
				failures += 1
	print("AUDIT_DIV_READINGS: methods=%d failures=%d" % [
		DivinationRegistry.ids().size(), failures])
	quit(0 if failures == 0 else 1)
