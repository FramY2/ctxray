# Codex open source fund application notes

## Fit assessment

CtxRay is a credible fit, but selection cannot be guaranteed. It is open-source
infrastructure built around Codex CLI and OpenAI model routing, not a chatbot
wrapper. Its strongest case is observability, reproducibility, and public
quality-constrained evaluation. Marketing it as a quota bypass or merely “using
less OpenAI” would weaken both the product and the application.

The official application is reviewed on an ongoing basis, offers grants up to
$25,000 in API credits, and explicitly asks how those credits will be used.
CtxRay can use API credits through Codex CLI API-key authentication; it does not
need to embed a separate OpenAI SDK just to qualify.

## Form-ready brief description

> CtxRay is an Apache-2.0, local-first observability and reproducibility layer
> for OpenAI Codex. It audits model-relevant context, compiles reviewable native
> profiles, creates redacted lockfiles, detects context drift in CI, and reports
> exact versus estimated usage without proxying authentication or uploading
> prompts. Its public quality-gated benchmarks test whether context reductions
> preserve task outcomes across requested Luna, Terra, and Sol profiles.

## Draft project description

> CtxRay is a local-first observability and control layer for OpenAI Codex. It
> inventories model-relevant instructions, skills, plugins, agent profiles, and
> MCP declarations; renders a private Mermaid context map; compiles safe native
> Codex profiles; creates redacted reproducibility lockfiles; detects unreviewed
> capability drift locally or in CI; and produces honest post-turn receipts that
> separate exact aggregate usage, estimated prompt size, ChatGPT credits, quota,
> and API cost. CtxRay makes context and model-routing decisions inspectable
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

CtxRay has now executed its first public quality-gated matrix using real Codex
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

## Suggested credit allocation

- 45%: repeated cross-model/profile benchmark matrix.
- 25%: Codex release compatibility and regression runs.
- 20%: community-contributed task reproduction and triage.
- 10%: long-context and multi-agent attribution experiments.

## Before submitting

Current status: the public repository, benchmark fixtures/results, redesigned
20-second demo, scoped npm package, social preview, CI drift guard, CodeQL
analysis, and tagged v0.2.1 release are available. A second maintainer run
reproduced the direction of the first result and transparently exposed and
fixed a stale validator fixture. Issue #1 is open for independent reproduction;
there is no independent benchmark response yet. The repository showed 2 stars
at the 9 August checkpoint, but their independence or attribution is not
claimed.

- Repository: <https://github.com/FramY2/ctxray>
- npm package: <https://www.npmjs.com/package/@framy2/ctxray>
- Current release: <https://github.com/FramY2/ctxray/releases/tag/v0.2.1>
- Benchmark release: <https://github.com/FramY2/ctxray/releases/tag/v0.1.0>
- Maintainer repeat: <https://github.com/FramY2/ctxray/tree/main/benchmarks/results/2026-08-09-v2>
- Reproduction feedback: <https://github.com/FramY2/ctxray/issues/1>

- Publish the focused Show HN launch, then submit when either one substantive
  independent reproduction/discussion exists or seven days have elapsed. If no
  independent response arrives, say so explicitly rather than delaying
  indefinitely.
- Keep the Apache-2.0 license, CI, security policy, roadmap, and contribution
  path visible.
- Describe CtxRay as observability and reproducibility tooling. Do not use
  quota-bypass, cookie relay, or “free API” framing.

Do not guess identity fields. The owner must provide or confirm first name,
last name, email, personal GitHub profile, and optional LinkedIn before the form
is submitted.

## Draft answer: anything else

> CtxRay is already public under Apache-2.0 with 51 automated tests, protected
> quality gates, CodeQL, a scoped npm release, and raw benchmark ledgers with
> checksums. The initial 20-turn run passed all deterministic answer validators
> and measured a 29.1% exact aggregate-token reduction. A second maintainer run
> measured 28.5% across nine conservative pairs; we published an erratum and a
> TDD fixture repair for the excluded stale-validator pair instead of hiding it.
> We are now explicitly seeking independent reproductions through a public
> issue and evidence-first launch. We do not claim that these early results are
> universal or independently validated.

Official form: <https://openai.com/form/codex-open-source-fund/>
