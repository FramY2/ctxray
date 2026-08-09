# CtxRay live benchmark 2026-08-09-v2

Executed with Codex CLI codex-cli 0.147.0. Requested models are recorded; the runtime event stream does not independently attest the served model, so actual model is marked unknown.

## Result

- Completed runs: 20/20
- Quality passes: 18/20
- Comparable quality-passing pairs: 9/10
- Estimated model-visible prompt reduction: 72.9%
- Exact aggregate turn-token reduction: 28.5%
- Median paired aggregate-token reduction: 27.8%

| Requested model | Pairs | Baseline tokens | Optimized tokens | Reduction |
| --------------- | ----: | --------------: | ---------------: | --------: |
| gpt-5.6-luna    |     3 |          49,861 |           34,165 |     31.5% |
| gpt-5.6-sol     |     3 |          76,393 |           55,441 |     27.4% |
| gpt-5.6-terra   |     3 |          75,927 |           54,949 |     27.6% |

## Validator erratum

The excluded `repo-package-name` pair revealed a stale expected value after the
npm package became scoped. Both runs returned the current name
`@framy2/ctxray`; the fixture still expected `ctxray`. The raw ledger and
conservative nine-pair headline remain unchanged. See the
[erratum](ERRATUM.md) and regression evidence.

## Method

Ten fixed tasks are paired by task and requested model. Within every pair, baseline and optimized runs use the same prompt, model, effort, sandbox, repository commit, and answer validator. The optimized profile disables 104 discovered skills and 2 MCP servers for these bounded tasks. Order alternates to reduce order bias. Runs are ephemeral.

Prompt size is a CtxRay character-based estimate from `codex debug prompt-input`; aggregate turn usage comes exactly from `turn.completed`. Cached input is a subset of input and is not double-counted. A pair is excluded from every savings claim if either answer fails.

## Limits

This is a transparent microbenchmark, not a universal productivity claim. The sample per model is small, tasks are intentionally bounded, prompt estimates are tokenizer approximations, and ChatGPT quota units cannot be converted into exact dollars. Repeat on larger real repositories before making broad claims.
