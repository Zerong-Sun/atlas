extends SceneTree

var failures := 0

func check(condition: bool, message: String) -> void:
	if not condition:
		printerr("FAIL audio: " + message)
		failures += 1

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var audio := root.get_node("AudioDirector")
	check(audio.intro_available(), "separate opening theme resource exists")
	audio.play_intro()
	check(audio.intro_active(), "opening theme can be selected at boot")
	audio.stop_intro(0.0)
	check(not audio.intro_active(), "opening theme stops when the journey starts")
	audio.set_place({"id": "latin-test", "culture": "latin"}, {"scene": {"bg": "monsoon-port"}})
	check(audio._culture_mix == {"latin": 1.0}, "explicit latin remains selectable")
	check("seabirds" in audio.ambient_plan() and not "rain" in audio.ambient_plan(), "dry sea port has birds, no invented rain")
	audio.set_travel({"kind": "sea", "hazards": ["storm"]})
	check("waves" in audio.ambient_plan() and not "horse_hooves" in audio.ambient_plan(), "sea journey excludes hoofs")
	check(not "rain" in audio.ambient_plan(), "risk is not observed weather")
	audio.set_travel({"kind": "river", "weather": "rain"})
	check("river" in audio.ambient_plan() and "rain" in audio.ambient_plan() and not "seabirds" in audio.ambient_plan(), "rainy river journey")
	audio.set_travel({"kind": "land"})
	check("horse_hooves" in audio.ambient_plan() and not "waves" in audio.ambient_plan(), "land journey")
	audio.set_place({"id": "port", "culture": "east_asia", "weather": "rain"}, {"id": "ev-zayton-fanfang", "scene": {"bg": "monsoon-port"}})
	check(audio._culture_mix == {"east_asia": 0.5, "islamic": 0.5}, "site culture blend")
	audio._mood = AudioMood.REVERENCE
	check(audio.ambient_plan().size() == 4 and audio.ambient_plan()[3].begins_with("sacred_blur_"), "sacred displaces last of four slots")
	var offset: float = audio._start_offset
	audio.set_place({"id": "port", "culture": "east_asia"}, {"scene": {"bg": "temple-interior"}})
	check(audio._start_offset == offset and audio.ambient_plan().size() == 1, "same city site preserves starting offset, shrine resets bed")
	check(SceneDensity.layer_gains(SceneDensity.PORT)["color"] * AudioMood.params(AudioMood.WONDER)["color"] > 0.0, "wonder color audible")
	audio.volume_db = -23.0
	audio.muted = true
	audio.load_settings()
	check(audio.volume_db == -23.0 and audio.muted, "saved preferences load")
	audio.volume_db = 100
	check(audio.volume_db == 6, "volume clamps")
	var cfg := ConfigFile.new()
	cfg.set_value("audio", "volume_db", "invalid")
	cfg.set_value("audio", "muted", "invalid")
	cfg.save(audio.SETTINGS_PATH)
	audio.load_settings()
	check(audio.volume_db == -6 and not audio.muted, "invalid settings fail safely")
	var stream: AudioStream = audio._load_loop("res://assets/audio/ambient/waves.ogg")
	check(stream != null and audio._load_loop("res://assets/audio/ambient/waves.ogg") == stream, "loop cache identity")
	var sfx: Node = audio._sfx
	check(sfx._players.size() == 6, "six bounded SFX voices")
	var pulse := PackedFloat32Array([0.2, -0.2])
	var delayed: PackedFloat32Array = sfx._delay(pulse, 0.1)
	check(delayed.size() == 2207 and delayed[0] == 0.0 and delayed[2205] == pulse[0], "dice/lot sequence actually delayed")
	print("smoke_audio_runtime: %s" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
