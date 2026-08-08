import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { parse as parseYaml } from "yaml";
import { z } from "zod";

const effort = z.enum([
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
  "ultra",
]);
const approvalPolicy = z.enum(["untrusted", "on-request", "never"]);
const sandboxMode = z.enum([
  "read-only",
  "workspace-write",
  "danger-full-access",
]);
const profileSchema = z
  .object({
    description: z.string().optional(),
    model: z.string().min(1),
    reasoningEffort: effort.optional(),
    approvalPolicy: approvalPolicy.optional(),
    sandboxMode: sandboxMode.optional(),
    agents: z
      .object({
        maxThreads: z.number().int().positive().max(64).optional(),
        defaultModel: z.string().min(1).optional(),
        defaultEffort: effort.optional(),
      })
      .strict()
      .optional(),
    disableSkills: z.array(z.string().min(1)).default([]),
    disableMcp: z.array(z.string().regex(/^[A-Za-z0-9_-]+$/)).default([]),
  })
  .strict();

const policySchema = z
  .object({
    version: z.literal(1),
    profiles: z.record(z.string().regex(/^[A-Za-z0-9_-]+$/), profileSchema),
  })
  .strict();

export interface CompiledProfile {
  name: string;
  fileName: string;
  toml: string;
  warnings: string[];
}

export interface CompileOptions {
  skillPaths?: Record<string, string>;
}

function tomlString(value: string): string {
  return JSON.stringify(value);
}

export function compileProfiles(
  input: string,
  options: CompileOptions = {},
): CompiledProfile[] {
  const policy = policySchema.parse(parseYaml(input));
  return Object.entries(policy.profiles)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, profile]) => {
      const lines = [`model = ${tomlString(profile.model)}`];
      const warnings: string[] = [];
      if (profile.reasoningEffort)
        lines.push(
          `model_reasoning_effort = ${tomlString(profile.reasoningEffort)}`,
        );
      if (profile.approvalPolicy)
        lines.push(`approval_policy = ${tomlString(profile.approvalPolicy)}`);
      if (profile.sandboxMode)
        lines.push(`sandbox_mode = ${tomlString(profile.sandboxMode)}`);

      if (profile.agents) {
        lines.push("", "[agents]");
        if (profile.agents.maxThreads)
          lines.push(
            `max_concurrent_threads_per_session = ${profile.agents.maxThreads}`,
          );
        if (profile.agents.defaultModel)
          lines.push(
            `default_subagent_model = ${tomlString(profile.agents.defaultModel)}`,
          );
        if (profile.agents.defaultEffort)
          lines.push(
            `default_subagent_reasoning_effort = ${tomlString(profile.agents.defaultEffort)}`,
          );
      }

      for (const skill of profile.disableSkills) {
        const path = options.skillPaths?.[skill];
        if (!path) {
          warnings.push(
            `Skill ${skill} was not resolved and was not disabled.`,
          );
          continue;
        }
        lines.push(
          "",
          "[[skills.config]]",
          `path = ${tomlString(path)}`,
          "enabled = false",
        );
      }
      for (const server of profile.disableMcp) {
        lines.push("", `[mcp_servers.${server}]`, "enabled = false");
      }

      return {
        name,
        fileName: `${name}.config.toml`,
        toml: `${lines.join("\n")}\n`,
        warnings,
      };
    });
}

export async function compileProfilesFromFile(
  path: string,
  options?: CompileOptions,
): Promise<CompiledProfile[]> {
  return compileProfiles(await readFile(path, "utf8"), options);
}

export interface InstallProfileInput {
  codexHome: string;
  fileName: string;
  toml: string;
  now?: Date;
}

export async function installProfile(input: InstallProfileInput): Promise<{
  destination: string;
  backupPath: string | null;
}> {
  if (!/^[A-Za-z0-9_-]+\.config\.toml$/.test(input.fileName)) {
    throw new Error(`Unsafe profile file name: ${input.fileName}`);
  }
  await mkdir(input.codexHome, { recursive: true });
  const destination = join(input.codexHome, input.fileName);
  let backupPath: string | null = null;
  try {
    await readFile(destination);
    const timestamp = (input.now ?? new Date())
      .toISOString()
      .replace(/[:.]/g, "-");
    const backupDirectory = join(input.codexHome, ".ctxray-backups", timestamp);
    await mkdir(backupDirectory, { recursive: true });
    backupPath = join(backupDirectory, input.fileName);
    await copyFile(destination, backupPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  await writeFile(destination, input.toml, "utf8");
  return { destination, backupPath };
}
