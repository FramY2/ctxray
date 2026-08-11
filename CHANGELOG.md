# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and semantic versioning.

## [0.2.2] - 2026-08-11

### Added

- Project-scope discovery that follows Codex root markers from the active
  working directory, including configured marker names.
- Regression coverage for nested guidance, configured fallback filenames,
  aggregate byte limits, global override fallback, and active lockfile scope.

### Fixed

- `audit`, `map`, and profile compilation now inventory the active guidance
  chain from the project root to the current working directory instead of
  treating the current directory as the root.
- Project guidance now honors `AGENTS.override.md`, configured fallback names,
  and `project_doc_max_bytes`, including truncation of the final active file.
- Empty global overrides now fall back to `AGENTS.md`, matching Codex.
- Capability locks include the active nested guidance chain and exclude
  unrelated sibling instructions.

## [0.2.1] - 2026-08-09

### Added

- A second 20-turn maintainer benchmark ledger with checksums, a conservative
  nine-pair report, and a transparent validator erratum.
- A regression test that keeps repository-backed benchmark fixtures aligned
  with current package metadata.

### Fixed

- Updated the benchmark's package-name fixture after the npm package became
  scoped as `@framy2/ctxray`.
- Replaced prompt-role aggregation through a plain object with a `Map`, so
  prototype-like role names remain ordinary data instead of mutating object
  behavior.

### Security

- Enabled GitHub CodeQL extended analysis for JavaScript/TypeScript with local
  and remote threat sources, fixed its actionable finding, and documented the
  CLI's local-operator trust boundary.

## [0.2.0] - 2026-08-09

### Added

- `ctxray drift` for deterministic, schema-validated comparison of redacted
  capability locks, with `--fail-on-drift` for CI.
- Reusable CtxRay mark, README hero, and GitHub social-preview artwork.
- A 20-second, 60 fps product demo with stationary scenes, brand-aligned
  diagonal transitions, a square social cut, and reproducible SVG sources.
- A measurable, evidence-first visibility plan and refreshed launch assets.

### Changed

- Reworked the README around the product problem, quick proof, and a shorter
  path from discovery to independent reproduction.

## [0.1.0] - 2026-08-09

### Added

- Resumable, quality-gated live benchmark harness and public machine-readable
  Luna/Terra/Sol results.
- A 48-second MP4/GIF evidence demo built from measured results (superseded by
  the shorter v0.2 product cut).
- Benchmark-result feedback issue form and launch kit.
- Public npm bootstrap package `@framy2/ctxray@0.1.0`; future releases use
  GitHub OIDC trusted publishing.

- Local Codex context, skill, plugin, agent, and MCP audit.
- Active-plugin filtering that excludes stale, backup, and uninstalled cache entries.
- Bounded local Mermaid context map.
- Privacy-safe prompt X-Ray.
- Opt-in pre-turn prompt estimate kept separate from aggregate usage.
- Strict YAML-to-native-Codex profile compiler with backups.
- Redacted capability lockfile.
- Exact `codex exec --json` usage parser.
- Subscription-safe credit/quota receipt and opt-in API equivalent.
- API-key price estimate using a dated official rate catalog.
- Local Codex app-server account/quota reader.
- Explicitly invoked Codex plugin and repository marketplace.
- Unit, integration, and process-level end-to-end test suite.
- GitHub issue/PR templates, CI matrix, Dependabot, and OIDC npm release gate.

### Fixed

- Windows now resolves the public npm Codex launcher before the protected
  desktop-app binary.
