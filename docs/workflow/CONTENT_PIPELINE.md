# Content pipeline

Updated: 2026-09-23. The agent owns capture planning; the user should not have
to guess when recording is useful. AWC screenshots are verified; no playable video was captured.

| ID | Project / moment | Story and required footage | State | Asset / timecodes | Next action |
|---|---|---|---|---|---|
| C001 | AWC responsive baseline | Same page before/after at matched widths | Screenshots verified; video failed | media/awc-v3.2-2026-09-23/baseline-*.png and final-*.png | Retain raw evidence; no before-state video claim |
| C002 | AWC baseline closeout | Hero, Quote Agent, mobile interaction | Screenshots and QA verified; video pending | media/awc-v3.2-2026-09-23/; AWC docs/BASELINE_CLOSEOUT.md | Future labeled demo recording only; publication not authorized |
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