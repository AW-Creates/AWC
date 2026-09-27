# AWC Project State

Updated: 2026-09-26. Canonical repo: C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC, main.

## Objective / current milestone
AWC agency/portfolio; revenue and live lead pipeline remain unproven.
**AWC — Managed Realtime Voice Control Preparation + Progress/Cost Gate: OFFLINE PREPARATION COMPLETE. STOP at Retell credential gate.**
Retell managed acceptance is unmeasured; no demo-ready claim. No external account, call, spending or public exposure performed.

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

## Exact credential/account gate
Create only Retell account at https://dashboard.retellai.com/. Confirm eligible $10 trial balance and auto recharge OFF. Settings → API Keys → Add; save RETELL_API_KEY in ignored AWC/.env or server environment, never chat/Git. Designate webhook key; use RETELL_WEBHOOK_API_KEY only if separate. New eligible trial accounts can test before adding payment method; stop if trial unavailable/card unexpectedly required. No phone number needed: dashboard browser testing.
Next task supplies dedicated fictional RETELL_AGENT_ID and temporary RETELL_PUBLIC_BASE_URL and verifies optional official SDK/signatures. No public endpoint exists yet. No other platform account requested. Existing ignored OpenAI access remains untouched.

## Spending / acceptance limits
NEXT authorized benchmark: three sequential browser sessions max, <=120s each, configured all-in rate <=$0.50/min, <=$3 total credit consumption, no auto reload/retry/recharge. Never exceed $5 without explicit approval; $3 initial cap remains binding. Reconcile actual cost after each call before another; stop if unknown. Hard 30-minute session including review. Provider duration limit and operator control required; offline preparation cannot enforce account-wide spend.
First audible <=1.5s; normal and replacement ~1–2s; natural interruption/recognition, no truncation, 100% tested quote/booking/handoff safety. Physical human-mic/listening and verified audio evidence required; no metric/event proxy pass.

## Deferred / next milestone
Vapi, direct ElevenLabs, Bland, Firebase, Cloud Run, GPU hosting, CPU retuning, framework comparison, PSTN, production/concurrency/security rollout remain deferred. Marketing source unchanged; provenance docs/RED_SOURCE_MIGRATION.md.
**Exact next action:** user provides Retell credential locally; then start a fresh authorized **AWC — Retell Managed Realtime Voice Acceptance** task, read this state and preparation only, configure the dedicated agent/callback and run the capped script. Do not start live work in this preparation task.

## Validation / latest validated commit
Director validation: 12 adapter contract/security tests + 9 existing business/safety tests PASS (21 combined). Fixed stale read/quote caching and root .env loading. No secrets or generated artifacts added. Official retell-sdk absent: fake verifier contract/fail-closed tested; actual SDK signature verification is mandatory before future public exposure. Human listening/live provider acceptance unmeasured. See docs/voice-retell/PREPARATION.md closeout. Validated implementation commit: b45f147bc3868392223a99957b5cad0559ba02ac. Secret-pattern scan of tracked/candidate files: no findings; root .env ignored. Both workflow copies match. Venture closeout records updated externally and snapshotted under docs/voice-retell. Exact next action remains user account/key setup only; STOP.
