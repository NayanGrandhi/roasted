import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-5xl text-cream">Privacy, minus the legalese</h1>
      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-muted">
        <p>
          <strong className="text-cream">We don&apos;t store your uploads.</strong> Your resume, photos, code or text are sent to
          our server only to generate the roast, passed to the AI model, and then discarded. There&apos;s no database.
        </p>
        <p>
          <strong className="text-cream">The AI.</strong> Roasts are generated with Google&apos;s Gemini API. On the free tier,
          Google may use submitted content to improve its products, so don&apos;t upload anything you wouldn&apos;t want a
          stranger to read: blur phone numbers, addresses and other private details first.
        </p>
        <p>
          <strong className="text-cream">History lives on your device.</strong> Past roasts are saved in your browser&apos;s
          local storage. Clear them anytime from the Past roasts page.
        </p>
        <p>
          <strong className="text-cream">GitHub mode</strong> reads public profile data from GitHub&apos;s API. Nothing private.
        </p>
        <p>
          <strong className="text-cream">Be kind-ish.</strong> Roasts target choices and work, never who someone is. Only roast
          friends who&apos;d laugh about it.
        </p>
      </div>
    </div>
  );
}
