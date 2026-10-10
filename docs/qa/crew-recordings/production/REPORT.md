# Actual production recording acceptance

Actual site: https://aw-creates-ventures.thesml.chatgpt.site

Fourteen playback cases passed: seven published recordings (six specialists plus overview), each on1440pixel desktop and390pixel mobile. No fixtures, readiness mocks or media substitution were used.

Verified readiness-gated actions, actual MP4 sources, nonzero dimensions/durations, loaded caption cues, native controls, no autoplay, playback, start/middle/end seeking, replay, ended state, dialog close pause/source cleanup and keyboard focus restoration. Only the public recording-readiness API was called. No provider sessions, microphone access, inquiry, chat, callback or voice APIs were used. Zero browser script errors; no horizontal document overflow. Total measured test time24.254seconds.

Saved42 playback frame screenshots plus4 clean desktop/mobile dark/light Crew section captures. Clean section captures temporarily hide fixed navigation and floating launcher only within the inspection browser; the production site is unchanged.

Visual review: bespoke typography and dark/light styling remain cohesive; watch/chat hierarchy is clear; dialog controls and surrounding recording disclosure fit mobile. Desktop genuine reply captions are clear. Mobile keeps role title, caption line and controls visible; fine-print within the original desktop screen recording is small at390pixels, with native fullscreen available. These are historical recorded conversations, clearly labeled as recordings by the page/dialog.

An initial assertion checked source cleanup before the native dialog's asynchronous close event fired. The QA now waits for that event; the complete actual-site rerun passed. This was a test timing correction, not a production fix.
