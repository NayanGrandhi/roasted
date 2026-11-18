import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Made with <span aria-label="fire">🔥</span> · Roasts are AI-generated jokes. Don&apos;t take them personally. Take the
          advice though.
        </p>
        <div className="flex gap-5">
          <Link href="/privacy" className="transition hover:text-cream">
            Privacy
          </Link>
          <Link href="/history" className="transition hover:text-cream">
            Past roasts
          </Link>
        </div>
      </div>
    </footer>
  );
}
