# AWC — Custom Crew Positioning & Recorded Showcase

Closed 2026-10-10 (America/New_York). Recovered canonical `main` at `af49787d3f440515c7c25a32f56a7f00f7ce2b68`; fresh remote matched before continuation. Prior demo factory and six-role provider setup preserved.

## Delivered

The public section now says **Our Crew. Your possibilities.** These are AWC's own example specialists, with explicit choice of one specialist or a team, custom names, personalities, responsibilities and approved tools. Two illustrative team combinations explain cooperation. Cards distinguish **Watch … in action** from **Explore this role in chat**. The custom-team CTA leads to consultation.

Six genuine browser voice sessions were captured locally with scripted synthetic questions, actual provider audio and the screen. Edited public clips show useful role-specific responses; raw captures and word timestamps remain ignored. The 60.4-second overview uses the six actual introductions plus silent branded slates. It explicitly joins separate recorded sessions; it does not demonstrate a live voice transfer. All six currently use the existing voice preset, with separate role prompts and responses.

| Example | Role | Published recording |
| --- | --- | --- |
| Autumn Winters | Customer Experience / Concierge | `/crew-media/concierge.mp4` |
| Owen Brooks | Sales / Solutions | `/crew-media/sales.mp4` |
| Clara Bennett | Scheduling | `/crew-media/scheduling.mp4` |
| Miles Carter | Client Support | `/crew-media/support.mp4` |
| June Parker | Billing | `/crew-media/billing.mp4` |
| Theo Reed | Implementation / Onboarding | `/crew-media/implementation.mp4` |
| Crew overview | Six separate introductions | `/crew-media/overview.mp4` |

Each MP4 has a matching `.vtt` caption file. Final measured durations, byte sizes and SHA256 hashes: `RECORDINGS-MANIFEST.json`. Captions derive from actual audio using local CPU transcription, with reviewed spelling and cut boundaries. Unclear wording and irrelevant/overpromising passages were omitted without inventing replacement dialogue. Claim/caption review notes: `RECORDINGS-EDIT-REVIEW.md`.

The native player requires Play, supports captions/seeking/replay, and pauses/clears media on close with focus restoration. Playback creates no Retell session. AWC's prepared chat remains available; live public voice/callback and connected calendar/account/billing execution remain gated.

## Publication and storage

Existing public Site retained: https://aw-creates-ventures.thesml.chatgpt.site/#meet-crew

Sites source `8b84f8581c8d1961d6fa944b1ed9ce040794e553`; saved version10 `appgprj_6abf204484b881919358d57a2d56bd08~appgver_88b4e65b2fc08191a16c7306c15a90fc`. Final deployment `appgdep_6acaafc8cad08191b029de58883e14fb`, succeeded at environment revision9. Source and built archive were synchronized with the supported helper; hosted `CREW_MEDIA` R2 stores the allowlisted approved files.

`website-receptionist/src/crew-media.mjs` serves readiness and media, including closed/open/suffix ranges and conditional caching. Both video and caption objects must exist before Watch appears. All14 files uploaded with hash readback. The temporary upload token and expiry were removed from runtime; exact saved version redeployed. Upload PUT now returns HTTP403. No provider credentials or access tokens are in public source/media.

## Validation

50 public tests and Worker build passed after media integration; 34 retained owner tests passed with the earlier six-role foundation. No public implementation changed after those checks. Five focused media tests cover authorization/expiry/signatures/readiness/ranges. Six desktop/mobile dark/light loopback cases validate positioning/chat/customization/player gating, using explicitly documented offline media fixtures.

Final **actual production** checks passed14cases: all7 recordings on1440px desktop and390px mobile. Loaded actual caption cues, played, sought start/middle/end, replayed, reached natural end, paused/cleared source on close and restored focus. Zero JavaScript errors, microphone requests, provider calls or inquiry/chat/session mutations. Actual published MP4/VTT hashes match every approved local file; closed/suffix/open ranges return206; conditional requests return304; upload returns403.

Seven full FFmpeg decodes and ordered/no-overlap captions passed. Director inspected actual desktop/mobile recording frames and the clean Crew section. Mobile fine print is small in the 16:9 capture; native fullscreen is available and captions remain readable. Evidence: `docs/qa/crew-recordings/production/REPORT.md`, `results.json`,46screenshots; `published-media-http.json`. Fixture results are separate and are not presented as real media acceptance.

## Effort, spend and remaining work

Owner approved at most6sessions /90seconds /$0.50each /$3total, no retries. Exactly6 created and reconciled,79.401–79.402seconds each, $0.16453336 per session, **$0.98720016 total**. No retry or extra provider session. Allowance is consumed and archived capture gate explicitly closed. Ledger/cost aggregate: `RECORDING-COSTS.json`; private call identities/raw media remain ignored. First reservation00:39:56UTC to final reconciliation00:51:30UTC on2026-10-10 was11m34s, including supervisory pauses. Editing/publication/installation time was not fully instrumented and includes the interrupted overnight run.

Offline transcription/editing used installed local tooling, no paid cloud transcription or TTS. Hosting/storage/transfer costs are separate and unavailable from this task; replay avoids Retell usage, not all delivery costs. Existing retained business number subscription remains $2/month plus usage. Largest manual production bottleneck: listening/claim review and caption/edit-boundary cleanup, rather than role configuration.

Runbook: `RECORDINGS-RUNBOOK.md`. Tooling: `scripts/crew-recordings/`; approved and raw files are locally preserved under ignored `production/approved` and `production/private`. Capture scripts cannot reuse this exhausted allowance. No actual outreach, new niche build, phone purchase, live public voice activation or operational integration was performed.

Next exact bounded milestone: **AWC — Flagship Consultation Conversion & Outreach Readiness Acceptance**. Validate one owner-consented public inquiry through receipt and follow-up routing, verify contact/response expectations, prepare the service/proof package and review operational readiness before prospect outreach. Recorded examples do not establish fully integrated calendars, invoices or accounts. STOP after Git/state closeout; do not automatically begin the next milestone.
