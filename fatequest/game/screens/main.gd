extends Control

## P0 shell: desk -> map. Deliberately ugly. Art arrives in P1/P2
## (docs/ART_REQUIREMENTS.md).

const MARGIN := 48.0

var db := ContentDb.new()
var projection: MapProjection
var _map: Node2D
var _info: Label
var _desk: Control


func _ready() -> void:
	I18n.load_lang("zh")
	var n := db.load_all()
	DivinationBootstrap.register_all()

	projection = MapProjection.from_config()
	# Inset the drawable area. Zayton and Kinsay sit at ~120E, within a degree
	# of the bbox edge, so a flush-to-edge projection clips the corridor's
	# terminus and its labels straight off the screen.
	projection.set_viewport(size.x - MARGIN * 2.0, size.y - 80.0 - MARGIN * 2.0)
	projection.origin = Vector2(MARGIN, MARGIN)

	print("[boot] content records: %d | cities: %d | divination methods: %s"
		% [n, db.cities().size(), str(DivinationRegistry.ids())])
	print("[boot] missing i18n keys: %d" % I18n.missing_keys().size())

	_build_desk()


func _build_desk() -> void:
	_desk = VBoxContainer.new()
	_desk.set_anchors_preset(Control.PRESET_CENTER)
	_desk.position = size * 0.5 - Vector2(160, 80)
	add_child(_desk)

	var title := Label.new()
	title.text = "远行之书\nThe Book of Far Roads"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_desk.add_child(title)

	var sub := Label.new()
	sub.text = "\n%d 座城 · %d 条路线 · %d 条事件 · %d 种占法\n" % [
		db.cities().size(), db.get_table("routes").size(), db.get_table("events").size(), DivinationRegistry.ids().size()]
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_desk.add_child(sub)

	var btn := Button.new()
	btn.text = "开始远行  ·  Set out"
	btn.pressed.connect(_enter_map)
	_desk.add_child(btn)


func _enter_map() -> void:
	_desk.queue_free()

	_map = preload("res://game/map/world_map.gd").new()
	add_child(_map)
	_map.setup(projection, db.cities(), db.get_table("routes"))
	_map.city_clicked.connect(_on_city)

	_info = Label.new()
	_info.position = Vector2(12, size.y - 64)
	_info.text = "点击城市查看 · click a city"
	add_child(_info)


func _on_city(c: Dictionary) -> void:
	_info.text = "%s  [%s]  %s  coord %s\nlore: %s" % [
		I18n.t(c.get("name", "")), c.get("tier", "?"), c.get("band", "?"),
		str(c.get("coord", [])),
		str(c.get("lore", {}).get("placeId", "—")),
	]
