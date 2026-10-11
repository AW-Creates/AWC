# Local actual-audio transcription drafts

Voicebox's supported local API can transcribe with its already downloaded Whisper Base model. This uses the app's supported runtime; it does not import the blocked standalone PyAV dependency or bypass Windows policy.

```powershell
node --test scripts/crew-recordings/production/voice-v2/transcribe-local.test.cjs
node scripts/crew-recordings/production/voice-v2/transcribe-local.cjs --role sales
```

The script requires a complete genuine three-question capture in private `voice-samples/production-v2/recordings/ROLE/`, including ordered question/reply-complete evidence and decoded nonzero actual audio. Failed Autumn incident evidence is deliberately rejected; there is no incident override or cloud fallback.

Before submitting audio, fixed loopback `GET http://127.0.0.1:17493/models/status` must report `whisper-base` downloaded and not downloading. No download, generation or remote-provider endpoint is called. FFmpeg creates at most four bounded private mono16kHz WAV segments: greeting and each actual question/reply window. Each is sent once to loopback `/transcribe` with model `base` and language `en`; redirects are rejected, request timeouts are finite, and no automatic retries occur. Temp WAVs are removed afterward. Existing drafts cannot be overwritten; a lock prevents concurrent jobs.

`ASR-DRAFT.json` records actual captured-audio/evidence hashes, local model, actual ASR text, segment audio hashes and returned durations. Timing follows capture-event windows approximately. The API does not return word timestamps; these windows are not final caption cues or exact speech boundaries. No listening/review approval flags are set. Review names, recognition mistakes, dialogue, claims and privacy against actual audio, then manually create readable caption cues and the explicit private edit-review JSON required by `finalize-media.cjs`. This script never finalizes, uploads or publishes media and never changes capture/readiness/allowance files.
