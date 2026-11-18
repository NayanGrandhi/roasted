"use client";

import { motion } from "framer-motion";
import { Crown, HeartHandshake, Skull } from "lucide-react";
import type { BattleRoast, SoloRoast } from "@/lib/types";
import { CookedMeter } from "./CookedMeter";
import { useTypewriter } from "./useTypewriter";

const ease = [0.22, 1, 0.36, 1] as const;

export function SoloResult({ result, demo }: { result: SoloRoast; demo?: boolean }) {
  const typed = useTypewriter(result.opener, 18);
  const bulletsDelay = Math.min(result.opener.length * 0.018, 1.6) + 0.2;

  return (
    <div className="flex flex-col gap-6">
      {demo && <DemoBanner />}

      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-card px-6 py-10 sm:px-12 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-ember/15 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-ember">The opener</p>
        <h2
          className="relative mt-4 font-display text-[2.1rem] italic leading-[1.08] text-cream sm:text-5xl md:text-[3.5rem]"
          aria-label={result.opener}
        >
          <span aria-hidden>
            {typed}
            {typed.length < result.opener.length && <span className="ml-0.5 inline-block w-[0.06em] animate-pulse bg-ember">&nbsp;</span>}
          </span>
        </h2>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-[2rem] border border-line bg-card p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <Skull className="h-4 w-4 text-ember" aria-hidden /> The roast
          </h3>
          <ul className="mt-5 flex flex-col">
            {result.roasts.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: bulletsDelay + i * 0.18, duration: 0.45, ease }}
                className="flex gap-4 border-b border-line py-4 last:border-0"
              >
                <span className="mt-0.5 font-display text-2xl italic leading-none text-ember">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[15px] leading-relaxed text-cream/90 sm:text-base">{r}</p>
              </motion.li>
            ))}
          </ul>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: bulletsDelay, duration: 0.5, ease }}
          className="flex flex-col items-center justify-center gap-5 rounded-[2rem] border border-line bg-card p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Cooked meter</p>
          <CookedMeter score={result.score} label={result.scoreLabel} delay={bulletsDelay + 0.2} />
          <p className="border-t border-line pt-5 text-center font-display text-xl italic leading-snug text-cream/90">
            “{result.verdict}”
          </p>
        </motion.section>
      </div>

      {result.redemption.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: bulletsDelay + result.roasts.length * 0.18 + 0.3, duration: 0.5, ease }}
          className="rounded-[2rem] border border-mint/25 bg-gradient-to-b from-mint/[0.07] to-card p-6 sm:p-8"
        >
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-mint">
            <HeartHandshake className="h-4 w-4" aria-hidden /> The redemption arc
          </h3>
          <p className="mt-2 text-sm text-muted">Okay, jokes aside. Here&apos;s how to fix it:</p>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {result.redemption.map((r, i) => (
              <li key={i} className="rounded-2xl border border-line bg-coal/60 p-5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-mint/15 text-sm font-semibold text-mint">{i + 1}</span>
                <p className="mt-3 text-[15px] leading-relaxed text-cream/90">{r}</p>
              </li>
            ))}
          </ol>
        </motion.section>
      )}
    </div>
  );
}

export function BattleResult({ result, demo }: { result: BattleRoast; demo?: boolean }) {
  const typed = useTypewriter(result.opener, 16);
  const startDelay = Math.min(result.opener.length * 0.016, 1.4) + 0.2;
  return (
    <div className="flex flex-col gap-6">
      {demo && <DemoBanner />}
      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-card px-6 py-10 text-center sm:px-12 sm:py-12">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-ember/15 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-ember">Roast battle</p>
        <h2 className="relative mx-auto mt-4 max-w-3xl font-display text-[2rem] italic leading-[1.1] text-cream sm:text-5xl" aria-label={result.opener}>
          <span aria-hidden>{typed}</span>
        </h2>
      </section>

      <div className="relative grid gap-6 md:grid-cols-2">
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <span className="grid h-16 w-16 place-items-center rounded-full border border-line bg-coal font-display text-3xl italic text-ember">vs</span>
        </div>
        {result.contenders.map((c, i) => {
          const loser = i === result.loserIndex;
          return (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: startDelay + i * 0.2, duration: 0.5, ease }}
              className={`relative flex flex-col rounded-[2rem] border p-6 sm:p-8 ${
                loser ? "border-ember/60 bg-ember/[0.06] shadow-[0_20px_70px_-30px_rgba(255,90,31,0.7)]" : "border-line bg-card"
              }`}
            >
              <motion.span
                initial={{ opacity: 0, scale: 1.6, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: loser ? 6 : -4 }}
                transition={{ delay: startDelay + 2.2, type: "spring", stiffness: 300, damping: 14 }}
                className={`absolute -top-3 right-5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider ${
                  loser ? "bg-ember text-coal" : "bg-mint text-coal"
                }`}
              >
                {loser ? (
                  <>
                    <Skull className="h-3.5 w-3.5" aria-hidden /> More cooked
                  </>
                ) : (
                  <>
                    <Crown className="h-3.5 w-3.5" aria-hidden /> Survived
                  </>
                )}
              </motion.span>
              <h3 className="truncate pr-24 font-display text-4xl text-cream">{c.name}</h3>
              <div className="my-6 flex justify-center">
                <CookedMeter score={c.score} label={c.scoreLabel} size={200} delay={startDelay + 0.5 + i * 0.2} />
              </div>
              <ul className="flex flex-col">
                {c.roasts.map((r, j) => (
                  <li key={j} className="flex gap-3 border-t border-line py-3.5 text-[15px] leading-relaxed text-cream/90">
                    <span className="font-display text-xl italic leading-none text-ember">{j + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </motion.section>
          );
        })}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: startDelay + 2.4, duration: 0.5 }}
        className="rounded-[2rem] border border-line bg-card p-6 text-center sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">The verdict</p>
        <p className="mx-auto mt-3 max-w-3xl font-display text-3xl italic leading-snug text-cream sm:text-4xl">“{result.verdict}”</p>
      </motion.section>
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="rounded-2xl border border-heat-1/30 bg-heat-1/10 px-5 py-4 text-sm text-cream">
      <strong className="text-heat-1">Demo mode.</strong> These are placeholder roasts. Add a free{" "}
      <code className="rounded bg-coal px-1.5 py-0.5 font-mono text-xs">GEMINI_API_KEY</code> from{" "}
      <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline decoration-heat-1/50 underline-offset-2 hover:text-heat-1">
        aistudio.google.com/apikey
      </a>{" "}
      to get real ones.
    </div>
  );
}
