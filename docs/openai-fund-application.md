# Codex open source fund application notes

Verified 16 August 2026 against the public repo, GitHub traffic, Issue #1,
npm, and the tagged `v0.3.0` release. Identity fields stay blank: the owner
must type name, email, GitHub profile, and optional LinkedIn. Do not automate
the form submit.

Official form (primary, $25k API credits):
<https://openai.com/form/codex-open-source-fund/>

Optional second form (ChatGPT Pro + Codex Security; weaker fit today):
<https://openai.com/form/codex-for-oss/>

## Fit assessment

CtxWise is a credible fit, but selection cannot be guaranteed. It is open-source
infrastructure built around Codex CLI and OpenAI model routing, not a chatbot
wrapper. Its strongest case is observability, reproducibility, and public
quality-constrained evaluation. Marketing it as a quota bypass or merely “using
less OpenAI” would weaken both the product and the application.

The official application is reviewed on an ongoing basis, offers grants up to
$25,000 in API credits, and explicitly asks how those credits will be used.
CtxWise can use API credits through Codex CLI API-key authentication; it does not
need to embed a separate OpenAI SDK just to qualify.

## Name collision — say this once in the form

| Name                                              | What it is                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **CtxWise**                                       | This project. Local-first Codex context audit, lock, drift, receipts.                                     |
| `@framy2/ctxwise`                                 | Current npm package, `v0.3.0`.                                                                            |
| `@framy2/ctxray`                                  | Former npm name. Deprecated with a rename notice. Do not treat as a second product.                       |
| PyPI [`ctxray`](https://pypi.org/project/ctxray/) | Unrelated Python tool (`ctxray/ctxray`, formerly `reprompt-cli`). Not this repo.                          |
| `ctxray` CLI alias                                | One-release compatibility command on the CtxWise binary. New lockfiles write `generator.name: "ctxwise"`. |

Repository: <https://github.com/FramY2/ctxwise> (the old `FramY2/ctxray` URL redirects here; do not recreate it).

## Snapshot for the 17 August submit

**Independent benchmark reproductions: 0.**

Issue [#1](https://github.com/FramY2/ctxwise/issues/1) has three maintainer
comments and no external `share.md`. Do not delay the fund submit for a
reproduction that has not arrived. Do not call clones, views, stars, or npm
downloads users.

| Signal                                  |                                                              16 August 2026 | How to say it                                |
| --------------------------------------- | --------------------------------------------------------------------------: | -------------------------------------------- |
| Independent reproductions               |                                                                       **0** | Maintainer matrices only                     |
| External code PR                        |                                    1 (merged; `--task` / `benchmark:quick`) | Community participation, not a reproduction  |
| External product finding                |                                     1 (nested `AGENTS.md`; fixed in v0.2.2) | Quality scrutiny, not a benchmark result     |
| Stars                                   |                                                     4 (1 is the maintainer) | Discovery only                               |
| Forks                                   |                                             1 (`blut-agent`, the PR author) | —                                            |
| Unique visitors (GitHub rolling window) |                                                                         113 | Almost all on 10 August (Show HN)            |
| Unique cloners (same window)            |                                                                          80 | Includes automation; not installs            |
| Current release                         | [v0.3.0](https://github.com/FramY2/ctxwise/releases/tag/v0.3.0) (14 August) | Rename to CtxWise; not a new benchmark claim |

The two public ledgers remain maintainer microbenchmarks on short quiz tasks
(Codex CLI `0.147.0`). Requested profiles are Luna/Terra/Sol; the served model
is recorded as unknown. The 73% prompt-size drop is a character estimate, not
an official tokenizer count. Cached input is present. Public runs are one pass
each, not the three repeats the evaluation plan asks for on non-deterministic
tasks.

## Paste-ready answers — Codex Open Source Fund

Leave “your details” empty until the owner fills them. Paste the project
section below.

### Project name

```
CtxWise (npm: @framy2/ctxwise; formerly CtxRay / @framy2/ctxray)
```

### Repository / links

```
https://github.com/FramY2/ctxwise
https://www.npmjs.com/package/@framy2/ctxwise
https://github.com/FramY2/ctxwise/releases/tag/v0.3.0
https://github.com/FramY2/ctxwise/issues/1
```

### Brief description

> CtxWise is an Apache-2.0, local-first observability and reproducibility layer
> for OpenAI Codex. It audits model-relevant context, compiles reviewable native
> profiles, creates redacted lockfiles, detects context drift in CI, and reports
> exact versus estimated usage without proxying authentication or uploading
> prompts. Its public quality-gated benchmarks test whether context reductions
> preserve task outcomes across requested Luna, Terra, and Sol profiles. Current
> release is v0.3.0. This is not the unrelated PyPI project named `ctxray`.

### Project description

> CtxWise is a local-first observability and control layer for OpenAI Codex. It
> inventories model-relevant instructions, skills, plugins, agent profiles, and
> MCP declarations; renders a private Mermaid context map; compiles safe native
> Codex profiles; creates redacted reproducibility lockfiles; detects unreviewed
> capability drift locally or in CI; and produces honest post-turn receipts that
> separate exact aggregate usage, estimated prompt size, ChatGPT credits, quota,
> and API cost. CtxWise makes context and model-routing decisions inspectable
> without proxying authentication, uploading prompts, or becoming another chat
> interface. Version 0.3.0 is the current public release (rename from CtxRay to
> avoid the unrelated PyPI `ctxray` project). Independent benchmark
> reproductions as of 16 August 2026: 0. The published 29.1% and 28.5% exact
> aggregate-token reductions are maintainer microbenchmarks with public ledgers
> and checksums, not independently validated savings.

### How API credits would be used

> We would use API credits through Codex CLI to build and publish a reproducible
> benchmark corpus for cost-aware model and subagent routing. The same
> open-source coding tasks would be run across GPT-5.6 Luna, Terra, and Sol
> profiles, with pinned repositories, capability lockfiles, exact runtime usage,
> repeated runs, and identical deterministic acceptance tests. About 45% of
> credits would fund a repeated matrix on real implementation, refactor, and
> review tasks (not only the current short quiz set), 25% Codex release
> compatibility, 20% community reproduction triage, and 10% long-context and
> multi-agent attribution. Results and anonymized machine-readable receipts
> would be public. We would report an efficiency improvement only when the same
> quality gate passes.

### Anything else

> CtxWise is public under Apache-2.0 with 81 automated tests, protected quality
> gates, CodeQL, a scoped npm release (`@framy2/ctxwise@0.3.0`), and raw
> benchmark ledgers with checksums. The initial 20-turn maintainer run passed
> all deterministic answer validators and measured a 29.1% exact
> aggregate-token reduction. A second maintainer run measured 28.5% across nine
> conservative pairs; we published an erratum and a TDD fixture repair instead
> of hiding the stale validator. An external review found a nested-guidance
> omission; v0.2.2 fixes it. Version 0.2.3 repairs a community-reproduction trap
> by generating a fresh two-turn ledger. The first external code contribution
> added targeted task selection; v0.2.4 turned that into `npm run
benchmark:quick`. Version 0.3.0 renames the product to CtxWise. Independent
> benchmark reproductions: 0. We do not claim the early savings results are
> universal or independently validated.

## Evidence already produced

CtxWise has now executed its first public quality-gated matrix using real Codex
turns. Ten paired tasks requested GPT-5.6 Luna, Terra, and Sol profiles. All
20 answers passed identical exact validators. The reduced-context profiles
lowered estimated model-visible prompt size by 73.3% and exact aggregate turn
usage by 29.1%. Results, tasks, CLI version, profile policy, commit identifiers,
and limitations are committed under `benchmarks/` with a 20-second product
demo. Version 0.2 also adds a schema-validated context drift guard so benchmark
and production capability surfaces can be checked before a run.

This evidence supports feasibility, not a universal savings claim. Fund credits
would expand it into repeated repository-scale implementation, refactoring,
security-review, long-context, and multi-agent experiments.

A second 20-turn maintainer run reproduced the direction of the first result.
After conservatively excluding one pair whose stale validator expected the old
npm package name, nine pairs measured a 28.5% exact aggregate-token reduction.
Both excluded answers had returned the correct current package name. The raw
ledger, checksums, erratum, TDD repair, and quality checks are public. This is a
maintainer repeat, not independent validation.

The first external code review found that v0.2.1 could omit root and
intermediate `AGENTS.md` guidance when run from a nested directory. Version
0.2.2 mirrors Codex project-root markers, hierarchical precedence, configured
fallback names, and the aggregate byte budget; it also narrows capability
locks to the active guidance chain. The finding and preserved RED/GREEN
evidence are public. This is independent product scrutiny, not an independent
benchmark reproduction.

The 48-hour launch review then found a reproducibility trap in the project's
own community instructions: the documented preflight could reuse the committed
v1 ledger and execute no fresh turns. Version 0.2.3 makes community evidence a
single explicit command that generates a new ID, limits the initial quota cost
to two turns, refuses to modify bundled evidence, writes a bounded share report,
and hashes the artifacts. This improves the path to independent evidence but
does not itself count as independent validation.

The project's first external code contribution then added single-task
benchmark selection. Version 0.2.4 preserves the contributor's commit and adds
maintainer RED/GREEN follow-ups for fail-closed ledger scoping, consistent
denominators, and safe continuation commands. The resulting
`npm run benchmark:quick` entry point makes one quality-gated pair an explicit
two-turn smoke test. This is verified community participation and a benchmark
design improvement, but still not an independent benchmark result.

Version 0.3.0 (14 August 2026) renames the product, CLI, package, plugin, and
lockfile generator to CtxWise / `@framy2/ctxwise` so the project is not
confused with PyPI `ctxray`. It is a naming release, not a new matrix. The
community command is still `npm run benchmark:quick` on tag `v0.3.0`.
Independent reproductions remain **0**.

## Suggested credit allocation

- 45%: repeated cross-model/profile benchmark matrix.
- 25%: Codex release compatibility and regression runs.
- 20%: community-contributed task reproduction and triage.
- 10%: long-context and multi-agent attribution experiments.

## Before submitting

Current status (16 August 2026): the public repository, benchmark
fixtures/results, redesigned 20-second demo, scoped npm package, social
preview, CI drift guard, CodeQL analysis, and tagged **v0.3.0** release are
available. A second maintainer run reproduced the direction of the first result
and transparently exposed and fixed a stale validator fixture. Issue #1 is open
for independent reproduction; **independent reproductions: 0**. An external
reporter produced one actionable audit-correctness finding, fixed in v0.2.2,
and the first external code PR was merged for v0.2.4. The GitHub rolling
traffic window showed 113 unique visitors and 80 unique cloners; the repository
has 4 stars and 1 fork; one star is the maintainer's own. Clone and npm
download counts may include automation and are not claimed as users.

- Repository: <https://github.com/FramY2/ctxwise>
- npm package: <https://www.npmjs.com/package/@framy2/ctxwise>
- Current release: <https://github.com/FramY2/ctxwise/releases/tag/v0.3.0>
- Benchmark release: <https://github.com/FramY2/ctxwise/releases/tag/v0.1.0>
- Maintainer repeat: <https://github.com/FramY2/ctxwise/tree/main/benchmarks/results/2026-08-09-v2>
- Reproduction feedback: <https://github.com/FramY2/ctxwise/issues/1>

- Verify the v0.3.0 npm artifact and CI. Submit the **original fund** on
  17 August 2026, seven days after Show HN. If the independent-reproduction
  count remains zero, say so explicitly rather than delaying indefinitely.
- Keep the Apache-2.0 license, CI, security policy, roadmap, and contribution
  path visible.
- Describe CtxWise as observability and reproducibility tooling. Do not use
  quota-bypass, cookie relay, or “free API” framing.
- Distinguish CtxWise from PyPI `ctxray` and from the deprecated
  `@framy2/ctxray` package.

Do not guess identity fields. The owner must provide or confirm first name,
last name, email, personal GitHub profile, and optional LinkedIn before the form
is submitted. The GitHub user `FramY2` is still empty (no public name, bio, or
email); fill that profile before or while submitting so the maintainer is
verifiable.

## Optional paste — Codex for OSS (only if you also want Pro + Security)

Use this form only as a second, weaker application. Narrative: observability
tool for Codex maintainers. Do not claim adoption.

> CtxWise is a local-first Apache-2.0 CLI and explicit-invocation plugin that
> shows maintainers what Codex actually loads, locks that surface, and detects
> drift in CI. It does not proxy auth, upload prompts, or add telemetry.
> Package `@framy2/ctxwise` v0.3.0; repo https://github.com/FramY2/ctxwise.
> Distinct from the unrelated PyPI project `ctxray`. We have public
> quality-gated maintainer ledgers and one merged external PR, but
> **independent reproductions: 0** and the project is one week old. Credits
> and Pro access would be used to expand the evaluation from short quiz tasks
> to repeated implementation/review work on permissive repos, and to keep the
> audit compatible with new Codex CLI releases.
