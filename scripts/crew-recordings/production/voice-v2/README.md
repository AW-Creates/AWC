# V2 bounded conversation capture

Separate implementation; the archived production capture and consumed allowance gate stay unchanged.

Run the free check from the repository root:

```powershell
node scripts/crew-recordings/production/voice-v2/free-preflight.cjs
```

This runs nine deterministic lifecycle tests, then Chromium using a synthetic SDK emitter and synthetic remote WebRTC audio track. It decodes three WAV inputs separately, records the question/remote mix, decodes the recorded WebM, and requires complete final reply and no external requests. No provider session factory, SDK session, TTS service, or voice update runs. Generated WAV, WebM, screenshot and JSON evidence remain under ignored `voice-samples/production-v2/preflight/`.

`captureSession` requires `{name, role, purpose, outputDir, questionClips: [{text, wavPath}], access_token, call_id}`. Credentials may instead arrive through a supplied `sessionFactory` after browser and all WAV decode readiness pass. They are kept in memory and never written to evidence. This module does not create, authorize or retry sessions itself. Only invoke a real capture through a separately reviewed finite allowance gate. Input scripts are in `docs/crew/voice-v2/PRESENTER-TURNS.json`; prepare one WAV per turn beforehand.

Capture waits for `call_started`, an actual greeting start/stop, and 1200ms quiet. Each individually decoded and SHA-256-hashed question source feeds both the provider microphone and recorded audio mix. On question end it waits for agent speech. A stop event starts a quiet debounce; resumed speech cancels it. The next question begins after observed speech stop and the quiet window; the final observed reply receives the same quiet window before `stopCall`. The SDK provides no guaranteed whole-turn-complete signal: a later speech chunk could still arrive after that window. Live SDK behavior needs supervised validation, and complete captured turns must be reviewed before publication. Browser evidence records actual SDK events, each question’s hash/duration, provider transcript updates and direct remote audio tracks.

The 150-second hard ceiling covers connection and conversation. maxSeconds must be finite, positive and no greater than 150; total question audio duration must fit before any session factory runs. Agent speech overlapping question playback fails incomplete and stops the question immediately. An unfinished turn fails completeness; no fixed question offsets or success-on-cutoff behavior remains. Connection timeout is 25 seconds; greeting/awaiting-reply silence is 45 seconds. Once speech starts, the overall hard ceiling bounds a missing stop event without cutting a legitimate long reply at the silence timeout. Failure clears controller timers and stops active question playback and call. Browser cleanup clears synthetic timers, animation frames, peers, media tracks and AudioContext. Recorder flush has a two-second bounded watchdog.

Deterministic tests cover late connection, greeting gate, long multichunk/resumed speech, missing stop, SDK error, missing connection/greeting/response, premature end, 150-second ceiling, final completion, and timer cleanup. Browser preflight verifies real decode/mix/encode/decode mechanics; it does not certify provider voice quality or real-provider event ordering.

## Paid recording gate

`record-approved-role.cjs` with no arguments prints a zero-call plan. `--preflight ROLE` validates local readiness; `--record ROLE` is the only paid entry point; `--reconcile ROLE` reads terminal cost and duration after an attempt. A successful capture alone does not settle the allowance.

The separate gate permanently reserves one attempt and $1 per role before creating a call, with seven attempts / $7 maximum, no retries or refunds. Failed or uncertain creation remains consumed and blocks the next role until reconciled. An initialization marker prevents a missing ledger from silently reopening the grant. Atomic locks prevent concurrent reservation; never remove a lock or reset a ledger as an operator shortcut.

Parent-reviewed RECORDING-MANIFEST.json pins numeric agent/LLM versions, custom voice IDs and stable full configuration hashes. RECORDING-READINESS.json must pin approval/manifest/question ledger bytes, owner-accepted native previews, completed presenter listening/QC, successful capture preflight and reviewed all-in rates at or below $0.36/min. It has a finite window of at most 24 hours. Finalize it once before any reservation; changing reviewed inputs afterwards blocks further recordings.

All 21 presenter clips must be complete and isolated to their three role turns. The browser must decode the same hash-verified WAVs before the session factory can reserve. Live readback requires published pinned versions, a 150-second provider cap, basic-attributes storage, no memory, tools, knowledge adapters, webhooks or fallback voice. Reconcile identity, duration and actual cost before proceeding. A failure uses one bounded direct stop if the call is still active; cleanup and manual cost reconciliation remain possible after readiness expiry.

Run the independent offline gate tests:

```powershell
node --test scripts/crew-recordings/production/voice-v2/paid-gate.test.cjs
```

These tests use synthetic API responses and isolated temporary files. They start no Retell session. Native clone acceptance, publication approval, rate checks and final readiness remain separate from the offline test result.
