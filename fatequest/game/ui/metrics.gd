class_name Metrics
extends RefCounted

## One place for every distance, so rhythm is a property of the game rather
## than of whichever call site happened to type a number.
##
## Palette already did this for colour; spacing had no equivalent, so the same
## conceptual gap — "one step of air" — was written as 5, 6, 8, 10, 12, 14, 18
## and 26 in eight different files. Nothing looked wrong on its own and nothing
## lined up with anything else.
##
## Everything here scales with UiScale for the same reason font size does: at
## the HUGE step the type grows 1.55x, and padding that stays at 8 px turns a
## comfortable panel into text jammed against its own border. Scaling is capped
## below the font's own factor — gaps should grow, but slower than glyphs, or a
## large-print reader loses half the window to margins.

## Base spacing ladder, in pixels at the NORMAL step.
const XS := 4
const SM := 6
const MD := 10
const LG := 16
const XL := 24

const RADIUS := 3
const BORDER := 1
const BORDER_HC := 2

## Reading measure. Prose set wider than this is hard to track back to the
## start of the next line however large the type is.
const MEASURE := 760.0

## Icon box for HUD cells and inline glyph rows.
const ICON := 18
const ICON_LG := 22


## Spacing grows at the square root of the font factor: visibly roomier at
## large type, without margins eating the window at the HUGE step.
static func factor() -> float:
	return sqrt(maxf(UiScale.factor(), 0.5))


static func scaled(base: int) -> int:
	return int(round(float(base) * factor()))


static func xs() -> int:
	return scaled(XS)


static func sm() -> int:
	return scaled(SM)


static func md() -> int:
	return scaled(MD)


static func lg() -> int:
	return scaled(LG)


static func xl() -> int:
	return scaled(XL)


static func icon() -> int:
	return scaled(ICON)


static func icon_lg() -> int:
	return scaled(ICON_LG)


## Comfortable line measure for the current step, clamped to the window.
static func measure(viewport_w: float) -> float:
	return minf(MEASURE * factor(), viewport_w - float(xl()) * 2.0)


## Height a bottom-docked prose panel needs: seven lines of the current body
## type plus the panel's own padding.
##
## The map screen previously fixed this at 150 px, which is seven lines at the
## NORMAL step but barely four at HUGE — so the journal shrank to a slot exactly
## for the readers who had just asked for larger words. Tuned to land on ~150 at
## NORMAL, so nothing moves for a player who never touches the setting.
static func dock_height() -> float:
	return float(UiScale.body()) * 7.0 + float(md()) * 2.0 + 12.0


## Minimum hit target. Below roughly this, a control is fiddly with a trackpad
## and impossible on a touch screen.
static func tap_target() -> float:
	return maxf(34.0, float(UiScale.ui()) * 2.1)
