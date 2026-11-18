import { NextResponse } from "next/server";
import { generateJSON, hasApiKey } from "@/lib/server/gemini";
import { battleSystemPrompt, roastSystemPrompt, BATTLE_SCHEMA, SOLO_SCHEMA } from "@/lib/server/prompts";
import { prepareSubject, wrapForModel } from "@/lib/server/subjects";
import { normalizeBattle, normalizeSolo } from "@/lib/server/normalize";
import { demoBattle, demoSolo } from "@/lib/server/demo";
import { clientIp, rateLimit, roastLimit } from "@/lib/server/ratelimit";
import { errorResponse, parseSettings, rateLimited } from "@/lib/server/http";
import { UserFacingError } from "@/lib/server/github";
import type { RoastResponse, Subject } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new UserFacingError("Bad request.");
    const settings = parseSettings(body);
    const subjects = (Array.isArray(body.subjects) ? body.subjects : []) as Subject[];
    if (subjects.length < 1 || subjects.length > 2) throw new UserFacingError("Send one subject, or two for a battle.");
    const battle = subjects.length === 2;

    const rl = rateLimit(`roast:${clientIp(req)}`, roastLimit());
    if (!rl.ok) return rateLimited(rl.retryAfter);

    const prepared = await Promise.all(subjects.map((s, i) => prepareSubject(settings.mode, s, i, subjects.length)));

    if (!hasApiKey()) {
      const result = battle ? demoBattle(prepared.map((p) => p.label)) : demoSolo(settings.mode);
      return NextResponse.json({ result, demo: true } satisfies RoastResponse);
    }

    const contents = [{ role: "user" as const, parts: wrapForModel(prepared, settings.mode, battle) }];

    if (battle) {
      const raw = await generateJSON<Record<string, unknown>>({
        system: battleSystemPrompt(settings.mode, settings.heat, settings.lang),
        contents,
        schema: BATTLE_SCHEMA,
      });
      const result = normalizeBattle(raw, prepared.map((p) => p.label));
      return NextResponse.json({ result } satisfies RoastResponse);
    }

    const raw = await generateJSON<Record<string, unknown>>({
      system: roastSystemPrompt(settings.mode, settings.heat, settings.lang, settings.target),
      contents,
      schema: SOLO_SCHEMA,
    });
    return NextResponse.json({ result: normalizeSolo(raw) } satisfies RoastResponse);
  } catch (err) {
    return errorResponse(err);
  }
}
