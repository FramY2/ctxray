import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  discoverGlobalGuidance,
  findProjectRoot,
  guidanceConfigFromRecords,
  resolveProjectScope,
} from "../../src/guidance.js";
import { cleanupDirectories } from "../support/temp.js";

const created: string[] = [];
afterEach(() => cleanupDirectories(created));

describe("Codex guidance discovery", () => {
  it("finds the nearest configured project marker and falls back to the cwd", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-guidance-root-"));
    created.push(root);
    const projectRoot = join(root, "repo");
    const workingDirectory = join(projectRoot, "nested", "leaf");
    await mkdir(workingDirectory, { recursive: true });
    await writeFile(join(projectRoot, ".project-root"), "");

    await expect(
      findProjectRoot(workingDirectory, [".project-root"]),
    ).resolves.toBe(projectRoot);
    await expect(
      findProjectRoot(workingDirectory, [".missing"]),
    ).resolves.toBe(workingDirectory);
    await expect(findProjectRoot(workingDirectory, [])).resolves.toBe(
      workingDirectory,
    );
  });

  it("uses a safe explicit root when the requested cwd is outside it", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-guidance-scope-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    const projectRoot = join(root, "repo");
    const outside = join(root, "outside");
    await Promise.all([
      mkdir(codexHome, { recursive: true }),
      mkdir(projectRoot, { recursive: true }),
      mkdir(outside, { recursive: true }),
    ]);

    await expect(
      resolveProjectScope({
        codexHome,
        workingDirectory: outside,
        explicitProjectRoot: projectRoot,
      }),
    ).resolves.toEqual({ projectRoot, workingDirectory: projectRoot });
  });

  it("accepts only safe fallback filenames and non-negative byte limits", () => {
    expect(
      guidanceConfigFromRecords([
        {
          project_doc_fallback_filenames: [
            "TEAM.md",
            "TEAM.md",
            "../outside.md",
            "",
          ],
          project_doc_max_bytes: -1,
        },
        { project_doc_max_bytes: 123 },
      ]),
    ).toEqual({ fallbackFilenames: ["TEAM.md"], maxBytes: 123 });
  });

  it("falls back from an empty global override and trims active guidance", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-global-guidance-"));
    created.push(root);
    await writeFile(join(root, "AGENTS.override.md"), " \n\t");
    await writeFile(join(root, "AGENTS.md"), "  active global guidance  \n");

    await expect(discoverGlobalGuidance(root)).resolves.toMatchObject({
      path: join(root, "AGENTS.md"),
      content: "active global guidance",
    });
  });
});
