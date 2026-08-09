# Reproduce the v0.1.0 benchmark and report what you observe

CtxRay v0.1.0 includes a quality-gated Luna/Terra/Sol microbenchmark. We are
looking for independent reproductions, regressions, and cases where reducing
discovered context changes an answer.

## Reproduction

1. Clone the repository at tag `v0.1.0`.
2. Install Node.js 20+ and a working Codex CLI.
3. Run `npm ci`, then `npm run benchmark:preflight`.
4. Read `benchmarks/results/2026-08-09-v1/report.md` and compare the generated
   receipt with the committed summary.

Please do not include prompts, credentials, session transcripts, or private
repository contents. Share only the operating system, Node/Codex versions,
requested profile, pass/fail result, and any reproducible discrepancy.
