# Pilot cost and commercial structure

Internal planning estimates in USD; no public price selected or spend authorized.

## Historical evidence and limits
Saved CALL-EVIDENCE.json session 1: $0.207653368 / (103.602 seconds / 60) = approximately $0.12026/minute; billed duration is 104 seconds. Session 2: $0.225620038 / (113.802 / 60) = approximately $0.11895/minute. DEMO-EVIDENCE.json reports the same second call ID/cost with 113.201 seconds, giving $0.11959/minute: this is overlapping evidence, not a third independent call. Duration snapshots differ; reconcile provider billing before a live budget. These short browser sessions support an observed range near $0.119–$0.1203/minute, not a guaranteed PSTN rate.

Prior PREPARATION.md modeled <=$0.50/minute as a test ceiling; it was not an observed rate. Its historical website pricing range is not reused as a current quote. No new provider balance/rate lookup, call or charge occurred here.

## Voice-only scenario model
Planning allowance: $0.15–$0.25 per managed voice minute, conservatively above measured browser evidence; not an all-in production quote. Minutes below include future test minutes. Reprice if actual configuration exceeds this range.

| Scenario over 14 days | Modeled minutes | Voice subtotal | With 25% voice contingency |
|---|---:|---:|---:|
| Low: 40 calls x 3 min + 30 test min | 150 | $22.50–$37.50 | $28.13–$46.88 |
| Medium: 150 calls x 3 min + 50 test min | 500 | $75.00–$125.00 | $93.75–$156.25 |

All-in cash budget = voice + PSTN/forwarding transport (including transfer legs if later included) + number rental if needed + hosting + monitoring/storage/notification fees + applicable taxes/fees + contingency. Those nonvoice amounts are unknown until client/provider choices; do not report the table as total cost. Confirm whether any provider components are already bundled to avoid double counting. No free-credit dependency or automatic recharge assumed.

## Operator effort model
Modeled planning ranges, not measured productivity or wages: intake/data approval 2–4 h; catalog/quote setup 2–4 h; calendar/approval, hosting/routing and delivery integration 8–20 h; privacy/access configuration 1–3 h excluding external review; acceptance and owner training 3–5 h. Total setup 16–36 h, with stop/re-scope if incompatible integration exceeds the bound. Reusable infrastructure investment should be tracked separately from repeat client setup.

Recurring during 14 days: daily review 15–30 min/day = 3.5–7 h; three review meetings 0.5 h each = 1.5 h; corrections allowance 2–4 h. Total 7–12.5 h. Track actual time by category. Economic cost = cash cost + (setup hours + operating hours) x explicitly chosen internal hourly value. No wage is assumed. Incident overruns require re-estimate rather than invisible unlimited support.

## Pricing structure options
| Structure | Benefit | Risk/control |
|---|---|---|
| Free offline proof of concept | Lowest prospect friction | Keep fictional/offline; free live work hides delivery cost |
| Discounted fixed paid pilot, setup component + capped included usage | Commitment, clear scope, bounded exposure | Must validate integration effort before quoting |
| Setup fee + actual usage | Separates labor and usage | Variable invoice surprises; agreed ceiling and reporting required |
| Flat all-inclusive pilot | Simple explanation | Only viable with a minute cap, clear exclusions and overage stop |

Recommendation: discounted fixed paid 14-day pilot with a disclosed setup component and capped included minutes; no automatic overage, renewal or unlimited usage. This is an internal risk/reward recommendation, not a market-price claim. Set the actual price after intake, cash estimate and delivery effort review. Explain what discount buys: narrow scope and owner feedback, not guaranteed revenue. Any refund/cancellation terms need later commercial approval; this document is not a contract.

## Cost authorization before live work
AWC approves numeric test budget, pilot total cash cap, minute cap, per-call duration/cost ceilings, selected rate and support allowance; client approves the offer. Pick low OR medium scenario explicitly, not by default. Alerts at 50% and 80% of authorized cash/minute caps; stop new AI calls at 100% and route to owner/voicemail. Reserve room for active calls and billing lag: stop threshold must be below the nominal cap by that reserve. Reconcile daily and after tests. Verify enforcement, not just dashboard alerts. Current demo allowance stays consumed; new testing requires separate explicit authorization. No budget is activated by this design.
