extends SceneTree

## Dock drag regression (OPTIMIZATION_PLAN §5): the two bottom panels each get
## a grab rail on their top edge, dragging resizes them live with a sane clamp,
## the map projection gives up room for the taller panel, and heights persist
## to user://ui.cfg under [dock].

const _WATCHDOG_SEC := 60.0
var _t := 0.0

func _process(d: float) -> bool:
	_t += d
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: smoke_dock_drag exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame
	await process_frame
	if n._desk == null:
		printerr("  FAIL: boot desk never built")
		quit(1)
		return

	# The docks are built with the map, so start a real run first.
	n._draw_character()
	n._confirm_character_draw()
	if n.state == null or n._log_wrap == null:
		printerr("  FAIL: game did not start (docks missing)")
		quit(1)
		return

	# Deterministic start: ignore whatever a previous run persisted, but keep
	# the original so the config can be restored exactly as found.
	var original_dock: Dictionary = n._dock_h.duplicate(true)
	n._dock_h.clear()
	n._resize_docks()

	var handles_ok := true
	var pin_ok := true
	var live_ok := true
	var clamp_ok := true
	var persist_ok := true
	var input_ok := true
	var default_ok := true

	# Handles must exist for both docks.
	var log_handle: Control = n._dock_handles.get("log", null)
	var panel_handle: Control = n._dock_handles.get("panel", null)
	if log_handle == null or panel_handle == null:
		printerr("  FAIL: dock handles missing (log=%s panel=%s)"
			% [log_handle != null, panel_handle != null])
		handles_ok = false

	# Handles hug the panel top edges and stop mouse input (grab target).
	if log_handle != null and n._log_wrap != null:
		if absf(log_handle.offset_bottom - n._log_wrap.offset_top) > 0.5:
			printerr("  FAIL: log handle not pinned to panel top")
			pin_ok = false
		if log_handle.mouse_filter != Control.MOUSE_FILTER_STOP:
			printerr("  FAIL: log handle does not stop mouse input")
			pin_ok = false
	if panel_handle != null and n._panel_wrap != null:
		if absf(panel_handle.offset_bottom - n._panel_wrap.offset_top) > 0.5:
			printerr("  FAIL: panel handle not pinned to panel top")
			pin_ok = false

	# Default height matches Metrics and the projection uses it.
	var default_h: float = n._dock_height("log")
	if absf(default_h - Metrics.dock_height()) > 0.5:
		printerr("  FAIL: default dock height %.1f != Metrics %.1f"
			% [default_h, Metrics.dock_height()])
		default_ok = false

	# Live drag: pulling the log panel taller moves its top edge and shrinks
	# the map viewport by exactly the taller panel.
	var proj_before: float = n.projection.height
	n._drag_dock_to("log", 200.0)
	await process_frame
	var dragged_h: float = n._dock_height("log")
	if absf(dragged_h - (n.size.y - 12.0 - 200.0)) > 2.0:
		printerr("  FAIL: drag did not follow pointer (h=%.1f)" % dragged_h)
		live_ok = false
	if absf(n._log_wrap.offset_top + dragged_h) > 0.5:
		printerr("  FAIL: log wrap top not resized (top=%.1f h=%.1f)"
			% [n._log_wrap.offset_top, dragged_h])
		live_ok = false
	if absf(n._dock_floor() - dragged_h) > 0.5:
		printerr("  FAIL: dock floor not the taller panel")
		live_ok = false
	if n.projection.height >= proj_before - 1.0:
		printerr("  FAIL: projection did not give up room for the taller dock")
		live_ok = false

	# Clamping: a drag off the top of the window caps at 80%; one at the very
	# bottom floors at the readable minimum.
	n._drag_dock_to("log", -1000.0)
	await process_frame
	var max_h: float = maxf(n.size.y * n.DOCK_MAX_FRAC, n._min_dock_height() + 1.0)
	if absf(n._dock_height("log") - max_h) > 2.0:
		printerr("  FAIL: drag above window did not clamp to 80%% (h=%.1f)"
			% n._dock_height("log"))
		clamp_ok = false
	n._drag_dock_to("log", n.size.y)
	await process_frame
	if absf(n._dock_height("log") - n._min_dock_height()) > 2.0:
		printerr("  FAIL: drag to floor did not clamp to minimum (h=%.1f)"
			% n._dock_height("log"))
		clamp_ok = false

	# Persistence round-trip through user://ui.cfg.
	var saved_h: float = n._dock_height("log")
	n._save_dock_heights()
	n._dock_h.clear()
	n._load_dock_heights()
	if absf(n._dock_height("log") - saved_h) > 2.0:
		printerr("  FAIL: dock height did not survive save/load (%.1f vs %.1f)"
			% [n._dock_height("log"), saved_h])
		persist_ok = false

	# The handle press/release wiring: press arms the drag, release clears it.
	var press := InputEventMouseButton.new()
	press.button_index = MOUSE_BUTTON_LEFT
	press.pressed = true
	var release := InputEventMouseButton.new()
	release.button_index = MOUSE_BUTTON_LEFT
	release.pressed = false
	n._on_dock_handle_input(press, "panel")
	if n._dragging_dock != "panel":
		printerr("  FAIL: handle press did not arm the drag")
		input_ok = false
	n._input(release)
	if n._dragging_dock != "":
		printerr("  FAIL: release did not end the drag")
		input_ok = false

	var ok: bool = handles_ok and pin_ok and default_ok and live_ok \
		and clamp_ok and persist_ok and input_ok
	print("DOCK_DRAG: handles=%s pin=%s default=%s live=%s clamp=%s persist=%s input=%s" % [
		handles_ok, pin_ok, default_ok, live_ok, clamp_ok, persist_ok, input_ok])
	print("DOCK_DRAG: log_h=%.1f panel_h=%.1f floor=%.1f proj_h=%.1f" % [
		n._dock_height("log"), n._dock_height("panel"),
		n._dock_floor(), n.projection.height])
	print("DOCK_DRAG: %s" % ("OK" if ok else "FAIL"))
	# Leave the config as found: drop the test's customization, restore the
	# player's own dock heights if any existed before this run.
	n._dock_h = original_dock
	n._save_dock_heights()
	quit(0 if ok else 1)
