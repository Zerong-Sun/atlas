extends SceneTree

## Player-surface regression:
## 1. A city figure's caption must be part of the same hit target as its art.
## 2. Entering "set out" must put the route list above the scroll fold.
## 3. The route panel must return to the city through an explicit action.

const WATCHDOG := 60.0
var elapsed := 0.0


func _process(delta: float) -> bool:
    elapsed += delta
    if elapsed > WATCHDOG:
        printerr("PLAYER_SURFACE: WATCHDOG")
        quit(1)
    return false


func _init() -> void:
    var main = load("res://game/screens/main.tscn").instantiate()
    root.add_child(main)
    await process_frame
    main._draw_character()
    main._confirm_character_draw()
    await process_frame

    # Keep the fixture generous so route availability cannot be the thing
    # under test.
    main.state.coins = 100000
    if "travel-papers" not in main.state.items:
        main.state.items.append("travel-papers")
    await _drain_to_city(main)

    var figure: Button = null
    for candidate in main._city_view._figures.get_children():
        if candidate is Button and not candidate.disabled:
            figure = candidate
            break

    var target_ok := figure != null
    var caption_ok := false
    if figure != null:
        # The caption is intentionally a passive child inside the Button.
        # This proves the visible label cannot intercept the click or become a
        # dead-looking button of its own.
        caption_ok = (_find_caption_panel(figure) != null
            and figure.mouse_filter != Control.MOUSE_FILTER_IGNORE)
        figure.pressed.emit()
        await process_frame
    var dialog_ok: bool = bool(main._dialog_layer.visible)
    await _drain_to_city(main)

    main._close_city()
    await process_frame
    await process_frame
    var route: Button = null
    for child in main._panel.get_children():
        if child is Button and String(child.text).contains("→"):
            route = child
            break
    var fold: Rect2 = main._panel_wrap.get_global_rect()
    var route_visible: bool = route != null and route.get_global_rect().position.y < fold.end.y

    var back: Button = null
    for child in main._panel.get_children():
        if child is Button and (String(child.text).contains("返回城市")
                or String(child.text).contains("Back to City")):
            back = child
            break
    if back != null:
        back.pressed.emit()
        await process_frame
    var back_ok: bool = bool(main._city_view.visible)

    print("PLAYER_SURFACE: target=%s caption=%s dialog=%s route=%s visible=%s back=%s" % [
        target_ok, caption_ok, dialog_ok, route != null, route_visible, back_ok])
    var ok: bool = target_ok and caption_ok and dialog_ok and route_visible and back_ok
    print("PLAYER_SURFACE: %s" % ("OK" if ok else "FAIL"))
    quit(0 if ok else 1)


func _find_caption_panel(node: Node) -> PanelContainer:
    for child in node.get_children():
        if child is PanelContainer:
            return child
        var nested := _find_caption_panel(child)
        if nested != null:
            return nested
    return null


func _drain_to_city(main) -> void:
    for _step in 96:
        await process_frame
        if main._dialog_layer.visible:
            for child in main._dialog._choices.get_children():
                if child is Button and not child.disabled:
                    child.pressed.emit()
                    break
            continue
        if not main.state.active_event.is_empty() or not main.state.pending_events.is_empty():
            var resumed := false
            for child in _walk(main._panel):
                if child is Button and not child.disabled:
                    child.pressed.emit()
                    resumed = true
                    break
            if resumed:
                continue
        if main._city_view.visible:
            return
    printerr("PLAYER_SURFACE: narrative did not return to city")


func _walk(node: Node) -> Array:
    var out := [node]
    for child in node.get_children():
        out.append_array(_walk(child))
    return out
