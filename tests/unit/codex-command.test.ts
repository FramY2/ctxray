import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveCodexInvocation } from "../../src/codex-command.js";

describe("resolveCodexInvocation", () => {
  it("prefers the CtxWise executable override over the legacy CtxRay override", async () => {
    const invocation = await resolveCodexInvocation("codex", {
      env: {
        CTXWISE_CODEX_BIN: "D:\\tools\\ctxwise-codex.exe",
        CTXRAY_CODEX_BIN: "D:\\tools\\legacy-codex.exe",
      },
      fileExists: async () => false,
      platform: "win32",
    });

    expect(invocation).toEqual({
      command: "D:\\tools\\ctxwise-codex.exe",
      prefixArgs: [],
      source: "explicit",
    });
  });

  it("keeps the former CtxRay override as a compatibility fallback", async () => {
    const invocation = await resolveCodexInvocation("codex", {
      env: { CTXRAY_CODEX_BIN: "D:\\tools\\legacy-codex.exe" },
      fileExists: async () => false,
      platform: "win32",
    });

    expect(invocation).toEqual({
      command: "D:\\tools\\legacy-codex.exe",
      prefixArgs: [],
      source: "explicit",
    });
  });

  it("prefers the public npm launcher over the protected Windows app binary", async () => {
    const appData = "C:\\Users\\test\\AppData\\Roaming";
    const launcher = join(
      appData,
      "npm",
      "node_modules",
      "@openai",
      "codex",
      "bin",
      "codex.js",
    );

    const invocation = await resolveCodexInvocation("codex", {
      env: { APPDATA: appData },
      fileExists: async (path) => path === launcher,
      nodeExecutable: "C:\\Program Files\\nodejs\\node.exe",
      platform: "win32",
    });

    expect(invocation).toEqual({
      command: "C:\\Program Files\\nodejs\\node.exe",
      prefixArgs: [launcher],
      source: "npm-launcher",
    });
  });

  it("preserves an explicitly selected executable", async () => {
    const invocation = await resolveCodexInvocation("D:\\tools\\codex.exe", {
      env: {},
      fileExists: async () => false,
      nodeExecutable: "node",
      platform: "win32",
    });

    expect(invocation).toEqual({
      command: "D:\\tools\\codex.exe",
      prefixArgs: [],
      source: "explicit",
    });
  });
});
