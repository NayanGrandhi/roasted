import "server-only";

/**
 * Minimal Gemini REST client (no SDK = fewer moving parts).
 * Uses the free tier from Google AI Studio: https://aistudio.google.com/apikey
 */

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: "no_key" | "rate_limited" | "blocked" | "bad_output" | "upstream",
    public status = 500,
  ) {
    super(message);
  }
}

const API = "https://generativelanguage.googleapis.com/v1beta/models";

export function hasApiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Google retires model names often. These are the current recommended free-tier
// models; override with GEMINI_MODEL / GEMINI_FALLBACK_MODEL in .env.local.
const DEFAULT_MODEL = "gemini-3.8-flash";
const DEFAULT_FALLBACK = "gemini-3.5-flash-lite";

let discovered: string | null = null;

function models(): string[] {
  const list = [
    process.env.GEMINI_MODEL || DEFAULT_MODEL,
    process.env.GEMINI_FALLBACK_MODEL || DEFAULT_FALLBACK,
    ...(discovered ? [discovered] : []),
  ];
  return [...new Set(list)];
}

/** If every configured model is gone, ask Google which Flash models this key can use. */
async function discoverModel(key: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}?pageSize=200`, { headers: { "x-goog-api-key": key } });
    if (!res.ok) return null;
    const data = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
    const names = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""))
      .filter((n) => /^gemini-[\d.]+-flash(-lite)?$/.test(n));
    // Highest version first, prefer full Flash over Flash-Lite
    names.sort((a, b) => {
      const va = parseFloat(a.split("-")[1]);
      const vb = parseFloat(b.split("-")[1]);
      if (vb !== va) return vb - va;
      return Number(a.includes("lite")) - Number(b.includes("lite"));
    });
    return names[0] || null;
  } catch {
    return null;
  }
}

const SAFETY = [
  // Roasts are meant to sting, so only block clearly harmful content.
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

interface GenerateOptions {
  system: string;
  contents: GeminiContent[];
  /** OpenAPI-style schema; when present the model returns JSON */
  schema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
}

export async function generate(opts: GenerateOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AIError("GEMINI_API_KEY is not set", "no_key", 500);

  const body = {
    system_instruction: { parts: [{ text: opts.system }] },
    contents: opts.contents,
    safetySettings: SAFETY,
    generationConfig: {
      ...(process.env.GEMINI_TEMPERATURE ? { temperature: Number(process.env.GEMINI_TEMPERATURE) } : {}),
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
      ...(opts.schema ? { responseMimeType: "application/json", responseSchema: opts.schema } : {}),
    },
  };

  let lastError: AIError | null = null;
  const tried = new Set<string>();
  let queue = models();

  for (let i = 0; i < queue.length; i++) {
    const model = queue[i];
    if (tried.has(model)) continue;
    tried.add(model);
    let res: Response;
    try {
      res = await fetch(`${API}/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(55_000),
      });
    } catch {
      lastError = new AIError("Couldn't reach the AI", "upstream", 502);
      continue;
    }

    if (res.status === 429) {
      lastError = new AIError("AI free-tier quota hit", "rate_limited", 429);
      continue; // try the fallback model, which has its own quota
    }
    if (res.status === 404 || res.status === 403 || res.status >= 500) {
      const detail = await res.text().catch(() => "");
      console.error(`[roasted] Gemini model "${model}" failed (${res.status}): ${detail.slice(0, 300)}`);
      if (res.status === 403 && /API key|PERMISSION_DENIED.*key|API_KEY/i.test(detail)) {
        throw new AIError("Gemini rejected the API key", "no_key", 401);
      }
      lastError = new AIError(`AI model ${model} unavailable (${res.status})`, "upstream", 502);
      // Last configured model failed: try to discover a working one once.
      if (i === queue.length - 1 && !discovered) {
        const found = await discoverModel(key);
        if (found && !tried.has(found)) {
          discovered = found;
          console.warn(`[roasted] Switching to available model "${found}". Set GEMINI_MODEL=${found} in .env.local to skip this.`);
          queue = [...queue, found];
        }
      }
      continue;
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[roasted] Gemini error on "${model}" (${res.status}): ${detail.slice(0, 500)}`);
      if (/API key not valid|API_KEY_INVALID/i.test(detail)) throw new AIError("Gemini rejected the API key", "no_key", 401);
      throw new AIError("The AI rejected the request", "upstream", 502);
    }

    const json = (await res.json()) as {
      promptFeedback?: { blockReason?: string };
      candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    };

    if (json.promptFeedback?.blockReason) {
      throw new AIError("Blocked by safety filters", "blocked", 422);
    }
    const cand = json.candidates?.[0];
    if (!cand || cand.finishReason === "SAFETY" || cand.finishReason === "PROHIBITED_CONTENT") {
      throw new AIError("Blocked by safety filters", "blocked", 422);
    }
    const text = (cand.content?.parts || [])
      .filter((p) => !p.thought && typeof p.text === "string")
      .map((p) => p.text)
      .join("");
    if (!text.trim()) {
      lastError = new AIError("Empty response from AI", "bad_output", 502);
      continue;
    }
    return text;
  }

  throw lastError ?? new AIError("AI unavailable", "upstream", 502);
}

export async function generateJSON<T>(opts: GenerateOptions & { schema: Record<string, unknown> }): Promise<T> {
  const text = await generate(opts);
  try {
    return JSON.parse(text) as T;
  } catch {
    // Occasionally models wrap JSON in fences — salvage it.
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new AIError("AI returned malformed output", "bad_output", 502);
  }
}
