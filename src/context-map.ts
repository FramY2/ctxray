import type { AuditReport } from "./audit.js";

export interface ContextMapOptions {
  maxSkills?: number;
  maxSources?: number;
}

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function positiveLimit(value: number | undefined, fallback: number): number {
  const limit = value ?? fallback;
  if (!Number.isSafeInteger(limit) || limit <= 0 || limit > 100) {
    throw new Error("Context map limits must be positive integers up to 100.");
  }
  return limit;
}

function escapeLabel(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\\", "&#92;")
    .replaceAll('"', "&quot;")
    .replaceAll("[", "&#91;")
    .replaceAll("]", "&#93;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ");
}

function label(primary: string, secondary?: string): string {
  return secondary
    ? `${escapeLabel(primary)}<br/>${escapeLabel(secondary)}`
    : escapeLabel(primary);
}

export function renderContextMap(
  report: AuditReport,
  options: ContextMapOptions = {},
): string {
  const maxSkills = positiveLimit(options.maxSkills, 12);
  const maxSources = positiveLimit(options.maxSources, 12);
  const sources = [...report.sources].sort(
    (left, right) =>
      (right.estimatedTokens ?? -1) - (left.estimatedTokens ?? -1) ||
      left.path.localeCompare(right.path),
  );
  const skills = [...report.skills].sort(
    (left, right) =>
      right.estimatedDiscoveryTokens - left.estimatedDiscoveryTokens ||
      left.name.localeCompare(right.name),
  );
  const lines = [
    "flowchart LR",
    `  root["${label("Codex context surface", `~${integer.format(report.estimatedKnownStartupTokens)} known startup tokens`)}"]`,
    `  sources["${label(`Config & guidance: ${sources.length}`)}"]`,
    `  skills["${label(`Skills: ${skills.length}`, `~${integer.format(Math.ceil(report.catalogDescriptionCharacters / 4))} discovery tokens`)}"]`,
    `  plugins["${label(`Plugins: ${report.plugins.length}`)}"]`,
    `  mcp["${label(`MCP servers: ${report.mcpServers.length}`)}"]`,
    `  findings["${label(`Findings: ${report.findings.length}`)}"]`,
    "  root --> sources",
    "  root --> skills",
    "  root --> plugins",
    "  root --> mcp",
    "  root --> findings",
  ];

  for (const [index, source] of sources.slice(0, maxSources).entries()) {
    const sourceDetail =
      source.estimatedTokens === null
        ? source.contextRole === "configuration"
          ? "configuration metadata (not prompt text)"
          : "loaded on demand"
        : `~${integer.format(source.estimatedTokens)} tokens`;
    lines.push(
      `  source${index}["${label(source.path, sourceDetail)}"]`,
      `  sources --> source${index}`,
    );
  }
  if (sources.length > maxSources) {
    const remainder = sources.length - maxSources;
    lines.push(
      `  sourceMore["${label(`${remainder} more source${remainder === 1 ? "" : "s"}`)}"]`,
      "  sources --> sourceMore",
    );
  }

  for (const [index, skill] of skills.slice(0, maxSkills).entries()) {
    lines.push(
      `  skill${index}["${label(skill.name, `~${integer.format(skill.estimatedDiscoveryTokens)} discovery tokens`)}"]`,
      `  skills --> skill${index}`,
    );
  }
  if (skills.length > maxSkills) {
    const remainder = skills.length - maxSkills;
    lines.push(
      `  skillMore["${label(`${remainder} more skill${remainder === 1 ? "" : "s"}`)}"]`,
      "  skills --> skillMore",
    );
  }

  return `${lines.join("\n")}\n`;
}
