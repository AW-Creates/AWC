# Crew business demo number

Updated 2026-10-09. The owner purchased ONE US local Retell/Twilio number after adding the workspace payment method. The exact owned source was verified by API readback and named **AW Creatives Business Demo**. Do not purchase a replacement or release it after a test: the owner intends to retain it for business demos.

Outbound routing is bound only to the dedicated published Ellis agent, version 0. Inbound answering, inbound webhook, fallback and SMS routing are disabled. Calling is restricted to the US. No paid add-ons or auto-recharge were enabled. The full source and privately supplied destination remain in ignored local configuration.

The source costs $2/month while retained, plus call usage. Phone subscriptions bill the payment method separately from usage credits; the earlier HTTP 402 blocker is resolved by the owner’s purchase. [Official billing](https://docs.retellai.com/accounts/billing), [Official pricing](https://www.retellai.com/pricing).

## Approved tests and current result

The owner approved one callback test, up to 120 seconds with a $0.50 allowance, to their privately supplied and consented test destination. Source readback passed before activation. Exactly one request was placed through the actual loopback callback endpoint; Retell accepted it. The owner confirmed that the phone rang and Ellis held a two-way conversation. Acceptance and user-confirmed pickup are separate evidence; API acceptance alone does not prove pickup.

The callback attempt is consumed and cannot retry or automatically renew. The separate browser grant was renewed by the owner after the original unused window expired; neither channel can borrow the other channel’s approval. Each grant has its own ID, one-attempt cap, $0.50 reservation and finite expiry. The old grant is preserved, not reset. This is a private acceptance setup, not an unrestricted prospect calling service.

## Cost interpretation

With standard gpt-4.1-mini and the reviewed ElevenLabs voice, ordinary browser components estimate $0.1078/min ($0.2156 for two minutes). US phone telephony adds approximately $0.015/min, for an ordinary two-minute phone estimate of $0.2456. These estimates exclude token-scaling exceptions and are not provider-enforced dollar stops. Keep the short approved prompt and omit optional visitor context; reconcile actual provider cost after each test. [Pricing](https://www.retellai.com/pricing), [Billing exceptions](https://docs.retellai.com/accounts/billing-exceptions).

Number verification evidence, approvals and actual call identifiers stay in ignored owner-ops/.local files. Public sanitized acceptance evidence is stored in docs/qa/prospect-channels/live-acceptance.json. No transcripts, recordings, private destination or credentials belong in Git. Retain the business number; disable future calling when finite test grants are consumed or expired.
