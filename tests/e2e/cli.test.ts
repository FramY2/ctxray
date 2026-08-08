import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const cli = fileURLToPath(new URL("../../src/cli.ts", import.meta.url));
const fakeCodex = fileURLToPath(new URL("../fixtures/fake-codex.mjs", import.meta.url));
const tsx = fileURLToPath(new URL("../../node_modules/tsx/dist/cli.mjs", import.meta.url));

describe("CtxRay CLI", () => {
  it("runs Codex and appends an honest subscription receipt", async () => {
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        tsx,
        cli,
        "run",
        "--codex-command",
        process.execPath,
        "--codex-prefix-arg",
        fakeCodex,
        "--model",
        "gpt-5.6-sol",
        "--receipt",
        "test prompt",
      ],
      { timeout: 10_000 },
    );

    expect(stdout).toContain("Fake Codex answer");
    expect(stdout).toContain("CtxRay receipt");
    expect(stdout).toContain("10,000 input");
    expect(stdout).toContain("37% used");
    expect(stdout).not.toContain("$");
  });

  it("shows API equivalent only when explicitly requested", async () => {
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        tsx,
        cli,
        "run",
        "--codex-command",
        process.execPath,
        "--codex-prefix-arg",
        fakeCodex,
        "--model",
        "gpt-5.6-sol",
        "--receipt",
        "--api-equivalent",
        "test prompt",
      ],
      { timeout: 10_000 },
    );

    expect(stdout).toContain("comparison only; not charged");
  });
});
