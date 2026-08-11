import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { auditCodexSurface, resolveAuditPath } from "../../src/audit.js";
import { cleanupDirectories } from "../support/temp.js";

const created: string[] = [];
afterEach(() => cleanupDirectories(created));

describe("auditCodexSurface", () => {
  it("resolves redacted audit paths back inside their declared scope", () => {
    const userRoot = join(tmpdir(), "ctxray-scope-user");
    const result = resolveAuditPath("user/.agents/skills/sol/SKILL.md", {
      codexHome: join(userRoot, ".codex"),
      projectRoot: join(userRoot, "repo"),
    });

    expect(result).toBe(join(userRoot, ".agents", "skills", "sol", "SKILL.md"));
    expect(
      resolveAuditPath("project/../../outside", {
        codexHome: join(userRoot, ".codex"),
        projectRoot: join(userRoot, "repo"),
      }),
    ).toBeNull();
  });

  it("reports malformed config and skill metadata without exposing their contents", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-audit-invalid-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    const projectRoot = join(root, "repo");
    const skillRoot = join(codexHome, "skills", "broken");
    await Promise.all([
      mkdir(skillRoot, { recursive: true }),
      mkdir(projectRoot, { recursive: true }),
    ]);
    await writeFile(
      join(codexHome, "config.toml"),
      '[mcp_servers.broken\napi_key = "LEAK-ME"\n',
    );
    await writeFile(
      join(skillRoot, "SKILL.md"),
      "---\nname: broken\ndescription: [unterminated\n---\n# Broken\n",
    );

    const report = await auditCodexSurface({ codexHome, projectRoot });
    const serialized = JSON.stringify(report);

    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["invalid-config", "invalid-skill-metadata"]),
    );
    expect(serialized).not.toContain("LEAK-ME");
    expect(serialized).not.toContain("unterminated");
  });

  it("loads the active project guidance chain from the root to the working directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-audit-guidance-chain-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    const projectRoot = join(root, "repo");
    const workingDirectory = join(projectRoot, "services", "payments");
    await Promise.all([
      mkdir(codexHome, { recursive: true }),
      mkdir(join(projectRoot, ".git"), { recursive: true }),
      mkdir(workingDirectory, { recursive: true }),
      mkdir(join(projectRoot, "unrelated"), { recursive: true }),
    ]);
    await writeFile(join(projectRoot, "AGENTS.md"), "root guidance\n");
    await writeFile(
      join(projectRoot, "services", "AGENTS.md"),
      "versioned service guidance\n",
    );
    await writeFile(
      join(projectRoot, "services", "AGENTS.override.md"),
      "active service guidance\n",
    );
    await writeFile(
      join(projectRoot, "unrelated", "AGENTS.md"),
      "unrelated guidance\n",
    );

    const options = { codexHome, projectRoot, workingDirectory };
    const report = await auditCodexSurface(options);
    const guidance = report.sources.filter(
      (source) => source.kind === "agents-guidance",
    );

    expect(guidance.map((source) => source.path)).toEqual([
      "project/AGENTS.md",
      "project/services/AGENTS.override.md",
    ]);
    expect(JSON.stringify(guidance)).not.toContain("unrelated");
    expect(JSON.stringify(guidance)).not.toContain(
      "versioned service guidance",
    );
  });

  it("honors configured fallback names and the aggregate project guidance byte limit", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-audit-guidance-budget-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    const projectRoot = join(root, "repo");
    const workingDirectory = join(projectRoot, "nested");
    await Promise.all([
      mkdir(codexHome, { recursive: true }),
      mkdir(join(projectRoot, ".git"), { recursive: true }),
      mkdir(workingDirectory, { recursive: true }),
    ]);
    await writeFile(
      join(codexHome, "config.toml"),
      'project_doc_fallback_filenames = ["TEAM.md"]\nproject_doc_max_bytes = 7\n',
    );
    await writeFile(join(projectRoot, "TEAM.md"), "root");
    await writeFile(join(workingDirectory, "AGENTS.md"), "abcdef");

    const options = { codexHome, projectRoot, workingDirectory };
    const report = await auditCodexSurface(options);
    const guidance = report.sources.filter(
      (source) => source.kind === "agents-guidance",
    );

    expect(guidance.map((source) => source.path)).toEqual([
      "project/TEAM.md",
      "project/nested/AGENTS.md",
    ]);
    expect(guidance.map((source) => source.characters)).toEqual([4, 3]);
    expect(guidance.map((source) => source.estimatedTokens)).toEqual([1, 1]);
  });

  it("inventories local context and detects duplicate skill descriptions", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-audit-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    const projectRoot = join(root, "repo");
    const skillA = join(codexHome, "skills", "alpha");
    const skillB = join(codexHome, "skills", "beta");
    const globalAgentSkill = join(root, ".agents", "skills", "gamma");
    const pluginRoot = join(
      codexHome,
      "plugins",
      "cache",
      "community",
      "sample-plugin",
      "0.1.0",
    );
    const oldPluginRoot = join(
      codexHome,
      "plugins",
      "cache",
      "community",
      "sample-plugin",
      "0.0.9",
    );
    const unusedPluginRoot = join(
      codexHome,
      "plugins",
      "cache",
      "community",
      "unused-plugin",
      "1.0.0",
    );
    await Promise.all([
      mkdir(skillA, { recursive: true }),
      mkdir(skillB, { recursive: true }),
      mkdir(globalAgentSkill, { recursive: true }),
      mkdir(join(pluginRoot, ".codex-plugin"), { recursive: true }),
      mkdir(join(pluginRoot, "skills", "plugin-active"), { recursive: true }),
      mkdir(join(oldPluginRoot, ".codex-plugin"), { recursive: true }),
      mkdir(join(oldPluginRoot, "skills", "plugin-old"), { recursive: true }),
      mkdir(join(unusedPluginRoot, ".codex-plugin"), { recursive: true }),
      mkdir(join(unusedPluginRoot, "skills", "plugin-unused"), {
        recursive: true,
      }),
      mkdir(join(projectRoot, ".codex"), { recursive: true }),
      mkdir(join(projectRoot, ".agents", "skills", "alpha-copy"), {
        recursive: true,
      }),
      mkdir(join(projectRoot, "unrelated"), { recursive: true }),
      mkdir(projectRoot, { recursive: true }),
    ]);
    await writeFile(
      join(codexHome, "config.toml"),
      '[mcp_servers.docs]\nurl = "https://example.test/mcp"\n[plugins."sample-plugin@community"]\nenabled = true\n',
    );
    await writeFile(join(projectRoot, "AGENTS.md"), "Keep changes small.\n");
    await writeFile(join(codexHome, "AGENTS.md"), "Use safe defaults.\n");
    await writeFile(
      join(projectRoot, "unrelated", "AGENTS.md"),
      "This directory is not part of the selected context.\n".repeat(100),
    );
    await writeFile(
      join(projectRoot, ".codex", "config.toml"),
      "[mcp_servers.project_docs]\nenabled = true\n",
    );
    await writeFile(
      join(pluginRoot, ".codex-plugin", "plugin.json"),
      JSON.stringify({
        name: "sample-plugin",
        version: "0.1.0",
        skills: "./skills/",
      }),
    );
    await writeFile(
      join(oldPluginRoot, ".codex-plugin", "plugin.json"),
      JSON.stringify({ name: "sample-plugin", version: "0.0.9" }),
    );
    await writeFile(
      join(unusedPluginRoot, ".codex-plugin", "plugin.json"),
      JSON.stringify({ name: "unused-plugin", version: "1.0.0" }),
    );
    const skill =
      "---\nname: NAME\ndescription: Inspect local context safely.\n---\n# Skill\n";
    await writeFile(join(skillA, "SKILL.md"), skill.replace("NAME", "alpha"));
    await writeFile(join(skillB, "SKILL.md"), skill.replace("NAME", "beta"));
    await writeFile(
      join(globalAgentSkill, "SKILL.md"),
      "---\nname: gamma\ndescription: Route bounded work economically.\n---\n",
    );
    await writeFile(
      join(projectRoot, ".agents", "skills", "alpha-copy", "SKILL.md"),
      "---\nname: alpha\ndescription: A different active skill with the same name.\n---\n",
    );
    await writeFile(
      join(pluginRoot, "skills", "plugin-active", "SKILL.md"),
      "---\nname: plugin-active\ndescription: Active plugin skill.\n---\n",
    );
    await writeFile(
      join(oldPluginRoot, "skills", "plugin-old", "SKILL.md"),
      "---\nname: plugin-old\ndescription: Stale plugin skill.\n---\n",
    );
    await writeFile(
      join(unusedPluginRoot, "skills", "plugin-unused", "SKILL.md"),
      "---\nname: plugin-unused\ndescription: Unused plugin skill.\n---\n",
    );

    const report = await auditCodexSurface({ codexHome, projectRoot });

    expect(report.skills).toHaveLength(5);
    expect(report.skills.map((skill) => skill.name)).not.toContain(
      "plugin-old",
    );
    expect(report.skills.map((skill) => skill.name)).not.toContain(
      "plugin-unused",
    );
    expect(report.plugins).toEqual([
      expect.objectContaining({ name: "sample-plugin", version: "0.1.0" }),
    ]);
    expect(
      report.sources.some((source) => source.kind === "agents-guidance"),
    ).toBe(true);
    expect(
      report.sources.filter((source) => source.kind === "agents-guidance"),
    ).toHaveLength(2);
    expect(
      report.sources.some((source) => source.path.includes("unrelated")),
    ).toBe(false);
    expect(
      report.sources.some((source) => source.kind === "project-config"),
    ).toBe(true);
    expect(
      report.sources.find((source) => source.kind === "project-config"),
    ).toMatchObject({ contextRole: "configuration", estimatedTokens: null });
    expect(
      report.sources.find((source) => source.kind === "agents-guidance"),
    ).toMatchObject({ contextRole: "prompt" });
    expect(report.mcpServers).toEqual(["docs", "project_docs"]);
    expect(
      report.findings.some(
        (finding) => finding.code === "duplicate-skill-description",
      ),
    ).toBe(true);
    expect(
      report.findings.some(
        (finding) => finding.code === "duplicate-skill-name",
      ),
    ).toBe(true);
    expect(
      report.findings.some(
        (finding) => finding.code === "unmeasured-mcp-schemas",
      ),
    ).toBe(true);
    expect(JSON.stringify(report)).not.toContain("https://example.test/mcp");
  });
});
