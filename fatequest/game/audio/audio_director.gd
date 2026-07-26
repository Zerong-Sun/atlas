extends Node

## FateQuest audio director — AUDIO_PLAN.md §8 A1–A6.
##
## Autoload. L2 presentation only: never writes WorldState; music RNG is an
## independent fork (CODE_PLAN.md §2.1). Distinguishes places by
## culture × scene × mood — NOT one track per city (§10).

const BUS_MASTER := "Master"
const BUS_MUSIC := "Music"
const BUS_AMBIENT := "Ambient"
const BUS_SFX := "SFX"
const STEM_ROOT := "res://assets/audio/stems"
const AMB_ROOT := "res://assets/audio/ambient"
const LAYERS: PackedStringArray = ["drone", "pulse", "melody", "color"]
const CULTURES: PackedStringArray = ["islamic", "east_asia", "steppe", "indian_ocean", "latin"]
const CROSSFADE_SEC := 10.0

signal mute_changed(muted: bool)

var muted: bool = false:
	set(v):
		muted = v
		var idx := AudioServer.get_bus_index(BUS_MASTER)
		if idx >= 0:
			AudioServer.set_bus_mute(idx, v)
		mute_changed.emit(v)

var volume_db: float = -6.0:
	set(v):
		volume_db = clampf(v, -60.0, 6.0)
		var idx := AudioServer.get_bus_index(BUS_MASTER)
		if idx >= 0:
			AudioServer.set_bus_volume_db(idx, volume_db)

var _culture_mix: Dictionary = {}
var _scene_class: String = SceneDensity.TOWN
var _mood: String = AudioMood.NEUTRAL
var _scene_bg: String = ""
var _city_id: String = ""
var _jdn: int = 0
var _prev_route_risk: int = 0

var _stem_players: Dictionary = {}
var _amb_players: Array[AudioStreamPlayer] = []
var _sfx: AudioSfx
var _lp: AudioEffectLowPassFilter
var _tweens: Array[Tween] = []


func _ready() -> void:
	volume_db = volume_db
	muted = muted
	_cache_lowpass()
	_sfx = preload("res://game/audio/sfx.gd").new()
	add_child(_sfx)
	for c in CULTURES:
		for layer in LAYERS:
			var key := "%s:%s" % [c, layer]
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


func _cache_lowpass() -> void:
	var bi := AudioServer.get_bus_index(BUS_MUSIC)
	if bi < 0:
		return
	for ei in AudioServer.get_bus_effect_count(bi):
		var fx := AudioServer.get_bus_effect(bi, ei)
		if fx is AudioEffectLowPassFilter:
			_lp = fx
			return


func toggle_mute() -> bool:
	muted = not muted
	return muted


func sfx(kind: String) -> void:
	if muted:
		return
	_sfx.play(kind)


static func music_rng(city_id: String, jdn: int) -> Rng:
	return Rng.new("music:%s:%d" % [city_id, jdn])


func set_jdn(jdn: int) -> void:
	_jdn = jdn


func set_place(city: Dictionary, event: Dictionary = {}, blend: Dictionary = {}) -> void:
	_city_id = String(city.get("id", ""))
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
	_seek_stems(rng.next() * 50.0)

	_mood = AudioMood.derive(null, {}, city, _scene_class, _prev_route_risk)
	_kill_tweens()
	_apply_mix(CROSSFADE_SEC)
	_apply_ambients(CROSSFADE_SEC * 0.6)
	_apply_mood_bus(CROSSFADE_SEC * 0.5)


func set_route_context(route: Dictionary) -> void:
	_prev_route_risk = int(route.get("risk", 0))
	var tense := _prev_route_risk >= 4
	for h in route.get("hazards", []):
		if String(h) in ["bandits", "pirates", "storm"]:
			tense = true
	if tense:
		_mood = AudioMood.TENSION
		_kill_tweens()
		_apply_mood_bus(4.0)
		_apply_mix(4.0)


func on_effect_result(res: Variant, route: Dictionary, city: Dictionary, coins_before: int = -1) -> void:
	if coins_before >= 0:
		_mood = AudioMood.derive_with_coins(res, route, city, _scene_class, _prev_route_risk, coins_before)
	else:
		_mood = AudioMood.derive(res, route, city, _scene_class, _prev_route_risk)
	_kill_tweens()
	_apply_mood_bus(3.5)
	_apply_mix(3.5)
	_apply_ambients(2.5)
	sfx("click")


func on_depart(route: Dictionary) -> void:
	set_route_context(route)
	sfx("wood")


static func blend_fanfang() -> Dictionary:
	return {"islamic": 0.5, "east_asia": 0.5}


func _cultures_for(city: Dictionary, event: Dictionary) -> Dictionary:
	var eid := String(event.get("id", ""))
	if eid == "ev-zayton-fanfang" or eid.ends_with("-fanfang"):
		return blend_fanfang()
	var c := String(city.get("culture", "east_asia"))
	if c.is_empty() or not (c in CULTURES):
		c = "east_asia"
	return {c: 1.0}


func _stem_path(culture: String, layer: String) -> String:
	return "%s/%s/%s.ogg" % [STEM_ROOT, culture, layer]


func _amb_path(name: String) -> String:
	return "%s/%s.ogg" % [AMB_ROOT, name]


func _load_loop(path: String) -> AudioStream:
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
	if stream is AudioStreamOggVorbis:
		(stream as AudioStreamOggVorbis).loop = true
	return stream


func _seek_stems(offset_sec: float) -> void:
	for key in _stem_players:
		var p: AudioStreamPlayer = _stem_players[key]
		if p.playing:
			p.seek(fmod(offset_sec, 60.0))


func _apply_mix(fade: float) -> void:
	var scene_gains := SceneDensity.layer_gains(_scene_class)
	var mood_p := AudioMood.params(_mood)
	for c in CULTURES:
		var weight := float(_culture_mix.get(c, 0.0))
		for layer in LAYERS:
			var key := "%s:%s" % [c, layer]
			var p: AudioStreamPlayer = _stem_players[key]
			var target_lin := weight * float(scene_gains.get(layer, 0.0)) * float(mood_p.get(layer, 1.0))
			var target_db := linear_to_db(maxf(target_lin, 0.0001)) if target_lin > 0.001 else -80.0
			if weight > 0.0 and target_lin > 0.001:
				if p.stream == null:
					p.stream = _load_loop(_stem_path(c, layer))
				if p.stream and not p.playing:
					p.play()
				p.pitch_scale = float(mood_p.get("pitch", 1.0))
			_fade_player(p, target_db, fade)
			if target_lin <= 0.001:
				_stop_after(p, fade + 0.05)


func _apply_ambients(fade: float) -> void:
	var names := SceneDensity.ambients(_scene_class)
	if _scene_class == SceneDensity.SHRINE or _mood == AudioMood.REVERENCE:
		var sacred := "sacred_blur_%s" % _primary_culture()
		if FileAccess.file_exists(_amb_path(sacred)) or ResourceLoader.exists(_amb_path(sacred)):
			var copy := PackedStringArray()
			for n in names:
				copy.append(n)
			copy.append(sacred)
			names = copy
	for i in _amb_players.size():
		var p: AudioStreamPlayer = _amb_players[i]
		if i < names.size():
			var stream := _load_loop(_amb_path(names[i]))
			if stream:
				if p.stream != stream:
					p.stream = stream
				if not p.playing:
					p.play()
				var wet := SceneDensity.reverb(_scene_class)
				_fade_player(p, -8.0 - wet * 4.0, fade)
			else:
				_fade_player(p, -80.0, fade)
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
