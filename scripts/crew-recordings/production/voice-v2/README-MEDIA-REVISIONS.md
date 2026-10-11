# Additive v2 media publication support

No public revision is selected automatically. Existing legacy keys and routes remain available. `ROLE-v2.mp4` and `.vtt` are additionally allowlisted for all seven specialists, including retention; the existing overview stays legacy.

After final media listening/caption/claim/privacy/playback review and a separately authorized deployment/upload, the non-secret server environment value `CREW_MEDIA_REVISIONS` can select explicit reviewed revisions:

```json
{"status":"reviewed","reviewed_by":"Actual media reviewer","reviewed_at":"2026-10-11T04:00:00Z","roles":{"sales":"v2","retention":"v2"}}
```

This is an example, not an applied setting. Empty, malformed or unreviewed values leave legacy selection active. Only the seven known specialist roles and revision `v2` are accepted. Even a selected revision requires both nonempty R2 video/caption objects; while either is absent, a complete legacy pair remains selected. A role with neither complete pair stays unavailable. `/api/crew-recordings` returns selected allowlisted `videoUrl` and `captionUrl` values. The browser uses these exact same-origin pairs, never arbitrary remote URLs, and hides Sage's pending message only after its valid pair becomes ready. Recorded playback still starts no provider call.

The uploader now defaults closed. It will not replay the historical six-role batch from an implicit config. Hidden-stdin JSON must declare an explicit `mode` (`v2` or deliberate `legacy`) plus `publication_reviewed:true`, `reviewed_by`, and `reviewed_at`. V2 additionally requires `directory`, a `manifest` path inside that directory, and its reviewed `manifest_sha256`. The manifest is the private finalizer's `media-manifest.json`; video/caption filename, actual file hashes, complete decode, meaningful role example, duration and nonoverlapping captions are verified for the entire batch before any upload. Seven roles are supported; no fabricated overview or missing-role placeholder is uploaded.

Temporary token/expiry setup, deployment and upload are separate authorized operations. The fixed hosted upload URL, hidden token handling, request timeouts, no retries, unchanged-file idempotency, collision rejection and immutable caches remain. Remove hosted upload secrets immediately after the authorized batch; verify HTTP403, hosted hashes/ranges and actual desktop/mobile playback. Selection must follow acceptance; changing this setting does not constitute acceptance itself. No runtime setting, secret, upload or deployment is changed by this local implementation.

Offline/synthetic checks from repository root:

```powershell
node --test website-receptionist/tests/crew-media.test.mjs
node --test scripts/crew-recordings/upload-media.test.cjs
node --test scripts/crew-recordings/production/voice-v2/media-playback.test.cjs
```

The browser check executes the actual recording controller against intercepted local readiness fixtures. It verifies selected URLs, invalid-pair gating, pending-state visibility, no autoplay, close/source cleanup and restored focus. It uses zero actual network/provider/microphone operations and is distinct from required hosted-media playback acceptance.
