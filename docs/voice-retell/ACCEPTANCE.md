# AWC Retell Managed Realtime Voice Acceptance

Status: IN PROGRESS — live setup validated; waiting for human tester readiness. No acceptance verdict yet.
Date: 2026-09-26 America/New_York (2026-09-27 UTC).

## Verified preflight
- Canonical starting tree clean, checkpoint b303098; preserved preparation b45f147.
- Ignored root .env loaded without printing credentials. Official retell-sdk 6.0.1 installed in existing .cache/voice-env.
- Live read-only agent.list(limit=1) authentication PASS; response AgentListResponse. call.list(limit=1) PASS, response items/has_more/pagination_key/total; zero baseline calls.
- SDK verify is an instance attribute, not a class method. The prepared adapter already uses the correct interface; no correction required. Actual SDK synthetic HMAC tests: valid accepted; changed body, wrong key and expired signature rejected.
- Existing 12 adapter + 9 business/safety tests PASS (21). No local CPU voice benchmark repeated.
- One temporary agent and response engine created successfully through official SDK. Fictional BrightHome, GPT 4.1 mini, ElevenLabs Adrian, 120000 ms max call duration, 8 AWC functions, zero function retries. Recording deliberately enabled with tester consent. No PSTN.
- Dashboard configured rate $0.108/min; $0.216 estimated for 120 seconds, not actual usage. Balance $10.00; auto recharge switch OFF. No payment/phone purchase.
- Temporary Cloudflare tunnel exposes only callback service on 127.0.0.1:8766. Unsigned function/webhook requests return 401; correctly signed wrong-call probe returns 403; /approve and / return 404. No business action from probes.
- Provider-origin callback signing remains unverified until a live call. Local signed probes establish crypto/transport, not provider delivery.

## Session ledger
Zero browser sessions run; 0 seconds; $0 call consumption. No live first-audio, perceived turn/replacement, recognition, truncation, quote/booking/handoff, transcript or listening result yet. No PASS/FAIL provider verdict can be inferred from preflight.

## Constraints and pending action
Maximum 3 sequential sessions, 120 seconds each, initial $3 cap, hard $5 without approval; reconcile actual duration/cost after every session and stop while cost unknown. No automatic retries. Human agreed to microphone testing and recording, then answered Not ready yet before call 1. Do not start until ready. Preserve local exact booking approval. Do not benchmark other providers.

Ignored operational artifacts: .cache/retell-acceptance/setup.json (temporary IDs/URL), preflight.json, cloudflared.exe. Large recordings remain outside Git. Agent UI screenshot captured in task; no call media exists yet.

Exact next action: resume this same bounded acceptance when tester ready; ensure callback/tunnel alive (refresh temporary URL if restarted), verify provider webhook signing key and exact call arming, then run first <=120s browser session with greeting/FAQ/interruption/$225 quote, reconcile actual cost and collect human observations before deciding next session. Full required booking/conflict/handoff evidence remains pending.

Official references: https://docs.retellai.com/features/secure-webhook ; https://docs.retellai.com/api-references/list-agents ; https://docs.retellai.com/deploy/web-call

## Waiting checkpoint
5 persistent genuine-SDK crypto tests added; combined 26 PASS. SDK requirement pinned to 6.0.1. Callback harness and tunnel stopped cleanly; no listeners on 8766/20241 observed. Resume requires a new temporary URL and updating existing agent configuration. This is a checkpoint, not acceptance closeout.
