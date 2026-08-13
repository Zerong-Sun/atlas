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
- **Event-granted goods are outside the economy's brake** (Playtest #1, 2026-08-14; resolved Playtest #2): GDD §9.2's travel brake and gate G6 model market-to-market arbitrage only; a choice that sells a good below its same-city market price mints money with zero travel, because the market's sell path had no gate. 55 authored instances found (audit sweep). Playtest #2 delivered the pipeline fix: per-city granted counts + sell gate in `market.gd` / `effect_executor.gd` (S1–S6 in `tests/audit_economy_sellgate.gd`, 108 candidates braked).
- **A gate's test suite must include the adversary paths** (Playtest #2, 2026-08-14): the sell-gate's own green tests (S1/S2) codified the bought-op wipe as intended behavior — which was the exact mechanism of the launder bypass (one market buy reopened the mint in 40 of 54 cities). Four contract personas with live probes caught what the contract test blessed. Every new gate ships with its bypass assertions (launder/overwrite/mixed-lot) written RED.
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
  - **Debt filed (systemic):** 55 event choices across the content base sell goods below their same-city market price (audit [提示] sweep; 55 in R2 vs 54 in S5 — bochara-battuta-a has no market to sell into, so it is not a mint). → **Resolved by Playtest #2**: per-city sell-gate braked all 108 sweep candidates (S5/S6).
- **Ratchet delta:** +1 test file `tests/audit_zayton_battuta.gd` (4 assertions, RED commit 72285a2 → GREEN commit d120fd3); CI now runs it plus smoke_battuta/audit_logic/audit_divination_readings (previously never executed by any workflow).
- **Re-surface %:** 0% (all NEW — first playtest on a freshly shipped corpus; playbook rule #31).
- **Earned rules:** 3 (see above).

### Playtest #2 — Market sell-gate (economy debt) (2026-08-14)

- **Cycle:** pipeline-contract-audit. **Personas:** Market Maker, Caravan Broker, Fiscal Clerk, Save Auditor. **Confidence:** HIGH.
- **Target:** the Playtest #1 debt class — 55 event choices minting goods below same-city market price. Fix: provenance + sell gate in the pipeline (`effect_executor` goods/bought ops, `market.sell_effects`, `market_view`).
- **Findings (promoted):**
  - **P0** — Launder: one market buy wiped the scalar grant mark for the whole lot, reopening the mint at ~0.7·mid in 40 of 54 cities (Save Auditor code-trace; Caravan Broker live probe +9,032 fen; Market Maker live probe +15,981 fen; Fiscal Clerk probes +4,789/+7,726 fen). → fixed with per-city granted counts; S6 RED (b946d30) → GREEN (4e1c687).
  - **P0** — Overwrite: a second grant of the same good in another city moved the mark, unblocking the first city (3 personas). → fixed by the same count model; S6.
  - **P1** — Over-block: a grant on a market-bought lot locked the bought units out of same-city liquidation (3 personas). → counts fix the wipe; residual mixed-lot restriction documented as intended trade-off.
  - **P2** — No release valve: gated/bulk cargo could strand slots (Caravan). → jettison button (no silver) on hold rows.
  - **P2** — S5 sweep blind spots: free grants (cost == 0, 44 events) skipped; no bypass assertions existed (Market Maker, Fiscal Clerk). → S5 widened (108 candidates), S6 added.
  - **P2** — Grandfathering contract untested; no pre-gate save fixture (Save Auditor). → S4b in-memory old-shape round trip; fixture file remains as noted debt.
  - **P3s**: gated rows hid the sell price → price line kept + prohibition wording; 4 bargain choices lacked needs gates → gated (bochara/samarcanda/badashan/baldacum); route-event grants marked with the departure city (cosmetic, journey semantics out of scope); running-average basis dilution (pre-existing, RE-SURFACE, not fixed); stale shape docs → updated.
- **Ratchet delta:** `tests/audit_economy_sellgate.gd` (S1–S6, RED 091b272 → GREEN 8053d3c; RED b946d30 → GREEN 4e1c687); CI runs it; test_save now carries a purchase basis.
- **Re-surface %:** 1/12 (F7 basis dilution — pre-existing, surfaced by the change; filed as debt).
- **Cross-model review:** Codex CLI not installed — skipped with reason; four contract lenses substituted.
- **Earned rules:** 1 (see above).

### Playtest #3 — Market experience after the sell-gate (2026-08-14)

- **Cycle:** gameplay-matrix (UX half of the mixed pipeline+UX ship, playbook rule #32). **Personas:** Tourist, Casual Historian, Historian Senior, China Purist, Speedrunner. **Confidence:** HIGH.
- **Instruments:** content read-through (market_view + i18n en/zh); shared headless probe (`tests/pt3_market_probe.gd`, transient) + contract audit `tests/audit_market_trades.gd` as the runtime instrument.
- **Findings (promoted):**
  - **P0** — Every market trade applied one press late: `_buy/_sell/_jettison` emitted `traded` before assigning `_pending`, so the first press of a session did nothing, the last press left a stale trade, and the next press of any button (in any city) applied the previous trade — a Zayton silk sell once fired on a Kinsay buy press. Pre-dates the sell-gate (original trade commit); smoke_market had masked it (4 presses → 3 applied still passed). Observers: preflight audit (8 severe), Casual Historian, Speedrunner. → fixed (queue-before-emit + pending purge on open); RED 1a52e91 → GREEN 3c11b8c.
  - **P1** — Ghost trades bypassed purse/cargo guards at fire time (consequence of the same root; evaporates with same-press consumption). Speedrunner.
  - **P2** — local_grant framing: en rules-panel voice, zh lost the mandatory tone, and the string asserted a false liquidity fact (the quay buys anything at spread — the honest frame is the friend's price). 3 personas. → reworded en+zh (只可 restored).
  - **P2** — Jettison on dry land + no confirmation + dominated trap button. 3 personas. → renamed Abandon/弃货, land-neutral tip, arm-confirm (two presses).
  - **P2** — Gated row showed "Sells here for X" on a dead Sell button; mixed-lot rows claimed all units were locked. 2 personas. → sell_local_quote + local_grant_count.
  - **P2** — Invisible changer's cut on cross-zone sells (Historian Senior). → exchange_cut line on the row.
  - **P2** — Yuan paper money priced as a profitable export (inconvertible chao). Historian Senior. → far band set to base parity.
  - **P2** — Orphaned quayside flavour (market.item.* blurbs + market desc never rendered). 2 personas. → wired as stock-row tooltips + screen header.
  - **P2 (re-surfaced, fixed at root)** — basis dilution: the free grant watered the bought average, so a loss sale recorded phantom richestTrade profit (S7 RED → GREEN: unit now equals the exact buy price; bought-count basis).
  - **P3s:** 一单位/丢弃/紧缺 zh register; 交钞/纸钞 variance; jettison-tip hover-only; flat 6% vs prose variance (accepted abstraction).
- **Ratchet delta:** `tests/audit_market_trades.gd` (T1–T3, RED 1a52e91 → GREEN 3c11b8c); S7 + S4c added to `audit_economy_sellgate.gd`; `tests/fixtures/save_v4.json` (pre-gate save, grandfathering pinned on disk); CI runs the trade-order audit.
- **Re-surface %:** 2/14 (basis dilution — fixed at root this cycle; flat-6% prose — accepted). No regression-of-fix.
- **Fold-ins:** save fixture (test-infra); the remaining PT1 P3 text items deferred to a content cycle.

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
| 2026-08-14 | P1 (debt) — 55 event choices sell goods below same-city market price; market sell had no gate | audit sweep (R2, [提示]) | resolved by Playtest #2 — per-city sell-gate (audit_economy_sellgate.gd S1–S6, 108 braked) |
| 2026-08-14 | P0 — launder: one market buy wiped the scalar grant mark, reopening the mint in 40/54 cities | Save Auditor, Caravan Broker, Market Maker, Fiscal Clerk (4 live probes) | tests/audit_economy_sellgate.gd S6 launder (RED b946d30 → GREEN 4e1c687) |
| 2026-08-14 | P0 — overwrite: a second grant in another city moved the mark, unblocking the first | Save Auditor, Caravan Broker, Market Maker | tests/audit_economy_sellgate.gd S6 overwrite |
| 2026-08-14 | P1 — over-block: grant on a market-bought lot locked bought units out of liquidation | Save Auditor, Market Maker, Fiscal Clerk | persona-note; count model + documented trade-off |
| 2026-08-14 | P2 — no release valve for gated/bulk cargo | Caravan Broker | persona-note; jettison button added |
| 2026-08-14 | P2 — S5 sweep skipped free grants (44 events) | Market Maker, Fiscal Clerk | S5 widened to 108 candidates |
| 2026-08-14 | P2 — grandfathering contract untested | Save Auditor | audit_economy_sellgate.gd S4b (old-shape round trip); fixture file remains as noted debt |
| 2026-08-14 | P3 — 4 bargain choices ungated (free good when broke) | Fiscal Clerk | persona-note; needs gates added |
| 2026-08-14 | P3 — gated rows hid the sell price | Caravan Broker, Market Maker | persona-note; price line kept + prohibition wording |
| 2026-08-14 | P3 (re-surface) — running-average basis dilution overstates richestTrade on mixed lots | Market Maker | fixed PT3 — bought-count basis (audit_economy_sellgate.gd S7, RED → GREEN 3c11b8c) |
| 2026-08-14 | P0 — every market trade applied one press late; stale trades fired cross-city | preflight audit, Casual Historian, Speedrunner | tests/audit_market_trades.gd T1–T3 (RED 1a52e91 → GREEN 3c11b8c) |
| 2026-08-14 | P2 — local_grant en rules-panel voice / zh lost mandatory tone / false liquidity claim | Tourist, China Purist, Historian Senior | persona-note; friend's-price fiction en+zh |
| 2026-08-14 | P2 — jettison on dry land, no confirmation, dominated beside Sell | Tourist, Historian Senior, China Purist | persona-note; Abandon/弃货 + arm-confirm (T3 asserts the two-press contract) |
| 2026-08-14 | P2 — "Sells here for X" on a dead Sell button; mixed-lot row mislabels bought units | Tourist, Historian Senior | persona-note; sell_local_quote + local_grant_count |
| 2026-08-14 | P2 — invisible changer's cut on cross-zone sells | Historian Senior | persona-note; exchange_cut line |
| 2026-08-14 | P2 — Yuan paper money priced as a profitable export | Historian Senior | persona-note; far band = base parity |
| 2026-08-14 | P2 — orphaned quayside flavour never rendered | China Purist, Historian Senior | persona-note; stock-row tooltips + market header |
| 2026-08-14 | P2 — grandfathering contract unpinned on disk | Save Auditor (PT2) | tests/fixtures/save_v4.json + audit_economy_sellgate.gd S4c |

## What's Working

_Methodological patterns that proved themselves across 2+ playtests (playbook rule #28)._

- **Shared headless runtime probe as a second instrument** (Playtests #1 + #2, 2026-08-14): a verified Godot driver exercising the real UI/core gives every cycle a runtime instrument distinct from content read-through or code audit — the two-instrument triangulation that caught the reveal mismatch, the mint class (PT1), and the launder/overwrite bypasses (PT2, where contract personas wrote their own transient probes with live quotes). One GDScript caveat: `await` inside an `if` condition silently drops the coroutine resume in headless runs — use `var x: bool = await foo()` instead. Confirmed across 2 playtests → promoted per rule #28.

## References

- Upstream playbook: `https://raw.githubusercontent.com/BaseInfinity/claude-gdlc-wizard/main/GDLC.md`
- Skill: `.claude/skills/gdlc/SKILL.md`
- Wizard: `/gdlc-update` to pull playbook changes
