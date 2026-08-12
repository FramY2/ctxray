# Live benchmark

The public benchmark uses ten paired, quality-gated tasks across GPT-5.6 Luna,
Terra, and Sol. Each pair holds the task, requested model, effort, repository,
sandbox, and validator constant. Only the selected context profile changes.

## Independent two-turn preflight

From a checkout of release `v0.2.3` or later:

```powershell
npm ci
npm run benchmark:reproduce
```

This command builds the project, states that it may consume two Codex turns,
generates a fresh filesystem-safe `community-*` ID, and records one baseline /
optimized pair. It cannot append to either bundled maintainer ledger. The run
uses ephemeral Codex sessions, stores no authentication material or hidden
reasoning, and withholds reductions when the exact answer validator fails.

The output directory contains:

- `runs.jsonl`: machine-readable per-turn evidence;
- `summary.json`: aggregate result and environment metadata;
- `report.md`: method, result, and limitations;
- `share.md`: bounded copy suitable for community review;
- `SHA256SUMS.txt`: hashes of the exact artifacts.

Review every file before sharing it. To continue the same ledger for all 20
turns, use the exact ID printed by the preflight:

```powershell
npm run benchmark:reproduce -- --id community-YYYYMMDD-HHMMSS-xxxxxxxx --full
```

Completed calls are resumed, not repeated. Report successes, failures, and
environment details in <https://github.com/FramY2/ctxray/issues/1>.

## Bundled evidence

The initial evidence uses ID `2026-08-09-v1`. The maintainer repeat,
`2026-08-09-v2`, preserved a conservative nine-pair result and exposed a stale
package-name fixture; its raw ledger and
[erratum](results/2026-08-09-v2/ERRATUM.md) are public. Neither run is counted
as independent validation, and the runner refuses to add calls to those IDs.

Prompt-context figures are estimates from `codex debug prompt-input`. Aggregate
turn tokens are exact values from `turn.completed`; cached input is not added a
second time. Results are evidence for this fixed microbenchmark, not a universal
claim about every repository or task.
