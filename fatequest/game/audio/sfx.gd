class_name AudioSfx
extends Node

## Procedural UI / ritual decoration (AUDIO_PLAN.md §7.3).
## Builds short in-memory WAV buffers so each call can vary slightly.

const BUS := "SFX"
const SR := 22050

var _player: AudioStreamPlayer
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	_player = AudioStreamPlayer.new()
	_player.bus = BUS
	_player.volume_db = -4.0
	add_child(_player)


func _exit_tree() -> void:
	if _player != null:
		_player.stop()
		_player.stream = null


func play(kind: String) -> void:
	var samples: PackedFloat32Array
	match kind:
		"bell", "chime":
			samples = _mix([
				_bell(880.0 + _rng.randf_range(-20, 40), 0.55, 0.18),
				_bell(1175.0, 0.45, 0.1),
			])
		"gong":
			samples = _mix([
				_bell(196.0 + _rng.randf_range(-8, 8), 1.4, 0.22),
				_noise(0.5, 0.04, 400.0),
			])
		"qing", "磬":
			samples = _bell(1320.0, 0.9, 0.14)
		"muyu", "木鱼":
			samples = _mix([_noise(0.05, 0.12, 1600.0), _tone(420.0, 0.07, 0.08, 300.0)])
		"coin":
			var parts: Array[PackedFloat32Array] = []
			for i in 3:
				parts.append(_tone(2200.0 + i * 180.0, 0.2, 0.07, 3280.0))
			samples = _mix(parts)
		"page", "flip":
			samples = _noise(0.12, 0.1, 2600.0)
		"dice":
			var dparts: Array[PackedFloat32Array] = []
			for i in 3:
				dparts.append(_noise(0.05, 0.1, 1200.0))
				dparts.append(_tone(320.0 + i * 40.0, 0.05, 0.06))
			samples = _mix(dparts)
		"shake", "lot":
			var sparts: Array[PackedFloat32Array] = []
			for i in 5:
				sparts.append(_noise(0.05, 0.08, 2800.0))
			samples = _mix(sparts)
		"click", "ui":
			samples = _tone(660.0 + _rng.randf_range(-30, 30), 0.05, 0.06)
		"wood":
			samples = _mix([_noise(0.06, 0.14, 900.0), _tone(210.0, 0.08, 0.1, 150.0)])
		"tick":
			samples = _mix([_noise(0.03, 0.09, 1400.0), _tone(340.0, 0.05, 0.07, 240.0)])
		_:
			samples = _tone(520.0, 0.08, 0.05)
	_play_samples(samples)


func _play_samples(samples: PackedFloat32Array) -> void:
	if samples.is_empty():
		return
	var bytes := PackedByteArray()
	bytes.resize(samples.size() * 2)
	for i in samples.size():
		var v := int(clampf(samples[i], -1.0, 1.0) * 32767.0)
		bytes.encode_s16(i * 2, v)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = SR
	stream.stereo = false
	stream.data = bytes
	_player.stream = stream
	_player.play()


func _tone(f0: float, dur: float, peak: float, f1: float = -1.0) -> PackedFloat32Array:
	var n := int(dur * SR)
	var out := PackedFloat32Array()
	out.resize(n)
	for i in n:
		var t := float(i) / SR
		var env := peak * exp(-t * (3.0 / maxf(dur, 0.01)))
		var f := f0 if f1 < 0.0 else lerpf(f0, f1, t / dur)
		out[i] = sin(TAU * f * t) * env
	return out


func _bell(f: float, dur: float, peak: float) -> PackedFloat32Array:
	var n := int(dur * SR)
	var out := PackedFloat32Array()
	out.resize(n)
	var ratios := [1.0, 2.76, 5.4]
	var amps := [1.0, 0.4, 0.15]
	for i in n:
		var t := float(i) / SR
		var s := 0.0
		for k in ratios.size():
			s += amps[k] * sin(TAU * f * ratios[k] * t) * exp(-t * (1.5 + k))
		out[i] = s * peak * exp(-t * 2.5)
	return out


func _noise(dur: float, peak: float, bright: float) -> PackedFloat32Array:
	var n := int(dur * SR)
	var out := PackedFloat32Array()
	out.resize(n)
	var prev := 0.0
	var a := exp(-2.0 * PI * bright / SR)
	for i in n:
		var t := float(i) / SR
		var env := peak * exp(-t * (8.0 / maxf(dur, 0.01)))
		var white := _rng.randf_range(-1.0, 1.0)
		prev = (1.0 - a) * white + a * prev
		out[i] = prev * env
	return out


func _mix(parts: Array) -> PackedFloat32Array:
	var longest := 0
	for p in parts:
		longest = maxi(longest, (p as PackedFloat32Array).size())
	var out := PackedFloat32Array()
	out.resize(longest)
	for p in parts:
		var arr := p as PackedFloat32Array
		for i in arr.size():
			out[i] += arr[i]
	# Soft peak normalize
	var peak := 0.0
	for i in out.size():
		peak = maxf(peak, absf(out[i]))
	if peak > 1.0:
		for i in out.size():
			out[i] /= peak
	return out
