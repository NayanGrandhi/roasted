"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleReply, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage, RoastSettings } from "@/lib/types";
import { postJSON } from "@/lib/client/api";
import { Flame } from "../Flame";

const STARTERS = ["That's not even true 😤", "My mom thinks it's great", "Roast yourself, bot", "Okay fine, how do I fix it?"];

export function ClapBack({ settings, roastSummary }: { settings: RoastSettings; roastSummary: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: t.slice(0, 600) }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await postJSON<{ reply: string }>("/api/clapback", { ...settings, roastSummary, messages: next });
      setMessages((m) => [...m, { role: "roaster", text: reply }]);
    } catch (e) {
      toast.error((e as Error).message);
      setMessages((m) => m.slice(0, -1));
      setInput(t);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-line bg-card p-6 sm:p-8">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
        <MessageCircleReply className="h-4 w-4 text-ember" aria-hidden /> Clap back
      </h3>
      <p className="mt-2 text-sm text-muted">Think that was unfair? Argue your case. It might respect you. It probably won&apos;t.</p>

      {messages.length > 0 && (
        <div className="scrollbar-thin mt-5 flex max-h-96 flex-col gap-3 overflow-y-auto pr-1" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${
                    m.role === "user" ? "rounded-br-lg bg-cream text-coal" : "rounded-bl-lg border border-line bg-card-2 text-cream"
                  }`}
                >
                  {m.text}
                </p>
              </motion.div>
            ))}
            {busy && (
              <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-faint">
                <Flame className="h-5 w-4" /> cooking up a response…
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              className="min-h-10 rounded-full border border-line px-4 text-sm text-muted transition hover:border-ember/50 hover:text-cream disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex items-center gap-2 rounded-full border border-line bg-coal p-1.5 pl-5 transition focus-within:border-ember/60"
      >
        <label htmlFor="clapback" className="sr-only">
          Your clap back
        </label>
        <input
          id="clapback"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your comeback…"
          maxLength={600}
          autoComplete="off"
          className="min-h-11 flex-1 bg-transparent text-cream placeholder:text-faint focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember text-coal transition hover:bg-ember-2 disabled:bg-line disabled:text-faint"
          aria-label="Send"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </form>
    </section>
  );
}
