# Explicit original/retake postproduction

Default ASR/finalizer behavior stays on the original `recordings/ROLE` capture and `PAID-ATTEMPTS.json` allowance. The explicit option `--take retake` is restricted to `concierge` and `sales`. It uses `recordings/ROLE-retake` and the separate `RETAKE-ATTEMPTS.json` ledger, never overwriting original failed evidence or drafts. No arbitrary path or take value is accepted.

```powershell
node scripts/crew-recordings/production/voice-v2/transcribe-local.cjs --role concierge --take retake
node scripts/crew-recordings/production/voice-v2/finalize-media.cjs concierge voice-samples/production-v2/reviews/concierge-retake.json --take retake
```

Retake processing requires the exact `awc_autumn_owen_fresh_demos_20261011` allowance (two attempts,150 seconds/$1 each,$2 total), a matched reconciled same-role agent/version/voice and a complete three-question capture. ASR drafts stay unreviewed and require actual listening/cue timing. Explicit retake edit review must include `"take":"retake"`, the selected fresh ledger call ID, and hashes of the selected retake screen/audio/evidence files, alongside all existing listening/dialogue/caption/privacy review fields. Original reviews may omit `take`, or explicitly set `original`; a retake review cannot be used for original finalization.

Approved output filenames remain `ROLE-v2.mp4/.vtt`; neither take can overwrite an existing approved pair. The private manifest records the selected take and allowance ID. No new acceptance flags, paid/provider calls, retry authorization, ledger resets or changes to the original immutable seven-role grant/readiness are performed by these offline tools.
