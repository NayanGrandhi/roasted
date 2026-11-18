"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { HistoryEntry } from "@/lib/types";
import { MODE_MAP, HEAT_LEVELS } from "@/lib/modes";
import { clearHistory, deleteFromHistory, loadHistory } from "@/lib/client/history";
import { scoreColor } from "./studio/CookedMeter";

function timeAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(ts).toLocaleDateString();
}

export function HistoryList() {
  const [items, setItems] = useState<HistoryEntry[] | null>(null);
  useEffect(() => setItems(loadHistory()), []);

  if (items === null) return <div className="mt-10 h-40 animate-pulse rounded-3xl bg-card" />;

  if (!items.length) {
    return (
      <div className="mt-10 rounded-[2rem] border border-dashed border-line-2 bg-card/50 px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden>
          🧯
        </p>
        <p className="mt-4 font-display text-3xl text-cream">Nothing&apos;s been roasted yet.</p>
        <p className="mt-2 text-muted">Suspiciously fireproof. Let&apos;s change that.</p>
        <Link
          href="/#modes"
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ember px-6 font-semibold text-coal transition hover:bg-ember-2"
        >
          Get roasted
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-faint">{items.length} roast{items.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          onClick={() => {
            if (!confirmClear()) return;
            clearHistory();
            setItems([]);
            toast.success("History cleared. Fresh start, same flaws.");
          }}
          className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-muted transition hover:text-ember"
        >
          <Trash2 className="h-4 w-4" aria-hidden /> Delete all
        </button>
      </div>
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {items.map((e) => {
            const m = MODE_MAP[e.settings.mode];
            if (!m) return null;
            const score =
              e.result.kind === "solo" ? e.result.score : e.result.contenders[e.result.loserIndex].score;
            return (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-stretch gap-2 rounded-3xl border border-line bg-card transition hover:border-line-2"
              >
                <Link href={`/roast/${e.settings.mode}?h=${e.id}`} className="flex min-w-0 flex-1 items-center gap-4 p-4 sm:p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card-2 text-2xl">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-faint">
                      <span className="font-medium text-muted">{m.name}</span>
                      {e.result.kind === "battle" && (
                        <span className="inline-flex items-center gap-1 text-ember">
                          <Swords className="h-3 w-3" aria-hidden /> Battle
                        </span>
                      )}
                      <span>· {HEAT_LEVELS[e.settings.heat - 1]?.name}</span>
                      <span>· {timeAgo(e.createdAt)}</span>
                    </div>
                    <p className="mt-1 truncate font-display text-xl italic text-cream">{e.result.opener}</p>
                    {e.subjectPreview && <p className="mt-0.5 truncate text-xs text-faint">{e.subjectPreview}</p>}
                  </div>
                  <span className="hidden font-display text-3xl tabular-nums sm:block" style={{ color: scoreColor(score) }}>
                    {score}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    deleteFromHistory(e.id);
                    setItems((x) => x?.filter((i) => i.id !== e.id) ?? []);
                  }}
                  className="grid w-12 shrink-0 place-items-center rounded-r-3xl text-faint transition hover:bg-card-2 hover:text-ember"
                  aria-label="Delete this roast"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function confirmClear() {
  // Native confirm keeps it dependency-free and accessible.
  return window.confirm("Delete all past roasts from this device?");
}
