# Privacy and security

## Default data behavior

CtxRay operates locally. It does not create an account, send telemetry, call an
LLM, upload files, or read browser cookies.

`ctxray audit` reads metadata from:

- user and project Codex configuration;
- `AGENTS.md` files;
- skill frontmatter;
- plugin manifests;
- agent definitions and MCP declaration names.

It does not read Codex session transcripts by default.

## Prompt X-Ray

`ctxray xray` reads only the file explicitly provided by the user. Its output
contains item roles, character counts, and estimated tokens. Prompt text is not
copied into the report.

The input file itself may contain sensitive content. Keep it out of Git, delete
it according to your own retention policy, and prefer a temporary directory.

## Lockfile redaction

Before hashing, CtxRay redacts assignment values whose key resembles a token,
secret, password, API key, cookie, credential, authorization value, or private
key. Every value inside an MCP `.env` table is also redacted.

Lockfiles contain relative paths, SHA-256 hashes, byte counts, and whether a
redaction occurred. They do not contain raw file content.

Redaction is defense in depth, not a substitute for secret scanning. Review a
lockfile before publishing it.

## Process safety

CtxRay launches Codex with `shell: false` and passes arguments as an array. The
quota client has a bounded timeout and performs read-only account RPC calls.

## Reporting a vulnerability

Use GitHub private vulnerability reporting when the repository is published.
Do not open a public issue containing credentials, prompt content, account data,
or an exploit that has not been coordinated. See [SECURITY.md](../SECURITY.md).
