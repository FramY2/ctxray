import { describe, expect, it } from "vitest";

import { analyzePromptInput } from "../../src/xray.js";

describe("analyzePromptInput", () => {
  it("summarizes roles without returning prompt text", () => {
    const input = [
      { role: "system", content: "System rules" },
      {
        role: "developer",
        content: [{ type: "input_text", text: "Repository guidance" }],
      },
      { role: "user", content: "Please fix the bug" },
      { role: "tool", content: [{ type: "output_text", text: "tool output" }] },
    ];

    const report = analyzePromptInput(input);

    expect(report.provenance).toBe("estimated");
    expect(report.items).toHaveLength(4);
    expect(report.byRole.system?.items).toBe(1);
    expect(report.byRole.developer?.items).toBe(1);
    expect(report.totalCharacters).toBeGreaterThan(0);
    expect(JSON.stringify(report)).not.toContain("Please fix the bug");
  });

  it("handles arbitrary nested prompt JSON without throwing", () => {
    const report = analyzePromptInput({
      messages: [{ role: "user", content: { nested: { value: "hello" } } }],
      metadata: { ignored: true },
    });

    expect(report.items.length).toBeGreaterThanOrEqual(1);
    expect(report.estimatedTokens).toBeGreaterThan(0);
  });

  it("returns an empty estimated report when no message-like items exist", () => {
    const report = analyzePromptInput({ metadata: [true, 42, null] });

    expect(report.items).toEqual([]);
    expect(report.totalCharacters).toBe(0);
    expect(report.estimatedTokens).toBe(0);
  });

  it("treats prototype-like role names as ordinary data keys", () => {
    const report = analyzePromptInput([
      { role: "__proto__", content: "one" },
      { role: "toString", content: "two" },
    ]);

    expect(Object.hasOwn(report.byRole, "__proto__")).toBe(true);
    expect(report.byRole["__proto__"]).toEqual({
      items: 1,
      characters: 3,
      estimatedTokens: 1,
    });
    expect(report.byRole.toString).toEqual({
      items: 1,
      characters: 3,
      estimatedTokens: 1,
    });
  });
});
