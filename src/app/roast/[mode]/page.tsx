import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODES, MODE_MAP, isModeId } from "@/lib/modes";
import { RoastStudio } from "@/components/studio/RoastStudio";

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ mode: string }> }): Promise<Metadata> {
  const { mode } = await params;
  if (!isModeId(mode)) return {};
  const m = MODE_MAP[mode];
  return {
    title: `Roast my ${m.name.toLowerCase()}`,
    description: `${m.tagline} Get your ${m.battleNoun} roasted by AI, then get real advice to fix it. Free, no login.`,
  };
}

export default async function RoastPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { mode } = await params;
  if (!isModeId(mode)) notFound();
  const sp = await searchParams;
  const historyId = typeof sp.h === "string" ? sp.h : undefined;
  return <RoastStudio key={`${mode}-${historyId ?? ""}`} modeId={mode} initialBattle={sp.battle === "1"} historyId={historyId} />;
}
