class_name DivinationChallengeEngine
extends RefCounted

## Lesson-only simulation. No world mutation, clocks or global randomness.
## A round is generated from a named seed; retry and undo never reroll evidence.
const KINDS := ["cast", "parity", "rings", "route", "memory", "trace", "draft", "cycle", "numbers", "timing"]
var config: Dictionary = {}
var kind := ""
var state: Dictionary = {}
var round_index := 0
var mistakes := 0
var moves := 0
var assisted := false
var status := "active"
var history: Array[Dictionary] = []
var records: Array = []
var _rng: Rng

func configure(source: Dictionary, rng: Rng) -> bool:
	config = source.duplicate(true)
	kind = String(config.get("kind", ""))
	_rng = rng
	if kind not in KINDS or int(config.get("rounds", 0)) not in range(1, 9):
		status = "invalid"
		return false
	retry()
	return true

func retry() -> void:
	round_index = 0
	mistakes = 0
	moves = 0
	assisted = false
	status = "active"
	records.clear()
	_generate()

func _generate() -> void:
	history.clear()
	state = {}
	var rng := _rng.fork("challenge-round:%d" % round_index)
	match kind:
		"cast":
			var coins: Array = []
			var count := 2 if config.get("variant") == "blocks" else 3
			for i in count:
				coins.append(rng.next_int(2))
			var sum := 0
			for coin in coins:
				sum += int(coin)
			state = {"coins": coins, "answer": sum if count == 2 else sum + 6,
				"cast": false, "choice": -1}
		"parity":
			var left: Array = []
			var right: Array = []
			var target: Array = []
			for i in 4:
				left.append(rng.next_int(2) + 1)
				right.append(rng.next_int(2) + 1)
				target.append(2 if (int(left[i]) + int(right[i])) % 2 == 0 else 1)
			state = {"left": left, "right": right, "target": target, "cells": [0, 0, 0, 0]}
		"rings":
			var target: Array = [rng.next_int(12), rng.next_int(12), rng.next_int(12)]
			var rings: Array = target.duplicate()
			# Coupled controls: each ring also turns its neighbour. Scramble from
			# the target with legal moves, so every generated chart is solvable.
			var scramble: Array = []
			for i in 3:
				var steps := rng.next_int(3) + 1
				scramble.append(steps)
				rings[i] = (int(rings[i]) + steps) % 12
				rings[(i + 1) % 3] = (int(rings[(i + 1) % 3]) + steps) % 12
			state = {"target": target, "rings": rings, "scramble": scramble}
		"route":
			# Mirrored authored maps preserve reachability; checkpoints prevent
			# a trivial straight-line solution. Every step must be adjacent.
			var mirror := rng.next_int(2) == 1
			var path: Array = [20, 15, 10, 11, 12, 7, 2, 3, 4]
			var blocked: Array = [0, 6, 8, 13, 16, 18, 23]
			if config.get("variant") == "gates":
				path = [20, 21, 22, 17, 12, 11, 10, 5, 0]
				blocked = [3, 6, 8, 13, 15, 18, 23]
			if mirror:
				for i in path.size(): path[i] = _mirror(int(path[i]))
				for i in blocked.size(): blocked[i] = _mirror(int(blocked[i]))
			state = {"path": [path[0]], "solution": path, "blocked": blocked,
				"checkpoints": [path[3], path[5]], "goal": path.back(), "budget": path.size() + 2}
		"memory":
			var cards: Array = []
			for i in 4:
				cards.append(i)
				cards.append(i)
			state = {"cards": rng.shuffle(cards), "open": [], "matched": [], "preview": true}
		"trace":
			var patterns: Dictionary = {
				"palm": [6, 7, 8, 12, 16, 20], "face": [6, 8, 12, 16, 17, 18],
				"cup": [3, 7, 11, 16, 17, 23], "water": [2, 6, 8, 12, 16, 18]}
			var target: Array = patterns.get(config.get("variant", "cup"), patterns.cup).duplicate()
			var rotation := rng.next_int(4)
			for i in target.size():
				for turn in rotation:
					var cell := int(target[i])
					target[i] = (cell % 5) * 5 + 4 - cell / 5
			state = {"target": target, "selected": [], "preview": true, "rotation": rotation}
		"draft":
			var cards: Array = []
			var target: Array = [0, 0, 0, 0]
			for i in 7:
				var card: Array = [rng.next_int(4), rng.next_int(4)]
				cards.append(card)
				if i < 3:
					for symbol in card: target[int(symbol)] += 1
			state = {"cards": rng.shuffle(cards), "target": target, "selected": [], "limit": 3}
		"cycle":
			var target: Array = [rng.next_int(3), rng.next_int(3), rng.next_int(3), rng.next_int(3), rng.next_int(3)]
			var cells: Array = target.duplicate()
			var offset := 2 if config.get("variant") == "control" else 1
			var scramble: Array = []
			for i in 5:
				var steps := rng.next_int(2)
				scramble.append(steps)
				cells[i] = (int(cells[i]) + steps) % 3
				cells[(i + offset) % 5] = (int(cells[(i + offset) % 5]) + steps) % 3
			if cells == target:
				scramble[0] = 1
				cells[0] = (int(cells[0]) + 1) % 3
				cells[offset] = (int(cells[offset]) + 1) % 3
			state = {"cells": cells, "target": target, "offset": offset, "scramble": scramble}
		"numbers":
			var values: Array = []
			for i in 6: values.append(rng.next_int(8) + 1)
			var target := int(values[0]) + int(values[1]) + int(values[2])
			state = {"values": rng.shuffle(values), "target": target, "selected": [], "limit": 3}
			if config.get("variant") == "remainders":
				state["upper"] = target % 8 if target % 8 else 8
				state["moving"] = target % 6 if target % 6 else 6
		"timing":
			var center := 0.25 + rng.next() * 0.5
			state = {"low": center - 0.12 + round_index * 0.015,
				"high": center + 0.12 - round_index * 0.015, "phase": 0.0, "practice": false}

func _mirror(cell: int) -> int:
	return (cell / 5) * 5 + 4 - cell % 5

func act(action: String, index: int = 0) -> Dictionary:
	if status != "active": return _result("locked")
	if action == "undo":
		if not history.is_empty():
			var snapshot: Dictionary = history.pop_back()
			state = snapshot.state
			moves = snapshot.moves
		return _result("undo")
	if action == "hint":
		assisted = true
		if kind in ["memory", "trace"]: state.preview = true
		if kind == "timing": state.practice = true
		return _result("hint")
	var before := state.duplicate(true)
	var accepted := false
	match kind:
		"cast":
			if action == "cast" and not state.cast:
				state.cast = true
				accepted = true
			if action == "choose" and state.cast:
				var valid: Array = [0, 1, 2] if config.get("variant") == "blocks" else [6, 7, 8, 9]
				if index in valid:
					state.choice = index
					accepted = true
		"parity":
			if action == "cell" and index in range(4):
				state.cells[index] = 1 if int(state.cells[index]) != 1 else 2
				accepted = true
		"rings":
			if action in ["left", "right"] and index in range(3):
				var step := 1 if action == "right" else -1
				for ring in [index, (index + 1) % 3]:
					state.rings[ring] = posmod(int(state.rings[ring]) + step, 12)
				accepted = true
		"route":
			if action == "cell" and index in range(25):
				var last := int(state.path.back())
				var distance := absi(last / 5 - index / 5) + absi(last % 5 - index % 5)
				if distance == 1 and index not in state.blocked and index not in state.path:
					state.path.append(index)
					accepted = true
		"memory":
			if action == "hide":
				state.preview = false
				accepted = true
			if action == "cell" and not state.preview and index in range(8) \
					and index not in state.matched and index not in state.open:
				if state.open.size() == 2: state.open = []
				state.open.append(index)
				accepted = true
				if state.open.size() == 2:
					if state.cards[state.open[0]] == state.cards[state.open[1]]:
						state.matched.append_array(state.open)
						state.open = []
					else:
						moves += 1
						return _mistake("mismatch")
		"trace":
			if action == "hide":
				state.preview = false
				accepted = true
			if action == "cell" and not state.preview and index in range(25):
				_toggle(state.selected, index)
				accepted = true
		"draft", "numbers":
			var count: int = state.cards.size() if kind == "draft" else state.values.size()
			if action == "cell" and index in range(count):
				if index in state.selected or state.selected.size() < int(state.limit):
					_toggle(state.selected, index)
					accepted = true
		"cycle":
			if action == "cell" and index in range(5):
				for cell in [index, (index + int(state.offset)) % 5]:
					state.cells[cell] = (int(state.cells[cell]) + 1) % 3
				accepted = true
	if not accepted: return _result("illegal")
	# Observational memory actions cannot be undone to erase a mistake.
	if kind not in ["memory", "cast"] and action != "hide":
		history.append({"state": before, "moves": moves})
	moves += 1
	return _result("changed")

func _toggle(list: Array, index: int) -> void:
	if index in list: list.erase(index)
	else: list.append(index)

func tick(delta: float) -> void:
	if kind == "timing" and status == "active" and not state.practice:
		state.phase = fposmod(float(state.phase) + maxf(delta, 0.0) * (0.45 + round_index * 0.09), 2.0)

func needle() -> float:
	var phase := float(state.get("phase", 0.0))
	return phase if phase <= 1.0 else 2.0 - phase

func submit() -> Dictionary:
	if status != "active": return _result("locked")
	var solved := false
	match kind:
		"cast":
			if not state.cast or int(state.choice) < 0: return _result("incomplete")
			solved = state.choice == state.answer
		"parity", "cycle": solved = state.cells == state.target
		"rings": solved = state.rings == state.target
		"route":
			solved = state.path.back() == state.goal and state.path.size() <= int(state.budget)
			for point in state.checkpoints: solved = solved and point in state.path
		"memory": solved = state.matched.size() == state.cards.size()
		"trace":
			if state.preview: return _result("incomplete")
			solved = state.selected.size() == state.target.size()
			for cell in state.target: solved = solved and cell in state.selected
		"draft": solved = totals() == state.target and state.selected.size() == int(state.limit)
		"numbers":
			var total := 0
			for index in state.selected: total += int(state.values[index])
			solved = total == int(state.target) and state.selected.size() == int(state.limit)
		"timing": solved = state.practice or (needle() >= float(state.low) and needle() <= float(state.high))
	if not solved: return _mistake("wrong")
	records.append(state.duplicate(true))
	round_index += 1
	if round_index >= int(config.rounds):
		status = "passed"
		return _result("complete")
	_generate()
	return _result("round")

func totals() -> Array:
	var result: Array = [0, 0, 0, 0]
	for index in state.get("selected", []):
		for symbol in state.cards[index]: result[int(symbol)] += 1
	return result

func _mistake(code: String) -> Dictionary:
	mistakes += 1
	if mistakes >= int(config.get("lives", 3)): status = "failed"
	return _result(code)

func stars() -> int:
	if status != "passed": return 0
	if assisted: return 1
	return 3 if mistakes == 0 else 2

func _result(code: String) -> Dictionary:
	return {"status": status, "code": code, "round": round_index, "mistakes": mistakes}

## A hint names one legal move. It never mutates the board or grants success.
func suggestion() -> Dictionary:
	match kind:
		"cast":
			if state.cast and int(state.choice) == int(state.answer): return {"action": "submit"}
			return {"action": "choose", "index": int(state.answer)} if state.cast else {"action": "cast"}
		"parity":
			for i in 4:
				if state.cells[i] != state.target[i]: return {"action": "cell", "index": i}
		"rings", "cycle":
			var n := 3 if kind == "rings" else 5
			var modulus := 12 if kind == "rings" else 3
			var cells: Array = state.rings if kind == "rings" else state.cells
			var offset := 1 if kind == "rings" else int(state.offset)
			if cells == state.target: return {"action": "submit"}
			for combination in int(pow(modulus, n)):
				var digits: Array = []
				var code := combination
				for i in n:
					digits.append(code % modulus)
					code /= modulus
				var valid := true
				for i in n:
					if posmod(int(cells[i]) + int(digits[i]) + int(digits[posmod(i - offset, n)]), modulus) != int(state.target[i]):
						valid = false
						break
				if valid:
					for i in n:
						if int(digits[i]) > 0:
							return {"action": "right" if kind == "rings" else "cell", "index": i}
		"route":
			var path: Array = state.path
			var solution: Array = state.solution
			for i in path.size():
				if i >= solution.size() or path[i] != solution[i]: return {"action": "undo"}
			if path.size() < solution.size(): return {"action": "cell", "index": int(solution[path.size()])}
		"memory":
			if state.preview: return {"action": "hide"}
			var opened: Array = state.open
			if opened.size() == 1:
				for i in 8:
					if i != int(opened[0]) and state.cards[i] == state.cards[opened[0]]:
						return {"action": "cell", "index": i}
			for i in 8:
				if i not in state.matched and i not in opened: return {"action": "cell", "index": i}
		"trace":
			if state.preview: return {"action": "hide"}
			for cell in state.selected:
				if cell not in state.target: return {"action": "cell", "index": cell}
			for cell in state.target:
				if cell not in state.selected: return {"action": "cell", "index": cell}
		"draft", "numbers":
			var count: int = state.cards.size() if kind == "draft" else state.values.size()
			for a in count:
				for b in range(a + 1, count):
					for c in range(b + 1, count):
						var choice: Array = [a, b, c]
						var valid := false
						if kind == "numbers":
							valid = int(state.values[a]) + int(state.values[b]) + int(state.values[c]) == int(state.target)
						else:
							var sums: Array = [0, 0, 0, 0]
							for i in choice:
								for symbol in state.cards[i]: sums[int(symbol)] += 1
							valid = sums == state.target
						if valid:
							for i in state.selected:
								if i not in choice: return {"action": "cell", "index": i}
							for i in choice:
								if i not in state.selected: return {"action": "cell", "index": i}
							return {"action": "submit"}
	return {"action": "submit"}
