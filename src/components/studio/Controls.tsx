"use client";

import { motion } from "framer-motion";
import { HEAT_LEVELS } from "@/lib/modes";

export function HeatSlider({ value, onChange }: { value: 1 | 2 | 3 | 4; onChange: (v: 1 | 2 | 3 | 4) => void }) {
  const h = HEAT_LEVELS[value - 1];
  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <label htmlFor="heat" className="text-sm font-medium text-cream">
          Heat level
        </label>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-right"
        >
          <span className="text-sm font-semibold" style={{ color: h.color }}>
            {h.chili} {h.name}
          </span>
          <span className="ml-2 hidden text-xs text-faint sm:inline">{h.blurb}</span>
        </motion.div>
      </div>
      <input
        id="heat"
        type="range"
        min={1}
        max={4}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as 1 | 2 | 3 | 4)}
        className="heat"
        style={{ ["--thumb" as string]: h.color }}
        aria-valuetext={`${h.name}: ${h.blurb}`}
      />
      <div className="-mt-1 flex justify-between text-[11px] text-faint">
        {HEAT_LEVELS.map((l) => (
          <button
            type="button"
            key={l.level}
            onClick={() => onChange(l.level)}
            className={`min-h-8 px-0.5 transition ${
              l.level === value ? "text-cream" : "hover:text-muted"
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  layoutId: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-line bg-coal p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative min-h-10 flex-1 rounded-full px-3 text-sm font-medium transition ${
              active ? "text-coal" : "text-muted hover:text-cream"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-cream"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
