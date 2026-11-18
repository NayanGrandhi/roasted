# 🔥 Roasted

Get absolutely cooked by AI. Roast your resume, code, GitHub, music taste, LinkedIn, startup idea, room, outfit or texting game, then get real advice to fix it.

**Features:** 9 roast modes · 4 heat levels (Mild → Gordon Ramsay) · English / Hinglish · Roast yourself or a friend · Roast Battle (two contenders, one loser) · Clap back (argue with the roast) · Glow-up (rewritten resume, LinkedIn, pitch, GitHub bio or refactored code) · Shareable 1080×1350 card · Past roasts saved on-device · No login, no database.

**Everything is free:** Google Gemini free tier for the AI, Vercel Hobby for hosting.

---

## Run it locally (5 minutes)

You need [Node.js 20+](https://nodejs.org).

1. **Get a free AI key.** Go to https://aistudio.google.com/apikey, sign in with Google, click **Create API key**, and copy it.
2. **Set up the project.** In this folder:
   ```bash
   npm install
   cp .env.example .env.local
   ```
   Open `.env.local` and paste your key after `GEMINI_API_KEY=`.
3. **Start it.**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and get roasted.

> No key yet? It still runs in **demo mode** with placeholder roasts so you can explore the UI.

## Put it online free (Vercel)

1. Create a free GitHub repo and push this folder:
   ```bash
   git init && git add . && git commit -m "Roasted"
   git branch -M main
   git remote add origin https://github.com/<you>/roasted.git
   git push -u origin main
   ```
2. Go to https://vercel.com/new (sign up free with GitHub), and **import** the repo.
3. Under **Environment Variables**, add `GEMINI_API_KEY` with your key. Click **Deploy**.
4. Done. You get a free `your-app.vercel.app` URL. Optionally add `NEXT_PUBLIC_SITE_URL` with that URL and redeploy.

## Good to know

- **Free-tier limits.** Gemini's free tier has per-minute and per-day request caps. If the main model hits its cap, the app automatically falls back to `gemini-3.5-flash-lite`, and if Google has retired both names it asks the API for a current Flash model automatically. If both are capped, users see a friendly "try again in a minute" message. The built-in rate limit (20 roasts/IP/hour) helps protect your quota.
- **Privacy.** Uploads aren't stored anywhere. Note that on Gemini's free tier Google may use requests to improve its products; the in-app Privacy page says so.
- **Uploads.** Images are compressed in the browser. PDFs must be under 4MB (Vercel's free plan caps request size at 4.5MB).
- **GitHub mode** uses GitHub's public API (60 requests/hour per server without a token). Add a free `GITHUB_TOKEN` if it gets popular.
- **Models change.** If Google retires a model name, set `GEMINI_MODEL` to a current free Flash model listed at https://ai.google.dev/gemini-api/docs/models.

## Customise

| What | Where |
|---|---|
| Modes, teasers, what each mode roasts | `src/lib/modes.ts` |
| Roast personality, heat levels, safety rules, examples | `src/lib/server/prompts.ts` |
| Colors and fonts | `src/app/globals.css` |
| Share card design | `src/lib/client/shareCard.ts` |
| Loading messages | `src/components/studio/LoadingRoast.tsx` |

Tip: roast quality depends most on the examples in `prompts.ts`. Try a few roasts and tune them.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Gemini REST API (no SDK) · self-hosted fonts (Instrument Serif, Inter, JetBrains Mono).
