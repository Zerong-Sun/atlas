class_name DivinationBootstrap
extends RefCounted

## Single place where methods are wired in. Adding a divination method means
## adding ONE line here — see docs/ROADMAP.md §5.2 / P3 plan.

const SOFT_METHODS := [
	["bazi-relationship", "chart"],
	["dream", "symbol"],
	["qimen", "chart"],
	["ziwei", "chart"],
	["liuyao", "draw"],
	["meihua", "symbol"],
	["western", "chart"],
	["vedic", "chart"],
	["numerology", "chart"],
	["runes", "draw"],
	["geomancy", "symbol"],
	["jiaobei", "yesno"],
	["xiangmian", "symbol"],
	["palmistry", "symbol"],
	["fengshui", "chart"],
	["astrodice", "dice"],
	["lenormand", "draw"],
	["oracle", "draw"],
	["coffee", "symbol"],
	["scrying", "symbol"],
]


static func register_all() -> void:
	DivinationRegistry.clear()
	DivinationRegistry.register(IChingMethod.new())
	DivinationRegistry.register(BaziMethod.new())
	DivinationRegistry.register(LotMethod.new())
	DivinationRegistry.register(TarotMethod.new())
	for pair in SOFT_METHODS:
		DivinationRegistry.register(SoftDivinationMethod.new(String(pair[0]), String(pair[1])))
