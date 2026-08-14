# CtxWise v0.2.0 — lock the signal

CtxWise can now detect when the Codex capability surface changes after a new
skill, plugin, instruction, profile, or upgrade.

## Highlights

- `ctxwise drift` compares a redacted baseline with another lockfile or the live
  local setup.
- `ctxwise drift --fail-on-drift` returns exit status `2`, so CI can stop an
  unreviewed context change before it affects a task.
- Lockfiles are schema-validated and duplicate paths are rejected.
- The refined 20-second, 60 fps demo keeps every scene stationary and confines
  motion to brand-aligned diagonal transitions. It tells the complete audit →
  profile → drift → evidence story without a model call or hosted service.
- New reusable logo, README hero, social preview, and square launch video.

## Try it

```shell
npm install --global @framy2/ctxwise@0.2.0
ctxwise lock
ctxwise drift --fail-on-drift
```

CtxWise remains local-first, has no telemetry, requires no API key, and never
reads prompt history by default.

The published benchmark remains an initial bounded microbenchmark. Its method,
raw results, validators, and limitations are unchanged and public under
`benchmarks/results/2026-08-09-v1/`.
