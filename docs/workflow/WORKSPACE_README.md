# AW-Creates Ventures

A local home for independent projects and shared business planning.
Prepared September 22, 2026. This package contains planning files and setup tools;
project source code is downloaded when you run the clone script.

## Start here on Windows

1. Extract the ZIP. Place its single **AW-Creates-Ventures** folder in
   **Documents\Web Development**. Avoid creating a second folder with the same name inside it.
2. Open that folder in File Explorer and choose **Open Git Bash here**.
   Git for Windows must be installed. Private repositories require GitHub access;
   complete the Git credential sign-in if prompted. Never paste credentials into the script.
3. Preview, then clone:

```bash
bash setup-repos.sh --dry-run
bash setup-repos.sh
```

Alternatively, open Git Bash and run (adjust the path if Documents uses OneDrive):

```bash
cd "$HOME/Documents/Web Development/AW-Creates-Ventures"
bash setup-repos.sh --dry-run
bash setup-repos.sh
```

The script locates its own folder, so spaces in paths are supported. It clones
the default branch with normal Git history. It never initializes the parent as
a repository, adds submodules, pulls existing clones, or changes existing files.
Existing matching repositories are skipped. Conflicting folders are reported
and left untouched. A failure produces a nonzero exit code; successful clones
remain usable. Correct the reported issue and rerun.

## Layout after cloning

```text
AW-Creates-Ventures/             <- no .git here
  README.md
  setup-repos.sh
  repos.tsv
  AWC/.git/
  ship-broke/.git/
  unprovided/.git/
  the-master-manipulator/.git/
  alter-app/.git/
  blown/.git/
  _venture-ops/
    PORTFOLIO_STATE.md
    REVENUE_SCOREBOARD.md
    PROJECT_PRIORITY.md
    CONTENT_PIPELINE.md
    EXPERIMENT_LOG.md
    WORKFLOW-v3.2-README.md
    shared/PROJECT_STATE.template.md
    shared/CAPTURE_BRIEF.template.md
```

Project directories are created by Git, not filled with placeholder files.
Repository mappings in `repos.tsv` were verified against the connected GitHub
account. AWC uses **AW-Creates/AWC**, not the older AWCreatives repository.
The Self Made Lifestyle is tracked in the content pipeline; no repository URL
has been established for it. Asynk and UNWITNESSED are outside this starter's
six-repository scope; add them only after identifying the intended repository.

## Existing work on your computer

Keep your current folders until each new clone has been compared with the
corresponding old checkout. Cloning retrieves pushed Git history; it does not
carry over uncommitted edits, unpushed commits, local branches, .env files,
dependencies, or ignored assets. Existing temporary AWC folders are not moved.
Review `git status --short` and `git log --oneline -5` inside each old checkout
before choosing how to preserve local work. Install each project's dependencies
using its own README after cloning.

## Git boundaries

Run commits from inside the intended project folder. Never run `git init` in
AW-Creates-Ventures or its Web Development parent. The script refuses to operate
inside an existing ancestor repository. `_venture-ops` may later be versioned
as its own private repository; that is optional and is not done by setup.
Keep the shared planning files backed up until then.

For a manual alternative, from this parent folder with the destinations absent:

```bash
git clone https://github.com/AW-Creates/AWC.git AWC
git clone https://github.com/AW-Creates/ship-broke.git ship-broke
git clone https://github.com/AW-Creates/unprovided.git unprovided
git clone https://github.com/AW-Creates/the-master-manipulator.git the-master-manipulator
git clone https://github.com/AW-Creates/alter-app.git alter-app
git clone https://github.com/AW-Creates/blown.git blown
```

## First working session

Read `_venture-ops/PORTFOLIO_STATE.md` and the workflow README. Open **AWC** as
the project for the next Codex task. Inspect its current state before creating
or merging PROJECT_STATE.md from the template. Preserve approved desktop design.
This package does not migrate source repositories, update the installed global
skill, schedule monitoring, or activate screen recording.
