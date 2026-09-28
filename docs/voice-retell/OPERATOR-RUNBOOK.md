# Ava / BrightHome operator runbook

Fictional demo only: synthetic details, fixed mock dates, no real booking or human contact.
Use the offline presentation today. Previous voice acceptance is separate evidence;
the existing live-call allowance is consumed and must not be reset.

## Before demo: five-minute checklist

- Open this runbook and DEMO-SCRIPT.md. Read the opening once aloud.
- Close private tabs/notifications. Share only the presentation window.
- Use fictional caller details. Insurance and service facts belong to fictional BrightHome.
- Confirm the mock dates are described as examples, never current availability.
- For this offline flow, no microphone, Retell login, tunnel, or balance check is needed.
- Allow 3–5 minutes to present; reserve extra time for owner questions.

## Start demo: one command

1. Open File Explorer and paste this into its address bar:
   `C:\Users\A-Problem\Documents\Web Development\AW-Creates-Ventures\AWC`
2. In that folder, right-click empty space and choose **Open in Terminal**.
   Use a PowerShell tab. The folder name at the prompt should end in `AWC`.
3. Paste the following line and press Enter:

```powershell
.cache\voice-env\Scripts\python.exe scripts/voice-demo/rehearse.py --present
```

The results appear in the terminal, with numbered headings. Nothing is spoken aloud
and you do not type caller questions into this window. Scroll back to **1. Meet Ava**,
enlarge the text with Ctrl+mouse wheel if needed, then read caller cues from DEMO-SCRIPT.md
and show the matching result. All scenes run automatically with fresh temporary mock data.
The scripted local approval is an illustration, not a button the presenter must find.

## What PASS looks like

The final line says `PASS: offline rehearsal complete. No provider call or charge.`
Look for six services, two add-ons, a $225 deep three-bedroom estimate, an explicitly
approved mock booking, a rejected expired second proposal, and a retained summary.
A traceback, STOP, missing section, or missing PASS blocks this presentation.
If the command is not found: check the folder and pasted command once. If the Python
file is missing, stop and request setup help; do not install random substitutes.
After two focused failures on the same blocker, stop and record the visible error.

## Demo talk track cues

Follow the numbered headings: greeting → services → deep scope → standard comparison →
unknown service → FAQ → interruption explanation → estimate → mock availability and
approval → stale second proposal → local sales/human follow-up → transcript and outcome.
Spend most of the time on the value: answers, a useful estimate, and context for the owner.
The expired example is a second proposal; the first confirmed mock appointment remains.
The transcript excerpt is synthetic tool-walkthrough text, not a recorded conversation.

## Optional nonbillable callback readiness

This networked check is separate from the offline presentation. It refreshes the
existing temporary Retell agent configuration and tunnel URLs but creates no call:

```powershell
.cache\voice-env\Scripts\python.exe scripts/voice-demo/demo_operator.py --cloudflared .cache/retell-acceptance/cloudflared.exe
```

PASS says `signed callback, tool URLs, agent identity and catalog configuration verified`.
It then shuts down its tunnel/runtime. Saved tunnel URLs are inactive after exit.
A PASS proves readiness at that moment; it does not authorize a paid call.

## Launch browser call — future authorized voice session only

Today: do not launch a browser call. Use the offline command above.
A future voice session requires explicit budget approval and an audited new allowance.
Never delete or reset `.cache/retell-acceptance/demo-creation-attempt.json`.
With that future allowance, add `--serve` to the readiness command. After PASS,
the browser page is `http://127.0.0.1:8767/`; use Start once. The current page has
no local approval control, so confirmed booking is shown offline. Provider cap is
120 seconds; browser stop is 115 seconds. Do not try to fit the whole presentation in it.

## Short troubleshooting decisions

- **Mic permission fails?** Allow microphone for the loopback page, select the correct
  Windows/browser input, and check mute using the local device meter. Still failing?
  Switch to offline; do not create repeat paid calls to troubleshoot.
- **Tunnel/tool URL fails?** Stop the owned runtime with Ctrl+C. Run readiness once
  for a fresh URL. Still failing after two focused attempts? Stop live preparation
  and show the offline presentation. Never reuse a URL from an old report.
- **Retell unavailable?** Use offline and call it a tool walkthrough. It does not
  demonstrate live voice latency or interruption.
- **Missing secret or changed agent?** Stop live preparation. Ask for private setup
  help; never paste `.env`, tokens, setup.json, or private provider responses.
- **Review expired?** No new booking was confirmed. Ask whether a fresh proposal is
  wanted, recheck availability, then obtain fresh local approval. Do not auto-reoffer.

## Stop cleanly

Offline: the command ends itself and removes temporary output. Close the terminal
when finished. If interrupted, Ctrl+C stops it; rerun only if needed for the presentation.
Future authorized voice: click End, then Ctrl+C in the operator terminal. Wait for
cleanup before closing it. Only owned processes should be stopped.

## Check cost and balance

Offline costs $0. Before any future authorized voice call, privately open the Retell
account billing/balance view and record current balance, displayed all-in rate,
auto-recharge state, and approved call ceiling. If any is unclear, do not call.
Afterward reconcile actual provider usage/cost; a historical balance is not evidence.
Retell/OpenAI credentials stay private; current balance was not checked for this offline work.

## When NOT to demo

Do not present if offline PASS is missing, private information is visible, or the
owner expects a real booking/contact. Do not demo live if readiness fails, allowance
is consumed, cost is unverified, or no explicit spend approval exists.

## Human rehearsal record

User confirmed the opening is clear and asked for help starting/showing the demo.
The explicit folder, terminal, command and scroll instructions above address that feedback.
Update 2026-09-28: user reports successful completion ending in the offline PASS marker; human offline rehearsal accepted. Elapsed presentation time was not measured.
