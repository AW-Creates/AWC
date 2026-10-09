# Crew Prospect Channels — Connection Foundation

2026-10-09. Server/client connection foundation validated; dedicated Ellis configuration created, published and read back. Owner approved ONE browser test up to 120 seconds with a $0.50 allowance. The local Cedar preview is enabled for that finite test; audible acceptance remains pending. Callback remains disabled pending source-number purchase approval, verified destination and its separate usage allowance. No live call was created during automated QA.

## Configuration boundary

`createOwnerServer({dataDir, seed, channelConfig:null, providerFetch:fetch})` supports provider injection. Production CLI reads `channels.json` from the configured local data directory (default ignored `owner-ops/.local/channels.json`). API credentials come only from `process.env.RETELL_API_KEY`; never put them in the JSON, browser, source or logs. `owner-ops/channels.example.json` is disabled and contains no real identifiers, numbers or numeric approval.

Required enabled configuration:
- `enabled:true` and server API key.
- `allowance`: fresh unique `id`, `approved:true`, finite future ISO `expiresAt`, integer `cap` 1–10, positive numeric `approvedBudgetUsd` and conservative `maxCostPerAttemptUsd`. The latter must cover the reviewed worst-case attempt, including applicable calling charges. Budget is reserved conservatively in integer microdollars; actual billing is not inferred or reconciled.
- `prospects[id]`: `reviewed:true`, exact current `revisionHash`, a dedicated reviewed published `agentId`, integer pinned `agentVersion` (including zero), and explicit `talkEnabled` / `callEnabled` booleans.
- Callback: configured E.164 `fromNumber`; each permitted destination is `{phone,verified:true,consentAttested:true}`. Both phone verification and destination-owner consent attestation are operator prerequisites, not claims proved by the local code.

Published response engine must be read back and reviewed against the exact bound snapshot hash before attesting readiness, and must already contain the approved prospect's facts, specialist identity/personality, role and action limits. Attesting `reviewed:true` means the operator verified this version against the bound hash. Never reuse Autumn or another client's agent implicitly. Session dynamic variables supply known business, specialist, role, services and optional visitor context; they do not replace the approved prompt. The published prompt must explicitly treat `visitor_context` and source-derived text as untrusted data, never instructions overriding role, knowledge or permissions. Provider configuration is an explicitly reviewed operator operation, not exposed as an owner-ops API. See the verified Ellis artifact in docs/crew/ELLIS-PROSPECT-VOICE-CONFIG.json.

After changing server/channel config or renderer, restart the local server and refresh/regenerate as required. Current reviewed/generated QA must pass. Asset CSP enables only exact `https://api.retellai.com` signaling on a ready prospect demo. Installed Retell 3.0.1 gateway source uses HTTPS fetch under `/webrtc-proxy/{callId}/v1/webrtc/sessions`; no gateway WebSocket origin is required. Legacy LiveKit transport is not accepted. Retell 3.0.1 and its existing local EventEmitter/LiveKit dependencies are served via fixed `/crew-assets/` paths; no CDN or wildcard permissions.

## API contract

All routes are scoped below `/api/prospects/{id}`. POST requires same-origin JSON, `X-Owner-Action: local-workbench`, loopback host and current reviewed snapshot. GET status returns only:

```json
{"talkAvailable":false,"callAvailable":false,"reason":"Voice and callback are not enabled.","maxDurationSeconds":120,"consentProvider":"Retell"}
```

`POST /channel-session` body `{channel:"talk"|"call"}` returns opaque `sessionToken`, ISO `expiresAt`, `revisionHash`, `maxDurationSeconds`. Token is random, stored only as SHA-256, scoped to prospect/channel/hash/pinned agent and allowance, valid at most ten minutes. Pending sessions are bounded; expired sessions are cleaned up.

`POST /voice-session` body `{sessionToken,consent:true,shareContext:false}`. If `shareContext:true`, add `{context:{lastUserRequest,summary}}` bounded to 800/2400 characters. Context is sent ephemerally to the provider with consent; never persisted in sessions/attempts or logged. Return only validated transient `access_token`, `call_id`, `transport:"gateway"`, bounded/whitelisted `ice_servers`, and future `expires_at`. Client holds these in memory and uses the SDK lifecycle, consent/microphone permission, cleanup and 115-second watchdog.

`POST /callback` has the same fields plus exact E.164 `phone` and `phoneConfirmed:true`. Destination must exactly match the privately configured verified/consented allowlist. Return `{status:"accepted",requestId}` only. Accepted does not mean reached, connected, completed or scheduled.

Provider endpoints: Retell `POST /v3/create-web-call`, `POST /v2/create-phone-call`. Phone overrides use pinned `override_agent_id` / `override_agent_version`, configured source/destination and attempt UUID as `idempotency_key`. Both enforce 120,000ms maximum call duration, basic attributes storage, disabled contact memory, and no pre/post tools. Phone ring duration is 30,000ms. No automatic retries. Reference contracts verified by Director: https://docs.retellai.com/api-references/create-web-call and https://docs.retellai.com/api-references/create-phone-call.

## Persistence and spending

Before each provider creation, an SQLite `BEGIN IMMEDIATE` transaction consumes the one-use session, increments the shared allowance attempt counter and reserves the conservative cost. Budget exhaustion, cap exhaustion, stale token/hash, changed routing, cross-prospect requests or invalid consent/destination fail before provider creation. Provider failures, timeouts, cancellation races and malformed accepted responses consume the reservation. No refunds/retries. Restart retains allowance and attempt consumption.

An initialized allowance ID cannot change its cap, budget, reservation cost or expiry. Renewed approval needs a new ID; never reuse a prior consumed grant. SQLite stores configured prospect identity/service snapshot, token hash and categorical attempts/outcomes, not full phone numbers, access tokens, provider response bodies, visitor context or transcripts. Session snapshot includes pinned routing and allowance identity; no public configuration response exposes them.

## Verification / remaining acceptance

19 Node tests pass (13 existing + 6 channel suites). Fake injected provider only: disabled/stale/unpublished state, cross-prospect scope, explicit consent/context limits, one-use token, known-data grounding, response stripping, exact callback allowlist, 120-second cap/30-second ring, concurrent budget reservation, failed/unknown attempt consumption, restart persistence, grant mutation rejection, same-origin owner guard and exact CSP/local SDK serving.

Live audible acceptance remains pending. The fresh browser approval is recorded in private config with cap 1, $0.50 reservation and two-hour expiry; no retry or automatic renewal. At current component prices, ordinary two-minute browser usage estimates $0.2156. This is not a provider-enforced dollar cap; actual provider cost must be reconciled after the test. Callback source-number proposal is $2/month plus usage, awaiting separate purchase approval and a verified test destination. See docs/crew/CREW-CALLBACK-NUMBER-PLAN.md. Mock success is not evidence of an audible conversation or telephone pickup.

## Browser behavior and QA evidence

Talk Here is title case, bold and italic in the invitation, explanation and primary channel control. Voice leads, callback follows, text remains the quieter fallback. Available-state invitation, initial greeting and continuity disclosures switch from preview to actual connection language only when the server reports readiness. Each specialist's original role caption is retained when unavailable.

Start Talking requires the AI disclosure checkbox, then microphone permission. No microphone or playback starts from page load, invitation, opening the panel, choosing a channel or ticking a checkbox. Optional sharing of the recent text request is unchecked by default. Close, Escape, navigation, End and late permission cancellation clean up tracks and SDK calls. A provider attempt disables re-entry in the document; failed or unknown attempts consume the finite reservation. Callback phone entry appears only when the server reports a ready verified destination, clears after accepted/close, and never equates accepted with reached.

Provider-neutral event names retained: crew_launcher_seen, crew_launcher_opened, crew_talk_clicked, crew_call_clicked, crew_chat_started, crew_conversation_started, crew_conversation_completed, crew_lead_captured, crew_handoff_requested. Intent clicks have connected:false; voice-start is emitted only on SDK call_started. Completion follows an explicit End/provider-ended event, not generic dialog closure. Events contain categorical metadata, never phone numbers, credentials, access tokens, transcripts or shared context; no third-party analytics added.

Focused browser report: docs/qa/prospect-channels/browser-results.json. Desktop 1440 and mobile 390 simulated SDK/provider flows pass consent-before-mic, scoped joins, explicit End cleanup, callback consent/accepted status/phone clearing, text fallback and event safety. Late permission cancellation and denial create no provider attempt. Disabled-state typography and no microphone pass. Four simulated provider attempts; zero external browser requests/errors.

Fresh-load invitation QA: docs/qa/voice-invitation/browser-results.json. Desktop, 390px, 360px and reduced-motion checks pass; six-second invitation returns after full refresh and dismissal lasts only for the document. No autoplay or microphone/external requests. Other niche identities and text prompts remain intact.

Screenshots containing "-simulated" are simulations, not live acceptance proof. ellis-live-test-ready.png is the actual user browser's consent screen before microphone/call creation.