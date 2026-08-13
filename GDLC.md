# GDLC Case Study — Fatequest

<!-- GDLC Wizard Version: 0.3.0 -->
<!-- GDLC Sibling SHA: 0.3.0 -->
<!-- GDLC Setup Date: 2026-08-13 -->
<!-- GDLC Last Update: 2026-08-14 -->
<!-- Completed Steps: step-0.1, step-0.2, step-0.5, step-1, step-2, step-3, step-4, step-5, step-5.5, step-6, step-7 -->

## Project Surfaces

This project runs GDLC cycles for: gameplay-matrix, pipeline-contract-audit

Persona matrix pruned to cover these surfaces only. Add rows back as new surfaces come online.

## Tooling

- Test harness: fatequest: custom Godot suite (tests/run_tests.gd + smoke/audit/benchmark scripts); atlas/apps/web: vitest
- e2e harness: none detected — add when installed
- Visual-regression harness: not detected — deferred until art-craft-review cycle

## Earned Rules (Project-Specific)

_Rules earned through this project's playtests. When a rule recurs in a second case study, it graduates to the upstream playbook in `claude-gdlc-wizard`._

- **One denomination for all player-facing numbers** (Playtest #1, 2026-08-14): the coins needs-label printed raw fen (500) while the HUD/market/status all display coins (fen/100) — the mismatch misled two of five persona readers into concluding the exact opposite economic diagnosis (a "trap" instead of a "mint"). Every player-facing number must pass through the same unit boundary (`Market.FEN`). Fix landed in `core/narrative/condition_evaluator.gd` with regression assertion R4.
- **Event-granted goods are outside the economy's brake** (Playtest #1, 2026-08-14): GDD §9.2's travel brake and gate G6 model market-to-market arbitrage only; a choice that sells a good below its same-city market price mints money with zero travel, because the market's sell path has no listing gate. 55 authored instances found (audit sweep, [提示] debt in `tests/audit_zayton_battuta.gd`); a market sell-gate design (or content-level pricing pass) is the pipeline-level fix — pending a dedicated economy cycle.
- **Content gates collide with persona-driven fixes** (Playtest #1, 2026-08-14): adding the Battuta tale as a 4th standing Zayton site broke G26's "metropolis = exactly 3 standing sites" quota. The gate's own dynamic-unlock escape hatch (`when.not.flags` + per-choice flag) resolved it honestly — a real condition, not a never-set flag.

## Playtest Ledger

_Chronological log of playtest cycles. Each entry: date, cycle type, personas, findings, ratchet delta._

### Playtest #1 — Ibn Battuta dialogue choices in Zayton (2026-08-14)

- **Cycle:** gameplay-matrix. **Personas:** Tourist, Casual Historian, Historian Senior, China Purist, Speedrunner. **Confidence:** HIGH.
- **Instruments:** content read-through (en/zh story + tables) × 4 personas; headless runtime probe driving the real UI (`tests/pt1_zayton_battuta.gd`, transient) × 1; orchestrator baseline probes + existing suite as contract observers.
- **Findings (promoted):**
  - **P0** — Registry choice text named Sin Kilan (a city absent from the map) while the effect reveals rt-kinsay-zayton; corpus misattribution (the water of life enters the sea at Zayton, Rihla c023); en/zh drift in the same event. Observers: Tourist P2, Casual Historian P2, Historian Senior P1 (quoted corpus), China Purist P1 (zh/en diff), runtime reveal. → fixed, RED→GREEN.
  - **P0** — Change choice minted paper-money at 500 fen against a 15,308-fen same-city sell (GDD §9.2). Persona labels diverged (trap vs mint) on a units misread; runtime arithmetic settled the direction. → fixed (codex grant replaces the good), RED→GREEN.
  - **P1** — `ev-zayton-battuta-a` reachable only via the one-shot entry fork (absent from zayton sites). Speedrunner (runtime reentry) + orchestrator probe. → user chose "list as a site"; implemented as G26 dynamic unlock.
  - **P2** — zh-only 记入行纪 lines promised a journal entry no effect granted (China Purist diff + Speedrunner runtime). → removed for parity.
  - **P2** — "your paper money" premise gap (4 personas, content instrument). → "the king's paper money".
  - **P2** — Needs-label fen/coins unit mismatch (orchestrator code trace; explains the P0 misread). → display coins.
  - **P2** — Adjacent Zayton, approved in-cycle: jiaobei cup counts 两枚 vs 三只; harbour/fanfang bargain followups promising a price they never charged. → unified; priced with needs gates.
  - **P3s** (ledger only): customs 2-day cost unstated in text; slip choice hidden reputation cost + unexplained language gate; painters' wanted-poster line with no mechanical echo; body pre-describes a choice outcome; entry result texts dead (queued consequence preempts the result page); "as a dinar is with us" en-only POV; 辛克兰/刺基朗 transliteration split; nashhat spelling; time costs unstated on painters/registry.
  - **Debt filed (not fixed — systemic):** 55 event choices across the content base sell goods below their same-city market price (audit [提示] sweep). Needs a market sell-gate design cycle, not per-event band-aids.
- **Ratchet delta:** +1 test file `tests/audit_zayton_battuta.gd` (4 assertions, RED commit 72285a2 → GREEN commit d120fd3); CI now runs it plus smoke_battuta/audit_logic/audit_divination_readings (previously never executed by any workflow).
- **Re-surface %:** 0% (all NEW — first playtest on a freshly shipped corpus; playbook rule #31).
- **Earned rules:** 3 (see above).

## Ratchet (Regression Tests)

_Each P0 finding earns a test RED before the fix. P1/P2 entries at author discretion, severity + reason recorded._

| Date | Finding | Persona(s) | Test file + name |
|------|---------|-----------|------------------|
| 2026-08-14 | P0 — reveal reason names a place the effect doesn't reveal (Sin Kilan vs rt-kinsay-zayton) | Tourist, Casual Historian, Historian Senior, China Purist | tests/audit_zayton_battuta.gd R1 (RED 72285a2 → GREEN d120fd3) |
| 2026-08-14 | P0 — change choice minted paper-money at 500 fen vs 15,308 fen same-city sell | Casual Historian, Speedrunner (runtime arithmetic resolved trap-vs-mint divergence) | tests/audit_zayton_battuta.gd R2 |
| 2026-08-14 | P1 — ev-zayton-battuta-a permanently missable via one-shot entry fork; fixed as G26 dynamic-unlock site | Speedrunner | tests/audit_zayton_battuta.gd R3 (sites-list assertion) |
| 2026-08-14 | P2 — needs label in fen next to display-coin HUD; misled two persona readers | (orchestrator code trace) | tests/audit_zayton_battuta.gd R4 (explain.need_coins:5) |
| 2026-08-14 | P2 — zh 记入行纪 promises a journal entry no effect grants | China Purist, Speedrunner | persona-note; fix removes the lines for parity |
| 2026-08-14 | P2 — "your paper money" premise gap in entry label/result | Tourist, Casual Historian, Historian Senior, China Purist | persona-note; reworded to "the king's paper money" |
| 2026-08-14 | P2 — jiaobei cup counts 两枚 vs 三只 in both languages | China Purist | persona-note; unified to a pair |
| 2026-08-14 | P2 — harbour/fanfang bargain followups promise a price, charge none | China Purist | persona-note; priced with needs gates (12000/8000 fen) |
| 2026-08-14 | P1 (debt) — 55 event choices sell goods below same-city market price; market sell has no listing gate | audit sweep (R2, [提示]) | not fixed — market sell-gate design cycle pending; sweep reported by tests/audit_zayton_battuta.gd |

## What's Working

_Methodological patterns that proved themselves across 2+ playtests (playbook rule #28)._

- **Shared headless runtime probe as a second instrument** (Playtest #1): one verified Godot driver (`--script tests/pt1_*.gd`) exercised the real UI for all personas, giving the playtest a runtime instrument distinct from content read-through — the two-instrument triangulation that caught the reveal mismatch and the mint class. One GDScript caveat learned and passed to every persona: `await` inside an `if` condition silently drops the coroutine resume in headless runs — use `var x: bool = await foo()` instead. (1 playtest — confirm in the next before promoting.)

## References

- Upstream playbook: `https://raw.githubusercontent.com/BaseInfinity/claude-gdlc-wizard/main/GDLC.md`
- Skill: `.claude/skills/gdlc/SKILL.md`
- Wizard: `/gdlc-update` to pull playbook changes
