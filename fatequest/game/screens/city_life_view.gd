extends PanelContainer

const Life = preload("res://core/city/city_life.gd")
signal closed()
signal action_requested(op: String, value: Variant)
signal new_journey_requested()

var _state: WorldState
var _city: Dictionary
var _tab := "work"
var _job := ""
var _months := 3
var _end_kind := ""
var _generation := 0
var _submitted := false
var _root: VBoxContainer
var _title: Label
var _facts: Label
var _tabs: HFlowContainer
var _scroll: ScrollContainer
var _content: VBoxContainer
var _feedback: Label
var _actions: HFlowContainer
var _commit: Button
var _job_picker: OptionButton

func _ready() -> void:
	clip_contents = true
	_root = VBoxContainer.new()
	_root.add_theme_constant_override("separation", Metrics.md())
	add_child(_root)
	_title = _label("", true)
	_root.add_child(_title)
	_facts = _label("")
	_root.add_child(_facts)
	_tabs = HFlowContainer.new()
	_tabs.add_theme_constant_override("h_separation", Metrics.sm())
	_root.add_child(_tabs)
	_scroll = ScrollContainer.new()
	_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_scroll.follow_focus = true
	_root.add_child(_scroll)
	_content = VBoxContainer.new()
	_content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_content.add_theme_constant_override("separation", Metrics.md())
	_scroll.add_child(_content)
	_content.minimum_size_changed.connect(func(): _fit.call_deferred())
	_feedback = _label("")
	_feedback.visible = false
	_root.add_child(_feedback)
	_actions = HFlowContainer.new()
	_actions.add_theme_constant_override("h_separation", Metrics.sm())
	_actions.add_theme_constant_override("v_separation", Metrics.sm())
	_root.add_child(_actions)
	get_viewport().size_changed.connect(_fit)
	restyle()

func _label(text: String, heading := false) -> Label:
	var l := Panels.label(text, UiScale.title() if heading else UiScale.ui(), Palette.ink())
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return l

func _clear(node: Node) -> void:
	for child in node.get_children():
		node.remove_child(child)
		child.queue_free()

func open(city: Dictionary, state: WorldState) -> void:
	_state = state
	_city = city
	_end_kind = ""
	_feedback.hide()
	_render()

func restyle() -> void:
	if _root == null: return
	Panels.apply_card(self, "ledger" if _tab == "credit" else "notice")
	_title.add_theme_font_size_override("font_size", UiScale.title())
	for l in [_title, _facts, _feedback]: l.add_theme_color_override("font_color", Palette.ink())
	for l in [_facts, _feedback]: l.add_theme_font_size_override("font_size", UiScale.ui())
	if _state != null: _render()
	_fit()

func _fit() -> void:
	if not is_inside_tree(): return
	var viewport := get_viewport_rect().size
	var natural_height := _root.get_combined_minimum_size().y + _content.get_combined_minimum_size().y + Metrics.md() * 2
	custom_minimum_size = Vector2(minf(860, viewport.x - 48), minf(maxf(380, natural_height), minf(650, viewport.y - 48)))
	size = custom_minimum_size

func _render() -> void:
	_generation += 1
	_submitted = false
	_clear(_tabs)
	_clear(_content)
	_clear(_actions)
	var ended := Life.retired(_state)
	_tabs.visible = not ended
	_title.text = I18n.t("ui.stay.title") % I18n.t(String(_city.get("name", "")))
	_facts.text = I18n.t("ui.stay.facts") % [Panels.money(_state.coins), Mortality.age_years(_state)]
	Panels.apply_card(self, "ledger" if _tab == "credit" else "notice")
	for id in ["work", "credit", "ending"]:
		var b := Panels.styled_button(I18n.t("ui.stay.tab." + id), func():
			_tab = id
			_end_kind = ""
			_feedback.hide()
			_scroll.scroll_vertical = 0
			_render())
		Panels.select_button(b, id == _tab)
		_tabs.add_child(b)
	if ended:
		_final_page()
	else:
		match _tab:
			"work": _work_page()
			"credit": _credit_page()
			"ending": _ending_page()
		_actions.add_child(Panels.styled_button(I18n.t("ui.back_to_city"), func(): closed.emit()))
	_fit()

func _work_page() -> void:
	_content.add_child(_label(I18n.t("ui.stay.work_intro")))
	_job_picker = OptionButton.new()
	_job_picker.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Panels.style_button(_job_picker)
	var jobs := Life.jobs(_state)
	if not jobs.any(func(j): return j.id == _job): _job = String(jobs[0].id)
	for job in jobs:
		_job_picker.add_item(I18n.t("ui.stay.job." + job.id) + " · " + I18n.t("ui.stay.monthly") % Panels.money(job.pay))
		_job_picker.set_item_metadata(_job_picker.item_count - 1, job.id)
		if job.id == _job: _job_picker.select(_job_picker.item_count - 1)
	_job_picker.item_selected.connect(func(index):
		_job = String(_job_picker.get_item_metadata(index))
		_feedback.hide()
		_render())
	_content.add_child(_job_picker)
	_content.add_child(_label(I18n.t("ui.stay.job." + _job + ".body")))
	var durations := HFlowContainer.new()
	durations.add_theme_constant_override("h_separation", Metrics.sm())
	durations.add_theme_constant_override("v_separation", Metrics.sm())
	for months in Life.MONTHS:
		var b := Panels.styled_button(duration(months), func():
			_months = months
			_feedback.hide()
			_render())
		Panels.select_button(b, months == _months)
		durations.add_child(b)
	_content.add_child(durations)
	var quote := Life.work_quote(_state, _job, _months)
	if quote.get("ok", false):
		var receipt := PanelContainer.new()
		Panels.apply_card(receipt, "ledger")
		var details := VBoxContainer.new()
		details.add_theme_constant_override("separation", Metrics.sm())
		receipt.add_child(details)
		details.add_child(_label(I18n.t("ui.stay.quote") % [duration(_months), quote.days, Panels.money(quote.income), quote.reputation]))
		details.add_child(_label(I18n.t("ui.stay.until") % date_text(_state.jdn + int(quote.days))))
		_content.add_child(receipt)
	else:
		_content.add_child(_label(I18n.t(quote.reason)))
	_action(I18n.t("ui.stay.accept"), "city_work", {"city": _state.city, "job": _job, "months": _months}, quote.get("ok", false))
	var history := Life.work_history(_state)
	if not history.is_empty():
		_content.add_child(Panels.rule())
		_content.add_child(_label(I18n.t("ui.stay.history")))
		var shown := 0
		for i in range(history.size() - 1, -1, -1):
			var record: Dictionary = history[i]
			if record.city != _state.city: continue
			_content.add_child(_label("%s · %s · +%s" % [I18n.t("ui.stay.job." + record.job), duration(record.months), Panels.money(record.income)]))
			shown += 1
			if shown >= 5: break

func _credit_page() -> void:
	var debt: Dictionary = _state.city_life.get("debt", {})
	_content.add_child(_label(I18n.t("ui.stay.credit_intro")))
	var allowed := Life.blocked_reason(_state).is_empty()
	if debt.is_empty():
		_content.add_child(_label(I18n.t("ui.stay.loan_terms") % [Panels.money(Life.PRINCIPAL), Panels.money(Life.PRINCIPAL + Life.LOAN_FEE), Panels.money(Life.LATE_FEE)]))
		_action(I18n.t("ui.stay.borrow"), "city_borrow", true, allowed)
	else:
		var due := Life.debt_due(_state)
		_content.add_child(Panels.badge(I18n.t("ui.stay.overdue" if _state.jdn > int(debt.due_jdn) else "ui.stay.outstanding")))
		_content.add_child(_label(I18n.t("ui.stay.debt") % [Panels.money(due), date_text(int(debt.due_jdn))]))
		_content.add_child(_label(I18n.t("ui.stay.repay_anywhere")))
		if _state.coins < due: _content.add_child(_label(I18n.t("ui.stay.repay_short")))
		_action(I18n.t("ui.stay.repay") % Panels.money(due), "city_repay", true, allowed and _state.coins >= due)

func _ending_page() -> void:
	_content.add_child(_label(I18n.t("ui.stay.end_intro")))
	for kind in ["settled", "failed"]:
		var b := Panels.styled_button(I18n.t("ui.stay.end." + kind), func():
			_end_kind = kind
			_render())
		b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		Panels.select_button(b, kind == _end_kind)
		_content.add_child(b)
	if not _end_kind.is_empty():
		_content.add_child(_label(I18n.t("ui.stay.end.confirm") % I18n.t("ui.stay.end." + _end_kind)))
	_action(I18n.t("ui.stay.end.commit"), "retire_journey", _end_kind, not _end_kind.is_empty() and Life.blocked_reason(_state).is_empty())

func _final_page() -> void:
	var ending: Dictionary = _state.city_life.ending
	_title.text = I18n.t("ui.stay.end." + String(ending.kind))
	_content.add_child(_label(I18n.t("ui.stay.epilogue." + String(ending.kind)) % I18n.t(String(_city.get("name", "")))))
	_content.add_child(_label(I18n.t("ui.stay.summary") % [_state.days_elapsed, _state.visited.size(), Panels.money(_state.coins), Panels.money(Life.debt_due(_state))]))
	_actions.add_child(Panels.primary_button(I18n.t("ui.stay.new_journey"), func(): new_journey_requested.emit()))

func _action(text: String, op: String, value: Variant, enabled: bool) -> void:
	var token := _generation
	_commit = Panels.primary_button(text, func():
		if token != _generation or _submitted or not is_visible_in_tree(): return
		_submitted = true
		_commit.disabled = true
		action_requested.emit(op, value))
	_commit.disabled = not enabled
	_commit.custom_minimum_size.x = minf(300, get_viewport_rect().size.x - 100)
	_commit.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_actions.add_child(_commit)

func show_result(text: String) -> void:
	_render()
	_feedback.text = text
	_feedback.visible = not text.is_empty()
	_fit.call_deferred()

static func duration(months: int) -> String:
	if months == 1: return I18n.t("ui.stay.one_month")
	if months == 12: return I18n.t("ui.stay.one_year")
	return I18n.t("ui.stay.years") % (months / 12) if months >= 12 else I18n.t("ui.stay.months") % months

static func date_text(jdn: int) -> String:
	var d := GameDate.new(jdn).to_gregorian()
	return "%d-%02d-%02d" % [d.year, d.month, d.day]
