"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Share2, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import type { RoastResult, RoastSettings } from "@/lib/types";
import { renderShareCard } from "@/lib/client/shareCard";

export function ShareSheet({
  open,
  onClose,
  result,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  result: RoastResult;
  settings: RoastSettings;
}) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    setBlob(null);
    setUrl(null);
    renderShareCard(result, settings)
      .then((b) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(b);
        setBlob(b);
        setUrl(objectUrl);
      })
      .catch(() => toast.error("Couldn't create the share card."));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, result, settings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const filename = `roasted-${settings.mode}-${Date.now()}.png`;
  const file = blob ? new File([blob], filename, { type: "image/png" }) : null;
  const canNativeShare = typeof navigator !== "undefined" && !!file && !!navigator.canShare?.({ files: [file] });

  async function nativeShare() {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "I got roasted 🔥", text: `“${result.verdict}” Get roasted at ${location.origin}` });
    } catch (e) {
      if ((e as Error).name !== "AbortError") toast.error("Sharing failed. Try downloading instead.");
    }
  }

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success("Saved. Now post it.");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/roast/${settings.mode}`);
      toast.success("Link copied. Send it to someone who deserves it.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Share your roast"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="relative w-full max-w-md rounded-t-[2rem] border border-line bg-card p-5 sm:rounded-[2rem] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl text-cream">Share the damage</h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-card-2 hover:text-cream"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[19rem] overflow-hidden rounded-2xl border border-line bg-coal sm:max-w-[22rem]">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`Share card: ${result.verdict}`} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-ember" aria-label="Creating card" />
                </div>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {canNativeShare ? (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ember font-semibold text-coal transition hover:bg-ember-2"
                >
                  <Share2 className="h-4 w-4" aria-hidden /> Share
                </button>
              ) : null}
              <button
                type="button"
                onClick={download}
                disabled={!url}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-50 ${
                  canNativeShare ? "border border-line text-cream hover:border-line-2" : "bg-ember text-coal hover:bg-ember-2"
                }`}
              >
                <Download className="h-4 w-4" aria-hidden /> Download
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line font-medium text-cream transition hover:border-line-2"
              >
                <Link2 className="h-4 w-4" aria-hidden /> Copy link
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
