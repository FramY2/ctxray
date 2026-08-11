import { readFile, stat } from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";

import { parse as parseToml } from "smol-toml";

export const DEFAULT_PROJECT_DOC_MAX_BYTES = 32 * 1024;

export interface ProjectScope {
  projectRoot: string;
  workingDirectory: string;
}

export interface GuidanceConfig {
  fallbackFilenames: string[];
  maxBytes: number;
}

export interface GuidanceDocument {
  path: string;
  content: string;
  bytes: number;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

function isWithin(root: string, candidate: string): boolean {
  const scoped = relative(root, candidate);
  return (
    scoped === "" ||
    (scoped !== ".." &&
      !scoped.startsWith(`..\\`) &&
      !scoped.startsWith("../") &&
      !isAbsolute(scoped))
  );
}

function configuredFilenames(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const names: string[] = [];
  for (const candidate of value) {
    if (typeof candidate !== "string") continue;
    const name = candidate.trim();
    if (
      !name ||
      name === "." ||
      name === ".." ||
      basename(name) !== name ||
      names.includes(name)
    ) {
      continue;
    }
    names.push(name);
  }
  return names;
}

export async function readTomlRecord(
  path: string,
): Promise<Record<string, unknown>> {
  try {
    const parsed = parseToml(await readFile(path, "utf8"));
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function guidanceConfigFromRecords(
  records: Record<string, unknown>[],
): GuidanceConfig {
  let fallbackFilenames: string[] = [];
  let maxBytes = DEFAULT_PROJECT_DOC_MAX_BYTES;
  for (const record of records) {
    const configuredFallbacks = configuredFilenames(
      record.project_doc_fallback_filenames,
    );
    if (configuredFallbacks !== null) fallbackFilenames = configuredFallbacks;
    const configuredMax = record.project_doc_max_bytes;
    if (
      typeof configuredMax === "number" &&
      Number.isSafeInteger(configuredMax) &&
      configuredMax >= 0
    ) {
      maxBytes = configuredMax;
    }
  }
  return { fallbackFilenames, maxBytes };
}

export async function readEffectiveGuidanceConfig(
  codexHome: string,
  projectRoot: string,
): Promise<GuidanceConfig> {
  return guidanceConfigFromRecords([
    await readTomlRecord(join(codexHome, "config.toml")),
    await readTomlRecord(join(projectRoot, ".codex", "config.toml")),
  ]);
}

export async function findProjectRoot(
  workingDirectory: string,
  markers: string[],
): Promise<string> {
  const cwd = resolve(workingDirectory);
  if (markers.length === 0) return cwd;
  let directory = cwd;
  while (true) {
    for (const marker of markers) {
      if (await pathExists(join(directory, marker))) return directory;
    }
    const parent = dirname(directory);
    if (parent === directory) return cwd;
    directory = parent;
  }
}

export async function resolveProjectScope(input: {
  codexHome: string;
  workingDirectory: string;
  explicitProjectRoot?: string;
}): Promise<ProjectScope> {
  const workingDirectory = resolve(input.workingDirectory);
  const userConfig = await readTomlRecord(join(input.codexHome, "config.toml"));
  const configuredMarkers = configuredFilenames(
    userConfig.project_root_markers,
  );
  const projectRoot = input.explicitProjectRoot
    ? resolve(input.explicitProjectRoot)
    : await findProjectRoot(workingDirectory, configuredMarkers ?? [".git"]);
  return {
    projectRoot,
    workingDirectory: isWithin(projectRoot, workingDirectory)
      ? workingDirectory
      : projectRoot,
  };
}

export function guidanceCandidateFilenames(
  fallbackFilenames: string[],
): string[] {
  const names = ["AGENTS.override.md", "AGENTS.md"];
  for (const fallback of fallbackFilenames) {
    if (!names.includes(fallback)) names.push(fallback);
  }
  return names;
}

async function selectedGuidancePath(
  directory: string,
  candidateFilenames: string[],
): Promise<string | null> {
  for (const name of candidateFilenames) {
    const candidate = join(directory, name);
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

function directoryChain(
  projectRoot: string,
  workingDirectory: string,
): string[] {
  const root = resolve(projectRoot);
  const cwd = resolve(workingDirectory);
  if (!isWithin(root, cwd)) return [root];
  const scoped = relative(root, cwd);
  if (!scoped) return [root];
  const directories = [root];
  let current = root;
  for (const segment of scoped.split(/[\\/]/).filter(Boolean)) {
    current = join(current, segment);
    directories.push(current);
  }
  return directories;
}

export async function discoverProjectGuidance(input: {
  projectRoot: string;
  workingDirectory: string;
  config: GuidanceConfig;
}): Promise<GuidanceDocument[]> {
  let remaining = input.config.maxBytes;
  if (remaining === 0) return [];
  const candidateFilenames = guidanceCandidateFilenames(
    input.config.fallbackFilenames,
  );
  const documents: GuidanceDocument[] = [];

  for (const directory of directoryChain(
    input.projectRoot,
    input.workingDirectory,
  )) {
    if (remaining === 0) break;
    const path = await selectedGuidancePath(directory, candidateFilenames);
    if (!path) continue;
    const data = await readFile(path);
    const selected = data.subarray(0, remaining);
    const content = selected.toString("utf8");
    if (!content.trim()) continue;
    documents.push({ path, content, bytes: selected.length });
    remaining -= selected.length;
  }
  return documents;
}

export async function discoverGlobalGuidance(
  codexHome: string,
): Promise<GuidanceDocument | null> {
  const path = await selectedGuidancePath(codexHome, [
    "AGENTS.override.md",
    "AGENTS.md",
  ]);
  if (!path) return null;
  const data = await readFile(path);
  const content = data.toString("utf8");
  return content.trim() ? { path, content, bytes: data.length } : null;
}
