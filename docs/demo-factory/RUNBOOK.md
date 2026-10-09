# Prospect Demo Factory — local operator runbook

Run from the canonical AWC repository with the existing Node 24+ installation. No install, secrets, phone setup or file copying is required.

```powershell
node owner-ops/scripts/generate-demo.mjs --proofs
node owner-ops/server.mjs
```

The generator validates the whole batch, selects each configured direction, creates reviewed Crew-bound HTML in ignored `owner-ops/.local/demos`, saves the shared SQLite records and prints an operator summary. The persisted summary is `owner-ops/.local/factory-summary.json`. Use the server's printed loopback origin plus the route in the summary. Restart the server after renderer changes. Existing owner workspaces and channel files remain in place; stable proof IDs are distinct from earlier random fixture IDs.

For a prospect, prepare a JSON config outside Git using `owner-ops/prospect-demo.schema.json` and a proof as the structure reference. Assign a new UUID and `demo_UUID` analytics namespace. Capture only public information manually, write original factual summaries, bind every approved fact to its captured source, choose business-specific identity/role/permissions/brand and one direction, and review uncertain items. Read PROVENANCE.md before marking `operator_review.confirmed` true. Fictional `.example` sources are proof specifications, never evidence for a real company. Never copy website layouts or paragraphs.

```powershell
node owner-ops/scripts/generate-demo.mjs --config owner-ops/.local/prospects/example.json
node owner-ops/scripts/factory-browser-qa.cjs
node --test owner-ops/tests/*.test.mjs
```

Generation fails before persistence on invalid schema, unreviewed or source-unbound approved claims, unknown assets/themes, secrets, expired config, namespace mismatch or excessive permissions. Uncertain/unsupported facts are omitted and named in the summary for operator review. The browser runner verifies the synthetic proof batch; a new real prospect still needs its own visual and factual review. Preflight marks `visualReviewRequired:true`; a technical pass never substitutes for operator judgment.

Proof routes end `0001` (Cedar Lane/Ellis/editorial), `0002` (Forma House/Nora/architectural), `0003` (Maren Vale/Avery/personal). Full routes are in CLOSEOUT.md. All expire October 30, 2026 at 7:59 p.m. America/New_York (23:59 UTC). Ordinary configs require future expiry within 31 days. Rotate expiry only after renewed review.

Each proof allows 10 lifetime sessions, 20 chat requests per session and 600 seconds per session. HttpOnly SameSite cookies are scoped by demo name; the database pins token, demo, revision, expiry and usage. Restart, reload, new browser, changed revision and regeneration do not clear stored counters. Once exhausted, operator review is required; do not reset quotas merely to keep a demo running. Paid budget and paid sessions are both zero. Talk Here and Call Me remain visible, truthfully unavailable; Chat uses prepared replies. Scheduling and human requests are local drafts. Real booking/payment configuration is rejected in this milestone; enabling it requires a separately reviewed integration.

Revoke immediately:

```powershell
node owner-ops/scripts/generate-demo.mjs --revoke 11000000-0000-4000-8000-000000000001
```

Revoked/expired routes and chats return 410. Re-generation with an active reviewed config is an explicit operator action; it preserves lifetime counters. `--data-dir` accepts only the ignored `.local` directory/descendants or a child of the OS temporary directory. Use the matching `OWNER_OPS_DATA_DIR` when starting a server with a custom data directory.

Privacy boundary: server binds 127.0.0.1, rejects other Host/origin requests, sends CSP/no-store/noindex/nofollow/noarchive and robots disallow. Noindex is an indexing directive; privacy here comes from loopback-only access. Do not tunnel or publish this workbench. Remote delivery requires authenticated private hosting, authorization and a separate access/indexing audit. Local users/processes can reach this workbench; it is not a multi-user secured portal. Analytics remain bounded categorical page-memory events, with no external transport, message text or contact details.

Original concept images are selected from the explicitly declared local asset library. A real prospect's distinctive licensed photos/logo and reviewed team story remain manual operator work; no sales ranks, awards, listing inventory, license claims or testimonial is inferred. Legacy demos retain their accepted modern residential direction; hashes expanded this milestone, so restart/review/regenerate an older cached concept before showing it again.
