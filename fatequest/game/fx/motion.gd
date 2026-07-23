class_name Motion
extends RefCounted

## Motion policy — docs/ANIMATION_PLAN.md §1 / N0.
##
## Built before the first animation exists, deliberately. Retrofitting a
## reduce-motion switch after the animations are written means auditing every
## Tween ever added; having it first means every animation is written through
## it from the start.
##
## Atlas already models this in methodExperiences.ts
## (`reducedMotionFallback: "fade" | "none"`) — the same idea, kept on port.

enum Kind { MOVE, FADE, SCALE, ROTATE, PARTICLE }

static var reduce_motion: bool = false
static var duration_scale: float = 1.0


## Duration a tween should actually use.
## Under reduce_motion everything is halved; particles collapse to zero.
static func dur(seconds: float, kind: int = Kind.FADE) -> float:
	if reduce_motion:
		if kind == Kind.PARTICLE:
			return 0.0
		return seconds * 0.5 * duration_scale
	return seconds * duration_scale


## Whether a motion of this kind may play at all. Positional/rotational motion
## is what triggers vestibular discomfort, so those degrade to a plain fade
## rather than simply running faster.
static func allows(kind: int) -> bool:
	if not reduce_motion:
		return true
	return kind == Kind.FADE


## Fade a CanvasItem, honouring the policy. The single entry point for the
## commonest transition, so no call site has to remember the rules.
static func fade(node: CanvasItem, to: float, seconds: float = 0.25) -> Tween:
	var t := node.create_tween()
	t.tween_property(node, "modulate:a", to, dur(seconds, Kind.FADE))
	return t


## Slide + fade, degrading to fade alone under reduce_motion.
static func rise(node: CanvasItem, from_offset: Vector2, seconds: float = 0.25) -> Tween:
	var target: Vector2 = node.position
	var t := node.create_tween()
	t.set_parallel(true)
	if allows(Kind.MOVE):
		node.position = target + from_offset
		t.tween_property(node, "position", target, dur(seconds, Kind.MOVE))
	node.modulate.a = 0.0
	t.tween_property(node, "modulate:a", 1.0, dur(seconds, Kind.FADE))
	return t
