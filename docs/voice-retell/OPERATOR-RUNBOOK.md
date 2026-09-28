# BrightHome / Ava operator runbook

Fictional single-caller demo only. No real calendar, customer data or contact delivery.
The existing Retell voice acceptance remains passed. This milestone adds catalog and
operator tooling, not a new live voice acceptance or additional call allowance.

## Before presenting

- Work from `C:\Users\A-Problem\Documents\Web Development\AW-Creates-Ventures\AWC`.
- Use synthetic caller details and headphones. Close private tabs and notifications.
- Read `experiments/receptionist/demo_business.json`: identities, hours, Springfield
  service area, demo-only insurance/policy facts, catalog and fixed mock appointments.
- Confirm the existing Python environment, `.env` credential and ignored
  `.cache/retell-acceptance/setup.json` are present. Never print or share them.
- Review the current Retell balance, displayed all-in rate, duration limit and
  auto-recharge setting before any separately authorized voice session. Historical
  balance/rate is not current evidence. No spending is authorized by this runbook.
- Preserve `.cache/retell-acceptance/demo-creation-attempt.json`. The previous
  one-call allowance is consumed. Never delete, rename or reset it to get another call.

## One-command readiness (no call, no chargeable text test)

```powershell
.cache\voice-env\Scripts\python.exe scripts/voice-demo/demo_operator.py --cloudflared .cache/retell-acceptance/cloudflared.exe
```

This checks secrets by presence without showing values, validates local identity and
catalog, checks ports, starts an owned tunnel and callback runtime, syncs the existing
temporary agent's tool schema/instructions/greeting, verifies provider readback,
refreshes stale tool/webhook URLs, and checks health plus signed availability and
catalog callbacks. It preserves model/voice and booking protections. Success prints
`PASS: signed callback, tool URLs, agent identity and catalog configuration verified.`
It then stops its runtime and tunnel. A PASS is a point-in-time check, not permission
to call or evidence that a stopped tunnel still works.

Any STOP/nonzero exit blocks the demo. A missing secret, occupied port, tunnel failure,
signature rejection, changed agent, or readback mismatch must be resolved first.
After two focused failures, stop and record the exact blocker; do not keep retrying.

## Present now without paid calls

```powershell
.cache\voice-env\Scripts\python.exe scripts/voice-demo/rehearse.py
```

This runs the actual catalog/quote/booking/handoff tools with synthetic input and
temporary output storage. It makes no network call or audio claim. Show the returned
answers and outcome alongside `DEMO-SCRIPT.md`. The rehearsal visibly checks that
caller confirmation alone cannot book, then performs an explicit local operator
approval, shows confirmation, rejects a conflicting slot, and retains handoff context.
It starts from a fresh mock calendar and cannot affect the provider or real bookings.

## Voice start / stop

`demo_operator.py --serve --cloudflared .cache/retell-acceptance/cloudflared.exe` is the
one-shot voice startup path. It currently refuses to start because the existing
allowance is consumed. A future separately scoped voice milestone must establish
authorization, budget and an audited new allowance; this milestone does not implement
a reset or bypass. Readiness alone never creates a call.

With a valid future allowance, the loopback browser is `http://127.0.0.1:8767/`;
Start creates one session only after another readiness check. Provider cap remains
120 seconds and browser stop remains 115 seconds. The current voice page has no
operator approval control; present confirmed booking in the offline rehearsal.
End the call with End before the cap, then Ctrl+C in the operator terminal. Cleanup
terminates only processes created by that startup. Do not close unrelated processes.

## Troubleshooting and fallback

- Microphone: allow browser microphone access on the loopback page; choose the right
  input device in browser/Windows settings, use headphones and check mute. Do not
  create repeat calls to diagnose the mic. Use a local recording/device meter first.
- Stale tunnel: stop the owned runtime with Ctrl+C and run readiness again. It obtains
  a new URL and verifies fresh provider readback. Never paste an old URL from a report.
- Retell outage or insufficient balance: use `rehearse.py`; label it an offline tool
  walkthrough. Do not claim it demonstrates live latency or interruption behavior.
- Failed startup: secrets remain private; inspect local setup privately. Do not paste
  `.env`, access tokens, provider response bodies, or private cache files into support.
- Review expired/changed: no booking is confirmed. Ask whether a fresh proposal is
  wanted, recheck availability, then obtain new local approval. Do not describe a
  stale review as proof the slot is unavailable or automatically repeat the offer.

Do not demo live when readiness fails, the allowance is consumed, cost is unverified,
mock dates are being mistaken for real availability, secrets/private data are visible,
or a caller expects a real booking/human connection. Reconcile actual provider cost
after any future authorized call and shut down before leaving the workstation.
