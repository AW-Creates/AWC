# First pilot scope and offer

Design decision: 2026-09-28. Internal delivery plan, not a public price or production-ready claim.
Human offline rehearsal accepted from the user's successful PASS report. Presentation timing was not measured.

## Ideal client and eligibility
First choice: one local residential cleaning business, one location/time zone, English-language inbound calls, an owner who can approve facts and respond to escalations. This is closest to the existing catalog and estimate fixtures, but no demo price or insurance claim transfers to a client.

Good fit requires all of: recurring inbound leads; at most six clearly described services and two add-ons initially; repeatable FAQs; a bounded service area; at most two deterministic estimate rules; one authoritative calendar; simple appointment durations and buffers; a named primary and backup human; willingness to review calls daily and approve the test plan. Target 20 or more eligible calls during the pilot for directional evidence, without guaranteeing volume.

Not yet a fit: emergency dispatch, medical/legal/financial advice, hazardous work, multi-location dispatch, complex crew/travel optimization, variable prices requiring site inspection presented as fixed quotes, identity-sensitive account changes, payment collection, unsupported languages, or no reliable fallback. Pressure washing, lawn care and detailing are possible later only if they meet the same boundaries; handyman diagnosis is not assumed to fit.

## Offer
One inbound voice forwarding path for overflow OR after-hours, chosen at intake. Existing business number stays under client control. No outbound campaigns or number purchase in this milestone.

The configured receptionist identifies itself as AI, answers approved FAQs, explains the approved catalog, captures minimum callback details and service needs, and gives approved deterministic estimates with scope and exclusions. Unknown facts, add-on pricing and out-of-range inputs go to a human. No invented price, discount, insurance, guarantee or availability.

Booking scope: collect preferences and propose authoritative calendar availability only after integration passes. A designated human must approve through an authenticated, implemented workflow; recheck the slot before committing and confirm only on successful calendar write. Caller speech alone cannot approve. The existing voice page has no such approval control. If this workflow cannot pass, explicitly re-scope and re-sign as appointment-request capture before launch; never sell that as confirmed booking. Cancellations/reschedules are human requests initially.

Handoff means a delivered summary to the agreed monitored destination with delivery verification and a backup path. Live transfer is excluded unless separately scoped and tested. A local demo record is not delivery. Give the approved callback expectation, not an instant-response promise. During covered business hours propose a two-business-hour response target; after-hours propose the next business day by noon local time. Client must approve and staff these targets or set alternatives before launch.

Summaries include reason, service, approved estimate context, appointment request/status and next action; access is restricted. Recording/transcription, retention and delivery require privacy approval. No promise of indefinite storage. Follow configured holidays/hours; no after-hours booking or response promise outside approved rules.

## Duration and support
14 calendar days from signed go-live, not from intake. Review days 3, 7 and 14. This limits exposure while providing two weekly cycles; it is a proposed learning window, not statistical proof. If fewer than 20 eligible calls arrive, report insufficient volume; any extension needs a new duration/budget approval, never automatic renewal.

AWC reviews outcomes and spend daily, provides a named contact and one scheduled configuration correction window per business day. No 24/7 support or uptime SLA. Business-hours support acknowledgement target: one business day. Safety failures require immediate routing fallback when detected; automated fallback and alerts must cover times AWC is unavailable.

Excluded: autonomous booking approval, emergency triage, payments/refunds, contracts, outbound marketing, CRM dashboard/integration, multilingual or multi-location routing, complex quoting, unlimited changes, revenue guarantees and production reliability claims unsupported by testing.

## Commercial and readiness links
[Cost model](PILOT-COST-MODEL.md), [intake](PILOT-ONBOARDING-INTAKE.md), [gaps](PILOT-READINESS-GAPS.md), [acceptance](PILOT-ACCEPTANCE-PLAN.md), [risk checklist](PILOT-RISK-DISCLOSURE.md), [launch and outreach gate](PILOT-LAUNCH-SEQUENCE.md).
