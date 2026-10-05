# Client onboarding intake specification

Blank reusable specification only. Keep completed forms, client data and approvals in restricted client storage, never Git. Pair with PILOT-CLIENT-TEMPLATE.json, which remains non-executable; this form adds commercial, routing and signoff fields without claiming code support.

For each section record value, source/document date, client approver and approval date. Required blanks block launch; explicitly excluded features may be N/A with reason. Collect secrets through an approved secure channel separately.

| Section | Required form fields / decision |
|---|---|
| Identity and greeting | Legal/display name, location, owner, exact greeting, explicit AI identification; agent name/persona, pronunciation, tone and English-only acknowledgement |
| Hours/area | Time zone, weekly hours, holidays, service radius/postcodes, excluded areas, after-hours response wording |
| Catalog | Stable service IDs/names, aliases, descriptions, inclusions/exclusions, add-ons, restrictions; maximum six services/two add-ons for first scope |
| Estimates | Per-service deterministic/estimate/human-review mode; approved inputs/bounds, formula, minimum, fees/taxes, rounding, validity, exclusions and worked expected totals; maximum two rules |
| Appointment rules | Duration/buffers, lead time, blackout dates, capacity, travel constraints, stale proposal expiry, conflict/retry behavior, approval authority, cancellation/reschedule human route |
| Calendar | Provider/account owner, authoritative calendar, timezone, integration compatibility, least-privilege access owner, sandbox/test availability; no credentials here |
| Human paths | Primary/backup contacts, allowed delivery destination, staffed hours, acknowledgement target, urgent and unreachable fallback; actual receipt test owner |
| FAQs/policies | Approved insurance language/evidence, supplies/access/pets, payment methods, guarantees, cancellation and safety policies; forbidden/unknown answers |
| Recording/consent | Business/caller jurisdictions to review, recording on/off preference, notice/consent and refusal handling, reviewer and legal/privacy approval reference; preference alone is not legal approval |
| Transcript/data | Separate recording/transcript/summary settings, permitted fields, recipients, storage region requirements, retention days, deletion owner/process, access controls and vendor approval |
| Phone routing | Existing number owner, forwarding permission, overflow vs after-hours, fallback destination, voicemail, rollback procedure, provider capability and expected transport charges |
| Support/commercial | 14-day dates, named AWC contact, support hours, review dates 3/7/14, included minutes, test and total cash caps, price structure and change boundaries |
| Secure provisioning | Credential owner, secure-store reference and environment-variable names only; rotation/revocation owner; no passwords, tokens or recovery codes |

## Required signoffs (versioned, dated, separately attributable)
- [ ] Client approves exact greeting, every FAQ/fact and catalog statement Autumn may state, including source evidence. No BrightHome assertions carried over.
- [ ] Client approves what must defer: uncertain prices, unsupported service, disputes, reschedule/cancel, sensitive actions and urgent concerns.
- [ ] Client and AWC approve booking mode: implemented human-authorized calendar booking OR explicitly re-scoped request capture, with corresponding offer/test changes.
- [ ] Client accepts test cases, numeric success thresholds, data handling and evaluation method in PILOT-ACCEPTANCE-PLAN.md.
- [ ] Authorized legal/privacy review clears jurisdiction-specific telephony/recording/transcription decisions; record reference, not privileged advice in Git.
- [ ] AWC approves technical prerequisites, cost reserve/caps, monitoring and rollback; client approves routing and fallback staffing.
- [ ] Client approves frozen config version and pre-launch results; AWC signs go/no-go. Changed facts/rules require versioned reapproval and affected regression tests.

Rejected, unverified or contradictory facts are marked HOLD and cannot enter runtime configuration. Completed intake is not launch authorization and cannot enable real bookings by itself.
