# AWC Project State

Updated: 2026-09-26. Canonical repo: C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC, main.

## Objective / current milestone
AWC agency/portfolio; revenue and live lead pipeline remain unproven.
**AWC — Realtime Voice Acceptance: CLOSED, FAILED / NOT DEMO-READY. STOP.**
The bounded evaluation is closed with failed acceptance, not a successful realtime implementation. Earlier architecture bake-off remains closed. No further local CPU tuning or automatic next milestone.

## Final acceptance evidence
- Normal spoken FAQ: first partial 0.713s from fixture start; final 1.549s, decision 1.553s, audio-start event 9.571s, rendered audio 9.780s from fixture end.
- Interruption/replacement: first partial 1.033s from start; final 1.488s, decision 1.490s, audio-start event 7.248s, rendered audio 7.426s from end. Detection-to-browser-mute 0.20ms, not physical speaker stop.
- Spoken estimate: final 1.480s, decision 1.574s, rendered audio 11.971s from end, including automated exact confirmation. First audio <=1.5s and normal/replacement ~1–2s targets FAIL.
- Primary bottleneck: local CPU TTS; decision-to-rendered 8.227s FAQ / 5.937s replacement. Preserve prior Kokoro ~2.2–5.2s short-phrase starts and Chatterbox ~34s generation for 1.32s audio; do not retune this CPU.
- 19/19 final browser checks pass, zero browser errors. 11 completed responses have matching planned/sent sentence chunks. Brief noise no longer cancels speech; deliberate interruption succeeds.
- Sentence truncation: no scheduled chunk loss in uninterrupted automated turns; **physical audible completion unresolved**. Earlier user's incomplete-sentence feedback remains open.
- Natural-paced STT: preserved Whisper correction 45/45 normalized fixture words at 193–251 WPM versus preserved streaming 33.3% WER. Final browser human-follow-up, FAQ and hyphenated estimate transcripts complete. **Human-microphone natural speech still required**; prior missed words/over-enunciation feedback not marked passed.
- Final regression 28/28 passes after phrase fix; 40 deterministic quote configurations, conflict and handoff context, zero hallucinated prices/unapproved bookings in tested cases. Browser $225 quote, conflict rejection and exact confirmation checks pass. No arbitrary-language guarantee.

## Delivered fixes / architecture
Single-caller loopback laboratory: Pipecat SmallWebRTC, Sherpa streaming partials, cached Whisper base.en final correction, sentence-chunked Kokoro CPU, deterministic local tools. Sustained-energy interruption gate, stale confirmation/finalizer invalidation and complete chunk telemetry retained. Hyphenated bedroom parsing aligned in business and preview; tests added. Browser harness now waits for the confirmed transcript response instead of the superseded review prompt. Local mock booking/handoff only; no actual person contacted.

## Evidence / run instructions
- docs/voice-realtime/ACCEPTANCE.md: final decision, full timing definitions, artifacts, limitations and next action.
- docs/voice-realtime/evidence/browser-closeout.json and regressions-closeout.json: 19 browser checks / 28 tests; source hash and raw artifact location.
- docs/voice-realtime/README.md: existing environment/runtime instructions. Prior component, ASR, managed and transport evidence retained; do not restart benchmarks.
- External artifacts: ../_venture-ops/media/awc-voice-realtime-2026-09-26/closeout-final/revalidation.json, conversation-screen.webm, checkpoint PNGs and verified/verification.json.
- 227.68s silent video full-decode/playback pass; Director visual sampling completed. SHA-256 2abe92f49119cf86436824b746642376faca5ed522aa4c266c37b8e36fcf0c40.
- Mixed audio was NOT exported (harness uses window.recorded versus lexical recorded). No acoustic completion claim; correct/verify export in next control run. UI heading/separator encoding artifacts remain cosmetic limitations.
- Both docs/workflow/EXPERIMENT_LOG.md and sibling _venture-ops/EXPERIMENT_LOG.md updated. External venture log/media are outside this Git repo.

## Deferred / access constraints
Matched Pipecat vs LiveKit real-audio framework/agent benchmark remains unproven; existing pulse tests have differing topologies, no winner. Managed control has zero completed generations: saved authentication HTTP 200 but billing_not_active. No new managed call/billing change here. WAN/NAT, concurrency, PSTN, human acoustics/listening and production security/capacity unaccepted. No secrets/media/models/caches/envs in Git. No production rollout, outreach, marketing redesign or spending authorized by this closeout.

## Preserved canonical site
Marketing source unchanged. Prior source SHA-256 941f908cfefcfe2d1a9e47a15af44210ed2ce247fb7b68d56e617d3ed3bb46a3; provenance docs/RED_SOURCE_MIGRATION.md. Prior architecture bake-off docs/voice-bakeoff/BENCHMARK.md; previous closeout 8c15bda.

## Latest validated commit
Realtime fixes/tests, preserved interrupted evidence and failed-acceptance closeout: 4d8bc9204570be05332e31027afe2ec4df9308c8.
This compact state is committed separately immediately afterward; git log -1 identifies its documentation commit.

## Exact next action / single recommended milestone
STOP. In a fresh authorized **AWC — Managed Realtime Voice Control Acceptance** task, first resolve billing/access with an explicit small spending cap. Reuse the existing wired control and fictional scenarios; measure first audio, normal and replacement latency, then one natural human-mic/listening test with verified audio export. Retain deterministic business/confirmation checks and current latency targets. Fail decisively if unmet. Do not expand to CPU TTS tuning, framework migration, matched transport research, PSTN or production. No next milestone started.
