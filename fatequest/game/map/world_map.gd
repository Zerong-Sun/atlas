extends Node2D

## P1 map: dots, routes and fog. Parchment art and east-up land in P2.
##
## The fog is NOT decoration and NOT a render cache: `revealed` lives in
## WorldState and is written only through reveal_map effects, because GDD P2
## makes "the map comes from asking" a rule of the world, not a view option.
## An unrevealed city is drawn as a rumour, never as its name.

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
var current_city: String = ""
var revealed: Dictionary = {}

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


func set_current(city_id: String, p_revealed: Dictionary) -> void:
	current_city = city_id
	revealed = p_revealed
	queue_redraw()


## 0 unknown · 1 heard of · 2 described · 3 fully known.
## Where you stand is always fully known — you are looking at it.
func intel(id: String) -> int:
	if id == current_city:
		return 3
	return int(revealed.get(id, 0))


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
		# A road you have not heard of is not drawn at all. This is the whole
		# of P2: the world does not unfold in advance.
		var seen := maxi(intel(String(r.get("id", ""))), mini(intel(String(r.get("from", ""))), intel(String(r.get("to", "")))))
		if seen <= 0:
			continue
		var kind := String(r.get("kind", "land"))
		var is_trunk: bool = r.get("trunk", false)
		var alpha := 0.25 + 0.25 * float(seen)
		var col := Color("2f6f8f", alpha) if kind == "sea" else \
			(Color("4f7f6f", alpha) if kind == "coastal" else Color("7a5a34", alpha * 0.8))
		draw_line(a, b, col, 3.0 if is_trunk else 1.0)

	for c in cities:
		var coord: Array = c.get("coord", [0, 0])
		var pos := projection.to_view(float(coord[0]), float(coord[1]))
		var style: Dictionary = TIER_STYLE.get(c.get("tier", "station"), TIER_STYLE["station"])
		var cid := String(c.get("id", ""))
		var k := intel(cid)

		if k <= 0:
			# Unknown: a faint blot of old ink, no name, no size information.
			draw_circle(pos, 2.0, Color(0.42, 0.36, 0.28, 0.35))
			continue

		var col: Color = style["c"]
		col.a = 0.45 + 0.18 * float(k)
		draw_circle(pos, style["r"], col)
		draw_arc(pos, style["r"], 0, TAU, 16, Color(0.25, 0.18, 0.11, 0.8), 1.0)
		if cid == current_city:
			draw_arc(pos, style["r"] + 4.0, 0, TAU, 24, Color("b04a2a"), 2.0)

		# Name it only once you know more than its existence.
		if _labels_visible and k >= 2:
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
