"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ModeId } from "@/lib/modes";
import { Flame } from "../Flame";

const COMMON = [
  "Consulting the roast council…",
  "Sharpening insults…",
  "Preheating the oven to 450°…",
  "Asking your mom for embarrassing stories…",
  "This is going to hurt…",
  "Choosing violence…",
  "Writing jokes your therapist will hear about…",
];

const BY_MODE: Partial<Record<ModeId, string[]>> = {
  resume: ["Reading your resume… oh no.", "Counting the buzzwords…", "Googling ‘synergy’…"],
  code: ["Running your code… it ran away.", "Counting nested ifs…", "Looking for tests… none found."],
  github: ["Scrolling your 47 forks…", "Checking your commit streak… yikes.", "Reading repo names named ‘test2’…"],
  music: ["Listening to your top artists… sorry.", "Diagnosing your emotional state…"],
  linkedin: ["Agreeing with your thought leadership…", "Counting the 🚀 emojis…"],
  startup: ["Calculating your TAM (it's 4 people)…", "Pitching to a disappointed VC…"],
  room: ["Untangling your cables…", "Judging that poster…"],
  outfit: ["Consulting the fashion police…", "Zooming in on those shoes…"],
  chat: ["Reading your DMs… out loud.", "Counting your double texts…"],
};

export function LoadingRoast({ mode, battle }: { mode: ModeId; battle: boolean }) {
  const lines = [...(BY_MODE[mode] || []), ...(battle ? ["Ringing the bell…", "Two enter. One leaves cooked."] : []), ...COMMON];
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % lines.length), 2200);
    const e = setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => {
      clearInterval(t);
      clearInterval(e);
    };
  }, [lines.length]);

  const grow = Math.min(1 + elapsed * 0.06, 1.9);

  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center px-4 text-center" role="status" aria-live="polite">
      <div className="relative grid h-48 place-items-end">
        <div
          aria-hidden
          className="absolute bottom-0 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-ember/30 blur-3xl transition-all duration-1000"
          style={{ transform: `translateX(-50%) scale(${grow})` }}
        />
        <motion.div animate={{ scale: grow }} transition={{ duration: 1, ease: "easeOut" }} className="origin-bottom">
          <Flame className="h-24 w-20" />
        </motion.div>
      </div>
      <div className="mt-10 h-16">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
            className="font-display text-3xl italic text-cream sm:text-4xl"
          >
            {lines[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="mt-4 text-sm text-faint">
        {elapsed < 12 ? "Good roasts take a few seconds." : "Still cooking. Big submissions take longer."}
      </p>
    </div>
  );
}
