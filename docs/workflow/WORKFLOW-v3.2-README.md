# Milestone-Driven Build Workflow v3.2

Workspace guidance based on the installed v3 skill, with a Content Capture
extension and explicit Context Budget practices. This document does not claim
that the installed global skill has been upgraded; no global files were changed.

## Working loop
Define → scope → plan → build → test → inspect → correct → validate → deliver
→ commit → update state → start a fresh task.

Each milestone needs an observable goal, acceptance criteria, a tangible
deliverable, and validation. A plan alone is not a finished product milestone.
Do not restart completed work. Do not build several future milestones before
validating the current one.

## Start and adopt
Read PROJECT_STATE.md, check Git status and recent relevant commits, identify
the active milestone, and load only relevant files. If the file is missing,
start from shared/PROJECT_STATE.template.md after auditing current behavior.
If it exists, merge missing information rather than overwriting it. Record
unknowns honestly. Keep approved design and architecture decisions explicit.

## Roles
The root agent is Director. Handle tiny tasks directly. For ordinary feature
work use Architect → compact implementation brief → bounded Builder work →
Director validation when delegation saves work. For risky or ambiguous work,
the Director decides the approach before implementation. The brief includes
goal, relevant files, required change, constraints, validation, and open risks.
Do not have multiple agents independently rediscover the same repository.

## Content Capture
Before visual work, the Director identifies a useful before-state, result, and
story beat in CONTENT_PIPELINE.md. Capture at baseline, meaningful visible
changes, a reproducible fix, and final validated demo. Prefer short deliberate
clips over recording every minute. Capture the before-state before changing it.

Use available recording tools directly when supported and authorized. Confirm
the tool can actually record and save video; screenshots are not a recording.
If recording is unavailable, state that limitation before the moment is lost,
provide a precise short shot list, and request manual recording only if needed.
Do not silently claim footage exists. Capture screenshots as useful separate
evidence, then log the missing video or recreate a clearly labeled demo later.

Use demo accounts and synthetic data. Hide keys, customer information, private
tabs, and notifications. For any real call, establish necessary recording
permission first. Log project, milestone, commit, purpose, saved path, duration,
and timecodes. Play back the saved file, inspect readability and audio, and
mark its actual status. The user retains control over publication.

### Verified recording path (2026-09-23)
Use Playwright browser-context video as the automatic primary method. Agent-browser
0.38.1 recording hit its 16-frame/500 ms backlog guards at 30 fps across codecs,
resolution and headed/headless mode. Five fps worked in isolated tests but is a
limited workaround, not the automatic default.

From the AWC repository, run `scripts/content-capture/record-context.cjs --url
<local-url> --out <absolute-external-media-directory>` with Node, then run
`scripts/content-capture/verify-playback.cjs <absolute-video> <absolute-evidence-directory>`.
The [capture repair guide](../AWC/docs/CONTENT_CAPTURE_REPAIR.md) contains exact
PowerShell commands, pinned cached runtime/browser paths, recovery setup, test
matrix and evidence. When reading the AWC versioned snapshot, use
`AWC/docs/CONTENT_CAPTURE_REPAIR.md` in the repository.

Configuration: headless Chromium, viewport/video 1280x720, `recordVideo` enabled
before opening the page; await context close before saving. Store raw video outside
Git. The capture script verifies file presence/size only; the verifier requires a
full decode, metadata, advancing browser playback, and screenshot evidence. Review
start/middle/end images before marking the log verified. Tested output is silent.

If Playwright fails, retain the exact error, check its browser/encoder installation,
permissions and flush ordering, then retry an isolated fixture once after a concrete
fix. Only if Playwright cannot provide stable video proceed to independent FFmpeg
capture, then desktop/manual capture. Those lower fallbacks remain unverified.
Stop retrying agent-browser on backlog; partial/nonzero files are not proof of success.
Capture a clearly labeled later demo if the original moment was missed. Future
milestones execute this workflow when appropriate; no background recorder is installed.

## Context Budget
Context capacity and account usage limits are different resources. Neither is
unlimited and neither can be guaranteed by this workflow.

- Keep one milestone and a small relevant file set in a task.
- Use targeted searches, compact diffs, and state files instead of rereading
  transcripts, dependency trees, build output, and unrelated repositories.
- Use the RTK integration when available; retrieve raw evidence when compressed
  output is insufficient. Headroom is optional for long or repetitive sessions.
- Delegate bounded work with concise briefs. Preserve reasoning quality,
  required tests, visual QA, security checks, and user acceptance.
- Check actual usage when available at substantial session boundaries. Record
  unavailable readings as unknown; do not invent percentages or reset times.
- When context is high or the next unit is too large, make a safe checkpoint,
  record unresolved work and the exact next action, and continue in a fresh task.
- Record validated commit, test results, blockers, and important decisions in
  PROJECT_STATE.md. Keep large logs and raw media outside that compact file.

No background usage monitor, delayed migration, or scheduled wakeup is enabled
by these files. Such automation needs an actual configured task.

## Open-Source-First / Build-vs-Buy Gate

Before adopting any paid SaaS, API platform, hosted AI service, commercial
framework, or recurring paid dependency, investigate credible open-source,
GitHub, and self-hostable alternatives. Do not assume self-hosting is free or
that a hosted provider is the best fit. Preserve existing approved decisions
unless evidence justifies revisiting them.

Record a short comparison in the project's decision notes, covering:
- License, commercial-use permissions, obligations, and compatibility.
- Maintenance/activity, releases, issue responsiveness, and security posture.
- Feature parity against the actual milestone requirements.
- Integration and ongoing operations effort.
- Compute, memory, storage, hardware, and hosting requirements.
- Latency and reliability at representative workloads.
- Switching cost, data portability, lock-in, and migration path.
- Privacy, data retention, deployment control, and access boundaries.
- Projected total cost at expected usage: provider fees, hosting/compute,
  operations, support, egress, and sensitivity to growth.

For a material dependency (meaningful recurring cost, critical-path capability,
sensitive data, or difficult replacement), require a short reproducible benchmark
or documented rationale before locking in a paid provider. State expected usage,
assumptions, dated sources, candidates considered, measured results or why a
benchmark is not useful, tradeoffs, decision owner, and a revisit trigger.
Use shared/BUILD_VS_BUY.template.md. A paid provider can be the right choice;
the decision must be supported by evidence. This gate does not authorize spending.

## Validation and closeout
Run relevant tests and inspect real behavior; for visible changes perform
visual QA and address user feedback. Resolve blocking defects before expansion.
Review the working tree, commit only intended validated work, then record the
implementation commit and validation evidence in PROJECT_STATE.md and commit
that state update. Do not try to store a commit's own hash inside itself.
Update portfolio pointers, deliver the result, and write one concrete next
action. Prefer a fresh task for the next milestone.

## Canonical Source Verification Gate
Before replacing or migrating a visually approved build, identify exact source path, Git status/commit or file hashes, distinctive content and rendered desktop/mobile/theme evidence. Folder names, timestamps and deployment aliases alone do not prove approval. Compare with approved recording when available; record any missing comparison explicitly. Preserve the existing canonical history and any volatile recovered source before migration. When source identity is unresolved, stop replacement and perform source recovery; do not silently reconstruct. Recovery and migration should be separate milestones.

## Progress / Cost Gate (mandatory for all current and future ventures)
The Director must pause or close a milestone when ANY trigger occurs:

- The same blocker survives two focused attempts.
- A component is materially outside an explicit acceptance target and further tuning is unlikely to close the gap.
- The same milestone hits a Work/Codex usage cap twice.
- Two consecutive substantial Work runs produce no material validated or user-visible progress.
- Experimentation cost or usage is growing faster than evidence gained.
- A cheaper or faster benchmark can answer the core question sooner.

A single final attempt is allowed only when the Director first records a high-confidence reason, the changed condition, a bounded time/usage budget, the expected decisive evidence, and a hard stopping condition. A reset alone is not a changed condition. Do not chain exceptions.

When triggered, the Director must:

1. Stop broad implementation and research.
2. Summarize evidence already gathered without rerunning settled benchmarks.
3. Identify the single dominant blocker.
4. Choose one action: close as failed, switch architecture/provider, narrow the experiment, or request the minimum user action/credential.
5. Update PROJECT_STATE.md with the decision, preserved evidence, attempts/cap hits (unknown if unavailable), and exact next action so a fresh task cannot repeat prior work.
6. Explicitly record the token/credit-efficiency rationale.

Token-limit resets are NOT automatic authorization or a reason to resume the same approach. First reassess whether the milestone remains the highest-value path. Evaluate this gate at startup, after focused attempts, and before substantial continuation. This policy supplements and preserves every existing workflow gate; it does not authorize spending or waive tests, safety, visual QA, or human acceptance.