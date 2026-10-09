# Owner operations reuse audit

2026-10-08. Read-only Architect audit. Source paths and scope are evidence, not inferred from project names.

## Verified existing AWC reuse

| Source | Reuse | Boundary |
|---|---|---|
| `docs/crew/CLIENT-SPECIALIST-TEMPLATE.json` | Custom identity/voice/brand/business knowledge, rules and disabled channels | Planning-only; preserved unchanged. New local config implements a narrower tested subset. |
| `website-receptionist/src/facts.mjs` / `offers.mjs` | Reviewed facts and service/rule separation | Do not mix AWC offers or Autumn knowledge into a prospect's business facts. |
| `website-receptionist/src/worker.mjs` | Validation, escaped output, clear result statuses, privacy/action boundaries | Existing public endpoints/owner authentication unchanged. |
| `website-receptionist/db/schema.ts` | SQLite persistence patterns | Narrow visitor inquiry schema, not a multi-client CRM; no transcript or inquiry-data migration. |
| `scripts/content-capture/` | Verified browser recording and playback verification | Synthetic data only; raw footage outside Git. |

## Asynk / Twenty candidate source unresolved

No Asynk/Twenty checkout appears in canonical `AW-Creates-Ventures`; `repos.tsv` names six other repos. `docs/workflow/WORKSPACE_README.md` explicitly excludes Asynk pending intended-source identification. Additional bounded discovery of immediate directories beneath `Documents/Web Development` and their child directories found no Asynk/Twenty named candidate.

Therefore local commit, license, commercial-use obligations, reusable CRM components, maintenance/security state and runtime requirements cannot be verified here. Do not guess licensing or copy a similarly named remote repo. No paid service/OSS framework adopted and no source rebuilt. Next source audit requires the exact existing repository path or URL; then compare contacts/pipelines/workspaces/workflows, license obligations, operating cost, authorization and data portability against observed delivery needs. Remote vendor-currentness claims have not been made.

This missing source does not block the independent small local foundation. The adapter seams are documented rather than pretending a production CRM already exists.
