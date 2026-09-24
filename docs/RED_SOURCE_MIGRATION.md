# AWC — Verified Red Source Migration

Completed 2026-09-24, America/New_York. The red/pink standalone build is canonical
in `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/AWC`.
Migration implementation: `3751fb606b74de6e94bcc11b91be497205ffe1c5`. The following documentation closeout commit
records this hash; use Git history for the closeout commit's own hash.
Validated on `milestone/awc-verified-red-source-migration`; local `main` is
fast-forwarded at closeout, without rewriting history. No push or deployment.
Voice-agent development has NOT started. Stop at this milestone.

## Provenance and checkpoint
- Original recovered source: `C:/Users/A-Problem/.codex/.chatgpt-projects/g-p-6aa9d58c27a0819196657334985b77fe/index.html`.
- Exact file imported (preservation copy): `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_recovery/AWC-red-approved-recovered/index.html`.
- Preserved archive: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_recovery/AWC-red-approved-recovered`.
- Original, preserved, served, working-file and committed runtime SHA-256:
  `941f908cfefcfe2d1a9e47a15af44210ed2ce247fb7b68d56e617d3ed3bb46a3`. Size: 494,202 bytes.
- All 17 original/preserved files were rechecked against RECOVERY_PROVENANCE.json
  before and after migration and match. Neither external tree was edited.
- Gold checkpoint: annotated tag `awc-gold-pre-red-migration-2026-09-24` at
  `d3b0edea373f5c9f80605f0535806f776c505a30`. The prior interrupted run had already
  made this tag and migration branch; they were reused. No recovery search restarted.
- Source-location correction: the original is the ChatGPT project file above,
  not `C:/index.html`; awilcher-creatives is an unrelated chartreuse version.
- The unavailable original historical approved recording was not compared.
  Fidelity is proven against the recovered source, not that unavailable recording.

## Runtime inventory and serving
Only `index.html` was imported from the preservation folder. It contains authored
HTML/CSS/JavaScript and five embedded images. Google Fonts (Fraunces/Inter) are the
only external runtime resources. No framework conversion, copy changes, redesign,
or source repair was made. `.gitattributes` disables line-ending conversion for
this file so Windows checkouts preserve the recovered bytes.

Retained: PROJECT_STATE.md, recovery/baseline/workflow docs, content-capture scripts,
and `.nvmrc`. Added dependency-free `scripts/serve.cjs`; package/lockfile have no
dependencies, with dev/start/preview aliases. Metadata and README now describe
the canonical red build. Ignore rules exclude generated media, caches, profiles,
temp files and environment secrets without ignoring future legitimate artwork.
Earlier HTML revisions, preservation notes/AGENTS, screenshots/videos, profiles,
credentials and unrelated revisions were not imported. Existing ignored
`node_modules` and `dist` remain untouched on disk and cannot be served.

From the AWC folder run `node scripts/serve.cjs` (or `npm run dev`), then open
http://127.0.0.1:4173/ . No install, paid dependency, compilation or build step.
Node 24 is the repository target; validation used installed Node 26.8.2.
The server always binds 127.0.0.1 and serves only `/` and `/index.html`.
HEAD returns no body, favicon returns 204, unlisted paths return 404 and POST 405.
It does not expose ignored gold output, docs, environment files or dependencies.

Retired active gold runtime files (all retained in the checkpoint/history):
- `.env.example`
- `public/images/case-ecommerce-2.png`
- `public/images/case-ecommerce-3.png`
- `public/images/case-ecommerce.png`
- `public/images/case-fintech-2.png`
- `public/images/case-fintech-3.png`
- `public/images/case-fintech-4.png`
- `public/images/case-fintech.png`
- `public/images/case-fitness-2.png`
- `public/images/case-fitness.png`
- `public/images/case-medical-2.png`
- `public/images/case-medical-3.png`
- `public/images/case-medical.png`
- `public/images/case-restaurant-2.png`
- `public/images/case-restaurant-3.png`
- `public/images/case-restaurant.png`
- `public/images/case-saas-2.png`
- `public/images/case-saas-3.png`
- `public/images/case-saas.png`
- `src/App.tsx`
- `src/components/AICritique.tsx`
- `src/components/CaseStudies.tsx`
- `src/components/ConversionSection.tsx`
- `src/components/Footer.tsx`
- `src/components/Hero.tsx`
- `src/components/HeroBackground.tsx`
- `src/components/MobileStickyBar.tsx`
- `src/components/Navbar.tsx`
- `src/components/ParallaxDivider.tsx`
- `src/components/ProjectModal.tsx`
- `src/components/QuoteAgent.tsx`
- `src/components/Services.tsx`
- `src/components/Testimonials.tsx`
- `src/components/TrustBar.tsx`
- `src/components/WhyAWC.tsx`
- `src/index.css`
- `src/main.tsx`
- `tsconfig.json`
- `vite.config.ts`

## Validation and fidelity
Playwright 1.63.0-alpha-2026-08-31 and Chrome 153.0.8010.36, machine-local pinned
runtime documented in CONTENT_CAPTURE_REPAIR.md. Chromium emulation only.

| Viewport | Dark | Light | Source/canonical behavior | Horizontal overflow |
|---|---|---|---|---|
| 320 × 844 | Pass | Pass | Identical | 0 px |
| 360 × 844 | Pass | Pass | Identical | 0 px |
| 375 × 844 | Pass | Pass | Identical | 0 px |
| 390 × 844 | Pass | Pass | Identical | 0 px |
| 430 × 844 | Pass | Pass | Identical | 0 px |
| 768 × 844 | Pass | Pass | Identical | 0 px |
| 1440 × 1000 | Pass | Pass | Identical | 0 px |

28 source/canonical cases passed with zero console/runtime errors or failed
requests; all five images and Fraunces/Inter loaded. All four distinctive phrases,
Master Manipulator, editorial hero, red themes and fictional $9,800–$12,400 payoff
are intact. Every internal anchor resolves. Menu toggle/Escape/link-close, theme
toggle/reload behavior, all six diagnostic lenses, required form fields,
confirmation and preserved entered data passed at all widths/themes. Additional
320/1440 checks in both themes exercised every visible navigation/footer/CTA link,
invalid email and interest selection, and scrolling within the estimate region.

Reduced motion immediately shows the complete quote, skips playback, and supports
replay/transcript/result/action controls. After 2.5 seconds, running animations
were zero for the supplemental 320/1440 checks in both themes and both versions.
Early snapshots saw transient animations (0/9/14); they settled identically.
Normal-motion source and canonical runs both completed the timed conversation,
replay and live switch to reduced motion without JavaScript errors.

Screenshot comparison: 54/56 initial hero/full/Work/quote pairs were pixel-identical.
Two initial 1440 dark screenshots caught different transient reveal states (full
page and quote). Both settled rechecks are pixel-identical; the added settled Work
pair is also identical: 57/59 stored comparisons, with the two superseded timing
captures retained honestly. No source edits were needed. Visual review covered
the seven-width dark/light contact sheets, native desktop hero/light/Work and
quote captures, and the video frames. Fidelity against the recovered source passes.

`node --check scripts/serve.cjs`, inline JavaScript parsing, served byte hashes,
HTTP route/method checks, and `git diff --check` passed. Static architecture has
no build/lint compilation requirement. No source migration regressions found.

## Capture artifacts
All media is outside Git: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_venture-ops/media/awc-red-migration-2026-09-24`.
- `canonical-normal-desktop-dark.png`, `canonical-normal-desktop-light.png`.
- `canonical-normal-master-manipulator.png`, `canonical-normal-light-work.png`.
- `canonical-normal-quote-composer.png`, `canonical-normal-quote-result.png`,
  `canonical-normal-quote-action.png`, `canonical-normal-quote-transcript.png`.
- `canonical-normal-mobile-dark.png`, `canonical-normal-mobile-light.png`,
  `canonical-normal-mobile-quote.png` (native 390 × 844).
- `{width}-{theme}-{source|canonical}-{hero|full|work|quote}.png`:
  paired QA captures; `settled-1440-dark-*` are the reveal-timing rechecks.
- `review-hero.jpg`, `review-work.jpg`, `review-quote.jpg`: visual review sheets.
- `canonical-red-walkthrough.webm`: 50.600000 seconds,
  4,589,337 bytes, 1440 × 1000 VP8 / 25 fps, 1,265 decoded frames, silent.
  SHA-256 `f7de9069b21f0ea6322760331ef7641f917e0f8a03036c589de2c1a93f9fa82f`.
- `playback/verification.json` and `playback/playback-{start|middle|end}.png`:
  nonzero file, full FFmpeg decode, advancing Chromium playback, and visual review
  all passed. Mobile uses the left side of the fixed desktop video canvas.

Approximate shot timestamps from recording start (small encoder offset possible):

| Time | Shot |
|---|---|
| 2.9s | desktop-dark |
| 4.3s | master-manipulator |
| 8.4s | quote-composer |
| 35.6s | quote-result |
| 36.6s | quote-action |
| 38.2s | quote-transcript |
| 39.7s | desktop-light |
| 42.4s | light-work |
| 44.1s | mobile-light |
| 45.7s | mobile-dark |
| 47.3s | mobile-quote |

Raw JSON, source/canonical screenshots and SHA256SUMS.json remain
in media; compact QA/inventory/video evidence is versioned in `docs/qa/red-migration`.
Reproduction scripts: `scripts/migration/`; use Node for .cjs and Python with Pillow
for compare-captures.py. These scripts use the recorded local machine paths and
expect the canonical preview on 4173; the matrix launches a temporary baseline on
4174. PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE_PATH for the existing video verifier
are documented in CONTENT_CAPTURE_REPAIR.md. No media is tracked in Git.

## State, limitations and next action
PROJECT_STATE.md now describes the standalone canonical site. Venture
PORTFOLIO_STATE.md, PROJECT_PRIORITY.md and CONTENT_PIPELINE.md are reconciled;
their snapshots are versioned under docs/workflow. Earlier recovery/baseline
reports remain historical evidence, not the current next-action instructions.

Pre-existing behavior retained: theme returns to dark on reload; the Quote Agent
is scripted and the price fictional; its fixed-height estimate region scrolls
internally (including the CTA at 320px); forms preserve input and explicitly say
no message was sent. External fonts require network. No live delivery backend,
appointment booking, physical-device/Safari/Firefox testing, full accessibility
audit or production business-claim validation is asserted. The historical approved
recording remains unavailable, so exact final historical revision identity remains
uncertain despite recovered-source byte/visual fidelity. No blocking migration issue.

STOP. Exact next milestone: **AWC — AI Employee Architecture Bake-Off**.
Start a fresh task, read PROJECT_STATE.md and workflow v3.2, and scope architecture
comparisons under the existing Build-vs-Buy gate. Voice-agent development has NOT
started; no LiveKit/Pipecat/receptionist, outreach, paid service or other venture work.
