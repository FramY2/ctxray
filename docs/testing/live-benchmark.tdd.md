# Live benchmark and Windows CLI TDD evidence

Date: 2026-08-09

## Windows CLI resolution

- RED commit `f0a2251`: the new unit test could not import the missing public
  CLI resolver, reproducing the absence of a safe Windows path.
- GREEN commit `df2d1b0`: the resolver selects the npm JavaScript launcher with
  Node and preserves explicitly selected executables.
- Proving commands: `npm test -- tests/unit/codex-command.test.ts`,
  `npm run typecheck`, `npm run build`, and `node dist/cli.js doctor`.
- Live evidence: `doctor` reported `codex-cli 0.147.0` and the account query
  reported ChatGPT Team authentication.

## Benchmark quality gate

- RED commit `0609d40`: the aggregation contract referenced an absent module.
- GREEN commit `0e54172`: paired aggregation counted only same-task,
  same-model runs where both validators passed.
- RED commit `ddfe086`: prompt-context provenance fields were required but
  absent.
- GREEN commit `0667915`: prompt estimates and exact aggregate usage became
  separate metrics; incomplete evidence withholds the corresponding claim.
- Proving command: `npm test -- tests/unit/benchmark.test.ts`.

## Live run

- Codex CLI: `0.147.0`.
- Requested profiles: GPT-5.6 Luna, Terra, and Sol; actual served model is not
  independently attested by the JSONL event stream and remains marked unknown.
- Runs: 20 ephemeral model turns, ten baseline/optimized pairs.
- Quality: 20/20 exact answer validators passed; zero excluded pairs.
- Estimated prompt reduction: 73.3%.
- Exact aggregate turn-token reduction: 29.1%.
- The machine-readable ledger and summary live under
  `benchmarks/results/2026-08-09-v1/`.

Known limitation: the benchmark is small and bounded. It proves the harness and
an initial context effect, not universal savings for large implementation work.
