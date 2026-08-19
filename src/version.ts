import { readFileSync } from "node:fs";

function readPackageVersion(): string {
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as { version?: unknown };
  if (typeof packageJson.version !== "string" || !packageJson.version) {
    throw new Error("CtxWise package.json does not contain a valid version.");
  }
  return packageJson.version;
}

export const CTXWISE_VERSION = readPackageVersion();
