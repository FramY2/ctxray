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

## v0.2 — shipped in this repository

- **Drift guard**: compare a redacted capability lock with a saved or live
  context surface, including a CI-ready non-zero exit on unreviewed drift.
- Short visual product demo, social cut, and reusable open-source brand assets.
- **v0.2.2 compatibility patch**: Codex-compatible project-root discovery,
  hierarchical guidance precedence, fallback filenames, byte-budget handling,
  and active-chain capability locks.

## Candidate v0.2

- **Preflight range**: predict context and credit range before a turn, calibrated
  against the user's own exact receipts with confidence intervals.
- **Drift policy**: allow reviewed path rules and severity thresholds while
  preserving a fail-closed default.
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
