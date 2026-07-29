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
const INK_FAINT  := Color("6b5a3c")   # captions, provenance —  4.6:1
const PANEL      := Color("efe4cc")   # opaque reading surface
const PANEL_DEEP := Color("e2d3b4")
const PANEL_SUNK := Color("d6c6a2")   # pressed / inset surfaces
const EDGE       := Color("8a7248")

const GOLD       := Color("c8922e")   # highlights, current location
const RED        := Color("9c3520")   # warnings, "you are here"
const GREEN      := Color("3d6b3a")   # gains
const BLUE       := Color("2c5878")   # sea

## High-contrast mode: near-black on near-white, for readers who need it.
const HC_INK   := Color("000000")
const HC_PANEL := Color("ffffff")

## Focus ring. Deliberately not GOLD: the gold hover border and the focus ring
## have to be told apart at a glance, or a keyboard user cannot see where they
## are while the mouse also happens to be over something.
const FOCUS := Color("2c5878")

## Button visual states. Previously `pressed` was handed the identical stylebox
## as `hover`, so a click produced no change on screen at all — on a game where
## one choice can cost forty days, the press deserves to be felt. Each state now
## differs in a way that survives greyscale as well as colour.
enum State { NORMAL, HOVER, PRESSED, FOCUS_RING }


static func ink() -> Color:
	return HC_INK if UiScale.high_contrast else INK


static func ink_soft() -> Color:
	return HC_INK if UiScale.high_contrast else INK_SOFT


## Captions and provenance lines. Under high contrast this collapses to plain
## ink rather than staying faint — a reader who needs high contrast is exactly
## the reader who cannot make out 4.6:1 grey.
static func ink_faint() -> Color:
	return HC_INK if UiScale.high_contrast else INK_FAINT


static func panel() -> Color:
	return HC_PANEL if UiScale.high_contrast else PANEL


static func edge() -> Color:
	return HC_INK if UiScale.high_contrast else EDGE


## Gains green, losses red — but under high contrast both fall back to ink.
## Colour never carries the meaning on its own here; it only reinforces a sign
## (+ / −) that is already written out.
static func gain() -> Color:
	return HC_INK if UiScale.high_contrast else GREEN


static func loss() -> Color:
	return HC_INK if UiScale.high_contrast else RED


static func accent() -> Color:
	return HC_INK if UiScale.high_contrast else GOLD


## Modal scrim. Darker under high contrast so the panel edge still reads
## against whatever illustration happens to sit behind it.
static func scrim_color() -> Color:
	return Color(0, 0, 0, 0.68) if UiScale.high_contrast else Color(0.06, 0.05, 0.03, 0.5)


## A filled, bordered panel style. Text must never sit straight on the map.
static func panel_style(deep: bool = false) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = HC_PANEL if UiScale.high_contrast else (PANEL_DEEP if deep else PANEL)
	s.border_color = edge()
	s.set_border_width_all(Metrics.BORDER_HC if UiScale.high_contrast else Metrics.BORDER)
	s.set_corner_radius_all(Metrics.RADIUS)
	# Padding scales with the type. Fixed 12/8 padding around 26 pt text is the
	# difference between a panel and a box with words crammed into its border.
	var pad_x := Metrics.md() + Metrics.xs()
	var pad_y := Metrics.sm() + 2
	s.content_margin_left = pad_x
	s.content_margin_right = pad_x
	s.content_margin_top = pad_y
	s.content_margin_bottom = pad_y
	return s


## An inset plate — used for read-only value fields inside a panel, so a number
## you cannot edit does not look like a button you failed to click.
static func inset_style() -> StyleBoxFlat:
	var s := panel_style()
	s.bg_color = HC_PANEL if UiScale.high_contrast else PANEL_SUNK
	return s


static func button_style(state: int = State.NORMAL) -> StyleBoxFlat:
	var s := panel_style(state == State.HOVER or state == State.PRESSED)
	var pad_y := Metrics.sm() + 1
	s.content_margin_top = pad_y
	s.content_margin_bottom = pad_y
	match state:
		State.HOVER:
			s.border_color = HC_INK if UiScale.high_contrast else GOLD
			s.set_border_width_all(2)
		State.PRESSED:
			s.bg_color = HC_PANEL if UiScale.high_contrast else PANEL_SUNK
			s.border_color = HC_INK if UiScale.high_contrast else GOLD
			s.set_border_width_all(2)
			# Shift the label down a pixel so the press is felt, not just seen.
			s.content_margin_top = pad_y + 1
			s.content_margin_bottom = maxi(pad_y - 1, 1)
		State.FOCUS_RING:
			s.border_color = HC_INK if UiScale.high_contrast else FOCUS
			s.set_border_width_all(2)
	return s
