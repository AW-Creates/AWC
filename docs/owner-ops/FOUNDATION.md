# Prospect Demo Factory & Owner Ops — foundation contract

2026-10-08. Baseline: canonical AWC `deac07194c64f6d196eb44f94632057246bdb1cc`, local/origin/fresh GitHub main equal and clean. Public Site version 8 remains unchanged. This bounded milestone delivers the local owner-workbench slice; it does not claim a fully automated factory or production CRM.

## Acceptance contract

- Persistent prospect workspaces, manually selected niche and source-linked business facts.
- Transparent multi-vertical priority scores with explicit owner inputs.
- Original reusable concept template generation from reviewed facts.
- Prospect-specific specialist identity, role, personality/tone, approved capabilities and draft handoff destinations.
- Invalid role permissions rejected; unreviewed/stale previews blocked.
- Local noindex preview with honest absence of verified remote protection.
- Meaningful persistence/provenance/permission/API tests and real desktop/mobile browser flow.
- Source/reuse audit, portability boundary, state update and clean Git backup.

No paid calls, automated scraping, outreach, purchases, client onboarding, production booking/payment actions or CRM rebuild. One bounded read-only Architect audit; implementation and Director validation stay with the primary agent.

## Data and flow

`ProspectWorkspace` is a UUID with business name, niche, website, objective, owner notes, next action, stage and input revision. `PublicSource` records URL/title/excerpt/date/manual-capture method and review status. Each `BusinessFact` references a captured source ID. Creative concept direction is separate from sourced facts.

`CrewConfig` defines name, role, tone, language/voice planning preferences, role-limited capabilities and target handoff roles. It extends the principles of the existing `docs/crew/CLIENT-SPECIALIST-TEMPLATE.json` without replacing that planning template or Autumn exports. Current supported roles: Customer Experience, Lead Qualification, Scheduling, Support.

Current capabilities: answer reviewed service/FAQ facts; ask a bounded service-interest question; prepare an owner-review quote/scheduling request where that role and capability permit it; prepare a Scheduling/Support/owner handoff draft. No tools perform external actions. No invoice prices, listing availability, calendar slots or revenue guarantees are invented.

`inputRevision` increments on updates, invalidating source review. Owner review records `reviewedRevision`. Generation records `builtRevision` plus a SHA-256 input hash. QA requires the current revision, reviewed facts, and matching artifact. Preview/chat return a conflict for stale concepts. PATCH uses optimistic revision checking to protect simultaneous owner edits.

`HandoffRecord` stores prospect ID, destination, request, timestamp, `status:local-draft`, `contacted:false`, `externalAction:false`. It carries one current request, not a live multi-specialist conversation or delivery confirmation. SQLite foreign keys keep drafts tied to their workspace. JSON export includes workspaces and drafts; automatic restore is deferred.

## Interface boundary for future owner ops

Keep prospect tracking separate from consent-bound public visitor inquiries and future client workspaces. Local `list/get/save/handoffs` interfaces are the first persistence seam. A later verified CRM adapter can implement `listContacts`, `upsertContact`, `listPipelineStages`, `moveProspect`, `recordActivity` and `requestHandoff`; authorization and result status must be explicit. Do not attach visitor transcripts or change retention without a separate design.

Revenue track: use a focused website/workflow offer and a reviewed concept to learn what prospects need. Platform track: build the smallest owner module required by real delivery. The local tool is an internal resource, not a white-label CRM for sale.

## Deployment acceptance gate

Current runnable deployment is loopback-only with noindex headers/meta and robots disallow. It is not an authenticated remote demo. Before remote sharing: choose verified private hosting/access, separate owner controls from read-only prospect access, keep workspace data server-side, validate per-prospect authorization, verify unauthenticated denial, verify indexing headers and private URL, run browser QA on the deployed version, record source/build identity, confirm content rights and demo disclosures, then authorize any outreach separately. Merely hiding navigation or adding noindex is insufficient.

## Build versus buy

No new paid or third-party runtime dependency adopted. Node built-in HTTP/SQLite/crypto and existing Playwright capture runtime are sufficient for this small local slice. No benchmark or SaaS comparison would change its core acceptance question. This avoids deployment operations and payment/provider spending while validating the workspace/configuration/template interfaces. Revisit storage/auth/framework when authenticated remote access or multiple operators become an accepted need. Audit OSS licensing/security/maintenance/operating cost before adopting a CRM.

## Exact next bounded milestone

**AWC — First Verified Prospect Concepts & Private Demo Delivery**: select a small manual research batch; source-review real public business facts; generate/refine original concepts; implement authenticated private remote demo delivery and QA; locate exact Asynk/Twenty source before adapter adoption. No outreach until separately authorized. Voice acceptance remains separate with a new explicit numeric allowance.
