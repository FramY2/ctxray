import { createHash, randomUUID } from "node:crypto";

import type { BenchmarkSummary } from "./benchmark.js";

const SAFE_BENCHMARK_ID = /^[A-Za-z0-9._-]+$/;
const BUNDLED_BENCHMARK_IDS = new Set(["2026-08-09-v1", "2026-08-09-v2"]);

export interface BenchmarkReproductionPlan {
  benchmarkId: string;
  community: boolean;
  generatedId: boolean;
  limit: number;
}

export interface BenchmarkReproductionPlanOptions {
  now?: Date;
  entropy?: string;
}

export interface BenchmarkShareReportInput {
  benchmarkId: string;
  generatedAt: string;
  repositoryCommit: string;
  nodeVersion: string;
  codexCliVersion: string;
  operatingSystem: string;
  completedRuns: number;
  expectedRuns: number;
  qualityPasses: number;
  summary: BenchmarkSummary;
}

export interface BenchmarkArtifact {
  name: string;
  content: string;
}

function valueFor(args: string[], name: string): string | undefined {
  const indexes = args.flatMap((argument, index) =>
    argument === name ? [index] : [],
  );
  if (indexes.length > 1) throw new Error(`${name} may be provided only once.`);
  if (indexes.length === 0) return undefined;
  const value = args[indexes[0]! + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value.`);
  }
  return value;
}

function flagCount(args: string[], name: string): number {
  return args.filter((argument) => argument === name).length;
}

function assertKnownArguments(args: string[]): void {
  const valueArguments = new Set(["--id", "--limit"]);
  const flagArguments = new Set(["--community", "--full"]);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (valueArguments.has(argument)) {
      index += 1;
      continue;
    }
    if (flagArguments.has(argument)) continue;
    throw new Error(`Unknown benchmark argument: ${argument}`);
  }
}

function generatedCommunityId(now: Date, entropy: string): string {
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 15);
  const safeEntropy = entropy.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  if (!safeEntropy)
    throw new Error("Benchmark ID entropy must be alphanumeric.");
  return `community-${timestamp}-${safeEntropy}`;
}

export function planBenchmarkReproduction(
  args: string[],
  options: BenchmarkReproductionPlanOptions = {},
): BenchmarkReproductionPlan {
  assertKnownArguments(args);
  const communityCount = flagCount(args, "--community");
  const fullCount = flagCount(args, "--full");
  if (communityCount > 1) {
    throw new Error("--community may be provided only once.");
  }
  if (fullCount > 1) throw new Error("--full may be provided only once.");

  const community = communityCount === 1;
  const full = fullCount === 1;
  const explicitId = valueFor(args, "--id");
  const limitValue = valueFor(args, "--limit");
  if (full && limitValue !== undefined) {
    throw new Error("--full and --limit cannot be combined.");
  }
  if (!community && !explicitId) {
    throw new Error("Pass --id or use --community for a fresh benchmark.");
  }

  const benchmarkId =
    explicitId ??
    generatedCommunityId(
      options.now ?? new Date(),
      options.entropy ?? randomUUID().replaceAll("-", "").slice(0, 8),
    );
  if (
    !SAFE_BENCHMARK_ID.test(benchmarkId) ||
    benchmarkId === "." ||
    benchmarkId === ".."
  ) {
    throw new Error(
      "--id must be filesystem-safe: letters, numbers, dot, underscore, or hyphen only.",
    );
  }
  if (benchmarkId.length > 80) {
    throw new Error("--id must contain at most 80 characters.");
  }
  if (BUNDLED_BENCHMARK_IDS.has(benchmarkId)) {
    throw new Error(
      `${benchmarkId} is a bundled benchmark ID and cannot receive new runs.`,
    );
  }

  let limit = community ? 2 : Number.POSITIVE_INFINITY;
  if (full) limit = Number.POSITIVE_INFINITY;
  if (limitValue !== undefined) {
    if (!/^[1-9]\d*$/.test(limitValue)) {
      throw new Error("--limit must be a positive integer.");
    }
    limit = Number.parseInt(limitValue, 10);
  }

  return {
    benchmarkId,
    community,
    generatedId: explicitId === undefined,
    limit,
  };
}

function percent(value: number | null): string {
  return value === null ? "withheld" : `${value.toFixed(1)}%`;
}

export function renderBenchmarkShareReport(
  input: BenchmarkShareReportInput,
): string {
  return (
    `# CtxRay community reproduction\n\n` +
    `> Independence must be verified by the maintainer. This report records local evidence; it does not certify who ran it.\n\n` +
    `- Benchmark ID: \`${input.benchmarkId}\`\n` +
    `- Generated: ${input.generatedAt}\n` +
    `- Repository commit: \`${input.repositoryCommit}\`\n` +
    `- Environment: ${input.operatingSystem}; Node ${input.nodeVersion}; ${input.codexCliVersion}\n` +
    `- Completed runs: ${input.completedRuns}/${input.expectedRuns}\n` +
    `- Quality passes: ${input.qualityPasses}/${input.completedRuns}\n` +
    `- Comparable quality-passing pairs: ${input.summary.comparablePairs}\n` +
    `- Exact aggregate turn-token reduction: ${percent(input.summary.savingsPercent)}\n` +
    `- Estimated model-visible prompt reduction: ${percent(input.summary.promptSavingsPercent)}\n\n` +
    `Share this file together with \`summary.json\`, \`report.md\`, and \`SHA256SUMS.txt\`. Review every artifact before uploading it. Add the result, including failures, to https://github.com/FramY2/ctxray/issues/1.\n`
  );
}

export function renderBenchmarkChecksums(
  artifacts: BenchmarkArtifact[],
): string {
  return `${[...artifacts]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(
      (artifact) =>
        `${createHash("sha256").update(artifact.content, "utf8").digest("hex")}  ${artifact.name}`,
    )
    .join("\n")}\n`;
}
