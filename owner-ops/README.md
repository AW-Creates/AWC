# AW Creatives Owner Workbench

The local first slice of **AWC — Prospect Demo Factory & Owner Ops Foundation**. It is a usable owner tool, not a production CRM or an automated outreach service. Canonical company positioning remains [AWC positioning](../docs/brand/AWC-POSITIONING.md).

## Run

From the AWC repository, with Node 24 or later:

```powershell
node owner-ops/server.mjs
```

Open the printed `http://127.0.0.1:4186/` URL. No package installation, external credentials, paid provider calls or build step are required. Stop with Ctrl+C. Optional `OWNER_OPS_PORT` changes the loopback port; optional `OWNER_OPS_DATA_DIR` chooses an absolute private data folder. Never point a custom data directory at synced sources or a tracked repository directory.

```powershell
node --test owner-ops/tests/foundation.test.mjs
```

## Use

1. Start with the three fictional examples, or add one prospect manually.
2. Enter a public source URL, capture date, a short evidence excerpt and supported business facts. This version does not fetch or scrape websites.
3. Choose an original concept template and customize the specialist's name, role, tone, language/voice preferences and permitted capabilities. Language and voice are planning preferences; prepared demo answers remain English text.
4. Confirm you reviewed the source facts and configuration. A source reference does not prove a fact is true: owner review is the acceptance step.
5. Generate a local concept and open it. Try a service question, interest qualification, scheduling/support request or human request using fictional details.
6. Return to the owner workspace and refresh drafts. Requests are local records; no calendar, person or external tool is contacted.
7. Export the workspace as JSON for portable backup/inspection. Export includes source provenance, configuration and local drafts. Automatic JSON restore/import is not implemented.

Saving facts/configuration/priority invalidates the review and preview. Review and regenerate before using an updated concept. Concurrent edits with an old revision are rejected rather than silently overwriting newer work.

## Persistence and access

SQLite records and generated HTML live in ignored `owner-ops/.local/`. They are deliberately separate from the public Site's visitor inquiry/transcript database. They survive a server restart. Generated pages use stable workspace IDs and are served only while their input hash/revision and source review are current.

The server binds to `127.0.0.1`, validates Host and same-origin JSON actions, has no CORS grant, and uses noindex/nofollow/noarchive headers plus demo meta tags. **Loopback access is not authenticated production access**: other users/processes on this machine may access it. Noindex alone is not privacy. Do not expose this server through a tunnel or deploy it as an owner portal. Private remote authentication, tenant authorization, deployment and indexing verification remain a separate milestone.

No real contact records are seeded. The examples and domain names are fictional. Do not enter secrets, payment details or sensitive personal data. The local database is not encrypted or automatically backed up. Use an appropriately protected owner-controlled location for exports. Raw screenshots in the repo use synthetic data only.

## Implemented boundary

Three original template families now have distinct industry structures: cleaning/home services (friendly aqua service cards), real estate (buyer/seller paths and local/property context), and a professional design studio (navy editorial expertise). Each uses original illustrative SVG artwork; real prospect concepts require relevant rights-cleared photography and finer niche customization. These are original website concepts, not scraped recreations or endorsed client sites. Specialists use deterministic reviewed facts and permission-checked prepared replies. Scheduling/Support handoffs create drafts describing the target role; a second live specialist is not launched. Owner handoffs have `contacted:false` until a future integration supplies verified delivery evidence.

The existing Autumn provider, public website, service prices, voice allowance and disabled hosted voice remain unchanged. CRM, inbox, booking, quotes/invoices, social tools and live multi-specialist execution are future adapters/modules. See [foundation architecture](../docs/owner-ops/FOUNDATION.md) and [reuse audit](../docs/owner-ops/REUSE-AUDIT.md).

## Browser verification

Run `node owner-ops/scripts/browser-qa.cjs` with existing Playwright and Chromium. Override `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE_PATH` if the pinned local runtimes are unavailable. The runner uses an isolated temporary synthetic database, verifies flows in four viewport/theme combinations, saves screenshots/results under `docs/qa/owner-ops/`, and cleans up its temporary data. No runtime dependency install is required for the owner workbench itself.

The persistent floating Crew widget supports contextual entry points, keyboard close/focus return and conversation preservation while the page stays open. Talk here / Call me are disabled. Expand Conversation context & voice options to inspect the bounded local continuity summary; no microphone, phone collection or provider request occurs. See [approved direction and acceptance](../docs/owner-ops/NICHE-TEMPLATES-AND-CONTINUITY.md). Browser QA now saves new evidence under `docs/qa/niche-templates/`; prior foundation evidence stays intact.
