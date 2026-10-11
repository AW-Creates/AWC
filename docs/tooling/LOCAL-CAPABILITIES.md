# Local REA and Topview capabilities

Verified 2026-10-11. User configuration and credentials are outside this repository.

## REA

Official stable npm package `rea-agents` 6.4.0; Node 26.8.2 and npm 11.19.1 satisfy its Node requirement (`^22.19.0 || ^24.11.0 || >=26.0.0`). The existing `.codex` reference skill alone had not registered an MCP. Reviewed `npx --yes rea-agents@latest setup --client codex --dry-run --json`, then applied `setup --client codex --yes --json`. Codex-only registration and bundled `.agents` skill installed; doctor reports healthy=true and aligned Codex registration. environment_healthy=false reflects absent optional engines, intentionally not installed.

The setup pins an absolute Node launcher and the installed package's public `scripts/rea.mjs mcp` entrypoint in the npm cache. There is no global `rea` PATH command. If cache cleanup removes it, review a fresh setup plan before repair. Verification: `npx --yes rea-agents@6.4.0 doctor --client codex --json`.

Restart/reconnect Codex to load the new MCP into an agent session; doctor does not prove session tool attachment. Local Codex registration does not establish separate ChatGPT cloud registration.

Use REA conditionally for shipped binaries/packages, Electron/JavaScript distributions, website/runtime evidence, APK/.NET/native investigations. Use normal source tools for ordinary repository work. Optional native/Android/firmware engines remain separately scoped prerequisites.

## Topview

Official endpoint: https://mcp.topview.ai/mcp. Registered enabled `topview` using Codex's supported Streamable HTTP command: `codex mcp add topview --url https://mcp.topview.ai/mcp`. OAuth discovery succeeded and Codex reported `Successfully logged in`; the existing browser session completed the flow without a pending interaction gate. Registration readback matches the endpoint and has no static bearer token/header. An anonymous initialize returns HTTP401, consistent with authentication requirements. An authenticated tool call in the reconnected agent is still to be verified.

Reauthorization: run `codex mcp login topview` from the same Windows user profile. Open the authorization link Codex returns, sign in to the intended Topview account, approve access, select an account/workspace only if requested, and let the local browser callback finish. Return to Codex, reconnect/restart and confirm tools appear. Use `codex mcp list` for registration/auth status. Never paste tokens into chat, source, or config. Do not replace this MCP with Topview's separate API-key product.

## Config backups (local, never commit)

- `C:/Users/A-Problem/.codex/config.toml.pre-capabilities-20261011-135112.backup`
- `C:/Users/A-Problem/.codex/config.toml.rea.backup`
- `C:/Users/A-Problem/.codex/config.toml.pre-topview-20261011-135130.backup`

Sources: https://www.topview.ai/mcp ; https://learn.chatgpt.com/docs/extend/mcp?surface=cli ; installed stable REA package README, manifest, setup plan and doctor output.
