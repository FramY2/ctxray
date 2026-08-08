# CtxRay v0.1 product contract

CtxRay is a local-first diagnostic and control layer for OpenAI Codex. It does
not proxy authentication, bypass plan limits, or send prompts to a third-party
service.

## Shipped guarantees

1. **Context X-Ray** inspects either Codex's model-visible `prompt-input` JSON or
   the local Codex configuration surface. Estimates are labelled as estimates.
2. **Setup audit** inventories configuration, `AGENTS.md`, skills, agents, and
   MCP declarations without reading session transcripts by default.
3. **Profile compiler** turns a reviewable YAML policy into native Codex profile
   TOML. It writes to a staging directory unless the user explicitly requests an
   install, and installed files are backed up before replacement.
4. **Context receipt** parses the exact usage event from `codex exec --json` and
   can render a footer after the final message. The footer is generated locally,
   so it does not consume model tokens.
5. **Cost honesty** keeps three concepts separate:
   - API-key mode: token-based API charge estimate.
   - ChatGPT subscription mode: token counts, credit equivalent, and available
     quota snapshot.
   - Optional API equivalent: comparison only, disabled by default and always
     labelled “not charged”.
6. **Capability lockfile** hashes the effective local context surface while
   redacting credentials and environment-variable values.
7. **Offline by default**: no telemetry, hosted account, API key, database, or
   model call is required for audit, X-Ray, profiles, receipts, or lockfiles.

## Non-goals for v0.1

- Replacing Codex's native `/status`, `/usage`, or `/statusline` views.
- Claiming that estimated characters are exact model tokens.
- Converting included ChatGPT usage into money “spent”.
- Reading browser cookies or relaying ChatGPT sessions.
- Automatically rewriting user configuration without a diff and backup.
- Claiming savings without a comparable, quality-passing baseline.

## Measurement vocabulary

- `exact`: returned by Codex runtime or an OpenAI API usage object.
- `estimated`: derived from an explicit rate card or character proxy.
- `unknown`: unavailable; never represented as zero.

The built-in rate catalog is versioned and includes its effective date and
official source URLs. Users can supply a newer catalog without upgrading CtxRay.
