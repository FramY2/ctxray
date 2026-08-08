import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { auditCodexSurface } from "../../src/audit.js";
import { cleanupDirectories } from "../support/temp.js";

const created: string[] = [];
afterEach(() => cleanupDirectories(created));

describe("auditCodexSurface", () => {
  it("inventories local context and detects duplicate skill descriptions", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-audit-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    const projectRoot = join(root, "repo");
    const skillA = join(codexHome, "skills", "alpha");
    const skillB = join(codexHome, "skills", "beta");
    await Promise.all([
      mkdir(skillA, { recursive: true }),
      mkdir(skillB, { recursive: true }),
      mkdir(projectRoot, { recursive: true }),
    ]);
    await writeFile(
      join(codexHome, "config.toml"),
      '[mcp_servers.docs]\nurl = "https://example.test/mcp"\n',
    );
    await writeFile(join(projectRoot, "AGENTS.md"), "Keep changes small.\n");
    const skill =
      '---\nname: NAME\ndescription: Inspect local context safely.\n---\n# Skill\n';
    await writeFile(join(skillA, "SKILL.md"), skill.replace("NAME", "alpha"));
    await writeFile(join(skillB, "SKILL.md"), skill.replace("NAME", "beta"));

    const report = await auditCodexSurface({ codexHome, projectRoot });

    expect(report.skills).toHaveLength(2);
    expect(report.sources.some((source) => source.kind === "agents-guidance")).toBe(true);
    expect(report.mcpServers).toEqual(["docs"]);
    expect(report.findings.some((finding) => finding.code === "duplicate-skill-description")).toBe(
      true,
    );
    expect(JSON.stringify(report)).not.toContain("https://example.test/mcp");
  });
});
