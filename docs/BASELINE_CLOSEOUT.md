# AWC - Workflow v3.2 Migration + Baseline Closeout

Date: 2026-09-23. Baseline: `9be190d59506cd815466e0cf0b8ae608d64942a4`.
Canonical source: `AW-Creates-Ventures/AWC`, branch `main`.

## Delivered changes

- Migrated venture guidance to v3.2. Added all requested open-source/build-vs-buy
  comparison criteria and the material-dependency benchmark-or-rationale gate.
  Added a decision template and project-state fields. Content Capture and Context
  Budget guidance remain intact. The v3.1 filename now redirects to v3.2;
  historical reconciliation files were preserved.
- Kept the accepted dark hero composition and desktop design. Added a persistent,
  keyboard-operable light-theme control and semantic text/surface colors; retained
  dark illustration surfaces where they preserve legibility.
- Added a user-authorized illustrative Quote Agent: viewport-triggered scripted
  dialogue, distinct agent/customer bubbles, realistic pacing, replay, a bottom
  demo-only composer and the clearly labeled `$9,800–$12,400` range. No messages
  are sent and no voice agent or paid service was implemented.
- Stacked audit input/button on small screens and restored usable input padding;
  reserved footer space above the fixed mobile CTA and device safe area.
- Disabled decorative loops, parallax, count-up/typing delays, auto-advancing
  testimonials and reveal motion for reduced-motion users. Static content remains
  visible. Corrected the pre-existing `42.0x` counter rendering to its configured
  `4.2x` value and cleaned up animation timers.
- Added React 19 development type definitions, retained existing runtime dependency
  versions, and pinned the documented development runtime to Node 24.

## Validation

Production build and `npm run lint` pass. The lint script is TypeScript checking,
not a separate style-lint suite. Final production output: about 409.77 kB JS
(125.02 kB gzip), 63.96 kB CSS. `git diff --check` passes.

Chromium browser QA at 900px viewport height:

| Width | Dark | Light | Horizontal overflow | Reduced-motion content |
|---|---|---|---|---|
| 320 | Pass | Pass | None | Visible/static |
| 360 | Pass | Pass | None | Visible/static |
| 375 | Pass | Pass | None | Visible/static |
| 390 | Pass | Pass | None | Visible/static |
| 430 | Pass | Pass | None | Visible/static |
| 768 | Pass | Pass | None | Visible/static |
| 1440 | Pass | Pass | None | Visible/static |

Automated measurements check document width, visible content bounds, hidden
headings, reduced-motion preference, settled browser animations and quote state.
Screenshots were visually inspected at mobile, tablet and desktop sizes. The
original desktop baseline was captured at 1440x1000; matrix captures use 1440x900.
A matched 1440x1000 final desktop screenshot is included. Normal desktop motion is also checked separately from the static matrix.

Interaction regressions cover mobile menu opening/closing and anchor navigation,
keyboard theme switching and reload persistence, URL input editing and separated
320px audit controls, FAQ expansion/collapse, testimonial navigation and disabled
auto-advance under reduced motion, case-study opening/carousel/closing, footer
clearance, static reduced-motion quote, disabled demo sending, viewport-triggered
pacing, completion and replay. No browser runtime errors were observed.

## Capture evidence

Raw media is outside the source repository:
`../_venture-ops/media/awc-v3.2-2026-09-23/`.

- `baseline-{320,360,375,390,430,768}.png`, `baseline-desktop.png` and
  `baseline-audit-320.png`: untouched before-state, captured before source edits.
- `final-{dark,light}-{width}-{hero,quote,full}.png`: both themes at all seven widths.
- `final-audit-320.png`, `final-modal-320.png`, `final-footer-320.png` and
  `final-quote-normal-motion-390.png`: focused interaction evidence. `final-modal-light-320.png` verifies the light dialog; `final-desktop-normal-1440x1000.png` matches the baseline dimensions.
- `qa-dark.json`, `qa-light.json`, `qa-interactions.json`, `qa-motion.json`: machine-readable checks.
- `SHA256SUMS.csv`: artifact integrity manifest. Screenshots are evidence, not video.

Two browser recording attempts (30 fps, then 5 fps) failed with encoder backlog.
No saved playable video was produced or verified. The generated contact sheets
are retained as failed-attempt diagnostics. Before-state video cannot now be
claimed. A future clearly labeled demo can be recorded from this validated state:
0–5s dark hero; 5–10s theme switch; 10–22s mobile Quote Agent dialogue/estimate;
22–27s bottom composer and replay. No audio or publication was performed.

## Preservation and scope

The standalone `awilcher-creatives/index.html` was reference-only. Its SHA-256
remains `86a3003d66aee7b9d6905bada376060957f979ac120857633da12df36675dcaa`, matching
the earlier preservation manifest. No older project folders were moved,
overwritten or deleted. No other venture source was changed.

No new paid dependency was adopted. The global installed milestone skill remains
v3; this is a workspace v3.2 migration. Venture-ops is not itself a Git repository;
this repository includes guidance and inventory snapshots so the closeout has
versioned evidence without initializing a parent repository.

## Remaining limitations

- Existing audit/strategy forms are presentational; no submission backend or
  live AI analysis exists. Quote Agent is intentionally an illustrative demo.
- Existing phone/legal links and marketing claims/testimonials are baseline
  content that need owner validation before a production launch.
- QA used emulated Chromium viewports, not physical devices or Safari/Firefox.
- No video footage was verified; external Google font loading remains a network
  dependency. Browser screenshots and JSON measurements are the available evidence.
- No deployment, push, voice-agent build, provider selection or spending occurred.

## Next action

Stop this milestone. In a fresh task, read `PROJECT_STATE.md` and scope the
receptionist/lead-recovery MVP separately, applying the v3.2 gate before any
material paid provider decision. Keep the website's production-readiness gaps
explicit rather than treating this baseline closeout as a live lead pipeline.
