import "server-only";
import type { BattleRoast, SoloRoast, GlowUpResult } from "@/lib/types";
import { AIError } from "./gemini";

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
const strArr = (v: unknown, max: number) =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean).slice(0, max) : [];
const clampScore = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50;
};

export function normalizeSolo(raw: Record<string, unknown>): SoloRoast {
  const out: SoloRoast = {
    kind: "solo",
    opener: str(raw.opener),
    roasts: strArr(raw.roasts, 6),
    score: clampScore(raw.score),
    scoreLabel: str(raw.scoreLabel, "Well Done"),
    redemption: strArr(raw.redemption, 3),
    verdict: str(raw.verdict),
  };
  if (!out.opener || !out.roasts.length) throw new AIError("AI returned an incomplete roast", "bad_output", 502);
  if (!out.verdict) out.verdict = out.opener;
  return out;
}

export function normalizeBattle(raw: Record<string, unknown>, names: string[]): BattleRoast {
  const cs = Array.isArray(raw.contenders) ? (raw.contenders as Record<string, unknown>[]) : [];
  if (cs.length < 2) throw new AIError("AI returned an incomplete battle", "bad_output", 502);
  const contenders = cs.slice(0, 2).map((c, i) => ({
    name: names[i] || str(c.name, `Contender ${i + 1}`),
    roasts: strArr(c.roasts, 4),
    score: clampScore(c.score),
    scoreLabel: str(c.scoreLabel, "Well Done"),
  })) as BattleRoast["contenders"];
  // The loser must be the higher score; break ties using the model's pick.
  let loserIndex: 0 | 1 = raw.loserIndex === 1 ? 1 : 0;
  if (contenders[0].score !== contenders[1].score) loserIndex = contenders[0].score > contenders[1].score ? 0 : 1;
  else contenders[loserIndex].score = Math.min(100, contenders[loserIndex].score + 1);
  return {
    kind: "battle",
    opener: str(raw.opener, "Two enter. One leaves cooked."),
    contenders,
    loserIndex,
    verdict: str(raw.verdict, `${contenders[loserIndex].name} is more cooked.`),
  };
}

export function normalizeGlow(raw: Record<string, unknown>): GlowUpResult {
  const out = {
    title: str(raw.title, "Your glow-up"),
    improved: str(raw.improved).replace(/^```[\w-]*\n?|```$/g, "").trim(),
    changes: strArr(raw.changes, 6),
  };
  if (!out.improved) throw new AIError("AI returned an empty glow-up", "bad_output", 502);
  return out;
}
