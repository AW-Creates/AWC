# AWC recorded Crew showcase — operator runbook

The public Crew section shows AWC's own examples, not a fixed catalog. Clients choose one specialist or a team, custom identities, responsibilities, knowledge, approved tools and handoff rules. Website-only services remain available.

## Visitor experience

Open the public site's `#meet-crew` section. Watch the overview or a specialist's recorded example; playback requires a deliberate Play click. Native controls support pause, seek, replay and captions. Closing pauses playback, clears the source and returns keyboard focus. **Explore this role in chat** opens prepared text guidance. The custom-team CTA goes to the consultation form.

Recordings are edited genuine provider responses to scripted synthetic visitor questions. The overview joins separate conversations; it does not demonstrate a native live voice transfer. The six specialists currently share the existing voice preset. Their role-specific prompts and responses differ; distinct voice casting is a future scoped choice. Connected calendars, accounts, billing actions and live public voice remain separate setup and validation work.

## Media storage and publication

`website-receptionist/src/crew-media.mjs` serves only seven allowlisted MP4/VTT pairs from the managed `CREW_MEDIA` R2 binding. `/api/crew-recordings` exposes a role only after both files exist. Media routes are `/crew-media/<role>.mp4` and `.vtt`; roles are concierge, sales, scheduling, support, billing, implementation and overview. Range requests allow native browser seeking; immutable cache headers reduce repeated transfers.

Approved-file metadata and SHA256 hashes live in `docs/crew/RECORDINGS-MANIFEST.json`. Raw captures, word timestamps, allowance ledger and edit intermediates remain ignored locally. Captions come from offline transcription of actual captured audio, with reviewed trims; they are not reconstructed from prompts.

Upload is deliberately temporary: native Sites runtime secrets configure `CREW_MEDIA_UPLOAD_TOKEN` and an expiry; the operator's upload helper receives its token through hidden stdin. The upload endpoint checks authorization, expiry, filename, type, size and file signature. Matching hashes are idempotent; differing existing files cannot overwrite approved media. Remove both upload environment keys and redeploy the exact saved version immediately after upload. Verify HTTP403 and public playback afterward. Never commit tokens or enable a permanent public uploader.

Replacing an approved file requires an explicitly scoped storage maintenance/change, because the immutable filenames cannot be silently overwritten. Reuse the existing Site and preserve its audience. Follow the Sites source helper before publishing any source changes.

## Recording and allowance discipline

The owner approved exactly six sessions, up to90seconds and $0.50 each/$3 total, no retries. **All six attempts are consumed and reconciled.** The archived session gate is closed. Old allowances cannot fund a retake. Do not run capture scripts or create another session without a new explicit numeric allowance and a newly scoped gate.

For an authorized future recording: verify the pinned provider identity/version and no executable integrations; free-preflight the actual browser/audio recorder first; reserve before creating a call; keep secrets/tokens only in memory; stop within the duration limit; reconcile actual provider cost before another role. Use synthetic questions without customer information. Edit uncertain claims, long pauses and irrelevant examples; do not invent dialogue or disguise separate sessions as a live handoff.

Review final captions against the captured audio, check edit boundaries and synchronize screen/audio. Fully decode final MP4s, inspect frames, validate ordered captions, then test actual hosted playback on desktop/mobile, including seeking, captions, replay and cleanup. Confirm zero microphone/provider calls during playback. Fixture-based UI tests alone do not establish final media acceptance.

The $0.98720016 recording usage is separate from hosting/storage/transfer usage and the retained business number subscription. Viewing these files makes no Retell session; it does not imply all hosting delivery is free.

## Next bounded acceptance

**AWC — Flagship Consultation Conversion & Outreach Readiness Acceptance.** Validate a real owner-consented inquiry from public CTA through receipt and follow-up routing; verify owner contact details and response expectations; assemble a concise service/proof package and approve launch readiness. Resolve operational gaps before the first prospect batch. Do not automatically activate unrestricted public voice, purchase numbers, contact prospects or build another niche.
