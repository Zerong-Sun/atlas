extends SceneTree

## Desk bookshelf: each of the seven covers opens the book reader with title text.
const _WATCHDOG_SEC := 60.0
var _t := 0.0


func _process(_delta: float) -> bool:
	_t += _delta
	if _t > _WATCHDOG_SEC:
		printerr("WATCHDOG: book reader smoke exceeded %d s" % int(_WATCHDOG_SEC))
		quit(1)
	return false


func _init() -> void:
	var n = load("res://game/screens/main.tscn").instantiate()
	root.add_child(n)
	await process_frame

	var books: Array = n.db.get_table("books")
	var ok_table: bool = books.size() >= 7
	var opened := 0
	var titled := 0
	for bid in MapArt.BOOKS:
		n._open_book(String(bid))
		await process_frame
		if n._book_layer != null and n._book_layer.visible and n._book_view != null:
			opened += 1
			var title_key := "book.%s.title" % bid
			var title := I18n.t(title_key)
			if title != title_key and not title.is_empty():
				titled += 1
		n._book_layer.visible = false
		await process_frame

	# Pinto is desk-only extra in the table; open by id without a cover button.
	n._open_book("pinto")
	await process_frame
	var pinto_ok: bool = n._book_layer.visible
	n._book_layer.visible = false

	# Cover id and vol- id both resolve.
	n._open_book("vol-zhenghe")
	await process_frame
	var zheng_ok: bool = n._book_layer.visible
	n._book_layer.visible = false

	var ok: bool = ok_table and opened == MapArt.BOOKS.size() and titled == MapArt.BOOKS.size() and pinto_ok and zheng_ok
	print("BOOK_READER: table=%s opened=%d/%d titled=%d pinto=%s zhenghe=%s" % [
		ok_table, opened, MapArt.BOOKS.size(), titled, pinto_ok, zheng_ok])
	print("BOOK_READER: %s" % ("OK" if ok else "FAIL"))
	quit(0 if ok else 1)
