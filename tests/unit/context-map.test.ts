import { describe, expect, it } from "vitest";

import type { AuditReport } from "../../src/audit.js";
import { renderContextMap } from "../../src/context-map.js";

const report: AuditReport = {
  provenance: "estimated",
  sources: [
    {
      kind: "agents-guidance",
      contextRole: "prompt",
      path: 'project/AGENTS.md\"]',
      characters: 4_000,
      estimatedTokens: 1_000,
    },
    {
      kind: "config",
      contextRole: "configuration",
      path: "codex-home/config.toml",
      characters: 800,
      estimatedTokens: null,
    },
  ],
  skills: [
    {
      name: "heavy-review",
      path: "codex-home/skills/heavy-review/SKILL.md",
      descriptionCharacters: 400,
      estimatedDiscoveryTokens: 110,
      scriptCount: 1,
    },
    {
      name: "lean",
      path: "user/.agents/skills/lean/SKILL.md",
      descriptionCharacters: 40,
      estimatedDiscoveryTokens: 11,
      scriptCount: 0,
    },
  ],
  plugins: [
    {
      name: "ctxray",
      version: "0.1.0",
      path: "codex-home/plugins/cache/ctxray",
      skillCount: 1,
    },
  ],
  mcpServers: ["docs"],
  catalogDescriptionCharacters: 440,
  estimatedKnownStartupTokens: 1_121,
  findings: [],
};

describe("renderContextMap", () => {
  it("renders a bounded, metadata-only Mermaid context map", () => {
    const map = renderContextMap(report, { maxSkills: 1, maxSources: 1 });

    expect(map).toContain("flowchart LR");
    expect(map).toContain("~1,121 known startup tokens");
    expect(map).toContain("heavy-review");
    expect(map).toContain("1 more skill");
    expect(map).toContain("1 more source");
    expect(map).toContain("MCP servers: 1");
    expect(map).not.toContain('project/AGENTS.md"]');
    expect(map).not.toContain("C:\\");
  });

  it("rejects unbounded map limits", () => {
    expect(() => renderContextMap(report, { maxSkills: 0 })).toThrow(
      /positive/i,
    );
  });
});
