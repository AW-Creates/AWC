# Demo to first live pilot gap map

2026-09-28; statuses describe current evidence. No production integrations executed.
READY NOW applies only to the exact evidence named. Client-dependent work may wait until conditional prospect agreement, but all mandatory launch gates must pass before receiving callers.

| Area | Classification | Owner / completion evidence | When |
|---|---|---|---|
| Offline demo / operator rehearsal | READY NOW | User reports final offline PASS; prior focused tests preserved | Before outreach: met |
| Pilot offer, fit and test design | READY NOW | This reviewed document set; scope is conditional | Before outreach: met |
| Real identity/catalog/FAQ | CLIENT DATA REQUIRED | Client signs exact facts and sources | After agreement, before launch |
| Client quote engine | CONFIGURATION REQUIRED | AWC implements approved formulas and tests; JSON labels alone insufficient | Before launch |
| PSTN/forwarding | INTEGRATION REQUIRED | AWC/client prove inbound path, permissions and fallback; costs approved | Before launch |
| Persistent public callbacks | INTEGRATION REQUIRED | AWC deploys stable HTTPS host, signed callbacks, health checks, restart/readback; temporary tunnel is insufficient | Before launch |
| Calendar and human approval | INTEGRATION REQUIRED | Authoritative read/write, authenticated approver, stale/conflict/idempotency tests; no current voice approval UI | Before launch unless signed request-only re-scope |
| CRM | DEFERRED | Excluded; delivered summary is sufficient for this pilot | Only separate future scope |
| Monitoring/logging | INTEGRATION REQUIRED | AWC proves redacted logs, error/cost alerts, receipt and daily review | Before launch |
| Recording/transcript/privacy | LEGAL/PRIVACY APPROVAL REQUIRED | Client and designated reviewer approve jurisdiction, settings, access, retention and deletion; verify implementation | Before launch |
| Delivered escalation | INTEGRATION REQUIRED | Primary/backup receipt and timeout path tested; local record insufficient | Before launch |
| Hours and holidays | CONFIGURATION REQUIRED | Approved client schedule and fallback wording tested | Before launch |
| Outage behavior | INTEGRATION REQUIRED | Provider/host/notification failure routes to client-owned human/voicemail, with alert | Before launch |
| Cost controls | CONFIGURATION REQUIRED | AWC verifies current rate, numeric caps/reserve, automatic cutoff and routing fallback | Before any paid testing / launch |
| Credentials/rotation | CONFIGURATION REQUIRED | Separate production credentials, least privilege, secure storage, tested revoke/rotate; no secrets in Git | Before launch |
| Backup/rollback | CONFIGURATION REQUIRED | Versioned sanitized config; restore previous approved version and forwarding rollback exercised | Before launch |
| Support/runbook | CONFIGURATION REQUIRED | Named coverage, escalation contacts and incident steps rehearsed with owner | Before launch |
| Client test/signoff | CLIENT DATA REQUIRED | Approved expected answers and dated acceptance report | Before launch |

Persistent hosting, integration implementation and production reliability remain unproven. Do not substitute past mock tests for these checks. No technical build is mandatory merely to ask eligible prospects about a conditional pilot; no promise of a launch date or compatible calendar until feasibility review.
