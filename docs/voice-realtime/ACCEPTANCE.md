# Realtime Voice Acceptance — final closeout

2026-09-26. **CLOSED: FAILED / NOT DEMO-READY. STOP.** This closes the evaluation with a failed acceptance outcome, not a production approval. Primary bottleneck: local CPU speech synthesis latency. No more Kokoro/Chatterbox tuning on this CPU.

## Final measured run

19/19 browser checks passed; zero browser errors. This is a functional test pass, not a realtime acceptance pass. Browser clocks only; rendered WebAudio energy is a first-audio proxy, not calibrated physical speaker audibility. One sample per spoken scenario; no population percentile claim.

| Fictional fixture | First partial from start | Final transcript from end | Decision from end | Audio-start event from end | First rendered audio from end |
|---|---:|---:|---:|---:|---:|
| human-barge-in | 1.033s | 1.488s | 1.490s | 7.248s | 7.426s |
| faq | 0.713s | 1.549s | 1.553s | 9.571s | 9.780s |
| estimate | 0.804s | 1.480s | 1.574s | 11.778s | 11.971s |

Estimate includes the automated review/confirmation click. Normal FAQ turn: 9.780s versus ~1–2s target. Interruption/replacement: 7.426s versus ~1–2s target. First-audio <=1.5s fails. Decision-to-rendered delay is 8.227s for FAQ and 5.937s for replacement. Browser detection-to-mute command: 0.20ms; physical speaker stop unmeasured. Typed turn request-to-rendered values range 3.853–15.711s, including immediate confirmation for sensitive actions; not a human decision-time benchmark.

## Speech quality and safety

- Sentence truncation: **unresolved for physical microphone/listening acceptance**. No planned/sent chunk loss in 11 completed browser responses, including uninterrupted greeting, FAQ, and both quote sentences. Brief 80ms noise did not cancel speech; deliberate interruption worked. Scheduled completion does not prove the physical output contained every word. Earlier user truncation evidence remains open.
- Natural-paced STT: preserved five synthetic fixtures recovered 45/45 normalized words at 193–251 WPM with cached Whisper, versus preserved streaming WER 33.3%. Final browser run recovered the complete human-follow-up, FAQ and hyphenated estimate fixture transcripts. **Ordinary human-mic speech acceptance still required**; earlier missed-word/over-enunciation feedback is not marked passed.
- Business regression: 28/28 tests passed after the normalization fix (2.262s); not repeated after harness-only changes. Includes 40/40 deterministic quote configurations, conflict/context checks, zero hallucinated prices and zero unapproved bookings in tested cases. Browser confirms $225 quote, authorized booking, conflict rejection, retained sales context and no mutation from unconfirmed second booking. These are bounded deterministic cases, not arbitrary-language guarantees.
- Preserved fixes: sustained-noise interruption gate, duplicate interruption suppression, stale confirmation/finalizer invalidation, sentence synthesis telemetry, cached whole-utterance correction, aligned hyphenated bedroom parsing/preview. The closeout corrected a harness wait that selected the superseded review prompt rather than the confirmed transcript response; failed capture remains in sibling `closeout/`.

## Unmeasured/deferred

Pipecat versus LiveKit matched real-audio framework/agent comparison remains **unproven**. Existing 20-pulse local round trips compare different topologies only; no winner is selected. Managed control remains **unmeasured/deferred**: saved authentication HTTP 200, but generation failed with `billing_not_active`, zero completed responses. No billing change or new API request made here. Existing Kokoro ~2.2–5.2s short-phrase start and Chatterbox ~34s generation for 1.32s output rule out further CPU tuning.

## Artifacts and validation

- `evidence/browser-closeout.json`: final checks, clock metrics, complete sentence-chunk lists, source path/SHA-256.
- `evidence/regressions-closeout.json`: final 28-test result. Earlier benchmark evidence retained unchanged.
- External final artifacts: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_venture-ops/media/awc-voice-realtime-2026-09-26/closeout-final` — `revalidation.json`, `conversation-screen.webm`, nine named checkpoint stages (some repeated stage numbers), and `verified/verification.json` with playback screenshots.
- Screen video: 227.68s, full decode and advancing browser playback pass; SHA-256 `2abe92f49119cf86436824b746642376faca5ed522aa4c266c37b8e36fcf0c40`. Director inspected FAQ, middle and end imagery. Existing heading/separator encoding artifacts remain cosmetic limitations.
- **Mixed-audio file was not exported**: harness checked `window.recorded`, while the page declares lexical `recorded`. Screen video has no audio track. No acoustic listening/completion pass is claimed; do not present this capture as an audible demo. Capture export correction is deferred to the next bounded control run, not another acceptance benchmark here.
- Python/browser-script syntax checks passed. Read-only Validator found no blocking defect for failed closeout; local/single-caller and physical-audio limits retained. No media, secrets, models, caches or environments are included in the commit.

## Exact next narrow milestone

**AWC — Managed Realtime Voice Control Acceptance.** Start only in a fresh authorized task. First resolve the existing managed billing/access blocker with an explicit small spending cap. Reuse the already wired control and the same fictional scenarios; measure first audio, normal and replacement turns, then perform one human-microphone/listening acceptance run with verified audio export. Preserve the deterministic tools and confirmation gates. Pass only at <=1.5s first audio, ~1–2s normal/replacement turns, natural speech, complete sentences and the same business safety targets. Otherwise fail decisively. Do not expand into framework migration, matched transport research, PSTN, production, or outreach. No next milestone started.
