# Local voice component evidence

This note records the bounded local evidence for the BrightHome Cleaning
scenario. The raw, machine-readable results are in `evidence/`.

## Environment

The benchmark used Python 3.11.15 on Windows 11 (build 26200), 12 physical / 14
logical CPU cores and 31.47 GiB RAM. ONNX Runtime exposed
`AzureExecutionProvider` and `CPUExecutionProvider`; no GPU provider was
available. System inventory identifies Intel Graphics only, so this is a CPU
result, not a discrete-GPU result.

## Measured local TTS and STT loop

Kokoro ONNX `kokoro-v1.0.int8.onnx`, voice `af_heart`, and faster-whisper
`base.en` CPU INT8 were exercised against five short BrightHome utterances:
FAQ, 3-bedroom deep-clean estimate, appointment request, sales handoff, and
human escalation. Each component was warm-run five times per fixture.

| Fixture | Kokoro median synthesis | Audio duration | faster-whisper median STT | Median real-time factor | Synthetic WER |
| --- | ---: | ---: | ---: | ---: | ---: |
| FAQ | 3,229 ms | 2.795 s | 683 ms | 0.2445 | 25% |
| Estimate | 2,860 ms | 2.389 s | 705 ms | 0.2951 | 0% |
| Booking | 2,802 ms | 2.112 s | 694 ms | 0.3287 | 25% |
| Sales | 2,712 ms | 2.091 s | 633 ms | 0.3028 | 0% |
| Human escalation | 3,622 ms | 3.029 s | 698 ms | 0.2303 | 0% |

The faster-whisper model first load took 32,058 ms, and Python process RSS at
the end of the test was 497.15 MiB. The 25% WER values are tokenization effects
on short utterances (`BrightHome` becoming `bright home`; `a.m.` becoming two
tokens), so they should not be summarized as a real-world accuracy score.

This is **measured component-loop evidence only**: clean synthetic Kokoro audio
was transcribed against its input text. It does not measure microphone/noise
robustness, user-perceived TTS naturalness, WebRTC, VAD/barge-in, LLM latency,
network latency, or end-to-end conversational latency. Generated WAVs are
ignored because they are benchmark media.

## Framework API smoke

The same estimate utterance/context/quote contract was instantiated locally in
Pipecat 1.11.0 and LiveKit Agents 1.8.3. Pipecat constructed a real
`Pipeline` and processed its text frame. LiveKit constructed an `Agent` with
the same two-message `ChatContext`, bound the deterministic quote tool, and
set `allow_interruptions=True`. Object setup took 0.404 ms and 2.467 ms,
respectively, but these values are explicitly **not transport or realtime
performance measurements**.

## Chatterbox bounded feasibility

`chatterbox-tts==0.1.7` installed successfully into its own ignored environment
with `torch==2.6.0+cpu`; CUDA was unavailable. Two import/API-inspection
attempts remained CPU-active beyond 120 seconds and were terminated.
No Chatterbox model load or generated audio completed, so no Chatterbox latency,
quality, or resource result is claimed. This preserves the working
faster-whisper/Kokoro environment and makes Chatterbox an unmeasured follow-up,
not a losing benchmark result.

## Reproduction

From `AWC`, run the existing Python environment:

```powershell
$env:TEMP = (Resolve-Path '.cache').Path
$env:TMP = $env:TEMP
.cache\voice-env\Scripts\python.exe scripts\voice-bakeoff\run_local_component_benchmark.py
.cache\voice-env\Scripts\python.exe scripts\voice-bakeoff\run_framework_api_smoke.py
```

On this Windows setup the Kokoro phonemizer must copy an espeak DLL to a temp
directory, which requires the same runtime permission used for the recorded
run. faster-whisper's public model cache stays under `.cache/voice-models`.

