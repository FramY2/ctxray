#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

import { Command, Option } from "commander";
import pc from "picocolors";

import {
  queryAccountSnapshot,
  type AccountSnapshot,
} from "./app-server.js";
import { auditCodexSurface } from "./audit.js";
import { loadPriceCatalog } from "./catalog.js";
import { parseExecJsonl } from "./events.js";
import { buildCapabilityLock } from "./lockfile.js";
import { compileProfilesFromFile, installProfile } from "./profile.js";
import {
  calculateReceipt,
  renderReceipt,
  type AuthMode,
} from "./receipt.js";
import { runCodex } from "./runner.js";
import { analyzePromptInput } from "./xray.js";

const program = new Command();
program
  .name("ctxray")
  .description("Local-first context and usage diagnostics for OpenAI Codex")
  .version("0.1.0");

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function codexHome(value?: string): string {
  return resolve(value ?? process.env.CODEX_HOME ?? join(homedir(), ".codex"));
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

program
  .command("run")
  .description("Run `codex exec --json` and optionally append a local receipt")
  .argument("<prompt...>", "Prompt passed to Codex")
  .option("--model <model>", "Model used for the run", "gpt-5.6-terra")
  .option("--profile <name>", "Native Codex profile")
  .option("--receipt", "Append the local receipt after the final answer", false)
  .option(
    "--api-equivalent",
    "Show subscription API equivalent as a comparison, never a charge",
    false,
  )
  .option("--pricing <file>", "Override the bundled dated price catalog")
  .option("--codex-command <path>", "Codex executable", "codex")
  .option(
    "--codex-prefix-arg <arg>",
    "Argument placed before the Codex subcommand; repeatable for adapters/tests",
    collect,
    [],
  )
  .action(async (prompt: string[], options) => {
    const result = await runCodex({
      command: options.codexCommand,
      commandPrefixArgs: options.codexPrefixArg,
      cwd: process.cwd(),
      model: options.model,
      profile: options.profile,
      prompt: prompt.join(" "),
    });
    for (const message of result.messages) process.stdout.write(`${message}\n`);
    for (const warning of result.warnings)
      process.stderr.write(`${pc.yellow("warning:")} ${warning}\n`);
    if (!options.receipt) return;
    if (!result.usage) {
      process.stdout.write("CtxRay receipt · token usage unknown\n");
      return;
    }
    let account: AccountSnapshot = {
      authMode: "unknown" as AuthMode,
      planType: null,
      quota: null,
    };
    try {
      account = await queryAccountSnapshot({
        command: options.codexCommand,
        commandPrefixArgs: options.codexPrefixArg,
      });
    } catch (error) {
      process.stderr.write(
        `${pc.yellow("warning:")} quota unavailable: ${(error as Error).message}\n`,
      );
    }
    const catalog = await loadPriceCatalog(options.pricing);
    const receipt = calculateReceipt({
      authMode: account.authMode,
      catalog,
      includeApiEquivalent: options.apiEquivalent,
      model: options.model,
      planType: account.planType,
      quota: account.quota,
      usage: result.usage,
    });
    process.stdout.write(`${renderReceipt(receipt)}\n`);
  });

program
  .command("receipt")
  .description("Render a receipt from a saved `codex exec --json` stream")
  .argument("<jsonl>", "JSONL file")
  .addOption(
    new Option("--auth <mode>", "Authentication mode")
      .choices(["apikey", "chatgpt", "unknown"])
      .default("unknown"),
  )
  .requiredOption("--model <model>", "Model used for the turn")
  .option("--api-equivalent", "Show comparison dollars for subscriptions", false)
  .option("--pricing <file>", "Override the price catalog")
  .option("--json", "Print structured JSON", false)
  .action(async (path: string, options) => {
    const parsed = parseExecJsonl((await readFile(resolve(path), "utf8")).split(/\r?\n/));
    if (!parsed.usage) throw new Error("No valid turn.completed usage event was found.");
    const receipt = calculateReceipt({
      authMode: options.auth as AuthMode,
      catalog: await loadPriceCatalog(options.pricing),
      includeApiEquivalent: options.apiEquivalent,
      model: options.model,
      usage: parsed.usage,
    });
    options.json ? printJson(receipt) : process.stdout.write(`${renderReceipt(receipt)}\n`);
  });

program
  .command("xray")
  .description("Summarize Codex model-visible prompt JSON without echoing prompt text")
  .argument("<prompt-input.json>", "Output from `codex debug prompt-input`")
  .option("--json", "Print structured JSON", false)
  .action(async (path: string, options) => {
    const report = analyzePromptInput(JSON.parse(await readFile(resolve(path), "utf8")));
    if (options.json) printJson(report);
    else {
      process.stdout.write(
        `Estimated prompt size: ${report.estimatedTokens.toLocaleString("en-US")} tokens (${report.totalCharacters.toLocaleString("en-US")} characters)\n`,
      );
      for (const [role, summary] of Object.entries(report.byRole)) {
        process.stdout.write(
          `- ${role}: ${summary.items} items, ~${summary.estimatedTokens.toLocaleString("en-US")} tokens\n`,
        );
      }
    }
  });

program
  .command("audit")
  .description("Audit Codex config, guidance, skills, agents, and MCP declarations")
  .option("--codex-home <path>", "Codex home directory")
  .option("--project <path>", "Project root", process.cwd())
  .option("--json", "Print structured JSON", false)
  .action(async (options) => {
    const report = await auditCodexSurface({
      codexHome: codexHome(options.codexHome),
      projectRoot: resolve(options.project),
    });
    if (options.json) printJson(report);
    else {
      process.stdout.write(
        `CtxRay audit · ~${report.estimatedStartupTokens.toLocaleString("en-US")} startup tokens · ${report.skills.length} skills · ${report.mcpServers.length} MCP servers\n`,
      );
      for (const finding of report.findings)
        process.stdout.write(`- [${finding.severity}] ${finding.message}\n`);
    }
  });

program
  .command("profile")
  .description("Compile reviewable YAML into native Codex profile files")
  .argument("<policy.yaml>", "CtxRay policy file")
  .option("--out <directory>", "Staging output", ".ctxray/profiles")
  .option("--install", "Install with backup into CODEX_HOME", false)
  .option("--codex-home <path>", "Codex home directory")
  .option("--dry-run", "Print generated TOML without writing", false)
  .action(async (path: string, options) => {
    const home = codexHome(options.codexHome);
    const audit = await auditCodexSurface({ codexHome: home, projectRoot: process.cwd() });
    const skillPaths = Object.fromEntries(
      audit.skills.map((skill) => [skill.name, skill.path.replace(/^codex-home\//, `${home}/`)]),
    );
    const profiles = await compileProfilesFromFile(resolve(path), { skillPaths });
    for (const profile of profiles) {
      if (options.dryRun) {
        process.stdout.write(`# ${profile.fileName}\n${profile.toml}`);
      } else if (options.install) {
        const installed = await installProfile({
          codexHome: home,
          fileName: profile.fileName,
          toml: profile.toml,
        });
        process.stdout.write(`Installed ${installed.destination}\n`);
        if (installed.backupPath)
          process.stdout.write(`Backup ${installed.backupPath}\n`);
      } else {
        const destination = resolve(options.out, profile.fileName);
        await mkdir(dirname(destination), { recursive: true });
        await writeFile(destination, profile.toml, "utf8");
        process.stdout.write(`Staged ${destination}\n`);
      }
      for (const warning of profile.warnings)
        process.stderr.write(`${pc.yellow("warning:")} ${warning}\n`);
    }
  });

program
  .command("lock")
  .description("Write a redacted capability lockfile")
  .option("--codex-home <path>", "Codex home directory")
  .option("--project <path>", "Project root", process.cwd())
  .option("--out <file>", "Output path", "ctxray.lock.json")
  .action(async (options) => {
    const lock = await buildCapabilityLock({
      codexHome: codexHome(options.codexHome),
      projectRoot: resolve(options.project),
    });
    await writeFile(resolve(options.out), `${JSON.stringify(lock, null, 2)}\n`, "utf8");
    process.stdout.write(`Wrote ${resolve(options.out)} (${lock.entries.length} entries)\n`);
  });

program
  .command("quota")
  .description("Read the current Codex plan and quota window through local app-server")
  .option("--codex-command <path>", "Codex executable", "codex")
  .option("--json", "Print structured JSON", false)
  .action(async (options) => {
    const snapshot = await queryAccountSnapshot({ command: options.codexCommand });
    if (options.json) printJson(snapshot);
    else
      process.stdout.write(
        `Plan ${snapshot.planType ?? "unknown"} · quota ${snapshot.quota ? `${snapshot.quota.usedPercent}% used` : "unknown"}\n`,
      );
  });

program
  .command("doctor")
  .description("Check local runtime and Codex executable availability")
  .option("--codex-command <path>", "Codex executable", "codex")
  .action(async (options) => {
    process.stdout.write(`Node ${process.version}: ok\n`);
    await new Promise<void>((resolveDoctor) => {
      const child = spawn(options.codexCommand, ["--version"], {
        shell: false,
        windowsHide: true,
      });
      let output = "";
      child.stdout.on("data", (chunk: Buffer | string) => (output += chunk.toString()));
      child.on("error", (error) => {
        process.stdout.write(`Codex: unavailable (${error.message})\n`);
        resolveDoctor();
      });
      child.on("close", (code) => {
        if (code === 0) process.stdout.write(`Codex ${output.trim()}: ok\n`);
        else process.stdout.write(`Codex: unavailable (exit ${code ?? "unknown"})\n`);
        resolveDoctor();
      });
    });
    const catalog = await loadPriceCatalog();
    process.stdout.write(`Price catalog ${catalog.effectiveDate}: ok\n`);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  process.stderr.write(`${pc.red("error:")} ${(error as Error).message}\n`);
  process.exitCode = 1;
});
