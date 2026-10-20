class_name Motion
extends RefCounted

## All UI transitions share a single cancellable channel per node. Reopening
## a panel replaces its closing tween, including the old hide callback.
enum Kind { MOVE, FADE, SCALE, ROTATE, PARTICLE }

static var reduce_motion: bool = false
static var duration_scale: float = 1.0
const TRANSITION := &"_motion_transition"
const RESTORE := &"_motion_restore"
const FEEDBACK := &"_motion_button_feedback"

static func dur(seconds: float, kind: int = Kind.FADE) -> float:
	if reduce_motion and kind == Kind.PARTICLE:
		return 0.0
	return maxf(seconds, 0.0) * maxf(duration_scale, 0.0) * (0.5 if reduce_motion else 1.0)

static func allows(kind: int) -> bool:
	return not reduce_motion or kind == Kind.FADE

## Safe to call when dismissing a panel without an exit animation.
static func cancel(node: CanvasItem) -> void:
	if not is_instance_valid(node):
		return
	if node.has_meta(TRANSITION):
		var old = node.get_meta(TRANSITION)
		if old is Tween and old.is_valid():
			old.kill()
		node.remove_meta(TRANSITION)
	if node.has_meta(RESTORE):
		var values: Dictionary = node.get_meta(RESTORE)
		for property in values:
			node.set(property, values[property])
		node.remove_meta(RESTORE)
	node.modulate.a = 1.0

static func _begin(node: CanvasItem) -> Tween:
	cancel(node)
	var t := node.create_tween()
	node.set_meta(TRANSITION, t)
	var tween_id := t.get_instance_id()
	t.finished.connect(func():
		if is_instance_valid(node) and node.has_meta(TRANSITION) \
				and node.get_meta(TRANSITION).get_instance_id() == tween_id:
			node.remove_meta(TRANSITION)
			if node.has_meta(RESTORE):
				node.remove_meta(RESTORE))
	return t

static func fade(node: CanvasItem, to: float, seconds: float = 0.25) -> Tween:
	var alpha := node.modulate.a
	var t := _begin(node)
	node.modulate.a = alpha
	t.tween_property(node, "modulate:a", clampf(to, 0.0, 1.0), dur(seconds))
	return t

static func rise(node: CanvasItem, from_offset: Vector2 = Vector2(0, 12),
		seconds: float = 0.25) -> Tween:
	var t := _begin(node)
	var target: Vector2 = node.position
	t.set_parallel(true)
	if allows(Kind.MOVE):
		node.set_meta(RESTORE, {"position": target})
		node.position = target + from_offset
		t.tween_property(node, "position", target, dur(seconds, Kind.MOVE))
	# Interactive content is readable from the first frame, even if selected
	# immediately by a keyboard. Entrance motion never gates game logic.
	node.modulate.a = 0.65
	t.tween_property(node, "modulate:a", 1.0, dur(seconds))
	return t

static func parchment_expand(node: CanvasItem, seconds: float = 0.40) -> Tween:
	var t := _begin(node)
	t.set_parallel(true)
	node.modulate.a = 0.65
	if allows(Kind.SCALE):
		var resting_scale: Vector2 = node.scale
		node.set_meta(RESTORE, {"scale": resting_scale})
		node.scale = resting_scale * Vector2(1.0, 0.97)
		t.tween_property(node, "scale", resting_scale, dur(seconds, Kind.SCALE)) \
			.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
	t.tween_property(node, "modulate:a", 1.0, dur(seconds))
	return t

static func crossfade_in(node: CanvasItem, seconds: float = 0.18) -> Tween:
	cancel(node)
	node.visible = true
	node.modulate.a = 0.65
	return fade(node, 1.0, seconds)

static func crossfade_out(node: CanvasItem, seconds: float = 0.18) -> Tween:
	var t := fade(node, 0.0, seconds)
	t.finished.connect(func():
		if is_instance_valid(node):
			node.visible = false
			node.modulate.a = 1.0)
	return t

static func stagger_in(nodes: Array, step: float = 0.04,
		seconds: float = 0.18) -> void:
	var i := 0
	for n in nodes:
		if n is CanvasItem:
			var item := n as CanvasItem
			var t := _begin(item)
			item.modulate.a = 0.65
			# Long choice lists must not spend seconds waiting to become readable.
			t.tween_interval(dur(minf(step * float(i), 0.16)))
			t.tween_property(item, "modulate:a", 1.0, dur(seconds))
			i += 1

## Applied once by Panels, including flat illustrated buttons. The overlay
## never changes layout, scale, hit targets, or the button's entrance alpha.
static func button_feedback(button: Button) -> void:
	if button.has_meta(FEEDBACK):
		return
	var feedback := ButtonFeedback.new()
	feedback.name = "ButtonFeedback"
	button.set_meta(FEEDBACK, feedback)
	button.add_child(feedback)
	feedback.attach(button)

class ButtonFeedback extends Control:
	var button: Button
	var hovered := false
	var held := false
	var target := -1.0
	var tween: Tween
	var strength := 0.0:
		set(value):
			strength = value
			queue_redraw()

	func attach(owner_button: Button) -> void:
		button = owner_button
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		focus_mode = Control.FOCUS_NONE
		# Stay within this button's canvas order; raising z would also paint
		# feedback over unrelated modal siblings elsewhere in the UI.
		z_index = 0
		set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		button.child_order_changed.connect(_keep_on_top)
		button.mouse_entered.connect(func(): hovered = true; refresh())
		button.mouse_exited.connect(func(): hovered = false; refresh())
		button.focus_entered.connect(refresh)
		button.focus_exited.connect(refresh)
		button.button_down.connect(func(): held = true; refresh())
		button.button_up.connect(func(): held = false; refresh())
		button.toggled.connect(func(_pressed: bool): refresh())
		button.visibility_changed.connect(_visibility_changed)
		# BaseButton queues a redraw on disabled changes; this also clears an
		# interrupted press immediately when its action disables the button.
		button.draw.connect(refresh)
		refresh()

	func _keep_on_top() -> void:
		if (is_instance_valid(button) and get_parent() == button
				and get_index() != button.get_child_count() - 1):
			button.move_child(self, -1)

	func _visibility_changed() -> void:
		held = false
		hovered = false
		refresh()

	func refresh() -> void:
		if not is_instance_valid(button):
			return
		var next := 0.0
		if not button.disabled and button.is_visible_in_tree():
			if held or (button.toggle_mode and button.button_pressed):
				next = 1.8
			elif hovered or button.has_focus():
				next = 1.0
		else:
			held = false
		if is_equal_approx(next, target):
			if Motion.reduce_motion and tween != null and tween.is_running():
				tween.kill()
				strength = next
			return
		target = next
		if tween != null and tween.is_valid():
			tween.kill()
		if Motion.reduce_motion or not is_inside_tree() or button.disabled:
			strength = target
		else:
			tween = create_tween()
			tween.tween_property(self, "strength", target, Motion.dur(0.10)) \
				.set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
		queue_redraw()

	func _draw() -> void:
		if strength <= 0.001 or not is_instance_valid(button) or button.disabled:
			return
		var color := Palette.FOCUS if button.has_focus() else Palette.accent()
		if UiScale.high_contrast:
			color = Palette.ink()
		var fill := color
		fill.a = 0.035 * strength
		draw_rect(Rect2(Vector2(2, 2), size - Vector2(4, 4)), fill)
		color.a = minf(0.75, strength * 0.55)
		draw_line(Vector2(3, 7), Vector2(3, maxf(7, size.y - 7)), color, 2.0)
