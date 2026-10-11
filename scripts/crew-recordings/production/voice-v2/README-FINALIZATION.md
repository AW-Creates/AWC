# Offline v2 finalization

This is a separate private workflow. It never calls a provider, changes an allowance, uploads media, or modifies the archived recordings. Complete and reconciled three-question captures are required. A failed one-shot capture cannot be finalized even if its cost was settled.

For each role, listen to its actual `mixed-audio.webm`, review all agent statements and every caption, inspect screen/audio alignment, and save a private `voice-samples/production-v2/reviews/ROLE.json`. Do not fill review flags from scripts or substitute expected answers. Aim for complete dialogue naturally totaling 90–120 seconds. Complete meaningful dialogues above 33 seconds and at most 150 seconds are accepted; target adherence is recorded in metadata, and no padding is added. Caption times and edit ranges below refer to the original mixed-audio clock, in seconds. Every caption must lie wholly inside one retained range. Split a cue at a cut; don't silently drop dialogue or cues. The reviewer must explicitly confirm that all three questions and replies remain intact, and that claims and privacy are suitable for publication.

Required review shape (illustrative values, not an accepted review):

```json
{
  "role": "sales",
  "call_id": "call_FROM_SETTLED_PRIVATE_LEDGER",
  "status": "reviewed",
  "reviewed_by": "Actual listening reviewer",
  "reviewed_at": "2026-10-11T04:00:00Z",
  "actual_audio_listening_reviewed": true,
  "dialogue_preserved": true,
  "meaningful_role_example_reviewed": true,
  "captions_actual_audio_reviewed": true,
  "claims_privacy_reviewed": true,
  "source_sha256": {
    "screen.webm": "SHA256_OF_SOURCE_FILE",
    "mixed-audio.webm": "SHA256_OF_SOURCE_FILE",
    "capture-evidence.json": "SHA256_OF_SOURCE_FILE"
  },
  "ranges": [[2, 102]],
  "captions": [{"start": 3, "end": 6, "text": "Words verified against actual audio."}]
}
```

Use `Get-FileHash -Algorithm SHA256` for the three source files; lowercase the recorded hashes. The call identity comes from private `PAID-ATTEMPTS.json`. The finalizer verifies it against a reconciled same-role attempt and pinned `RECORDING-MANIFEST.json` identity, with settled provider duration at most 150 seconds and cost at most $1. No online reconciliation happens here.

From the repository root:

```powershell
node --test scripts/crew-recordings/production/voice-v2/finalize-media.test.cjs
node scripts/crew-recordings/production/voice-v2/finalize-media.cjs sales voice-samples/production-v2/reviews/sales.json
```

Supported roles: concierge, sales, scheduling, support, billing, implementation and retention. Finalize one role at a time; an exclusive lock prevents parallel manifest writes. An existing output or role entry fails closed. Never clear a lock or remove approved outputs to bypass an error. A crash/partial output needs reviewed operator recovery.

Outputs stay in ignored `voice-samples/production-v2/approved/`: `ROLE-v2.mp4`, `ROLE-v2.vtt`, and `media-manifest.json`. The finalizer trims actual screen and audio, accounts for the recorded video lead-in, concatenates reviewed ranges, remaps reviewed captions, loudness-normalizes audio and exports H264/AAC with fast-start metadata. It fully decodes the resulting file once, compares mux duration with reviewed ranges, checks existing publication size limits, and hashes the finished pair and reviewed sources. Exact visual/audio synchronization and listening acceptance still require inspecting the resulting MP4. The manifest is private and does not publish anything.

No captions, padding, retakes, cloud transcription or synthesized agent replies are generated. If local ASR is blocked by application policy, manually prepare actual-audio captions without bypassing policy. Public versioned asset support, native source deployment, upload authorization, temporary token cleanup, hosted hash/range checks and desktop/mobile playback acceptance are separate work. Existing public clips remain available until accepted replacements are selected.
