# CtxWise v0.3.1 — rebrand completion

This patch release completes the visible CtxWise rename and keeps the release
path reproducible.

## What changed

- The README demo, MP4, square social cut, GIF, and poster are rebuilt from the
  CtxWise sources. Scenes stay still; motion is limited to short diagonal
  transitions and opening/closing fades.
- `CTXWISE_CODEX_BIN` is now the preferred custom Codex executable override.
  Existing setups using `CTXRAY_CODEX_BIN` continue to work as a fallback.
- `smol-toml` and `tsx` receive their green Dependabot patch updates.
- Current public documentation and copyright metadata use the CtxWise identity.

## Evidence

- Local-first behavior is unchanged: no telemetry, auth proxy, prompt upload,
  or background plugin hooks.
- Reproduction: `npm run benchmark:quick` after cloning `v0.3.1`.
- Release gate: formatting, type checking, coverage, build, plugin validation,
  npm package inspection, and runtime dependency audit.
