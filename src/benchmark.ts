export interface BenchmarkUsage {
  provenance: "exact" | "estimated" | "unknown";
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
}

export interface BenchmarkRun {
  taskId: string;
  model: string;
  mode: "baseline" | "optimized";
  promptEstimateTokens?: number;
  promptEstimateProvenance?: "estimated" | "unknown";
  qualityPass: boolean;
  usage: BenchmarkUsage | null;
}

export interface BenchmarkModelSummary {
  model: string;
  comparablePairs: number;
  baselineTokens: number;
  optimizedTokens: number;
  savingsPercent: number;
}

export interface BenchmarkSummary {
  comparablePairs: number;
  excludedPairs: number;
  baselineTokens: number;
  optimizedTokens: number;
  savingsPercent: number | null;
  promptBaselineTokens: number | null;
  promptOptimizedTokens: number | null;
  promptSavingsPercent: number | null;
  medianPairSavingsPercent: number | null;
  models: BenchmarkModelSummary[];
}

interface ComparablePair {
  model: string;
  baselineTokens: number;
  optimizedTokens: number;
  promptBaselineTokens: number | null;
  promptOptimizedTokens: number | null;
}

function aggregateTokens(run: BenchmarkRun): number | null {
  if (!run.usage || run.usage.provenance === "unknown") return null;
  return run.usage.inputTokens + run.usage.outputTokens;
}

function savingsPercent(baseline: number, optimized: number): number {
  return baseline === 0 ? 0 : (1 - optimized / baseline) * 100;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[midpoint]!;
  return (sorted[midpoint - 1]! + sorted[midpoint]!) / 2;
}

export function summarizeBenchmarkRuns(
  runs: BenchmarkRun[],
): BenchmarkSummary {
  const groups = new Map<string, BenchmarkRun[]>();
  for (const run of runs) {
    const key = `${run.taskId}\u0000${run.model}`;
    groups.set(key, [...(groups.get(key) ?? []), run]);
  }

  const pairs: ComparablePair[] = [];
  let excludedPairs = 0;
  for (const group of groups.values()) {
    const baseline = group.find((run) => run.mode === "baseline");
    const optimized = group.find((run) => run.mode === "optimized");
    const baselineTokens = baseline ? aggregateTokens(baseline) : null;
    const optimizedTokens = optimized ? aggregateTokens(optimized) : null;
    if (
      !baseline ||
      !optimized ||
      !baseline.qualityPass ||
      !optimized.qualityPass ||
      baselineTokens === null ||
      optimizedTokens === null
    ) {
      excludedPairs += 1;
      continue;
    }
    pairs.push({
      model: baseline.model,
      baselineTokens,
      optimizedTokens,
      promptBaselineTokens:
        baseline.promptEstimateProvenance === "estimated" &&
        typeof baseline.promptEstimateTokens === "number"
          ? baseline.promptEstimateTokens
          : null,
      promptOptimizedTokens:
        optimized.promptEstimateProvenance === "estimated" &&
        typeof optimized.promptEstimateTokens === "number"
          ? optimized.promptEstimateTokens
          : null,
    });
  }

  const baselineTokens = pairs.reduce(
    (total, pair) => total + pair.baselineTokens,
    0,
  );
  const optimizedTokens = pairs.reduce(
    (total, pair) => total + pair.optimizedTokens,
    0,
  );
  const hasCompletePromptEvidence =
    pairs.length > 0 &&
    pairs.every(
      (pair) =>
        pair.promptBaselineTokens !== null &&
        pair.promptOptimizedTokens !== null,
    );
  const promptBaselineTokens = hasCompletePromptEvidence
    ? pairs.reduce((total, pair) => total + pair.promptBaselineTokens!, 0)
    : null;
  const promptOptimizedTokens = hasCompletePromptEvidence
    ? pairs.reduce((total, pair) => total + pair.promptOptimizedTokens!, 0)
    : null;
  const modelNames = [...new Set(pairs.map((pair) => pair.model))].sort();
  const models = modelNames.map((model) => {
    const modelPairs = pairs.filter((pair) => pair.model === model);
    const modelBaseline = modelPairs.reduce(
      (total, pair) => total + pair.baselineTokens,
      0,
    );
    const modelOptimized = modelPairs.reduce(
      (total, pair) => total + pair.optimizedTokens,
      0,
    );
    return {
      model,
      comparablePairs: modelPairs.length,
      baselineTokens: modelBaseline,
      optimizedTokens: modelOptimized,
      savingsPercent: savingsPercent(modelBaseline, modelOptimized),
    };
  });

  return {
    comparablePairs: pairs.length,
    excludedPairs,
    baselineTokens,
    optimizedTokens,
    savingsPercent:
      pairs.length === 0
        ? null
        : savingsPercent(baselineTokens, optimizedTokens),
    promptBaselineTokens,
    promptOptimizedTokens,
    promptSavingsPercent:
      promptBaselineTokens === null || promptOptimizedTokens === null
        ? null
        : savingsPercent(promptBaselineTokens, promptOptimizedTokens),
    medianPairSavingsPercent: median(
      pairs.map((pair) =>
        savingsPercent(pair.baselineTokens, pair.optimizedTokens),
      ),
    ),
    models,
  };
}
