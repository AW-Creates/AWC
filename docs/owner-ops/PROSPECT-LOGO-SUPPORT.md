# Prospect Logo Support — Local Foundation

2026-10-09. Owner workbench supports local approved PNG logo upload, display changes and removal. No external URL fetching or uploaded SVG. PNG uploads are limited to 256 KB raw, 2048 × 2048 pixels, non-interlaced supported PNG color depths. Server validates canonical base64, PNG signature/IHDR, chunk integrity, raster dimensions and bounded decompression. Upload JSON limit is 360,000 bytes; other owner actions retain their smaller limit.

Logo mode is **mark + business name** or **wordmark**. A wordmark renders one accessible image name and suppresses duplicate visible business text. Marks render decorative image plus visible business name. Without a configured logo, header and footer show the business name. Aspect ratio is preserved using contain sizing; light, dark and transparent surfaces provide owner-controlled contrast without recoloring artwork. New uploads default to a light plate. No separate light/dark asset files are implemented.

PNG files are stored in ignored `owner-ops/.local/logos` (or the configured local data directory). Asset paths are scoped by validated prospect UUID and SHA-256 hash. Only a prospect's currently configured upload hash can be fetched through `/api/prospects/{id}/logo/{hash}`; other prospect IDs, old hashes and alternate prefixes fail. Responses use image/png and nosniff. Mutations require the existing same-origin owner-action guard and current revision. Brand changes invalidate review and generated-demo hash; re-review and regeneration are required. Removing or replacing an upload deletes its previous local file. Do not publish these unauthenticated local endpoints remotely.

An original trusted `cedar-lane-mark.svg` monogram is an allowlisted application asset only, used by newly seeded fictional Cedar Lane fixtures. Existing persisted fixtures can be configured through the owner API with:

```json
{"expectedRevision": CURRENT_REVISION, "branding": {"mode":"mark", "surface":"transparent", "logo":{"kind":"builtin","asset":"cedar-lane-mark"}}}
```

PATCH the prospect, then confirm review and regenerate. The trusted built-in mark is allowed only for fictional fixtures. Imported/older prospects without branding still render using their business name.

Validation: 13 Node tests pass including PNG limits, integrity, executable-format rejection, branding hash, fallback/wordmark semantics, owner guards, stale generation, asset isolation and removal. `node owner-ops/scripts/logo-qa.cjs` passes actual workbench file upload/display/remove at 1440px and 390px with zero browser errors; verifies header/footer, light/dark surfaces, no duplicate wordmark name, fallback and no overflow. Screenshots and report: `docs/qa/prospect-logo/`. The synthetic solid PNG is a test fixture, not a proposed client logo. Original fictional mark screenshot shows the intended Cedar Lane header.

No provider requests, voice enabling, external logo fetching or new dependencies.
