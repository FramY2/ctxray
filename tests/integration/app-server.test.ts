import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { queryAccountSnapshot } from "../../src/app-server.js";

const fakeCodex = fileURLToPath(
  new URL("../fixtures/fake-codex.mjs", import.meta.url),
);

describe("queryAccountSnapshot", () => {
  it("performs the handshake and reads plan plus rate limits", async () => {
    const result = await queryAccountSnapshot({
      command: process.execPath,
      commandPrefixArgs: [fakeCodex],
      timeoutMs: 2_000,
    });

    expect(result.authMode).toBe("chatgpt");
    expect(result.planType).toBe("plus");
    expect(result.quota?.usedPercent).toBe(37);
    expect(result.quota?.provenance).toBe("exact");
  });

  it("rejects cleanly when the Codex executable is unavailable", async () => {
    await expect(
      queryAccountSnapshot({
        command: "ctxray-command-that-does-not-exist",
        timeoutMs: 500,
      }),
    ).rejects.toThrow();
  });
});
