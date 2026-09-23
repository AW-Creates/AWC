# AWC Project State

## Project
AWC / A. Wilcher Creatives is the portfolio's agency website. Objective: present
the offer and demonstrate lead-conversion experiences. Revenue is not validated.
Canonical repository: AW-Creates-Ventures/AWC. Branch: main.

## Current milestone
**AWC - Workflow v3.2 Migration + Baseline Closeout**
Status: VALIDATED - awaiting milestone commits.

Acceptance criteria:
- Preserve approved dark hero and accepted desktop composition.
- Stabilize 320, 360, 375, 390, 430, 768 and desktop layouts.
- Add user-authorized light mode and illustrative Quote Agent layout.
- Verify motion, reduced motion, overflow, navigation and browser regressions.
- Pass build and TypeScript check; report actual lint coverage.
- Capture before/after evidence, commit validated work, update venture state, stop.

## Locked decisions
- Existing React/Vite site remains canonical; legacy HTML is reference only.
- Dark desktop design/hero is approved; light mode is an alternate theme.
- Quote Agent: bottom composer, distinct customer/agent messages, realistic
  pacing, illustrative $9,800-$12,400 range. No working AI/backend implied.
- No voice-agent build in this task; no paid provider selected or spending.
- Preserve all older project folders, other repositories and historical audits.

## Architecture / relevant files
- src/App.tsx and src/index.css: page assembly, theme, global styles.
- src/components/Hero.tsx / HeroBackground.tsx: approved hero and canvas.
- src/components/AICritique.tsx: existing presentational audit controls.
- src/components/QuoteAgent.tsx: new illustrative demo.
- src/components/Navbar.tsx: navigation and theme control.
- docs/workflow: versioned snapshot of venture v3.2 guidance and templates.
- ../_venture-ops: canonical portfolio guidance and content evidence index.

## Current working state / known issues
Baseline clean at 9be190d59506cd815466e0cf0b8ae608d64942a4.
Baseline has no light theme or Quote Agent. At 320px, Analyze overlaps the URL
input. Existing audit action is presentational. Dependency installation initially
failed under Node 26 due to better-sqlite3 compatibility; validate with Node 24.

## Latest validated state
Baseline source: 9be190d. Browser loads without reported runtime errors.
Build, TypeScript and browser QA pass. Commit closeout pending; see docs/BASELINE_CLOSEOUT.md.

## Content Capture
Before screenshots: ../_venture-ops/media/awc-v3.2-2026-09-23/baseline-*.png.
All requested widths and desktop captured before source changes; 320px audit
defect captured separately. Two video attempts failed with encoder backlog;
neither is verified footage. Final screenshots and demo still pending.

## Workflow v3.2 / Build-vs-Buy
All material paid dependencies require open-source/self-hosted comparison and
benchmark or documented rationale. No paid dependency adopted this milestone.
Installed global skill remains v3; workspace guidance is v3.2.

## Context checkpoint / next action
Architect brief complete; Builder owns src changes; Director owns docs and QA.
Next: inspect implementation at target widths/themes, resolve defects, run
checks, capture results and close out in Git. Context/account usage: unknown.

## Next milestone
Fresh task: scope the receptionist/lead-recovery MVP after reviewing this
website baseline. Do not begin that build in this task.

Last updated: 2026-09-23.