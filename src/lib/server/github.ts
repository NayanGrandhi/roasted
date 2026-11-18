import "server-only";

export class UserFacingError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function ghHeaders(raw = false): HeadersInit {
  const h: Record<string, string> = {
    "User-Agent": "roasted-app",
    Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

interface Repo {
  name: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
  archived: boolean;
  open_issues_count: number;
  topics?: string[];
}

const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function cleanUsername(input: string) {
  const u = input.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?github\.com\//i, "").split(/[/?#]/)[0];
  if (!USERNAME_RE.test(u)) throw new UserFacingError("That doesn't look like a valid GitHub username.");
  return u;
}

/** Fetch a public GitHub profile and summarise it as compact text for the model. */
export async function githubProfileSummary(rawUsername: string): Promise<{ username: string; summary: string }> {
  const username = cleanUsername(rawUsername);
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers: ghHeaders(),
    next: { revalidate: 600 },
  });
  if (userRes.status === 404) throw new UserFacingError(`No GitHub user called “${username}”. Even GitHub hasn't heard of you.`, 404);
  if (userRes.status === 403 || userRes.status === 429)
    throw new UserFacingError("GitHub is rate-limiting us right now. Try again in a bit.", 429);
  if (!userRes.ok) throw new UserFacingError("Couldn't load that GitHub profile.", 502);
  const user = await userRes.json();

  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, {
    headers: ghHeaders(),
    next: { revalidate: 600 },
  });
  const repos: Repo[] = reposRes.ok ? await reposRes.json() : [];

  let readme = "";
  try {
    const r = await fetch(`https://api.github.com/repos/${username}/${username}/readme`, {
      headers: ghHeaders(true),
      next: { revalidate: 600 },
    });
    if (r.ok) readme = (await r.text()).slice(0, 2500);
  } catch {
    /* no profile README */
  }

  const originals = repos.filter((r) => !r.fork);
  const forks = repos.filter((r) => r.fork);
  const langCount: Record<string, number> = {};
  for (const r of originals) if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
  const langs = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .map(([l, c]) => `${l} (${c})`)
    .slice(0, 8);
  const totalStars = originals.reduce((s, r) => s + r.stargazers_count, 0);
  const noDesc = originals.filter((r) => !r.description).length;
  const topStarred = [...originals].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
  const recent = repos.slice(0, 8);
  const lastPush = repos[0]?.pushed_at;
  const daysSincePush = lastPush ? Math.round((Date.now() - new Date(lastPush).getTime()) / 86_400_000) : null;
  const accountAgeYears = ((Date.now() - new Date(user.created_at).getTime()) / (365.25 * 86_400_000)).toFixed(1);

  const fmt = (r: Repo) =>
    `- ${r.name}${r.fork ? " (fork)" : ""}${r.archived ? " (archived)" : ""} — ${r.language || "no language"}, ★${r.stargazers_count}, last push ${r.pushed_at.slice(0, 10)}${r.description ? ` — "${r.description.slice(0, 120)}"` : " — no description"}`;

  const summary = [
    `GitHub user: ${user.login}${user.name ? ` (${user.name})` : ""}`,
    `Bio: ${user.bio ? `"${user.bio}"` : "none"}`,
    user.company ? `Company: ${user.company}` : null,
    user.blog ? `Website: ${user.blog}` : null,
    `Account age: ${accountAgeYears} years · Followers: ${user.followers} · Following: ${user.following}`,
    `Public repos: ${user.public_repos} (${originals.length} original, ${forks.length} forks in latest 100)`,
    `Total stars on originals: ${totalStars} · Originals with no description: ${noDesc}`,
    `Top languages: ${langs.join(", ") || "none"}`,
    daysSincePush !== null ? `Days since last push: ${daysSincePush}` : "Never pushed anything public",
    `\nMost-starred originals:\n${topStarred.map(fmt).join("\n") || "none"}`,
    `\nMost recently pushed:\n${recent.map(fmt).join("\n") || "none"}`,
    `\nAll repo names: ${repos.map((r) => r.name).join(", ").slice(0, 1500)}`,
    readme ? `\nProfile README (truncated):\n${readme}` : "\nNo profile README.",
  ]
    .filter(Boolean)
    .join("\n");

  return { username, summary };
}

const GH_BLOB = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i;
const GH_RAW = /^https?:\/\/raw\.githubusercontent\.com\//i;
const GIST = /^https?:\/\/gist\.github\.com\/[^/]+\/([a-f0-9]+)/i;

/** If text is just a GitHub file URL, fetch the file. Otherwise return as-is. */
export async function resolveCodeInput(text: string): Promise<string> {
  const t = text.trim();
  if (!/^https?:\/\/\S+$/.test(t)) return text;

  let rawUrl: string | null = null;
  const blob = t.match(GH_BLOB);
  if (blob) rawUrl = `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}`;
  else if (GH_RAW.test(t)) rawUrl = t;
  else {
    const gist = t.match(GIST);
    if (gist) {
      const g = await fetch(`https://api.github.com/gists/${gist[1]}`, { headers: ghHeaders() });
      if (!g.ok) throw new UserFacingError("Couldn't load that gist.");
      const data = await g.json();
      const files = Object.values(data.files || {}) as { filename: string; content: string }[];
      return files.map((f) => `// ${f.filename}\n${f.content}`).join("\n\n").slice(0, 30_000);
    }
  }
  if (!rawUrl) throw new UserFacingError("Only GitHub file links (github.com/…/blob/…) or gists are supported. Or just paste the code.");

  const res = await fetch(rawUrl, { headers: { "User-Agent": "roasted-app" } });
  if (!res.ok) throw new UserFacingError("Couldn't fetch that file. Is the repo public?");
  const body = await res.text();
  const filename = rawUrl.split("/").pop();
  return `// File: ${filename}\n${body.slice(0, 30_000)}`;
}
