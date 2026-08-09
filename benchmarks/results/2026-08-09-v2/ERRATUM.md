# Erratum: scoped package-name fixture

The `2026-08-09-v2` maintainer repeat run exposed a stale validator fixture.
The `repo-package-name` task expected `ctxray`, while the repository's current
`package.json` name is `@framy2/ctxray`. Both the baseline and optimized runs
returned the current scoped name.

The raw ledger is intentionally unchanged. The runner therefore excludes this
pair from every v2 reduction claim and reports the conservative result from the
remaining nine quality-passing pairs: **28.5% fewer exact aggregate turn
tokens** and a **72.9% smaller estimated model-visible prompt**.

The fixture was corrected in commit `bee462b`, after a regression test captured
the mismatch in commit `59d9638`. Future repository-backed benchmark fixtures
now verify the package name and SPDX license directly against `package.json`.

This is a maintainer repeat run, not an independent community reproduction.
