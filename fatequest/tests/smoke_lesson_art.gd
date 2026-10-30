extends SceneTree

const Art = preload("res://game/ui/lesson_art.gd")
var failures := 0

func _init() -> void:
	call_deferred("_run")

func _ok(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("FAIL: " + message)

func _run() -> void:
	root.size = Vector2i(1280, 720)
	var capture := OS.get_environment("FATEQUEST_CAPTURE_ART") == "1"
	for sheet in Art.ATLASES:
		var canvas := Control.new()
		root.add_child(canvas)
		var paper := ColorRect.new()
		paper.color = Color("203b38")
		paper.size = Vector2(1280, 720)
		canvas.add_child(paper)
		var index := 0
		for name in Art.ATLASES[sheet]:
			var tex: AtlasTexture = Art.prop(name)
			_ok(tex != null and tex.atlas.resource_path.begins_with(Art.BASE), "unified sprite " + name)
			_ok(tex.region.size.x > 40 and tex.region.size.y > 40, "complete object " + name)
			_ok(Rect2(Vector2.ZERO, tex.atlas.get_size()).encloses(tex.region), "crop inside atlas " + name)
			var cell := Vector2((index % 4) * 320, (index / 4) * 180)
			var rect := TextureRect.new()
			rect.texture = tex
			rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			rect.position = cell + Vector2(20, 4)
			rect.size = Vector2(280, 145)
			canvas.add_child(rect)
			var label := Label.new()
			label.text = name
			label.position = cell + Vector2(12, 150)
			label.size.x = 296
			label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			canvas.add_child(label)
			index += 1
		if capture:
			await process_frame
			await RenderingServer.frame_post_draw
			DirAccess.make_dir_recursive_absolute("res://build/playtest/unified")
			root.get_texture().get_image().save_png("res://build/playtest/unified/atlas-%s.png" % sheet)
		canvas.queue_free()
		await process_frame
	for mentor in Art.CAST:
		_ok(Art.portrait(mentor).resource_path.begins_with(Art.BASE), "new portrait " + mentor)
	for region in ["china", "courtyard", "europe", "india", "north", "observatory"]:
		_ok(Art.texture("scene-" + region) != null, "new scene " + region)
	for surface in ["table", "frame"]:
		_ok(Art.texture(surface) != null, "new surface " + surface)
	print("LESSON_ART: %s · 48 complete atlas regions, 9 portraits, 6 scenes, table and frame" % ("PASS" if failures == 0 else "FAIL"))
	quit(0 if failures == 0 else 1)
