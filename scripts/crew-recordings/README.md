# Archived Crew recording tools

This package preserves the capture/edit implementation used for the six approved recordings. That allowance is consumed; `provider/session-gate.mjs` now refuses every new session before any provider request. The ignored ledger is retained. These scripts are not a public voice activation path.

Published metadata and costs are in `docs/crew/RECORDINGS-MANIFEST.json` and `RECORDING-COSTS.json`; operator instructions are in `RECORDINGS-RUNBOOK.md`. Approved MP4/VTT and raw captures/transcription timestamps are locally preserved in ignored `production/approved` and `production/private`.

Offline re-editing uses `production/export-clips.cjs` and `finalize-media.cjs` with the stored actual captures and word timestamps. The current host has FFmpeg, Windows fonts, bundled Playwright and Chrome at the paths recorded in those scripts. Verify equivalents when moving hosts. Editing requires no provider call.

`provider/transcribe-local.py` loads faster-whisper from its ignored `provider/private/.asr` dependency target. The original installed target remains in the task's `crew-position-stage/provider/private/.asr`; it was not committed or copied as source. For a new host, install reviewed `faster-whisper==1.2.1` in the local ignored target and supply a cached model or explicit `--model` path. The current machine already has the referenced Whisper base snapshot. No cloud transcription is required.

The upload helper reads a short-lived media token through hidden stdin; no credential file or shell argument. Its endpoint is currently closed because the temporary runtime keys were removed. Any future capture or media replacement must be a separately authorized task with a fresh finite allowance/storage maintenance scope. Do not reuse the archived grant or silently overwrite immutable media.
