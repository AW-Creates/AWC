# First Pilot Client Requirements

Use this checklist before onboarding the first real service business. Blank items are launch blockers unless the owner explicitly approves a documented fallback.

## A. Business profile
- [ ] Legal name: `{{LEGAL_BUSINESS_NAME}}`; display name: `{{DISPLAY_BUSINESS_NAME}}`
- [ ] Phone greeting, agent name, business hours, time zone, service area
- [ ] Primary contact, escalation contact, and after-hours behavior

## B. Service catalog
- [ ] Service names and caller aliases
- [ ] Plain-language descriptions, inclusions, exclusions, add-ons, restrictions
- [ ] Pricing mode and quote rules for each service
- [ ] Approved unknown-service response and human follow-up path

## C. Pricing
- [ ] Mark each service as deterministic quote, estimate only, or human review
- [ ] Define permitted inputs, minimums, surcharges, taxes/fees, and rounding
- [ ] Ava must never invent a price or promise an unapproved discount

## D. Booking
- [ ] Calendar/booking provider and account owner
- [ ] Appointment durations, working hours, lead time, blackout dates
- [ ] Conflict, cancellation, reschedule, and stale-slot rules
- [ ] Explicit confirmation language and final booking authority

## E. FAQs and policies
- [ ] Insurance statement, payment methods, guarantees, service limits
- [ ] Cancellation, access, pets, supplies, safety, and other approved policies

## F. Handoff and escalation
- [ ] Sales contact, urgent-issue route, human follow-up SLA
- [ ] Unavailable-hours message and callback capture fields
- [ ] Conditions that always require a human

## G. Integrations and credentials
- [ ] Identify required calendar, CRM, telephony, and notification integrations
- [ ] Store secrets only in the approved secret manager/environment; never in this file
- [ ] Demo-only Retell/OpenAI credentials are separate from client production credentials
- [ ] Record only environment variable names and credential owners in the intake template

## H. Telephony (deferred until approved)
- [ ] Production number requirement, forwarding/porting plan, caller ID, business hours
- [ ] Do not purchase, port, or configure a number until launch approval

## I. Privacy, consent, and data
- [ ] Recording notice and consent wording approved
- [ ] Transcript/summary retention period and deletion owner
- [ ] PII handling, access controls, and what may be stored/shared approved by client

## J. Pilot acceptance criteria
- [ ] Test calls pass greeting, discovery, service explanation, quote, booking, handoff, and fallback
- [ ] Quote accuracy threshold: `{{QUOTE_ACCURACY_THRESHOLD}}`
- [ ] Booking accuracy threshold: `{{BOOKING_ACCURACY_THRESHOLD}}`
- [ ] Human escalation success threshold: `{{ESCALATION_THRESHOLD}}`
- [ ] Acceptable latency/naturalness threshold: `{{VOICE_THRESHOLD}}`
- [ ] Monthly/per-call cost ceiling: `{{COST_CEILING}}`
- [ ] Failure and fallback behavior demonstrated and approved
- [ ] Client owner signs acceptance: `{{CLIENT_APPROVER}}`, date `{{APPROVAL_DATE}}`

## K. Explicitly not required for first pilot
Full CRM dashboard, broad outbound campaigns, multi-location support unless required, advanced analytics, automated marketing, custom mobile apps, and other expansion work.

## Demo-ready versus production-ready
The current BrightHome flow is a fictional, offline/demo profile. Demo readiness proves the talk track and safety behavior. Production readiness additionally requires completed client data, approved privacy/consent terms, client-specific integrations and credentials, telephony decisions, acceptance tests, and owner approval.

## Demo field replacement map
The client template maps every current `demo_business.json` top-level field: `agent_name`, `business_name`, `hours`, `service_area`, `insurance`, `policies`, `handoff_rules`, `slots`, `quote_supported_services`, `services`, `add_ons`, `quote_scenarios`, and `booking_conflict_scenario`. The replacement map is configuration guidance only: replacing JSON does not alter the hardcoded quote engine. `slots` and `quote_supported_services` remain explicitly empty until provider and quote implementations exist; do not imply pilot readiness from populated labels alone.

Booking approval must define conflict handling, rescheduling, stale-slot recheck, and the final booking authority. Credential intake records the owner and secure-store reference only; it never stores a secret. CRM is optional when the pilot has no CRM need.

Pilot acceptance requires zero unauthorized actions, zero wrong prices, and zero duplicate bookings. The client owner must fill numeric latency and cost ceilings. A waiver may document a fallback, but cannot bypass critical privacy, security, or booking gates.
