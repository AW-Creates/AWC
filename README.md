> **Canonical identity:** A. Wilcher Creatives designs and builds modern business systems and digital teams. Start with [positioning](docs/brand/AWC-POSITIONING.md), [client explainer](docs/sales/AWC-CLIENT-EXPLAINER.md) and [PROJECT_STATE.md](PROJECT_STATE.md). Crew is the custom Digital Workforce layer; Autumn is one demo specialist.

# A. Wilcher Creatives

Canonical red/pink standalone AWC site recovered from the approved source. The active `index.html` is byte-identical to the preserved recovery copy; the prior gold React/Vite runtime remains available in Git history at the pre-migration checkpoint `awc-gold-pre-red-migration-2026-09-24`.

## Local owner workbench

Run `node owner-ops/server.mjs` and open http://127.0.0.1:4186/ . See [operating guide](owner-ops/README.md) and [validated foundation closeout](docs/owner-ops/CLOSEOUT.md). Local fictional concepts and handoff drafts; remote authenticated delivery remains deferred.

## Local preview

Use Node.js 24 (`.nvmrc`). No dependencies, install step, or build step is required.

```sh
node scripts/serve.cjs
```

You can also use `npm run dev`. Open http://127.0.0.1:4173/ . The server binds only to loopback and serves only `/` and `/index.html`; `/favicon.ico` returns 204 and other paths return 404.

The page loads Fraunces and Inter from Google Fonts when network access is available. Forms are presentational only; no production form delivery or backend is configured.

## Provenance

- Recovered source: `C:/Users/A-Problem/.codex/.chatgpt-projects/g-p-6aa9d58c27a0819196657334985b77fe/index.html`
- Preservation copy: `C:/Users/A-Problem/Documents/Web Development/AW-Creates-Ventures/_recovery/AWC-red-approved-recovered/index.html`
- Verified SHA-256: `941f908cfefcfe2d1a9e47a15af44210ed2ce247fb7b68d56e617d3ed3bb46a3`
- Migration record: [docs/RED_SOURCE_MIGRATION.md](docs/RED_SOURCE_MIGRATION.md)

The recovered source and preservation copy remain untouched outside this repository. The unavailable historical approved recording means exact recording equivalence remains unverified.
