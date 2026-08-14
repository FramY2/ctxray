import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { inspectPromptInput, runCodex } from "../../src/runner.js";

const fakeCodex = fileURLToPath(
  new URL("../fixtures/fake-codex.mjs", import.meta.url),
);

describe("runCodex", () => {
  it("estimates model-visible prompt context through Codex debug without a model call", async () => {
    const report = await inspectPromptInput({
      command: process.execPath,
      commandPrefixArgs: [fakeCodex],
      model: "gpt-5.6-sol",
      profile: "lean",
      prompt: "test prompt",
    });

    expect(report.provenance).toBe("estimated");
    expect(report.estimatedTokens).toBe(1_003);
    expect(report.byRole.system?.items).toBe(1);
  });

  it("passes model and profile without a shell and parses the JSONL result", async () => {
    const result = await runCodex({
      command: process.execPath,
      commandPrefixArgs: [fakeCodex],
      model: "gpt-5.6-sol",
      profile: "lean",
      prompt: "test prompt",
    });

    expect(result.exitCode).toBe(0);
    expect(result.messages).toEqual(["Fake Codex answer"]);
    expect(result.usage?.inputTokens).toBe(10_000);
  });

  it("rejects a non-zero adapter exit with its diagnostic", async () => {
    await expect(
      runCodex({
        command: process.execPath,
        commandPrefixArgs: [fakeCodex, "unsupported-prefix"],
        prompt: "test prompt",
      }),
    ).rejects.toThrow(/exited with code 2/i);
  });

  it("rejects an executable spawn failure", async () => {
    await expect(
      runCodex({ command: "ctxwise-command-that-does-not-exist", prompt: "x" }),
    ).rejects.toThrow();
  });

  it("rejects a prompt inspection spawn failure", async () => {
    await expect(
      inspectPromptInput({
        command: "ctxwise-command-that-does-not-exist",
        prompt: "x",
      }),
    ).rejects.toThrow();
  });
});
