import { spawn } from "node:child_process";

import { parseExecJsonl, type ExecParseResult } from "./events.js";
import { analyzePromptInput, type XRayReport } from "./xray.js";

export interface RunCodexOptions {
  command?: string;
  commandPrefixArgs?: string[];
  cwd?: string;
  model?: string;
  profile?: string;
  prompt: string;
}

export interface RunCodexResult extends ExecParseResult {
  stderr: string;
  exitCode: number;
}

export interface InspectPromptOptions extends RunCodexOptions {}

export async function inspectPromptInput(
  options: InspectPromptOptions,
): Promise<XRayReport> {
  const command = options.command ?? "codex";
  const args = [...(options.commandPrefixArgs ?? [])];
  if (options.profile) args.push("--profile", options.profile);
  if (options.model) args.push("--model", options.model);
  args.push("debug", "prompt-input", options.prompt);

  return new Promise<XRayReport>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const fail = (error: Error): void => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", fail);
    child.on("close", (code) => {
      if (settled) return;
      if (code !== 0) {
        fail(
          new Error(
            `Codex prompt inspection exited with code ${code ?? "unknown"}. ${stderr.trim()}`.trim(),
          ),
        );
        return;
      }
      try {
        const input = JSON.parse(stdout) as unknown;
        const report = analyzePromptInput(input);
        settled = true;
        resolve(report);
      } catch (error) {
        fail(
          new Error(
            `Codex prompt inspection returned invalid JSON: ${(error as Error).message}`,
          ),
        );
      }
    });
  });
}

export async function runCodex(
  options: RunCodexOptions,
): Promise<RunCodexResult> {
  const command = options.command ?? "codex";
  const args = [...(options.commandPrefixArgs ?? []), "exec", "--json"];
  if (options.profile) args.push("--profile", options.profile);
  if (options.model) args.push("--model", options.model);
  args.push(options.prompt);

  return new Promise<RunCodexResult>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      const exitCode = code ?? 1;
      const parsed = parseExecJsonl(stdout.split(/\r?\n/));
      if (exitCode !== 0) {
        reject(
          new Error(
            `Codex exited with code ${exitCode}. ${stderr.trim()}`.trim(),
          ),
        );
        return;
      }
      resolve({ ...parsed, stderr, exitCode });
    });
  });
}
