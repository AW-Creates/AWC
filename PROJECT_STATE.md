# AWC Project State

## Project
AWC / A. Wilcher Creatives is the agency website and initial portfolio focus.
Objective: present the offer and demonstrate a clearer inquiry experience.
Revenue and a live lead pipeline are not established by this website baseline.
Canonical repository: AW-Creates-Ventures/AWC. Branch: main.

## Current milestone
**AWC - Workflow v3.2 Migration + Baseline Closeout**
**Status: COMPLETE. STOP at this milestone.**

Acceptance criteria satisfied:
- [x] Workspace v3.2 gate adopted; Content Capture and Context Budget preserved.
- [x] Approved dark hero/desktop composition retained; light theme added.
- [x] Responsive QA at 320, 360, 375, 390, 430, 768 and 1440 in both themes.
- [x] User-authorized illustrative Quote Agent, distinct roles, bottom composer,
  realistic pacing/replay and $9,800-$12,400 range.
- [x] Overflow, navigation, dialogs, footer clearance, motion and reduced motion checked.
- [x] Production build and TypeScript lint pass; validated implementation committed.
- [x] Screenshots/QA artifacts indexed; project and venture state updated.

## Tangible deliverables / working state
- Dark/light React/Vite website with persisted theme choice and mobile fixes.
- Static scripted Quote Agent; no messages, live estimate calculation or API calls.
- docs/BASELINE_CLOSEOUT.md: exact changes, QA, limitations and capture index.
- docs/qa/: 14 viewport/theme results, 19 interaction checks, canvas-motion checks
  and raw-artifact SHA-256 manifest.
- ../_venture-ops/media/awc-v3.2-2026-09-23/: before/after screenshots and QA scripts.
- docs/workflow/: versioned snapshots of canonical venture guidance and inventory.

## Locked decisions
- Preserve the accepted dark hero and desktop design; light is an alternate theme.
- The legacy awilcher-creatives folder is read-only reference; its HTML hash still
  matches the preservation manifest. Other old folders remain untouched.
- Quote Agent is explicitly illustrative. Voice-agent build remains deferred.
- No paid provider, spending, publication, deployment or push was authorized/performed.

## Architecture / relevant paths
- src/App.tsx, src/index.css: composition, semantic theme and motion configuration.
- src/components/Navbar.tsx: navigation and persistent theme control.
- src/components/Hero.tsx, HeroBackground.tsx: approved hero and canvas.
- src/components/QuoteAgent.tsx: timed in-view demo; complete static reduced-motion view.
- src/components/AICritique.tsx: presentational audit; stacked narrow-screen controls.
- .nvmrc, package.json: Node 24; React 19 dev types; lint script runs tsc --noEmit.
- ../_venture-ops/WORKFLOW-v3.2-README.md: authoritative workspace workflow.

## Latest validated state
**Implementation commit:** bcdfac868801236464c5c9de6543efbdaf0e40e8
**Baseline commit:** 9be190d59506cd815466e0cf0b8ae608d64942a4
The following documentation-only closeout commit records this implementation hash;
use git log -1 for its own hash (a commit cannot contain its own hash).

Checks: npm run lint, npm run build, git diff --check; all pass. Emulated Chromium
at all seven widths/both themes: zero horizontal overflow, clipped content or
hidden headings; settled reduced-motion animation count zero. Normal canvas moves,
reduced-motion canvas remains pixel-identical. All 19 interaction checks pass.
Desktop normal-motion screenshot also matches baseline 1440x1000 dimensions.

## Known limitations / unresolved feedback
- Existing audit and strategy forms are presentational; no submission backend.
- Existing placeholder phone/legal links and marketing claims/testimonials need
  owner verification before a production launch.
- Chromium emulation only; physical-device and Safari/Firefox QA not performed.
- External font loading depends on network availability.
- Recording encoder failed twice; screenshots are verified, no playable video exists.
- No unresolved requested baseline layout defect. No claim of full accessibility
  audit, production lead capture or validated business results.

## Content Capture
Eight untouched baseline screenshots preceded source edits. Final evidence includes
both themes at all widths, full-page/hero/Quote Agent captures and focused mobile
audit/dialog/footer/pacing views. See docs/BASELINE_CLOSEOUT.md and the raw manifest.
30fps and 5fps video attempts failed; contact sheets are diagnostics only.
Any future recording must be labeled a later demo, not before-state footage.

## Workflow v3.2 / Build-vs-Buy
No material paid dependency adopted. Future adoption must compare license,
maintenance, features, integration, compute, latency/reliability, switching cost,
privacy/control and projected total cost at expected usage. Require benchmark or
documented rationale before locking in a material paid provider. Use the shared
decision template. The installed global skill remains v3; workspace guidance is v3.2.

## Context checkpoint
Architect and bounded Builders completed their scopes; Director reviewed source,
fixed remaining defects and validated the results. Account usage tool reading on
2026-09-23: 41% five-hour and 22% weekly used; these are account limits, not context
window usage. Context-window percentage unavailable. No background monitor exists.

## Exact next action
**Stop. In a fresh task, read this file and scope the receptionist/lead-recovery MVP
separately, applying workflow v3.2 before a material paid-provider decision.**
Keep website production gaps explicit; do not restart this completed baseline work.

Last updated: 2026-09-23.