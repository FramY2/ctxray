import { access } from "node:fs/promises";
import { delimiter, join } from "node:path";
import process from "node:process";

export interface CodexInvocation {
  command: string;
  prefixArgs: string[];
  source: "explicit" | "npm-launcher" | "path";
}

interface ResolveCodexOptions {
  env?: Record<string, string | undefined>;
  fileExists?: (path: string) => Promise<boolean>;
  nodeExecutable?: string;
  platform?: NodeJS.Platform;
}

async function defaultFileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function npmLauncherCandidates(
  env: Record<string, string | undefined>,
): string[] {
  const roots = new Set<string>();
  if (env.APPDATA) roots.add(join(env.APPDATA, "npm"));
  if (env.npm_config_prefix) roots.add(env.npm_config_prefix);
  for (const entry of (env.PATH ?? "").split(delimiter)) {
    if (entry.trim()) roots.add(entry.trim());
  }
  return [...roots].map((root) =>
    join(root, "node_modules", "@openai", "codex", "bin", "codex.js"),
  );
}

export async function resolveCodexInvocation(
  requestedCommand = "codex",
  options: ResolveCodexOptions = {},
): Promise<CodexInvocation> {
  if (requestedCommand !== "codex") {
    return {
      command: requestedCommand,
      prefixArgs: [],
      source: "explicit",
    };
  }

  const env = options.env ?? process.env;
  const configured = env.CTXRAY_CODEX_BIN;
  if (configured) {
    return { command: configured, prefixArgs: [], source: "explicit" };
  }

  if ((options.platform ?? process.platform) === "win32") {
    const fileExists = options.fileExists ?? defaultFileExists;
    for (const launcher of npmLauncherCandidates(env)) {
      if (await fileExists(launcher)) {
        return {
          command: options.nodeExecutable ?? process.execPath,
          prefixArgs: [launcher],
          source: "npm-launcher",
        };
      }
    }
  }

  return { command: requestedCommand, prefixArgs: [], source: "path" };
}
