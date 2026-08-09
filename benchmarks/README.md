# Live benchmark

The public benchmark uses ten paired, quality-gated tasks across GPT-5.6 Luna,
Terra, and Sol. Each pair holds the task, requested model, effort, repository,
sandbox, and validator constant. Only the selected context profile changes.

Build before running:

```powershell
npm run build
node scripts/run-live-benchmark.mjs --limit 2
node scripts/run-live-benchmark.mjs
```

The first command pair is a low-cost preflight. The runner resumes from its
JSONL ledger and never repeats a completed model call. It uses ephemeral Codex
sessions, stores no authentication material or hidden reasoning, and withholds
savings claims for any pair that fails its exact answer validator.

The bundled evidence uses ID `2026-08-09-v1`. To start an independent ledger
instead of resuming it, choose a new filesystem-safe ID:

```powershell
node scripts/run-live-benchmark.mjs --id local-reproduction-01 --limit 2
node scripts/run-live-benchmark.mjs --id local-reproduction-01
```

Prompt-context figures are estimates from `codex debug prompt-input`. Aggregate
turn tokens are exact values from `turn.completed`; cached input is not added a
second time. Results are evidence for this fixed microbenchmark, not a universal
claim about every repository or task.
