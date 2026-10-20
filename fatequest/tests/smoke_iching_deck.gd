extends SceneTree

const ICHING_ORDER = preload("res://core/divination/iching_order.gd")

## I Ching deck acceptance: every one of the 64 faces resolves through
## MapArt.hexagram_face (01–30 finished, 31–64 placeholders pending the
## generation batch), and DivinationResultView.symbol_texture prefers the
## full card face over the method symbol for a cast that carries `primary`.
## The cast primary is a bottom-up six-line bit mask; this smoke also verifies
## its conversion to King Wen card numbers.
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
	var semantic_ok := true
	var seen := {}
	for mask in range(64):
		var number := ICHING_ORDER.king_wen_number(mask)
		semantic_ok = semantic_ok and number >= 1 and number <= 64 and not seen.has(number)
		seen[number] = true
		var resolved := DivinationResultView.symbol_texture({
			"method": "iching", "raw": {"primary": mask, "moving": [], "derived": mask}})
		semantic_ok = semantic_ok and resolved == MapArt.hexagram_face(number)
	var all_yin := ICHING_ORDER.king_wen_number(0)
	var all_yang := ICHING_ORDER.king_wen_number(63)
	semantic_ok = semantic_ok and all_yin == 2 and all_yang == 1
	print("ICHING_DECK: masks=64 unique=%s all_yin=KW%d all_yang=KW%d" % [
		"yes" if seen.size() == 64 else "no", all_yin, all_yang])
	print("ICHING_DECK: %s" % ("OK" if ok and semantic_ok else "FAIL"))
	quit(0 if ok and semantic_ok else 1)
