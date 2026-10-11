# V2 bounded conversation capture

Separate implementation; the archived production capture and consumed allowance gate stay unchanged.

Run the free check from the repository root:

```powershell
node scripts/crew-recordings/production/voice-v2/free-preflight.cjs
```

This runs twelve deterministic controller/activity tests, then Chromium using a synthetic SDK emitter and remote WebRTC audio. Remote speech has RMS approximately .042, low comfort noise, pauses and resumed chunks; the SDK emits no speech events or updates. Three WAV inputs decode separately and the recorded WebM decodes after observed final quiet. Browser guards verify silent greeting timeout, missing-stop hard cutoff, presenter/remote overlap, monitor error, early monitor end and rejected monitor readiness. A synthetic monitor callback verifies sanitized transcript IDs/times, Node-only secret isolation and cleanup. No provider session factory, SDK session, TTS service, or voice update runs. Generated WAV, WebM, screenshot and JSON evidence remain under ignored `voice-samples/production-v2/preflight/`.

`captureSession` requires `{name, role, purpose, outputDir, questionClips: [{text, wavPath}], access_token, call_id}`. Credentials may instead arrive through a supplied `sessionFactory` after browser and all WAV decode readiness pass. They are kept in memory and never written to evidence. This module does not create, authorize or retry sessions itself. Only invoke a real capture through a separately reviewed finite allowance gate. Input scripts are in `docs/crew/voice-v2/PRESENTER-TURNS.json`; prepare one WAV per turn beforehand.

Capture waits for `call_started`, observed greeting start/stop, and 1200ms quiet. Gateway speech authority is direct remote audio activity: each received track branches before the presenter/mixed recorder through a 180Hz highpass analyser sampled every20ms. Sustained RMS>=.01 for100ms starts speech; RMS<.007 for650ms stops it. Comfort noise, short spikes and brief speech pauses do not advance the turn. SDK speech events on gateway are logged as ignored, preventing duplicate authority; other transports retain SDK speech events. Presenter audio never enters activity analysis. Each individually decoded and SHA-256-hashed question source feeds both the provider microphone and recorded audio mix. On question end it waits for remote speech. A detected stop starts a quiet debounce; resumed speech cancels it. The next question begins after observed speech stop and the quiet window; the final observed reply receives the same quiet window before `stopCall`. Activity is an acoustic heuristic, not semantic speech recognition or a guaranteed whole-turn-complete signal: quiet/soft voices, loud background audio or later chunks can defeat it. Live behavior needs supervised validation, and complete captured turns must be reviewed before publication.

Installed SDK3.0.1 gateway receives/plays remote WebRTC audio independently of `onData` server messages; `RetellWebClient.handleServerEvent` emits talking/update only from those messages. An observed real failed greeting had remote audio but none of those SDK events. This fix does not create a retry or change that consumed attempt. `node scripts/crew-recordings/production/voice-v2/replay-remote.cjs` reads that historical remote-only failed recording, requires zero question playback in its evidence, decodes/filters it offline and runs the same activity detector. Historical media/evidence are untouched; replay results go to ignored preflight evidence.

Optional `transcriptMonitorFactory({callId,onTranscript,onError,onEnd})` starts through a Node callback on actual `call_started`, independently of audio activity. It returns `{readyPromise,close}`. Only bounded agent/user text, stable IDs, provider time_sec, received_at_ms and local capture timing reach browser/evidence; the monitor credential stays Node-side. Monitor error, early end or readiness rejection is nonfatal by default because it supplies captions rather than remote audio. Evidence records `monitor_available`, `monitor_error` and `monitor_status`, retaining only allowlisted diagnostic codes; unknown failures use `unknown_monitor_error`. No retry starts. Explicit `requireTranscriptMonitor:true` requires a factory and makes these failures abort capture; normal terminal end does not abort again. Independent SDK call end, missing remote greeting/replies, overlaps and hard ceiling still fail capture. The monitor closes before browser teardown. Offline tests use a separate `offlineMonitorFactory`; the real factory never runs in preflight. Transcript timestamps still require listening review and caption end timing before publication. A prior monitor failure’s cause remains unconfirmed because its diagnostic code was not retained.

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
