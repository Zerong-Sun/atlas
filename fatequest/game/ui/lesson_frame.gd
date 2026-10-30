extends Control

const Art = preload("res://game/ui/lesson_art.gd")
var scene: Texture2D
var region := "china"

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	resized.connect(queue_redraw)

func _draw() -> void:
	var frame := Art.texture("frame")
	if frame != null:
		# Nine-slice the generated ornament so the painted corners stay outside
		# readable content instead of growing over headings on wide panels.
		var bounds := Rect2(Vector2(-24, -20), size + Vector2(48, 40))
		var source := frame.get_size()
		var sx := [0.0, source.x * 0.23, source.x * 0.77, source.x]
		var sy := [0.0, source.y * 0.32, source.y * 0.68, source.y]
		var dx := [bounds.position.x, bounds.position.x + 32, bounds.end.x - 32, bounds.end.x]
		var dy := [bounds.position.y, bounds.position.y + 32, bounds.end.y - 32, bounds.end.y]
		var tint := Color.WHITE
		for y in 3:
			for x in 3:
				draw_texture_rect_region(frame, Rect2(dx[x], dy[y], dx[x + 1] - dx[x], dy[y + 1] - dy[y]), Rect2(sx[x], sy[y], sx[x + 1] - sx[x], sy[y + 1] - sy[y]), tint)
	if scene != null and not UiScale.high_contrast:
		draw_texture_rect(scene, Rect2(Vector2.ZERO, size), false, Color(1, 1, 1, 0.13))
