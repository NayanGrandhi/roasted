"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export function scoreColor(score: number) {
  if (score < 25) return "#f5c542";
  if (score < 50) return "#ff8a2a";
  if (score < 75) return "#ff4d2e";
  return "#e11d48";
}

export function CookedMeter({
  score,
  label,
  size = 220,
  delay = 0.4,
}: {
  score: number;
  label: string;
  size?: number;
  delay?: number;
}) {
  const progress = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const r = 80;
  const circ = Math.PI * r; // half circle
  const dash = useTransform(progress, (v) => `${(v / 100) * circ} ${circ}`);
  // Needle: 66px long, sweeping from left (180°) to right (0°)
  const nx = useTransform(progress, (v) => 100 + 66 * Math.cos(Math.PI - (v / 100) * Math.PI));
  const ny = useTransform(progress, (v) => 100 - 66 * Math.sin(Math.PI - (v / 100) * Math.PI));

  useEffect(() => {
    const controls = animate(progress, score, {
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [score, delay, progress]);

  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 118" width={size} height={size * 0.59} role="img" aria-label={`Cooked meter: ${score} out of 100, ${label}`}>
        <defs>
          <linearGradient id="meter-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#f5c542" />
            <stop offset="40%" stopColor="#ff8a2a" />
            <stop offset="70%" stopColor="#ff4d2e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#2a2420" strokeWidth="16" strokeLinecap="round" />
        <motion.path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#meter-grad)"
          strokeWidth="16"
          strokeLinecap="round"
          style={{ strokeDasharray: dash }}
        />
        <motion.line x1={100} y1={100} x2={nx} y2={ny} stroke="#f5ede3" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="100" r="7" fill="#f5ede3" />
      </svg>
      <div className="-mt-1 text-center">
        <p className="font-display text-5xl leading-none text-cream tabular-nums">
          {display}
          <span className="text-2xl text-faint">/100</span>
        </p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 1.2 }}
          className="mt-2 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {label}
        </motion.p>
      </div>
    </div>
  );
}
