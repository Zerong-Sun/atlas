class_name DivinationContext
extends RefCounted

## Everything a method may look at. Passed by value-ish: methods must NOT
## mutate state — they return effects and let EffectExecutor do the writing.

var state: WorldState
var rng: Rng
var jdn: int = 0
var question: String = ""      ## route|timing|person|trade|risk|identity
var subject: String = ""       ## city id, route id, retainer id, or ""
var birthdate_jdn: int = -1    ## for birth-structure methods; -1 = unknown


func _init(p_state: WorldState = null, p_rng: Rng = null) -> void:
	state = p_state
	rng = p_rng if p_rng else Rng.new("divination")
