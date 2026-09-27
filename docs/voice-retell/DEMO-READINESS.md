# Retell Demo Polish & Readiness

Status: IN PROGRESS â€” 2026-09-27. Baseline: 2cdef4100c78bb979f8fb60b9fe9c76ca80a70c5.

## Scope and Progress / Cost Gate
Preserve passed managed business-flow acceptance. This milestone addresses only callback readiness, presentation-only spoken dates/times, and one human interruption test. No provider research, production rollout, phone purchases, payment changes, or unrelated suites.

Startup gate: previous dominant failure (expired tunnel) was resolved manually and Call 2 passed. Automating that proven repair and testing the one unmeasured behavior provides new decisive evidence; this is not a retry of CPU tuning or failed provider research. Historical usage-cap counts remain unknown. Stop if the same blocker survives two focused attempts; do not chain exceptions.

Maximum one additional live browser session, provider cap 120 seconds, browser safety stop 115 seconds. Additional spend target <= $0.30; absolute cap <= $0.50 without explicit approval. Preserve temporary agent/model/voice; inspect current rate and settings before creation. Retrieve actual provider duration and combined cost after the call. No repeat unless a separately documented Progress / Cost Gate decision identifies a single fixable issue and remaining budget.

## Acceptance
- Fail closed before creating or serving a managed session if DNS, expected health, signed callback probe, or configured callback URLs fail readiness.
- Safely refresh only the existing temporary agent's stale callback URLs and verify read-back.
- Keep authoritative date/slot values unchanged; add natural spoken month/day ordinals and unambiguous appointment times.
- Pass focused readiness/rendering tests and quote/booking/signature/handoff smoke tests.
- Human hears clean interruption, natural replacement without old speech carryover, natural date/time and acceptable latency.

## Live test script
Greet, ask hours, interrupt mid-answer with an insurance question, then ask for the first available appointment including its date and time. End once those answers are heard, preferably within 60â€“90 seconds and always before 120 seconds. Optional $225 quote only if time remains. No booking needed to answer this milestone's unresolved question.

## Pending evidence
Readiness result, focused test count, actual call duration/cost, human listening verdict, sanitized transcript/tool evidence, final decision and exact next action will be recorded here. Missing human evidence cannot be marked PASS. Media, if captured, belongs outside Git and log paths.

## Pre-session account check
Director read current Retell dashboard: temporary AWC Retell Acceptance TEMP agent, GPT 4.1 mini / Adrian, displayed rate $0.108 per minute. Billing shows $9.57 trial balance, 0/20 active concurrency, Auto recharge disabled, Add Payment available. No account settings changed. At 120 seconds the displayed voice rate plus previous $0.0208 fixed text-testing charge implies approximately $0.2368; actual cost must still be retrieved after the call.


## Validated continuation checkpoint (2026-09-27 21:18 UTC)
Status: IMPLEMENTATION VALIDATED; HUMAN LIVE TEST PENDING. Not milestone PASS.

Progress / Cost Gate: one known interrupted usage-cap run; no repeated research/setup. Resume reviewed the concrete unfinished implementation. One nonbillable updater failure exposed SDK null serialization; omit unset fields fixed it on the single focused retry. No recurring blocker remains. No live session created at checkpoint; additional spend $0.00.

### Readiness result
PASS through active public tunnel: DNS, expected semantic AWC health JSON, genuine SDK-signed get_availability accepted by the existing signature and call/agent identity boundary, authoritative ISO slots plus spoken October first result, all eight exact named tool URLs and webhook freshly read from Retell. Stale saved URLs detected, automatically refreshed on the same temporary agent/LLM, and independently read back. No model or voice change. Dashboard currently labels voice Kathrine and rate $0.108/min; earlier Adrian label was not used to change configuration.

Runtime: scripts/voice-demo/retell_demo.py starts local callbacks, checks readiness before exposing the browser page, and repeats readiness immediately before provider session creation on Start. scripts/voice-demo/retell_browser.py blocks legacy cached sessions. Exclusive ignored attempt ledger is reserved before creation; ambiguous creation failures cannot trigger an automatic retry. Provider cap remains 120 seconds, browser cutoff 115 seconds. No booking approval interface is exposed by this narrow final-test runtime.

### Focused validation
39 tests PASS: 8 readiness/spoken + 5 runtime integration + 26 existing adapter/SDK/app/business-safety tests. Includes stale/missing/extra/wrong-path URLs, refresh and fresh readback, bad health/DNS/signature/provider responses, creation blocked on failure, uncertain creation no-retry, real SDK probe signature, ISO-slot preservation, deterministic $225 quote, approval/conflict/handoff safety. Nine app/safety tests initially needed filesystem permission for ignored fixture outputs, then passed without code changes.

Presentation-only ordinal date rendering and unambiguous AM/PM were retained. Availability, proposal and confirmed booking responses include spoken values; stored business slot values remain ISO. Fixed confirmed-response cache to retain spoken_slot. Existing agent prompt now explicitly says to speak spoken_slots/spoken_slot and preserve ISO tool arguments; saved and read back.

### Human test / costs
Not run at checkpoint. Duration/cost: N/A / $0.00 additional. Barge-in, replacement carryover, live date pronunciation, latency and truncation verdicts remain pending. Human acceptance is required before PASS. Browser automation was blocked by an open Brave extension UI; user can open http://127.0.0.1:8767/ and press Start final demo test. Do not start a duplicate session. Ask the five requested listening questions after the call.

### Evidence and exact next action
Ignored evidence: .cache/retell-acceptance/demo-readiness.json, demo-server.stdout.log, demo-server.stderr.log, demo-tunnel.stderr.log. Future single attempt/session: demo-creation-attempt.json and demo-session-private.json. Credentials, tokens, media and provider records must stay outside Git.

Runtime at checkpoint: tunnel PID 25292; launcher PID 13288 (verify current owning process before stopping). Ports 8766/8767 and tunnel metrics 20241. Active tunnel generated-closely-chevy-parks.trycloudflare.com. Runtime readiness expires with tunnel/process; never trust this document instead of a fresh preflight.

Next action: user performs ONE final browser test, then retrieve authoritative provider duration and combined_cost, collect the five human listening verdicts, stop these runtime processes, sanitize evidence, decide PASS/FAIL, update state and commit closeout. No new milestone started. Proposed next milestone only after PASS: a bounded demo presentation and operator runbook; no outreach, telephony or integrations without separate scope.

## Final live session completed — supersedes pre-call checkpoint
Call call_2e8a11645dbcdc24ced0728a840 ended normally (provider user_hangup), 113.201 seconds. Authoritative combined_cost 22.5620038 cents = $0.225620038, including all cost components. One session only; below $0.30 target and $0.50 hard cap. No retry authorized or scheduled.

Readiness reran immediately before creation and passed with refreshed=false, confirming the previously repaired URLs were still current. Six live function results succeeded: insurance, availability, proposal, deterministic standard three-bedroom $145 quote, rejected stale confirmation, replacement proposal. No booking committed. $225 remains the deep-clean price, tested offline; this call requested general three-bedroom cleaning and the tool selected standard. Spoken date appears repeatedly as October first, 2026 at 10 o'clock AM. Stored slot stayed 2026-10-01 10:00.

Transcript contains several interruptions but cannot prove audible stop/carryover quality. It ends during the final proposal sentence near the browser safety cutoff; this is explicitly recorded, not hidden. Provider user_hangup does not distinguish a manual End from browser cutoff. Human stop/replacement/pronunciation/latency/truncation verdicts have been requested and remain pending. Overall milestone is NOT PASSED while that evidence is missing.

Sanitized evidence: docs/voice-retell/DEMO-EVIDENCE.json. Private provider record: .cache/retell-acceptance/demo-result-private.json. Runtime and tunnel were stopped after the call; no listeners on 8766/8767/20241 remained. Temporary agent retains the now-inactive tunnel; future creation must refresh through readiness again.

Exact next action: record human feedback, decide PASS or FAIL/narrow, update this report and PROJECT_STATE.md, and commit closeout. Do NOT run another call to fill missing listening evidence. Implementation checkpoint commit: 50562a9.
