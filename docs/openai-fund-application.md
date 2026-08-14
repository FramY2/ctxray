# Codex open source fund application notes

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

## Form-ready brief description

> CtxWise is an Apache-2.0, local-first observability and reproducibility layer
> for OpenAI Codex. It audits model-relevant context, compiles reviewable native
> profiles, creates redacted lockfiles, detects context drift in CI, and reports
> exact versus estimated usage without proxying authentication or uploading
> prompts. Its public quality-gated benchmarks test whether context reductions
> preserve task outcomes across requested Luna, Terra, and Sol profiles.

## Draft project description

> CtxWise is a local-first observability and control layer for OpenAI Codex. It
> inventories model-relevant instructions, skills, plugins, agent profiles, and
> MCP declarations; renders a private Mermaid context map; compiles safe native
> Codex profiles; creates redacted reproducibility lockfiles; detects unreviewed
> capability drift locally or in CI; and produces honest post-turn receipts that
> separate exact aggregate usage, estimated prompt size, ChatGPT credits, quota,
> and API cost. CtxWise makes context and model-routing decisions inspectable
> without proxying authentication, uploading prompts, or becoming another chat
> interface.

## Draft answer: how API credits would be used

> We would use API credits through Codex CLI to build and publish a reproducible
> benchmark corpus for cost-aware model and subagent routing. The same open-source
> coding tasks would be run across GPT-5.6 Luna, Terra, and Sol profiles, with
> pinned repositories, capability lockfiles, exact runtime usage, repeated runs,
> and identical deterministic acceptance tests. Credits would also fund
> compatibility tests for long contexts, prompt construction, and app-server
> telemetry across Codex releases. Results and anonymized machine-readable
> receipts would be public. We would report an efficiency improvement only when
> the same quality gate passes, helping maintainers choose smaller models where
> appropriate and escalate safely where deeper reasoning is required.

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

## Suggested credit allocation

- 45%: repeated cross-model/profile benchmark matrix.
- 25%: Codex release compatibility and regression runs.
- 20%: community-contributed task reproduction and triage.
- 10%: long-context and multi-agent attribution experiments.

## Before submitting

Current status: the public repository, benchmark fixtures/results, redesigned
20-second demo, scoped npm package, social preview, CI drift guard, CodeQL
analysis, and tagged v0.2.4 release are available. A second maintainer run
reproduced the direction of the first result and transparently exposed and
fixed a stale validator fixture. Issue #1 is open for independent reproduction;
there is no independent benchmark response yet. An external reporter produced
one actionable audit-correctness finding, fixed in v0.2.2, and the first
external code PR was merged for v0.2.4. The 14 August rolling checkpoint showed
4 stars, 1 fork, 111 unique visitors, and 71 unique cloners; one star is the
maintainer's own. Clone and npm download counts may include automation and are
not claimed as users.

- Repository: <https://github.com/FramY2/ctxwise>
- npm package: <https://www.npmjs.com/package/@framy2/ctxwise>
- Current release: <https://github.com/FramY2/ctxwise/releases/tag/v0.2.4>
- Benchmark release: <https://github.com/FramY2/ctxwise/releases/tag/v0.1.0>
- Maintainer repeat: <https://github.com/FramY2/ctxwise/tree/main/benchmarks/results/2026-08-09-v2>
- Reproduction feedback: <https://github.com/FramY2/ctxwise/issues/1>

- Verify the v0.2.4 npm artifact and CI. Submit on 17 August 2026, seven days
  after Show HN, or earlier if a substantive independent reproduction arrives.
  If the count remains zero, say so explicitly rather than delaying
  indefinitely.
- Keep the Apache-2.0 license, CI, security policy, roadmap, and contribution
  path visible.
- Describe CtxWise as observability and reproducibility tooling. Do not use
  quota-bypass, cookie relay, or “free API” framing.

Do not guess identity fields. The owner must provide or confirm first name,
last name, email, personal GitHub profile, and optional LinkedIn before the form
is submitted.

## Draft answer: anything else

> CtxWise is already public under Apache-2.0 with 80 automated tests, protected
> quality gates, CodeQL, a scoped npm release, and raw benchmark ledgers with
> checksums. The initial 20-turn run passed all deterministic answer validators
> and measured a 29.1% exact aggregate-token reduction. A second maintainer run
> measured 28.5% across nine conservative pairs; we published an erratum and a
> TDD fixture repair for the excluded stale-validator pair instead of hiding it.
> An external review also found a nested-guidance omission; v0.2.2 fixes it with
> public RED/GREEN evidence and Codex-compatible root-to-working-directory
> discovery. Version 0.2.3 also repairs a community-reproduction trap by
> generating a fresh two-turn ledger, share report, and checksums from one
> command. Its first external code contribution added targeted task selection;
> v0.2.4 turns that into a named two-turn smoke test with fail-closed scoped
> ledgers and preserved RED/GREEN evidence. We are still explicitly seeking
> independent benchmark reproductions and do not claim that the early savings
> results are universal or independently validated.

Official form: <https://openai.com/form/codex-open-source-fund/>
