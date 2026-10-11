# Genuine Crew demonstrations — production plan

Owner accepted all eight local Voicebox previews. Seven specialist recordings plus the custom AI presenter are in scope. Presenter questions use local Voicebox Qwen TTS; agent replies must come from actual Retell sessions.

## Approved recording allowance

Seven attempts, one per specialist; maximum150seconds and$1perattempt,$7total. No automatic retries, subscriptions, recharge, new phones or public live-call activation. Failed attempts remain consumed. Reconcile actual provider cost before the next attempt. Launch only after a verified all-in rate and safety margin fit the per-session cap. Owner explicitly approved this numerical plan in chat. RECORDING-ALLOWANCE.json records the unused grant; the owner subsequently amended the clone upload condition as recorded in that file.

The owner subsequently authorized seven original sample uploads when the interface shows no fee or checkout, stopping if payment is requested or a charge is disclosed. All seven native clones are created and inventory-verified. A standalone cloning fee remains undocumented; this is not proof of free cloning. Local Voicebox IDs cannot be assigned as Retell voice IDs; the documented interface accepts native/provider clones rather than a local Qwen TTS server. Retell clone sound must be checked separately from accepted Voicebox previews.

## Content and capture

PRESENTER-TURNS.json contains three presenter turns per role including Sage. Genuine replies are not scripted, dubbed or fabricated. Greeting briefly identifies the AI specialist with Crew by AWC; follow-ups use we/our naturally. Preserve role-specific facts, permissions and human-review limits. Examples contain no client data.

Use separately decoded custom-presenter WAVs, replacing the fixed SAPI timeline. Wait for call_started and observed agent-stop-talking followed by a quiet debounce; cancel pending playback if agent speech resumes. A stop event alone does not guarantee whole-turn completion. Record the same question audio sent to the agent and actual remote replies. Test connection, speech ordering, timeout and cleanup locally before any paid reservation. End after the final reply, with a150second hard stop.

Target90–120second finished clips when the exchange supports it; do not pad or promise exact length before capture. Review identity, acronym pronunciation, role example, boundaries, captions and audio. Provider transcripts can support captions if local ASR remains blocked, with listening verification.

Use new versioned public assets only after desktop/mobile playback acceptance. Preserve existing clips and archived closed gate. Enable the separate immutable voice-v2 gate only after approved native voices, verified published bindings/rates and actual presenter-question listening acceptance. Raw samples/transcripts/recordings remain private and ignored.

Sources: https://docs.retellai.com/build/voice ; https://docs.retellai.com/api-references/clone-voice ; https://docs.retellai.com/api-references/add-voice ; https://www.retellai.com/pricing

Owner accepted all seven native clone previews and explicitly approved publishing Autumn v2 and the other six v1 recording revisions. Exact published custom-voice, prompt, no-tool/no-memory/no-fallback and 150-second cap readbacks passed; pinned baselines were preserved. Each selected custom-voice version shows $0.108/min. All 21 presenter inputs passed full decode, signal, script mapping and unique-hash checks, totaling 133.52 seconds. A private combined question review and script reference are ready; actual generated-question listening acceptance remains pending. No paid session or public media replacement has occurred. See NATIVE-VOICE-BINDINGS.json and PRODUCTION-PREFLIGHT.md.
