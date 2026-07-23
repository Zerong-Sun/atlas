class_name Palette
extends RefCounted

## One place for every colour, so contrast is a property of the game rather
## than of whichever call site drew the text.
##
## The parchment map is a light, busy, mid-tone surface. Text drawn on it in
## thin dark brown fails WCAG badly and is genuinely hard to read — that was a
## real complaint, not a matter of taste. Body copy therefore sits on an opaque
## panel, never directly on vellum, and the panel/ink pair below clears 7:1.

const INK        := Color("1a1208")   # body text on panel — 12.6:1 on PANEL
const INK_SOFT   := Color("4a3a26")   # secondary text    —  6.1:1
const PANEL      := Color("efe4cc")   # opaque reading surface
const PANEL_DEEP := Color("e2d3b4")
const EDGE       := Color("8a7248")

const GOLD       := Color("c8922e")   # highlights, current location
const RED        := Color("9c3520")   # warnings, "you are here"
const GREEN      := Color("3d6b3a")   # gains
const BLUE       := Color("2c5878")   # sea

## High-contrast mode: near-black on near-white, for readers who need it.
const HC_INK   := Color("000000")
const HC_PANEL := Color("ffffff")


static func ink() -> Color:
	return HC_INK if UiScale.high_contrast else INK


static func ink_soft() -> Color:
	return HC_INK if UiScale.high_contrast else INK_SOFT


static func panel() -> Color:
	return HC_PANEL if UiScale.high_contrast else PANEL


## A filled, bordered panel style. Text must never sit straight on the map.
static func panel_style(deep: bool = false) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = HC_PANEL if UiScale.high_contrast else (PANEL_DEEP if deep else PANEL)
	s.border_color = Color("000000") if UiScale.high_contrast else EDGE
	s.set_border_width_all(1 if not UiScale.high_contrast else 2)
	s.set_corner_radius_all(3)
	s.content_margin_left = 12
	s.content_margin_right = 12
	s.content_margin_top = 8
	s.content_margin_bottom = 8
	return s


static func button_style(hover: bool = false) -> StyleBoxFlat:
	var s := panel_style(hover)
	s.content_margin_top = 7
	s.content_margin_bottom = 7
	if hover:
		s.border_color = GOLD
		s.set_border_width_all(2)
	return s
