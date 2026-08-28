/**
 * Groq client - the single impure boundary to the model.
 *
 * SERVER-ONLY: reads GROQ_API_KEY. Only ever imported by server actions, never
 * by a client component. Uses Groq's OpenAI-compatible endpoint with STRICT
 * structured outputs (constrained decoding) so the returned JSON always matches
 * the schema shape. Callers still Zod-validate the result - strict guarantees
 * structure, not semantics.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Only these two models support Groq strict structured outputs. */
export type GroqModel = "openai/gpt-oss-120b" | "openai/gpt-oss-20b";

export class GroqError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GroqError";
    this.status = status;
  }
}

export interface GroqStructuredRequest {
  model: GroqModel;
  system: string;
  user: string;
  /** Schema name (identifier, no spaces). */
  schemaName: string;
  /** A strict-compatible JSON Schema: every field in `required`, additionalProperties:false. */
  jsonSchema: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

/**
 * Calls Groq with strict structured output and returns the parsed JSON as
 * `unknown` - the caller is responsible for Zod-validating it. Throws GroqError
 * on failure (the caller decides whether to fall back to authored content).
 */
export async function callGroqStructured(req: GroqStructuredRequest): Promise<unknown> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new GroqError("GROQ_API_KEY is not set");

  const body = {
    model: req.model,
    temperature: req.temperature ?? 0.2,
    max_tokens: req.maxTokens ?? 1200,
    messages: [
      { role: "system", content: req.system },
      { role: "user", content: req.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: req.schemaName, strict: true, schema: req.jsonSchema },
    },
  };

  const once = async (): Promise<unknown> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? 20_000);
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new GroqError(`Groq ${res.status}: ${detail.slice(0, 300)}`, res.status);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new GroqError("Groq returned no content");
      return JSON.parse(content) as unknown;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    return await once();
  } catch (err) {
    // Don't retry a genuine bad-request (4xx other than rate-limit); retry everything else once.
    if (err instanceof GroqError && err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
      throw err;
    }
    return await once();
  }
}
