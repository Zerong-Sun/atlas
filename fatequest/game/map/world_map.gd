extends Node2D

## P0 map: dots and names. No parchment, no fog, no east-up — those land in P1
## (docs/ROADMAP.md §3). The point of P0 is that the game OPENS and the 102
## nodes appear where preview_static.png says they should.

const TIER_STYLE := {
	"metropolis": {"r": 7.0, "c": Color("e8c46a")},
	"city":       {"r": 5.0, "c": Color("c98f4b")},
	"town":       {"r": 3.5, "c": Color("9c6b3f")},
	"station":    {"r": 2.5, "c": Color("6f5136")},
}

var projection: MapProjection
var cities: Array = []
var routes: Array = []
var _labels_visible := true
var _hover: Dictionary = {}

signal city_clicked(city: Dictionary)


func setup(p: MapProjection, city_records: Array, route_records: Array = []) -> void:
	projection = p
	cities = city_records
	routes = route_records
	_city_pos.clear()
	for c in cities:
		var co: Array = c.get("coord", [0, 0])
		_city_pos[c.get("id", "")] = p.to_view(float(co[0]), float(co[1]))
	queue_redraw()


var _city_pos: Dictionary = {}


func _draw() -> void:
	if projection == null:
		return
	draw_rect(Rect2(projection.origin, Vector2(projection.width, projection.height)), Color("d9c9a3"))

	# Routes first, so city dots sit on top of the lines.
	for r in routes:
		var a: Vector2 = _city_pos.get(r.get("from", ""), Vector2.ZERO)
		var b: Vector2 = _city_pos.get(r.get("to", ""), Vector2.ZERO)
		if a == Vector2.ZERO or b == Vector2.ZERO:
			continue
		var kind := String(r.get("kind", "land"))
		var is_trunk: bool = r.get("trunk", false)
		var col := Color("2f6f8f", 0.75) if kind == "sea" else \
			(Color("4f7f6f", 0.6) if kind == "coastal" else Color("7a5a34", 0.45))
		draw_line(a, b, col, 3.0 if is_trunk else 1.0)

	for c in cities:
		var coord: Array = c.get("coord", [0, 0])
		var pos := projection.to_view(float(coord[0]), float(coord[1]))
		var style: Dictionary = TIER_STYLE.get(c.get("tier", "station"), TIER_STYLE["station"])
		draw_circle(pos, style["r"], style["c"])
		draw_arc(pos, style["r"], 0, TAU, 16, Color(0.25, 0.18, 0.11, 0.8), 1.0)

		# Only label the big places at P0, or the map is unreadable at 102 nodes.
		if _labels_visible and c.get("tier") in ["metropolis", "city"]:
			var label := I18n.t(c.get("name", ""))
			var font := ThemeDB.fallback_font
			draw_string(font, pos + Vector2(style["r"] + 3, 4), label,
				HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.2, 0.14, 0.08))


func _gui_input(_e: InputEvent) -> void:
	pass


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var local := to_local(event.position)
		var best: Dictionary = {}
		var best_d := 12.0
		for c in cities:
			var coord: Array = c.get("coord", [0, 0])
			var d := projection.to_view(float(coord[0]), float(coord[1])).distance_to(local)
			if d < best_d:
				best_d = d
				best = c
		if not best.is_empty():
			city_clicked.emit(best)


func toggle_labels() -> void:
	_labels_visible = not _labels_visible
	queue_redraw()
