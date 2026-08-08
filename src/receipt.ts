export type Provenance = "exact" | "estimated" | "unknown";
export type AuthMode = "apikey" | "chatgpt" | "unknown";

export interface TokenUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  provenance: Provenance;
}

export interface TokenRate {
  input: number;
  cachedInput: number;
  output: number;
}

export interface ModelPrice {
  aliases: string[];
  contextWindow: number;
  apiUsdPerMillion: TokenRate;
  creditsPerMillion: TokenRate;
  longContext?: {
    thresholdInputTokens: number;
    inputMultiplier: number;
    outputMultiplier: number;
  };
}

export interface PriceCatalog {
  schemaVersion: 1;
  effectiveDate: string;
  sources: { api: string; credits: string };
  models: Record<string, ModelPrice>;
}

export interface QuotaSnapshot {
  usedPercent: number;
  windowDurationMins: number | null;
  resetsAt: number | null;
  provenance: Provenance;
}

export interface Receipt {
  model: string;
  planType: string | null;
  usage: TokenUsage;
  context: {
    tokens: number;
    window: number | null;
    percentUsed: number | null;
    provenance: Provenance;
  };
  credits: { value: number; provenance: "estimated" } | null;
  apiCost: {
    usd: number;
    kind: "billed-estimate" | "comparison";
    provenance: "estimated";
  } | null;
  quota: QuotaSnapshot | null;
  catalog: {
    effectiveDate: string;
    sources: PriceCatalog["sources"];
  };
  warnings: string[];
}

export interface ReceiptInput {
  authMode: AuthMode;
  catalog: PriceCatalog;
  includeApiEquivalent?: boolean;
  model: string;
  planType?: string | null;
  quota?: QuotaSnapshot | null;
  usage: TokenUsage;
}

function resolvePrice(
  catalog: PriceCatalog,
  requestedModel: string,
): ModelPrice | null {
  const exact = catalog.models[requestedModel];
  if (exact) return exact;
  return (
    Object.values(catalog.models).find((entry) =>
      entry.aliases.includes(requestedModel),
    ) ?? null
  );
}

function calculateRatedValue(
  usage: TokenUsage,
  rates: TokenRate,
  model: ModelPrice,
): number {
  const cached = Math.min(usage.cachedInputTokens, usage.inputTokens);
  const uncached = usage.inputTokens - cached;
  const isLong =
    model.longContext !== undefined &&
    usage.inputTokens > model.longContext.thresholdInputTokens;
  const inputMultiplier = isLong ? model.longContext!.inputMultiplier : 1;
  const outputMultiplier = isLong ? model.longContext!.outputMultiplier : 1;

  return (
    (uncached * rates.input * inputMultiplier +
      cached * rates.cachedInput * inputMultiplier +
      usage.outputTokens * rates.output * outputMultiplier) /
    1_000_000
  );
}

export function calculateReceipt(input: ReceiptInput): Receipt {
  const price = resolvePrice(input.catalog, input.model);
  const warnings = [
    "Token-derived values exclude unobserved tool-call fees and cache-write classes.",
  ];
  if (!price) warnings.push(`No dated price entry is available for ${input.model}.`);

  const contextWindow = price?.contextWindow ?? null;
  const percentUsed = contextWindow
    ? (input.usage.inputTokens / contextWindow) * 100
    : null;
  const credits = price
    ? {
        value: calculateRatedValue(
          input.usage,
          price.creditsPerMillion,
          price,
        ),
        provenance: "estimated" as const,
      }
    : null;

  const showApiCost =
    input.authMode === "apikey" ||
    (input.authMode === "chatgpt" && input.includeApiEquivalent === true);
  const apiCost =
    price && showApiCost
      ? {
          usd: calculateRatedValue(input.usage, price.apiUsdPerMillion, price),
          kind:
            input.authMode === "apikey"
              ? ("billed-estimate" as const)
              : ("comparison" as const),
          provenance: "estimated" as const,
        }
      : null;

  return {
    model: input.model,
    planType: input.planType ?? null,
    usage: input.usage,
    context: {
      tokens: input.usage.inputTokens,
      window: contextWindow,
      percentUsed,
      provenance: input.usage.provenance,
    },
    credits,
    apiCost,
    quota: input.quota ?? null,
    catalog: {
      effectiveDate: input.catalog.effectiveDate,
      sources: input.catalog.sources,
    },
    warnings,
  };
}

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function compactDecimal(value: number, digits: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function renderReceipt(receipt: Receipt): string {
  const context = receipt.context.window
    ? `${integer.format(receipt.context.tokens)} / ${integer.format(receipt.context.window)} (${compactDecimal(receipt.context.percentUsed!, 1)}%)`
    : "unknown";
  const parts = [
    "CtxRay receipt",
    `context ${context}`,
    `${integer.format(receipt.usage.inputTokens)} input (${integer.format(receipt.usage.cachedInputTokens)} cached) + ${integer.format(receipt.usage.outputTokens)} output`,
    receipt.credits
      ? `credit equivalent ≈ ${compactDecimal(receipt.credits.value, 4)}`
      : "credit equivalent unknown",
    receipt.quota
      ? `quota ${compactDecimal(receipt.quota.usedPercent, 1)}% used`
      : "quota unknown",
  ];

  if (receipt.apiCost?.kind === "billed-estimate") {
    parts.push(`estimated API charge ≈ $${receipt.apiCost.usd.toFixed(6)}`);
  } else if (receipt.apiCost?.kind === "comparison") {
    parts.push(
      `API equivalent ≈ $${receipt.apiCost.usd.toFixed(6)} (comparison only; not charged)`,
    );
  }

  return parts.join(" · ");
}
