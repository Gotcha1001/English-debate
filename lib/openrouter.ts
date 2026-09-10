// lib/openrouter.ts
//
// Small shared helper for calling OpenRouter's free-tier models and
// getting back parsed JSON. Used by convex/lessons.ts, convex/debate.ts,
// convex/quickQuestions.ts and convex/lifeSituations.ts.

const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

const FALLBACK_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.1-405b-instruct:free",
  "qwen/qwen3-4b:free",
];

const RETRYABLE_PATTERNS = [
  /ResourceExhausted/i,
  /rate limit/i,
  /overloaded/i,
  /try again/i,
  /503/,
];

function isRetryable(message: string): boolean {
  return RETRYABLE_PATTERNS.some((p) => p.test(message));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface OpenRouterChoice {
  message?: { content?: string };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
  error?: { message?: string; code?: number };
}

export class OpenRouterError extends Error {}

async function requestCompletion(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    },
  );

  const raw = (await response
    .json()
    .catch(() => null)) as OpenRouterResponse | null;

  if (!response.ok || !raw) {
    const message = raw?.error?.message ?? `HTTP ${response.status}`;
    throw new OpenRouterError(
      `OpenRouter request failed (${model}): ${message}`,
    );
  }
  if (raw.error) {
    throw new OpenRouterError(
      `OpenRouter error (${model}): ${raw.error.message ?? "unknown error"}`,
    );
  }
  const content = raw.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError(`OpenRouter returned no content (${model})`);
  }
  return content;
}

async function requestCompletionWithRetry(
  apiKey: string,
  model: string,
  prompt: string,
  maxRetries = 2,
  retryDelayMs = 1500,
): Promise<string> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestCompletion(apiKey, model, prompt);
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      if (!isRetryable(message) || attempt === maxRetries) break;
      await sleep(retryDelayMs * (attempt + 1));
    }
  }
  throw lastError;
}

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new OpenRouterError(
      "Could not find a JSON object in the model's response",
    );
  }
  return candidate.slice(firstBrace, lastBrace + 1);
}

/** Result of a successful generateJson call, including which model answered. */
export interface GenerateJsonResult {
  data: unknown;
  modelUsed: string;
  /** True if the primary/default model failed and a fallback answered instead. */
  usedFallback: boolean;
}

/**
 * Calls OpenRouter with a prompt that instructs the model to reply with
 * ONLY a JSON object. Tries the configured/default model first (with
 * retries on transient errors), then walks down the fallback chain.
 * Returns which model actually produced the result so the caller can
 * surface a "used backup model" notice if it wasn't the primary one.
 */
export async function generateJson(
  prompt: string,
): Promise<GenerateJsonResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError(
      "OPENROUTER_API_KEY is not set for this Convex deployment. Run `npx convex env set OPENROUTER_API_KEY <key>`.",
    );
  }
  const primaryModel = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS].filter(
    (model, index, all) => all.indexOf(model) === index,
  );

  let lastError: unknown = null;
  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const content = await requestCompletionWithRetry(apiKey, model, prompt);
      const jsonText = extractJsonBlock(content);
      return {
        data: JSON.parse(jsonText) as unknown,
        modelUsed: model,
        usedFallback: i > 0,
      };
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  const detail =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new OpenRouterError(
    `All OpenRouter models failed. Last error: ${detail}`,
  );
}
