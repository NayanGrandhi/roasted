import Link from "next/link";
import { ArrowDown, ArrowUpRight, Swords, ShieldCheck, Sparkles, MessageCircleReply } from "lucide-react";
import { MODES } from "@/lib/modes";
import { EmberGlow, Flame } from "@/components/Flame";
import { Reveal } from "@/components/Reveal";

export default function Home() {
  const ticker = [...MODES, ...MODES];
  return (
    <div className="relative">
      <EmberGlow />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <Reveal>
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Free · No login · We don&apos;t keep your files
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mx-auto mt-8 max-w-4xl font-display text-[3.4rem] leading-[0.95] tracking-tight text-cream sm:text-7xl md:text-[6.5rem]">
            Get absolutely{" "}
            <span className="relative inline-flex items-baseline italic text-ember">
              cooked.
              <Flame className="absolute -right-8 bottom-3 h-9 w-7 sm:-right-12 sm:bottom-auto sm:-top-8 sm:h-14 sm:w-11" />
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted sm:text-lg">
            Drop your resume, code, GitHub, playlist, outfit or startup idea. Our AI roasts it with surgical precision,
            then tells you how to actually fix it.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#modes"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ember px-7 py-3 font-semibold text-coal shadow-[0_10px_40px_-10px_rgba(255,90,31,0.8)] transition hover:-translate-y-0.5 hover:bg-ember-2 active:translate-y-0"
            >
              Pick your poison <ArrowDown className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/roast/github?battle=1"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-2 px-7 py-3 font-medium text-cream transition hover:border-ember/60 hover:bg-card"
            >
              <Swords className="h-4 w-4 text-ember" aria-hidden /> Start a Roast Battle
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-line/70 bg-card/40 py-4 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-[ticker_60s_linear_infinite] gap-10 motion-reduce:animate-none">
          {ticker.map((m, i) => (
            <p key={i} className="flex shrink-0 items-center gap-3 font-display text-xl italic text-muted">
              <span className="not-italic">{m.emoji}</span>
              {m.teaser}
            </p>
          ))}
        </div>
      </div>

      {/* Modes */}
      <section id="modes" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-ember">Choose your roast</p>
            <h2 className="mt-2 font-display text-4xl text-cream sm:text-5xl">What are we cooking today?</h2>
          </div>
          <p className="max-w-xs text-sm text-muted">Every mode works solo, as a battle against a friend, or as a roast of a friend.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m, i) => (
            <Reveal key={m.id} delay={Math.min(i * 0.04, 0.3)} className="h-full">
              <Link
                href={`/roast/${m.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-ember/50 hover:shadow-[0_20px_60px_-25px_rgba(255,90,31,0.55)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-ember/0 blur-3xl transition duration-500 group-hover:bg-ember/20"
                />
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-card-2 text-2xl transition group-hover:scale-110 group-hover:border-ember/40">
                    {m.emoji}
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 text-faint transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-cream">{m.name}</h3>
                <p className="mt-1 text-sm text-muted">{m.tagline}</p>
                <p className="mt-5 border-t border-line pt-4 font-display text-[1.1rem] italic leading-snug text-cream/80">
                  {m.teaser}
                </p>
                {m.glowUp && (
                  <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-mint/10 px-2.5 py-1 text-[11px] font-medium text-mint">
                    <Sparkles className="h-3 w-3" aria-hidden /> Glow-up included
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Swords,
              title: "Roast Battle",
              body: "Pit two GitHubs, resumes or outfits against each other. The AI roasts both and crowns the more cooked one.",
            },
            {
              icon: MessageCircleReply,
              title: "Clap back",
              body: "Think the roast was unfair? Argue with it. It defends itself, or gets even meaner.",
            },
            {
              icon: Sparkles,
              title: "Glow-up",
              body: "After the burn, get a rewritten resume, LinkedIn, pitch or refactored code you can copy straight away.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06} className="h-full">
              <div className="h-full rounded-3xl border border-line bg-gradient-to-b from-card to-coal p-7">
                <Icon className="h-6 w-6 text-ember" aria-hidden />
                <h3 className="mt-4 font-display text-3xl text-cream">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-faint">
          <ShieldCheck className="h-4 w-4 text-mint" aria-hidden /> We roast choices, never who you are. Files are processed
          and forgotten.
        </p>
      </section>
    </div>
  );
}
