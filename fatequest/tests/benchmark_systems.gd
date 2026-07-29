extends SceneTree

const ITERATIONS := 40


func _init() -> void:
	var db := ContentDb.new()
	db.load_all()
	var state := _representative_state(db)
	var clock := WorldClock.new(state.jdn)
	var executor := EffectExecutor.new()
	var travel := Travel.new(db, executor, ConditionEvaluator.new(db))

	var serialize_ms: Array[float] = []
	for i in ITERATIONS:
		var started := Time.get_ticks_usec()
		SaveGame.serialize(state, clock, {"archetype": "benchmark"})
		serialize_ms.append(float(Time.get_ticks_usec() - started) / 1000.0)

	var slot := "benchmark-runtime"
	SaveGame.erase(slot)
	var disk_ms: Array[float] = []
	for i in ITERATIONS:
		state.coins += 1
		var started := Time.get_ticks_usec()
		if not SaveGame.write(slot, state, clock, {"archetype": "benchmark"}):
			printerr("BENCHMARK: disk write failed")
			quit(1)
			return
		disk_ms.append(float(Time.get_ticks_usec() - started) / 1000.0)
	SaveGame.erase(slot)

	var routes: Array = db.get_table("routes")
	var availability_started := Time.get_ticks_usec()
	for repeat in 30:
		for route in routes:
			var mode := String((route.get("modes", ["foot"]) as Array)[0])
			state.city = String(route.get("from", ""))
			state.revealed[route.get("id", "")] = 1
			travel.availability(route, state, 6, mode)
	var availability_ms := float(
		Time.get_ticks_usec() - availability_started) / 1000.0

	var vector_file := FileAccess.open(
		"res://content/world/vector_map.json", FileAccess.READ)
	var vector_bytes := vector_file.get_length() if vector_file != null else -1
	if vector_file != null:
		vector_file.close()

	serialize_ms.sort()
	disk_ms.sort()
	var serialize_p95 := _percentile(serialize_ms, 0.95)
	var disk_median := _percentile(disk_ms, 0.50)
	var disk_p95 := _percentile(disk_ms, 0.95)
	var ok := serialize_p95 < 100.0 and disk_p95 < 100.0 \
		and vector_bytes > 0 and vector_bytes < 200000
	print("BENCHMARK: iterations=%d serialize_p95=%.2fms" % [
		ITERATIONS, serialize_p95])
	print("BENCHMARK: save_median=%.2fms save_p95=%.2fms" % [
		disk_median, disk_p95])
	print("BENCHMARK: availability=%d checks/%.2fms vector=%dB" % [
		routes.size() * 30, availability_ms, vector_bytes])
	print("BENCHMARK: %s" % ("PASS" if ok else "FAIL"))
	quit(0 if ok else 1)


func _representative_state(db: ContentDb) -> WorldState:
	var state := WorldState.new()
	state.seed = "benchmark"
	state.jdn = GameDate.from_gregorian(1292, 6, 15).jdn
	state.city = "tauris"
	state.start_city = "tauris"
	state.character = {
		"archetype_id": "benchmark",
		"background": "performance",
	}
	state.coins = 100000000
	state.cargo_slots = 1000
	state.languages = ["persian", "arabic", "chinese"]
	for city in db.get_table("cities"):
		state.revealed[String(city.get("id", ""))] = 1
	for route in db.get_table("routes"):
		state.revealed[String(route.get("id", ""))] = 1
	for method in db.get_table("divinations"):
		state.learned_divinations.append(String(method.get("id", "")))
	for good in db.get_table("goods").slice(0, 20):
		state.goods[String(good.get("id", ""))] = 1
	for retainer in db.get_table("retainers").slice(0, 8):
		state.retainers.append({
			"id": String(retainer.get("id", "")),
			"present": true,
			"mood": 16,
		})
	return state


func _percentile(values: Array[float], ratio: float) -> float:
	if values.is_empty():
		return INF
	var index := clampi(int(ceil(float(values.size()) * ratio)) - 1,
		0, values.size() - 1)
	return values[index]
