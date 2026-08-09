# CtxRay launch kit

Use these drafts only after the public GitHub URL exists. Verify every link
before posting. Ask for tests and criticism first; never buy,
trade, or fabricate stars.

## Show HN

**Title:** Show HN: CtxRay – see and lock what Codex loads before a task

**Body:**

> Codex setups quietly accumulate instructions, skills, plugins, agents, and
> MCP declarations. CtxRay is a local-first CLI/plugin that shows that surface,
> compiles reviewable native profiles, and now locks it so CI can detect drift
> before a task changes unexpectedly. It does not call a model, proxy auth,
> upload prompts, or add telemetry. In an initial 10-pair Luna/Terra/Sol
> microbenchmark, all 20 answers passed the same validators while the lean
> profiles used 29.1% fewer exact aggregate turn tokens. The fixtures, raw
> ledger, limitations, and 20-second demo are public. I would especially value
> an independent reproduction or a setup where the audit is wrong:
> https://github.com/FramY2/ctxray

## Reddit

**Title:** I built a local-first context drift guard for Codex (public benchmark included)

> Codex setups accumulate AGENTS instructions, skills, plugins, and MCP schemas,
> but it is hard to notice when that surface changes. CtxRay maps it locally,
> builds opt-in native profiles, and v0.2 adds a redacted `drift` check that can
> fail CI. The first reproducible microbenchmark passed 20/20 answer checks and
> measured a 29.1% aggregate-token reduction. No quota bypass, cookie relay, or
> hosted telemetry. I am looking for an independent reproduction or a setup
> where the audit is wrong: https://github.com/FramY2/ctxray

## Short post

> CtxRay makes Codex context inspectable and reviewable: audit skills/plugins/MCP,
> compile native profiles, detect drift, and attach honest usage receipts.
> First live matrix: 20/20 quality passes, 73.3% smaller estimated prompt, 29.1%
> fewer exact aggregate turn tokens. Reproducible evidence + limitations:
> https://github.com/FramY2/ctxray

## First feedback questions

1. Did `ctxray audit` match what you believed was active?
2. Which source consumed context without helping your task?
3. Did the optimized profile preserve your acceptance test?
4. Which metric or label was confusing?
5. Would you contribute a redacted benchmark result?

Record only real public links, issues, discussion replies, unique testers, and
stars. Do not treat impressions as users or count the maintainer's own star as
external validation.

Run the first channel experiment and review cadence from
[the visibility plan](growth-plan.md). Publishing or contacting people still
requires explicit owner approval.
