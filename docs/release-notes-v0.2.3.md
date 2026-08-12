# CtxRay v0.2.3 — make the reproduction real

The original community preflight had an activation trap: because the bundled
v1 ledger was already complete, a tester could run the documented command and
perform no fresh Codex turns. The result looked successful without being an
independent reproduction.

Version 0.2.3 fixes the path:

- `npm run benchmark:reproduce` creates a unique `community-*` ledger;
- the preflight clearly states that it may consume two Codex turns;
- the terminal prints the command to resume all 20 turns without repeats;
- bundled maintainer IDs cannot receive new calls;
- unsafe or ambiguous identifiers and limits fail before Codex starts;
- `share.md` labels exact, estimated, and withheld evidence honestly;
- `SHA256SUMS.txt` hashes the exact local artifacts.

The tool never uploads benchmark files or certifies who ran them. Maintainers
must still verify whether a submitted result is independent.

Quality gate: 17 test files, 69 passing tests, 91.91% statement coverage,
82.74% branch coverage, 91.55% function coverage, and 94.71% line coverage.
See the [RED/GREEN record](testing/v0.2.3-community-reproduction.tdd.md).
