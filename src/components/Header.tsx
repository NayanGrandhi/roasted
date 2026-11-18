import Link from "next/link";
import { History } from "lucide-react";
import { Flame } from "./Flame";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-coal/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2" aria-label="Roasted home">
          <Flame className="h-7 w-6" />
          <span className="font-display text-[1.7rem] italic leading-none tracking-tight text-cream">Roasted</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/#modes"
            className="hidden rounded-full px-4 py-2 text-muted transition hover:bg-card hover:text-cream sm:inline-flex"
          >
            Modes
          </Link>
          <Link
            href="/roast/github?battle=1"
            className="hidden rounded-full px-4 py-2 text-muted transition hover:bg-card hover:text-cream sm:inline-flex"
          >
            Roast Battle
          </Link>
          <Link
            href="/history"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 py-2 text-muted transition hover:border-line-2 hover:text-cream"
          >
            <History className="h-4 w-4" aria-hidden />
            <span>Past roasts</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
