"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Copy, Flame as FlameIcon, Lock, RotateCcw, Share2, Swords, User, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { MODE_MAP, MODES, HEAT_LEVELS, type ModeId } from "@/lib/modes";
import type { Lang, RoastResponse, RoastResult, RoastSettings, Subject, Target } from "@/lib/types";
import { postJSON } from "@/lib/client/api";
import { loadHistory, newId, saveToHistory } from "@/lib/client/history";
import { EmberGlow } from "../Flame";
import { SubjectInput, emptyDraft, draftHasContent, type SubjectDraft } from "./SubjectInput";
import { HeatSlider, Segmented } from "./Controls";
import { LoadingRoast } from "./LoadingRoast";
import { BattleResult, SoloResult } from "./Results";
import { ClapBack } from "./ClapBack";
import { GlowUp } from "./GlowUp";
import { ShareSheet } from "./ShareSheet";

type Phase = "input" | "loading" | "result";

function toSubject(d: SubjectDraft): Subject {
  return {
    label: d.label.trim() || undefined,
    text: d.text.trim() || undefined,
    username: d.username.trim() || undefined,
    file: d.file ? { name: d.file.name, mimeType: d.file.mimeType, data: d.file.data } : undefined,
  };
}

function previewOf(d: SubjectDraft) {
  if (d.username) return `@${d.username.replace(/^@/, "")}`;
  if (d.file) return d.file.name;
  return d.text.trim().slice(0, 100);
}

function resultAsText(r: RoastResult) {
  if (r.kind === "solo") {
    return [
      `🔥 ${r.opener}`,
      "",
      ...r.roasts.map((x) => `• ${x}`),
      "",
      `Cooked meter: ${r.score}/100 (${r.scoreLabel})`,
      `“${r.verdict}”`,
    ].join("\n");
  }
  return [
    `🥊 ${r.opener}`,
    "",
    ...r.contenders.flatMap((c) => [`${c.name}: ${c.score}/100 (${c.scoreLabel})`, ...c.roasts.map((x) => `• ${x}`), ""]),
    `Verdict: ${r.verdict}`,
  ].join("\n");
}

export function RoastStudio({ modeId, initialBattle, historyId }: { modeId: ModeId; initialBattle: boolean; historyId?: string }) {
  const mode = MODE_MAP[modeId];
  const [phase, setPhase] = useState<Phase>("input");
  const [battle, setBattle] = useState(initialBattle);
  const [drafts, setDrafts] = useState<[SubjectDraft, SubjectDraft]>([emptyDraft(), emptyDraft()]);
  const [heat, setHeat] = useState<1 | 2 | 3 | 4>(2);
  const [lang, setLang] = useState<Lang>("en");
  const [target, setTarget] = useState<Target>("me");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [resultSettings, setResultSettings] = useState<RoastSettings | null>(null);
  const [lastSubjects, setLastSubjects] = useState<Subject[] | null>(null);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Restore remembered preferences
  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("roasted:prefs") || "{}");
      if ([1, 2, 3, 4].includes(prefs.heat)) setHeat(prefs.heat);
      if (prefs.lang === "en" || prefs.lang === "hinglish") setLang(prefs.lang);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("roasted:prefs", JSON.stringify({ heat, lang }));
    } catch {}
  }, [heat, lang]);

  // Open a past roast from history
  useEffect(() => {
    if (!historyId) return;
    const entry = loadHistory().find((e) => e.id === historyId);
    if (entry) {
      setResult(entry.result);
      setResultSettings(entry.settings);
      setLastSubjects(null);
      setPhase("result");
    }
  }, [historyId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const activeDrafts = battle ? drafts : [drafts[0]];
  const ready = activeDrafts.every((d) => draftHasContent(mode, d));

  const run = useCallback(
    async (subjects: Subject[], settings: RoastSettings, previews: string[]) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setError(null);
      setPhase("loading");
      try {
        const res = await postJSON<RoastResponse>("/api/roast", { ...settings, subjects }, ctrl.signal);
        setResult(res.result);
        setResultSettings(settings);
        setLastSubjects(subjects);
        setDemo(Boolean(res.demo));
        setRunId((x) => x + 1);
        setPhase("result");
        saveToHistory({
          id: newId(),
          createdAt: Date.now(),
          settings,
          subjectPreview: previews.join(" vs "),
          result: res.result,
        });
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const msg = (e as Error).message;
        setError(msg);
        toast.error(msg);
        setPhase("input");
      }
    },
    [],
  );

  function submit() {
    if (!ready) {
      toast.error(battle ? "Both contenders need to submit something." : "Give us something to roast first.");
      return;
    }
    const settings: RoastSettings = { mode: modeId, heat, lang, target: battle ? "friend" : target };
    run(activeDrafts.map(toSubject), settings, activeDrafts.map(previewOf));
  }

  function hotter() {
    if (!lastSubjects || !resultSettings) return;
    const next = Math.min(4, resultSettings.heat + 1) as 1 | 2 | 3 | 4;
    setHeat(next);
    run(lastSubjects, { ...resultSettings, heat: next }, activeDrafts.map(previewOf));
  }

  function startOver() {
    setResult(null);
    setError(null);
    setPhase("input");
    if (historyId) window.history.replaceState(null, "", `/roast/${modeId}`);
  }

  async function copyText() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(`${resultAsText(result)}\n\nGet roasted: ${location.origin}/roast/${modeId}`);
      toast.success("Roast copied to clipboard.");
    } catch {
      toast.error("Couldn't copy.");
    }
  }

  const roastSummary = useMemo(() => (result ? resultAsText(result) : ""), [result]);
  const heatInfo = HEAT_LEVELS[heat - 1];
  const isBattleView = phase === "result" ? result?.kind === "battle" : battle;
  const submitLabel = battle ? "Start the battle" : target === "friend" ? "Roast them" : "Roast me";
  const otherModes = MODES.filter((m) => m.id !== modeId).slice(0, 8);

  return (
    <div className="relative">
      <EmberGlow className="opacity-70" />
      <div ref={topRef} className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pb-28 pt-8 sm:px-6 sm:pt-12">
        {/* Title */}
        <div className="mb-8 flex flex-col gap-5">
          <Link href="/#modes" className="inline-flex min-h-10 w-fit items-center gap-2 text-sm text-muted transition hover:text-cream">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All modes
          </Link>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-card text-3xl sm:h-16 sm:w-16">
              {mode.emoji}
            </span>
            <div>
              <h1 className="font-display text-4xl leading-none text-cream sm:text-5xl">
                {isBattleView ? (
                  <>
                    {mode.name} <span className="italic text-ember">battle</span>
                  </>
                ) : (
                  <>
                    Roast my <span className="italic text-ember">{mode.name.toLowerCase()}</span>
                  </>
                )}
              </h1>
              <p className="mt-2 text-muted">{isBattleView ? `Two ${mode.battleNoun}s enter. One leaves cooked.` : mode.tagline}</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm text-cream">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden />
                  <div className="flex-1">
                    <p>{error}</p>
                  </div>
                  <button type="button" onClick={submit} className="shrink-0 font-semibold text-ember underline-offset-2 hover:underline">
                    Retry
                  </button>
                </div>
              )}

              <div className="rounded-[2rem] border border-line bg-card p-5 sm:p-8">
                <div className="mb-6 sm:max-w-xs">
                  <Segmented
                    label="Roast type"
                    layoutId="battle-toggle"
                    value={battle ? "battle" : "solo"}
                    onChange={(v) => setBattle(v === "battle")}
                    options={[
                      { value: "solo", label: <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden /> Solo</span> },
                      { value: "battle", label: <span className="inline-flex items-center gap-1.5"><Swords className="h-4 w-4" aria-hidden /> Battle</span> },
                    ]}
                  />
                </div>

                {battle ? (
                  <div className="relative grid gap-6 lg:grid-cols-2 lg:gap-10">
                    {[0, 1].map((i) => (
                      <div key={i} className={i === 1 ? "border-t border-line pt-6 lg:border-0 lg:pt-0" : ""}>
                        <SubjectInput
                          mode={mode}
                          value={drafts[i]}
                          battleIndex={i}
                          onSubmit={submit}
                          onChange={(d) => setDrafts((prev) => (i === 0 ? [d, prev[1]] : [prev[0], d]))}
                        />
                      </div>
                    ))}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-card font-display text-2xl italic text-ember lg:grid"
                    >
                      vs
                    </span>
                  </div>
                ) : (
                  <SubjectInput mode={mode} value={drafts[0]} onSubmit={submit} onChange={(d) => setDrafts((p) => [d, p[1]])} />
                )}
              </div>

              <div className="grid gap-5 rounded-[2rem] border border-line bg-card p-5 sm:p-8 md:grid-cols-[1.4fr_1fr]">
                <HeatSlider value={heat} onChange={setHeat} />
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-cream">Language</p>
                    <Segmented
                      label="Language"
                      layoutId="lang-toggle"
                      value={lang}
                      onChange={setLang}
                      options={[
                        { value: "en", label: "English" },
                        { value: "hinglish", label: "Hinglish 🇮🇳" },
                      ]}
                    />
                  </div>
                  {!battle && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-cream">Who are we roasting?</p>
                      <Segmented
                        label="Who are we roasting"
                        layoutId="target-toggle"
                        value={target}
                        onChange={setTarget}
                        options={[
                          { value: "me", label: <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" aria-hidden /> Me</span> },
                          { value: "friend", label: <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden /> A friend</span> },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 z-20 -mx-4 bg-gradient-to-t from-coal via-coal/95 to-transparent px-4 pb-4 pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0">
                <motion.button
                  type="button"
                  onClick={submit}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex min-h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full text-lg font-semibold transition ${
                    ready
                      ? "bg-ember text-coal shadow-[0_18px_50px_-15px_rgba(255,90,31,0.9)] hover:bg-ember-2"
                      : "bg-card-2 text-muted"
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <span className="relative">{submitLabel}</span>
                  <span className="relative text-xl" aria-hidden>
                    {heat === 4 ? "💀" : "🔥"}
                  </span>
                  <span className="relative hidden rounded-full bg-coal/15 px-2.5 py-0.5 text-xs font-semibold sm:inline">{heatInfo.name}</span>
                </motion.button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-faint">
                  <Lock className="h-3 w-3" aria-hidden /> We don&apos;t keep your stuff. Just your dignity.
                </p>
              </div>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingRoast mode={modeId} battle={battle} />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    setPhase("input");
                  }}
                  className="min-h-11 rounded-full px-5 text-sm text-faint transition hover:text-cream"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {phase === "result" && result && resultSettings && (
            <motion.div
              key={`result-${runId}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-6"
            >
              {result.kind === "solo" ? <SoloResult result={result} demo={demo} /> : <BattleResult result={result} demo={demo} />}

              {/* Action bar */}
              <div className="sticky bottom-0 z-20 -mx-4 bg-gradient-to-t from-coal via-coal/95 to-transparent px-4 pb-4 pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0">
                <div className="grid grid-cols-4 gap-2 rounded-[1.75rem] border border-line bg-card/95 p-2 backdrop-blur sm:flex sm:flex-wrap sm:justify-center sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0">
                  <ActionButton primary onClick={() => setShareOpen(true)} icon={<Share2 className="h-5 w-5" />} label="Share card" short="Share" />
                  <ActionButton onClick={copyText} icon={<Copy className="h-5 w-5" />} label="Copy text" short="Copy" />
                  {lastSubjects && (
                    <ActionButton
                      onClick={hotter}
                      icon={<FlameIcon className="h-5 w-5" />}
                      label={resultSettings.heat < 4 ? "Roast me hotter" : "Run it back"}
                      short={resultSettings.heat < 4 ? "Hotter" : "Again"}
                    />
                  )}
                  <ActionButton onClick={startOver} icon={<RotateCcw className="h-5 w-5" />} label="New roast" short="New" />
                </div>
              </div>

              {result.kind === "solo" && lastSubjects?.[0] && mode.glowUp && (
                <GlowUp key={`glow-${runId}`} mode={mode} lang={resultSettings.lang} subject={lastSubjects[0]} />
              )}

              {result.kind === "solo" && <ClapBack key={`clap-${runId}`} settings={resultSettings} roastSummary={roastSummary} />}

              {result.kind === "battle" && (
                <div className="rounded-[2rem] border border-line bg-card p-6 text-center sm:p-8">
                  <p className="font-display text-2xl text-cream">Demand a rematch?</p>
                  <p className="mt-1 text-sm text-muted">Swap in new contenders, or crank the heat and run it back.</p>
                </div>
              )}

              <section className="mt-6">
                <h2 className="mb-4 font-display text-3xl text-cream">Still standing? Try another.</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {otherModes.map((m) => (
                    <Link
                      key={m.id}
                      href={`/roast/${m.id}`}
                      className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-medium text-cream transition hover:-translate-y-0.5 hover:border-ember/50"
                    >
                      <span className="text-xl" aria-hidden>
                        {m.emoji}
                      </span>
                      {m.name}
                    </Link>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {result && resultSettings && (
        <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} result={result} settings={resultSettings} />
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  short,
  primary,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  short: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-medium transition sm:min-h-12 sm:flex-row sm:gap-2 sm:rounded-full sm:px-6 sm:text-sm ${
        primary
          ? "bg-ember text-coal hover:bg-ember-2"
          : "text-cream hover:bg-card-2 sm:border sm:border-line sm:hover:border-line-2 sm:hover:bg-card"
      }`}
    >
      <span aria-hidden>{icon}</span>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
