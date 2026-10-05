# AWC Project State

Updated 2026-10-05 (America/New_York). Canonical repo: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC`, branch `main`.

## Current milestone

**AWC — Crew Branding + Autumn Website Voice Concierge MVP: source implementation validated; live voice activation/publication deferred.** Bounded work stops at this checkpoint. Do not claim audible or public voice acceptance. Closeout: `docs/crew/WEBSITE-VOICE-MVP.md`.

## Locked brand / customization model

Crew is the product/platform; **Crew by AW Creatives** is the endorsement. Company remains **A. Wilcher Creatives LLC**. AWC is mostly internal shorthand. Category **Digital Workforce**; unit **Specialist / Digital Team Member**; technical term **AI Agent**. Customer Experience, Sales, Scheduling, Support are example roles, not the category. Avoid overusing receptionist publicly.

**Autumn Winters** is one demo Customer Experience Specialist: warm, capable, conversational, lightly witty, memorable without gimmicks. Optional direct-name joke only when appropriate, never forced/repeated. AI/demo disclosure remains explicit. Clients receive their own customized names, voices/presentation, personality/tone, languages, branding, approved knowledge and action rules; no universal Autumn clone. Reference: `docs/CREW-BRAND-LANGUAGE.md`. Planning-only client template: `docs/crew/CLIENT-SPECIALIST-TEMPLATE.json`; not a production onboarding/config executor.

## Working result / architecture

Canonical root static page and `website-receptionist/public/index.html` introduce Crew/customization and relabel the scripted estimate as a Crew specialist example. Current guide identity, active demo config/scripts/tests and operator docs use Autumn. Generic variables and Retell identity overrides retained. Historical call evidence remains immutable; current provider identity has not been synced/read back in this milestone.

Worker source: `website-receptionist/src/worker.mjs`, shared `facts.mjs`/`offers.mjs`, `src/voice.html`, mirrored dialog source `src/receptionist.html`. Same-origin pinned Retell 3.0.1 assets served by Worker. Voice creation endpoint requires active signed session, same-origin JSON, consent, IP throttling, fixed server agent/version, reviewed/enable flags, finite global attempt allowance and one attempt per conversation. Failures consume allowance. Only temporary join data returned; no browser long-lived key, transcript credential, generic provider proxy, retries/reconnect or automatic budget reset. Provider max 120 seconds; client 115-second stop; basic-attributes-only storage and contact memory disabled.

Frontend: idle/connecting/listening/thinking/speaking/error/ended, mic permission after availability/consent and before provider creation, End/Escape/close/unload cleanup, late-permission cancellation, neutral light/dark surfaces with clear red accents, live statuses/alerts, keyboard/native dialog and reduced-motion basics. Turn labels are explicitly audio-activity estimates because secure v3 gateway path lacks detailed reliable turn events. No voice transcript attached to inquiry. Post-conversation/failure CTA focuses client customization.

Keep lightweight prepared-answer text guide now: it shares business facts, offers, estimates and inquiry persistence, with added Crew/Autumn identity answers. No new generative or parallel chat/action system. Retell remains default; Gemini Live may be a later bounded website-channel benchmark only for a demonstrated need. No migration or benchmark now.

## Existing production checkpoint (retained)

Public Site: https://aw-creates-ventures.thesml.chatgpt.site. Existing approved preliminary budgets, deterministic guided estimates and inquiry/email/private-inbox flow remain the deployed version. AI_ENABLED=false; no OpenAI billing calls. Owner previously confirmed synthetic inquiry email and private inbox access. Consultation requests require human confirmation. Last published source `ccf53db28eccd07ac49ee4c74327b6510520e9db`, version `appgprj_6abf204484b881919358d57a2d56bd08~appgver_86bace4b328881919965aefc54df1de5`, deployment `appgdep_6ac071f90c3881918b9f45efb784c9e2`, environment revision 4. Canonical sanitized backup is `website-receptionist/`; Sites project/checkout remains documented in `docs/WEBSITE-HOSTING.md`. New Crew branding/widget has not been deployed.

Retell canonical key previously read-only verified HTTP 200. Historical fictional BrightHome voice/business safety acceptance retained; existing creation allowance consumed, stale callback tunnel inactive. Do not reuse it for website business facts or start the old harness. Local fictional quotes/calendar/operator approvals do not prove client integrations. No CRM/calendar/client onboarding in scope.

## Validation / evidence

21 meaningful Node tests PASS including retained estimate/inquiry/quote/security regressions, Autumn/shared-fact routing, disabled/unreviewed voice, consent, fixed server agent/version, sanitized join data/error, finite/no-retry allowance, all UI states, permission denial/cancel, cleanup and CTA. 45 focused Python demo/identity/business/action tests PASS. Canonical Worker build PASS without requiring the hosted deployment manifest. Runtime dependency audit: zero vulnerabilities; ten development-tool audit findings remain outside this scope.

Browser: actual desktop dark/light and 390×844 mobile dark/light, consent warning and service-answer path, no horizontal overflow; saved artifacts `docs/crew/qa/`. Mocked SDK/microphone/provider tests are not audible acceptance. Final build checked for no browser secret configuration; actual ignored credential values scanned against changed files before commit. Embedded artwork preserved. No historical benchmark reruns.

## Progress / Cost Gate

Provider/API spend **$0.00**. No calls, provider session creations, purchases, outreach, ads, scraping, integrations, settings changes or deployments. Codex usage cost unavailable. One bounded implementation subagent under milestone skill; no swarm. Visual QA defects corrected (bundle aliases, disabled mic prompt); validation is now passing. Stop/re-scope after two unsuccessful focused attempts under unchanged conditions, two usage-cap hits, two substantial runs without validated progress or deteriorating evidence/cost. Existing demo allowances do not authorize website/production spend. STOP after state, commit, push/sync closeout.

## Git checkpoint

Startup clean HEAD and fresh GitHub main: `ca21ff42a4b650cde9c7ce182757ceb53e92b8bf`. Latest validated implementation is the commit containing this state and Crew source/tests/docs; query Git for its hash. Final local/origin/fresh remote equality and clean tree recorded in the task closeout.

## Remaining gaps / exact next milestone

**AWC — Crew Website Publication & Bounded Retell Voice Activation**. Synchronize canonical Worker to the existing Sites project and publish disabled-voice branding/text first; verify public service/estimate/inquiry regressions. Prepare/read back a dedicated AWC Retell published agent using offline `website-receptionist/scripts/export-voice-config.mjs`, no inherited BrightHome facts/tools/states/knowledge/callbacks, approved voice, privacy settings and current rate. Pin reviewed version. Obtain explicit numeric usage allowance before activation/one supervised browser acceptance; reconcile real duration/cost and close out. No phone, outreach, SaaS dashboard or real client integrations. See voice closeout doc for server settings and exact preview steps.

## Visual follow-up — 2026-10-05
Owner requested less pink. Autumn panel now uses neutral paper/charcoal surfaces, gray borders/text and clearer red controls/focus accents. Existing broader page layout and artwork preserved; canonical source only, not published. Build and desktop/mobile light/dark visual checks pass. No provider usage.
