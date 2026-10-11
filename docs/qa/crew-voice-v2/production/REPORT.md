# Actual hosted Crew v2 playback acceptance

Actual site: https://aw-creates-ventures.thesml.chatgpt.site

Sixteen playback cases passed: seven selected v2 specialist recordings plus the retained legacy overview, each at1440-pixel desktop and390-pixel mobile. All cases used the deployed page and actual native hosted MP4/VTT assets, with no fixtures or media substitutions.

Verified selected revision/source URLs, nonzero video dimensions and duration, actual caption loading with ordered nonoverlapping bounded cues, native controls, no autoplay, playback, start/middle/end seeking, replay, ended state, dialog close pause, video/caption source cleanup and restored launcher focus. Both viewport contexts had no horizontal document overflow. Forty-eight actual playback screenshots are included.

Zero browser script errors, unexpected remote/provider requests, microphone requests or WebSockets. The only business API requests were two GET requests to /api/crew-recordings. No inquiry, chat, voice, callback or session mutation was sent. Two same-origin Cloudflare challenge-platform POST attempts were blocked, one per browser context. The initial final guard incorrectly counted these blocked infrastructure attempts as business mutations; the classification was corrected while preserving the block. The completed sixteen cases and their original request logs were revalidated without repeating playback or substituting responses.

Elapsed original browser run: 31.160 seconds. The QA script now records blocked challenge-platform traffic separately and still rejects all business mutation attempts. Source/hash/range verification and Director manual UI review are separate checks.

The diagnostic agent inspected desktop/mobile Autumn and Sage frames: only accepted public recording dialogue and public site content appear; player controls and surrounding recorded-media disclosure fit mobile. The underlying desktop capture's small text remains small on mobile; native captions and fullscreen support remain available. Director review is still required for final visual acceptance.

Sanitized evidence excludes raw video/audio, private transcripts, call IDs, source directories and dynamic challenge identifiers. Captions remain visible in the public playback screenshots because they are part of the accepted visitor experience.

Director review completed: inspected actual desktop/mobile Autumn and Sage frames and played Autumn on the deployed in-app-browser page. Identity, recorded-media disclosure and controls fit; fullscreen/captions support the small recorded text on mobile. Live publication proof: ../live-proof.png.
