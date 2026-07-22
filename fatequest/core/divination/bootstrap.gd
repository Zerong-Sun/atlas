class_name DivinationBootstrap
extends RefCounted

## Single place where methods are wired in. Adding a divination method means
## adding ONE line here — see docs/ROADMAP.md §5.2 for the porting order.
##
## Methods still to port from js/engines.js (the legacy simplified set):
##   bazi, lot, dream, tarot, jiaobei, astrodice, runes, meihua, western
## and beyond those, the 24 in atlas/packages/method-data.

static func register_all() -> void:
	DivinationRegistry.clear()
	DivinationRegistry.register(IChingMethod.new())
