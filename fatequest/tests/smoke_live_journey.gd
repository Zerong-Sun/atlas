extends SceneTree

## Formal live journey regression, promoted from the temporary diagnostic:
## road encounter -> follow-up -> deliberate pause -> autosave reload ->
## follow-up completion -> entry chain -> city roads.

const WATCHDOG := 90.0
var elapsed := 0.0


func _process(delta: float) -> bool:
    elapsed += delta
    if elapsed > WATCHDOG:
        printerr("LIVE_JOURNEY: WATCHDOG")
        quit(1)
    return false


func _init() -> void:
    var main = load("res://game/screens/main.tscn").instantiate()
    root.add_child(main)
    await process_frame
    main._draw_character()
    main._confirm_character_draw()
    await process_frame

    main.state.city = "egrigaia"
    main.state.coins = 100000
    if "travel-papers" not in main.state.items:
        main.state.items.append("travel-papers")
    var source: Dictionary = main.db.get_record("rt-egrigaia-tenduc")
    var route: Dictionary = source.duplicate(true)
    route["id"] = "rt-smoke-live-pause"
    route["risk"] = 5
    route["season"] = {}
    route["encounters"] = ["ev-road-fadlan-25"]
    main.state.revealed[route["id"]] = 1

    main._perform_depart(route, "foot")
    await process_frame
    var checkpoint_ok: bool = (main.state.city == "tenduc"
        and not main.state.active_journey.is_empty()
        and main.state.pending_events == ["ev-road-fadlan-25"]
        and main._dialog_layer.visible)

    # Resolve the encounter. The follow-up should open immediately, without a
    # hidden three-page cap or a blank intermediate panel.
    main._resolve_choice(main._current_event, 0)
    await process_frame
    var followup_id := String(main._current_event.get("id", ""))
    var followup_open: bool = (main._dialog_layer.visible
        and followup_id == "ev-road-fadlan-25-followup"
        and main.state.active_event == followup_id)
    var progress_ok: bool = (main._dialog._context.visible
        and String(main._dialog._context.text).contains("第"))

    # The player can still choose to pause. This is the only path that should
    # produce the pending pause panel.
    main._on_event_dismissed()
    await process_frame
    var paused_ok: bool = (not main._dialog_layer.visible
        and main.state.active_event == "ev-road-fadlan-25-followup"
        and _has_button(main._panel, "继续处理", "Continue"))

    # Reload the exact checkpoint and verify the active follow-up is restored.
    var load_ok: bool = main._load("auto")
    await process_frame
    var restored_ok: bool = (load_ok
        and main._dialog_layer.visible
        and String(main._current_event.get("id", "")) == "ev-road-fadlan-25-followup")

    main._resolve_choice(main._current_event, 0)
    await process_frame
    var result_ok: bool = main._dialog_layer.visible
    main._on_event_dismissed()
    await process_frame
    await _drain_to_city(main)

    var arrived_ok: bool = (main.state.city == "tenduc"
        and main.state.active_journey.is_empty()
        and main.state.active_event.is_empty()
        and main.state.pending_events.is_empty())

    main._close_city()
    await process_frame
    var route_visible := false
    for child in main._panel.get_children():
        if child is Button and String(child.text).contains("→"):
            route_visible = child.get_global_rect().position.y < main._panel_wrap.get_global_rect().end.y
            break

    print("LIVE_JOURNEY: checkpoint=%s followup=%s progress=%s paused=%s restored=%s result=%s arrived=%s route=%s" % [
        checkpoint_ok, followup_open, progress_ok, paused_ok, restored_ok, result_ok, arrived_ok, route_visible])
    var ok: bool = (checkpoint_ok and followup_open and paused_ok and restored_ok
        and progress_ok and result_ok and arrived_ok and route_visible)
    print("LIVE_JOURNEY: %s" % ("OK" if ok else "FAIL"))
    quit(0 if ok else 1)


func _has_button(node: Node, zh: String, en: String) -> bool:
    for child in _walk(node):
        if child is Button and (String(child.text).contains(zh) or String(child.text).contains(en)):
            return true
    return false


func _drain_to_city(main) -> void:
    for _step in 128:
        await process_frame
        if main._dialog_layer.visible:
            for child in main._dialog._choices.get_children():
                if child is Button and not child.disabled:
                    child.pressed.emit()
                    break
            continue
        if not main.state.active_event.is_empty() or not main.state.pending_events.is_empty():
            for child in _walk(main._panel):
                if child is Button and not child.disabled:
                    child.pressed.emit()
                    break
            continue
        if main._city_view.visible:
            return
    printerr("LIVE_JOURNEY: did not return to city")


func _walk(node: Node) -> Array:
    var out := [node]
    for child in node.get_children():
        out.append_array(_walk(child))
    return out
