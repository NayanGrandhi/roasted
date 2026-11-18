import type { ModeId } from "./modes";

export type Lang = "en" | "hinglish";
export type Target = "me" | "friend";

export interface SubjectFile {
  name: string;
  mimeType: string;
  /** base64, no data: prefix */
  data: string;
}

export interface Subject {
  /** Display name, used in battles ("Contender 1" by default) */
  label?: string;
  text?: string;
  username?: string;
  file?: SubjectFile;
}

export interface RoastSettings {
  mode: ModeId;
  heat: 1 | 2 | 3 | 4;
  lang: Lang;
  target: Target;
}

export interface RoastRequest extends RoastSettings {
  subjects: Subject[]; // 1 = solo, 2 = battle
}

export interface SoloRoast {
  kind: "solo";
  opener: string;
  roasts: string[];
  score: number;
  scoreLabel: string;
  redemption: string[];
  verdict: string;
}

export interface BattleContender {
  name: string;
  roasts: string[];
  score: number;
  scoreLabel: string;
}

export interface BattleRoast {
  kind: "battle";
  opener: string;
  contenders: [BattleContender, BattleContender];
  loserIndex: 0 | 1;
  verdict: string;
}

export type RoastResult = SoloRoast | BattleRoast;

export interface RoastResponse {
  result: RoastResult;
  demo?: boolean;
}

export interface ChatMessage {
  role: "user" | "roaster";
  text: string;
}

export interface ClapBackRequest extends RoastSettings {
  roastSummary: string;
  messages: ChatMessage[];
}

export interface GlowUpRequest {
  mode: ModeId;
  lang: Lang;
  subject: Subject;
}

export interface GlowUpResult {
  title: string;
  improved: string;
  changes: string[];
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  settings: RoastSettings;
  subjectPreview: string;
  result: RoastResult;
}
