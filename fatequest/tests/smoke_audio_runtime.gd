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
	check(AudioServer.get_bus_index("Music") >= 0 and AudioServer.get_bus_index("Ambient") >= 0 and AudioServer.get_bus_index("SFX") >= 0, "configured audio buses are loaded")
	check(audio.intro_available(), "separate opening theme resource exists")
	audio.play_intro()
	check(audio.intro_active(), "opening theme can be selected at boot")
	check(audio._intro_player.stream is AudioStreamWAV and audio._intro_player.stream.loop_mode == AudioStreamWAV.LOOP_FORWARD, "opening theme loops while player reads")
	audio.stop_intro(0.0)
	check(not audio.intro_active(), "opening theme stops when the journey starts")
	check(SceneDensity.layer_gains(SceneDensity.WILD)["melody"] > 0.0 and SceneDensity.layer_gains(SceneDensity.SHRINE)["melody"] > 0.0 and AudioMood.params(AudioMood.TENSION)["melody"] > 0.0, "melodic line survives quiet and tense scenes")
	audio.set_place({"id": "latin-test", "culture": "latin"}, {"scene": {"bg": "monsoon-port"}})
	check(audio._culture_mix == {"latin": 1.0}, "explicit latin remains selectable")
	check(audio.folk_layer(SceneDensity.TOWN) == "melody" and audio.folk_layer(SceneDensity.PORT) == "melody_road" and audio.folk_layer(SceneDensity.SHRINE) == "melody_quiet", "scene chooses its independently scored folk loop")
	check(audio.LAYERS == audio.FOLK_LAYERS and audio._stem_players.size() == 18, "one shared cue and two regional songbooks have allocated players")
	for culture in audio.CULTURES:
		for layer in audio.FOLK_LAYERS:
			for variant in 2:
				var path: String = audio._stem_path(culture, layer, variant)
				var theme: AudioStream = audio._load_loop(path)
				if culture in audio.SHARED_CULTURES:
					check(path == audio.INTRO_PATH and theme is AudioStreamWAV and theme.get_length() >= 38.0 and theme.get_length() <= 42.0, "shared loop %s/%s/%d" % [culture, layer, variant])
					check((theme as AudioStreamWAV).loop_mode == AudioStreamWAV.LOOP_FORWARD, "shared WAV loops in gameplay")
				else:
					check(theme is AudioStreamOggVorbis and theme.get_length() >= 14.0 and theme.get_length() <= 28.0, "folk loop %s/%s/%d" % [culture, layer, variant])
	check("seabirds" in audio.ambient_plan() and not "rain" in audio.ambient_plan(), "dry sea port has birds, no invented rain")
	audio.set_place({"id": "caffa", "culture": "islamic"})
	check(audio._culture_mix == {"latin": 0.7, "steppe": 0.3}, "Caffa can reach western and steppe melodies")
	check(audio._music_mix() == {"latin": 0.7, "shared": 0.3}, "Caffa uses the shared cue once beside Latin")
	audio.set_travel({"kind": "sea", "hazards": ["storm"]})
	check("waves" in audio.ambient_plan() and not "horse_hooves" in audio.ambient_plan(), "sea journey excludes hoofs")
	check(not "rain" in audio.ambient_plan(), "risk is not observed weather")
	audio.set_travel({"kind": "river", "weather": "rain"})
	check("river" in audio.ambient_plan() and "rain" in audio.ambient_plan() and not "seabirds" in audio.ambient_plan(), "rainy river journey")
	audio.set_travel({"kind": "land"})
	check("horse_hooves" in audio.ambient_plan() and not "waves" in audio.ambient_plan(), "land journey")
	audio.set_place({"id": "port", "culture": "east_asia", "weather": "rain"}, {"id": "ev-zayton-fanfang", "scene": {"bg": "monsoon-port"}})
	check(audio._culture_mix == {"east_asia": 0.5, "islamic": 0.5}, "site culture blend")
	check(audio._music_mix() == {"shared": 1.0}, "two shared cultures use one music voice")
	audio._mood = AudioMood.REVERENCE
	check(audio.ambient_plan().size() == 4 and audio.ambient_plan()[3].begins_with("sacred_blur_"), "sacred displaces last of four slots")
	var offset: float = audio._start_offset
	var variant: int = audio._music_variant
	audio.set_place({"id": "port", "culture": "east_asia"}, {"scene": {"bg": "temple-interior"}})
	check(audio._start_offset == offset and audio._music_variant == variant and audio.ambient_plan().size() == 1, "same city site preserves music choice, shrine resets bed")
	audio._on_song_turn()
	check(audio._music_variant == variant, "shared theme does not rotate to a removed regional cue")
	audio.set_place({"id": "latin-test-2", "culture": "latin"})
	var latin_variant: int = audio._music_variant
	audio._on_song_turn()
	check(audio._music_variant == 1 - latin_variant, "remaining regional songbook advances to its other tune")
	check(AudioMood.params(AudioMood.NEUTRAL)["cutoff"] >= 19000.0 and AudioMood.params(AudioMood.LOSS)["pitch"] == 1.0, "music bus preserves presence and pitch")
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
