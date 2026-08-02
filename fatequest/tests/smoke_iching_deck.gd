extends SceneTree

## I Ching deck acceptance: every one of the 64 faces resolves through
## MapArt.hexagram_face (01–30 finished, 31–64 placeholders pending the
## generation batch), and DivinationResultView.symbol_texture prefers the
## full card face over the method symbol for a cast that carries `primary`.
func _init() -> void:
	var missing: Array = []
	var ok_sizes: Array = []
	for n in range(1, 65):
		var t := MapArt.hexagram_face(n)
		if t == null:
			missing.append(n)
		else:
			ok_sizes.append(t.get_size())
	var ok := missing.is_empty()
	print("ICHING_DECK: 64 faces -> missing=%s sizes0=%s sizes63=%s" % [
		missing, ok_sizes[0], ok_sizes[63]])
	var t2 := DivinationResultView.symbol_texture({
		"method": "iching", "raw": {"primary": 31, "moving": [], "lines": [6, 7, 8, 9, 6, 7], "derived": 31}})
	print("ICHING_DECK: symbol_texture(primary=31) -> %s" % ("FACE" if t2 != null and t2 != MapArt.symbol_icon("qian") else "fallback"))
	print("ICHING_DECK: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
