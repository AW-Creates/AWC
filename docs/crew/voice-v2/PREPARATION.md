# AWC — Custom Voice Casting & Demonstration Revision

Owner direction, 2026-10-10: custom samples for all six Crew specialists and a seventh authorized custom sample for the presenter. Replace repetitive full agency names with “Crew by AWC” and natural “we/our” references. Make each individual demonstration meaningfully longer. This is preparation; no clone, provider update, generated audio or new recording has been created.

## Seven voice samples

Provide one clearly labeled sample for Autumn, Owen, Clara, Miles, June, Theo and Presenter. Preferred intake: approximately1–3minutes of clean, continuous conversational speech per voice, WAV or a high-quality MP3. This is a recommended ElevenLabs-style intake target, not a universal provider minimum. Use one speaker per sample with the pace, accent and energy desired for the final voice; avoid background music, noise, echo, overlapping speakers or heavy processing. Keep voice samples private. Identify whether each voice is yours or used with the speaker's permission to clone it for the commercial AWC showcase.

| Voice | Suggested delivery to listen for |
| --- | --- |
| Autumn | Warm, observant and welcoming; comfortable conversational pacing |
| Owen | Confident, thoughtful and consultative; clear questions without sales pressure |
| Clara | Organized, considerate and precise; light, calm rhythm |
| Miles | Patient and reassuring; methodical explanations without stiffness |
| June | Clear, discreet and composed; careful language that still sounds human |
| Theo | Encouraging and practical; engaged, clear project guidance |
| Presenter | Natural and curious business owner; comfortable follow-ups and varied intonation |

These are casting briefs, not fixed gender/age/accent choices. Samples determine the actual voices; the owner approves each preview before full production. Different names/prompts alone do not create different voices. Do not manufacture distinction by pitch-shifting one voice.

Retell documents native custom cloning through its voice selector/API. The returned Retell voice IDs bind separately to the six existing agents. For the presenter, a verified standalone custom TTS service must produce question audio that is fed into the real microphone capture. Retell's custom voice IDs cannot be assumed usable as standalone TTS or importable into another service. Current possible workflow: native Retell cloning for specialists, ElevenLabs instant cloning/TTS for the presenter, subject to account, costs and audio-quality review. Professional ElevenLabs cloning is limited to the verified owner's own voice; consent alone does not make another speaker eligible for that mode.

## Spoken brand and conversation direction

Say AWC as the three letters A–W–C. Introduce the specialist briefly with “Crew by AWC” and an AI disclosure. Do not repeat the greeting or company name on subsequent turns. Use “we” and “our” naturally when speaking about the agency; use “I” for the specialist's responsibility. Use the full company name only when explaining the acronym, distinguishing the agency from a client's business, or answering an identity question. Never let “we” imply an unconnected tool is operational.

Example opening: “Hi, I’m Autumn, your AI concierge with Crew by AWC. What can I help you work through today?” Follow-up style: “We help businesses connect a better website with the systems behind it. My role is to clarify what you need and point you toward the right next step.”

Keep explanations conversational: contractions, varied sentence length, one useful question at a time, brief acknowledgment of the answer, then a relevant follow-up. Avoid reciting a list of services, long job-title introductions or repeating “for the owner” in every turn. Explain studio approval once at the point where it matters. Preserve all identity, knowledge and tool boundaries; no invented prices, outcomes, bookings, payments, transfers or completed actions.

The offline pack `VOICE-V2-REVIEW.json` contains six replacement greetings and a shared prompt overlay. It is not an applied provider configuration. The final overlay must be merged with each pinned approved baseline after samples/previews are accepted; preserve the baseline's role-specific permissions and approved facts.

## Longer individual demonstrations

Target90–120seconds per finished role clip, approximately3–4 meaningful back-and-forth exchanges. Keep the overview near60seconds. Suggested structure: short greeting; realistic business problem; specialist asks a useful question; presenter answers; specialist explains its contribution and the relevant next step; one concrete customization example. The separate conversations remain labeled recordings, not a live cross-agent transfer.

| Role | Opening problem | Presenter detail after the specialist asks | Useful follow-up |
| --- | --- | --- | --- |
| Autumn | “I run a remodeling company. Visitors ask similar questions and some inquiries get missed. Where would I start?” | Small team, a basic website and owner-reviewed estimates | “Would I need a whole team, and how would your role know when someone needs sales or scheduling?” |
| Owen | “Our website gets inquiries, but they arrive without enough detail. How would you help us plan a better process?” | A contact form and shared inbox; unclear goals and response responsibility | “Could we improve the site first and add a specialist later? What would you clarify before a proposal?” |
| Clara | “People ask for consultations by email, and we spend time going back and forth. How could a specialist help?” | Two possible windows, meeting goal and preferred format; no personal details | “What would happen if no calendar were connected yet, and what could change once one is approved?” |
| Miles | “A contact page stopped working on mobile. What would you need to prepare a useful support request?” | A synthetic page name, browser/device, approximate onset and impact | “How would you decide whether this needs urgent human attention, and what would the handoff include?” |
| June | “I have a question about an invoice line. How could your role help without exposing private information?” | Synthetic invoice reference and general question; no payment/account data | “What can you explain here, and when would a person need to review the actual invoice?” |
| Theo | “We want a website and Crew, but our assets and processes are scattered. What should we prepare first?” | Goals, approved logo/copy, existing form and two proposed specialist responsibilities | “Could we launch in phases, and how would we define each specialist's permissions before connecting tools?” |

Presenter audio is generated from the selected authorized custom voice, not Windows SAPI. Do not write or synthesize the agent's answers to fake a live conversation. Capture genuine provider responses, and edit for clarity. Wait for the actual agent to finish before each presenter question; the previous fixed12/40second cues caused interruptions and should not be reused. Verify turn completion mechanics in a free local preflight before reserving a paid session.

## Production sequence and pending inputs

1. Receive and locally inspect the seven labeled authorized samples; assess clarity, duration and distinctiveness.
2. Verify native clone/standalone TTS account support and current charges. Present one concrete capped allowance for clone/preview/TTS/capture work before any paid generation or session.
3. Create one preview per voice under that allowance; owner chooses/accepts each voice and confirms A–W–C pronunciation. Do not automatically regenerate or retry.
4. Bind six accepted voice IDs and revised spoken prompts to new versions of the existing six agents. Read back identities, versions, prompts and permissions; public live channels stay gated.
5. Record genuine longer conversations with the custom presenter, within a new finite duration/session/spend cap. Reconcile every actual provider cost.
6. Review audio, captions, pacing, meaningful role example and actual boundaries. Publish replacement versioned assets after desktop/mobile playback checks. The current immutable media endpoint intentionally cannot overwrite approved filenames; replacement needs a reviewed asset-revision change. Keep existing recordings until replacements pass acceptance.

Old recording allowances are fully consumed and the archived capture gate remains closed. Incremental spend during this preparation: $0. Current public recordings/provider configurations are unchanged.

Sources: [Retell custom voices](https://docs.retellai.com/build/voice), [Retell Clone Voice API](https://docs.retellai.com/api-references/clone-voice), [ElevenLabs instant cloning](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning).
