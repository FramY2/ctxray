import type { Provenance } from "./receipt.js";

export interface XRayItem {
  index: number;
  role: string;
  characters: number;
  estimatedTokens: number;
}

export interface XRayRoleSummary {
  items: number;
  characters: number;
  estimatedTokens: number;
}

export interface XRayReport {
  provenance: Provenance;
  totalCharacters: number;
  estimatedTokens: number;
  items: XRayItem[];
  byRole: Record<string, XRayRoleSummary>;
}

function stringsFrom(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsFrom);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if (typeof record.text === "string") return [record.text];
  return Object.values(record).flatMap(stringsFrom);
}

function findMessageLike(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    const direct = value.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && "role" in item,
    );
    return direct.length > 0 ? direct : value.flatMap(findMessageLike);
  }
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if ("role" in record) return [record];
  if (Array.isArray(record.messages)) return findMessageLike(record.messages);
  return Object.values(record).flatMap(findMessageLike);
}

export function analyzePromptInput(input: unknown): XRayReport {
  const messages = findMessageLike(input);
  const items = messages.map((message, index) => {
    const role = typeof message.role === "string" ? message.role : "unknown";
    const characters = stringsFrom(message.content ?? message).join("").length;
    return {
      index,
      role,
      characters,
      estimatedTokens: Math.ceil(characters / 4),
    };
  });
  const roleSummaries = new Map<string, XRayRoleSummary>();
  for (const item of items) {
    const summary = roleSummaries.get(item.role) ?? {
      items: 0,
      characters: 0,
      estimatedTokens: 0,
    };
    summary.items += 1;
    summary.characters += item.characters;
    summary.estimatedTokens += item.estimatedTokens;
    roleSummaries.set(item.role, summary);
  }
  const byRole = Object.fromEntries(roleSummaries);
  const totalCharacters = items.reduce((sum, item) => sum + item.characters, 0);
  return {
    provenance: "estimated",
    totalCharacters,
    estimatedTokens: Math.ceil(totalCharacters / 4),
    items,
    byRole,
  };
}
