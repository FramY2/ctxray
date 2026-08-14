import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { compileProfiles, installProfile } from "../../src/profile.js";
import { cleanupDirectories } from "../support/temp.js";

const created: string[] = [];
afterEach(() => cleanupDirectories(created));

const policy = `
version: 1
profiles:
  lean:
    model: gpt-5.6-luna
    reasoningEffort: low
    approvalPolicy: on-request
    sandboxMode: workspace-write
    agents:
      maxThreads: 2
      defaultModel: gpt-5.6-luna
      defaultEffort: low
    disableSkills:
      - heavy-review
    disableMcp:
      - browser
`;

describe("profile compiler", () => {
  it("compiles deterministic native Codex profile TOML", () => {
    const result = compileProfiles(policy, {
      skillPaths: {
        "heavy-review": "/home/test/.codex/skills/heavy-review/SKILL.md",
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.fileName).toBe("lean.config.toml");
    expect(result[0]?.toml).toContain('model = "gpt-5.6-luna"');
    expect(result[0]?.toml).toContain("max_concurrent_threads_per_session = 2");
    expect(result[0]?.toml).toContain(
      'path = "/home/test/.codex/skills/heavy-review/SKILL.md"',
    );
    expect(result[0]?.toml).toContain("[mcp_servers.browser]");
  });

  it("backs up an existing profile before install", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxwise-profile-"));
    created.push(root);
    await mkdir(root, { recursive: true });
    const destination = join(root, "lean.config.toml");
    await writeFile(destination, 'model = "old"\n');

    const result = await installProfile({
      codexHome: root,
      fileName: "lean.config.toml",
      toml: 'model = "new"\n',
      now: new Date("2026-08-08T12:00:00Z"),
    });

    expect(result.backupPath).not.toBeNull();
    expect(await readFile(destination, "utf8")).toBe('model = "new"\n');
    expect(await readFile(result.backupPath!, "utf8")).toBe('model = "old"\n');
  });

  it("rejects unknown profile fields instead of silently ignoring them", () => {
    expect(() => compileProfiles(`${policy}\n    magicMode: true\n`)).toThrow(
      /magicMode/,
    );
  });

  it("warns and skips an unresolved skill while compiling a minimal profile", () => {
    const result = compileProfiles(`
version: 1
profiles:
  minimal:
    model: custom-model
    disableSkills: [missing]
`);

    expect(result[0]?.warnings[0]).toMatch(/not resolved/);
    expect(result[0]?.toml).not.toContain("skills.config");
  });

  it("installs a new profile without creating a fictional backup", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxwise-profile-new-"));
    created.push(root);

    const result = await installProfile({
      codexHome: root,
      fileName: "new_profile.config.toml",
      toml: 'model = "gpt-5.6-terra"\n',
    });

    expect(result.backupPath).toBeNull();
    expect(await readFile(result.destination, "utf8")).toContain(
      "gpt-5.6-terra",
    );
  });

  it("rejects profile traversal names", async () => {
    await expect(
      installProfile({
        codexHome: "ignored",
        fileName: "../escape.config.toml",
        toml: "",
      }),
    ).rejects.toThrow(/unsafe/i);
  });

  it("supports current Codex reasoning efforts and rejects invalid safety policy values", () => {
    const result = compileProfiles(`
version: 1
profiles:
  deep:
    model: gpt-5.6-sol
    reasoningEffort: ultra
    approvalPolicy: never
    sandboxMode: read-only
    agents:
      defaultEffort: minimal
`);

    expect(result[0]?.toml).toContain('model_reasoning_effort = "ultra"');
    expect(result[0]?.toml).toContain(
      'default_subagent_reasoning_effort = "minimal"',
    );
    expect(() =>
      compileProfiles(`
version: 1
profiles:
  unsafe:
    model: gpt-5.6-sol
    approvalPolicy: always-trust
    sandboxMode: entire-machine
`),
    ).toThrow();
  });
});
