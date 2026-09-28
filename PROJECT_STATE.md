# AWC Project State

Updated 2026-09-28. Canonical repo: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC`, branch `main`.

## Current milestone
**AWC — Pilot Scope & Acceptance Design: CLOSED PASS (design only); see PILOT-SCOPE-CLOSEOUT.md for validation and Git checkpoint.** Human Demo Rehearsal & Pilot Requirements is now CLOSED PASS: user personally completed the offline rehearsal, ending with `PASS: offline rehearsal complete. No provider call or charge.` Presentation duration was not measured. Prior voice/demo acceptance preserved.

## Current working state / deliverables
Seven documents under `docs/voice-retell/`:
- `PILOT-SCOPE-OFFER.md`: local residential cleaning, one business/voice path, up to six services/two add-ons and two estimate rules, human-approved booking only, 14 days.
- `PILOT-COST-MODEL.md`: observed browser cost near $0.119–$0.1203/min; modeled $0.15–$0.25/min plus nonvoice costs; fixed paid pilot with setup component and capped minutes recommended internally, no public price.
- `PILOT-ONBOARDING-INTAKE.md`: approval/form specification paired with non-executable `PILOT-CLIENT-TEMPLATE.json`; completed client data stays outside Git.
- `PILOT-READINESS-GAPS.md`: exact current readiness and mandatory launch prerequisites.
- `PILOT-ACCEPTANCE-PLAN.md`: pre-launch cases and day 3/7/14 metrics, zero wrong prices/unauthorized or duplicate booking.
- `PILOT-RISK-DISCLOSURE.md`: privacy, jurisdiction-review, factual, security and escalation gates.
- `PILOT-LAUNCH-SEQUENCE.md`: conditional yes-to-live checklist and outreach decision gate.

## Architecture / locked limitations
AWC owns facts/quotes/booking safety/context; Retell provides managed voice. Current quote engine is hardcoded, calendar/handoff are local demo behavior, template is not runtime config, current voice page has no authenticated operator booking approval control. Live pilot needs implemented client rules, real calendar plus human approval OR signed request-only re-scope, verified delivered escalation, persistent signed public callbacks, monitoring/fallback, secure credentials, approved privacy and tested routing. CRM remains excluded.

## Readiness and remaining decisions
Product/demo and pilot design ready for conditional prospect preparation. Before actual outreach: owner accepts narrow offer, pricing structure and capacity to support one pilot, and separately authorizes contact. No engineering blocker must be solved merely to talk about a conditional pilot. Client-specific integrations, final price, legal/privacy review, deployment, numeric budgets and live tests can wait until prospect agreement; all mandatory production gates must pass before launch. No launch date/compatibility guarantee.

## Validation / evidence
Documentation-only changes; link resolution, JSON parse/empty implementation gates, cost arithmetic, coverage and consistency review. No runtime code changed, historical tests/voice benchmarks not repeated. Prior 34 focused tests and nonbillable preflight remain historical evidence, not new results. Human offline PASS accepted from user report. Independent read-only Validator found no actionable contradictions or omissions; final document checks passed.

## Backup / commit checkpoint
Startup local HEAD == saved origin/main == freshly queried GitHub main: `1b4cd43dc3f8861f67dc876dc1adab458d9a4000`; clean. No initial push. Latest validated milestone content commit: `bd93b7aca83c9c017c59971a7dd6e79693154185`; final checkpoint hash and remote equality reported in task closeout. Do not rely on an old hash as current HEAD; inspect Git once on resumption.

## Progress / Cost Gate
No calls, purchases, outreach, integrations or provider reconfiguration. Additional provider spend $0.00; balance/current rate not checked. Consumed `.cache/retell-acceptance/demo-creation-attempt.json` allowance preserved; `--serve` remains blocked. One read-only Validator, no swarm/provider research. Stop/re-scope on two unsuccessful focused attempts, two usage-cap hits, two substantial runs without validated progress, implausible target, deteriorating cost/evidence or a cheaper decisive experiment. Any final-attempt exception requires changed conditions, bounded budget and stop rule. Future test/pilot budget requires explicit authorization; historical demo caps do not authorize production usage.

## Exact next action / next milestone
Stop here. In a fresh task, recommend **AWC — First-Pilot Prospect Qualification & Outreach Preparation**. Read this state and the outreach gate, record owner's scope/pricing-structure/capacity decision, then prepare a narrow qualification checklist and reviewable outreach materials. Do not send messages, spend, buy a number or implement production integrations automatically.
