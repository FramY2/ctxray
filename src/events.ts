import type { TokenUsage } from "./receipt.js";

export interface ExecParseResult {
  messages: string[];
  usage: TokenUsage | null;
  warnings: string[];
  threadId: string | null;
}

function isValidCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function parseUsage(value: unknown): TokenUsage | null {
  if (!value || typeof value !== "object") return null;
  const usage = value as Record<string, unknown>;
  const input = usage.input_tokens;
  const cached = usage.cached_input_tokens;
  const output = usage.output_tokens;
  const reasoning = usage.reasoning_output_tokens ?? 0;
  if (
    !isValidCount(input) ||
    !isValidCount(cached) ||
    !isValidCount(output) ||
    !isValidCount(reasoning) ||
    cached > input
  ) {
    return null;
  }
  return {
    inputTokens: input,
    cachedInputTokens: cached,
    outputTokens: output,
    reasoningOutputTokens: reasoning,
    provenance: "exact",
  };
}

export function parseExecJsonl(lines: Iterable<string>): ExecParseResult {
  const messages: string[] = [];
  const warnings: string[] = [];
  let usage: TokenUsage | null = null;
  let threadId: string | null = null;

  for (const [index, raw] of Array.from(lines).entries()) {
    const line = raw.trim();
    if (!line) continue;
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line) as Record<string, unknown>;
    } catch {
      warnings.push(`Line ${index + 1} is not valid JSON.`);
      continue;
    }

    if (event.type === "thread.started" && typeof event.thread_id === "string") {
      threadId = event.thread_id;
    }
    if (event.type === "item.completed" && event.item && typeof event.item === "object") {
      const item = event.item as Record<string, unknown>;
      if (item.type === "agent_message" && typeof item.text === "string") {
        messages.push(item.text);
      }
    }
    if (event.type === "turn.completed") {
      const parsed = parseUsage(event.usage);
      if (parsed) usage = parsed;
      else warnings.push(`Invalid or missing token usage on line ${index + 1}.`);
    }
  }

  return { messages, usage, warnings, threadId };
}
