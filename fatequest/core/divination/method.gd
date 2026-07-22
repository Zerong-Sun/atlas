class_name DivinationMethod
extends RefCounted

## Contract every divination method implements. See docs/ROADMAP.md §5.1.
##
## Adding a method = one new file + one register() call + one divinations.json
## record. Neither the kernel nor the UI changes. There is deliberately NO
## match/if-else over method ids anywhere in core/ — that pattern is what caps
## the number of methods, and the design brief says the count is uncapped.

func id() -> String:
	push_error("DivinationMethod.id() not overridden")
	return ""

## What the caster must supply: birthdate|date|question|object|dream|sky
func inputs() -> Array:
	return []

## What it can be read against: self|retainer|route|city|year
func reads() -> Array:
	return []

## Raw engine output (hexagram, four pillars, card spread...). Presentation-free.
func cast(ctx: DivinationContext) -> Dictionary:
	push_error("DivinationMethod.cast() not overridden")
	return {}

## Raw output -> game effects. MUST be non-empty: a method that changes nothing
## is decoration, which GDD §8.2 forbids and gate G3 rejects. This is where
## ATLAS_PORT.md §3's uncertaintyMode -> question mapping actually lands.
func to_effects(_raw: Dictionary, _ctx: DivinationContext) -> Array:
	push_error("DivinationMethod.to_effects() not overridden")
	return []

## Text keys for the reading. Never literal prose — content lives in i18n.
func reading_keys(_raw: Dictionary, _ctx: DivinationContext) -> Array:
	return []
