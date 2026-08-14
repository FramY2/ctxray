# Contributing

Thank you for helping make Codex context more observable and reproducible.

## Before opening a change

- Search existing issues and discussions.
- Open an issue first for new commands, new data collection, pricing semantics,
  or changes to lockfile/profile schemas.
- Keep changes local-first and avoid adding a model or hosted-service dependency.

## Development setup

```shell
npm ci
npm test
npm run typecheck
```

## Pull request requirements

1. Add or update a user journey and test before production behavior.
2. Preserve the RED/GREEN evidence for behavioral fixes.
3. Keep coverage at or above 80% for branches, functions, lines, and statements.
4. Update documentation and `CHANGELOG.md` when behavior changes.
5. Run:

```shell
npm run check
npm run build
npm run validate:plugin
npm pack --dry-run
```

## Invariants reviewers protect

- Subscription API-equivalent dollars are off by default and labelled not charged.
- Unknown measurements never become zero.
- CtxWise does not read session history by default.
- Secrets are redacted before lockfile hashing.
- Profile installation creates a backup first.
- Child processes are invoked without a shell.

## Commit style

Use concise conventional prefixes such as `feat:`, `fix:`, `test:`, `docs:`,
and `refactor:`. One logical change per commit is preferred.

By contributing, you agree that your contribution is licensed under Apache-2.0.
