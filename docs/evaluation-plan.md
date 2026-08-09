# Evaluation plan

CtxRay treats efficiency as a quality-constrained engineering result, not a
leaderboard of the smallest token count.

## First completed public run

The `2026-08-09-v1` microbenchmark completed 20 real ephemeral Codex turns: ten
baseline/optimized pairs distributed across requested GPT-5.6 Luna, Terra, and
Sol profiles. All 20 answers passed exact validators, so all ten pairs remained
eligible for comparison.

- Estimated model-visible prompt: 75,767 -> 20,218 tokens (**73.3% lower**).
- Exact aggregate turn usage: 235,973 -> 167,325 tokens (**29.1% lower**).
- Median paired aggregate reduction: **28.2%**.
- Per requested model: Luna 31.3%, Terra 27.6%, Sol 28.1% aggregate reduction.

The public [report](../benchmarks/results/2026-08-09-v1/report.md), [task
fixtures](../benchmarks/tasks.json), [JSONL ledger](../benchmarks/results/2026-08-09-v1/runs.jsonl),
and [summary](../benchmarks/results/2026-08-09-v1/summary.json) preserve the
method and evidence. The result is intentionally labeled a microbenchmark; the
next stage remains repeated, repository-scale implementation and review tasks.

## Paired benchmark protocol

1. Pin the repository commit, Codex version, CtxRay capability lock, task text,
   and acceptance command.
2. Run the same task through the candidate profiles and models using API-key
   authentication when API-credit accounting is required.
3. Record exact runtime token categories, dated price estimates, retries,
   elapsed time, and the verification result. Keep prompt content out of public
   receipts unless the benchmark fixture is already public.
4. Repeat non-deterministic cases at least three times.
5. Exclude any run that does not pass the same acceptance gate.
6. Report medians and ranges. A profile is Pareto-improving only if it preserves
   quality while reducing at least one measured resource without worsening all
   others.

## Initial public matrix

- Small deterministic inspection tasks for Luna.
- Bounded implementation and refactoring tasks for Terra.
- Ambiguous architecture and high-risk review tasks for Sol.
- Single-agent versus economically routed subagents.
- Default versus reduced discovery catalogs.
- Short versus long prompt-input fixtures.

Fixtures should use permissively licensed repositories or purpose-built sample
projects. Every published result must include the task, commit, profile,
lockfile, verification command, raw machine-readable receipt, and CtxRay
version.

## Metrics

- Acceptance pass rate and flaky-run rate.
- Exact input, cached input, output, and reasoning-output tokens when exposed.
- ChatGPT credit equivalent or API estimate, never conflated.
- Retry count and wall-clock duration.
- Known startup/discovery estimate and pre-turn prompt estimate.
- Configuration drift between benchmark runs.

CtxRay will not claim a percentage saving from unmatched tasks, failed runs, or
different quality gates.
