# Architecture

CtxRay is a single-process TypeScript CLI plus a thin Codex plugin skill. It has
no server, database, background daemon, telemetry pipeline, or model dependency.

## Modules

| Module           | Responsibility                                                                  |
| ---------------- | ------------------------------------------------------------------------------- |
| `guidance.ts`    | Resolve project scope and mirror Codex hierarchical instruction discovery       |
| `audit.ts`       | Inventory context-bearing Codex surfaces and report metadata-only findings      |
| `context-map.ts` | Render bounded, injection-safe Mermaid from audit metadata                      |
| `drift.ts`       | Validate and compare redacted capability locks with deterministic change output |
| `xray.ts`        | Reduce model-visible prompt JSON to role/size statistics without returning text |
| `profile.ts`     | Validate strict YAML and emit deterministic native Codex TOML                   |
| `events.ts`      | Parse `codex exec --json` and trust usage only from `turn.completed`            |
| `app-server.ts`  | Perform a bounded local JSON-RPC account/quota read                             |
| `receipt.ts`     | Apply cost semantics and render a post-turn footer                              |
| `lockfile.ts`    | Redact, hash, and serialize the capability surface                              |
| `runner.ts`      | Spawn Codex and the opt-in prompt debugger with argument arrays and no shell    |

## Trust boundaries

1. Filesystem content is untrusted input. Reports return counts and relative
   paths, not raw config or prompt text.
   Configuration files are inventoried but not counted as prompt tokens;
   `AGENTS.md` and skill discovery metadata form the known startup estimate.
2. Runtime JSONL is validated before token values become `exact` evidence.
3. Price data is a versioned input with an effective date and official source
   URLs. Unknown models remain unpriced.
4. Profile writes are explicit. Existing files are backed up before replacement.
5. Child processes are spawned without a shell to avoid command interpolation.
6. Drift input is schema-validated, rejects duplicate identities, and compares
   only redacted hashes and metadata.
7. Project guidance discovery is bounded to the active root-to-working-directory
   chain, applies the configured byte budget, and excludes sibling instructions.

## Why no MCP server in v0.1

An always-on MCP server would add tool schemas and startup cost to the very
context CtxRay is trying to explain. The CLI is silent when unused. The plugin
contains one explicitly invoked skill and no lifecycle hook.

## Compatibility strategy

Stable Codex surfaces are preferred. Version-sensitive features fail to a
partial result:

- missing app-server quota -> receipt keeps exact tokens and shows quota unknown;
- unavailable `prompt-input` -> audit remains usable;
- unavailable prompt X-Ray -> usage stays exact while prompt fill is unknown;
- unknown model -> no credits or dollars are fabricated;
- malformed config -> inventory continues without printing its content.
