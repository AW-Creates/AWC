# Retell Demo Polish & Readiness

Status: PASS — final human feedback received 2026-09-27. Historical checkpoints below are superseded by Final closeout.

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

## Final closeout (2026-09-27)
Final verdict: PASS. The user's final listening evidence completes the existing automated safety and readiness evidence. Earlier pending/not-passed checkpoints above are historical.

### Recorded human listening verdicts
- Interruption/barge-in: worked very well.
- Replacement speech/carryover: no noticeable issue.
- Date pronunciation: sounded natural.
- Latency: great.
- Sentence truncation/carryover: none noticed.

The transcript ending mid-proposal near cutoff remains recorded; the user did not hear sentence truncation. These are different observations, not a reason to discard either evidence source.

### Appointment re-offer classification
Minor timing/state-review UX polish debt, not an evidenced booking correctness defect. The user heard an appointment described as no longer available after a pause, followed by another offer to book it. The actual tool error was "Missing, expired or stale review"; this does not establish that the appointment slot became unavailable. The adapter invalidates reviews on changed user turn as well as missing/mismatched review or 60-second expiry. The recorded confirmation rejection occurred about 44 seconds after the proposal, so elapsed TTL expiry alone is not established. No booking was committed, and unauthorized/stale confirmation remained blocked. Future demo presentation work should clarify review-expiry versus slot-unavailability wording and avoid confusing re-offers; no booking rules are changed in this closeout.

### Existing final session and readiness
Readiness/preflight PASS: genuine signed callback reached AWC, all eight stale tool URLs plus webhook were automatically refreshed and verified from Retell; the immediate pre-call rerun also passed. Six live function results succeeded. Final session: 113.201 seconds; actual combined cost $0.225620038. Existing evidence commits: 50562a9, e758f0a, 927b027. No additional live call or paid text test is authorized by this closeout.

Runtime/tunnel remain stopped. Saved callback URLs are inactive and must pass the existing refresh/readback gate before any future authorized demo. Preserve the exclusive attempt ledger; do not reset it to bypass the one-call limit.

### Identity polish and offline closeout validation
Configurable `RETELL_AGENT_NAME=Ava` and `RETELL_BUSINESS_NAME=BrightHome` keep the individual's name separate from the existing fictional business. The identity instructions answer direct name questions with Ava, company/employer questions with BrightHome, and introduce both in the greeting. The fixed Retell opening message also includes both and retains the fictional-demo disclosure. No human identity claim was introduced.

The explicit identity sync updates only the saved identity prompt section and opening greeting on the existing temporary Retell LLM, preserving existing business/date instructions, tools, model, voice, callback URLs and safety gates. Fresh provider readback verified the saved fields. It creates no session, performs no paid text test and starts no server or tunnel. Existing attempt ledger remains untouched.

Offline validation: 47 focused tests PASS, including the original 39 readiness/rendering/runtime/adapter/SDK/app/business-safety tests and new identity/config-sync regression tests. Tests cover direct-name versus company instructions, configured greeting, separate names without substitution, and the non-call sync contract. This verifies configuration and saved prompt/greeting, not a new sampled audio or model-response test. Another live call was avoided; additional call spend $0.00.

Exact next milestone recommendation: **AWC — Demo Presentation & Operator Runbook**. Start it in a fresh task only when requested. Stop here; no production telephony, outreach, ads, CRM integration or provider expansion.
