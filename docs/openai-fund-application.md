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

## Draft project description

> CtxRay is a local-first observability and control layer for OpenAI Codex. It
> inventories model-relevant instructions, skills, plugins, agent profiles, and
> MCP declarations; renders a private Mermaid context map; compiles safe native
> Codex profiles; creates redacted reproducibility lockfiles; and produces honest
> post-turn receipts that separate exact aggregate usage, estimated prompt size,
> ChatGPT credits, quota, and API cost. CtxRay makes context and model-routing
> decisions inspectable without proxying authentication, uploading prompts, or
> becoming another chat interface.

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
and limitations are committed under `benchmarks/` with a 48-second demo.

This evidence supports feasibility, not a universal savings claim. Fund credits
would expand it into repeated repository-scale implementation, refactoring,
security-review, long-context, and multi-agent experiments.

## Suggested credit allocation

- 45%: repeated cross-model/profile benchmark matrix.
- 25%: Codex release compatibility and regression runs.
- 20%: community-contributed task reproduction and triage.
- 10%: long-context and multi-agent attribution experiments.

## Before submitting

Current status: the public repository, benchmark fixtures/results/demo, scoped
npm bootstrap package, and first tagged GitHub release are available. Issue #1
is open for independent reproduction; no external response or star count is
claimed yet.

- Repository: <https://github.com/FramY2/ctxray>
- npm bootstrap: <https://www.npmjs.com/package/@framy2/ctxray>
- Release: <https://github.com/FramY2/ctxray/releases/tag/v0.1.0>
- Reproduction feedback: <https://github.com/FramY2/ctxray/issues/1>

- Collect independent reproductions and link substantive feedback in the
  application.
- Ship at least one tagged release and a short terminal demo.
- Publish baseline benchmark fixtures and results, even if the first result is
  “no measurable improvement”.
- Collect real issues or discussions from early users and link them in the
  application.
- Keep the Apache-2.0 license, CI, security policy, roadmap, and contribution
  path visible.
- Describe CtxRay as observability and reproducibility tooling. Do not use
  quota-bypass, cookie relay, or “free API” framing.

Official form: <https://openai.com/form/codex-open-source-fund/>
