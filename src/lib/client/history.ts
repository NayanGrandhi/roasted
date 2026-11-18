import type { HistoryEntry } from "@/lib/types";

const KEY = "roasted:history:v1";
const MAX = 50;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry) {
  try {
    const list = [entry, ...loadHistory().filter((e) => e.id !== entry.id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or unavailable — history is a nice-to-have */
  }
}

export function deleteFromHistory(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadHistory().filter((e) => e.id !== id)));
  } catch {}
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
