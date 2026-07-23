extends RefCounted

## AUDIO_PLAN.md §5 mood derivation — presentation-only, no WorldState writes.

var _fails := 0


func _ok(cond: bool, what: String) -> void:
	if not cond:
		printerr("  FAIL: %s" % what)
		_fails += 1


func run() -> bool:
	_ok(SceneDensity.classify("desert-night") == SceneDensity.WILD, "desert-night → wild")
	_ok(SceneDensity.classify("temple-interior") == SceneDensity.SHRINE, "temple → shrine")
	_ok(SceneDensity.classify("monsoon-port") == SceneDensity.PORT, "port class")
	_ok(SceneDensity.layer_gains(SceneDensity.WILD)["pulse"] == 0.0, "wild has no pulse")
	_ok(SceneDensity.layer_gains(SceneDensity.SHRINE)["melody"] == 0.0, "shrine has no melody")

	var empty_res := EffectExecutor.EffectResult.new()
	_ok(AudioMood.derive(null, {}, {"tier": "metropolis"}) == AudioMood.WONDER, "metropolis wonder")
	_ok(AudioMood.derive(null, {"risk": 4}, {}) == AudioMood.TENSION, "risk tension")
	_ok(AudioMood.derive(null, {"hazards": ["pirates"]}, {}) == AudioMood.TENSION, "hazard tension")
	_ok(AudioMood.derive(null, {}, {}, SceneDensity.SHRINE) == AudioMood.REVERENCE, "shrine reverence")

	empty_res.rejected.append({"op": "coins", "reason": "x"})
	_ok(AudioMood.derive(empty_res, {}, {}) == AudioMood.LOSS, "rejected → loss")

	var ok_res := EffectExecutor.EffectResult.new()
	ok_res.applied.append({"op": "codex", "reason": "find"})
	_ok(AudioMood.derive(ok_res, {}, {}) == AudioMood.WONDER, "codex wonder")

	_ok(AudioMood.derive(null, {}, {"tier": "city"}, "", 5) == AudioMood.RELIEF, "relief after hard road into city")

	var p := AudioMood.params(AudioMood.TENSION)
	_ok(float(p["melody"]) == 0.0 and float(p["cutoff"]) < 2000.0, "tension darkens + drops melody")

	print("test_audio: %s" % ("PASS" if _fails == 0 else "FAIL (%d)" % _fails))
	return _fails == 0
