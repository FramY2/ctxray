# CtxRay

<p align="center">
  <img src="assets/brand/ctxray-hero.svg" alt="CtxRay: know what enters Codex and change it with proof" width="100%" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@framy2/ctxray"><img alt="npm version" src="https://img.shields.io/npm/v/%40framy2%2Fctxray?color=7657FF" /></a>
  <a href="https://github.com/FramY2/ctxray/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/FramY2/ctxray/actions/workflows/ci.yml/badge.svg" /></a>
  <img alt="Node.js 20 or newer" src="https://img.shields.io/badge/node-%3E%3D20-339933" />
  <img alt="Apache 2.0 license" src="https://img.shields.io/badge/license-Apache--2.0-2DE2E6" />
  <img alt="Local-first" src="https://img.shields.io/badge/data-local--first-7657FF" />
</p>

<p align="center">
  <strong>The local-first observability and control layer for OpenAI Codex.</strong><br />
  Audit context, compile intentional profiles, catch configuration drift, and attach honest usage receipts.
</p>

<p align="center">
  <a href="#quick-start"><strong>Install</strong></a> ·
  <a href="benchmarks/demo/ctxray-demo.mp4"><strong>20-second demo</strong></a> ·
  <a href="benchmarks/results/2026-08-09-v1/report.md"><strong>Benchmark evidence</strong></a> ·
  <a href="https://github.com/FramY2/ctxray/issues/1"><strong>Reproduce it</strong></a>
</p>

CtxRay is a local-first CLI and Codex plugin for context diagnostics, safe
profile compilation, drift detection, reproducibility lockfiles, and honest
post-turn usage receipts. It calls no model of its own, requires no API key,
and has no telemetry.

> Community project. Not affiliated with or endorsed by OpenAI.

## See it in 20 seconds

[![CtxRay short product demo](benchmarks/demo/ctxray-demo.gif)](benchmarks/demo/ctxray-demo.mp4)

The demo uses the public benchmark and the shipped CLI behavior. Click it for
the compact MP4, or use the [square social cut](benchmarks/demo/ctxray-demo-square.mp4).

## The papercuts it removes

| You should not have to...                                   | CtxRay gives you...                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| Guess which skills, instructions, plugins, or MCPs load     | A private audit and bounded context map                             |
| Hand-edit model profiles and hope the change is reversible  | Reviewable YAML, native Codex TOML, dry-runs, and automatic backups |
| Discover context changes only after a worse or costlier run | A redacted lockfile plus a CI-ready drift check                     |
| Confuse token estimates, subscription quota, and API bills  | Receipts that label exact, estimated, comparison, and unknown data  |

## Live evidence

The first public microbenchmark ran 10 paired tasks across requested GPT-5.6
Luna, Terra, and Sol profiles: **20/20 answers passed the same exact validator**.
Removing irrelevant discovered context reduced the estimated model-visible
prompt by **73.3%** and exact aggregate turn tokens by **29.1%**. Every pair
holds task, requested model, effort, sandbox, commit, and quality gate constant.

These are bounded microbenchmark results, not a universal productivity claim.
The runtime stream records the requested profile but does not independently
attest the served model, and prompt size remains a character-based estimate.
Read the [method and limitations](benchmarks/results/2026-08-09-v1/report.md),
inspect the [machine-readable summary](benchmarks/results/2026-08-09-v1/summary.json),
or watch the [20-second MP4](benchmarks/demo/ctxray-demo.mp4).

A second maintainer run measured a conservative **28.5%** exact aggregate
reduction across nine comparable pairs and exposed a stale package-name
validator. The raw [repeat run and erratum](benchmarks/results/2026-08-09-v2/ERRATUM.md)
are public; it is evidence of repeatability and fixture hardening, not an
independent community reproduction.

The first external code review found that a nested invocation could omit
project-root and intermediate `AGENTS.md` guidance. Version 0.2.2 fixes that
gap, adds root-marker/fallback/byte-budget compatibility tests, and narrows
lockfiles to the active root-to-working-directory guidance chain. This is an
actionable independent finding, not an independent benchmark reproduction.

The first external code contribution added targeted benchmark task selection.
Version 0.2.4 completes it with fail-closed ledger scoping, consistent report
denominators, safe continuation commands, and a named two-turn smoke test. The
contributor commit and maintainer RED/GREEN follow-ups remain visible in
[PR #7](https://github.com/FramY2/ctxray/pull/7).

### Run the smallest useful reproduction

Clone the repository and run one explicit baseline/optimized pair:

```shell
git clone https://github.com/FramY2/ctxray.git
cd ctxray
git checkout v0.2.4
npm ci
npm run benchmark:quick
```

The command states the quota-consuming turn limit before execution, creates a
fresh `community-*` ledger, and writes `share.md`, `summary.json`, `report.md`,
and `SHA256SUMS.txt`. It never uploads them. To choose another fixed task, run
`npm run benchmark:reproduce -- --task semantic-version`. Unknown tasks and
mixed-scope ledgers fail before Codex starts. Share successes or failures in
[Issue #1](https://github.com/FramY2/ctxray/issues/1); independence is verified
by the maintainer rather than asserted by the tool.

## Why CtxRay exists

Codex already exposes excellent runtime primitives such as `/status`, `/usage`,
`/statusline`, `codex exec --json`, profile files, and the app-server. The hard
part is connecting them into one answer:

- Which instructions, skills, plugins, agents, and MCP declarations are active?
- Is a large context intentional or accidental?
- Which model/subagent profile should this task use?
- Can another developer reproduce the same capability surface safely?
- Was a dollar amount actually billed, or is it merely an API comparison?

CtxRay does that glue work without becoming another chat wrapper.

## Features

| Command          | What it does                                                                           | Network/model call       |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| `ctxray audit`   | Inventories config plus active root-to-CWD guidance, skills, plugins, agents, and MCPs | None                     |
| `ctxray map`     | Renders a bounded Mermaid map of context sources and discovery overhead                | None                     |
| `ctxray xray`    | Summarizes model-visible prompt JSON without echoing its text                          | None                     |
| `ctxray profile` | Compiles YAML into native `~/.codex/<name>.config.toml`, with dry-run and backups      | None                     |
| `ctxray lock`    | Hashes a redacted capability surface for reproducibility                               | None                     |
| `ctxray drift`   | Compares a capability lock with a file or live setup; can fail CI on drift             | None                     |
| `ctxray quota`   | Reads the current plan and quota window through local Codex app-server                 | Codex account read only  |
| `ctxray receipt` | Calculates a receipt from saved `codex exec --json` usage                              | None                     |
| `ctxray run`     | Runs Codex and appends exact usage plus an optional pre-turn prompt X-Ray              | The requested Codex turn |

## Cost honesty by design

The dollar display is deliberately asymmetric:

| Authentication                       | Default display                             | Dollar meaning                   |
| ------------------------------------ | ------------------------------------------- | -------------------------------- |
| OpenAI API key                       | Exact runtime tokens + dated API estimate   | Estimated billable API charge    |
| ChatGPT Plus/Pro/Business            | Tokens + credit equivalent + quota snapshot | No dollar amount                 |
| Subscription with `--api-equivalent` | Same data + API comparison                  | Comparison only; **not charged** |

CtxRay never calls included subscription usage “money spent”. OpenAI states
that ChatGPT credits have no cash value, so CtxRay does not invent a universal
credit-to-dollar conversion. See [Cost semantics](docs/cost-semantics.md).

## Quick start

Requires Node.js 20 or newer and a working Codex CLI installation.

```shell
npm install --global @framy2/ctxray
ctxray doctor
ctxray audit
ctxray map --out ctxray-context.mmd
ctxray lock
ctxray drift --fail-on-drift
```

Run these commands from the directory where Codex will work. CtxRay discovers
the same project root markers and root-to-current-directory guidance chain,
including configured fallback filenames and the aggregate project-doc limit.

If `ctxray doctor` reports that Codex is unavailable, install the official CLI
with `npm install --global @openai/codex`. On Windows, do not rely on directly
executing the private binary inside the packaged desktop app. CtxRay detects the
public npm launcher automatically.

GitHub renders the generated Mermaid file locally. Labels contain only the
metadata already returned by `audit`, not prompt text or config values. The
headline is a **known startup estimate**: `AGENTS.md` text and skill discovery
metadata are counted; configuration files are marked as metadata, not falsely
treated as prompt text.

### Add a receipt after a Codex answer

```shell
ctxray run --receipt --prompt-xray --model gpt-5.6-terra "Review the current diff"
```

Example output:

```text
Fake answer...
CtxRay receipt · prompt ≈ 1,003 / 1,050,000 (0.1%) · 10,000 input (8,000 cached) + 500 output · credit equivalent ≈ 0.29 · quota 37% used · rates 2026-08-08
```

For a subscription-only API comparison, opt in explicitly:

```shell
ctxray run --receipt --prompt-xray --api-equivalent --model gpt-5.6-terra "Review the current diff"
```

`--prompt-xray` asks Codex's experimental local debug command to render the
model-visible input before the turn; CtxRay converts its character count into
an explicitly estimated token value. The consumed input/output counters come
separately from `turn.completed` and may aggregate several model calls. The
footer itself is rendered locally after completion and consumes no model
tokens.

### Inspect model-visible prompt structure

Capture the experimental Codex diagnostic, then analyze the saved JSON:

```shell
codex debug prompt-input "Review this repository" > prompt-input.json
ctxray xray prompt-input.json
```

CtxRay reports role counts, characters, and explicitly estimated tokens. It
does not include prompt text in its report.

### Compile native Codex profiles

```shell
ctxray profile examples/ctxray.yaml --dry-run
ctxray profile examples/ctxray.yaml
```

The second command stages files under `.ctxray/profiles`. Installing into
`CODEX_HOME` is a separate, explicit action:

```shell
ctxray profile examples/ctxray.yaml --install
```

Existing profiles are copied to `~/.codex/.ctxray-backups/<timestamp>/` first.

### Detect unreviewed context drift

Create a private, redacted baseline, then compare it with the live setup:

```shell
ctxray lock
ctxray drift
ctxray drift --fail-on-drift
```

The last command exits with status `2` when a skill, instruction, profile, or
plugin surface was added, removed, or changed, making it suitable for CI. For a
fully offline comparison between saved files, use
`ctxray drift baseline.json --current current.json`.

### Create a reproducibility lockfile

```shell
ctxray lock --out ctxray.lock.json
```

The lockfile contains hashes and relative paths, not prompt history. Secret-like
config values and all MCP environment values are redacted before hashing.

## Install the Codex plugin from a checkout

The repository includes a validated marketplace and plugin bundle:

```shell
codex plugin marketplace add .
```

Restart the ChatGPT desktop app, open the Plugins Directory, select the CtxRay
marketplace, and install CtxRay. After the repository is public, the same
marketplace can be added using its GitHub `owner/repository` shorthand.

The bundled `$ctxray` skill has implicit invocation disabled. Its instructions
are loaded only when the user explicitly invokes it.

## Architecture

```mermaid
flowchart LR
  A["Codex config, AGENTS.md, skills, plugins"] --> B["Audit + X-Ray"]
  P["CtxRay YAML policy"] --> C["Profile compiler"]
  J["codex exec --json"] --> D["Exact usage parser"]
  S["Codex app-server"] --> E["Plan + quota snapshot"]
  R["Dated OpenAI rate catalog"] --> F["Receipt policy"]
  D --> F
  E --> F
  B --> O["Local reports"]
  C --> O
  F --> O
  O --> L["Redacted capability lock"]
  L --> G["Drift guard"]
```

See [Architecture](docs/architecture.md) and [Privacy and security](docs/privacy-security.md).

## Measurement labels

- **Exact**: returned by the Codex runtime or account surface.
- **Estimated**: derived from a declared character proxy or dated rate card.
- **Unknown**: unavailable. CtxRay never replaces it with zero.

Claims about savings require comparable tasks that pass the same quality gate.
CtxRay does not translate token estimates into a weekly allowance when Codex
does not expose that conversion.

## Current limitations

- A literal inline footer is available through `ctxray run`. Codex does not
  currently document a plugin API that mutates a native desktop assistant
  message after generation, so the desktop plugin uses a separate result.
- `codex debug prompt-input` and app-server are version-sensitive surfaces.
  CtxRay fails closed to `unknown` when data is unavailable.
- `turn.completed.input_tokens` is aggregate consumption, not current context
  occupancy. Without `--prompt-xray`, CtxRay prints `prompt context unknown`
  instead of dividing that aggregate by the model window.
- Runtime MCP tool schemas and built-in tool schemas are not included in the
  static audit estimate; the audit reports that gap explicitly.
- Static discovery reads project-root markers from the active user config. A
  one-off Codex CLI override that is not present in that config cannot be
  inferred by a separate CtxRay process; pass `--project` explicitly.
- The bundled 2026-08-08 catalog covers GPT-5.6 Sol, Terra, and Luna. Supply a
  reviewed catalog with `--pricing` for other models or newer prices.
- Token-derived dollar estimates exclude unobserved tool-call fees and cache
  write classes.

## Development

```shell
npm ci
npm run check
npm run build
npm run validate:plugin
npm pack --dry-run
```

The test suite includes unit, integration, and process-level CLI tests. Coverage
thresholds are at least 80% for statements, branches, functions, and lines. See
the [v0.1 TDD evidence](docs/testing/v0.1.tdd.md) and the
[community-reproduction TDD record](docs/testing/v0.2.3-community-reproduction.tdd.md),
plus the [task-filter TDD record](docs/testing/v0.2.4-task-filter.tdd.md).

Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the
[roadmap](docs/roadmap.md) before opening a substantial change. Efficiency
claims follow the public [evaluation plan](docs/evaluation-plan.md).

## Official references

- [Codex CLI commands and `prompt-input`](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [Codex pricing, credits, and usage limits](https://learn.chatgpt.com/docs/pricing)
- [OpenAI API model prices](https://developers.openai.com/api/docs/models/compare)
- [Codex profile files](https://learn.chatgpt.com/docs/config-file/config-advanced#profiles)
- [Codex app-server protocol](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md)
- [Codex plugins](https://developers.openai.com/plugins/concepts/plugins)

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
