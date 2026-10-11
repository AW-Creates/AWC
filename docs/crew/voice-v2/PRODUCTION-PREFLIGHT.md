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

## Current recording progress — 2026-10-11

The owner accepted all21actual presenter questions. All7original and2fresh attempts are consumed and reconciled; six complete replacement conversations are ready. Autumn’s fresh attempt failed overlap; Owen completed141seconds after bounded append-only readiness renewal. Total recording spend$1.614513602. See RECORDING-PROGRESS.json for authoritative sanitized costs/status and PROJECT_STATE.md for recovery steps. Private preview captions remain drafts, public replacements are not accepted or published. Owner review of six actual previews and separate corrected-Autumn/$1approval is pending.

Never reset a consumed grant or invent actual-audio acceptance. Next revenue milestone remains Flagship Consultation Conversion & Outreach Readiness Acceptance; no outreach or new niche build.
