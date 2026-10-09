# AWC — Premium Prospect Template + Voice-First Crew UX

## Realtor visual direction

Two directions considered: (1) cinematic estate showcase, dark full-bleed photography and overlaid luxury type; (2) architectural journal, cream paper, asymmetric serif composition, inset photographic plates, measured rules and quiet green/gold accents. Chosen: **Architectural journal**. The earlier full-bleed direction looked polished but familiar. The selected direction earns distinction through composition, typography, negative space and paced transitions rather than additional imagery.

The hero puts oversized serif editorial type alongside an inset residence plate, a fine architectural line motif and an offset paper mount. A small journal index leads to a spacious split introduction. The collection balances a broad interior crop with a lower, narrower editorial card. Cream transitions into deep forest for reviewed services, then an architectural locality graphic and restrained gold inquiry surface. No fabricated property listings, endorsements, credentials or testimonials are introduced. Mobile restacks the photographic plate below the opening narrative; reduced motion removes entry animations and image scaling.

## Voice-first Crew rule

A branded specialist capsule says “Talk to Ellis,” with a restrained waveform motif, role and “Chat live / Voice planned” status. The panel orders **Talk here → Call me → Chat**. Talk here carries the strongest visual weight; Call me is secondary; Chat is the quieter working fallback. Voice buttons are `aria-disabled=true` informational controls: a click explains the unavailable connection and records intent, without asking for microphone access, a phone number or connecting a provider. “Planned / Not connected” is visible on both controls.

Exact realtor opening greeting:

> Hi, I’m Ellis, Cedar Lane Realty’s digital real estate specialist. Ask me about buying, seller consultations, the service area, or your next steps using the reviewed information in this demo. Speaking is easier than typing a whole story: in a connected setup, choose Talk here and speak naturally. Talk here and Call me are planned, not connected in this concept. For now, choose Chat and I’ll help you here.

The invitation appears after six seconds on each full page load, never opens a blocking conversation automatically, and never starts audio. Dismissal is page-memory only, so refresh restores eligibility. Opening the panel also dismisses the invitation for that document lifetime.

## Provider-neutral engagement foundation

`window.crewEngagement` exposes a bounded page-memory event buffer, known names and `emit(name, metadata)`. `crew:engagement` CustomEvents allow a future approved adapter to subscribe. Schema version 1 contains timestamp, prospect ID, configured specialist, a random page-local conversation ID and a channel. Optional metadata is restricted to short categorical fields: surface, channel, availability, connected, destination, draftOnly, outcome. Message content and contact data are excluded. Nothing is persisted or transmitted to an analytics provider.

Events: `crew_launcher_seen`, `crew_launcher_opened`, `crew_talk_clicked`, `crew_call_clicked`, `crew_chat_started`, `crew_conversation_started`, `crew_conversation_completed`, `crew_lead_captured`, `crew_handoff_requested`.

Launcher visibility, opening, disabled-channel intent, the first actual chat submission, and actual local handoff drafts are wired. Completion and lead capture are reserved adapter signals: closing a panel is not completion, and a local request draft is not a captured lead. Future adapters must emit those only following an explicit end/validated capture.

## Prospect Demo Factory niche principle

A shared technical shell is allowed. Art direction is niche-specific: typography, imagery strategy, layout motifs, motion, CTA language and trust signals must reflect the business. Realtor templates must not resemble cleaning, med-spa or contractor templates. Crew inherits the niche palette and material treatment while retaining recognizable specialist identity, channel hierarchy, truthful availability, consent and conversational behavior. Other niche page designs remain intact.

## Validation and limits

Focused script: `node owner-ops/scripts/premium-voice-qa.cjs`; artifacts in `docs/qa/premium-voice/`. Existing model/API/store tests: `node --test owner-ops/tests/*.test.mjs`. Voice and callback remain unavailable. Demo access stays loopback-only with noindex; no remote-private-access claim. No paid providers, outreach, third-party analytics or dashboard added.

Recommended next bounded milestone: **AWC — First Verified Prospect Concept & Private Demo Delivery**. Use one manually verified business, approved brand/rights assets, optimized image delivery, authenticated owner/prospect demo access and desktop/mobile QA. No outreach. Real voice/callback enablement remains a separately authorized integration.
