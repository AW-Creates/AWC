# Crew custom voice provider research

Verified 2026-10-10. Read-only research: no account mutation, clone creation, TTS generation, call, upload, or subscription purchase. No provider credential was accessed. This document records provider capabilities; AWC's actual account entitlements, sample permissions and prices at execution still require verification.

## Six agent voices

The supported direct route is Retell `POST https://api.retellai.com/clone-voice` with multipart `files`, `voice_name` and `voice_provider`. It returns a Retell `voice_id` and a `preview_audio_url`. Current providers: `elevenlabs`, `cartesia`, `minimax`, `fish_audio`, `platform`, `inworld`. ElevenLabs accepts up to 25 files; Cartesia/MiniMax use one; Inworld up to three. The endpoint documents no general byte/duration limit. [Official clone API](https://docs.retellai.com/api-references/clone-voice).

Retell's guide additionally specifies a single file for platform clones, and an Inworld total of 16 MB. It allows 100 custom voices per account. Delivery in the sample influences delivery of the clone; clean, continuous speech from one speaker is recommended. [Official custom voice guide](https://docs.retellai.com/build/voice).

Do not assume a private ElevenLabs clone ID can be imported into Retell. The community import API requires `provider_voice_id`, `voice_name` and, for ElevenLabs, the owner's `public_user_id`. It returns a new Retell ID. [Official import API](https://docs.retellai.com/api-references/add-voice). ElevenLabs does not permit sharing Instant Voice Clones; verified Professional Voice Clones have sharing controls. [Official sharing rules](https://help.elevenlabs.io/hc/en-us/articles/18644643807889-How-do-I-share-a-voice). Prefer cloning authorized source audio directly in the intended Retell workspace rather than making it public to bridge services.

## Custom AI presenter

The presenter is a seventh voice, used to generate visitor questions, rather than another paid conversational agent. A separate ElevenLabs Instant Voice Clone is a supported option: `POST /v1/voices/add` uploads files and returns `voice_id` plus `requires_verification`. Respect any verification response. [Official IVC API](https://elevenlabs.io/docs/api-reference/voices/ivc/create).

`POST /v1/text-to-speech/{voice_id}` generates speech from text. Pick a compatible model and output format. MP3 44.1 kHz/128 kbps is a documented default example; 192 kbps requires Creator or above, and 44.1 kHz PCM/WAV requires Pro or above. Decode/resample the generated MP3 locally for the existing microphone capture. [Official speech API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert).

Inference from the verified APIs: clone the six agent samples in Retell, and the presenter sample in the presenter's TTS provider. Retell's documented voice APIs do not establish a standalone arbitrary-text TTS route, and a Retell voice ID is not an ElevenLabs voice ID. Confirm credentials/entitlement for the chosen presenter service before uploading. Do not bypass this by starting an extra Retell session.

Actual generated presenter questions should enter the captured conversation as microphone audio. Keep the corresponding actual agent replies, rather than dubbing a new question over a response to a different question. Native agent output and edited assembly need truthful labels.

## Samples and consent

For initial instant cloning, aim for 1–2 minutes of clean speech per intended voice. ElevenLabs recommends a minimum minute, little improvement beyond three minutes, consistent delivery, and MP3 at 192 kbps or above. Confirmation of rights and consent is part of its flow. [Official instant cloning guide](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning).

Professional cloning is a different workflow: minimum recommended 30 minutes, preferably around 2–3 hours, with owner verification. [Official professional cloning guide](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/professional-voice-cloning). ElevenLabs PVC permits only the account owner's own voice; permission from someone else does not allow creating their PVC on AWC's account. The speaker can create/verify their own PVC and share it appropriately. [Official ownership restriction](https://help.elevenlabs.io/hc/en-us/articles/36842751624209-Can-I-create-a-Professional-Voice-Clone-of-someone-else-s-voice).

## Costs and execution boundary

Retell's current public component prices list infrastructure $0.055/minute, GPT-4.1-mini standard $0.0128/minute, and ElevenLabs speech $0.040–$0.10/minute depending on model. That gives $0.1078–$0.1678/minute before optional add-ons for that particular combination. These are estimates, not a spending grant or provider dollar stop. No separate cloning fee was established in the pages reviewed; do not describe cloning as free. Check actual workspace terms before submission. [Official Retell pricing](https://www.retellai.com/pricing).

ElevenLabs lists IVC and commercial use at Starter and above, PVC at Creator and above. Current regular monthly prices shown are Starter $6 and Creator $22, with time-limited introductory offers. TTS consumes credits per generated character according to model; existing plan/credit availability is unknown. Do not subscribe, upgrade or spend against the earlier consumed recording allowance. [Official ElevenLabs pricing](https://elevenlabs.io/pricing).

Before production: accept seven mapped samples, record authorized use, validate quality, confirm provider/account and exact bounded cost allowance, create clones, obtain owner audible approval, bind new draft agent versions, and only then capture the longer genuine examples. No automatic retries or public live activation are authorized by this research.
