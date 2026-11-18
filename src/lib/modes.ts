export type ModeId =
  | "resume"
  | "code"
  | "github"
  | "music"
  | "linkedin"
  | "startup"
  | "room"
  | "outfit"
  | "chat";

export interface ModeConfig {
  id: ModeId;
  name: string;
  emoji: string;
  tagline: string;
  /** Short example roast shown on the home card */
  teaser: string;
  /** Which inputs this mode accepts */
  accepts: {
    text?: { label: string; placeholder: string; mono?: boolean };
    file?: { label: string; accept: string; kinds: ("image" | "pdf")[] };
    username?: { label: string; placeholder: string };
  };
  /** Whether the "Glow-up" (improved rewrite) feature is offered */
  glowUp?: { label: string; description: string };
  /** What to call a subject in battle mode */
  battleNoun: string;
  /** Mode-specific instruction for the roaster */
  focus: string;
  /** Mode-specific instruction for the glow-up writer */
  glowFocus?: string;
}

export const MODES: ModeConfig[] = [
  {
    id: "resume",
    name: "Resume",
    emoji: "📄",
    tagline: "Your CV, but honest.",
    teaser: "“Proficient in Microsoft Word” in 2026 is a cry for help.",
    accepts: {
      file: { label: "Upload resume (PDF or image)", accept: "application/pdf,image/*", kinds: ["pdf", "image"] },
      text: { label: "…or paste it", placeholder: "Paste your resume text here" },
    },
    glowUp: { label: "Glow-up my resume", description: "Rewritten bullets that actually get interviews" },
    battleNoun: "resume",
    focus:
      "Roast the resume: buzzwords, vague bullet points with no metrics, formatting crimes, filler skills, objective statements, job-hopping, inflated titles, weird hobbies, length. Reference exact phrases from it.",
    glowFocus:
      "Rewrite the resume content: a sharp 2-line summary, then the strongest experience bullets rewritten with action verbs and quantified impact (use [X%] placeholders where numbers are unknown), a cleaned-up skills line. Keep facts truthful — never invent employers or degrees.",
  },
  {
    id: "code",
    name: "Code",
    emoji: "💻",
    tagline: "Your code review, minus the politeness.",
    teaser: "Seven nested ifs. This isn't code, it's a Russian doll.",
    accepts: {
      text: {
        label: "Paste code or a GitHub file link",
        placeholder: "function doEverything(data) {\n  // paste your crimes here\n}\n\nor https://github.com/user/repo/blob/main/file.js",
        mono: true,
      },
    },
    glowUp: { label: "Glow-up my code", description: "A cleaner, refactored version" },
    battleNoun: "code snippet",
    focus:
      "Roast the code: naming, nesting, duplication, magic numbers, missing error handling, commented-out graveyards, over-engineering, security sins, language-specific anti-patterns. Quote actual identifiers and lines.",
    glowFocus:
      "Refactor the code: same behaviour, better names, less nesting, proper error handling, idiomatic for the language. Return the refactored code only in `improved` (no markdown fences), and list the key changes.",
  },
  {
    id: "github",
    name: "GitHub",
    emoji: "🐙",
    tagline: "Your commit history has a story. A sad one.",
    teaser: "14 repos named “test”. You're not a developer, you're a tester of nothing.",
    accepts: {
      username: { label: "GitHub username", placeholder: "torvalds" },
    },
    glowUp: { label: "Glow-up my profile", description: "A new bio + profile README you can paste" },
    battleNoun: "GitHub profile",
    focus:
      "Roast the GitHub profile using the provided data: repo names, forks vs originals, languages, stars, empty descriptions, abandoned projects, commit recency, bio, follower ratio, tutorial clones, README. Reference specific repos by name.",
    glowFocus:
      "Write an improved GitHub bio (under 160 chars) and a short, punchy profile README in markdown that highlights their real best work from the data. Suggest which repos to pin.",
  },
  {
    id: "music",
    name: "Music taste",
    emoji: "🎧",
    tagline: "Your top artists say a lot. Too much.",
    teaser: "Your Wrapped looks like a breakup playlist on loop since 2019.",
    accepts: {
      file: { label: "Upload Spotify / Apple Music screenshot", accept: "image/*", kinds: ["image"] },
      text: { label: "…or type your top artists / songs", placeholder: "Arijit Singh, Taylor Swift, AP Dhillon, The Weeknd, Lana Del Rey" },
    },
    battleNoun: "music taste",
    focus:
      "Roast the music taste: what these artists say about the person's personality, emotional state, age, main-character syndrome, basicness or pretentiousness. Name the specific artists/songs.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    emoji: "💼",
    tagline: "Thought leader? Thought so.",
    teaser: "“Passionate about synergy.” Name one time synergy happened.",
    accepts: {
      file: { label: "Upload profile screenshot", accept: "image/*", kinds: ["image"] },
      text: { label: "…or paste your headline + about", placeholder: "Aspiring Entrepreneur | Visionary | Ex-Intern @ BigCorp | Building the future 🚀" },
    },
    glowUp: { label: "Glow-up my LinkedIn", description: "A headline and About that don't make recruiters cringe" },
    battleNoun: "LinkedIn profile",
    focus:
      "Roast the LinkedIn profile: headline emoji and pipe abuse, 'aspiring', 'visionary', cringe humblebrags, vague about sections, inflated titles, hustle-culture energy. Quote specific phrases.",
    glowFocus:
      "Write 3 headline options (under 220 chars, specific, no buzzwords) and a rewritten About section (120-200 words, first person, concrete, ends with what they're looking for).",
  },
  {
    id: "startup",
    name: "Startup idea",
    emoji: "🚀",
    tagline: "Pitch it like you're in front of a jaded VC.",
    teaser: "So it's Uber, but for… asking Uber where it is? Bold.",
    accepts: {
      text: { label: "Describe your startup idea", placeholder: "An AI-powered app that uses blockchain to help dogs find their soulmate" },
    },
    glowUp: { label: "Glow-up my pitch", description: "A sharper one-liner and pitch" },
    battleNoun: "startup idea",
    focus:
      "Roast the startup idea like a jaded VC who has seen 10,000 pitches: market size delusions, 'X for Y', buzzword stacking, obvious competitors, how it makes money (it doesn't), why it'll die. Be specific to the idea.",
    glowFocus:
      "Turn the idea into its best version: a crisp one-liner, target user, the real problem, a sharper wedge, how it makes money, and the riskiest assumption to test first.",
  },
  {
    id: "room",
    name: "Room / setup",
    emoji: "🛋️",
    tagline: "Your desk setup, judged.",
    teaser: "RGB everything and one dying plant. Gamer chic meets crime scene.",
    accepts: {
      file: { label: "Upload a photo of your room or desk", accept: "image/*", kinds: ["image"] },
    },
    battleNoun: "room",
    focus:
      "Roast the room/desk setup in the photo: cable chaos, RGB overload, mess, decor choices, posters, lighting, furniture, what the space says about the owner. Reference specific objects you can see. Do not comment on any people visible.",
  },
  {
    id: "outfit",
    name: "Outfit",
    emoji: "👟",
    tagline: "Fit check, but brutal.",
    teaser: "Formal shirt with cargo shorts. Business on top, field trip on the bottom.",
    accepts: {
      file: { label: "Upload an outfit photo", accept: "image/*", kinds: ["image"] },
    },
    battleNoun: "outfit",
    focus:
      "Roast ONLY the clothing, accessories, shoes, colour coordination, styling and pose/background choices. NEVER comment on the person's body, weight, face, skin, hair texture, height, age, or any physical feature.",
  },
  {
    id: "chat",
    name: "Texting game",
    emoji: "💬",
    tagline: "Your DMs, screenshotted and sentenced.",
    teaser: "Triple texting “hey?” at 2am. The audacity. The desperation.",
    accepts: {
      file: { label: "Upload a chat screenshot", accept: "image/*", kinds: ["image"] },
      text: { label: "…or paste the conversation", placeholder: "Me: hey\nMe: heyy\nThem: hi\nMe: so what's up hahaha" },
    },
    battleNoun: "texting game",
    focus:
      "Roast the texting game of the person whose messages appear on the right side / labelled 'Me' (the user): dry texts, over-texting, emoji abuse, desperation, left-on-read energy, reply timing. Quote messages. Don't reveal or invent personal details of the other person.",
  },
];

export const MODE_MAP: Record<ModeId, ModeConfig> = Object.fromEntries(MODES.map((m) => [m.id, m])) as Record<
  ModeId,
  ModeConfig
>;

export function isModeId(v: string): v is ModeId {
  return v in MODE_MAP;
}

export const HEAT_LEVELS = [
  { level: 1, name: "Mild", chili: "🌶️", color: "#f5c542", blurb: "Friendly teasing. Mom-safe." },
  { level: 2, name: "Medium", chili: "🌶️🌶️", color: "#ff8a2a", blurb: "The default burn." },
  { level: 3, name: "Spicy", chili: "🌶️🌶️🌶️", color: "#ff4d2e", blurb: "No mercy." },
  { level: 4, name: "Gordon", chili: "💀", color: "#b3122e", blurb: "Theatrical, unhinged outrage." },
] as const;
