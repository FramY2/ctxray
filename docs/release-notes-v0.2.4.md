# CtxRay v0.2.4 — make independent testing smaller

The full CtxRay benchmark is deliberately conservative: ten fixed tasks, two
modes, and twenty Codex turns. Version 0.2.4 adds a smaller activation path for
people who want to verify one baseline/optimized pair before committing to the
matrix.

This release began as the project's first external code contribution,
[PR #7](https://github.com/FramY2/ctxray/pull/7) by `@blut-agent`. Maintainer
follow-ups preserve that commit while adding regression coverage and
fail-closed evidence boundaries.

## What changed

- `npm run benchmark:quick` runs a stable two-turn smoke test with no arguments.
- `--task <id>` selects any one task from `benchmarks/tasks.json`.
- Unknown and unsafe task IDs fail before a Codex process starts.
- A filtered run refuses a ledger that already contains unrelated tasks.
- Terminal, Markdown, JSON, and share-report denominators use the selected
  scope rather than the full matrix.
- Partial filtered-run continuation commands preserve `--task`.
- The full twenty-turn flow remains available and unchanged.

The command states its maximum Codex-turn cost before execution, creates a
fresh local `community-*` ledger, and never uploads generated artifacts.
Maintainer benchmarks remain maintainer evidence; this release does not claim
an independent reproduction has occurred.

## Verification

- 17 test files and 80 passing tests.
- 92.05% statement, 83.10% branch, 91.92% function, and 94.76% line coverage.
- CI passes on Node.js 20, 22, and 24.
- Plugin validation and `npm pack --dry-run` pass.
- `npm audit --omit=dev` reports zero vulnerabilities.
- GitHub code-scanning, Dependabot, and secret-scanning report no open alerts.

See the [RED/GREEN record](testing/v0.2.4-task-filter.tdd.md).
