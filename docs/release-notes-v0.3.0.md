# CtxWise v0.3.0 — rename from CtxRay

CtxRay is now **CtxWise**. The product is the same local-first Codex audit,
profile, drift, and receipt CLI. The name change avoids the unrelated PyPI
project also called `ctxray`.

## Install

```shell
npm install --global @framy2/ctxwise
ctxwise doctor
```

`ctxray` remains a one-release compatibility command. Existing `ctxray`
lockfiles still parse. New lockfiles write `generator.name: "ctxwise"`.

## What to use now

- Package: `@framy2/ctxwise`
- Repository: https://github.com/FramY2/ctxwise
- Reproduction: `npm run benchmark:quick` after cloning `v0.3.0`

This is a naming and identity release, not a new benchmark claim.
