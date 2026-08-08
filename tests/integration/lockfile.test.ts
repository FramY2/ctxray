import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildCapabilityLock } from "../../src/lockfile.js";
import { cleanupDirectories } from "../support/temp.js";

const created: string[] = [];
afterEach(() => cleanupDirectories(created));

describe("buildCapabilityLock", () => {
  it("hashes a redacted context surface without serializing secrets", async () => {
    const root = await mkdtemp(join(tmpdir(), "ctxray-lock-"));
    created.push(root);
    const codexHome = join(root, ".codex");
    await mkdir(codexHome, { recursive: true });
    await writeFile(
      join(codexHome, "config.toml"),
      'model = "gpt-5.6-terra"\napi_key = "super-secret"\n[mcp_servers.test.env]\nTOKEN = "hidden"\n',
    );

    const lock = await buildCapabilityLock({
      codexHome,
      projectRoot: root,
      now: new Date("2026-08-08T12:00:00Z"),
    });
    const serialized = JSON.stringify(lock);

    expect(lock.entries).toHaveLength(1);
    expect(lock.entries[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("hidden");
    expect(serialized).not.toContain(root.replaceAll("\\", "/"));
  });
});
