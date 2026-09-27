# AWC Retell Managed Realtime Voice Acceptance

Status: **PASS — bounded managed-control acceptance**, closed 2026-09-27.
Scope: one fictional BrightHome caller, AWC-owned business tools and local mock booking. Not production approval or a full latency/interruptions benchmark.

## Completed session ledger

| Session | Provider duration | Billed duration | Actual cost | Result |
| --- | ---: | ---: | ---: | --- |
| Call 1 | 103.602 s | 104 s | $0.207653368 | Natural voice; all six business-tool requests failed DNS |
| Call 2 | 113.802 s | 114 s | $0.225620038 | Insurance, $225 quote, availability, locally approved booking, summary succeeded |
| Total | 217.404 s | 218 s | $0.433273406 | Two completed calls; no further session |

Costs are the provider combined_cost in cents divided by 100, including each record's 2.08-cent text-testing line item; no components omitted. Call 1 was freshly retrieved from Retell and matched saved evidence. Call 2 saved after ended. Cost units: https://community.retellai.com/t/combined-cost-from-end-call/2408/5 . Provider records show user_hangup. Browser safety stop was 115 seconds; provider authoritative durations above supersede approximate browser elapsed time. Both under the 120-second hard limit and combined spend below $3 initial / $5 absolute caps. No phone number, payment changes, or other provider work.

## Call 1 failure layer and one focused repair

Six invocations: get_quote twice, get_availability, get_business_info (insurance), get_summary_outcome twice. Every result: ENOTFOUND for options-hebrew-uncertainty-accompanying.trycloudflare.com. These requests failed before HTTP dispatch, so none of the six live function requests reached AWC. There was no prepare_booking invocation: availability failed upstream. Tools and instructions were attached; insurance lookup was requested correctly. No evidence supports signature rejection, schema mismatch, or business rejection as Call 1's cause.

At resume the live agent already referenced a different inactive tunnel, tucson-sensors-surfaces-listed.trycloudflare.com. Thus Call 1's captured configuration and later live configuration differed; the exact timing of that earlier change is not established. Historical local callback/tunnel logs were not persisted in the acceptance cache; receipt conclusions rely on explicit provider DNS errors, not guessed local logs.

Repair: started one authenticated isolated callback and fresh tunnel, sent signed synthetic insurance/quote/availability probes through public HTTPS (all 200 with AWC answers), updated all eight existing temporary-agent function URLs plus webhook to that tunnel, read them back, and verified 120000 ms cap and zero function retries. Initial update using retrieved response objects was rejected because optional headers were null; the same repair used the existing configuration() request schema successfully. No business logic, insurance claims, or safeguards changed. Insurance remains the existing fictional BrightHome fixture, not a claim about a real business.

Call 2 was justified only after public probes, configuration read-back, and 26 passing offline tests. A new session was created after configuration refresh, exact call ID armed, and the existing one-shot browser harness served it. Chrome was operated by the user because Chrome was not connected to browser control. Old page label said Call 1; it served the separate Call 2 record. Never reuse cached session tokens after changing tunnel URLs.

## Call 2 evidence / safety

Seven function invocations and seven successful provider results: insurance; quote; availability; two booking proposals (caller added name); confirmation; summary. Real signed provider requests reached AWC and passed its existing signature and exact call/agent checks. Live quote was exactly $225 for three-bedroom deep cleaning. Insurance answer came from AWC get_business_info, not a prompt assertion.

User explicitly approved the precise local proposal in Codex: Adrian, 2026-10-01 10:00, review eecce38374b94030b44b74482eb7d1d4. Local stdin approval committed confirmation DEMO-07c58383. The agent subsequently retrieved confirm_booking ok=true and spoke that confirmation. No booking was committed on spoken consent alone. Summary retained authoritative quote, booking, and conversation context. Agent's offer to request approval followed by admitting it could not is minor wording friction; it did not bypass approval.

Post-repair offline/provider contracts: **26/26 PASS** across test_retell_adapter, test_retell_sdk, test_app, test_safety. Covers deterministic truth, genuine SDK signatures, invalid identity/arguments, stale/forged approvals, conflict rejection, duplicate behavior, lifecycle and handoff context. Signed public synthetic insurance/quote/availability probes also passed. Conflict and handoff were not exercised live in Call 2; optional conflict omitted to stay bounded. No claim of a complete live safety stress test.

## Human listening / remaining limits

Call 1: voice pretty good and difficult to distinguish from AI. Quote, booking, insurance unavailable. No specific interruption or latency rating captured.
Call 2: user said MUCH better, realistic except pronouncing the date as October one instead of October 1st; heard insurance and $225 estimate; response delays much more natural. Transcript explicitly records spoken booking confirmation and caller thanks for confirming it. Interruption quality not separately graded. Provider e2e reports 870 ms but only one sample; this does not establish all turn latency or the original first-audio/replacement targets. No new exported-audio playback verification was performed; acceptance listening evidence is the actual human live call. These broader performance/media checks remain unclaimed.

## Closeout / exact next action

STOP: one focused integration repair and one decisive additional call completed. Callback, tunnel, browser server stopped; no listeners on 8766, 8767, 20241 observed. Temporary Retell configuration retains an inactive tunnel URL; do not start another call from it. Private provider records remain ignored under .cache/retell-acceptance; sanitized committed evidence is CALL-EVIDENCE.json. Existing browser harness from the interrupted task is preserved and committed after review and successful live use.

Next narrow milestone recommendation: a fresh, separately scoped demo-readiness task for date pronunciation and automatic callback/configuration preflight before session creation. No additional provider benchmark or live call is authorized by this closeout. Production, real calendars, concurrency, and rigorous interruption/latency acceptance remain deferred. Prior CPU voice failure remains closed.
