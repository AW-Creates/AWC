# First pilot acceptance plan

Plan only: no live acceptance performed in this milestone. AWC owns execution/evidence; client owns factual truth and acceptance. Use synthetic callers before launch, restricted/redacted evidence during pilot, config version and timestamps on every result.

## Pre-launch release suite
Run offline/adapter checks first, then end-to-end calls only under separately authorized budget. Each row must pass; proposed minimum coverage below is not a claim of existing test coverage.

| ID | Test / minimum cases | Required result |
|---|---|---|
| A01 | Greeting, identity, AI notice / 2 | Exact approved business/agent and disclosure; no fictional assertions |
| A02 | All configured FAQ answers plus one unknown / >=20 | Approved facts correct; unknown safely deferred |
| A03 | Every service/alias and 3 unsupported requests | Correct explanation; no invented offering |
| A04 | Every quote rule: normal, min, max, invalid/missing, fee/add-on and rounding boundaries | 100% approved expected totals; excluded or uncertain inputs deferred |
| A05 | Book, conflict, duplicate/replayed confirmation, caller-only approval / >=4 | Only authenticated human approval writes once to authoritative calendar; no unauthorized/duplicate booking |
| A06 | Expired proposal, changed request and slot lost before commit / >=3 | Reject stale approval, recheck, obtain fresh authorization |
| A07 | Primary receipt, primary failure, backup failure / 3 | Context delivered; fallback activated when delivery fails; never falsely claim a handoff succeeded |
| A08 | Open/closed/holiday/timezone boundary / >=4 | Correct availability and callback expectation |
| A09 | Interrupt during answer and proposal / 2 | Prior speech stops; changed request handled; no stale action |
| A10 | Transcript/summary, restricted access and deletion / >=3 | Correct outcome and next action; approved data only; deletion verified under policy |
| A11 | Public callback valid/invalid signature, restart and expired URL / >=4 | Healthy signed path only; reject invalid request and fail safely |
| A12 | Host/provider/calendar outage, notification failure, spend cutoff / >=5 | Human/voicemail fallback and alert proven; no invented availability or silent loss |

Request-only re-scope: A05/A06 instead require zero calendar writes, explicit request-not-confirmation wording and successful delivered request; all other safety gates remain. Record this change in signed offer before testing. Test coverage cannot be waived for privacy, security, false prices or unauthorized actions. Any failure blocks launch, fix then rerun affected tests; after two unsuccessful focused attempts apply Progress / Cost Gate and stop/re-scope.

Client signs approved facts, test results and live budget. AWC signs deployment readiness and rollback. Numeric latency and cost ceilings must be filled before calls; no arbitrary promised latency inferred from prior acceptance.

## In-pilot measurement (reviews day 3, 7, 14)
Review all calls when volume permits; for this bounded pilot plan daily review of every call. Respect approved retention/consent; if call evidence cannot be retained, use approved outcome metadata and mark unverifiable answers unknown, not correct. Report raw counts/denominators with percentages, excluded calls separately; no denominator means N/A, never 100%.

| Metric | Definition | Proposed acceptance threshold / action |
|---|---|---|
| FAQ correctness | Correct approved answers / audited configured-FAQ opportunities | >=95%; unknown responses tracked separately; materially false policy/claim pauses affected behavior |
| Quote accuracy | Exact approved totals / audited quote opportunities | 100%; zero wrong prices, pause quoting on first failure |
| Booking safety/accuracy | Correct authorized writes / all writes; audit requests against calendar | 100%; zero unauthorized/duplicate bookings; pause booking on first failure |
| Handoff delivery | Verified primary or backup deliveries within agreed target / required handoffs | 100%; failure activates fallback and incident review |
| Call completion / error | Calls with recorded supported outcome or safe handoff / eligible connected calls; system errors / same denominator | >=95% completion, <=5% system errors; dropped calls count as failures; report caller hangups and spam separately by stated rule |
| Latency | Median and mean provider response latency in ms; also p95 if enough samples | Client/AWC set numeric ceiling before launch; use provider metric definition, do not mix tool time with voice latency; unavailable = unmeasured |
| Cost | Actual provider cost / billed minutes; cash total across services, minute use and remaining reserve | Within signed per-call and total ceilings; cutoff/fallback at reserved stop threshold |
| Owner usefulness | Day 7 and 14 score 1–5 plus reasons and time spent correcting | Proposed >=4 at day 14 and explicit continue/change/stop decision; no revenue attribution claim |

Scope success requires all safety thresholds, agreed quality targets, within budget and owner acceptance. Fewer than 20 eligible calls or missing evidence yields INCONCLUSIVE for usefulness/performance, even if pre-launch tests passed. Any PII/security exposure, unauthorized action or broken fallback pauses affected AI routing immediately; notify owner, preserve minimal evidence, fix and revalidate before resuming. At day 14 stop routing unless a separately approved continuation exists.
