extends RefCounted

## N0 acceptance: the reduce-motion switch must actually suppress motion,
## not merely speed it up.

var _f := 0
func _ok(c: bool, w: String) -> void:
	if not c:
		printerr("  FAIL: %s" % w)
		_f += 1

func run() -> bool:
	Motion.reduce_motion = false
	Motion.duration_scale = 1.0
	_ok(is_equal_approx(Motion.dur(0.4), 0.4), "normal duration passes through")
	_ok(Motion.allows(Motion.Kind.MOVE), "movement allowed by default")
	_ok(Motion.dur(0.4, Motion.Kind.PARTICLE) > 0.0, "particles run by default")

	# Under reduce_motion: positional motion is forbidden outright (not just
	# shortened), and particles collapse to zero.
	Motion.reduce_motion = true
	_ok(not Motion.allows(Motion.Kind.MOVE), "movement suppressed")
	_ok(not Motion.allows(Motion.Kind.ROTATE), "rotation suppressed")
	_ok(Motion.allows(Motion.Kind.FADE), "fade still permitted")
	_ok(is_equal_approx(Motion.dur(0.4), 0.2), "durations halved")
	_ok(is_equal_approx(Motion.dur(0.4, Motion.Kind.PARTICLE), 0.0), "particles disabled")

	Motion.reduce_motion = false
	Motion.duration_scale = 0.5
	_ok(is_equal_approx(Motion.dur(0.4), 0.2), "global scale applies")
	Motion.duration_scale = 1.0

	print("test_motion: %s" % ("PASS" if _f == 0 else "FAIL (%d)" % _f))
	return _f == 0
