import { NextResponse } from "next/server";
import { generate, hasApiKey } from "@/lib/server/gemini";
import { clapBackSystemPrompt } from "@/lib/server/prompts";
import { demoClapBack } from "@/lib/server/demo";
import { clientIp, rateLimit } from "@/lib/server/ratelimit";
import { errorResponse, parseSettings, rateLimited } from "@/lib/server/http";
import { UserFacingError } from "@/lib/server/github";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new UserFacingError("Bad request.");
    const settings = parseSettings(body);
    const summary = String(body.roastSummary || "").slice(0, 4000);
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: ChatMessage) => m && (m.role === "user" || m.role === "roaster") && typeof m.text === "string")
      .slice(-12) as ChatMessage[];
    if (!messages.length || messages[messages.length - 1].role !== "user") throw new UserFacingError("Say something first.");
    if (messages[messages.length - 1].text.length > 600) throw new UserFacingError("Keep your clap back under 600 characters.");

    const rl = rateLimit(`clap:${clientIp(req)}`, 60);
    if (!rl.ok) return rateLimited(rl.retryAfter);

    if (!hasApiKey()) return NextResponse.json({ reply: demoClapBack(), demo: true });

    const reply = await generate({
      system: clapBackSystemPrompt(settings.mode, settings.heat, settings.lang, summary),
      contents: messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: m.text.slice(0, 600) }],
      })),
      maxOutputTokens: 1024,
    });
    return NextResponse.json({ reply: reply.trim().replace(/^"|"$/g, "") });
  } catch (err) {
    return errorResponse(err);
  }
}
