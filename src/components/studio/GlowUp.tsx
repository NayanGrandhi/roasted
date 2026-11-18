"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { GlowUpResult, Lang, Subject } from "@/lib/types";
import type { ModeConfig } from "@/lib/modes";
import { postJSON } from "@/lib/client/api";

export function GlowUp({ mode, lang, subject }: { mode: ModeConfig; lang: Lang; subject: Subject }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<GlowUpResult | null>(null);
  const [copied, setCopied] = useState(false);
  if (!mode.glowUp) return null;

  async function run() {
    setState("loading");
    try {
      const { result } = await postJSON<{ result: GlowUpResult }>("/api/glowup", { mode: mode.id, lang, subject });
      setResult(result);
      setState("done");
    } catch (e) {
      toast.error((e as Error).message);
      setState("idle");
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.improved);
      setCopied(true);
      toast.success("Copied. Go glow.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy. Select the text manually.");
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-mint/25 bg-card">
      <AnimatePresence mode="wait" initial={false}>
        {state !== "done" ? (
          <motion.div
            key="cta"
            exit={{ opacity: 0 }}
            className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div>
              <h3 className="flex items-center gap-2 font-display text-3xl text-cream">
                <Sparkles className="h-6 w-6 text-mint" aria-hidden /> Glow-up
              </h3>
              <p className="mt-1 text-sm text-muted">{mode.glowUp.description}, ready to copy-paste.</p>
            </div>
            <button
              type="button"
              onClick={run}
              disabled={state === "loading"}
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-mint px-6 font-semibold text-coal transition hover:brightness-110 disabled:opacity-70"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Glowing you up…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden /> {mode.glowUp.label}
                </>
              )}
            </button>
          </motion.div>
        ) : (
          result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mint">Glow-up</p>
                  <h3 className="mt-2 font-display text-3xl text-cream sm:text-4xl">{result.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-sm text-cream transition hover:border-mint/60"
                >
                  {copied ? <Check className="h-4 w-4 text-mint" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre
                className={`scrollbar-thin mt-5 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-coal p-5 leading-relaxed text-cream/90 ${
                  mode.id === "code" ? "font-mono text-[13px]" : "font-sans text-[15px]"
                }`}
              >
                {result.improved}
              </pre>
              {result.changes.length > 0 && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {result.changes.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint" aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </section>
  );
}
