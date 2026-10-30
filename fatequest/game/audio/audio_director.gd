extends Node

## FateQuest audio director — AUDIO_PLAN.md §8 A1–A6.
##
## Autoload. L2 presentation only: never writes WorldState; music RNG is an
## independent fork (CODE_PLAN.md §2.1). East Asia, West Asia and Steppe
## share one neutral theme; Indian Ocean and Latin retain scene arrangements.

const BUS_MASTER := "Master"
const BUS_MUSIC := "Music"
const BUS_AMBIENT := "Ambient"
const BUS_SFX := "SFX"
const FOLK_ROOT := "res://assets/audio/folk"
const AMB_ROOT := "res://assets/audio/ambient"
const INTRO_PATH := "res://assets/audio/intro/title_theme.wav"
const FOLK_LAYERS: PackedStringArray = ["melody", "melody_road", "melody_quiet"]
const LAYERS: PackedStringArray = ["melody", "melody_road", "melody_quiet"]
const CULTURES: PackedStringArray = ["islamic", "east_asia", "steppe", "indian_ocean", "latin", "orthodox"]
const SHARED_CULTURES: PackedStringArray = ["islamic", "east_asia", "steppe"]
const MUSIC_CULTURES: PackedStringArray = ["shared", "indian_ocean", "latin"]
const CROSSFADE_SEC := 10.0
const SETTINGS_PATH := "user://audio.cfg"
var _settings_loaded := false
var _context: Dictionary = {}
var _loop_cache: Dictionary = {}
var _start_offset := 0.0
var _music_variant := 0

signal mute_changed(muted: bool)

var muted: bool = false:
	set(v):
		muted = v
		var idx := AudioServer.get_bus_index(BUS_MASTER)
		if idx >= 0:
			AudioServer.set_bus_mute(idx, v)
		mute_changed.emit(v)
		_save_settings()

var volume_db: float = -6.0:
	set(v):
		volume_db = clampf(v, -60.0, 6.0)
		var idx := AudioServer.get_bus_index(BUS_MASTER)
		if idx >= 0:
			AudioServer.set_bus_volume_db(idx, volume_db)
		_save_settings()

var _culture_mix: Dictionary = {}
var _scene_class: String = SceneDensity.TOWN
var _mood: String = AudioMood.NEUTRAL
var _scene_bg: String = ""
var _city_id: String = ""
var _jdn: int = 0
var _prev_route_risk: int = 0

var _stem_players: Dictionary = {}
var _amb_players: Array[AudioStreamPlayer] = []
var _intro_player: AudioStreamPlayer
var _intro_tween: Tween
var _intro_active := false
var _song_timer: Timer
var _sfx: AudioSfx
var _lp: AudioEffectLowPassFilter
var _tweens: Array[Tween] = []
var _playback_available := true


func _ready() -> void:
	# Headless runs validate logic and UI structure, not an audio device. Loading
	# file-backed Ogg playback there only slows tests and leaves packet
	# sequences pending when the short-lived process exits.
	_playback_available = DisplayServer.get_name() != "headless"
	load_settings()
	_cache_lowpass()
	_sfx = preload("res://game/audio/sfx.gd").new()
	add_child(_sfx)
	_intro_player = AudioStreamPlayer.new()
	_intro_player.name = "IntroThemePlayer"
	_intro_player.bus = BUS_MUSIC
	_intro_player.volume_db = -80.0
	_intro_player.finished.connect(_on_intro_finished)
	add_child(_intro_player)
	_song_timer = Timer.new()
	_song_timer.one_shot = true
	_song_timer.timeout.connect(_on_song_turn)
	add_child(_song_timer)
	for c in MUSIC_CULTURES:
		for layer in LAYERS:
			for variant in 2:
				var key := "%s:%s:%d" % [c, layer, variant]
				var p := AudioStreamPlayer.new()
				p.bus = BUS_MUSIC
				p.volume_db = -80.0
				add_child(p)
				_stem_players[key] = p
	# 4 slots: scene beds (≤4) + sacred_blur may displace the last when shrine/reverence
	for i in 4:
		var a := AudioStreamPlayer.new()
		a.bus = BUS_AMBIENT
		a.volume_db = -80.0
		add_child(a)
		_amb_players.append(a)


func _exit_tree() -> void:
	# Explicitly release file-backed Ogg streams before AudioServer teardown.
	# Short-lived smoke processes otherwise leave playback packet sequences
	# referenced by the audio thread and report ObjectDB leaks on clean exit.
	_kill_tweens()
	_kill_intro_tween()
	if _song_timer != null:
		_song_timer.stop()
	if _intro_player != null:
		_intro_player.stop()
		_intro_player.stream = null
	_intro_active = false
	for p in _stem_players.values():
		if p is AudioStreamPlayer:
			(p as AudioStreamPlayer).stop()
			(p as AudioStreamPlayer).stream = null
	for p in _amb_players:
		p.stop()
		p.stream = null
	_loop_cache.clear()


func _cache_lowpass() -> void:
	var bi := AudioServer.get_bus_index(BUS_MUSIC)
	if bi < 0:
		return
	for ei in AudioServer.get_bus_effect_count(bi):
		var fx := AudioServer.get_bus_effect(bi, ei)
		if fx is AudioEffectLowPassFilter:
			_lp = fx
			return


func load_settings() -> void:
	_settings_loaded = false
	var cfg := ConfigFile.new()
	if cfg.load(SETTINGS_PATH) == OK:
		var saved_volume: Variant = cfg.get_value("audio", "volume_db", -6.0)
		var saved_mute: Variant = cfg.get_value("audio", "muted", false)
		volume_db = float(saved_volume) if (saved_volume is float or saved_volume is int) and is_finite(float(saved_volume)) else -6.0
		muted = saved_mute if saved_mute is bool else false
	else:
		volume_db = -6.0
		muted = false
	_settings_loaded = true


func _save_settings() -> void:
	if not _settings_loaded:
		return
	var cfg := ConfigFile.new()
	cfg.set_value("audio", "volume_db", volume_db)
	cfg.set_value("audio", "muted", muted)
	var err := cfg.save(SETTINGS_PATH)
	if err != OK:
		push_warning("Audio preferences could not be saved: %s" % err)


func toggle_mute() -> bool:
	muted = not muted
	return muted


func sfx(kind: String) -> void:
	if muted or not _playback_available:
		return
	_sfx.play(kind)


static func music_rng(city_id: String, jdn: int) -> Rng:
	return Rng.new("music:%s:%d" % [city_id, jdn])


func set_jdn(jdn: int) -> void:
	_jdn = jdn


func set_place(city: Dictionary, event: Dictionary = {}, blend: Dictionary = {}) -> void:
	var next_city := str(city.get("id", ""))
	var changed_city := next_city != _city_id
	_city_id = next_city
	_context = {}
	for key in ["weather", "water"]:
		if city.has(key): _context[key] = city[key]
		if event.has(key): _context[key] = event[key]
	var bg := ""
	if event.has("scene"):
		var sc: Variant = event["scene"]
		if typeof(sc) == TYPE_DICTIONARY:
			bg = String(sc.get("bg", ""))
		else:
			bg = String(sc)
	_scene_bg = bg
	_scene_class = SceneDensity.classify(bg) if not bg.is_empty() else SceneDensity.TOWN

	if not blend.is_empty():
		_culture_mix = blend.duplicate()
	else:
		_culture_mix = _cultures_for(city, event)

	var rng := music_rng(_city_id if not _city_id.is_empty() else "void", _jdn)
	if changed_city:
		_start_offset = rng.next() * 50.0
		_music_variant = 1 if rng.next() >= 0.5 else 0

	_mood = AudioMood.derive(null, {}, city, _scene_class, _prev_route_risk)
	if not _playback_available:
		return
	_kill_tweens()
	_apply_mix(CROSSFADE_SEC)
	_apply_ambients(CROSSFADE_SEC * 0.6)
	_apply_mood_bus(CROSSFADE_SEC * 0.5)
	_schedule_song_turn()


func set_route_context(route: Dictionary) -> void:
	_prev_route_risk = int(route.get("risk", 0))
	var tense := _prev_route_risk >= 4
	for h in route.get("hazards", []):
		if String(h) in ["bandits", "pirates", "storm"]:
			tense = true
	if tense:
		_mood = AudioMood.TENSION
		if not _playback_available:
			return
		_kill_tweens()
		_apply_mood_bus(4.0)
		_apply_mix(4.0)


func on_effect_result(res: Variant, route: Dictionary, city: Dictionary, coins_before: int = -1) -> void:
	if coins_before >= 0:
		_mood = AudioMood.derive_with_coins(res, route, city, _scene_class, _prev_route_risk, coins_before)
	else:
		_mood = AudioMood.derive(res, route, city, _scene_class, _prev_route_risk)
	if not _playback_available:
		return
	_kill_tweens()
	_apply_mood_bus(3.5)
	_apply_mix(3.5)
	_apply_ambients(2.5)
	sfx("click")


func on_depart(route: Dictionary) -> void:
	set_route_context(route)
	sfx("wood")


## Journey mix for the transit plate: keeps the origin culture's road arrangement
## with road ambients instead of the town's. `set_place`
## on arrival restores the destination city's own mix.
func set_travel(route: Dictionary) -> void:
	_context = route.duplicate(true)
	_prev_route_risk = int(route.get("risk", 0))
	var tense := _prev_route_risk >= 4
	for h in route.get("hazards", []):
		if String(h) in ["bandits", "pirates", "storm"]:
			tense = true
	_mood = AudioMood.TENSION if tense else AudioMood.NEUTRAL
	_scene_class = SceneDensity.JOURNEY
	if not _playback_available:
		return
	_kill_tweens()
	_apply_mix(2.5)
	_apply_ambients(2.0)
	_apply_mood_bus(2.5)
	_schedule_song_turn()


func _schedule_song_turn() -> void:
	if not _playback_available or _song_timer == null:
		return
	_song_timer.stop()
	var c := _music_culture(_primary_culture())
	if c == "shared":
		return
	var layer := folk_layer(_scene_class)
	var p: AudioStreamPlayer = _stem_players["%s:%s:%d" % [c, layer, _music_variant]]
	if p.stream != null:
		# Let a phrase settle before rotating. The previous 15–20 second
		# changes made the soundscape feel restless even in quiet scenes.
		_song_timer.start(maxf(p.stream.get_length() * 2.0 - 0.75, 18.0))


func _on_song_turn() -> void:
	if _music_culture(_primary_culture()) == "shared":
		return
	_music_variant = 1 - _music_variant
	if not _playback_available:
		return
	_kill_tweens()
	_apply_mix(0.75)
	_schedule_song_turn()


static func blend_fanfang() -> Dictionary:
	return {"islamic": 0.5, "east_asia": 0.5}


func _cultures_for(city: Dictionary, event: Dictionary) -> Dictionary:
	var eid := String(event.get("id", ""))
	if eid == "ev-zayton-fanfang" or eid.ends_with("-fanfang"):
		return blend_fanfang()
	# Caffa's Genoese port gives the western theme an actual route-side home;
	# the steppe voice keeps the Crimean hinterland in the mix.
	if String(city.get("id", "")) == "caffa":
		return {"latin": 0.7, "steppe": 0.3}
	var c := String(city.get("culture", "east_asia"))
	if c.is_empty() or not (c in CULTURES):
		c = "east_asia"
	return {c: 1.0}


static func _music_culture(culture: String) -> String:
	if culture == "orthodox":
		return "latin"
	return "shared" if culture in SHARED_CULTURES else culture


func _music_mix() -> Dictionary:
	var weights: Dictionary = {}
	for culture in _culture_mix:
		var music_culture := _music_culture(String(culture))
		weights[music_culture] = float(weights.get(music_culture, 0.0)) + float(_culture_mix[culture])
	return weights


func _stem_path(culture: String, layer: String, variant: int = 0) -> String:
	var music_culture := _music_culture(culture)
	if music_culture == "shared":
		return INTRO_PATH
	if layer in FOLK_LAYERS:
		var arrangement := "town" if layer == "melody" else ("road" if layer == "melody_road" else "quiet")
		return "%s/%s/%s%s.ogg" % [FOLK_ROOT, music_culture, arrangement, "_b" if variant == 1 else ""]
	return ""


static func folk_layer(scene_class: String) -> String:
	match scene_class:
		SceneDensity.PORT, SceneDensity.JOURNEY:
			return "melody_road"
		SceneDensity.WILD, SceneDensity.SHRINE, SceneDensity.COURT, SceneDensity.INN:
			return "melody_quiet"
		_:
			return "melody"


func _amb_path(name: String) -> String:
	return "%s/%s.ogg" % [AMB_ROOT, name]


func _load_loop(path: String) -> AudioStream:
	return _load_stream(path, true)


func _load_stream(path: String, loop: bool = false) -> AudioStream:
	if _loop_cache.has(path):
		return _loop_cache[path]
	if not ResourceLoader.exists(path) and not FileAccess.file_exists(path):
		push_warning("AudioDirector: missing %s" % path)
		return null
	var stream: AudioStream
	if path.ends_with(".ogg"):
		stream = AudioStreamOggVorbis.load_from_file(path)
	else:
		stream = load(path) as AudioStream
	if stream == null:
		push_warning("AudioDirector: failed to load %s" % path)
		return null
	if loop and stream is AudioStreamOggVorbis:
		(stream as AudioStreamOggVorbis).loop = true
	if loop and stream is AudioStreamWAV:
		(stream as AudioStreamWAV).loop_mode = AudioStreamWAV.LOOP_FORWARD
	_loop_cache[path] = stream
	return stream


func intro_available() -> bool:
	return ResourceLoader.exists(INTRO_PATH) or FileAccess.file_exists(INTRO_PATH)


func intro_active() -> bool:
	return _intro_active


func play_intro() -> void:
	_intro_active = false
	if not intro_available() or _intro_player == null:
		push_warning("AudioDirector: intro theme is unavailable")
		return
	var stream := _load_stream(INTRO_PATH)
	if stream == null:
		return
	# The opening desk can stay up indefinitely while the player reads.
	# Repeating the composed theme keeps a melody present until New Game/Load.
	if stream is AudioStreamWAV:
		(stream as AudioStreamWAV).loop_mode = AudioStreamWAV.LOOP_FORWARD
	_intro_player.stream = stream
	_intro_active = true
	_kill_intro_tween()
	_intro_player.volume_db = -80.0
	if not _playback_available:
		return
	_intro_player.play()
	_intro_tween = create_tween()
	_intro_tween.tween_property(_intro_player, "volume_db", 0.0, 0.8)


func stop_intro(fade_sec: float = 0.8) -> void:
	if _intro_player == null:
		_intro_active = false
		return
	_intro_active = false
	_kill_intro_tween()
	if not _playback_available or not _intro_player.playing or fade_sec <= 0.0:
		_intro_player.stop()
		_intro_player.volume_db = -80.0
		return
	_intro_tween = create_tween()
	_intro_tween.tween_property(_intro_player, "volume_db", -80.0, fade_sec)
	_intro_tween.tween_callback(func() -> void:
		if is_instance_valid(_intro_player):
			_intro_player.stop())


func _on_intro_finished() -> void:
	_intro_active = false


func _kill_intro_tween() -> void:
	if _intro_tween != null and _intro_tween.is_valid():
		_intro_tween.kill()
	_intro_tween = null


func _seek_stems(offset_sec: float) -> void:
	for key in _stem_players:
		var p: AudioStreamPlayer = _stem_players[key]
		if p.playing:
			p.seek(fmod(offset_sec, 60.0))


func _apply_mix(fade: float) -> void:
	var scene_gains := SceneDensity.layer_gains(_scene_class)
	var mood_p := AudioMood.params(_mood)
	var chosen_folk := folk_layer(_scene_class)
	var music_weights := _music_mix()
	for c in MUSIC_CULTURES:
		var weight := float(music_weights.get(c, 0.0))
		for layer in LAYERS:
			for variant in 2:
				var key := "%s:%s:%d" % [c, layer, variant]
				var p: AudioStreamPlayer = _stem_players[key]
				var target_lin := weight * float(scene_gains.get("melody", 0.0)) * float(mood_p.get("melody", 1.0))
				if (c == "shared" and (layer != "melody" or variant != 0)) or (c != "shared" and (layer != chosen_folk or variant != _music_variant)):
					target_lin = 0.0
				var target_db := linear_to_db(maxf(target_lin, 0.0001)) if target_lin > 0.001 else -80.0
				if weight > 0.0 and target_lin > 0.001:
					if p.stream == null:
						p.stream = _load_loop(_stem_path(c, layer, variant))
					if p.stream and not p.playing:
						p.play(0.0)
					p.pitch_scale = float(mood_p.get("pitch", 1.0))
				_fade_player(p, target_db, fade)
				if target_lin <= 0.001:
					_stop_after(p, fade + 0.05)


func ambient_plan() -> PackedStringArray:
	var names := SceneDensity.ambients(_scene_class, _context)
	if _scene_class == SceneDensity.SHRINE or _mood == AudioMood.REVERENCE:
		var sacred_culture := _primary_culture()
		if sacred_culture == "orthodox":
			sacred_culture = "latin"
		var sacred := "sacred_blur_%s" % sacred_culture
		if names.size() >= 4:
			names.resize(3)
		names.append(sacred)
	return names


func _apply_ambients(fade: float) -> void:
	var names := ambient_plan()
	# Keep a bed on its existing player even when its position in the plan
	# changes; reopening the same site must not restart the recording.
	var pending := Array(names)
	var spare: Array[AudioStreamPlayer] = []
	for p in _amb_players:
		var current := str(p.get_meta("ambient_name", ""))
		if current in pending:
			pending.erase(current)
			if not p.playing: p.play()
			_fade_player(p, -15.0 - SceneDensity.reverb(_scene_class) * 4.0, fade)
		else:
			spare.append(p)
	for p in spare:
		if not pending.is_empty():
			var name: String = pending.pop_front()
			p.stop()
			p.stream = _load_loop(_amb_path(name))
			p.set_meta("ambient_name", name)
			p.volume_db = -80.0
			if p.stream != null: p.play()
			_fade_player(p, -15.0 - SceneDensity.reverb(_scene_class) * 4.0, fade)
		else:
			_fade_player(p, -80.0, fade)
			_stop_after(p, fade + 0.05)


func _apply_mood_bus(fade: float) -> void:
	var mood_p := AudioMood.params(_mood)
	if _lp:
		var tw := create_tween()
		_tweens.append(tw)
		tw.tween_property(_lp, "cutoff_hz", float(mood_p["cutoff"]), fade)
	var bi := AudioServer.get_bus_index(BUS_MUSIC)
	if bi >= 0:
		var tw2 := create_tween()
		_tweens.append(tw2)
		tw2.tween_method(
			func(v: float) -> void: AudioServer.set_bus_volume_db(bi, v),
			AudioServer.get_bus_volume_db(bi),
			float(mood_p["music_db"]),
			fade
		)


func _primary_culture() -> String:
	var best := "east_asia"
	var best_w := -1.0
	for k in _culture_mix:
		var w := float(_culture_mix[k])
		if w > best_w:
			best_w = w
			best = String(k)
	return best


func _fade_player(p: AudioStreamPlayer, target_db: float, sec: float) -> void:
	var tw := create_tween()
	_tweens.append(tw)
	tw.tween_property(p, "volume_db", target_db, maxf(sec, 0.05))


func _stop_after(p: AudioStreamPlayer, sec: float) -> void:
	var tw := create_tween()
	_tweens.append(tw)
	tw.tween_interval(sec)
	tw.tween_callback(func() -> void:
		if is_instance_valid(p) and p.volume_db <= -70.0:
			p.stop()
	)


func _kill_tweens() -> void:
	for tw in _tweens:
		if tw and tw.is_valid():
			tw.kill()
	_tweens.clear()
