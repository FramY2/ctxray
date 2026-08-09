import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

interface BenchmarkTask {
  id: string;
  expected: string;
}

interface PackageMetadata {
  name: string;
  license: string;
}

describe("repository-backed benchmark fixtures", () => {
  it("tracks the current package name and SPDX license", async () => {
    const root = resolve(import.meta.dirname, "../..");
    const [packageJson, tasksJson] = await Promise.all([
      readFile(resolve(root, "package.json"), "utf8"),
      readFile(resolve(root, "benchmarks/tasks.json"), "utf8"),
    ]);
    const metadata = JSON.parse(packageJson) as PackageMetadata;
    const tasks = JSON.parse(tasksJson) as BenchmarkTask[];

    const expectedById = new Map(tasks.map((task) => [task.id, task.expected]));

    expect(expectedById.get("repo-package-name")).toBe(metadata.name);
    expect(expectedById.get("repo-license")).toBe(metadata.license);
  });
});
