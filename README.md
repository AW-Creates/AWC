# A. Wilcher Creatives

Canonical React/Vite agency website. Start with [PROJECT_STATE.md](PROJECT_STATE.md)
for the current milestone, locked decisions and exact next action.

## Local development

Use Node.js 24 (`.nvmrc`). The existing native SQLite dependency does not support
Node 26; the website itself is a client-side preview.

```sh
npm ci
npm run dev
```

The website and scripted Quote Agent demo need no API key. The audit and inquiry
forms are presentational; no backend, live quote calculation or voice agent is
included. Never place a production secret in a client-side bundle.

## Validation

```sh
npm run lint
npm run build
```

`lint` currently runs TypeScript (`tsc --noEmit`); there is no separate ESLint
configuration. See [baseline closeout](docs/BASELINE_CLOSEOUT.md) for browser QA
results, screenshots, limitations and the approved desktop preservation check.

## Workflow

This project follows [workspace workflow v3.2](docs/workflow/WORKFLOW-v3.2-README.md),
including Content Capture, Context Budget and the Open-Source-First / Build-vs-Buy
Gate. The canonical cross-project guidance remains in `../_venture-ops`; versioned
copies in `docs/workflow` preserve the guidance used for this milestone.

Original AI Studio reference: https://ai.studio/apps/e9dc82f7-21e1-4531-8a5c-9d7e5894e7c3
