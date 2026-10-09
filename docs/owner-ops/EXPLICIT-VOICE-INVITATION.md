# Explicit Voice Invitation — 2026-10-09

Owner feedback: the invitation must communicate an audible back-and-forth conversation inside the website, not leave visitors to interpret “conversation” as texting. Preserve the approved premium visual direction.

Current heading: **Talk it through. Right here.**

Exact current realtor opening:

> Hi, I’m Ellis. With Talk here connected, we can speak back and forth through your microphone and speakers—like a phone conversation, right inside this window. Ask about buying, selling or your next step. You talk, I reply out loud, and you can keep asking questions.

Main CTA: **Try Ellis — Talk here**. Adjacent visible status: **Voice preview — not connected yet.** Text examples are labeled **Prefer typing? Try a question:**. Mobile retains the same microphone/speaker/out-loud benefit copy; it does not substitute a generic shorter greeting.

The primary CTA opens the channel panel with Talk here focused and an immediately visible explanation above messages. It emits `crew_talk_clicked` with invitation surface, planned availability and connected=false, alongside `crew_launcher_opened`. Opening the preview does not emit conversation started. Talk here → Call me → Chat remains the interaction order. Text shortcuts still submit the selected question in one click. No microphone, audio, provider request or phone call is triggered.

Every full page load still shows the nonblocking invitation after six seconds; dismissal lasts for the current document only. Reduced motion and viewport bounds apply. Shared Crew invitation behavior inherits each niche's specialist identity and service examples.

Acceptance: 13 existing Node tests pass. Focused desktop 1440×1000, mobile 390×844, small mobile 360×800 and reduced-motion browser checks pass. Checks cover visible audio-benefit copy, primary CTA focus/event, truthful disabled channels, working text and quick questions, page-only dismissal/refresh, viewport fit, no autoplay/microphone and no external requests. Evidence: `docs/qa/voice-invitation/`, script `owner-ops/scripts/voice-invitation-qa.cjs`. Actual persisted reviewed concepts regenerated after renderer restart; user's open preview refreshed. No layout redesign, live channel enabling, paid session or analytics transport.

Next milestone remains **AWC — Crew Live Prospect Demo Connection & Acceptance**. After validated live connection, change conditional preview language to direct available-now language and make this CTA enter explicit voice consent/start; do not silently start the microphone from the delayed invitation. Paid acceptance awaits the separately requested fresh numeric allowance and test destination.
