class_name UiScale
extends RefCounted

## Reader comfort settings. Font size is not a nicety on a game that is almost
## entirely prose — at 1400px wide with 12px type, a player simply cannot read
## it, which is the same as the game not working.
##
## Values persist to user:// so the choice survives a restart.

const CFG := "user://ui.cfg"

enum Size { SMALL, NORMAL, LARGE }

const STEPS := {
	Size.SMALL: 0.85,
	Size.NORMAL: 1.0,
	Size.LARGE: 1.25,
}

## Base sizes in points, before the step multiplier.
const BASE_BODY := 17
const BASE_UI := 16
const BASE_HUD := 17
const BASE_TITLE := 30
const BASE_MAP_LABEL := 13

static var step: int = Size.NORMAL
static var high_contrast: bool = false


static func factor() -> float:
	return STEPS.get(step, 1.0)


static func body() -> int:
	return int(round(BASE_BODY * factor()))


static func ui() -> int:
	return int(round(BASE_UI * factor()))


static func hud() -> int:
	return int(round(BASE_HUD * factor()))


static func title() -> int:
	return int(round(BASE_TITLE * factor()))


static func map_label() -> int:
	return int(round(BASE_MAP_LABEL * factor()))


static func cycle() -> int:
	step = (step + 1) % STEPS.size()
	save()
	return step


static func label() -> String:
	var labels := {
		Size.SMALL: I18n.t("ui.font_small"),
		Size.NORMAL: I18n.t("ui.font_normal"),
		Size.LARGE: I18n.t("ui.font_large"),
	}
	return labels.get(step, I18n.t("ui.font_normal"))


static func save() -> void:
	var f := ConfigFile.new()
	f.set_value("ui", "text_step", step)
	f.set_value("ui", "high_contrast", high_contrast)
	f.set_value("ui", "lang", I18n.lang())
	f.save(CFG)


static func load_prefs() -> void:
	var f := ConfigFile.new()
	if f.load(CFG) != OK:
		return
	step = int(f.get_value("ui", "text_step", Size.NORMAL))
	high_contrast = bool(f.get_value("ui", "high_contrast", false))
	var lang := String(f.get_value("ui", "lang", "zh"))
	if lang in ["zh", "en"]:
		I18n.load_lang(lang)
