# CtxRay launch kit

The repository, npm package, release, and evidence links are public. Verify
every link before posting. Ask for tests and criticism first; never buy, trade,
or fabricate stars.

## Show HN

Published 10 August 2026:
<https://news.ycombinator.com/item?id=49238209>. The initial post remained at
1 point and 0 comments at the 35-hour checkpoint, but GitHub attributed 16
unique visitors to HN and an external review produced an actionable
nested-guidance compatibility finding.

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

The first `r/codex` submission was removed by an account-age filter, not by a
content decision. The evidence post was then submitted manually to
`r/OpenaiCodex` on 13 August 2026 with `Showcase / Highlight` flair:
<https://www.reddit.com/r/OpenaiCodex/comments/1vnlilf/i_fixed_two_flaws_in_my_codex_context_benchmark/>.

At the 14 August checkpoint it had 616 views, ranked eighth among that day's
community posts, and had 1 upvote, 0 comments, and 0 shares. GitHub did not yet
show Reddit among its top referrers, so the result is treated as exposure
without demonstrated activation. Do not repost or cross-post during the
72-hour observation window.

**Published title:** I fixed two flaws in my Codex context benchmark — now reproduction is one command

> Disclosure: I maintain CtxRay, an Apache-2.0 local-first audit and drift tool
> for Codex.
>
> An external review found that its nested-directory audit could omit active
> root/intermediate AGENTS.md files. I fixed that in v0.2.2 with preserved
> RED/GREEN tests. While reviewing why nobody reproduced the benchmark, I found
> a second problem in my own instructions: the preflight could see the bundled
> ledger as complete and run zero new turns.
>
> v0.2.3 now makes a genuinely new two-turn reproduction one command after
> cloning the repository:
>
> `npm run benchmark:reproduce`
>
> It says up front that it may consume two Codex turns, generates a fresh
> `community-*` ledger, refuses to modify the two maintainer ledgers, and writes
> a bounded `share.md` plus SHA-256 checksums. Nothing is uploaded. If the pair
> works, it prints the resume command for the full 20-turn matrix.
>
> The two maintainer runs measured 29.1% and 28.5% fewer exact aggregate turn
> tokens at the same deterministic quality gates. Those are bounded results,
> not independent validation or a universal savings claim. I am looking for
> one unrelated environment where the fresh two-turn run either succeeds or
> fails reproducibly:
> https://github.com/FramY2/ctxray/issues/1

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

Run the experiment and review cadence from
[the visibility plan](growth-plan.md). The owner approved the distribution
work. Future Reddit submissions remain manual and must follow the target
community's rules; automation may not press submit.
