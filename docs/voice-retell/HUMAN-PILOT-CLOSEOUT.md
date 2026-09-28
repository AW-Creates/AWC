# Human Demo Rehearsal & Pilot Requirements — checkpoint

2026-09-28. Technical/document deliverables validated; human end-to-end acceptance pending.
This is a backed-up checkpoint, not a CLOSED PASS milestone.

## Recovery / backup

Clean main, saved origin/main and freshly queried GitHub main matched at
`06f26f5d1a8a2beee6d5e1128be67bdbbad1b60c`. The SHA supplied in the request had a
transcription difference. No unnecessary initial push. Final commit and remote equality
are reported in the task response; resolve the saved checkpoint with `git log -1`.

## Delivered

- OPERATOR-RUNBOOK.md: five-minute checklist; exact Windows folder/terminal/start steps;
  PASS marker; numbered-scene presentation guidance; conditional browser-call steps;
  mic/tunnel/provider troubleshooting; clean stop; balance/cost checks; no-demo rules.
- DEMO-SCRIPT.md: missed-call value first, greeting, knowledge boundaries, estimate,
  safe booking, escalation, fictional disclosure, client configurability and AWC/Retell roles.
- `rehearse.py --present`: readable numbered results rather than diagnostic JSON.
  Default JSON output preserved. Added configured greeting, injected-clock expiry of
  a second proposal, local sales handoff, synthetic transcript excerpt and ended outcome.
  Real business tools run with temporary synthetic state; no model/audio claim.
- FIRST-PILOT-REQUIREMENTS.md: A–K checklist, critical launch gates, explicit exclusions.
- PILOT-CLIENT-TEMPLATE.json: non-executable intake, mapping all 13 demo profile fields,
  placeholder-only credentials, empty real slots/quote support until implementation.
- READINESS-SCORECARD.md: demo evidence versus pilot requirements and deferred scope.

## Validation

34 focused unittest tests PASS across test_service_catalog, test_operator and
 test_retell_adapter: catalog list/explain/compare/unknown, slot expiry/changed turns,
booking authorization/conflicts, startup failure/cleanup/readback and signed probes.
Offline numbered rehearsal PASS in requested sequence: Ava/BrightHome greeting;
services; deep scope; comparison; unknown; insurance; prior interruption explanation;
$225 quote; availability/local approval; expired second proposal; sales/human follow-up;
transcript/summary/outcome. Caller-only confirmation and duplicate slot are checked.
Default JSON mode and intake parse/field coverage are checked before commit.
Actual nonbillable operator preflight PASS: signed callback, URLs, identity and catalog.
After cleanup, no listeners on 8766/8767 and no cloudflared process observed.
No historical benchmarks rerun. Prior dependency deprecation warning is nonblocking.

## Human feedback / remaining acceptance

User: opening is clear; needs help starting/showing the demo. Added exact start and
scroll instructions and readable results. User subsequently said they have not run it.
Do not represent that as a successful human rehearsal, measured 3–5 minute delivery,
or accepted independent operator usability. Exact next action: user runs the command
in the runbook, presents the numbered scenes aloud, and reports PASS plus any confusing
steps and elapsed time. Apply bounded wording fixes, then record human acceptance.

## Progress / Cost Gate

One bounded Builder for the pilot docs and one read-only Validator; no broad research.
New rehearsal check initially used the wrong handoff field path; corrected to context.quote,
then passed. A documentation edit hit Windows default text encoding; explicit UTF-8 fixed it.
No blocker survived two focused corrections. Network sandbox restriction on initial GitHub
query resolved through authorized escalation. No paid calls/text tests needed; spend $0.00.
Consumed allowance ledger preserved. Current account balance/rate not checked.

## Exact pilot gap and next milestone

Need approved real business facts/prices/policies, implemented and verified client quote
rules, authoritative real booking integration, delivered escalation with fallback,
secure client credentials, approved recording/data rules, authorized telephony routing,
and owner-accepted failure/accuracy/voice/cost tests. Intake is not a runtime configuration.
Next milestone recommendation, only after human acceptance: **AWC — Pilot Scope &
Acceptance Design**, using the checklist to agree one service business workflow and
its acceptance criteria. No outreach, purchasing, integration deployment or actual
client onboarding is authorized by this recommendation. Stop here.
