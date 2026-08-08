import { spawn } from "node:child_process";

import { parseExecJsonl, type ExecParseResult } from "./events.js";

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

export async function runCodex(options: RunCodexOptions): Promise<RunCodexResult> {
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
