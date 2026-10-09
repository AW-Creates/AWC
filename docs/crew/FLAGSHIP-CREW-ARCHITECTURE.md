# AWC — Flagship Crew + Multi-Agent Routing Foundation

2026-10-09, America/New_York. Canonical implementation: `website-receptionist/src/crew-routing.mjs`, public `worker.mjs` + `crew-callback.mjs`, private `owner-ops/channels.mjs` + `channel-provider.mjs` + `server.mjs`.

## Product contract

A. Wilcher Creatives is the flagship Crew deployment. Visitors should experience the company's Digital Workforce while discussing websites, business systems, automation, Crew and personalized concepts. The company is A. Wilcher Creatives LLC; customer shorthand is AW Creatives; Crew by AW Creatives is the workforce capability. Specialists are configurable units with separate responsibilities and permissions. A focused website project does not require buying Crew.

This milestone delivers executable routing, prepared-answer chat handoff, bounded callback adapter and provider-transfer preparation. It does not claim live multi-specialist voice acceptance or public deployment. Existing hosted Site version 8 is unchanged; its voice remains disabled and server Retell key absent. Deploying this source later must apply the new SQLite migration before enabling callbacks.

## Number and channel classes

| Class | Purpose | Required context | Return call |
|---|---|---|---|
| `aw_business_number` | Actual AW Creatives public business source | Fixed AW business + reviewed specialist | AW business concierge/router |
| `aw_demo_number` | Distinct shared private-demo source when available | Server-selected demo/business/specialist/review revision | Generic AW demo router; never guess a prospect |
| `client_number` | Client's own/imported/dedicated production number | Client tenancy + reviewed production permissions | Client router; future work |

Fresh read-only Retell inventory confirmed one retained source matching the ignored local configuration. No inbound agent or inbound webhook is configured. The current v2 inventory returns an outbound agent array matching the reviewed Ellis binding. Private callbacks also select that specialist by explicit per-call override. The retained number’s outbound default must never be used implicitly for public AW callbacks. No number or credential is included here.

The retained source can temporarily carry business-number role metadata for private callbacks. Every private outbound request uses its reviewed demo identity and pinned agent/version; it does not rely on the source's default agent. A pending session pins source fingerprint and number role so changing the source invalidates it. `resolveNumberRole` records the shared fallback and dedicated-demo-later optimization. No new source was bought or provisioned. A separate established public business source has not been independently identified in this repository; public callback activation requires operator confirmation of the correct business source.

`inboundPolicy` is a provider-neutral decision contract. A shared/unknown return call selects a generic AW router and requires verified demo selection before any prospect context. Caller ID or the last callback never chooses a business. Inbound is currently disabled at Retell, so there is no live return-call answering or deployed webhook. Future provider wiring must use this policy and reviewed AW identity rather than Ellis as a universal default.

## Flagship roles

| Role | Identity | Knowledge | Allowed requests | Restrictions |
|---|---|---|---|---|
| Concierge / Customer Experience | `awc_concierge`, Autumn Winters | Published AW services and FAQs | Demo/consultation intent; offer Sales handoff | No binding quote, booking, payment or private data |
| Sales / Solution | `awc_sales`, public display “Sales Specialist”; personal name TBD | Published services + approved planning ranges | Needs qualification, estimate/consultation request, human escalation | No invented price/package, confirmed schedule, payment or private operations |

The configuration records personality/tone, specialist ID/name/role, knowledge scopes, permitted actions, prohibitions, allowed handoff targets, human target, channel permissions and automated-specialist disclosure. Names live in configuration; no permanent Sales personal name was invented. Scheduling, Support, Billing and Implementation remain optional future roles. Role requests are not actual calendar, quote, email or payment tools. Existing preliminary estimator and consented inquiry submission remain the approved execution paths.

The public server always resolves `aw_creatives`; caller-supplied business/demo/role/agent fields cannot change tenant. Chat role comes from signed-session server history. Private projections contain only reviewed prospect about/services/area/FAQs, configured role/tone/permissions, theme ID, analytics namespace, status and optional expiry. They do not import AW sales or operational knowledge. Current prospect models have no owner-facing permanent demo expiry editor; finite voice/callback grant expiry remains mandatory, and explicit disabled/expired demo metadata fails closed for page/chat/voice.

## Handoff model and actual status

`handoff` checks business, demo and surface identity, source allowed targets, explicit acceptance and target channel permissions. Target tools/knowledge come from its own configuration. With permission it carries bounded summary, recent transcript and visitor intent; contact carries only with separate contact consent. All carried text is untrusted data. Human escalation is separate and currently goes to a consultation/inquiry request or private owner-review draft, never a claimed phone transfer.

Public prepared-answer chat: a concierge reply may offer Sales; the visitor chooses Continue with Sales and whether to carry recent context. `/api/crew-handoff` requires a signed active session, an actual pending server offer and a throttle. It atomically locks that session, changes role and preserves history. Another session cannot accept the offer. The Sales introduction acknowledges the previous specialist, briefly relates the experience to Crew, references the visitor's prior intent when shared and asks about the outcome. Subsequent guidance remains needs-led. Declining context keeps the page's visible history but does not put prior intent/transcript into the target's carried context. New conversation resets to Autumn. Completing this prepared-answer handoff does not assert that another AI model or voice agent joined.

The UI explicitly labels the Sales interaction “Prepared-answer chat.” Voice controls are removed from that text role view; an active voice conversation must end before a text handoff. This prevents the text Sales identity from appearing to be the voice speaker. No public simulated live transfer was added.

Retell's current Agent Transfer documentation confirms native `agent_swap` works on phone and web calls, keeps the same call ID and carries transcript, metadata and dynamic variables. Destination prompt, tools and knowledge switch; custom-LLM and chat-channel targets are unsupported. Source storage/redaction settings remain call-level. References checked 2026-10-09: [Agent Transfer](https://docs.retellai.com/build/single-multi-prompt/transfer-agent), [Transfer Node](https://docs.retellai.com/build/conversation-flow/transfer-agent-node).

`planProviderTransfer` prepares the pinned native tool behind a provider-neutral boundary, checking target identity/review/version and explicit enablement/validation gates. It does not mutate Retell. Without those gates the plan reports an explicit session-handoff/reconnect requirement. No automatic reconnect or paid second session is implemented. Sales has no reviewed provider agent binding, so native AI-to-AI voice transfer is neither enabled nor live-validated. Existing Autumn/Ellis published configurations were not changed. Any later live validation requires a distinct finite operator allowance, not reuse of consumed grants.

## Public and private routing

Public Talk Here remains fixed to AW Customer Experience, with server-only agent/version, AW business/specialist attestation, reviewed flag, future grant expiry, enable switch, key, finite cap and rate limits. Browser microphone/AI consent and End cleanup remain intact. Dynamic variables explicitly identify AW; demo identity is empty. Current availability is disabled. Public Chat uses AW facts and the same role model; Sales is a real deterministic role switch locally. Public Call Me now has `/api/callback`, a server adapter, readiness and consent UI; it is currently disabled because no public callback config/allowance is active.

Private Talk Here/Call Me continue through `/api/prospects/:id`, reviewed hash/pinned agent/version and isolated one-use sessions. Dynamic variables add `business_id`, `demo_id`, `specialist_id`, `number_role` to existing business/specialist/role/services/context. Public route fields are not accepted as private identity. Private Chat preserves its configured least-privilege permissions and draft-only specialist/human outcomes. Cedar Lane remains Ellis, with no AW private/sales knowledge. Existing grants remain consumed/expired; none were renewed.

## Guardrails and activation

No new dependency or provider was adopted. Existing Retell remains behind the adapter; local deterministic routing and SQLite reservations use existing open-source runtimes. A new hosted platform or self-hosted voice stack would not improve this bounded identity/routing milestone and would add integration/operations work. No broad provider research or benchmark was needed. Revisit only if validated transfer or cost requirements exceed Retell's reviewed capability.

Public voice: 120-second provider cap, existing 115-second browser stop, signed session, one attempt per conversation, 2/hour/IP, configurable global daily paid voice cap (default 24), finite expiring operator grant and kill switch. Text/inquiry fallback remains available when paid limits are reached. Session creation retains 12/hour/IP; text remains 6/minute and 20 history entries. Concierge and Sales role transitions count toward that history cap.

Public callback: explicit config enable switch and review, AW business-number and concierge identities, pinned published version, exact verified/consented destination allowlist, owner-approved grant (cap 1–4, future ISO expiry, approved budget, conservative reservation, max 120 seconds), one callback/session, 1/hour/IP and 4/day across grants. Immutable configuration signature binds source, destination set, agent and grant. SQLite integer microdollar reservations happen before provider creation and survive restart. Failures consume reservations, with no refunds/retries/reset. Provider acceptance is not pickup or completion. Raw destination/context/provider responses are not stored. Basic-attributes storage, memory off, no pre/post tools and 30-second ring cap are enforced. Conservative dollar reservations are not provider-enforced monetary stops; operator reconciliation remains necessary.

Private demo voice/callback retains separate expiring channel grants, cap/budget/revision/source binding, transactional reservations, exact consented destinations and 120-second cap. Private guardrail configuration defines tighter future standing defaults (10 voice sessions/day, 2 callbacks/day, 120-second cooldown); these standing limits are policy values, not activated replacement grants. Current finite one-use approvals are stricter and remain spent. No CAPTCHA dependency added: private loopback access and exact destination allowlisting block public abuse; public same-origin/signed-session/IP limits are implemented. A public unallowlisted callback launch requires practical bot protection and approved operating rules first.

Public callback server-only JSON schema (`CREW_BUSINESS_CALLBACK_CONFIG`):

```json
{"enabled":false,"business_id":"aw_creatives","number_role":"aw_business_number","specialist_id":"awc_concierge","reviewed":false,"agentId":null,"agentVersion":null,"fromNumber":null,"destinations":[],"allowance":{"approved":false,"id":null,"cap":null,"expiresAt":null,"approvedBudgetUsd":null,"conservativeCostUsd":null,"maxDurationSeconds":120}}
```

Destinations, configured privately, use `phone`, `operatorVerified:true`, `consented:true`. Never commit filled configuration. Set `enabled:false` to stop callbacks without erasing reservation history. Public voice additionally requires `CREW_VOICE_BUSINESS_ID=aw_creatives`, `CREW_VOICE_SPECIALIST_ID=awc_concierge`, `CREW_VOICE_EXPIRES_AT` and existing reviewed/enable/agent/grant settings. Do not treat these documentation examples as approval to spend.

## Events

Added registry: `crew_specialist_started`, `crew_specialist_handoff_offered`, `crew_specialist_handoff_accepted`, `crew_specialist_handoff_completed`, `crew_sales_qualified`, `crew_consultation_requested`, `crew_demo_requested`, `crew_human_handoff_requested`. Sanitizer retains only business/demo ID, channel, source role and optional target role. Public prepared handoff emits offered/accepted/completed/started at real transitions; explicit consultation/demo/human requests emit intent. Private chat emits role started with its demo identity and retains truthful draft events. `crew_sales_qualified` is reserved for a configured, verified qualification rule; asking for Sales alone never fabricates qualification. Human requested does not mean a person was contacted. No transcript/contact/secrets/third-party analytics transport.

## Validation and continuation

Focused tests exercise public/demo isolation, distinct permissions, accepted/declined context, signed-session boundaries, callback consent/routing/atomic budgets, source/number-role changes, expiry, return policy, sanitized events, voice cleanup and no browser secrets. Desktop 1440/mobile 390/reduced-motion public interaction and retained private channel simulation were inspected. Evidence is in `docs/qa/flagship-crew/` and existing `docs/qa/prospect-channels/`.

Exact next milestone: **AWC — Real Estate Template Trio + Prospect Demo Factory Automation**. Build the three real-estate directions on this shared foundation. Live flagship launch and private remote delivery remain explicitly gated operational follow-ups; do not silently enable paid calls in the template milestone.
