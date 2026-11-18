import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl italic text-ember">404</p>
      <h1 className="mt-4 font-display text-4xl text-cream">This page got roasted out of existence.</h1>
      <p className="mt-3 text-muted">Whatever you were looking for is ash now.</p>
      <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ember px-6 font-semibold text-coal transition hover:bg-ember-2">
        Back to safety
      </Link>
    </div>
  );
}
