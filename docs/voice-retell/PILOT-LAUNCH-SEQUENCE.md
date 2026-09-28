# First-pilot launch sequence and outreach decision gate

Operator checklist; planning only. Client agreement is conditional interest, not authorization to spend, purchase or integrate. AWC owns the checklist; client approves facts/routing, designated reviewer clears privacy/legal requirements.

## From yes to live
1. **Intake:** verify fit using PILOT-SCOPE-OFFER.md; complete restricted intake, identify owner/backup, 14-day objective and expected call volume. Reject non-fit or re-scope explicitly.
2. **Data cleanup:** reconcile facts/catalog/aliases/policies; remove demo identity, prices, dates and claims. Obtain versioned client fact/defer approvals.
3. **Feasibility and commercial approval:** verify calendar, forwarding, host and delivery compatibility; estimate setup effort and all-in cash cost; agree fixed paid pilot structure, included minutes, test budget, total ceiling, reserve and support. Stop if scope exceeds bound.
4. **Configure profile/catalog:** implement and validate actual runtime mapping. Intake JSON is not loaded by production code. Keep completed data/secrets out of Git.
5. **Configure quotes:** implement up to two approved deterministic rules, bounds/fees/rounding and human-review cases; pass exact expected totals.
6. **Connect calendar and approval:** after explicit integration authorization, implement least-privilege authoritative calendar and authenticated human approval with conflict/stale/idempotency handling. If infeasible, re-sign request-only scope before proceeding.
7. **Prepare hosting and delivery:** persistent HTTPS callbacks, signature checks, redacted monitoring, summary delivery/backup, credentials/rotation and approved retention/deletion. Obtain legal/privacy approval before processing caller data.
8. **Configure routing:** after explicit routing/spend authorization, use agreed forwarding path; verify owner/voicemail fallback, holidays and rollback. Any required purchase is separately authorized; no assumption that a new number is necessary.
9. **Preflight:** verify current provider rate/balance, capped usage and reserve, auto-recharge choice, stable URLs/identity, access, calendar and alert receipt. Test restore/rollback. Resolve every mandatory gap.
10. **Acceptance calls:** run PILOT-ACCEPTANCE-PLAN.md offline first, then separately authorized bounded end-to-end test calls. Reconcile actual cost after tests. No reuse/reset of the consumed demo allowance.
11. **Signoff and go live:** client signs facts, scope, tests, privacy/routing and dates; AWC signs technical/cost readiness. Freeze version, activate one path in a staffed window, verify first-call outcome and fallback. No go-live on critical HOLD.
12. **Monitor and close:** daily call/spend review; reviews days 3/7/14; pause on safety/cost/fallback failures. Day 14: stop or explicitly approve continuation, report results and operator time, follow retention/deletion policy. Do not renew silently.

Rollback at any live stage: disable AI forwarding to agreed human/voicemail destination, notify owner, stop new sessions, reconcile active calls/cost, restore last approved config, correct issue and repeat affected tests before approved resume. Keep restricted incident evidence under approved retention.

## Decision gate before outreach
| Gate | Current result | Required before outreach / what can wait |
|---|---|---|
| Product/demo readiness | PASS, bounded demo | User completed offline rehearsal; preserve fictional/demo disclosure; no fresh voice test needed for prospect discovery |
| Pilot scope/delivery design | PASS as design | One-business scope, exclusions, intake, cost model and tests defined; no guaranteed compatibility or launch date |
| Commercial/operator decision | OPEN decision, no engineering blocker | Before sending: AWC owner accepts this narrow conditional offer, capped pricing structure and own capacity to deliver/support one pilot; final client price can wait for feasibility |
| Outreach execution authority | NOT AUTHORIZED in this milestone | Separate user instruction for any contact; this task sends nothing |
| Mandatory production prerequisites | NOT READY | Hosting, PSTN, calendar/approval or signed request-only scope, delivery/fallback, monitoring, secrets, privacy, budget and client acceptance all required before launch; may wait until prospect agrees |

Result: ready to move into a bounded **AWC — First-Pilot Prospect Qualification & Outreach Preparation** milestone; conditional on owner acceptance of offer/capacity before outreach. No additional production build is a prerequisite to preparing or discussing a conditional pilot. Do not claim the system is live-ready, book an unconditional start date or promise an unsupported integration. Jurisdiction-specific client review can wait for a known prospect, but must precede production decisions; outreach itself needs its own channel/permission review if later authorized.

Exact next action in a fresh task: read PROJECT_STATE.md and this gate, obtain/record the owner's offer and capacity decision, then prepare a narrow qualification checklist and reviewable outreach materials. No sending, purchases or production integration automatically.
