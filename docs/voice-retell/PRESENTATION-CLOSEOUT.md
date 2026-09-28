# Demo Presentation & Operator Runbook — CLOSED PASS

Validated 2026-09-28 UTC (2026-09-27 local task start). Scope: configurable fictional
catalog, nonbillable startup/readiness, offline presentation and operator documentation.
No new live audio/model-response acceptance is claimed.

## Backup gate

Canonical repository: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC`.
Origin verified as `https://github.com/AW-Creates/AWC.git`. Clean main was 11 ahead,
0 behind the freshly fetched remote. Fast-forward pushed without history rewriting;
re-fetch verified local main = origin/main =
`04a1f4651491ce253e274420f6315418e38d5e8d` before implementation.
Final implementation/state commits and final remote equality are recorded in the
task closeout; PROJECT_STATE references the validated implementation commit.

## Deliverables

- `experiments/receptionist/demo_business.json`: Ava/BrightHome identity defaults,
  hours, Springfield, fictional insurance/policy facts, handoff rules, mock slots,
  quote fixtures, conflict scenario, six primary offerings and two controlled add-ons.
- Primary services: standard, deep, move-in/out, recurring home, small office,
  post-construction. Add-ons: inside oven and emptied refrigerator; included/excluded
  scope and human-reviewed pricing are explicit.
- `service_catalog.py`: exact normalized aliases, list/explain/compare, explicit
  unknown answer, optional human-follow-up offer; no inferred price or availability.
  Configuration rejects ambiguous aliases, invalid slots and mismatched quote support.
- Existing eight-tool boundary retained. `get_business_info` accepts `services`,
  `service`, `compare` (with `service` and `compare_to`) and policy/FAQ topics.
  Quote and booking tools remain authoritative; only standard/deep have quote rules.
- `scripts/voice-demo/demo_operator.py`: credentials-presence check without values,
  owned callback/tunnel lifecycle, bounded registration/DNS wait, saved schema/identity
  readback, URL refresh, signed business/catalog readiness, fail-closed exit and cleanup.
- `scripts/voice-demo/rehearse.py`: real tool dispatch with synthetic data, explicit
  local approval, confirmed booking, conflict rejection and contextual human follow-up.
- `OPERATOR-RUNBOOK.md` and `DEMO-SCRIPT.md`: operator workflow and 3–5 minute prospect
  presentation. The voice excerpt remains capped at 120 seconds (browser 115).

## Evidence

64 focused offline unittest tests PASS: all previous 47 plus catalog/operator cases.
Synthetic rehearsal PASS: deep three-bedroom quote $225; caller-only confirmation
blocked; local operator approval confirmed a mock slot; duplicate slot rejected;
summary retained quote, booking and one follow-up; no human contacted.

Actual one-command nonbillable readiness PASS: DNS, semantic health, genuine signed
availability and catalog callbacks, refreshed eight tool URLs/webhook and fresh saved
configuration readback. Runtime and tunnel exited; zero listeners on 8766/8767 and no
cloudflared process remained. Readiness is point-in-time; saved tunnel URL is inactive.
Private readiness JSON remains ignored under `.cache/retell-acceptance/`.

No new paid call or text test was required. Additional call spend: $0.00. Existing
one-call ledger retained, and `--serve` refuses the consumed allowance before startup.
Current provider balance/rate was not rechecked because no new spending was attempted.
Prior human barge-in/latency/date acceptance is preserved, not repeated.

Slot-review wording fixed offline: stale/missing/changed review means no confirmation,
not evidence of slot unavailability; ask permission before rechecking and preparing a
fresh proposal. Booking authorization, freshness and conflict rules are unchanged.

## Progress / Cost Gate

Resumed from the explicit user-authorized checkpoint; completed backup before work.
Historic cap count for this exact milestone is unknown. No provider benchmarking,
paid tests or broad research repeated. One bounded Builder was used; Director
review found and corrected integration gaps, then performed final validation.

Startup attempts exposed two distinct defects: provider removes schema annotations,
then a URL-before-DNS tunnel race. Read-only schema evidence supported a catalog-only
sync adjustment preserving local validation; bounded registration/DNS waiting fixed
the second issue. The next check passed; no further live checks were run. This is
new startup evidence, not repetition of settled voice experiments.

## Boundaries and next action

No real booking, actual human contact, new call allowance, production rollout or
outreach. New catalog behavior is tested as tools/configuration, not sampled live
speech. No visible UI changed; command output and actual runtime workflow were inspected.
Known pre-existing dependency deprecation warnings do not affect the passing suite.

Stop after commit and remote verification. Recommend a fresh **AWC — Human Demo
Rehearsal & Pilot Requirements** milestone: walk through the offline presentation,
collect feedback on clarity, and document pilot requirements. A new live call would
need a separately scoped budget/allowance; do not reset the old ledger.
