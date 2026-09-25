# Build versus buy — AWC voice bake-off

Owner: Director. Date: 2026-09-24. Scope: synthetic BrightHome cleaning receptionist; no customer launch or paid adoption. Performance results belong in BENCHMARK.md; all costs below are estimates, not invoices or measured operating costs.

## Candidates and commercial suitability

| Component | Primary source / documented terms | Practical tradeoff |
|---|---|---|
| Pipecat | [Repository](https://github.com/pipecat-ai/pipecat), BSD-2-Clause | Composable Python frame pipelines, transport/provider choice. Local browser experimentation has fewer infrastructure pieces; operating a reliable phone service remains our responsibility. |
| LiveKit Agents | [Repository](https://github.com/livekit/agents), Apache-2.0 framework; turn models have a separate model license | Strong room/WebRTC and telephony ecosystem; self-hosted room server or cloud infrastructure adds configuration. SDK license does not license every optional model. |
| faster-whisper | [Repository](https://github.com/SYSTRAN/faster-whisper), MIT implementation | Local CTranslate2 recognition offers data control; downloaded model license and CPU throughput must be checked separately. |
| Kokoro | [Model card](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0 weights; [ONNX wrapper](https://github.com/thewh1teagle/kokoro-onnx), MIT | Small local TTS candidate; distribution includes transitive phonemizer/eSpeak dependencies whose notices and licenses also matter. |
| Chatterbox | [Repository](https://github.com/resemble-ai/chatterbox), MIT | Local expressive synthesis candidate; deployment feasibility is decided by actual installation/inference evidence, not published quality claims. No voice cloning in this test. |
| ElevenAgents | [Pricing](https://elevenlabs.io/pricing/agents), proprietary hosted service | Published free allowance: 15 call minutes. Starter lists commercial license. Creator regular monthly price $22 with 275 minutes; extra minutes $0.08, LLM and carrier billed separately. Free access not established by a public pricing page. |

These permissive top-level licenses allow commercial use subject to their terms; preserve license/notices and review transitive distributions before shipping. This is an engineering dependency screen, not a complete legal audit. No claim that repository popularity establishes security. Both framework repositories show active development; installed versions are recorded in benchmark evidence. Vulnerability scanning, production patch policy, SLA and incident response are unvalidated.

## Cost model (USD per month)

Workloads: low = 500 connected minutes (~100 five-minute calls); scaled = 10,000 minutes (~2,000 calls). Peak concurrency, not monthly minutes alone, determines self-host capacity. Assume 50% assistant speech, 730 hours/month, one region, no redundancy in low tier. All figures exclude taxes, initial engineering, acquisition costs and optional call recording.

Shared illustrative carrier allowance = $2 number + $0.015/minute: $9.50 / $152. This is an assumption, not a quoted carrier rate. LLM allowance = $0.005/connected minute: $2.50 / $50; model/token/context mix can change it substantially. Operator time valued at $50/hour. Egress/storage reserve is explicitly included below.

| Architecture | Low infrastructure/API | Low operations | Low total | Scaled infrastructure/API | Scaled operations | Scaled total |
|---|---:|---:|---:|---:|---:|---:|
| Managed premium | $22 + 225×$0.08 + $2.50 LLM + $9.50 carrier + $2 reserve = $54 | 2h = $100 | **$154** | $22 + 9,725×$0.08 + $50 LLM + $152 carrier + $10 reserve = $1,012 | 6h = $300 | **$1,312** |
| OSS-heavy hybrid | $40 CPU host + $2.50 hosted LLM + $9.50 carrier + $5 reserve = $57 | 4h = $200 | **$257** | $240 CPU capacity + $50 hosted LLM + $152 carrier + $25 reserve = $467 | 10h = $500 | **$967** |
| More fully self-hosted | $80 compute/amortization/power + $9.50 carrier + $5 reserve = $94.50 | 6h = $300 | **$394.50** | $600 compute incl. local LLM + $152 carrier + $25 reserve = $777 | 16h = $800 | **$1,577** |

Premium uses Creator plus standard overage purely for transparent arithmetic; confirm plan limits and permitted overage before contracting. No free/promo minutes assumed for commercial steady state. Hosted storage/egress reserves are budget assumptions, not additional documented provider fees. Hardware allowances for OSS are speculative until concurrency/load testing; the laptop benchmark does not validate these capacities. Self-hosted does not mean cost-free. Local POC incremental API spend is zero; developer time/electricity are not zero.

Sensitivity: +$0.01/minute adds $5/$100; each extra operator hour adds $50. Managed burst charges and local redundancy/GPU requirements can reverse the ranking. At low volume, operations dominate; at scale, real utilization and staffing must replace these estimates. Do not select self-hosting solely on per-minute inference price.

## Control and switching

Default local audio/text stays on localhost; model acquisition contacts public hosts. Optional hosted LLM sends conversational data to its configured endpoint, requiring explicit deployment configuration and retention review. Local transcript persistence needs access controls, retention, deletion and recording consent before real callers. Managed service retention/data-processing terms are not validated here.

Keep business rules, bookings, handoff schema and transcript JSON outside framework/provider classes. Replace STT/TTS/LLM adapters independently; switching transports still requires client, interruption and timing regression tests. Managed workflow configuration and voice IDs increase migration work; self-hosting trades that dependence for model/runtime and operations maintenance.

Decision: Pipecat/faster-whisper/Kokoro for the local experiment; no production or paid-provider selection. BENCHMARK.md records the completed evidence and realtime gaps. Revisit for PSTN integration, real caller accents/noise, peak concurrency >1, sustained latency misses, provider price/license changes or required production SLA. No production deployment authorized.


Transitive license gate: [Phonemizer](https://github.com/bootphon/phonemizer) is GPL-3.0-or-later; [eSpeak NG](https://github.com/espeak-ng/espeak-ng) is GPL-3.0-or-later. The selected local speech path therefore is not an entirely permissive-license distribution. Before shipping a bundled/proprietary product, review the combined distribution and corresponding-source/license obligations, or replace the phonemization path with a compatible alternative and revalidate pronunciation. Local experimentation does not establish distribution compliance.
