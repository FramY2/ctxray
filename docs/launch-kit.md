# CtxRay launch kit

The repository, npm package, release, and evidence links are public. Verify
every link before posting. Ask for tests and criticism first; never buy, trade,
or fabricate stars.

## Show HN

Published 10 August 2026:
<https://news.ycombinator.com/item?id=49238209>. The initial post remained at
1 point and 0 comments at the 35-hour checkpoint, but GitHub attributed 16
unique visitors to HN and an external reporter filed actionable Issue #6.

**Title:** Show HN: CtxRay – see and lock what Codex loads before a task

**Body:**

> Codex setups quietly accumulate instructions, skills, plugins, agents, and
> MCP declarations. CtxRay is a local-first CLI/plugin that shows that surface,
> compiles reviewable native profiles, and now locks it so CI can detect drift
> before a task changes unexpectedly. It does not call a model, proxy auth,
> upload prompts, or add telemetry. In the initial 10-pair Luna/Terra/Sol
> microbenchmark, all 20 answers passed the same validators while the lean
> profiles used 29.1% fewer exact aggregate turn tokens. A second 20-turn
> maintainer run measured 28.5% across nine conservative pairs; one pair was
> excluded and disclosed because its validator expected the old npm package
> name even though both answers returned the correct current name. The raw
> ledgers, checksums, erratum, limitations, and short demo are public. I would
> especially value an independent reproduction or a setup where the audit is
> wrong:
> https://github.com/FramY2/ctxray

## Reddit

**Title:** I built a local-first context drift guard for Codex (two public runs)

> Codex setups accumulate AGENTS instructions, skills, plugins, and MCP schemas,
> but it is hard to notice when that surface changes. CtxRay maps it locally,
> builds opt-in native profiles, and its redacted `drift` check can fail CI.
> The first reproducible microbenchmark passed 20/20 answer checks and measured
> a 29.1% aggregate-token reduction. A maintainer repeat measured 28.5% across
> nine conservative pairs. The first external code review then found a real
> nested-guidance omission; v0.2.2 fixes it with preserved RED/GREEN tests. No
> quota bypass, cookie relay, or hosted telemetry. I am looking for an
> independent benchmark reproduction or another setup where the audit is wrong:
> https://github.com/FramY2/ctxray

## Short post

> CtxRay makes Codex context inspectable and reviewable: audit skills/plugins/MCP,
> compile native profiles, detect drift, and attach honest usage receipts.
> First live matrix: 20/20 quality passes and 29.1% fewer exact aggregate turn
> tokens. A second maintainer run measured 28.5% across nine conservative pairs
> and disclosed one stale validator. Reproducible evidence + limitations:
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
[the visibility plan](growth-plan.md). The owner approved the initial launch;
the public HN URL and interim checkpoint are recorded above. Do not publish the
Reddit follow-up until v0.2.2 and its CI/npm artifacts are verified.
