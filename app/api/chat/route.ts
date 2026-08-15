import OpenAI from "openai";
import { loadActivePantheon, ContentValidationError } from "@/lib/content";
import { buildSystemPrompt } from "@/lib/prompt";

// Always run on the Node.js runtime (filesystem access for content loading)
// and never cache — each request assembles a fresh grounded prompt.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Server-side key check — fail loudly, never silently.
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return jsonError(
      "Server is missing OPENROUTER_API_KEY. Set it in .env (see .env.example) and restart.",
      500
    );
  }

  // 2. Parse the conversation history sent by the client.
  let messages: ChatMessage[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages)) {
      return jsonError("Request body must include a 'messages' array.", 400);
    }
    messages = body.messages
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          (m as ChatMessage).role !== undefined &&
          typeof (m as ChatMessage).content === "string"
      )
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
  } catch {
    return jsonError("Request body is not valid JSON.", 400);
  }

  if (messages.length === 0) {
    return jsonError("No messages provided.", 400);
  }

  // 3. Load the active pantheon and build the grounded system prompt.
  let systemPrompt: string;
  try {
    const pantheon = loadActivePantheon();
    systemPrompt = buildSystemPrompt(pantheon);
  } catch (err) {
    if (err instanceof ContentValidationError) {
      return jsonError(`Content pack error: ${err.message}`, 500);
    }
    return jsonError(
      `Failed to load content: ${err instanceof Error ? err.message : String(err)}`,
      500
    );
  }

  // 4. Call OpenRouter (OpenAI-compatible) with streaming enabled.
  const model = process.env.MODEL_ID?.trim() || DEFAULT_MODEL;
  const client = new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
  });

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      stream: true,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`Upstream model request failed: ${message}`, 502);
  }

  // 5. Relay tokens to the client incrementally as a plain-text stream.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) {
            controller.enqueue(encoder.encode(token));
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n[stream error: ${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
