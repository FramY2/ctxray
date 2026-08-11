import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

import type { AuthMode, QuotaSnapshot } from "./receipt.js";

export interface AccountSnapshot {
  authMode: AuthMode;
  planType: string | null;
  quota: QuotaSnapshot | null;
}

export interface AccountQueryOptions {
  command?: string;
  commandPrefixArgs?: string[];
  timeoutMs?: number;
}

function normalizeAuthMode(account: Record<string, unknown> | null): AuthMode {
  const type = account?.type;
  if (type === "apiKey" || type === "apikey") return "apikey";
  if (type === "chatgpt" || type === "chatgptAuthTokens") return "chatgpt";
  return "unknown";
}

function quotaFromResult(value: unknown): QuotaSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const result = value as Record<string, unknown>;
  const limits = result.rateLimits;
  if (!limits || typeof limits !== "object") return null;
  const primary = (limits as Record<string, unknown>).primary;
  if (!primary || typeof primary !== "object") return null;
  const window = primary as Record<string, unknown>;
  if (
    typeof window.usedPercent !== "number" ||
    !Number.isFinite(window.usedPercent)
  )
    return null;
  return {
    usedPercent: window.usedPercent,
    windowDurationMins:
      typeof window.windowDurationMins === "number"
        ? window.windowDurationMins
        : null,
    resetsAt: typeof window.resetsAt === "number" ? window.resetsAt : null,
    provenance: "exact",
  };
}

export async function queryAccountSnapshot(
  options: AccountQueryOptions = {},
): Promise<AccountSnapshot> {
  const command = options.command ?? "codex";
  const args = [
    ...(options.commandPrefixArgs ?? []),
    "app-server",
    "--listen",
    "stdio://",
  ];
  const timeoutMs = options.timeoutMs ?? 4_000;

  return new Promise<AccountSnapshot>((resolve, reject) => {
    const child = spawn(command, args, {
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let accountResult: Record<string, unknown> | null = null;
    let rateResult: unknown = null;
    let stderr = "";
    let settled = false;

    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      lines.close();
      child.kill();
      if (error) {
        reject(error);
        return;
      }
      const account =
        accountResult?.account && typeof accountResult.account === "object"
          ? (accountResult.account as Record<string, unknown>)
          : null;
      resolve({
        authMode: normalizeAuthMode(account),
        planType:
          account && typeof account.planType === "string"
            ? account.planType
            : null,
        quota: quotaFromResult(rateResult),
      });
    };

    const timer = setTimeout(
      () =>
        finish(
          new Error(`Codex account query timed out after ${timeoutMs} ms.`),
        ),
      timeoutMs,
    );
    const lines = createInterface({ input: child.stdout });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => finish(error));
    child.on("exit", (code) => {
      if (!settled && (accountResult === null || rateResult === null)) {
        finish(
          new Error(
            `Codex app-server exited before returning account data (exit ${code ?? "unknown"}). ${stderr.trim()}`.trim(),
          ),
        );
      }
    });
    lines.on("line", (line) => {
      let message: Record<string, unknown>;
      try {
        message = JSON.parse(line) as Record<string, unknown>;
      } catch {
        return;
      }
      if (
        message.id === 2 &&
        message.result &&
        typeof message.result === "object"
      ) {
        accountResult = message.result as Record<string, unknown>;
      }
      if (
        message.id === 3 &&
        message.result &&
        typeof message.result === "object"
      ) {
        rateResult = message.result;
      }
      if (accountResult !== null && rateResult !== null) finish();
    });

    const send = (message: unknown): void => {
      child.stdin.write(`${JSON.stringify(message)}\n`);
    };
    send({
      method: "initialize",
      id: 1,
      params: {
        clientInfo: { name: "ctxray", title: "CtxRay", version: "0.2.2" },
      },
    });
    send({ method: "initialized", params: {} });
    send({ method: "account/read", id: 2, params: { refreshToken: false } });
    send({ method: "account/rateLimits/read", id: 3, params: {} });
  });
}
