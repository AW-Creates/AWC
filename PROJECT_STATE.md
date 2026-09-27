# AWC Project State

Updated: 2026-09-26. Canonical repo: C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC, main.

## Objective / current milestone
AWC agency/portfolio; revenue and live lead pipeline remain unproven.
**AWC — Retell Managed Realtime Voice Acceptance: IN PROGRESS, waiting for human tester readiness.**
Retell live auth and temporary agent setup PASS; 26 focused tests PASS with official SDK 6.0.1. Zero browser calls, zero seconds, $0 call usage. Dashboard $10.00 credit, recharge OFF, configured $0.108/min. Human consent recorded, tester not ready yet. Callback/tunnel stopped at waiting checkpoint. Voice acceptance unmeasured; no demo-ready claim. See docs/voice-retell/ACCEPTANCE.md.

## Preserved closed acceptance
**Realtime Voice Acceptance: CLOSED — FAILED / NOT DEMO-READY.** First rendered audio 9.780s normal / 7.426s replacement; CPU TTS is dominant. Preserve 28/28 regressions, 19/19 browser checks, Whisper 45/45 normalized fixture words, matching chunks across 11 completed responses. Human natural-mic/listening and physical sentence completion unresolved. Matched Pipecat/LiveKit remains unproven. Do not repeat CPU tuning or old benchmarks.
Evidence: docs/voice-realtime/ACCEPTANCE.md; docs/voice-realtime/evidence/browser-closeout.json and regressions-closeout.json. Previous fixes/evidence commit 4d8bc9204570be05332e31027afe2ec4df9308c8; previous state 1d5252a. Prior recording was silent; future acceptance must verify actual audio export/playback.

## Locked decisions / architecture
Retell FIRST managed control; replaceable speech/recognition/turn-taking/tool transport. AWC owns profile/FAQs, deterministic quotes, booking conflicts and local approval, handoff/context and summary/outcome. Existing local business implementation preserved. Single synthetic caller, local mock bookings/handoffs; no real calendar or person contacted. Existing local app stays private. Authenticating the dedicated callback is mandatory before any future public tunnel.

## Permanent Progress / Cost Gate
Adopted in docs/workflow/WORKFLOW-v3.2-README.md and sibling _venture-ops/WORKFLOW-v3.2-README.md for all current/future ventures. Trigger on two failed focused attempts, two usage-cap hits, two substantial runs without material validated progress, implausible tuning gap, deteriorating evidence/cost, or a cheaper decisive benchmark. Stop broad work, preserve evidence, identify dominant blocker, choose fail/switch/narrow/minimum credential, update state and efficiency rationale. At most one documented high-confidence bounded final attempt; no chained exceptions. Usage reset is never automatic justification to resume an approach. Existing workflow gates preserved.
Efficiency rationale: reuse closed evidence and local safety code, one narrow architect plus one builder, official Retell docs only, offline contracts, no new CPU benchmark or multi-provider survey. Exact historical cap hits/token totals unknown. This policy is not an installed background usage monitor.

## Relevant deliverables
- docs/voice-retell/PREPARATION.md: official review, ownership boundaries, account gate, bounded acceptance script.
- experiments/receptionist/retell_adapter.py and test_retell_adapter.py: isolated callback/tool boundary and offline contracts.
- scripts/voice-demo/retell_control.py: bounded offline preflight/operator harness.
- experiments/receptionist/retell.env.example and requirements-retell.txt: names-only configuration and optional official signature SDK dependency.
- Canonical venture mirror: ../_venture-ops/AWC-RETELL-PREPARATION.md (outside this Git repo).

## Live setup checkpoint
Credentials configured in ignored root .env; never print. Live agent-list auth and call-list schema PASS. One temporary BrightHome agent/response engine exists; IDs and expired tunnel URL only in ignored .cache/retell-acceptance/setup.json. Official retell-sdk==6.0.1 pinned; real SDK tests added in test_retell_sdk.py. Prepared verifier was already correct (instance attribute). Signed wrong-call public probe 403; unsigned callbacks 401; /approve 404. Provider-origin signature still pending live call. Temporary callback/tunnel stopped; no open local 8766/20241 listeners observed. Recording enabled with explicit tester consent. All voice and live business results remain unmeasured.

## Spending / acceptance limits
NEXT authorized benchmark: three sequential browser sessions max, <=120s each, configured all-in rate <=$0.50/min, <=$3 total credit consumption, no auto reload/retry/recharge. Never exceed $5 without explicit approval; $3 initial cap remains binding. Reconcile actual cost after each call before another; stop if unknown. Hard 30-minute session including review. Provider duration limit and operator control required; offline preparation cannot enforce account-wide spend.
First audible <=1.5s; normal and replacement ~1–2s; natural interruption/recognition, no truncation, 100% tested quote/booking/handoff safety. Physical human-mic/listening and verified audio evidence required; no metric/event proxy pass.

## Deferred / next milestone
Vapi, direct ElevenLabs, Bland, Firebase, Cloud Run, GPU hosting, CPU retuning, framework comparison, PSTN, production/concurrency/security rollout remain deferred. Marketing source unchanged; provenance docs/RED_SOURCE_MIGRATION.md.
**Exact next action:** wait for tester readiness, then resume THIS same bounded Retell acceptance milestone. Restart isolated callback/tunnel, update the existing temporary agent functions/webhook to new URL, verify webhook-key designation and exact call arming, run first <=120s browser test, reconcile actual cost and human listening observations. Do not create another agent or start another provider. Next milestone recommendation remains deferred until acceptance evidence.

## Validation / latest validated commit
Director validation: 12 adapter contract/security tests + 9 existing business/safety tests PASS (21 combined). Fixed stale read/quote caching and root .env loading. No secrets or generated artifacts added. Official retell-sdk absent: fake verifier contract/fail-closed tested; actual SDK signature verification is mandatory before future public exposure. Human listening/live provider acceptance unmeasured. See docs/voice-retell/PREPARATION.md closeout. Validated implementation commit: b45f147bc3868392223a99957b5cad0559ba02ac. Secret-pattern scan of tracked/candidate files: no findings; root .env ignored. Both workflow copies match. Venture closeout records updated externally and snapshotted under docs/voice-retell. Exact next action remains user account/key setup only; STOP.

Live preflight checkpoint: 26 tests PASS (5 genuine SDK crypto + prior 21). Milestone remains unfinished pending human readiness. No live latency/listening/speech or business acceptance verdict; temporary services stopped. See ACCEPTANCE.md for ledger and resume details.
