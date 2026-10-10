# Authentic Crew recording pipeline

`generate-question-wav.ps1` uses installed Windows SAPI speech and FFmpeg locally. Opening question starts at12seconds; follow-up at40seconds; synthetic microphone file is80seconds. Windows voice access may require the existing sandbox escalation path. No external TTS service is used.

`capture-session.cjs` exports `captureSession(config)`. Supply role/name/purpose, absolute `microphoneWav`, private ignored `outputDir`, and an async `sessionFactory(readiness)` that returns the provider session in memory. The factory runs only after secure loopback origin, installed SDK, decoded80second input and audio MediaRecorder have passed readiness. Credentials never need a disk file. Use the backend gate's pinned role/version, consent, finite allowance and reconciliation. No retries are implemented.

The actual browser UI is recorded by Playwright at1280x720. A real WebAudio microphone stream feeds the SDK. Its clone and actual received RTCPeerConnection audio tracks feed one Opus recording, with conservative mix headroom. HTMLMediaElement.srcObject is a fallback; deduplicated track IDs prevent double mixing. The SDK's analyser snapshot audio events are not concatenated because they are not contiguous PCM.

Outputs are private `screen.webm`, `mixed-audio.webm`, and `capture-evidence.json`. Transcript updates and timings are evidence only until reviewed and sanitized. Tokens are excluded. The browser hard-stops at80seconds and cannot automatically create another call. Reconcile actual provider cost before the next role. Public channels remain disabled.

Free preflight passed with a synthetic RTCPeerConnection remote oscillator track: secure origin,SDK,80second WAV,audio recorder all ready; one remote track captured; zero provider calls. FFmpeg fully decoded both real browser screen video and nonzero recorded audio. This validates capture mechanics, not a provider connection.

For offline muxing, use capture-evidence `videoLeadInSeconds` to trim the screen's initialization slate before attaching mixed audio. This wall-clock estimate can differ by a few frames; inspect question12second/40second visual timing before final edit. Use FFmpeg H264/AAC MP4 output and loudness normalization after listening. Never publish raw captures without transcript/claim review. A later prerecorded playback is labeled recorded media and must not imply a native voice handoff.

FFmpeg verified: `C:/Program Files/ShareX/ffmpeg.exe` (n8.1.1). Root also found the existing WinGet FFmpeg install. Playwright uses the bundled runtime; Chrome uses the already-installed agent-browser executable.
