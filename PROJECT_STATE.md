# AWC Project State

Updated: 2026-09-24. Canonical repo: C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC, main.

## Objective and current milestone
AWC is the initial agency/portfolio focus; revenue and live lead pipeline remain unproven.
**AWC — AI Employee Architecture Bake-Off: bounded evaluation and local browser POC closed; STOP.**
Realtime production acceptance is NOT achieved. Do not restart recovery/discovery or launch the next milestone automatically.

## Delivered and validated
- Recovered completed architecture brief and pre-existing voice environment; original interrupted builder had no edits.
- Isolated experiments/receptionist POC: real local audio/STT/TTS, greeting, FAQ, $225 three-bedroom deep-clean estimate, mock availability/booking/conflict rejection, sales-role context handoff, human follow-up record, saved transcript/summary.
- Pipecat business pipeline and LiveKit Agent API smoke pass; only Pipecat wired into final browser POC. No matched WebRTC transport benchmark.
- faster-whisper/Kokoro synthetic component benchmark: 5 fixtures x 5 runs. Chatterbox installed but bounded import probes did not reach inference. Managed baseline documented only; user confirms no free account.
- Four unit tests and 20/20 deterministic scenario suites pass. Seven-response browser run passes; two microphone-energy interruptions cancel old playback AND complete replacement speech after ORT thread cap.
- 75.28s silent Playwright demo: full decode, advancing playback and Director sampled/final-frame visual inspection pass; zero page errors.
- Source syntax, diff whitespace and targeted secret-pattern review pass. Marketing index hash unchanged.

## Selected initial stack
Python 3.11.15; Pipecat 1.11.0 business frame pipeline; FastAPI/Uvicorn; browser WebAudio VAD + MediaRecorder HTTP utterance uploads/WAV playback; faster-whisper 1.2.1 base.en CPU int8; Kokoro ONNX 0.6.1 v1 int8 af_heart; ORT 1.24.4 CPU with two intra-op threads and spinning disabled. Deterministic language router and tools; optional loopback OpenAI-compatible LLM adapter (inference unmeasured). This is the local experiment choice, not a proven transport winner or production stack approval.

## Evidence and run instructions
- docs/voice-bakeoff/BENCHMARK.md: decision, measured vs unmeasured, acceptance gaps, costs, capture and next milestone.
- docs/voice-bakeoff/BUILD_VS_BUY.md: licenses including GPL phonemizer/eSpeak distribution review, privacy/control, portability and modeled total costs.
- docs/voice-bakeoff/COMPONENT_EVIDENCE.md and evidence/*.json: measured results.
- experiments/receptionist/README.md: setup, exact versions, endpoints, usage and limitations.
- From AWC: `.cache/voice-env/Scripts/python.exe -m uvicorn experiments.receptionist.app:app --host 127.0.0.1 --port 8765`; open http://127.0.0.1:8765.
- External media: ../_venture-ops/media/awc-voice-bakeoff-2026-09-24/verified/brighthome-demo.webm, greeting/handoff/summary PNGs and playback evidence. WAV samples copied to sibling component-audio. Models/venvs/session outputs ignored under .cache; no media in Git.
- Demo SHA-256: f8b3d1c38f98eb01c2a5869e837d40849c6cb1eb8f179d138752a7185a23eb44.

## Measured environment and limitations
Ultra 7 155U, 12 cores/14 logical, 31.47 GiB RAM, Intel Graphics; CPU-only tests. Final browser request-response 4.5–12.2s; cancellation-to-replacement speech 11.0/13.2s. Too slow for polished realtime conversation. Synthetic MediaStream, not human mic/acoustics or voice-naturalness scoring. HTTP buffered audio, not WebRTC; PSTN deferred without free account. No real human contact, independent specialist process, generative LLM benchmark, durable production calendar or concurrent-caller support. Server inference is not cancelled; stale playback is suppressed. Single loopback synthetic demo only. No money spent, paid API, deployment, outreach or other venture work.

## Preserved canonical site
Red/pink standalone marketing source remains byte-identical: SHA-256 941f908cfefcfe2d1a9e47a15af44210ed2ce247fb7b68d56e617d3ed3bb46a3.
Prior migration implementation 3751fb606b74de6e94bcc11b91be497205ffe1c5; closeout/base 565a0bb11d598a6ad9a37684138190722f0975d6. Provenance in docs/RED_SOURCE_MIGRATION.md. Gold tag/recovery originals preserved. Preview `node scripts/serve.cjs`, port 4173. No marketing redesign or backend integration.

## Latest validated commit
Implementation/evidence: cd24ca9fbd7b778854b7404ff692a6eb82b082d2. This state and venture closeout are committed separately; `git log -1` identifies that documentation commit.

## Exact next action / recommended milestone
Stop. In a fresh **AWC — Realtime Voice Acceptance** task, read this state and benchmark evidence; retain scenario/tools. Implement a real streaming WebRTC path and matched framework comparison, test actual mic/noise/listening and a local or explicitly no-cost LLM, measure p95 warm end-of-speech→audible response <=2s and cancellation <=300ms, and test concurrent booking isolation. PSTN requires practical free access or separate budget authorization. Do not begin production integration or outreach before those acceptance gates.

