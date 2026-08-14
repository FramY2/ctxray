CtxWise v0.1.0 is the first public, reproducible release.

Highlights:

- Local-first Codex context audit, map, prompt X-Ray, profile compiler, lockfile,
  quota/usage receipts, and explicit model-routing profiles.
- Quality-gated Luna/Terra/Sol evidence: 20/20 validator-passing turns, with a
  73.3% reduction in estimated model-visible prompt size and 29.1% lower exact
  aggregate turn tokens in the bounded paired matrix.
- Public npm package: https://www.npmjs.com/package/@framy2/ctxwise
- Reproduction report: https://github.com/FramY2/ctxwise/blob/v0.1.0/benchmarks/results/2026-08-09-v1/report.md
- 48-second demo: https://github.com/FramY2/ctxwise/blob/v0.1.0/benchmarks/demo/ctxwise-demo.gif

The benchmark report documents the character-based prompt estimate, exact
`turn.completed` usage, quality gate, served-model caveat, and all reproduction
inputs. This is evidence for the bounded workload, not a universal savings
claim.
