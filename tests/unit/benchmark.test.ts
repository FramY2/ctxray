import { describe, expect, it } from "vitest";

import {
  summarizeBenchmarkRuns,
  type BenchmarkRun,
} from "../../src/benchmark.js";

function run(
  taskId: string,
  model: string,
  mode: "baseline" | "optimized",
  inputTokens: number,
  outputTokens: number,
  qualityPass = true,
  promptEstimateTokens = mode === "baseline" ? 400 : 200,
): BenchmarkRun {
  return {
    taskId,
    model,
    mode,
    promptEstimateTokens,
    promptEstimateProvenance: "estimated",
    qualityPass,
    usage: {
      provenance: "exact",
      inputTokens,
      cachedInputTokens: 0,
      outputTokens,
      reasoningOutputTokens: 0,
    },
  };
}

describe("summarizeBenchmarkRuns", () => {
  it("reports savings only for same-task, same-model quality-passing pairs", () => {
    const summary = summarizeBenchmarkRuns([
      run("a", "gpt-5.6-luna", "baseline", 1_000, 10),
      run("a", "gpt-5.6-luna", "optimized", 600, 10),
      run("b", "gpt-5.6-sol", "baseline", 1_000, 10),
      run("b", "gpt-5.6-sol", "optimized", 600, 10),
    ]);

    expect(summary.comparablePairs).toBe(2);
    expect(summary.baselineTokens).toBe(2_020);
    expect(summary.optimizedTokens).toBe(1_220);
    expect(summary.savingsPercent).toBeCloseTo(39.6, 1);
    expect(summary.promptBaselineTokens).toBe(800);
    expect(summary.promptOptimizedTokens).toBe(400);
    expect(summary.promptSavingsPercent).toBe(50);
    expect(summary.models).toHaveLength(2);
  });

  it("withholds a savings claim when either side fails quality", () => {
    const summary = summarizeBenchmarkRuns([
      run("a", "gpt-5.6-luna", "baseline", 1_000, 10),
      run("a", "gpt-5.6-luna", "optimized", 100, 10, false),
    ]);

    expect(summary.comparablePairs).toBe(0);
    expect(summary.excludedPairs).toBe(1);
    expect(summary.savingsPercent).toBeNull();
    expect(summary.promptSavingsPercent).toBeNull();
  });
});
