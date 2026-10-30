extends RefCounted

const Challenge = preload("res://core/divination/challenge_engine.gd")
var _ok := true
var _checks := 0

func _check(condition: bool, message: String) -> void:
	_checks += 1
	if not condition:
		_ok = false
		printerr("CHALLENGE: " + message)

func run() -> bool:
	var db := ContentDb.new()
	_check(db.load_all(), "database loads")
	var coverage: Dictionary = {}
	for lesson in db.get_table("divination_lessons"):
		_check(lesson.has("challenge"), "live lesson has challenge: " + lesson.method)
		if not lesson.has("challenge"): continue
		coverage[lesson.challenge.kind] = true
		for seed_index in 8:
			var game = Challenge.new()
			var rng := Rng.new("challenge-test:%s:%d" % [lesson.method, seed_index])
			_check(game.configure(lesson.challenge, rng), "configuration: " + lesson.method)
			var initial: Dictionary = game.state.duplicate(true)
			var twin = Challenge.new()
			twin.configure(lesson.challenge, rng)
			_check(game.state == twin.state, "deterministic generation: " + lesson.method)
			_check(game.act("bad-operation", -1).code == "illegal" and game.state == initial, "invalid action is inert")
			# Exercise actual transitions to completion for every method and seed.
			var steps := 0
			while game.status == "active" and steps < 180:
				steps += 1
				if game.kind == "timing":
					# Time advances through the public simulation API.
					var elapsed := 0.0
					while game.needle() < float(game.state.low) + 0.02 and elapsed < 5.0:
						game.tick(0.01)
						elapsed += 0.01
					game.submit()
					continue
				var move: Dictionary = game.suggestion()
				if move.action == "submit": game.submit()
				else: game.act(move.action, int(move.get("index", 0)))
			_check(game.status == "passed" and game.mistakes == 0, "solvable through legal actions: %s/%d" % [lesson.method, seed_index])
			_check(game.stars() == 3, "flawless completion earns three stars")
			var final: Dictionary = game.state.duplicate(true)
			_check(game.submit().code == "locked" and game.act("cell", 0).code == "locked" and game.state == final, "no action after completion")
			game.retry()
			_check(game.state == initial and game.round_index == 0 and game.records.is_empty(), "retry restores original puzzle")
			_check(game.mistakes == 0 and game.moves == 0 and not game.assisted, "retry resets attempt counters")
	for kind in Challenge.KINDS: _check(coverage.has(kind), "all mechanics represented: " + kind)
	_test_rules()
	print("test_divination_challenges: %s (%d checks)" % ["PASS" if _ok else "FAIL", _checks])
	return _ok

func _game(kind: String, variant: String = "") -> RefCounted:
	var game = Challenge.new()
	game.configure({"kind": kind, "variant": variant, "rounds": 1, "lives": 3}, Rng.new("rules"))
	return game

func _test_rules() -> void:
	var coins = _game("cast", "coins")
	_check(coins.submit().code == "incomplete" and coins.mistakes == 0, "must cast before recording")
	coins.act("cast")
	var sum := 6
	for coin in coins.state.coins: sum += int(coin)
	_check(sum == int(coins.state.answer), "three actual coins determine line value")
	coins.act("choose", 6 if sum != 6 else 7)
	_check(coins.submit().status == "active" and coins.mistakes == 1, "wrong cast answer consumes a mistake")
	coins.act("choose", sum)
	_check(coins.submit().status == "passed", "answer follows this cast, not fixed option zero")
	var parity = _game("parity")
	for i in 4:
		var correct := 2 if (int(parity.state.left[i]) + int(parity.state.right[i])) % 2 == 0 else 1
		parity.act("cell", i)
		if correct == 2: parity.act("cell", i)
	_check(parity.submit().status == "passed", "odd/even point combination")
	var rings = _game("rings")
	var original: Dictionary = rings.state.duplicate(true)
	rings.act("right", 0)
	_check(int(rings.state.rings[0]) == (int(original.rings[0]) + 1) % 12 and int(rings.state.rings[1]) == (int(original.rings[1]) + 1) % 12 and rings.state.rings[2] == original.rings[2], "one ring moves exactly its neighbour")
	rings.act("undo")
	_check(rings.state == original and rings.moves == 0, "undo restores exact board and counter")
	var cycle = _game("cycle", "control")
	original = cycle.state.duplicate(true)
	cycle.act("cell", 0)
	_check(cycle.state.cells[1] == original.cells[1] and cycle.state.cells[2] == (int(original.cells[2]) + 1) % 3, "control cycle uses alternate phase")
	var route = _game("route", "land")
	original = route.state.duplicate(true)
	_check(route.act("cell", int(route.state.goal)).code == "illegal" and route.state == original, "cannot teleport to exit")
	var trace = _game("trace", "cup")
	_check(trace.act("cell", 0).code == "illegal", "cannot copy while reference visible")
	trace.act("hide")
	trace.act("cell", 0)
	trace.act("hint")
	_check(trace.assisted and trace.state.preview and trace.status == "active", "hint reveals reference without granting success")
	var numbers = _game("numbers")
	for i in 3: numbers.act("cell", i)
	_check(numbers.act("cell", 3).code == "illegal" and numbers.state.selected.size() == 3, "finite three-stone hand")
	var timing = _game("timing")
	for i in 3: timing.submit()
	_check(timing.status == "failed" and timing.stars() == 0, "three misses end attempt without teaching")
	timing.retry()
	timing.act("hint")
	_check(timing.status == "active" and timing.state.practice, "timing accessibility requires player confirmation")
	timing.submit()
	_check(timing.stars() == 1, "assisted completion is identified")
	var memory = _game("memory")
	memory.act("hide")
	var first := int(memory.state.cards[0])
	var different := 1
	while int(memory.state.cards[different]) == first: different += 1
	memory.act("cell", 0)
	memory.act("cell", different)
	_check(memory.mistakes == 1 and memory.state.open.size() == 2, "mismatched symbols remain visible for learning")
	memory.act("undo")
	_check(memory.mistakes == 1, "undo cannot erase a mismatch penalty")
