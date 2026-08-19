# CtxWise v0.3.2 — runtime version synchronization

This patch fixes a release-metadata bug found by installing v0.3.1 in a real
Codex environment.

## What changed

- `ctxwise --version` now reads the published package version.
- Codex app-server client metadata and newly generated capability lockfiles use
  the same single source of truth.
- End-to-end and integration tests fail if runtime and package versions drift
  again.

v0.3.1 functionality was unaffected, but its CLI displayed the stale value
`0.3.0`. v0.3.2 corrects the display and generated metadata rather than hiding
the discrepancy.

## Evidence

- RED: the new tests observed `0.3.0` while npm contained `0.3.1`.
- GREEN: CLI and lockfile tests match `package.json` after centralization.
- Full release gate: formatting, types, coverage, build, plugin validation,
  package inspection, runtime dependency audit, CI matrix, and CodeQL.
