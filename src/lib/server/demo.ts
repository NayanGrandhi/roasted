import "server-only";
import type { BattleRoast, SoloRoast, GlowUpResult } from "@/lib/types";
import { MODE_MAP, type ModeId } from "@/lib/modes";

/** Canned responses used when GEMINI_API_KEY isn't set, so the UI is explorable. */

export function demoSolo(mode: ModeId): SoloRoast {
  const noun = MODE_MAP[mode].battleNoun;
  return {
    kind: "solo",
    opener: `This ${noun} walked in with so much confidence and so little reason to have it.`,
    roasts: [
      `I've seen more personality in a terms-and-conditions page, and at least people pretend to read those.`,
      `It's giving "I watched one YouTube tutorial at 2x speed and called it a skill."`,
      `Somewhere a recruiter, a designer and your mom all sighed at the same time and didn't know why.`,
      `The effort here is like a phone on 1% battery: technically on, emotionally gone.`,
      `This is demo mode, by the way. Add a free Gemini key and I'll roast the real thing. You're welcome.`,
    ],
    score: 72,
    scoreLabel: "Well Done",
    redemption: [
      "Add a free GEMINI_API_KEY from aistudio.google.com/apikey to your .env.local file.",
      "Restart the dev server so it picks up the key.",
      "Come back and submit again: real, specific roasts await.",
    ],
    verdict: "Confidence of a CEO, execution of a Monday morning.",
  };
}

export function demoBattle(names: string[]): BattleRoast {
  const [a, b] = [names[0] || "Contender 1", names[1] || "Contender 2"];
  return {
    kind: "battle",
    opener: `In this corner, ${a}. In that corner, ${b}. In both corners: disappointment.`,
    contenders: [
      {
        name: a,
        roasts: [
          "Brought a spoon to a knife fight and still managed to cut themselves.",
          "The kind of effort that gets a participation certificate and frames it.",
          "Demo mode can only roast you generically. Imagine what the real AI would say.",
        ],
        score: 64,
        scoreLabel: "Medium Well",
      },
      {
        name: b,
        roasts: [
          "Showed up like a group-project member: present, technically.",
          "Has the energy of a 'Seen' with no reply.",
          "Add a Gemini key and this gets personal. Very personal.",
        ],
        score: 81,
        scoreLabel: "Charred",
      },
    ],
    loserIndex: 1,
    verdict: `${b} is more cooked. ${a} wins by simply being less bad.`,
  };
}

export function demoGlow(): GlowUpResult {
  return {
    title: "Glow-up preview",
    improved:
      "This is demo mode.\n\nAdd a free GEMINI_API_KEY to get a real rewrite of your submission here: sharper, specific and ready to copy-paste.",
    changes: ["Get a free key at aistudio.google.com/apikey", "Put it in .env.local", "Restart and try again"],
  };
}

export function demoClapBack(): string {
  const lines = [
    "Bold of you to argue with a roast running in demo mode. Add a Gemini key and say that again.",
    "That comeback had the structural integrity of wet paper. Respect for trying though.",
    "I'd roast you harder, but I'm on demo mode. Consider yourself lucky.",
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}
