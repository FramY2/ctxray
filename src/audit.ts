import { readdir, readFile, stat } from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";

import { parse as parseToml } from "smol-toml";
import { parse as parseYaml } from "yaml";

import {
  discoverGlobalGuidance,
  discoverProjectGuidance,
  guidanceConfigFromRecords,
} from "./guidance.js";

export type AuditSourceKind =
  | "config"
  | "project-config"
  | "profile"
  | "agents-guidance"
  | "agent-definition";

export interface AuditSource {
  kind: AuditSourceKind;
  contextRole: "prompt" | "configuration" | "on-demand";
  path: string;
  characters: number;
  estimatedTokens: number | null;
}

export interface AuditedSkill {
  name: string;
  path: string;
  descriptionCharacters: number;
  estimatedDiscoveryTokens: number;
  scriptCount: number;
}

export interface AuditedPlugin {
  name: string;
  version: string | null;
  path: string;
  skillCount: number;
}

export interface AuditFinding {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  paths: string[];
}

export interface AuditReport {
  provenance: "estimated";
  sources: AuditSource[];
  skills: AuditedSkill[];
  plugins: AuditedPlugin[];
  mcpServers: string[];
  catalogDescriptionCharacters: number;
  estimatedKnownStartupTokens: number;
  findings: AuditFinding[];
}

export interface AuditOptions {
  codexHome: string;
  projectRoot: string;
  workingDirectory?: string;
}

export function resolveAuditPath(
  scopedPath: string,
  options: AuditOptions,
): string | null {
  const separator = scopedPath.indexOf("/");
  if (separator < 1) return null;
  const scope = scopedPath.slice(0, separator);
  const remainder = scopedPath.slice(separator + 1);
  const root =
    scope === "codex-home"
      ? resolve(options.codexHome)
      : scope === "project"
        ? resolve(options.projectRoot)
        : scope === "user"
          ? resolve(dirname(options.codexHome))
          : null;
  if (!root) return null;

  const candidate = resolve(root, ...remainder.split("/"));
  const relativeCandidate = relative(root, candidate);
  if (
    relativeCandidate === ".." ||
    relativeCandidate.startsWith(`..\\`) ||
    relativeCandidate.startsWith("../") ||
    isAbsolute(relativeCandidate)
  ) {
    return null;
  }
  return candidate;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function walk(
  root: string,
  predicate: (path: string, name: string) => boolean,
  depth = 5,
): Promise<string[]> {
  if (depth < 0 || !(await exists(root))) return [];
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    if ([".git", "node_modules", "dist", "coverage"].includes(entry.name))
      continue;
    const path = join(root, entry.name);
    if (entry.isFile() && predicate(path, entry.name)) files.push(path);
    if (entry.isDirectory())
      files.push(...(await walk(path, predicate, depth - 1)));
  }
  return files;
}

function portablePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function sourcePath(path: string, root: string, scope: string): string {
  return `${scope}/${portablePath(relative(root, path))}`;
}

async function readSource(
  path: string,
  root: string,
  scope: string,
  kind: AuditSourceKind,
  selectedContent?: string,
): Promise<AuditSource> {
  const content = selectedContent ?? (await readFile(path, "utf8"));
  const contextRole =
    kind === "agents-guidance"
      ? "prompt"
      : kind === "agent-definition"
        ? "on-demand"
        : "configuration";
  return {
    kind,
    contextRole,
    path: sourcePath(path, root, scope),
    characters: content.length,
    estimatedTokens:
      contextRole === "prompt" ? Math.ceil(content.length / 4) : null,
  };
}

function parseFrontMatter(content: string): Record<string, unknown> {
  const match = /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match?.[1]) return {};
  const parsed = parseYaml(match[1]);
  return parsed && typeof parsed === "object"
    ? (parsed as Record<string, unknown>)
    : {};
}

async function countScripts(skillFile: string): Promise<number> {
  const scripts = join(skillFile, "..", "scripts");
  if (!(await exists(scripts))) return 0;
  return (await walk(scripts, () => true, 4)).length;
}

function normalizedDescription(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectConfigInventory(
  config: Record<string, unknown>,
  mcpServerNames: Set<string>,
  pluginStates: Map<string, boolean>,
): void {
  const mcp = config.mcp_servers;
  if (mcp && typeof mcp === "object") {
    for (const name of Object.keys(mcp)) mcpServerNames.add(name);
  }
  const plugins = config.plugins;
  if (plugins && typeof plugins === "object") {
    for (const [id, value] of Object.entries(plugins)) {
      const enabled =
        !value || typeof value !== "object"
          ? true
          : (value as Record<string, unknown>).enabled !== false;
      pluginStates.set(id, enabled);
    }
  }
}

interface PluginCandidate {
  name: string;
  root: string;
  version: string | null;
  versionDirectory: string;
}

function comparePluginCandidate(
  left: PluginCandidate,
  right: PluginCandidate,
): number {
  const leftBackup = /backup/i.test(left.versionDirectory);
  const rightBackup = /backup/i.test(right.versionDirectory);
  if (leftBackup !== rightBackup) return leftBackup ? -1 : 1;
  return left.versionDirectory.localeCompare(right.versionDirectory, "en", {
    numeric: true,
    sensitivity: "base",
  });
}

async function selectPluginCandidates(
  codexHome: string,
  pluginStates: Map<string, boolean>,
  findings: AuditFinding[],
): Promise<PluginCandidate[]> {
  const cacheRoot = join(codexHome, "plugins", "cache");
  const manifestFiles = (
    await walk(
      cacheRoot,
      (path, name) =>
        name === "plugin.json" &&
        portablePath(path).includes("/.codex-plugin/plugin.json"),
      7,
    )
  ).sort();
  const grouped = new Map<string, PluginCandidate[]>();

  for (const manifestPath of manifestFiles) {
    const segments = relative(cacheRoot, manifestPath).split(/[\\/]/);
    if (
      segments.length !== 5 ||
      segments[3] !== ".codex-plugin" ||
      segments[4] !== "plugin.json"
    ) {
      continue;
    }
    const [marketplace, directoryName, versionDirectory] = segments;
    try {
      const manifest = JSON.parse(
        await readFile(manifestPath, "utf8"),
      ) as Record<string, unknown>;
      if (typeof manifest.name !== "string") throw new Error("missing name");
      const id = `${directoryName}@${marketplace}`;
      const candidate: PluginCandidate = {
        name: manifest.name,
        root: dirname(dirname(manifestPath)),
        version: typeof manifest.version === "string" ? manifest.version : null,
        versionDirectory: versionDirectory ?? "",
      };
      grouped.set(id, [...(grouped.get(id) ?? []), candidate]);
    } catch {
      findings.push({
        code: "invalid-plugin-manifest",
        severity: "warning",
        message: "A cached plugin manifest is not valid JSON or lacks a name.",
        paths: [sourcePath(manifestPath, codexHome, "codex-home")],
      });
    }
  }

  const ids =
    pluginStates.size > 0
      ? [...pluginStates]
          .filter(([, enabled]) => enabled)
          .map(([id]) => id)
          .sort()
      : [...grouped.keys()].sort();
  const selected: PluginCandidate[] = [];
  for (const id of ids) {
    const candidates = grouped.get(id);
    if (!candidates || candidates.length === 0) {
      findings.push({
        code: "installed-plugin-missing",
        severity: "warning",
        message: `Configured plugin ${id} has no readable cache entry.`,
        paths: [],
      });
      continue;
    }
    selected.push([...candidates].sort(comparePluginCandidate).at(-1)!);
  }
  return selected;
}

export async function auditCodexSurface(
  options: AuditOptions,
): Promise<AuditReport> {
  const sources: AuditSource[] = [];
  const findings: AuditFinding[] = [];
  const configPath = join(options.codexHome, "config.toml");
  const mcpServerNames = new Set<string>();
  const pluginStates = new Map<string, boolean>();
  let userConfig: Record<string, unknown> = {};
  if (await exists(configPath)) {
    const content = await readFile(configPath, "utf8");
    sources.push(
      await readSource(configPath, options.codexHome, "codex-home", "config"),
    );
    try {
      userConfig = parseToml(content) as Record<string, unknown>;
      collectConfigInventory(userConfig, mcpServerNames, pluginStates);
    } catch {
      findings.push({
        code: "invalid-config",
        severity: "error",
        message: "Codex user config is not valid TOML.",
        paths: [sourcePath(configPath, options.codexHome, "codex-home")],
      });
    }
  }

  const projectConfigPath = join(options.projectRoot, ".codex", "config.toml");
  let projectConfig: Record<string, unknown> = {};
  if (await exists(projectConfigPath)) {
    const content = await readFile(projectConfigPath, "utf8");
    sources.push(
      await readSource(
        projectConfigPath,
        options.projectRoot,
        "project",
        "project-config",
      ),
    );
    try {
      projectConfig = parseToml(content) as Record<string, unknown>;
      collectConfigInventory(projectConfig, mcpServerNames, pluginStates);
    } catch {
      findings.push({
        code: "invalid-config",
        severity: "error",
        message: "Codex project config is not valid TOML.",
        paths: [sourcePath(projectConfigPath, options.projectRoot, "project")],
      });
    }
  }

  const activePluginCandidates = await selectPluginCandidates(
    options.codexHome,
    pluginStates,
    findings,
  );
  const plugins: AuditedPlugin[] = [];
  for (const candidate of activePluginCandidates) {
    const pluginSkills = await walk(
      join(candidate.root, "skills"),
      (_path, name) => name === "SKILL.md",
      5,
    );
    plugins.push({
      name: candidate.name,
      version: candidate.version,
      path: sourcePath(candidate.root, options.codexHome, "codex-home"),
      skillCount: pluginSkills.length,
    });
  }

  const profileFiles = (
    await readdir(options.codexHome, { withFileTypes: true }).catch(() => [])
  )
    .filter((entry) => entry.isFile() && entry.name.endsWith(".config.toml"))
    .map((entry) => join(options.codexHome, entry.name));
  for (const path of profileFiles.sort()) {
    sources.push(
      await readSource(path, options.codexHome, "codex-home", "profile"),
    );
  }

  const globalGuidance = await discoverGlobalGuidance(options.codexHome);
  if (globalGuidance) {
    sources.push(
      await readSource(
        globalGuidance.path,
        options.codexHome,
        "codex-home",
        "agents-guidance",
        globalGuidance.content,
      ),
    );
  }
  const projectGuidance = await discoverProjectGuidance({
    projectRoot: options.projectRoot,
    workingDirectory: options.workingDirectory ?? options.projectRoot,
    config: guidanceConfigFromRecords([userConfig, projectConfig]),
  });
  for (const guidance of projectGuidance) {
    sources.push(
      await readSource(
        guidance.path,
        options.projectRoot,
        "project",
        "agents-guidance",
        guidance.content,
      ),
    );
  }

  const projectAgentFiles = await walk(
    join(options.projectRoot, ".codex", "agents"),
    (_path, name) => name.endsWith(".toml"),
    3,
  );
  for (const path of projectAgentFiles.sort()) {
    sources.push(
      await readSource(
        path,
        options.projectRoot,
        "project",
        "agent-definition",
      ),
    );
  }

  const skillRoots = [
    join(options.codexHome, "skills"),
    join(dirname(options.codexHome), ".agents", "skills"),
    ...activePluginCandidates.map((candidate) =>
      join(candidate.root, "skills"),
    ),
    join(options.projectRoot, ".agents", "skills"),
    join(options.projectRoot, ".codex", "skills"),
  ];
  const skillFiles = (
    await Promise.all(
      skillRoots.map((root) =>
        walk(root, (_path, name) => name === "SKILL.md", 5),
      ),
    )
  )
    .flat()
    .sort();
  const skills: AuditedSkill[] = [];
  const descriptions = new Map<string, string[]>();
  const skillNames = new Map<string, string[]>();
  for (const path of skillFiles) {
    const content = await readFile(path, "utf8");
    const userRoot = dirname(options.codexHome);
    const displayPath = path.startsWith(options.projectRoot)
      ? sourcePath(path, options.projectRoot, "project")
      : path.startsWith(options.codexHome)
        ? sourcePath(path, options.codexHome, "codex-home")
        : sourcePath(path, userRoot, "user");
    let metadata: Record<string, unknown> = {};
    try {
      metadata = parseFrontMatter(content);
    } catch {
      findings.push({
        code: "invalid-skill-metadata",
        severity: "warning",
        message: "A skill has invalid YAML frontmatter.",
        paths: [displayPath],
      });
    }
    const description =
      typeof metadata.description === "string"
        ? metadata.description.trim()
        : "";
    const name =
      typeof metadata.name === "string" && metadata.name.trim()
        ? metadata.name.trim()
        : basename(join(path, ".."));
    skills.push({
      name,
      path: displayPath,
      descriptionCharacters: description.length,
      estimatedDiscoveryTokens: Math.ceil(
        (name.length + description.length) / 4,
      ),
      scriptCount: await countScripts(path),
    });
    skillNames.set(name, [...(skillNames.get(name) ?? []), displayPath]);
    if (description) {
      const key = normalizedDescription(description);
      descriptions.set(key, [...(descriptions.get(key) ?? []), displayPath]);
    }
  }

  for (const paths of descriptions.values()) {
    if (paths.length > 1) {
      findings.push({
        code: "duplicate-skill-description",
        severity: "warning",
        message:
          "Multiple skills advertise the same description and may create ambiguous startup context.",
        paths,
      });
    }
  }
  for (const [name, paths] of skillNames) {
    if (paths.length > 1) {
      findings.push({
        code: "duplicate-skill-name",
        severity: "warning",
        message: `Skill name ${name} resolves to multiple active paths and cannot be selected safely by name.`,
        paths,
      });
    }
  }
  const catalogDescriptionCharacters = skills.reduce(
    (sum, skill) => sum + skill.name.length + skill.descriptionCharacters,
    0,
  );
  if (catalogDescriptionCharacters > 8_000) {
    findings.push({
      code: "skill-catalog-budget",
      severity: "warning",
      message: `Skill catalog metadata uses ${catalogDescriptionCharacters} characters, above CtxRay's default 8,000-character discovery budget.`,
      paths: skills.map((skill) => skill.path),
    });
  }
  if (mcpServerNames.size > 0) {
    findings.push({
      code: "unmeasured-mcp-schemas",
      severity: "info",
      message:
        "MCP server names are inventoried, but their runtime tool-schema tokens are not included in the known startup estimate.",
      paths: [],
    });
  }

  return {
    provenance: "estimated",
    sources,
    skills,
    plugins,
    mcpServers: [...mcpServerNames].sort(),
    catalogDescriptionCharacters,
    estimatedKnownStartupTokens:
      sources.reduce((sum, source) => sum + (source.estimatedTokens ?? 0), 0) +
      skills.reduce((sum, skill) => sum + skill.estimatedDiscoveryTokens, 0),
    findings,
  };
}
