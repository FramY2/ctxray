import { rm } from "node:fs/promises";

export async function cleanupDirectories(paths: string[]): Promise<void> {
  await Promise.all(
    paths.splice(0).map((path) => rm(path, { force: true, recursive: true })),
  );
}
