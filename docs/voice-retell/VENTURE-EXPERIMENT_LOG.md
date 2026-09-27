# Experiment log

Updated: 2026-09-22. No experiment launched by this starter.

| ID | Hypothesis | Audience / offer | Test | Budget cap | Success / stop rule | Evidence | Decision |
|---|---|---|---|---|---|---|---|
| E001 | Owners will request a follow-up after trying a relevant receptionist demo | Target segment TBD | Scoped demo after website baseline | Not authorized | Define before launch | None | Backlog |

For each experiment record owner, dates, baseline, one primary metric, sample
size, costs, result, and the next decision. Define the success threshold and
stop condition before spending or contacting prospects. Log failed experiments
as well as successes. Keep leads anonymized and link private evidence.

E002 | 2026-09-24 | BrightHome synthetic receptionist architecture bake-off | No outreach; zero API spend | Local browser POC validated, realtime latency gate not passed | AWC/docs/voice-bakeoff/BENCHMARK.md | Pipecat local experiment; next Realtime Voice Acceptance; STOP.

E003 | 2026-09-26 | Realtime Voice Acceptance | Director + narrow read-only Validator; fictional local inputs, no outreach/API spend | 19/19 browser checks and 28/28 regression tests pass; normal rendered-audio 9.780s, replacement 7.426s fail targets | AWC/docs/voice-realtime/ACCEPTANCE.md; browser-closeout.json | CLOSED FAILED / NOT DEMO-READY; CPU TTS primary bottleneck; physical-mic continuity/STT unresolved; managed billing blocked; matched transport unproven; next narrow managed-control acceptance only in fresh authorized task; STOP.

E004 | 2026-09-26 | Managed Realtime Voice Control Preparation + Progress/Cost Gate | Reused architecture/builder checkpoint; no new agents or research | Zero spend; no provider calls | 12 adapter + 9 business/safety tests PASS; stale read and env-loading defects fixed | AWC/docs/voice-retell/PREPARATION.md | CLOSED preparation; STOP at Retell account/key gate. Next: AWC — Retell Managed Realtime Voice Acceptance; <=3 sessions x 120s, $3 initial / $5 hard cap; human listening required.
