# Custom-voice production preflight checkpoint

Status: capture workflow validated locally; genuine custom-voice production remains pending.

Owner accepted all eight local Voicebox voices and approved seven Retell attempts, at most 150 seconds and $1 each / $7 total, with no automatic retries. Owner subsequently authorized uploads when no fee or checkout is shown, stopping if a charge is disclosed. Seven native clones and exact published recording revisions are now verified after explicit owner approval. Native preview files passed full FFmpeg decoding and owner listening acceptance. Published pinned baselines were rechecked and preserved. No new Retell session has occurred; all seven attempts remain unused. No separate cloning cost was disclosed; actual standalone cloning cost is unavailable.

## Verified capture behavior

- Nine deterministic lifecycle tests passed, covering connection/greeting gates, resumed speech, unfinished turns, errors, hard stop and cleanup.
- Six invalid-duration inputs and total decoded question duration are rejected before a session factory runs.
- Chromium decoded three separate WAV questions and recorded both their audio and a synthetic remote WebRTC track. All three replies completed; zero external requests, provider calls or pending timers.
- Recorded browser audio decoded successfully (approximately 1.86 seconds, RMS 0.3087); FFmpeg fully decoded the mixed audio and screen video without errors.
- Evidence stays ignored under voice-samples/production-v2/preflight/. This synthetic check establishes mechanics, not actual provider event ordering, voice quality or whole-turn completion.

## Production inputs and commands

Seven role scenarios and 21 presenter turns: [PRESENTER-TURNS.json](PRESENTER-TURNS.json).

From the canonical repository root:

```powershell
node scripts/crew-recordings/production/voice-v2/free-preflight.cjs
node scripts/crew-recordings/production/voice-v2/generate-presenter.cjs
node scripts/crew-recordings/production/voice-v2/generate-presenter.cjs --generate
```

Default presenter mode prints the plan. Explicit generation uses the existing local Voicebox Qwen 1.7B model and accepted presenter profile, saves a resumable private ledger, and never downloads a model or calls cloud TTS. Generated inputs still require listening and audio validation before recording. See the capture README and PRODUCTION-PLAN.md for supervised production acceptance.

## Remaining work

Accept the actual generated presenter question outputs; finalize the separate immutable readiness gate; capture and reconcile one genuine session per specialist; review audio, captions and desktop/mobile playback before publishing versioned replacement assets. Existing public media and disabled live channels remain unchanged.

The subsequent revenue milestone is Flagship Consultation Conversion & Outreach Readiness Acceptance. No outreach or new niche build is authorized by this checkpoint.

## Completed production preparation

Seven selected custom-voice versions each show $0.108/min in authenticated Retell details; maximum displayed 150-second usage cost is $0.27, below the $1 reservation. Published pinned binding and no-tool/no-memory/no-fallback readback PASS for all seven. Native voice acceptance and specific version-publication approval are recorded.

All 21 local question inputs completed, 133.52 seconds total. Full decode, signal, unique hashes and script-ledger mapping PASS. Measured local generation elapsed 1220.08 seconds (20m20s), from ledger creation to completion. Cloud TTS calls/spend: zero. The two-minute private Presenter-Questions-Review.mp3 and script reference are ready; generated-question listening acceptance is pending.

Separate paid gate: 13 offline tests PASS; default command confirms zero provider calls and zero consumed attempts. Prepared RECORDING-MANIFEST.json pins all seven verified published configurations. RECORDING-READINESS.json is absent. Automatic review rejected readiness creation while generated-question listening verification was pending; no process ran and no paid attempt was consumed. Complete the actual question listening review before enabling the gate.
