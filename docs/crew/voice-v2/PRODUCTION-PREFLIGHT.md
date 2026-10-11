# Custom-voice production preflight checkpoint

Status: capture workflow validated locally; genuine custom-voice production remains pending.

Owner accepted all eight local Voicebox voices and approved seven Retell attempts, at most 150 seconds and $1 each / $7 total, with no automatic retries. Native clone uploads remain conditional on verifying no separate cloning fee. The authenticated clone dialog, native API documentation, pricing page and billing documentation do not establish that condition. No upload, clone, provider mutation or new Retell session has occurred. Current incremental cloud spend: $0; all seven attempts remain unused.

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

Verify the clone-fee condition; create and audition seven Retell voices; review and pin new specialist versions with Crew by AWC and natural we/our wording; create the separate immutable paid gate; capture and reconcile one genuine session per specialist; review audio, captions and desktop/mobile playback before publishing versioned replacement assets. Existing public media and disabled live channels remain unchanged.

The subsequent revenue milestone is Flagship Consultation Conversion & Outreach Readiness Acceptance. No outreach or new niche build is authorized by this checkpoint.
