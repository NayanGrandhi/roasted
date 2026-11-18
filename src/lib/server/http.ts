import "server-only";
import { NextResponse } from "next/server";
import { AIError } from "./gemini";
import { UserFacingError } from "./github";
import { isModeId } from "@/lib/modes";
import type { RoastSettings } from "@/lib/types";

export function errorResponse(err: unknown) {
  if (err instanceof UserFacingError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof AIError) {
    const messages: Record<AIError["code"], string> = {
      no_key: "The AI key is missing or invalid. Check GEMINI_API_KEY in .env.local, then restart the server.",
      rate_limited: "Our free AI quota is fried for the moment. Give it a minute and try again.",
      blocked: "Even our AI thought that was too much. Try something else.",
      bad_output: "The AI fumbled its lines. Hit retry.",
      upstream: "The AI is taking a smoke break. Try again in a moment.",
    };
    return NextResponse.json({ error: messages[err.code], code: err.code }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something broke. Not your fault (this time). Try again." }, { status: 500 });
}

export function rateLimited(retryAfter: number) {
  const mins = Math.max(1, Math.ceil(retryAfter / 60));
  return NextResponse.json(
    { error: `Whoa, you've been roasted enough for one hour. Let the burns heal. Try again in ~${mins} min.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export function parseSettings(body: Record<string, unknown>): RoastSettings {
  const mode = String(body.mode || "");
  if (!isModeId(mode)) throw new UserFacingError("Unknown roast mode.");
  const heatNum = Number(body.heat);
  const heat = ([1, 2, 3, 4].includes(heatNum) ? heatNum : 2) as RoastSettings["heat"];
  const lang = body.lang === "hinglish" ? "hinglish" : "en";
  const target = body.target === "friend" ? "friend" : "me";
  return { mode, heat, lang, target };
}
