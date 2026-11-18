"use client";

import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, ImagePlus, Loader2, UploadCloud, X, AtSign } from "lucide-react";
import { toast } from "sonner";
import type { ModeConfig } from "@/lib/modes";
import type { SubjectFile } from "@/lib/types";
import { FileError, prepareFile } from "@/lib/client/files";

export interface SubjectDraft {
  label: string;
  text: string;
  username: string;
  file: (SubjectFile & { previewUrl?: string }) | null;
}

export const emptyDraft = (): SubjectDraft => ({ label: "", text: "", username: "", file: null });

export function draftHasContent(mode: ModeConfig, d: SubjectDraft) {
  if (mode.accepts.username) return d.username.trim().length > 0;
  return Boolean(d.file) || d.text.trim().length > 0;
}

interface Props {
  mode: ModeConfig;
  value: SubjectDraft;
  onChange: (d: SubjectDraft) => void;
  battleIndex?: number; // set when in battle mode
  onSubmit?: () => void;
}

export function SubjectInput({ mode, value, onChange, battleIndex, onSubmit }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { accepts } = mode;
  const inBattle = battleIndex !== undefined;

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file || !accepts.file) return;
      setProcessing(true);
      try {
        const prepared = await prepareFile(file, accepts.file.kinds);
        onChange({ ...value, file: prepared });
      } catch (e) {
        toast.error(e instanceof FileError ? e.message : "Couldn't use that file.");
      } finally {
        setProcessing(false);
      }
    },
    [accepts.file, onChange, value],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    if (!accepts.file) return;
    const item = Array.from(e.clipboardData.items).find((i) => i.kind === "file");
    if (item) {
      e.preventDefault();
      handleFile(item.getAsFile());
    }
  };

  return (
    <div className="flex flex-col gap-4" onPaste={onPaste}>
      {inBattle && (
        <div>
          <label htmlFor={`${id}-label`} className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-faint">
            Contender {battleIndex! + 1} name
          </label>
          <input
            id={`${id}-label`}
            value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value.slice(0, 40) })}
            placeholder={accepts.username ? "Optional (defaults to username)" : battleIndex === 0 ? "e.g. Rahul" : "e.g. Priya"}
            className="min-h-12 w-full rounded-2xl border border-line bg-coal px-4 text-cream placeholder:text-faint focus:border-ember/60 focus:outline-none"
          />
        </div>
      )}

      {accepts.username && (
        <div>
          <label htmlFor={`${id}-user`} className="mb-2 block text-sm font-medium text-cream">
            {accepts.username.label}
          </label>
          <div className="flex min-h-14 items-center gap-2 rounded-2xl border border-line bg-coal px-4 transition focus-within:border-ember/60 focus-within:shadow-[0_0_0_4px_rgba(255,90,31,0.12)]">
            <AtSign className="h-5 w-5 shrink-0 text-faint" aria-hidden />
            <input
              id={`${id}-user`}
              value={value.username}
              onChange={(e) => onChange({ ...value, username: e.target.value.trim() })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit?.();
                }
              }}
              placeholder={accepts.username.placeholder}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-full w-full bg-transparent text-lg text-cream placeholder:text-faint focus:outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-faint">Public profile data only. No login needed.</p>
        </div>
      )}

      {accepts.file && (
        <div>
          <p className="mb-2 text-sm font-medium text-cream">{accepts.file.label}</p>
          <AnimatePresence mode="wait" initial={false}>
            {value.file ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative flex items-center gap-4 rounded-2xl border border-ember/40 bg-ember/5 p-3"
              >
                {value.file.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value.file.previewUrl}
                    alt="Your upload"
                    className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-card-2 sm:h-24 sm:w-24">
                    <FileText className="h-9 w-9 text-ember" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-cream">{value.file.name}</p>
                  <p className="mt-0.5 text-sm text-muted">Ready to be roasted 🔥</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ ...value, file: null })}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-card-2 hover:text-cream"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="drop"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`group flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition duration-300 ${
                  dragging
                    ? "scale-[1.01] border-ember bg-ember/10 shadow-[0_0_60px_-10px_rgba(255,90,31,0.6)]"
                    : "border-line-2 bg-coal hover:border-ember/50 hover:bg-ember/[0.03]"
                }`}
              >
                {processing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-ember" aria-hidden />
                ) : dragging ? (
                  <span className="text-4xl" aria-hidden>
                    🔥
                  </span>
                ) : accepts.file.kinds.includes("pdf") ? (
                  <UploadCloud className="h-8 w-8 text-faint transition group-hover:text-ember" aria-hidden />
                ) : (
                  <ImagePlus className="h-8 w-8 text-faint transition group-hover:text-ember" aria-hidden />
                )}
                <div>
                  <p className="font-medium text-cream">
                    {processing ? "Preparing…" : dragging ? "Drop it. We'll light it up." : "Drag & drop, or tap to upload"}
                  </p>
                  <p className="mt-1 text-sm text-faint">
                    {accepts.file.kinds.includes("pdf") ? "PDF up to 4MB, or any image" : "JPG, PNG, WebP · you can also paste"}
                  </p>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
          <input
            ref={inputRef}
            type="file"
            accept={accepts.file.accept}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {accepts.text && (
        <div>
          <label htmlFor={`${id}-text`} className="mb-2 block text-sm font-medium text-cream">
            {accepts.text.label}
          </label>
          <textarea
            id={`${id}-text`}
            value={value.text}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
            onKeyDown={onKeyDown}
            placeholder={accepts.text.placeholder}
            rows={accepts.file ? 4 : inBattle ? 7 : 9}
            spellCheck={!accepts.text.mono}
            className={`scrollbar-thin w-full resize-y rounded-2xl border border-line bg-coal px-4 py-3.5 text-cream placeholder:text-faint transition focus:border-ember/60 focus:shadow-[0_0_0_4px_rgba(255,90,31,0.12)] focus:outline-none ${
              accepts.text.mono ? "font-mono text-[13px] leading-relaxed" : "text-[15px] leading-relaxed"
            }`}
          />
          <div className="mt-1.5 flex justify-between text-xs text-faint">
            <span className="hidden sm:inline">⌘/Ctrl + Enter to roast</span>
            {value.text.length > 0 && <span className="ml-auto">{value.text.length.toLocaleString()} chars</span>}
          </div>
        </div>
      )}
    </div>
  );
}
