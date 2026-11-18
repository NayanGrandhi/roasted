"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, msPerChar = 20) {
  const [out, setOut] = useState("");
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    // Cap total animation time at ~1.6s for long lines
    const step = Math.max(1, Math.ceil(text.length / (1600 / msPerChar)));
    const t = setInterval(() => {
      i += step;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, msPerChar);
    return () => clearInterval(t);
  }, [text, msPerChar]);
  return out;
}
