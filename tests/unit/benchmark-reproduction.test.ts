import { describe, expect, it } from "vitest";

import {
  renderBenchmarkResumeCommand,
  renderBenchmarkRunProgress,
  scopeBenchmarkTasks,
  planBenchmarkReproduction,
  renderBenchmarkShareReport,
  renderBenchmarkChecksums,
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
    expect(() => planBenchmarkReproduction(["--id", "2026-08-09-v1"])).toThrow(
      /bundled benchmark ID/i,
    );
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
    expect(() => planBenchmarkReproduction(["--id", "../escape"])).toThrow(
      /filesystem-safe/i,
    );
    expect(() => planBenchmarkReproduction(["--id", ".."])).toThrow(
      /filesystem-safe/i,
    );
    expect(() => planBenchmarkReproduction(["--id", "x".repeat(81)])).toThrow(
      /80 characters/i,
    );
  });

  it("accepts any well-formed --task value in the plan function", () => {
    // The plan function validates syntax but does not validate against task IDs.
    // That validation happens in the runner script against tasks.json.
    const plan = planBenchmarkReproduction([
      "--id",
      "test-run",
      "--task",
      "any-valid-id",
    ]);

    expect(plan.taskFilter).toBe("any-valid-id");
  });

  it("accepts a valid --task value alongside --id", () => {
    const plan = planBenchmarkReproduction([
      "--id",
      "task-filter-test",
      "--task",
      "task-1",
    ]);

    expect(plan.taskFilter).toBe("task-1");
    expect(plan.benchmarkId).toBe("task-filter-test");
  });

  it("rejects unsafe --task values", () => {
    expect(() =>
      planBenchmarkReproduction(["--id", "test", "--task", "../escape"]),
    ).toThrow(/filesystem-safe/i);
    expect(() =>
      planBenchmarkReproduction(["--id", "test", "--task", ".."]),
    ).toThrow(/filesystem-safe/i);
    expect(() =>
      planBenchmarkReproduction(["--id", "test", "--task", "x".repeat(81)]),
    ).toThrow(/80 characters/i);
  });

  it("does not set taskFilter when --task is omitted", () => {
    const plan = planBenchmarkReproduction(["--id", "no-filter"]);

    expect("taskFilter" in plan).toBe(false);
  });
});

describe("scopeBenchmarkTasks", () => {
  const tasks = [{ id: "task-a" }, { id: "task-b" }];

  it("selects one known task and derives a two-run denominator", () => {
    expect(scopeBenchmarkTasks(tasks, [], "task-b")).toEqual({
      tasks: [{ id: "task-b" }],
      expectedRuns: 2,
    });
  });

  it("rejects an unknown task before any benchmark turn starts", () => {
    expect(() => scopeBenchmarkTasks(tasks, [], "missing")).toThrow(
      /known tasks: task-a, task-b/i,
    );
  });

  it("refuses to mix a filtered run with an unrelated existing ledger", () => {
    expect(() =>
      scopeBenchmarkTasks(tasks, [{ taskId: "task-a" }], "task-b"),
    ).toThrow(/already contains runs for: task-a/i);
  });

  it("allows a filtered run to resume its own existing ledger", () => {
    expect(
      scopeBenchmarkTasks(tasks, [{ taskId: "task-b" }], "task-b"),
    ).toEqual({ tasks: [{ id: "task-b" }], expectedRuns: 2 });
  });
});

describe("filtered benchmark output", () => {
  it("uses the selected-task denominator in progress output", () => {
    expect(
      renderBenchmarkRunProgress(0, 2, "task-a", "gpt-5.6-luna", "baseline"),
    ).toBe("[1/2] task-a · gpt-5.6-luna · baseline");
  });

  it("preserves --task in the resume command", () => {
    expect(renderBenchmarkResumeCommand("community-123", "task-a")).toBe(
      "npm run benchmark:reproduce -- --id community-123 --task task-a --full",
    );
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
    expect(report).toContain("https://github.com/FramY2/ctxwise/issues/1");
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
    expect(report).toContain(
      "Estimated model-visible prompt reduction: withheld",
    );
  });
});

describe("renderBenchmarkChecksums", () => {
  it("sorts artifact names and hashes their exact UTF-8 contents", () => {
    const checksums = renderBenchmarkChecksums([
      { name: "summary.json", content: "{}\n" },
      { name: "runs.jsonl", content: "hello" },
    ]);

    expect(checksums).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824  runs.jsonl\n" +
        "ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356  summary.json\n",
    );
  });
});
