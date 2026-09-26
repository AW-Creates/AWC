# Realtime Voice Acceptance laboratory

**Milestone CLOSED — FAILED / NOT DEMO-READY (2026-09-26).** See [ACCEPTANCE.md](ACCEPTANCE.md) for final evidence, unresolved human-microphone acceptance, and the single recommended next milestone. Do not resume CPU TTS tuning or start the next milestone automatically.

Bounded local, single-caller experiment; no production calendar, phone deployment or approved demo stack. See BUILD_VS_BUY.md for modeled costs and the current managed-access limitation.

## Run the existing environment

From the canonical AWC repository in PowerShell:

```powershell
.cache/voice-env/Scripts/python.exe -m uvicorn experiments.receptionist.realtime:app --host 127.0.0.1 --port 8766
```

Open http://127.0.0.1:8766 in a browser with microphone access. Use headphones and synthetic caller details. Click **Start microphone**, allow microphone access, then **Greeting**. Speak naturally; the speech meter and partial transcript should move. A quote/booking transcript is held for exact on-screen review. Check the interpreted service, bedrooms/price or appointment slot before clicking **Confirm this exact request**. Correct a bad transcript in the optional text field and resend it. A spoken yes does not authorize a held action.

Scenario: opening hours; interrupt during speech; deep cleaning for three bedrooms; availability; book first slot; attempt same slot again; financing; sales specialist; human follow-up; Transcript & summary. Mock handoff keeps local context; escalation records a request but contacts no person. A successful quote must be $225. Record any misheard words, gaps and perceived delay. Click Save test evidence to download event JSON and mixed conversation audio; Stop microphone releases the device. Recordings are local and intentionally excluded from Git.

## Reproduce measurements

Use separate runs; do not benchmark while another inference workload is running.

```powershell
# Local LiveKit development server (separate terminal; loopback only)
.cache/realtime/livekit/livekit-server.exe --dev --bind 127.0.0.1
# Audio-only local round trips, same source pulses
.cache/voice-env/Scripts/python.exe scripts/voice-realtime/transport_benchmark.py
# Streaming recognition diagnostics
.cache/voice-env/Scripts/python.exe scripts/voice-realtime/asr_diagnostic.py
# Bounded uncached phrase/native-stream thread sweep
.cache/voice-env/Scripts/python.exe scripts/voice-realtime/kokoro_tuning.py
# Bounded isolated Chatterbox probe
.cache/voice-env/Scripts/python.exe scripts/voice-realtime/chatterbox_probe.py
# Bounded managed control: exactly three synthetic text prompts, each capped at 100 output tokens
.cache/voice-env/Scripts/python.exe scripts/voice-realtime/managed_control.py
# Business and authorization regression
.cache/voice-env/Scripts/python.exe -m unittest experiments.receptionist.test_app experiments.receptionist.test_safety experiments.receptionist.test_realtime_safety experiments.receptionist.test_voice_continuity
```

Local LiveKit dev defaults are public development-only credentials, not production secrets. The client uses AWC_LIVEKIT_URL/KEY/SECRET overrides if provided. Server is not required for the separate Pipecat browser laboratory.

The managed-control script securely loads the canonical ignored `.env` and uses no uploaded audio, tools, booking authority, or customer data. It is hard-capped at three synthetic text prompts and 100 output tokens per prompt. On 2026-09-25, runtime authentication passed `GET /v1/me` with HTTP 200, but the Realtime control returned `billing_not_active` before any completed generation. Do not rerun it until billing is deliberately enabled; this is not a production capability or a cost/latency result.

Dependencies/models already recovered under ignored .cache. Python 3.11, Pipecat 1.11, aiortc, LiveKit RTC, Sherpa ONNX Zipformer EN20M live partials, cached faster-whisper base.en final correction, Kokoro ONNX/ORT, NumPy/SciPy, FastAPI/Uvicorn. Do not re-download models to resume. Chatterbox lives in separate `.cache/chatterbox-env`; Perth requires `setuptools==80.10.2` for its deprecated pkg_resources import. Watermarking was retained. No secret or model belongs in Git.

Automated browser capture needs `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE_PATH` pointing to the existing installed Playwright/Chromium. `browser_smoke.cjs <absolute-external-output>` is an injected-speech diagnostic, not a human microphone test. Output must be outside Git; use `scripts/content-capture/verify-playback.cjs <absolute-video> <absolute-verification-directory>` for decode and browser playback validation.

## Constraints

One shared demo business state and one active caller; loopback only. Reset between unrelated demos. No WAN/NAT, concurrent caller, real booking provider, phone network, managed-generation result, LLM inference or production-security acceptance. Audio synthesis already in progress cannot be preempted inside ONNX; epochs suppress stale playback and prevent new stale work. Browser mute latency is measured separately from physical speaker output. Human acoustic/listening acceptance cannot be inferred from synthetic media. No production performance, reliability, security, pricing, or service guarantee is made.

## Continuity and recognition repair — 2026-09-26

The browser now qualifies sustained energy for 180 ms before muting and sending one epoch-bound interruption. Server energy observations invalidate stale confirmations, including after a review prompt finishes, but do not independently cancel playback. Duplicate interruption requests are ignored. Sentence-based synthesis records planned/sent chunks and abandoned output. Completion telemetry is a scheduled-delivery check, not a physical-speaker guarantee.

Streaming hypotheses replace earlier hypotheses within their segment. Finalized segments remain in the displayed utterance; they never directly execute tools. Input PCM is buffered with 200 ms of pre-roll through recognizer segment resets and finalized after 800 ms of quiet. The existing cached Whisper base.en corrects the whole utterance before action review. Low log-probability/high no-speech proxies, empty text, duration caps and stale finalizers are rejected. These confidence proxies are uncalibrated and do not establish accuracy; exact review still gates all pricing/booking actions. Utterances over 20 seconds must be repeated more briefly. The model must already be cached; no automatic download is permitted.

Run the fixed fixture comparison with `.cache/voice-env/Scripts/python.exe scripts/voice-realtime/asr_finalizer_comparison.py`. Its five synthetic clips are ordinary/brisk speech, not slow dictation. Human microphone acceptance must still be repeated after this change; running a capture alone is not a pass.
