import { describe, expect, it } from "vitest";

import { parseExecJsonl } from "../../src/events.js";

describe("parseExecJsonl", () => {
  it("extracts only final agent messages and exact turn usage", () => {
    const result = parseExecJsonl([
      JSON.stringify({ type: "turn.started" }),
      JSON.stringify({
        type: "item.completed",
        item: { type: "agent_message", text: "Done" },
      }),
      JSON.stringify({
        type: "turn.completed",
        usage: {
          input_tokens: 100,
          cached_input_tokens: 80,
          output_tokens: 20,
          reasoning_output_tokens: 5,
        },
      }),
    ]);

    expect(result.messages).toEqual(["Done"]);
    expect(result.usage).toEqual({
      inputTokens: 100,
      cachedInputTokens: 80,
      outputTokens: 20,
      reasoningOutputTokens: 5,
      provenance: "exact",
    });
  });

  it("reports malformed lines and leaves missing usage unknown", () => {
    const result = parseExecJsonl(["not-json", JSON.stringify({ type: "turn.started" })]);

    expect(result.usage).toBeNull();
    expect(result.warnings).toHaveLength(1);
  });

  it("rejects impossible negative or over-cached usage", () => {
    const result = parseExecJsonl([
      JSON.stringify({
        type: "turn.completed",
        usage: {
          input_tokens: 10,
          cached_input_tokens: 11,
          output_tokens: -1,
        },
      }),
    ]);

    expect(result.usage).toBeNull();
    expect(result.warnings[0]).toMatch(/invalid/i);
  });
});
