# BrightHome local receptionist

From the canonical AWC repository in PowerShell:

```powershell
$env:LOGURU_LEVEL = 'WARNING'
.cache\voice-env\Scripts\python.exe -m uvicorn experiments.receptionist.app:app --host 127.0.0.1 --port 8765
```

Open http://127.0.0.1:8765. Click Greeting, then Start microphone; use headphones. Silence for 700ms submits an utterance; speaking during playback stops the old audio. Stop microphone releases the stream. Text input exercises the same business pipeline. The summary panel exports JSON. Reset clears the current in-memory demo calendar/session; previous saved JSON files remain under `.cache/receptionist-output/`.

Try: “What hours are you open?” → “Deep cleaning for three bedrooms” → “What appointments are available?” → “Book the first slot” → “Sales specialist” → “Human please”. The estimate is $225. The two fixed mock slots are October 1, 2026 at 10:00 and October 2 at 14:00; timezone/business date handling is intentionally not a live calendar integration.

Stack: Python 3.11.15, FastAPI, Pipecat 1.11.0 business FrameProcessor/PipelineWorker, faster-whisper 1.2.1 base.en CPU INT8 (4 threads), Kokoro ONNX 0.6.1 with v1 int8 weights/af_heart and ONNX Runtime 1.24.4 (2 intra-op threads, 1 inter-op, spinning disabled), browser WebAudio VAD/MediaRecorder and WAV playback. No cloud service is called by the default application after public model acquisition. The LLM default is deterministic rules, not a generative model.

`AWC_LOCAL_LLM_URL=http://127.0.0.1:11434/v1` and `AWC_LOCAL_LLM_MODEL=<installed-model>` opt into a local OpenAI-compatible chat adapter for unhandled questions. Only loopback URLs are accepted; there is no paid default. This adapter boundary exists but no local LLM server/model inference was benchmarked. Tools remain deterministic and separate from model output.

## Recreate environment

Existing models/environment were retained from the interrupted checkpoint. On a fresh machine with uv and Python 3.11:

```powershell
$env:UV_CACHE_DIR = Join-Path (Get-Location) '.cache/uv'
uv venv --python 3.11 .cache/voice-env
uv pip install --python .cache/voice-env/Scripts/python.exe -r experiments/receptionist/requirements-lock.txt
New-Item -ItemType Directory -Force .cache/voice-models | Out-Null
curl.exe -L --fail https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx -o .cache/voice-models/kokoro-v1.0.int8.onnx
curl.exe -L --fail https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin -o .cache/voice-models/voices-v1.0.bin
```

Whisper downloads its public base.en model on the first audio turn. The first run needs network/runtime permission and can be slower. Models, venv and audio are not in Git. `requirements-lock.txt` is an exact installed environment snapshot, including framework benchmark dependencies, not a cross-platform hash lock. Native Windows phonemizer loading required runtime permission during our test.

Validation from AWC:

```powershell
$env:LOGURU_LEVEL = 'ERROR'
.cache\voice-env\Scripts\python.exe -m unittest experiments.receptionist.test_app
$env:PYTHONPATH = (Get-Location).Path
.cache\voice-env\Scripts\python.exe scripts/voice-demo/business_regression.py
```

Capture: use the Playwright/Chromium environment paths in `docs/CONTENT_CAPTURE_REPAIR.md`, then `node scripts/voice-demo/capture.cjs <absolute-external-media-directory>`. First generate component fixtures using `scripts/voice-bakeoff/run_local_component_benchmark.py`. Capture injects synthetic WAV input through a real MediaStream; it does not exercise a physical microphone. The video is silent. See `docs/voice-bakeoff/BENCHMARK.md` for proof and limitations.

## Boundaries

One loopback demo session, one process, no authentication, no production booking/contact delivery. Booking conflicts are rejected within that process; state/calendar are not restored from disk at restart. Handoff changes the local specialist role and copies context; it is not a second independent LLM worker. Human escalation saves a follow-up request; it does not call/message anyone. Transcript/summary files contain synthetic data only in these tests. Server inference already in progress is not cancelled by barge-in; browser ignores stale results. No streaming STT/TTS or WebRTC/PSTN transport. End-to-end latency is too high for production realtime conversation. No human naturalness rating or acoustic echo/noise validation. Stop at this bake-off; do not expose this server to clients.
