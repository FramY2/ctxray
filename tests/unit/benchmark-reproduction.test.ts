import { describe, expect, it } from "vitest";

import {
  planBenchmarkReproduction,
  renderBenchmarkShareReport,
} from "../../src/benchmark-reproduction.js";

describe("planBenchmarkReproduction", () => {
  it("creates a fresh two-turn community preflight by default", () => {
    const plan = planBenchmarkReproduction(["--community"], {
      now: new Date("2026-08-12T16:45:30.000Z"),
      entropy: "a1b2c3d4",
    });

    expect(plan).toEqual({
      benchmarkId: "community-20260812-164530-a1b2c3d4",
      community: true,
      generatedId: true,
      limit: 2,
    });
  });

  it("resumes an explicit community ledger for the full matrix", () => {
    const plan = planBenchmarkReproduction([
      "--community",
      "--id",
      "community-20260812-164530-a1b2c3d4",
      "--full",
    ]);

    expect(plan).toEqual({
      benchmarkId: "community-20260812-164530-a1b2c3d4",
      community: true,
      generatedId: false,
      limit: Number.POSITIVE_INFINITY,
    });
  });

  it("refuses to append to bundled evidence ledgers", () => {
    expect(() =>
      planBenchmarkReproduction(["--id", "2026-08-09-v1"]),
    ).toThrow(/bundled benchmark ID/i);
  });

  it("requires an explicit ID outside community mode", () => {
    expect(() => planBenchmarkReproduction([])).toThrow(
      /pass --id or use --community/i,
    );
  });

  it("rejects ambiguous or unsafe limits and IDs", () => {
    expect(() =>
      planBenchmarkReproduction(["--community", "--full", "--limit", "2"]),
    ).toThrow(/cannot be combined/i);
    expect(() =>
      planBenchmarkReproduction(["--community", "--limit", "0"]),
    ).toThrow(/positive integer/i);
    expect(() =>
      planBenchmarkReproduction(["--id", "../escape"]),
    ).toThrow(/filesystem-safe/i);
  });
});

describe("renderBenchmarkShareReport", () => {
  it("renders a privacy-bounded report with honest evidence labels", () => {
    const report = renderBenchmarkShareReport({
      benchmarkId: "community-20260812-164530-a1b2c3d4",
      generatedAt: "2026-08-12T16:50:00.000Z",
      repositoryCommit: "abc123",
      nodeVersion: "v24.11.1",
      codexCliVersion: "codex-cli 0.147.0",
      operatingSystem: "win32 10.0.26100 x64",
      completedRuns: 2,
      expectedRuns: 20,
      qualityPasses: 2,
      summary: {
        comparablePairs: 1,
        excludedPairs: 0,
        baselineTokens: 10_000,
        optimizedTokens: 7_000,
        savingsPercent: 30,
        promptBaselineTokens: 4_000,
        promptOptimizedTokens: 1_000,
        promptSavingsPercent: 75,
        medianPairSavingsPercent: 30,
        models: [],
      },
    });

    expect(report).toContain("Independence must be verified by the maintainer");
    expect(report).toContain("2/20");
    expect(report).toContain("Exact aggregate turn-token reduction: 30.0%");
    expect(report).toContain("Estimated model-visible prompt reduction: 75.0%");
    expect(report).toContain("https://github.com/FramY2/ctxray/issues/1");
    expect(report).not.toContain("prompt text");
    expect(report).not.toContain("session transcript");
  });

  it("withholds reductions when there is no comparable quality-passing pair", () => {
    const report = renderBenchmarkShareReport({
      benchmarkId: "community-empty",
      generatedAt: "2026-08-12T16:50:00.000Z",
      repositoryCommit: "abc123",
      nodeVersion: "v24.11.1",
      codexCliVersion: "codex-cli 0.147.0",
      operatingSystem: "linux 6.8 x64",
      completedRuns: 1,
      expectedRuns: 20,
      qualityPasses: 1,
      summary: {
        comparablePairs: 0,
        excludedPairs: 1,
        baselineTokens: 0,
        optimizedTokens: 0,
        savingsPercent: null,
        promptBaselineTokens: null,
        promptOptimizedTokens: null,
        promptSavingsPercent: null,
        medianPairSavingsPercent: null,
        models: [],
      },
    });

    expect(report).toContain("Exact aggregate turn-token reduction: withheld");
    expect(report).toContain("Estimated model-visible prompt reduction: withheld");
  });
});
