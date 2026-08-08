# Roadmap

The roadmap separates shipped behavior from experiments. Items below are not
promised until their tests and compatibility gates land.

## v0.1 — shipped in this repository

- Local context/config audit.
- Local Mermaid context map.
- Privacy-safe prompt X-Ray.
- Native Codex profile compiler with backups.
- Redacted capability lockfile.
- Exact JSONL usage parser.
- Honest subscription/API receipt policy.
- Local app-server quota snapshot.
- Explicitly invoked Codex plugin skill.

## Candidate v0.2

- **Preflight range**: predict context and credit range before a turn, calibrated
  against the user's own exact receipts with confidence intervals.
- **Drift watch**: compare lockfiles across Codex upgrades and flag config,
  model, tool, or context regressions.
- **Context capsule**: export a small, reviewable checkpoint for resuming work
  after compaction without copying a whole transcript.
- **Agent receipt tree**: attribute model, effort, token evidence, retries, and
  quality result across parent and subagent runs.
- **Profile benchmark**: compare lean/build/review profiles only on paired tasks
  that pass the same acceptance tests.
- **Sanitized reproduction capsule**: package versions, config hashes, findings,
  and errors for a GitHub issue without prompt or secret content.

## Explicit non-goals

- ChatGPT session relays, cookie scraping, or quota bypasses.
- Automatic config rewriting without review.
- A generic multi-provider agent framework.
- An always-on MCP server whose idle schema consumes context.
- Optimizing token counts at the expense of task quality.
