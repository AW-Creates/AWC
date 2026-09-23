# Content Capture repair — verified 2026-09-23

## Result and scope
Playwright browser-context recording is the verified automatic primary method.
Two independent runs of a local animated/scrolling fixture passed. This is infrastructure
verification, not AWC site footage, before-state footage, or product design approval.
No design files were changed and the AI Employee Architecture Bake-Off was not started.

The final run from the installed canonical script produced:
- Video: `C:\Users\A-Problem\Documents\Web Development\AW-Creates-Ventures\_venture-ops\media\capture-repair-2026-09-23\repeat\context-2026-09-23T23-53-55-327Z.webm`
- 428,092 bytes; 7.96 seconds; 199 frames; VP8, 1280x720, 25 fps; no audio stream.
- Screenshot: same directory, `playback-end.png` (plus start/middle images).
- Evidence: same directory, `verification.json` and timestamped capture JSON/PNG.
- SHA-256: `bc1ed7c9ab9d3ac556d8e644403fd1f753927bd8fa8a8b4b6e4d3df818b82b0d`.
- Full decode with `ffmpeg -xerror` passed. Chromium playback advanced from ~0.8 to
  1.82 seconds, readyState 4, no video error. Start/middle/end screenshots were
  visually inspected: readable titles, moving marker/timer, scroll down and return.
- Approximate shot timing: 0-2s animated title; 2-4.5s lower section; 4.5-7.96s return.
- First run in parent media directory: `context-2026-09-23T23-51-51-384Z.webm`,
  450,763 bytes, 8.12 seconds, 203 frames; complete decode, playback and sampled
  image inspection also passed. `playback-7s.png` is its final-frame evidence.

## Exact observed cause and diagnostic limits
Cached native agent-browser 0.38.1 reproduces a producer/consumer backlog in its
PNG screencast-to-FFmpeg pipeline. Its source enforces a 16-frame channel and
500 ms maximum encoder lag; queue saturation or excessive lag aborts recording.
Chrome screencast requests every frame, while an output timer feeds PNG images
into the encoder pipe. The implementation uses one encoder thread through 30 fps
and four above 30 fps. Source: [version-pinned recording.rs](https://github.com/vercel-labs/agent-browser/blob/v0.38.1/cli/src/native/recording.rs),
constants near lines 48-58, encoder arguments near 698-758, queue error near
1677-1684, timed output near 1829-1857.

This precisely identifies the failing component and abort condition. It does not
prove a deeper Windows, CPU, pipe, or codec implementation defect: no profiler
trace was taken. The previous 5 fps failure lacks enough configuration evidence
to assign its exact cause. Do not describe this as a universally fixed upstream bug.

Installed dependencies were present: Chrome 153.0.8010.36 and system FFmpeg
9.0.1 with libvpx/libx264. Direct tests used a fresh named session and writable
local output, with no product server or external network dependence:

| Configuration | Result |
|---|---|
| Headless, default viewport, VP8 WebM, 30 fps | 16-frame backlog failure |
| Headless, 1280x720, H.264 MP4, 30 fps | 16-frame backlog failure |
| Headless, 640x360, H.264 MP4, 30 fps | 500 ms encoder lag failure |
| Headed, 1280x720, H.264 MP4, 30 fps | 16-frame backlog failure |
| Headless, 640x360, H.264, 5 fps | Saved; 6.4s / 32,228 bytes, metadata checked |
| Headless, 1280x720, H.264, 5 fps | Saved; 15.4s / 147,835 bytes, metadata checked |
| Headless, 1280x720, VP8, 5 fps | Saved; 15.4s / 118,464 bytes, metadata checked |

Agent-browser is abandoned as the automatic recording default, not uninstalled.
Five fps is a limited local workaround; these agent-browser files were not given
the same full visual/playback verification as the primary Playwright deliverable.
An initial restricted-shell daemon write denial was separate: approved runtime
access allowed launch, after which backlog was reproduced. No evidence implicates
output destination as the backlog cause. Alternate browser builds/older cached
0.26.0 were not exhaustively tested once the preferred fallback passed.

## Reproduce automatically (PowerShell from the AWC repository)
Verified runtime: Node 26.8.2, cached Playwright 1.63.0-alpha-2026-08-31,
Chrome 153.0.8010.36, Playwright-managed FFmpeg build 1011. This is a tested
machine-local prerelease configuration, not a claim about the latest stable release.

```powershell
$env:PLAYWRIGHT_MODULE = 'C:\Users\A-Problem\AppData\Local\npm-cache\_npx\9833c18b2d85bc59\node_modules\playwright'
$env:CHROMIUM_EXECUTABLE_PATH = 'C:\Users\A-Problem\.agent-browser\browsers\chrome-153.0.8010.36\chrome.exe'
$media = 'C:\Users\A-Problem\Documents\Web Development\AW-Creates-Ventures\_venture-ops\media\capture-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$fixture = ([System.Uri](Resolve-Path '.\scripts\content-capture\fixture.html').Path).AbsoluteUri
node .\scripts\content-capture\record-context.cjs --url $fixture --out $media
if ($LASTEXITCODE -ne 0) { throw 'Capture failed; do not mark verified' }
$video = (Get-ChildItem -LiteralPath $media -Filter 'context-*.webm' | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
node .\scripts\content-capture\verify-playback.cjs $video $media
if ($LASTEXITCODE -ne 0) { throw 'Playback verification failed' }
```

For a real milestone, replace `$fixture` with the known local dev URL and replace
the runner's generic scroll sequence with a bounded planned shot sequence. The
runner does not discover/start a site or select a design tree. Inspect the actual
page and screenshots; it does not automatically determine content correctness.

The primary configuration is `headless: true`, viewport and `recordVideo.size`
both 1280x720, and `recordVideo.dir` outside Git. The context is closed and awaited
before `video.saveAs`; its temporary video is removed only after saving. This
flush order follows [Playwright's video guidance](https://playwright.dev/docs/videos).
The runner checks arguments, rejects output inside a Git working tree, reports
actual runtime versions, and exits nonzero on failure. Capture JSON certifies only
file existence/nonzero size; playback verification is a separate required step.

`verify-playback.cjs` uses system `ffprobe`, fully decodes with system `ffmpeg`,
opens the saved video in Chromium, confirms playback advances, seeks three frames,
and saves evidence plus SHA-256. View all three screenshots before recording visual
review as passed in the log. No audio is expected here; real audio requires a
separate recording method and listening check.

## Runtime recovery
No website package manifest or lockfile was changed. The cached module can be
removed by npm cache cleanup. If missing, provision an external tools directory:

```powershell
$toolsDir = Join-Path $env:LOCALAPPDATA 'AWC-Content-Capture'
npm install --prefix $toolsDir --save-exact playwright@1.63.0-alpha-2026-08-31
if ($LASTEXITCODE -ne 0) { throw 'Runtime install failed' }
$env:PLAYWRIGHT_MODULE = Join-Path $toolsDir 'node_modules\playwright'
node "$env:PLAYWRIGHT_MODULE\cli.js" install ffmpeg
if ($LASTEXITCODE -ne 0) { throw 'Encoder install failed' }
```

Installing the bundled encoder was exercised in this repair; reinstalling the
cached npm package is a recovery recipe, not a test performed here. If the named
Chrome binary is absent, install that Playwright version's managed Chromium with
`node "$env:PLAYWRIGHT_MODULE\cli.js" install chromium`, clear
`CHROMIUM_EXECUTABLE_PATH`, and rerun the fixture/verification gate. That alternate
browser combination must be revalidated before marking it approved. Do not silently
upgrade packages or overwrite the product dependencies. Shell/browser child-process
and output-directory access must be available to the running agent.

## Fallback and failure handling
1. Use the verified Playwright context path first for future milestones.
2. On failure, retain the error and partial output, check missing encoder/browser,
   output permissions/free space, and context-close completion. Run one isolated
   fixture retry after correcting a concrete problem.
3. Only if Playwright cannot record reliably, try a separately configured FFmpeg
   browser capture path. Only after that, use desktop/manual capture. These lower
   fallbacks were not needed or validated here; do not claim they work automatically.
4. Agent-browser 5 fps is optional diagnostic/recovery use, not the default or a
   replacement for Playwright validation. Stop on any backlog error and mark partial
   footage failed; do not label it verified merely because a file exists.
5. If automation still fails, log the exact command/error and preserve screenshots,
   then provide a short manual shot list. Never recreate footage as an original
   before-state. Publication remains separate from capture.

For a bounded agent-browser diagnostic, use the cached native binary at
`C:\Users\A-Problem\AppData\Local\npm-cache\_npx\6de2aa2fded2970c\node_modules\agent-browser\bin\agent-browser-win32-x64.exe`:

```powershell
& $ab --session awccapture open $fixture
& $ab --session awccapture set viewport 1280 720
& $ab --session awccapture record start "$media\diagnostic.mp4" --fps 5
& $ab --session awccapture wait 15000
& $ab --session awccapture record stop
& $ab --session awccapture close
```

Set `$ab` to the exact path above; check every command exit code. Do not leave test
daemons running. FFmpeg used by Playwright internally and for decoding is not an
independent desktop-capture fallback; no desktop screen was recorded in this repair.

## Remaining boundary and next action
Short silent local-fixture recording is verified, not long-duration sessions,
authenticated flows, audio, every browser version, or the actual AWC redesign.
The user reports that canonical `AW-Creates-Ventures\AWC` currently holds the older
gold-accent site while `awilcher-creatives` appears to hold the approved red-accent
redesign. Earlier baseline source-location claims must be reconciled separately.
No design copy, migration, folder deletion or source reconciliation occurred here.
Stop now. Next milestone: **AWC — Canonical Source Reconciliation**.

Validation of helper failure handling: missing arguments and in-Git output are rejected; a nonzero corrupt WebM was rejected by the verifier. Node syntax checks and git diff --check pass. No product build was rerun because no product source or dependency changed.
