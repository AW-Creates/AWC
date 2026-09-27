# AWC — Managed Realtime Voice Control Preparation + Progress/Cost Gate

Date: 2026-09-26. Status: offline preparation COMPLETE; STOP at Retell account/credential gate. No live calls, account creation, purchases, public endpoint, or provider acceptance claimed.

## Decision and preserved evidence

Retell is the first managed control, not a production commitment. The closed local acceptance report is `../voice-realtime/ACCEPTANCE.md`: first rendered audio 9.780s normal / 7.426s replacement, with CPU speech synthesis dominant. Preserve 28/28 business regressions, 19/19 browser checks, 45/45 normalized fictional fixture words, and complete scheduling across 11 responses. Human listening/microphone acceptance and matched Pipecat/LiveKit comparison remain unresolved. Do not rerun local speech benchmarks.

The existing Open-Source-First gate remains intact: this is a bounded comparison against already measured self-hosted evidence, not adoption of a paid dependency. A managed control can answer whether removing CPU TTS changes viability sooner than further tuning. Provider choice remains reversible; revisit only after a decisive Retell acceptance result. Usage-cap count is user-reported as repeated; exact historical count and token totals are unknown.

The mandatory Progress / Cost Gate is adopted in the versioned `../workflow/WORKFLOW-v3.2-README.md` and matching canonical `../../../_venture-ops/WORKFLOW-v3.2-README.md`. It applies to all current/future ventures. Two unsuccessful focused attempts, two usage-cap hits, two substantial runs without validated progress, a materially implausible target, deteriorating evidence/cost, or a cheaper decisive experiment require a pause/close and evidence-based choice. Any one-final-attempt exception needs a changed condition, high-confidence rationale, bounded budget and stop condition. Resets do not justify resuming the same approach. This is a mandatory operating policy, not a background usage monitor.

## Official Retell review (checked 2026-09-26)

| Question | Verified fact and source |
|---|---|
| Account/trial/card | New credit-based accounts receive $10 trial credit before adding a payment method, once per email address (including previously deleted accounts). At zero balance new calls are blocked. Confirm eligibility/balance in the actual workspace; keep auto recharge off. [Billing](https://docs.retellai.com/accounts/billing) |
| Pricing | Voice-agent headline range $0.07–$0.31/min; actual configured model, voice and add-ons determine cost. The page separately lists realtime models up to $0.345/min, so the headline range is not a universal ceiling. Browser calling avoids phone-number rental and PSTN transport. Verify the selected all-in rate before testing. [Pricing](https://www.retellai.com/pricing) |
| Credentials | Settings → API Keys → Add. Designate the callback signing key with “Set as Webhook Key.” Keys support scoped permissions. Keep API keys server-side. [Key management](https://docs.retellai.com/accounts/manage-api-keys) |
| Browser/phone | Dashboard web-call testing uses the browser microphone/speakers with no phone number. Phone calls exist but PSTN is deferred. A custom browser SDK UI is unnecessary for the first control. [Web calls](https://docs.retellai.com/deploy/web-call) |
| Business integration | Custom functions send `{name, call, args}` to a public endpoint; retain the wrapper. Verify the raw body using the official SDK and X-Retell-Signature. Disable retries. Interrupted function requests still execute, so AWC must enforce approval/idempotency. [Custom functions](https://docs.retellai.com/build/single-multi-prompt/custom-function) |
| Other integration | Call lifecycle webhooks can supply end/analysis evidence. A custom LLM WebSocket can keep response generation wholly in AWC if needed later; it is unnecessary for this smallest callback control. [Custom LLM](https://docs.retellai.com/integrate-llm/overview), [web-call events](https://docs.retellai.com/deploy/web-call) |
| Data | Retell defaults to storing recordings/transcripts/logs and offers Basic Attributes Only plus retention controls. Opting out does not stop sensitive payloads reaching webhooks. Use fictional business/person data only, obtain human tester recording agreement, keep evidence outside Git, never send keys in prompts/metadata. For acceptance audio, deliberately select storage and export promptly; do not confuse provider metrics with physical listening. [Storage](https://docs.retellai.com/accounts/privacy-disable) |

## Ownership and replaceability

AWC owns the fictional BrightHome profile/FAQs, deterministic quote arithmetic, slot conflict rules, approval capability, conversation context, handoff/escalation records and summary/outcome. Existing `experiments/receptionist/app.py` remains authoritative. Retell provides managed recognition, speech, turn-taking and tool transport. Provider-generated prices, booking claims and summaries are not authoritative records.

The neutral dispatcher consumes validated tools and returns AWC facts. The Retell boundary alone handles signature/envelope/function declarations. Replacing Retell later changes that boundary rather than pricing, calendar or handoff rules. The existing local app is not exposed. One synthetic call at a time; in-memory demo state is not production tenancy or persistence. Sales/human tools retain local context and explicitly do not contact anyone.

Bookings require a separate local operator approval of the exact pending request; neither a spoken “yes” parsed by the model nor `confirmed=true` is sufficient. This preserves the earlier human-review safety requirement. A natural voice-only booking flow remains out of scope. An interrupted pending request must be invalidated before approving a replacement.

## Strict first managed acceptance script

This script is for the NEXT authorized milestone. Preparation makes no billable requests.

Preflight: verify trial balance, auto recharge OFF, no subscriptions/phone number, configured all-in rate <= $0.50/min, max call duration 120 seconds, and no other usage in this workspace. Target/hard initial budget $3 including consumed free credits: three calls × two minutes × $0.50/min = $3 worst-case metered usage. Stop sooner when evidence is decisive. Never exceed $5 without explicit user approval; this plan does not authorize increasing the $3 cap. If taxes/extra fees or the configured rate invalidate the bound, shorten the plan before calling. No automatic reconnect, reload, retry, batch job, paid simulation or analysis rerun. Hard session window: 30 minutes including setup/review. A failed setup gets at most two focused attempts under the gate.

1. Call 1 (<=120s): ask hours/insurance/service area naturally; interrupt an answer with a replacement question. Request a three-bedroom deep-clean estimate: exactly $225 demo USD from AWC. Finish the response and inspect the summary.
2. Call 2 (<=120s): request available slots; prepare first-slot booking. Verify no booking before local exact approval, then approve and request confirmation. Try the same unavailable slot and a duplicate request; no second booking. Request sales handoff, then human escalation. Quote/booking/context must survive and no real person is contacted.
3. Call 3 (<=120s): natural human-mic speech and correction/negation, interruption during a booking proposal, stale approval rejection, replacement response and full sentence completion. Capture final outcome. Use preserved fictional phrasing from the closed acceptance report rather than inventing a different test domain.

Before EACH call record starting balance/cumulative actual cost, remaining budget, agent version/model/voice/rate and duration setting. After EACH call end it explicitly, verify ended status and actual cost in Retell, then reconcile AWC state with transcript. Do not start another call while cost is unknown or a prior session remains active. Dashboard calls are manually controlled: the offline harness cannot enforce Retell account-wide spend. The provider duration limit and deliberate cost reconciliation are mandatory live safeguards.

Measure end of user speech to first physically audible response (target <=1.5s); normal perceived turns and replacement first audio ~1–2s. Confirm natural interruption stop, speech recognition without exaggerated pacing, and no sentence truncation by listening to complete recorded playback. UI events/provider latency fields alone cannot pass acoustic acceptance. Report per-turn values, not only an average. Quote/booking/handoff business safety must be 100% in tested scenarios; any violation fails immediately. Mark unavailable audio/human evidence UNRESOLVED, never PASS. Save recording and measurement artifacts outside Git and verify both audio and video if video is used.

Close decisively PASS only if all targets and human acceptance pass; otherwise FAILED / NOT DEMO-READY or explicitly unresolved. No open-ended tuning or automatic provider expansion.

## Exact account/credential gate

User action: create only a [Retell account](https://dashboard.retellai.com/), inspect the trial balance, leave auto recharge off, and create an API key under Settings → API Keys. Save it locally as `RETELL_API_KEY` in ignored `AWC/.env` or a server environment; do not paste it into chat. Set that key as the webhook key, or store a separately designated key as `RETELL_WEBHOOK_API_KEY`. No OpenAI key replacement is needed.

Eligible new accounts can test on the documented $10 trial without a card. If the account lacks the trial, requires payment unexpectedly, or has a different billing model, STOP and report that exact gate; no credit purchase/card entry is authorized. No phone number is required for browser tests.

After credentials are available, the next task configures a dedicated fictional Retell agent and its `RETELL_AGENT_ID`, starts the isolated adapter, and supplies a temporary public HTTPS callback URL (`RETELL_PUBLIC_BASE_URL`). Localhost/private endpoints are blocked by Retell. Expose only the authenticated callback service, never the old app or operator approval. These are known setup steps, not additional provider accounts requested now. Install the official Python `retell-sdk` verifier in the existing isolated voice environment if absent and validate it before exposing a callback. Use narrow key scopes for agent setup/calls/history; no phone permissions. Dashboard setup and any tunnel remain unexecuted in preparation.

Next milestone: **AWC — Retell Managed Realtime Voice Acceptance**, only after credentials are available. Vapi, direct ElevenLabs, Bland, Firebase, Cloud Run, GPU hosting, CPU retuning and matched-framework work stay deferred.

## Offline closeout validation (2026-09-26)

Preparation COMPLETE; stopped at the credential gate. No account, provider request, public endpoint, live call, purchase or spending performed.

- 12 Retell contract/security tests pass against the existing AWC business module; 9 existing business/safety tests pass (21 combined).
- Coverage: raw-body/header verifier contract; missing/invalid signature and missing key/SDK fail closed; wrong call/agent; strict arguments and forged approval; stale/expired/cancelled proposal; duplicate booking/handoff; conflict at proposal and local approval; deterministic $225 quote and latest quote state; handoff transcript/context; closed-call outcome; duration/retry configuration; local environment loading.
- Fixed reproduced stale availability/summary reads after approval and stale quote state after a repeated quote. Side-effecting booking/handoff replay remains idempotent. Fixed harness loading ignored root .env before credential checks, preserving explicit environment values.
- Official retell-sdk is absent. SDK delegation was tested with a fake verifier, not genuine cryptographic signatures. Install and verify the official SDK offline before exposing any callback in the NEXT milestone. This is preparation readiness, not live provider acceptance.
- Approval is local operator authority. Callback transcript changes invalidate proposals only when received; the operator must cancel pending review on interruption/negation and inspect current intent before approval. No automatic voice-only booking is authorized.
- Original closed business-regression artifact retained; generated timing-only changes from the interrupted run were discarded. No CPU benchmarks repeated.
- Live microphone/listening, audio playback, provider configuration acceptance and actual costs remain unmeasured; they belong to the next capped milestone.
