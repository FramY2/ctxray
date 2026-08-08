#!/usr/bin/env node

import { createInterface } from "node:readline";

const args = process.argv.slice(2);

const debugIndex = args.indexOf("debug");
if (debugIndex >= 0 && args[debugIndex + 1] === "prompt-input") {
  process.stdout.write(
    JSON.stringify({
      messages: [
        { role: "system", content: "s".repeat(4_000) },
        { role: "user", content: "test prompt" },
      ],
    }),
  );
  process.exit(0);
}

if (args[0] === "exec") {
  process.stdout.write(
    `${JSON.stringify({ type: "thread.started", thread_id: "thread-test" })}\n`,
  );
  process.stdout.write(`${JSON.stringify({ type: "turn.started" })}\n`);
  process.stdout.write(
    `${JSON.stringify({
      type: "item.completed",
      item: {
        id: "message-test",
        type: "agent_message",
        text: "Fake Codex answer",
      },
    })}\n`,
  );
  process.stdout.write(
    `${JSON.stringify({
      type: "turn.completed",
      usage: {
        input_tokens: 10_000,
        cached_input_tokens: 8_000,
        output_tokens: 500,
        reasoning_output_tokens: 100,
      },
    })}\n`,
  );
  process.exit(0);
}

if (args[0] === "app-server") {
  const input = createInterface({ input: process.stdin });
  input.on("line", (line) => {
    const message = JSON.parse(line);
    if (message.method === "initialize") {
      process.stdout.write(
        `${JSON.stringify({ id: message.id, result: { userAgent: "fake" } })}\n`,
      );
    }
    if (message.method === "account/read") {
      process.stdout.write(
        `${JSON.stringify({
          id: message.id,
          result: {
            account: {
              type: "chatgpt",
              planType: "plus",
            },
            requiresOpenaiAuth: true,
          },
        })}\n`,
      );
    }
    if (message.method === "account/rateLimits/read") {
      process.stdout.write(
        `${JSON.stringify({
          id: message.id,
          result: {
            rateLimits: {
              limitId: "codex",
              primary: {
                usedPercent: 37,
                windowDurationMins: 300,
                resetsAt: 1_900_000_000,
              },
              secondary: null,
            },
          },
        })}\n`,
      );
    }
  });
  setTimeout(() => process.exit(0), 5_000).unref();
} else {
  process.stderr.write(`Unsupported fake Codex arguments: ${args.join(" ")}\n`);
  process.exit(2);
}
