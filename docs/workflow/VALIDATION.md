# Starter validation

Prepared: 2026-09-22.

Passed static/package checks:
- All six repository mappings match the connected GitHub account inventory.
- All five requested portfolio files, workflow README, setup script, and
  project-state/capture templates are present.
- UTF-8 files and LF script line endings; no embedded credentials or personal
  machine paths; no .git directory or source repository contents in the ZIP.
- Script reviewed for quoted paths, destination checks, ancestor Git guard,
  dry-run behavior, manifest validation, and nonzero failure reporting.
- ZIP entries verified against original file bytes and single parent folder.

Runtime limitation: both installed Git Bash executables failed to start in this
restricted environment with Windows access-denied errors. Bash syntax execution,
dry-run execution, and actual cloning therefore could not be validated here.
The setup script has been statically reviewed, not runtime-tested. GitHub
authentication and network cloning must be checked on the destination computer.
Run the documented --dry-run first. The explicit manual clone commands remain
available in README.md.

No existing projects were moved, updated, committed, or migrated. No parent
repository was initialized. Next action: extract and preview setup, then clone
and inspect AWC's current state for its workflow-adoption milestone.

## AWC v3.2 migration and baseline closeout - 2026-09-23
The dated starter observations above are historical. AWC source has now been
stabilized in its canonical repository. Production build and TypeScript lint pass;
14 Chromium theme/width combinations, 19 interaction checks and explicit normal /
reduced-motion canvas checks pass. No overflow or hidden headings were detected.
See AWC/docs/BASELINE_CLOSEOUT.md and AWC/PROJECT_STATE.md for the validated commit,
capture limitations and production-readiness gaps. Older folders remain preserved.