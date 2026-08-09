# Benchmark fixture drift TDD evidence

## Source and journey

The journey was derived from the `2026-08-09-v2` live run: as a maintainer, I
want repository-backed benchmark answers to track current metadata so that a
package rename cannot create a false quality failure.

## RED

- Test: `tests/unit/benchmark-fixtures.test.ts`
- Command: `npm test -- tests/unit/benchmark-fixtures.test.ts`
- Result: failed because the fixture returned `ctxray` while `package.json`
  declared `@framy2/ctxray`.
- Checkpoint: `59d9638 test: reproduce stale benchmark package name`

## GREEN

- Change: align the `repo-package-name` fixture with the scoped npm name.
- Command: `npm test -- tests/unit/benchmark-fixtures.test.ts`
- Result: 1/1 test passed.
- Checkpoint: `bee462b fix: align benchmark fixture with scoped package`

## Guarantees

| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | The package-name benchmark answer matches current `package.json` metadata | `benchmark-fixtures.test.ts` | Regression | PASS |
| 2 | The license benchmark answer matches the current SPDX license | `benchmark-fixtures.test.ts` | Regression | PASS |

The complete coverage suite is run again in the final release verification.

