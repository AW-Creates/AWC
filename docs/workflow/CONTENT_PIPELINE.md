# Content pipeline

Updated: 2026-09-23. The agent owns capture planning; the user should not have
to guess when recording is useful. AWC baseline screenshots are verified; baseline video remains missing. Content Capture infrastructure now has verified local-fixture videos (C004).

| ID | Project / moment | Story and required footage | State | Asset / timecodes | Next action |
|---|---|---|---|---|---|
| C001 | AWC responsive baseline | Same page before/after at matched widths | Screenshots verified; video failed | media/awc-v3.2-2026-09-23/baseline-*.png and final-*.png | Retain raw evidence; no before-state video claim |
| C002 | AWC baseline closeout | Hero, Quote Agent, mobile interaction | Screenshots and QA verified; video pending | media/awc-v3.2-2026-09-23/; AWC docs/BASELINE_CLOSEOUT.md | Future labeled demo recording only; publication not authorized |
| C004 | Content Capture infrastructure repair | Later synthetic local fixture: timer, animation, scroll | VERIFIED: two Playwright recordings decoded/played/visually inspected | media/capture-repair-2026-09-23/; repeat video 7.96s / 428,092 bytes | Stop; next AWC — Canonical Source Reconciliation |
| C003 | Future receptionist demo | Test customer asks, qualifies, books, hands off | Backlog | None | Define MVP before capture |

States: idea → planned → captured → verified → editing → review → published.
Track actual saved media paths and timecodes, not assumed recordings. Store raw
media outside source repos in a dedicated backed-up media folder. Use filenames
like `2026-09-22_AWC_M1_mobile-before_take01.mp4`. Link exports and publication URLs
here only when they exist. Back up footage before removing originals.

For each capture use shared/CAPTURE_BRIEF.template.md. Prefer short, clean clips
of real progress: the problem, a consequential decision, visible result, and
measured evidence. Use synthetic demo data and hide credentials/notifications.
Check saved playback and audio before marking captured footage verified.

The Self Made Lifestyle's current audience, watch time, and content direction
need a fresh analytics review. Do not assume monetization or rebranding is
complete. Publishing requires a separate user instruction.

## AWC v3.2 baseline closeout capture brief — 2026-09-23

Before-state: clean AWC 9be190d; dark desktop hero and mobile audit controls.
Story: preserve approved design while fixing narrow layouts, adding an illustrative
Quote Agent and light mode, and respecting reduced motion. Capture matched widths
320, 360, 375, 390, 430, 768 and 1440 before/after. Final demo: mobile navigation,
theme switch, Quote Agent conversation and bottom composer. Raw media goes in
_venture-ops/media/awc-v3.2-2026-09-23, outside the AWC source repository.
Recordings have no intended audio; verify saved playback before claiming verified.

### AWC capture outcome
Baseline source: 9be190d. Implementation commit is recorded in AWC/PROJECT_STATE.md.
Eight before-state screenshots were saved before source edits. Final capture covers
both themes at 320/360/375/390/430/768/1440, full pages, hero and Quote Agent, with
focused audit/modal/footer/normal-motion evidence. JSON QA and SHA256SUMS.csv are
beside the raw assets. Raw screenshots were visually reviewed; no audio intended.
30fps and 5fps video attempts both failed with encoder backlog; no playable video
or verified duration/timecodes exist. Contact sheets are diagnostics only.
Future demo shot list: 0-5s dark hero, 5-10s theme switch, 10-22s Quote Agent,
22-27s composer/replay. Label it as a later demo, never as before-state footage.
## C004 — verified infrastructure repair, 2026-09-23
Scope: capture only, no AWC site/design changes or source reconciliation. Existing
C001/C002 missing site footage remains missing; this does not replace it.
Primary method: Playwright context video, headless Chrome 153.0.8010.36,
Playwright 1.63.0-alpha-2026-08-31, bundled FFmpeg 1011, 1280x720 VP8/25fps/silent.
Agent-browser 0.38.1 abandoned as the default after repeat 30fps backlog failures;
5fps isolated recordings work as a limited workaround. Exact failing guards are
16 buffered frames/500ms lag; deeper hardware/OS cause is not established.

Artifact directory: C:\Users\A-Problem\Documents\Web Development\AW-Creates-Ventures\_venture-ops\media\capture-repair-2026-09-23\
Final video: repeat/context-2026-09-23T23-53-55-327Z.webm — 428,092 bytes,
7.96 seconds, 199 frames. Screenshot: repeat/playback-end.png. Verification JSON:
repeat/verification.json. Full decode and actual Chromium playback pass;
start/middle/end screenshots visually inspected; readable titles/timer and scroll.
Timecodes approximately 0-2s animation/title, 2-4.5s lower section, 4.5-7.96s return.
No audio stream, as intended. First independent run: context-2026-09-23T23-51-51-384Z.webm,
450,763 bytes / 8.12s / 203 frames; also decoded, played and visually inspected.
Capture-only script/docs commit: d2f0d0bef8a8836dd41c0e4565ddfe4c31b65bcd; pre-repair HEAD dbbb378.
Detailed commands, source evidence, configuration and recovery:
../AWC/docs/CONTENT_CAPTURE_REPAIR.md. Raw artifacts are outside the AWC Git repo.
Recommended next milestone: AWC — Canonical Source Reconciliation. No Bake-Off.

## C005 — AWC red source recovery, 2026-09-23
Before-state: untouched non-Git ChatGPT mirror index.html; recovery SHA-256 941f908cfefcfe2d1a9e47a15af44210ed2ce247fb7b68d56e617d3ed3bb46a3. No source changes. Story: recover the lost approved-direction design before migration.
Captured and verified: dark/light desktop hero, Work and Quote Agent; both mobile themes; 48.92-second silent Playwright walkthrough, complete decode, advancing playback and three sample-frame visual reviews passed. Artifacts: media/awc-red-recovery-2026-09-24/. Timecodes approximately 0–3 hero, 3–5 Work, 5–38 Quote Agent, 38–43 light, 43–49 mobile. Mobile frames use fixed desktop canvas; native screenshots provided.
This is a later recovery demo, not the original approved recording. No publication. Next: AWC — Verified Red Source Migration. Detailed provenance/limitations: ../AWC/docs/RED_BUILD_RECOVERY.md.
