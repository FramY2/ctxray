import { describe, expect, it } from "vitest";

import {
  compareCapabilityLocks,
  parseCapabilityLock,
} from "../../src/drift.js";
import type { CapabilityLock } from "../../src/lockfile.js";

function lock(
  generatedAt: string,
  entries: CapabilityLock["entries"],
): CapabilityLock {
  return {
    schemaVersion: 1,
    generator: { name: "ctxray", version: "0.1.0" },
    generatedAt,
    provenance: "local-files",
    entries,
  };
}

describe("compareCapabilityLocks", () => {
  it("ignores timestamp-only differences", () => {
    const entries: CapabilityLock["entries"] = [
      {
        scope: "project",
        path: "AGENTS.md",
        sha256: "a".repeat(64),
        bytes: 120,
        redacted: false,
      },
    ];

    const report = compareCapabilityLocks(
      lock("2026-08-08T10:00:00.000Z", entries),
      lock("2026-08-09T10:00:00.000Z", entries),
    );

    expect(report.status).toBe("clean");
    expect(report.summary).toEqual({
      added: 0,
      removed: 0,
      changed: 0,
      total: 0,
      bytesDelta: 0,
    });
    expect(report.changes).toEqual([]);
  });

  it("reports added, removed, and changed context files deterministically", () => {
    const baseline = lock("2026-08-08T10:00:00.000Z", [
      {
        scope: "codex-home",
        path: "config.toml",
        sha256: "a".repeat(64),
        bytes: 100,
        redacted: true,
      },
      {
        scope: "project",
        path: ".codex/old.md",
        sha256: "b".repeat(64),
        bytes: 50,
        redacted: false,
      },
    ]);
    const current = lock("2026-08-09T10:00:00.000Z", [
      {
        scope: "codex-home",
        path: "config.toml",
        sha256: "c".repeat(64),
        bytes: 125,
        redacted: true,
      },
      {
        scope: "project",
        path: ".codex/new.md",
        sha256: "d".repeat(64),
        bytes: 80,
        redacted: false,
      },
    ]);

    const report = compareCapabilityLocks(baseline, current);

    expect(report.status).toBe("drifted");
    expect(report.summary).toEqual({
      added: 1,
      removed: 1,
      changed: 1,
      total: 3,
      bytesDelta: 55,
    });
    expect(
      report.changes.map(({ change, scope, path }) => ({
        change,
        scope,
        path,
      })),
    ).toEqual([
      { change: "changed", scope: "codex-home", path: "config.toml" },
      { change: "added", scope: "project", path: ".codex/new.md" },
      { change: "removed", scope: "project", path: ".codex/old.md" },
    ]);
  });
});

describe("parseCapabilityLock", () => {
  it("rejects malformed or unsupported lockfiles", () => {
    expect(() =>
      parseCapabilityLock({ schemaVersion: 2, entries: [] }),
    ).toThrow(/valid CtxRay capability lockfile/i);
  });

  it("rejects duplicate scope and path identities", () => {
    const duplicate = {
      scope: "project" as const,
      path: "AGENTS.md",
      sha256: "a".repeat(64),
      bytes: 120,
      redacted: false,
    };

    expect(() =>
      parseCapabilityLock(
        lock("2026-08-09T10:00:00.000Z", [duplicate, duplicate]),
      ),
    ).toThrow(/duplicate entry/i);
  });
});
