# Cost and build-versus-buy update — 2026-09-26

Status: no paid provider selected and no completed managed generation. Realtime measurements decide feasibility; this is a **modeled** cost comparison, not a capacity test or invoice. This supersedes the prior bake-off's illustrative monthly amounts for the two workloads below; prior evidence is retained.

Local transport now carries audio, but transport speed alone cannot solve multi-second synthesis or lossy recognition. CPU-only deployment cannot be priced as if it met acceptance. Model changes, GPU hosting, quality review and ongoing maintenance can materially increase local costs. Keep deterministic tools and the transcript/summary schema independent of transport, STT and TTS.

## Access and current published rates

The canonical ignored `.env` is loaded by the runtime without overriding an explicit process setting. The exact runtime key passed `GET /v1/me` with HTTP 200 on 2026-09-25; no secret was printed. That proves authentication only. A bounded text-to-streaming-audio `gpt-realtime-mini` control connected with no uploaded audio, tools, booking authority, or completed generation, then received `billing_not_active`. The API cannot verify the user's reported $10 project balance or the project's input/output-sharing allowance, so neither is treated as usable Realtime credit. No performance result exists for the managed control.

[OpenAI pricing](https://developers.openai.com/api/docs/pricing), checked 2026-09-26, lists `gpt-realtime-2.1-mini` at $10/million audio input tokens and $20/million audio output tokens, with text at $0.60/$2.40 per million input/output tokens. This pricing comparator is distinct from the access probe model, `gpt-realtime-mini`; it does not establish availability, a billable rate for that probe, or a performance winner.

[Deepgram pricing](https://deepgram.com/pricing), rates reverified 2026-09-26: public $200 introductory credit without a card; Nova-3 monolingual streaming promotional $0.0048/audio minute (regular $0.0077); Aura-2 $0.030/1,000 characters; Standard Voice Agent $0.075/connected minute. Credits and promotional rates are not assumed in steady-state totals. [Azure Speech pricing](https://azure.microsoft.com/en-gb/pricing/details/speech/) lists an F0 neural-TTS allowance of 0.5 million characters/month; no configured F0 resource was available. All managed performance remains **unmeasured**, including published latency claims.

## Transparent workload assumptions

Low demo: 60 connected minutes/month. Larger operation: 10,000. Assistant speaks half the time at 900 characters/spoken minute, or 450 characters/connected minute. Streaming recognition is conservatively billed for the full connected minute. Single-channel English. No recording retention requirement, redundancy or geographic deployment claim.

| Speech API component | 60 minutes | 10,000 minutes |
|---|---:|---:|
| Local STT + local TTS API fee | $0 | $0 |
| Managed Aura-2 TTS only (local STT) | $0.81 | $135.00 |
| Managed Nova-3 STT + Aura-2 TTS, current promotion | $1.10 | $183.00 |
| Same using regular $0.0077 STT rate | $1.27 | $212.00 |
| Mostly managed Standard Voice Agent | $4.50 | $750.00 |

Formula: TTS = minutes × 450 / 1,000 × $0.030. STT = minutes × rate. Voice Agent is a separate bundled candidate; do not add those STT/TTS fees again.

### OpenAI Realtime pricing scenario, not observed billing

Assume 600 audio input tokens for each caller-spoken minute and 1,200 audio output tokens for each assistant-spoken minute, with a 50/50 conversation split. At the currently published `gpt-realtime-2.1-mini` audio rates, the audio-only estimate per connected minute is `(0.5 × 600 × $10 + 0.5 × 1,200 × $20) / 1,000,000 = $0.015`.

| Component | 60 connected minutes | 10,000 connected minutes |
|---|---:|---:|
| Realtime audio only under those assumptions | $0.90 | $150.00 |
| Text, context, tools, hosting, carrier, storage and operations | extra, unobserved | extra, unobserved |

This is a planning formula, not a quote or invoice. Actual token use, caching, conversation length, tools, carrier and hosting can change it materially. The local stack has no performance winner: local transport carries audio, but local TTS remains too slow; the managed control is billing-blocked.

## Illustrative total ownership budget (not validated capacity)

Additional assumptions: local/hybrid compute and power placeholder $20/$240, LLM allowance $0.005/minute ($0.30/$50; current deterministic demo incurs none), carrier placeholder $2 + $0.015/minute ($2.90/$152), storage/egress reserve $2/$10. Operations valued at $50/hour. Carrier figures are planning assumptions, not provider quotes. The $240 compute line does not establish concurrency or realtime capacity.

| Candidate | Demo cash / operations / total | Larger cash / operations / total |
|---|---:|---:|
| OSS speech, 6h/16h operations | $25.20 / $300 / **$325.20** | $452 / $800 / **$1,252** |
| Local tools + managed STT/TTS, 4h/10h operations | $26.30 / $200 / **$226.30** | $635 / $500 / **$1,135** |
| Mostly managed voice, 2h/6h operations | $9.40 / $100 / **$109.40** | $912 / $300 / **$1,212** |

Hybrid uses promotional API rates; regular STT adds $0.17/$29. More assistant speech scales TTS linearly. Each additional operator hour adds $50; each extra $0.01/minute adds $0.60/$100. Hardware/operations estimates can reverse the ranking. No plan above is approved spending. The actual local test uses existing hardware and incurred $0 API/carrier fees; time/electricity are unpriced actuals. The $50 startup constraint excludes any unapproved purchase, not engineering effort.

## Decision and portability

Do not choose a demo winner on cost alone. A managed control can be reconsidered only after billing is active and a capped synthetic test completes; it is not currently a usable alternative. Swap `pcm`/synthesis behind the same cancellation contract; STT must preserve reviewed action confirmation. Keep quote, booking conflict logic, handoff and transcript JSON outside provider logic. Repeat interruption, latency and safety regression after a provider change.

License screening remains in ../voice-bakeoff/BUILD_VS_BUY.md: permissive top-level Pipecat/LiveKit/Kokoro/Chatterbox licenses do not erase model or GPL phonemizer/eSpeak distribution obligations. No new distribution approval, security SLA, WAN/NAT test, customer-data processing arrangement or production integration is implied.

PSTN is deferred: no free phone credential/allowance was selected for this milestone. Minimal next step is provision or supply one explicitly no-cost inbound number/SIP account and verify its limits, then connect an accepted voice stack and prove one consented inbound test call. Do not buy a number or enable paid calling automatically.

## Recognition correction update — 2026-09-26

The existing cached faster-whisper base.en model recovered all 45 normalized reference words in five synthetic fixtures (193–251 words/minute), versus 33.3% normalized word error for the preserved Zipformer streaming results. Full-utterance correction took 656–686 ms in the recorded component comparison. This costs no new API fee or model purchase, but adds processing time after endpoint detection. It is not physical microphone acceptance or proof of realtime capacity. See evidence/asr-finalizer-comparison.json. Keep the local cash figures as planning placeholders, not accepted deployment costs.
