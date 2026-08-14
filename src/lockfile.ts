import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

import {
  discoverProjectGuidance,
  guidanceCandidateFilenames,
  readEffectiveGuidanceConfig,
} from "./guidance.js";

export interface CapabilityLockEntry {
  scope: "codex-home" | "project";
  path: string;
  sha256: string;
  bytes: number;
  redacted: boolean;
}

export interface CapabilityLock {
  schemaVersion: 1;
  generator: { name: "ctxwise" | "ctxray"; version: string };
  generatedAt: string;
  provenance: "local-files";
  entries: CapabilityLockEntry[];
}

export interface CapabilityLockInput {
  codexHome: string;
  projectRoot: string;
  workingDirectory?: string;
  now?: Date;
  version?: string;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(root: string, depth = 5): Promise<string[]> {
  if (depth < 0 || !(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (
      [
        ".git",
        "node_modules",
        "dist",
        "coverage",
        ".ctxray",
        ".ctxwise",
      ].includes(entry.name)
    )
      continue;
    const path = join(root, entry.name);
    if (entry.isFile()) files.push(path);
    if (entry.isDirectory()) files.push(...(await walk(path, depth - 1)));
  }
  return files;
}

const secretKey =
  /(?:api[_-]?key|token|secret|password|authorization|cookie|credential|private[_-]?key)/i;

export function redactSensitiveContent(content: string): {
  content: string;
  redacted: boolean;
} {
  let insideEnv = false;
  let redacted = false;
  const lines = content.split(/\r?\n/).map((line) => {
    const section = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (section) insideEnv = /(?:^|\.)env$/i.test(section[1] ?? "");
    const assignment = /^(\s*)([A-Za-z0-9_.-]+)(\s*=)(.*)$/.exec(line);
    if (!assignment) return line;
    const key = assignment[2] ?? "";
    if (!insideEnv && !secretKey.test(key)) return line;
    redacted = true;
    return `${assignment[1]}${key}${assignment[3]} "***REDACTED***"`;
  });
  return { content: lines.join("\n"), redacted };
}

function displayPath(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

async function entryFor(
  scope: CapabilityLockEntry["scope"],
  root: string,
  path: string,
): Promise<CapabilityLockEntry> {
  return entryForContent(scope, root, path, await readFile(path, "utf8"));
}

function entryForContent(
  scope: CapabilityLockEntry["scope"],
  root: string,
  path: string,
  raw: string,
): CapabilityLockEntry {
  const safe = redactSensitiveContent(raw);
  return {
    scope,
    path: displayPath(root, path),
    sha256: createHash("sha256").update(safe.content).digest("hex"),
    bytes: Buffer.byteLength(safe.content),
    redacted: safe.redacted,
  };
}

export async function buildCapabilityLock(
  input: CapabilityLockInput,
): Promise<CapabilityLock> {
  const codexCandidates = (await walk(input.codexHome, 6)).filter((path) => {
    const normalized = path.replaceAll("\\", "/");
    return (
      normalized.endsWith("/config.toml") ||
      normalized.endsWith(".config.toml") ||
      normalized.endsWith("/SKILL.md") ||
      normalized.includes("/agents/") ||
      normalized.includes("/hooks/")
    );
  });
  const guidanceConfig = await readEffectiveGuidanceConfig(
    input.codexHome,
    input.projectRoot,
  );
  const activeGuidance = await discoverProjectGuidance({
    projectRoot: input.projectRoot,
    workingDirectory: input.workingDirectory ?? input.projectRoot,
    config: guidanceConfig,
  });
  const guidanceNames = new Set(
    guidanceCandidateFilenames(guidanceConfig.fallbackFilenames),
  );
  const activeGuidancePaths = new Set(
    activeGuidance.map((document) => resolve(document.path)),
  );
  const projectCandidates = (await walk(input.projectRoot, 5)).filter(
    (path) => {
      const normalized = path.replaceAll("\\", "/");
      if (normalized.startsWith(input.codexHome.replaceAll("\\", "/")))
        return false;
      if (activeGuidancePaths.has(resolve(path))) return false;
      if (guidanceNames.has(basename(path))) return false;
      return (
        normalized.includes("/.codex/") ||
        normalized.includes("/.agents/skills/")
      );
    },
  );
  const entries = await Promise.all([
    ...codexCandidates.map((path) =>
      entryFor("codex-home", input.codexHome, path),
    ),
    ...projectCandidates.map((path) =>
      entryFor("project", input.projectRoot, path),
    ),
    ...activeGuidance.map((document) =>
      Promise.resolve(
        entryForContent(
          "project",
          input.projectRoot,
          document.path,
          document.content,
        ),
      ),
    ),
  ]);
  entries.sort((left, right) =>
    `${left.scope}/${left.path}`.localeCompare(`${right.scope}/${right.path}`),
  );
  return {
    schemaVersion: 1,
    generator: { name: "ctxwise", version: input.version ?? "0.3.0" },
    generatedAt: (input.now ?? new Date()).toISOString(),
    provenance: "local-files",
    entries,
  };
}
