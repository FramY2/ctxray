# CtxWise v0.2.2 — match active Codex guidance

CtxWise v0.2.2 is a compatibility and audit-correctness patch release.

## Highlights

- Detects the project root from Codex-compatible root markers instead of
  silently treating a nested working directory as the root.
- Inventories project guidance from the root down to the active working
  directory with `AGENTS.override.md` precedence and configured fallback names.
- Applies `project_doc_max_bytes` to the aggregate active guidance chain,
  including deterministic truncation of the last contributing file.
- Makes redacted capability locks track active nested guidance while excluding
  unrelated sibling instructions.
- Falls back from an empty global `AGENTS.override.md` to the normal
  `AGENTS.md`, matching Codex behavior.

The bug was reported with a minimal reproduction in
[Issue #6](https://github.com/FramY2/ctxwise/issues/6). The fix was developed
with preserved RED/GREEN checkpoints and 60 passing automated tests.

## Install

```shell
npm install --global @framy2/ctxwise@0.2.2
```

Run `ctxwise audit` from the directory where Codex will work. CtxWise detects a
configured project root automatically; `--project` remains available for an
explicit root. The lockfile schema, local-first boundary, and no-telemetry
behavior are unchanged.
