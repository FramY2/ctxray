import { spawn } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { arch, platform, release } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

import { stringify as stringifyYaml } from "yaml";

import { auditCodexSurface, resolveAuditPath } from "../dist/audit.js";
import { summarizeBenchmarkRuns } from "../dist/benchmark.js";
import {
  planBenchmarkReproduction,
  renderBenchmarkChecksums,
  renderBenchmarkShareReport,
} from "../dist/benchmark-reproduction.js";
import { resolveCodexInvocation } from "../dist/codex-command.js";
import { parseExecJsonl } from "../dist/events.js";
import { compileProfiles, installProfile } from "../dist/profile.js";
import { inspectPromptInput } from "../dist/runner.js";

const reproductionPlan = planBenchmarkReproduction(process.argv.slice(2));
const { benchmarkId, limit } = reproductionPlan;
const root = resolve(import.meta.dirname, "..");
const codexHome = resolve(process.env.CODEX_HOME ?? join(homedir(), ".codex"));
const resultsDirectory = join(root, "benchmarks", "results", benchmarkId);
const runsPath = join(resultsDirectory, "runs.jsonl");
const summaryPath = join(resultsDirectory, "summary.json");
const reportPath = join(resultsDirectory, "report.md");
const sharePath = join(resultsDirectory, "share.md");
const checksumsPath = join(resultsDirectory, "SHA256SUMS.txt");
const tasks = JSON.parse(
  await readFile(join(root, "benchmarks", "tasks.json"), "utf8"),
);
function profileSlug(model) {
  return model.replace(/^gpt-5\.6-/, "").replace(/[^a-z0-9_-]/gi, "-");
}

function effortFor(model) {
  return model.endsWith("luna") ? "low" : "medium";
}

function profileName(model, mode) {
  return `ctxray-bench-${profileSlug(model)}-${mode}`;
}

async function capture(command, args) {
  return new Promise((resolveCapture, rejectCapture) => {
    const child = spawn(command, args, {
      cwd: root,
      shell: false,
      windowsHide: true,
    });
    let output = "";
    let errorOutput = "";
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.stderr.on("data", (chunk) => (errorOutput += chunk.toString()));
    child.on("error", rejectCapture);
    child.on("close", (code) =>
      code === 0
        ? resolveCapture(output.trim())
        : rejectCapture(
            new Error(
              `${command} exited with ${code ?? "unknown"}: ${errorOutput.trim()}`,
            ),
          ),
    );
  });
}

function benchmarkPrompt(task) {
  return [
    "You are participating in a reproducible Codex context microbenchmark.",
    "Return one JSON object with exactly one string property named answer.",
    "Do not add Markdown, explanations, or additional properties.",
    `Task: ${task.prompt}`,
  ].join("\n");
}

function extractAnswer(message) {
  const stripped = message
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const candidates = [stripped, stripped.match(/\{[\s\S]*\}/)?.[0]].filter(
    Boolean,
  );
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.answer === "string"
      ) {
        return parsed.answer;
      }
    } catch {
      // Try the next bounded representation.
    }
  }
  return null;
}

async function runEphemeralCodex(invocation, profile, prompt) {
  const args = [
    ...invocation.prefixArgs,
    "exec",
    "--json",
    "--ephemeral",
    "--color",
    "never",
    "--sandbox",
    "read-only",
    "--profile",
    profile,
    prompt,
  ];
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(invocation.command, args, {
      cwd: root,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      rejectRun(new Error("Codex benchmark turn timed out after 180 seconds."));
    }, 180_000);
    child.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      rejectRun(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        rejectRun(
          new Error(
            `Codex benchmark turn exited with ${code ?? "unknown"}: ${stderr.trim()}`,
          ),
        );
        return;
      }
      resolveRun(parseExecJsonl(stdout.split(/\r?\n/)));
    });
  });
}

async function readExistingRuns() {
  try {
    return (await readFile(runsPath, "utf8"))
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function markdownReport(payload) {
  const rows = payload.summary.models
    .map(
      (model) =>
        `| ${model.model} | ${model.comparablePairs} | ${model.baselineTokens.toLocaleString("en-US")} | ${model.optimizedTokens.toLocaleString("en-US")} | ${model.savingsPercent.toFixed(1)}% |`,
    )
    .join("\n");
  const qualityPasses = payload.runs.filter((run) => run.qualityPass).length;
  return (
    `# CtxRay live benchmark ${payload.benchmarkId}\n\n` +
    `Executed with Codex CLI ${payload.codexCliVersion}. Requested models are recorded; the runtime event stream does not independently attest the served model, so actual model is marked unknown.\n\n` +
    `## Result\n\n` +
    `- Completed runs: ${payload.runs.length}/20\n` +
    `- Quality passes: ${qualityPasses}/${payload.runs.length}\n` +
    `- Comparable quality-passing pairs: ${payload.summary.comparablePairs}/10\n` +
    `- Estimated model-visible prompt reduction: ${payload.summary.promptSavingsPercent === null ? "withheld" : `${payload.summary.promptSavingsPercent.toFixed(1)}%`}\n` +
    `- Exact aggregate turn-token reduction: ${payload.summary.savingsPercent === null ? "withheld" : `${payload.summary.savingsPercent.toFixed(1)}%`}\n` +
    `- Median paired aggregate-token reduction: ${payload.summary.medianPairSavingsPercent === null ? "withheld" : `${payload.summary.medianPairSavingsPercent.toFixed(1)}%`}\n\n` +
    `| Requested model | Pairs | Baseline tokens | Optimized tokens | Reduction |\n` +
    `|---|---:|---:|---:|---:|\n${rows || "| incomplete | 0 | 0 | 0 | withheld |"}\n\n` +
    `## Method\n\n` +
    `Ten fixed tasks are paired by task and requested model. Within every pair, baseline and optimized runs use the same prompt, model, effort, sandbox, repository commit, and answer validator. The optimized profile disables ${payload.audit.disabledSkills} discovered skills and ${payload.audit.disabledMcp} MCP servers for these bounded tasks. Order alternates to reduce order bias. Runs are ephemeral.\n\n` +
    `Prompt size is a CtxRay character-based estimate from \`codex debug prompt-input\`; aggregate turn usage comes exactly from \`turn.completed\`. Cached input is a subset of input and is not double-counted. A pair is excluded from every savings claim if either answer fails.\n\n` +
    `## Limits\n\n` +
    `This is a transparent microbenchmark, not a universal productivity claim. The sample per model is small, tasks are intentionally bounded, prompt estimates are tokenizer approximations, and ChatGPT quota units cannot be converted into exact dollars. Repeat on larger real repositories before making broad claims.\n`
  );
}

await mkdir(dirname(resultsDirectory), { recursive: true });
await mkdir(resultsDirectory, { recursive: !reproductionPlan.generatedId });
if (reproductionPlan.community) {
  process.stdout.write(
    `CtxRay community reproduction ${benchmarkId}\n` +
      `This preflight may start up to ${Number.isFinite(limit) ? limit : 20} Codex turns and consume account quota.\n`,
  );
}
const invocation = await resolveCodexInvocation("codex");
const repositoryCommit = await capture("git", ["rev-parse", "HEAD"]);
const audit = await auditCodexSurface({ codexHome, projectRoot: root });
const pathCandidates = new Map();
for (const skill of audit.skills) {
  const absolutePath = resolveAuditPath(skill.path, {
    codexHome,
    projectRoot: root,
  });
  if (!absolutePath) continue;
  const candidates = pathCandidates.get(skill.name) ?? new Set();
  candidates.add(absolutePath);
  pathCandidates.set(skill.name, candidates);
}
const skillPaths = Object.fromEntries(
  [...pathCandidates]
    .filter(([, candidates]) => candidates.size === 1)
    .map(([name, candidates]) => [name, [...candidates][0]]),
);
const disabledSkills = Object.keys(skillPaths).sort();
const models = [...new Set(tasks.map((task) => task.model))].sort();
const profiles = {};
for (const model of models) {
  profiles[profileName(model, "baseline")] = {
    model,
    reasoningEffort: effortFor(model),
    approvalPolicy: "never",
    sandboxMode: "read-only",
  };
  profiles[profileName(model, "optimized")] = {
    model,
    reasoningEffort: effortFor(model),
    approvalPolicy: "never",
    sandboxMode: "read-only",
    disableSkills: disabledSkills,
    disableMcp: audit.mcpServers,
  };
}
const compiledProfiles = compileProfiles(
  stringifyYaml({ version: 1, profiles }),
  { skillPaths },
);
for (const profile of compiledProfiles) {
  const destination = join(codexHome, profile.fileName);
  let current = null;
  try {
    current = await readFile(destination, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (current !== profile.toml) {
    await installProfile({
      codexHome,
      fileName: profile.fileName,
      toml: profile.toml,
    });
  }
}

const versionResult = await new Promise((resolveVersion, rejectVersion) => {
  const child = spawn(
    invocation.command,
    [...invocation.prefixArgs, "--version"],
    { shell: false, windowsHide: true },
  );
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk.toString()));
  child.on("error", rejectVersion);
  child.on("close", (code) =>
    code === 0
      ? resolveVersion(output.trim())
      : rejectVersion(new Error(`Codex --version exited with ${code}.`)),
  );
});
const existingRuns = await readExistingRuns();
const completedKeys = new Set(
  existingRuns.map((run) => `${run.taskId}\u0000${run.model}\u0000${run.mode}`),
);
let executed = 0;
for (const [index, task] of tasks.entries()) {
  const modes =
    index % 2 === 0 ? ["baseline", "optimized"] : ["optimized", "baseline"];
  for (const mode of modes) {
    if (executed >= limit) break;
    const key = `${task.id}\u0000${task.model}\u0000${mode}`;
    if (completedKeys.has(key)) continue;
    const prompt = benchmarkPrompt(task);
    const profile = profileName(task.model, mode);
    process.stdout.write(
      `[${existingRuns.length + 1}/20] ${task.id} · ${task.model} · ${mode}\n`,
    );
    const promptReport = await inspectPromptInput({
      command: invocation.command,
      commandPrefixArgs: invocation.prefixArgs,
      cwd: root,
      profile,
      prompt,
    });
    const startedAt = Date.now();
    const result = await runEphemeralCodex(invocation, profile, prompt);
    const message = result.messages.at(-1) ?? "";
    const answer = extractAnswer(message);
    const record = {
      benchmarkId,
      repositoryCommit,
      taskId: task.id,
      category: task.category,
      model: task.model,
      actualModel: null,
      effort: effortFor(task.model),
      mode,
      profile,
      expected: task.expected,
      answer,
      qualityPass: answer === task.expected,
      promptEstimateTokens: promptReport.estimatedTokens,
      promptEstimateProvenance: "estimated",
      usage: result.usage,
      usageWarnings: result.warnings,
      elapsedMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
    await appendFile(runsPath, `${JSON.stringify(record)}\n`, "utf8");
    existingRuns.push(record);
    completedKeys.add(key);
    executed += 1;
    process.stdout.write(
      `  quality=${record.qualityPass ? "pass" : "FAIL"} input=${record.usage?.inputTokens ?? "unknown"} prompt≈${record.promptEstimateTokens}\n`,
    );
  }
  if (executed >= limit) break;
}
const summary = summarizeBenchmarkRuns(existingRuns);
const generatedAt = new Date().toISOString();
const payload = {
  benchmarkId,
  generatedAt,
  repositoryCommits: [
    ...new Set(existingRuns.map((run) => run.repositoryCommit).filter(Boolean)),
  ],
  codexCliVersion: versionResult,
  routing: {
    mode: "local",
    reason:
      "The live environment, profile installation, measurements, and demo are tightly coupled; delegation did not pass the 25% token-saving gate.",
    requestedModels: models,
    actualModels: "unknown; CLI profile selection is recorded",
  },
  audit: {
    discoveredSkills: audit.skills.length,
    discoveredPlugins: audit.plugins.length,
    discoveredMcp: audit.mcpServers.length,
    disabledSkills: disabledSkills.length,
    disabledMcp: audit.mcpServers.length,
  },
  summary,
  runs: existingRuns,
};
const summaryContent = `${JSON.stringify(payload, null, 2)}\n`;
const reportContent = markdownReport(payload);
await writeFile(summaryPath, summaryContent, "utf8");
await writeFile(reportPath, reportContent, "utf8");
const checksumArtifacts = [
  { name: "runs.jsonl", content: await readFile(runsPath, "utf8") },
  { name: "summary.json", content: summaryContent },
  { name: "report.md", content: reportContent },
];
if (reproductionPlan.community) {
  const shareReport = renderBenchmarkShareReport({
    benchmarkId,
    generatedAt,
    repositoryCommit,
    nodeVersion: process.version,
    codexCliVersion: versionResult,
    operatingSystem: `${platform()} ${release()} ${arch()}`,
    completedRuns: existingRuns.length,
    expectedRuns: tasks.length * 2,
    qualityPasses: existingRuns.filter((run) => run.qualityPass).length,
    summary,
  });
  await writeFile(sharePath, shareReport, "utf8");
  checksumArtifacts.push({ name: "share.md", content: shareReport });
  process.stdout.write(`Wrote ${sharePath}\n`);
  if (existingRuns.length < tasks.length * 2) {
    process.stdout.write(
      `Continue this ledger with: npm run benchmark:reproduce -- --id ${benchmarkId} --full\n`,
    );
  }
  process.stdout.write(
    "Report the result, including failures: https://github.com/FramY2/ctxray/issues/1\n",
  );
}
await writeFile(
  checksumsPath,
  renderBenchmarkChecksums(checksumArtifacts),
  "utf8",
);
process.stdout.write(`Wrote ${checksumsPath}\n`);
process.stdout.write(`Wrote ${summaryPath}\nWrote ${reportPath}\n`);
