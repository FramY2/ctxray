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

## Local-operator trust boundary

CtxRay is a local CLI and library, not a network service. Filesystem roots,
output destinations, and the optional Codex executable are explicit choices of
the person already running CtxRay on that machine. Do not pass remotely supplied
values into these library options without adding an application-specific trust
boundary.

- Child processes use `spawn(command, args, { shell: false })`; prompts,
  profiles, and model names remain separate arguments rather than shell text.
- Profile identifiers and generated filenames use strict allowlists before any
  write under the selected Codex home.
- Audit and lock traversal is bounded, skips dependency/build directories, and
  does not follow directory symlinks.
- Prompt-role aggregation uses a `Map` before producing the report object, so
  names such as `__proto__` are treated as data.

## Automated analysis

GitHub CodeQL runs the extended JavaScript/TypeScript query suite with the
`remote_and_local` threat model on pushes, pull requests, and a weekly schedule.
The initial scan produced one actionable prompt-role property-injection finding,
which was fixed in v0.2.1. Findings tied only to the fake Codex test process are
classified as test-only; executable and root-path findings are reviewed against
the explicit local-operator boundary above rather than silently ignored.

## Reporting a vulnerability

Use GitHub private vulnerability reporting when the repository is published.
Do not open a public issue containing credentials, prompt content, account data,
or an exploit that has not been coordinated. See [SECURITY.md](../SECURITY.md).
