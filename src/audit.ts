import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative } from "node:path";

import { parse as parseToml } from "smol-toml";
import { parse as parseYaml } from "yaml";

export type AuditSourceKind =
  | "config"
  | "profile"
  | "agents-guidance"
  | "agent-definition";

export interface AuditSource {
  kind: AuditSourceKind;
  path: string;
  characters: number;
  estimatedTokens: number;
}

export interface AuditedSkill {
  name: string;
  path: string;
  descriptionCharacters: number;
  estimatedStartupTokens: number;
  scriptCount: number;
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
  mcpServers: string[];
  catalogDescriptionCharacters: number;
  estimatedStartupTokens: number;
  findings: AuditFinding[];
}

export interface AuditOptions {
  codexHome: string;
  projectRoot: string;
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
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if ([".git", "node_modules", "dist", "coverage"].includes(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isFile() && predicate(path, entry.name)) files.push(path);
    if (entry.isDirectory()) files.push(...(await walk(path, predicate, depth - 1)));
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
): Promise<AuditSource> {
  const content = await readFile(path, "utf8");
  return {
    kind,
    path: sourcePath(path, root, scope),
    characters: content.length,
    estimatedTokens: Math.ceil(content.length / 4),
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

export async function auditCodexSurface(
  options: AuditOptions,
): Promise<AuditReport> {
  const sources: AuditSource[] = [];
  const configPath = join(options.codexHome, "config.toml");
  let mcpServers: string[] = [];
  if (await exists(configPath)) {
    const content = await readFile(configPath, "utf8");
    sources.push(await readSource(configPath, options.codexHome, "codex-home", "config"));
    try {
      const config = parseToml(content) as Record<string, unknown>;
      const mcp = config.mcp_servers;
      if (mcp && typeof mcp === "object") mcpServers = Object.keys(mcp).sort();
    } catch {
      // A malformed config is surfaced as a finding below without exposing content.
    }
  }

  const profileFiles = (await readdir(options.codexHome, { withFileTypes: true }).catch(() => []))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".config.toml"))
    .map((entry) => join(options.codexHome, entry.name));
  for (const path of profileFiles.sort()) {
    sources.push(await readSource(path, options.codexHome, "codex-home", "profile"));
  }

  const guidanceFiles = await walk(
    options.projectRoot,
    (_path, name) => name === "AGENTS.md",
    4,
  );
  for (const path of guidanceFiles.sort()) {
    sources.push(
      await readSource(path, options.projectRoot, "project", "agents-guidance"),
    );
  }

  const projectAgentFiles = await walk(
    join(options.projectRoot, ".codex", "agents"),
    (_path, name) => name.endsWith(".toml"),
    3,
  );
  for (const path of projectAgentFiles.sort()) {
    sources.push(
      await readSource(path, options.projectRoot, "project", "agent-definition"),
    );
  }

  const skillRoots = [
    join(options.codexHome, "skills"),
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
  for (const path of skillFiles) {
    const content = await readFile(path, "utf8");
    const metadata = parseFrontMatter(content);
    const description =
      typeof metadata.description === "string" ? metadata.description.trim() : "";
    const name =
      typeof metadata.name === "string" && metadata.name.trim()
        ? metadata.name.trim()
        : basename(join(path, ".."));
    const displayPath = options.projectRoot && path.startsWith(options.projectRoot)
      ? sourcePath(path, options.projectRoot, "project")
      : sourcePath(path, options.codexHome, "codex-home");
    skills.push({
      name,
      path: displayPath,
      descriptionCharacters: description.length,
      estimatedStartupTokens: Math.ceil((name.length + description.length) / 4),
      scriptCount: await countScripts(path),
    });
    if (description) {
      const key = normalizedDescription(description);
      descriptions.set(key, [...(descriptions.get(key) ?? []), displayPath]);
    }
  }

  const findings: AuditFinding[] = [];
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
  const catalogDescriptionCharacters = skills.reduce(
    (sum, skill) => sum + skill.name.length + skill.descriptionCharacters,
    0,
  );
  if (catalogDescriptionCharacters > 8_000) {
    findings.push({
      code: "skill-catalog-budget",
      severity: "warning",
      message: `Skill catalog metadata uses ${catalogDescriptionCharacters} characters, above the recommended 8,000-character discovery budget.`,
      paths: skills.map((skill) => skill.path),
    });
  }

  return {
    provenance: "estimated",
    sources: sources.sort((a, b) => a.path.localeCompare(b.path)),
    skills,
    mcpServers,
    catalogDescriptionCharacters,
    estimatedStartupTokens:
      sources.reduce((sum, source) => sum + source.estimatedTokens, 0) +
      skills.reduce((sum, skill) => sum + skill.estimatedStartupTokens, 0),
    findings,
  };
}
