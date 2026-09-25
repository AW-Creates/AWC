# Architecture bake-off decision and benchmark

2026-09-24. Director decision: **Pipecat + faster-whisper + Kokoro is the selected initial local experimentation stack**, with deterministic tools and a swappable loopback LLM boundary. This is a provisional build choice, not a measured realtime-performance victory over LiveKit. The bounded evaluation and browser POC are closed; production/realtime acceptance is not achieved.

Why: the selected stack runs locally without service credentials or spend, keeps business rules/data portable, and now completes the actual browser workflow. Kokoro reached working inference while Chatterbox did not during the bounded attempt. Pipecat provides the implemented business pipeline without adding a room server to this demo. LiveKit remains credible for a future WebRTC/PSTN phase; the evidence does not show it slower or worse. Do not adopt either paid platform on these results alone.

## Hardware and exact stack

Intel Core Ultra 7 155U, 12 cores/14 logical processors; 33,785,430,016 bytes RAM (31.47 GiB); Windows build 26200; Intel Graphics reported by CIM. WMI AdapterRAM is not proof of dedicated VRAM. No discrete GPU established or used. Python 3.11.15; full pins in `../../experiments/receptionist/requirements-lock.txt`.

Pipecat 1.11.0 business frame pipeline; FastAPI 0.141.1/Uvicorn 0.53.0 loopback server; browser WebAudio energy VAD (30ms poll, 700ms quiet), MediaRecorder utterance upload and buffered WAV playback; faster-whisper 1.2.1 base.en CPU int8, 4 CPU threads; Kokoro ONNX 0.6.1/v1 int8/af_heart, ONNX Runtime 1.24.4 CPU, 2 intra-op/1 inter-op threads with spinning disabled. Deterministic local language router; optional local OpenAI-compatible adapter is implemented but generative inference unmeasured.

## Tested levels and results

| Candidate / metric | Evidence and result | Classification |
|---|---|---|
| Pipecat vs LiveKit Agents 1.8.3 | Both API smoke checks pass using identical $225 estimate contract. Pipecat processed TextFrame; LiveKit constructed Agent, ChatContext and bound tool. Only Pipecat implemented in final browser POC. | Measured API compatibility; **not matched transport/latency comparison** |
| faster-whisper | Five runs × five clean synthetic clips; per-clip median 633–705ms; synthetic WER 0% on 3 fixtures and 25% on 2 tokenization-sensitive fixtures | Measured offline synthetic loop, not human/accent/noise accuracy |
| Kokoro default session | Per-clip median 2,712–3,622ms for 2.09–3.03s generated speech, n=5 per fixture | Measured offline synthesis; not final thread-capped configuration |
| Chatterbox 0.1.7 | Installed separate environment, torch 2.6 CPU, CUDA false; import/API probes >120s stopped; no generated speech | Inconclusive feasibility, **no quality/performance result** |
| Managed premium (ElevenAgents) | Public pricing/free tier reviewed. User confirms no free account; no API invoked | Documented baseline only |
| First greeting | 6,552ms request→response body; first playing event ~6.94s after browser time origin, which includes page/setup | Measured one browser run; no precise click→audible-sound measurement |
| Six subsequent turns | Request→response body 4,527–12,174ms; median 10,750ms; nearest-rank p95 12,174ms (n=6, not stable population percentile) | Measured browser HTTP timing, excludes user speech and 700ms endpoint wait |
| Spoken estimate / human turn | Server STT 780/707ms; total server audio turn 8,137/9,671ms | Measured final browser pipeline, n=2 |
| Interruption | Two synthetic mic-triggered pauses followed by correct replacement audio; cancellation→replacement playback 10,985/13,246ms | Measured recovery, n=2. Detection onset latency was not instrumented |
| Business tools | 20/20 reset scenario suites pass; invalid inputs, conflict rejection, $225 estimate, snapshot retention, persisted summary | Measured deterministic tests; not generative tool-call reliability or production concurrency |
| Handoff | Quote/booking/latest request preserved; specialist response references both; human record distinct | Measured local state-role handoff; not independent agent/phone transfer |
| Memory/load | Component process ending RSS 497MiB; CPU-only inference, no continuous GPU/load/concurrency profile | Measured endpoint RSS, not peak service capacity |
| Voice naturalness | Audio generated, WAV playback events/durations verified; no listening panel or MOS | **Unmeasured** subjective naturalness/intelligibility |

Full component details: [COMPONENT_EVIDENCE.md](COMPONENT_EVIDENCE.md). Raw evidence in `evidence/`; final browser evidence includes per-turn metrics and structured session. Offline script retains aggregate timing statistics, not individual raw timing samples; do not infer reliable tail latency from it.

## Fix and acceptance result

Initial browser runs stalled in ONNX Runtime Kokoro inference. Diagnostic stack located the stall; bounded ORT thread settings resolved it in the final seven-response browser run. This supports a local mitigation, not a universal upstream root-cause finding. Failed partial captures remain outside Git and are not demo evidence.

The final synthetic MediaStream traversed WebAudio VAD → MediaRecorder → HTTP upload → real faster-whisper → Pipecat domain pipeline → real Kokoro → browser playback. Spoken estimate and human request both interrupted ongoing playback, then completed. Text turns exercised FAQ, availability, booking and sales handoff through the same pipeline. Browser assertions pass, with zero page errors and no desktop horizontal overflow.

Proven: greeting; local browser speech input/output; microphone-energy barge-in and replacement response; FAQ; deterministic quote; mock availability/booking; context-preserving local sales role; human follow-up record; saved transcript and structured summary. **Not proven:** native WebRTC/PSTN, low-latency streaming conversation, physical microphone/acoustic interruption, separate agent processes, real human transfer, generative LLM, production calendar durability or concurrent callers. Buffered turn latency is visibly too high for a polished realtime receptionist. These are explicit acceptance gaps, not silently passed criteria.

## Cost, licensing and choice

[BUILD_VS_BUY.md](BUILD_VS_BUY.md) provides dated primary sources, licenses/obligations, privacy/control, portability, operations/security limits and reproducible arithmetic. Illustrative monthly totals including $50/hour operations at 500 / 10,000 minutes: premium **$154 / $1,312**; OSS-heavy hybrid **$257 / $967**; fuller self-host **$394.50 / $1,577**. They are estimates, not tested capacities or bills. Cash provider/infrastructure subtotals differ from total cost. No money spent. With a $50 startup cap, use the existing local machine and no paid services; none of these commercial steady-state estimates is a validated <=$50 all-in launch plan.

For the initial demo, select the working local stack above. For later real conversations, prefer evaluating an OSS-heavy hybrid with replaceable speech/LLM services against LiveKit, subject to measured latency and real hosting economics. Do not lock a paid provider yet. Preserve JSON tools/context and provider adapters to limit switching cost. Chatterbox is inconclusive; managed quality remains unmeasured.

## Capture and next milestone

External artifact root: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_venture-ops/media/awc-voice-bakeoff-2026-09-24/verified`.

`brighthome-demo.webm`: 75.28s, 5,593,875 bytes, 1360×900 VP8, 25fps/1,882 frames, **silent**. SHA-256 `f8b3d1c38f98eb01c2a5869e837d40849c6cb1eb8f179d138752a7185a23eb44`. Full FFmpeg decode and advancing Chromium playback pass. Director inspected start/middle/end and final handoff/summary PNGs. Story: greeting ~0–7s; mic estimate interruption ~7–18s; FAQ ~18–23s; availability ~23–35s; booking ~35–48s; sales ~48–60s; mic human escalation/replacement ~60–74s. Screenshots: greeting.png, handoff.png, summary.png; evidence browser-evidence.json and playback/verification.json. Component WAVs remain ignored under docs/voice-bakeoff/evidence and are also copied to external media at closeout.

PSTN is **deferred**: no confirmed no-cost account/carrier access, user explicitly chose local/documented baseline. No phone number purchased and no calls placed. See [run instructions](../../experiments/receptionist/README.md).

Exact recommendation: a fresh **AWC — Realtime Voice Acceptance** milestone: retain this scenario/tools, implement one actual streaming WebRTC transport and compare LiveKit/Pipecat using matched audio/provider settings; obtain human microphone/noise/listening evidence, instrument end-of-speech→first audible response and VAD cancellation, target p95 <=2s warm response and <=300ms cancellation, test a real local/authorized no-cost LLM and concurrent booking isolation. Defer PSTN until free access or separately approved budget. No production launch before those gates. Stop this bake-off here.
