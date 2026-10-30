extends RefCounted

var failures := 0


func run() -> bool:
	var db := ContentDb.new()
	db.load_all()
	var machine := EventMachine.new(db, ConditionEvaluator.new(db), EffectExecutor.new())
	var rng := Rng.new("event-tradeoffs")

	var trader := WorldState.new()
	trader.city = "tauris"
	var market_event := db.get_record("ev-tauris-entry")
	var bargain_index := -1
	var bargain_price := 0
	var market_choices: Array = market_event.get("choices", [])
	for i in market_choices.size():
		var has_steel := false
		var price := 0
		for effect in market_choices[i].get("effects", []):
			if String(effect.get("op", "")) == "goods" \
					and String(effect.get("id", "")) == "damascus-steel":
				has_steel = true
			if String(effect.get("op", "")) == "coins" \
					and int(effect.get("value", 0)) < 0:
				price = -int(effect["value"])
		if has_steel:
			bargain_index = i
			bargain_price = price
			break
	_check(bargain_index >= 0 and bargain_price > 0,
		"Tauris steel bargain retains a real price")
	if bargain_index >= 0 and bargain_price > 0:
		trader.coins = bargain_price
		_check(bool(machine.choice_states(market_event, trader)[bargain_index].enabled),
			"a funded market bargain is available")
		trader.coins = bargain_price - 1
		_check(not bool(machine.choice_states(market_event, trader)[bargain_index].enabled),
			"a bargain is disabled below its full cost")
		trader.coins = bargain_price
		var trade_result := machine.choose(market_event, bargain_index, trader, rng)
		_check(trade_result.resolved and trader.coins == 0
			and int(trader.goods.get("damascus-steel", 0)) == 1,
			"the bargain pays before granting the good")

	var traveler := WorldState.new()
	traveler.city = "axuma"
	traveler.life["vitality"] = 62
	var rest_result := machine.choose(db.get_record("ev-axuma-entry"), 1, traveler, rng)
	_check(rest_result.resolved and int(traveler.life.vitality) == 72
		and traveler.days_elapsed == 1,
		"a day of rest restores vitality")

	var observer := WorldState.new()
	observer.city = "accon"
	var look_result := machine.choose(db.get_record("ev-accon-entry"), 1, observer, rng)
	var travel := Travel.new(db, EffectExecutor.new(), ConditionEvaluator.new(db))
	_check(look_result.resolved and int(observer.revealed.get("hierusalem", 0)) == 1
		and int(observer.revealed.get("rt-accon-hierusalem", 0)) == 1
		and travel.is_route_known(db.get_record("rt-accon-hierusalem"), observer)
		and observer.days_elapsed == 1,
		"asking around reveals an onward city")

	var road_event := db.get_record("ev-road-00")
	var paid_choice: Dictionary = (road_event.get("choices", []) as Array)[1]
	var fare := 0
	for effect in paid_choice.get("effects", []):
		if String(effect.get("op", "")) == "coins" and int(effect.get("value", 0)) < 0:
			fare = -int(effect.get("value", 0))
	_check(fare > 0, "the road detour still has a real fare")
	var penniless := WorldState.new()
	penniless.coins = fare - 1
	_check(not bool(machine.choice_states(road_event, penniless)[1].enabled),
		"a paid road detour is unavailable without the fare")
	penniless.coins = fare
	_check(bool(machine.choice_states(road_event, penniless)[1].enabled),
		"a paid road detour becomes available at the exact fare")

	var silk_event := db.get_record("ev-unique-cacanfu")
	var silk_buyer := WorldState.new()
	silk_buyer.city = "cacanfu"
	silk_buyer.coins = 8999
	_check(not bool(machine.choice_states(silk_event, silk_buyer)[1].enabled),
		"a city silk purchase is gated below its full price")
	silk_buyer.coins = 9000
	var silk_result := machine.choose(silk_event, 1, silk_buyer, rng)
	_check(silk_result.resolved and silk_buyer.coins == 0
		and int(silk_buyer.goods.get("silk", 0)) == 1,
		"the silk site grants its good only after charging the stated price")

	var salt_worker := WorldState.new()
	salt_worker.city = "tiju"
	salt_worker.life["vitality"] = 50
	var salt_result := machine.choose(db.get_record("ev-unique-tiju"), 0, salt_worker, rng)
	_check(salt_result.resolved and salt_worker.coins == 190
		and int(salt_worker.life.vitality) == 45 and salt_worker.days_elapsed == 1,
		"salt hauling pays modestly and costs a day and vitality")

	print("EVENT_TRADEOFFS: %d failure(s)" % failures)
	return failures == 0


func _check(ok: bool, message: String) -> void:
	if not ok:
		failures += 1
		push_error("EVENT_TRADEOFFS: " + message)
