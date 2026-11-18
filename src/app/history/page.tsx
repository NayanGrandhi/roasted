import type { Metadata } from "next";
import { HistoryList } from "@/components/HistoryList";

export const metadata: Metadata = { title: "Past roasts" };

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-5xl text-cream sm:text-6xl">
        Past <span className="italic text-ember">roasts</span>
      </h1>
      <p className="mt-3 text-muted">Saved only on this device. Nobody else can see these.</p>
      <HistoryList />
    </div>
  );
}
