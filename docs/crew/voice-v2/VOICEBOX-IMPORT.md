# AWC Crew — Voicebox import closeout

Completed 2026-10-10. The owner redirected this task to local Voicebox imports; no ElevenLabs source mapping was required.

## Delivered

Separated the combined recording into Autumn Winters, Owen Brooks, Clara Bennett, Miles Carter, June Parker, Theo Reed and Demo Presenter. Added Sage Morgan from the separately supplied recording. Original MP3 files were preserved. Spoken casting labels/directions were excluded from the combined-file splits.

All eight named AWC profiles were created through the installed Voicebox 0.5.0 local REST API and have one verified reference sample with matching reference text. Profile IDs and roles are recorded in `VOICEBOX-PROFILES.json`.

Private files are beside the project in `voice-samples/`: eight complete WAV samples, eight short Voicebox references with transcripts, eight portable `.voicebox.zip` exports, and the local import ledger. This directory and the original supplied MP3 files are excluded from Git.

## Validation and limits

Voicebox accepts reference audio up to 30 seconds. A first full-length Autumn upload was rejected without attaching a sample; its existing empty profile was then reused. Sentence-ended references of 26.19–28.05 seconds were prepared and all eight imports passed API readback checks for profile, sample and reference text. Complete samples remain available separately.

The five pre-existing profiles retain their content; one unrelated profile's update timestamp changed while the app was active. The task only created new profiles and attached their samples. Final inventory: 13 profiles, including all eight AWC additions. All eight exported backup files passed ZIP signature validation.

No speech was generated or auditioned during this import. Sample attachment is verified; audible similarity and quality are not yet accepted. No cloud uploads, paid API use or Retell changes occurred. Incremental spend: $0.

## Next bounded action

Audition short local Voicebox previews for the eight voices, confirm role-to-voice matching and adjust only where needed. Then prepare the longer genuine Crew demonstrations with natural “Crew by AWC” / “we” / “our” wording and the custom presenter. New paid Retell sessions require a separate finite allowance; previous session grants remain consumed. Existing published examples stay in place until replacements pass acceptance.
