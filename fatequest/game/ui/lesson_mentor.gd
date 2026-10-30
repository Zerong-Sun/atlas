extends VBoxContainer

signal spoken(text: String, mood: String)
const Art = preload("res://game/ui/lesson_art.gd")
var mentor_id := "zhou"
var portrait: TextureRect
var mood: Label
var _tween: Tween
var _chat_count := 0
var _last_mood := ""
var _phase := 0.0

func setup(config: Dictionary) -> void:
	mentor_id = Art.teacher(config)
	custom_minimum_size.x = 200
	add_theme_constant_override("separation", 4)
	var stage := Control.new()
	stage.custom_minimum_size = Vector2(200, 170)
	stage.name = "PortraitStage"
	add_child(stage)
	var backdrop := TextureRect.new()
	backdrop.texture = Art.scene(config)
	backdrop.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	backdrop.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	backdrop.modulate = Color(1, 1, 1, 0.4)
	backdrop.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stage.add_child(backdrop)
	backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	portrait = TextureRect.new()
	portrait.texture = Art.portrait(mentor_id)
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stage.add_child(portrait)
	portrait.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var hit := Button.new()
	hit.flat = true
	hit.tooltip_text = line("name") + " · " + I18n.t("lesson.stage.talk")
	hit.pressed.connect(talk)
	stage.add_child(hit)
	hit.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var name_label := Panels.label(line("name"), 19, Palette.ink())
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(name_label)
	var trait_label := Panels.label(line("trait"), 12, Palette.ink_soft())
	trait_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	trait_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(trait_label)
	mood = Panels.label("", 12, Palette.ink_soft())
	mood.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(mood)
	var buttons := HFlowContainer.new()
	add_child(buttons)
	for kind in ["talk", "inspect"]:
		var button := Panels.styled_button(I18n.t("lesson.stage.%s" % kind), talk if kind == "talk" else inspect)
		button.custom_minimum_size = Vector2(96, 44)
		button.add_theme_font_size_override("font_size", 13)
		buttons.add_child(button)
	react("intro")
	get_viewport().size_changed.connect(_fit_width)
	_fit_width()


func _fit_width() -> void:
	var width := 150.0 if get_viewport_rect().size.x < 1100 else 200.0
	custom_minimum_size.x = width
	get_node("PortraitStage").custom_minimum_size.x = width

func line(key: String) -> String:
	return I18n.t("lesson.mentor.%s.%s" % [mentor_id, key])

func talk() -> void:
	_chat_count += 1
	react("chat" if _chat_count % 2 == 1 else "intro", true)

func inspect() -> void:
	react("inspect", true)

func respond(code: String, action: String, mistakes: int, moves: int, status: String) -> void:
	if status == "failed": react("support")
	elif code == "complete": react("win")
	elif action == "retry": react("retry")
	elif action == "hint": react("hint")
	elif code in ["wrong", "mismatch", "illegal", "incomplete"]:
		react("support" if mistakes >= 2 else "tease")
	elif code == "round": react("round")
	elif moves > 0 and moves % 4 == 0: react("action")

func react(kind: String, force: bool = false) -> void:
	# Repeated failed submissions never repeatedly fire the same taunt.
	if kind == _last_mood and not force: return
	_last_mood = kind
	mood.text = I18n.t("lesson.stage.mood_%s" % kind)
	spoken.emit(line(kind), kind)
	if _tween != null and _tween.is_valid(): _tween.kill()
	portrait.rotation = 0
	portrait.scale = Vector2.ONE
	portrait.pivot_offset = portrait.size * Vector2(0.5, 0.8)
	if Motion.reduce_motion: return
	_tween = create_tween()
	if kind == "tease":
		_tween.tween_property(portrait, "rotation", -0.035, 0.15)
		_tween.tween_property(portrait, "rotation", 0.025, 0.18)
		_tween.tween_property(portrait, "rotation", 0.0, 0.18)
	else:
		_tween.tween_property(portrait, "scale", Vector2(1.025, 0.98), 0.18)
		_tween.tween_property(portrait, "scale", Vector2.ONE, 0.25)

func _process(delta: float) -> void:
	if portrait == null or not is_visible_in_tree(): return
	_phase += delta
	portrait.position.y = 0.0 if Motion.reduce_motion else sin(_phase * 1.3) * 1.3
