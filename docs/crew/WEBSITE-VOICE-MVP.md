> Current acceptance/refinement: [Autumn refinement](AUTUMN-REFINEMENT.md). The single local test succeeded per owner; revised version 1 is configuration-verified only. Earlier pending-test statements below are historical.

# Crew website voice MVP â€” 2026-10-05

Canonical implementation is built, tested and **published**. Dedicated Autumn provider configuration is published/read back; voice remains disabled pending server secret and one supervised test. Owner approved 120 seconds/$0.50/no retry; no paid session created. Current operational checkpoint supersedes activation notes below: `CREW-PUBLICATION.md`. Do not describe a mock as audible acceptance.

## Preview

From `AWC/website-receptionist`, run `npm ci`, `npm run build`, then `node scripts/preview.mjs`. Open http://127.0.0.1:4191 and choose **Talk to Autumn Â· Crew**. This preview has synthetic in-memory SQLite, prepared text answers, no provider keys and no email delivery. It deliberately refuses voice before requesting a microphone. Stop the runner when finished. The root `npm run dev` is the older static design preview; use the Worker preview for this milestone.

Explore services, ask Autumn's name or about Crew, calculate an estimate, and submit a synthetic inquiry. The existing shared offers, facts, estimator and inquiry persistence remain authoritative. Voice transcripts are not attached to inquiries; text attachment remains opt-in. Consultation/quote requests require human confirmation.

## Voice architecture and activation boundary

Pinned Retell browser SDK 3.0.1 and its validated UMD dependencies are served from same-origin `/crew-assets/`. No CDN, browser API key or arbitrary proxy. POST `/api/voice-session` requires same-origin JSON, signed active session, explicit consent, IP rate limit, one creation per conversation, reviewed server-only agent/version, and finite global allowance. Failures consume allowance; no automatic refund, retry, reconnect or recurring reset. Only temporary join fields are returned with no-store. All provider error bodies remain private.

`CREW_VOICE_ENABLED=false` and `CREW_VOICE_REVIEWED=false` by default. Separate website configuration: `CREW_RETELL_AGENT_ID`, `CREW_RETELL_AGENT_VERSION`, `CREW_VOICE_ALLOWANCE_ID`, `CREW_VOICE_SESSION_CAP` (integer 1â€“10), and server-only `RETELL_API_KEY`. Session allowance is an attempt cap, not a dollar meter; set only after verifying current total rate and an explicitly bounded allowance. Provider maximum 120 seconds and client stop 115 seconds. Failed/abandoned attempts count. Reusing an exhausted allowance ID does not replenish it.

Before enabling: create/review a dedicated published AWC website agent; use the prompt exported by `node scripts/export-voice-config.mjs`, approved AWC facts, Autumn identity/AI greeting, chosen voice, **no tools, states, inherited BrightHome knowledge, calendar or business callbacks**, no pre/post-session tools, basic-attributes-only storage, no contact memory, provider duration limit, and verified rate. Keep BrightHome fictional voice/action acceptance separate. Pin its published version; review/read back provider settings. Do not turn on `CREW_VOICE_REVIEWED` as a substitute for those checks. Dedicated AWC Autumn version 0 is now published and reviewed; fictional BrightHome agent remains separate. See current publication checkpoint for IDs/readback.

The website frontend asks microphone permission only after local/server availability and consent checks, before creating a provider call. End/Escape/close/pagehide release local capture and SDK capture; cancel during pending permission releases a late stream. HTTPS or loopback secure context required. Visitors see concise AI/Retell disclosure and a customization CTA when the call ends or fails.

Idle, connecting, error and ended are lifecycle states. Listening/thinking/speaking are disclosed **audio-activity estimates**, not provider reasoning events. Current gateway lacks reliable detailed turn events through this minimal browser path. Do not expose a broader credential merely for transcript events. No transcript WebSocket or private key is used by the widget. Live audio timing, interruption and transport acceptance remain unverified.

Official references: [Retell browser SDK and events](https://github.com/RetellAI/retell-client-js-sdk/blob/main/README.md), [v3 web-call endpoint](https://docs.retellai.com/api-references/create-web-call). Reverify the pinned legacy `RetellWebClient` contract when upgrading; do not switch transports on version assumptions.

## Text and Gemini decisions

Keep the existing lightweight prepared-answer text guide. It shares AWC facts, service offers, estimate rules and inquiry flow, adds Crew/customization/Autumn identity answers, and costs no model usage. New generative chat, parallel Retell text product or independent action layer is deferred.

Retell remains the managed voice default. Gemini Live is a possible later bounded website-channel benchmark only if current voice evidence identifies a concrete cost, latency or capability need. No migration, account setup or benchmark now.

## Focused validation / limits

21 Node tests pass: shared service/identity/quote boundaries, estimate/inquiry regressions, session security, fixed agent routing, safe error handling, finite allowance, consent/mic denial/cancellation, all seven states, cleanup/CTA/no reconnect, no long-lived browser config. 45 Python demo/business/identity/action tests pass. Build and diff checks pass. Runtime npm audit: zero vulnerabilities; npm reports ten existing development-tool vulnerabilities, not remedied by unrelated upgrades.

Browser: desktop dark/light, 390Ã—844 dark/light, consent warning, prepared service answer and no horizontal overflow. Screenshots in `docs/crew/qa/`. Native dialog keyboard/focus semantics, labels/live status/error alert, visible focus and reduced-motion CSS retained. UI state tests use mocked microphone, SDK and provider; live speaking/latency quality remains a next-milestone test. No historical benchmarks rerun, no provider calls, API spend $0.00. Codex usage cost not available here.

Exact next milestone: **AWC â€” Crew Website Publication & Bounded Retell Voice Activation**. Synchronize this canonical Worker to the existing Sites checkout/project, publish the disabled-voice branding/text revision, verify public guide/estimate/inquiry, then review/pin the dedicated AWC Retell agent and approve a numeric test allowance before one supervised browser voice acceptance. Stop after evidence, actual cost reconciliation and state/Git closeout; no phone purchase or outreach.

Visual follow-up: owner requested less pink; Autumn panel now uses neutral paper/charcoal surfaces and clearer red accents. Updated screenshots are `qa/red-desktop-dark.png` and `qa/red-mobile-light.png`. Published in Site version 6; live voice acceptance remains pending.
