# AWC Project State

Updated: 2026-09-27. Canonical repo: C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC, main.

## Current milestone
AWC — Retell Demo Polish & Readiness: CLOSED PASS. Final user listening feedback recorded; bounded identity polish completed. Stop at closeout.

## Validated state
47 focused offline tests PASS, retaining the original 39 tests including all 26 existing adapter/SDK/app/business-safety tests. Natural ordinal dates and AM/PM remain presentation-only; ISO appointment values unchanged. Genuine signed callback reached AWC. Eight stale tool URLs plus webhook automatically refreshed and independently verified from Retell. Immediate pre-call readiness rerun PASS. Legacy cached-session bypass disabled; one-shot disk reservation blocks retry after ambiguous creation.

## Final human acceptance
Interruption/barge-in worked very well; replacement/carryover had no noticeable issue; date pronunciation sounded natural; latency was great; no sentence truncation/carryover noticed. The transcript still ends mid-proposal near cutoff; preserve that artifact observation alongside the human verdict.

## Final session / cost gate
Final session 113.201 seconds, actual combined cost $0.225620038, below $0.30 target/$0.50 cap. Six live function results succeeded; standard three-bedroom quote $145. Unauthorized/stale booking confirmation rejected; no booking committed. No new live call or paid text test for identity closeout; additional call spend $0.00. Preserve demo-creation-attempt.json; never reset to bypass the one-call limit.

## Identity polish
Separate configurable RETELL_AGENT_NAME=Ava and RETELL_BUSINESS_NAME=BrightHome. Name questions identify Ava; company questions identify BrightHome; greeting names both and retains fictional-demo disclosure. Existing temporary Retell prompt and fixed greeting synced and freshly read back without creating a call. Business/date instructions, model/voice, tools and safety gates preserved. Offline/config verification is not a new live audio/model-response acceptance test.

## Known minor polish debt
Timing/state-review messaging: caller heard slot unavailable followed by a new offer. Actual tool error was Missing, expired or stale review; changed-turn freshness can cause it. Rejection about 44 seconds after proposal does not prove 60-second TTL expiry or slot unavailability. Safety held. Clarify review-expiry versus slot-unavailability and avoid confusing re-offer wording in the next separately scoped demo milestone; no booking logic changes needed on current evidence.

## Runtime / evidence / relevant files
Runtime and tunnel were stopped after final call; closeout starts neither. Saved callback URLs are inactive and must be refreshed by readiness before future authorized sessions.
docs/voice-retell/DEMO-READINESS.md and DEMO-EVIDENCE.json contain acceptance evidence. Private provider records, secrets and media remain ignored/outside Git.
experiments/receptionist/retell_adapter.py and its tests hold identity configuration; scripts/voice-demo/retell_demo.py and test_retell_demo.py hold explicit non-call identity sync. retell.env.example documents identity fields. Readiness and business safety remain unchanged.

## Locked decisions / history
Retell is temporary fictional single-caller demo voice. AWC owns FAQs, deterministic quote, approval, booking conflicts, handoff and summary. Speech cannot approve bookings. Final test exposes no approval UI; no real calendar/customer contact. Managed business-flow milestone CLOSED PASS at 2cdef4100c78bb979f8fb60b9fe9c76ca80a70c5. Local CPU milestone FAILED; do not reopen provider benchmarking.
Validated polish/evidence commits: 50562a9, e758f0a, 927b027. Latest validated implementation commit: bd76513 (identity fix; 47 tests PASS and saved Retell identity readback PASS). This documentation closeout follows it; resolve its hash using git log -1 or the task final report.

## Exact next action / next milestone
No remaining closeout work after committing this validated state and confirming clean Git status. Stop. Recommendation: **AWC — Demo Presentation & Operator Runbook**, in a fresh task when requested. No automatic production telephony, outreach, ads, CRM integration or additional provider work.
