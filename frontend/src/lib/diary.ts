import { MOODS, moodOf, sleepOf, type MoodGroup } from "../content";
import type { CheckinRecord } from "../types";
import { daysSince } from "./dates";

/* ---------- pinned tips: automatic categories ---------- */

export type PinCategory = "be" | "yte" | "vove" | "dinhduong";

export const PIN_CATEGORIES: { key: PinCategory; label: string; emoji: string }[] = [
  { key: "be", label: "Mẹo dỗ bé & giấc ngủ", emoji: "🍼" },
  { key: "yte", label: "Y tế & Phục hồi sau sinh", emoji: "🩺" },
  { key: "vove", label: "Vỗ về tinh thần", emoji: "🌸" },
  { key: "dinhduong", label: "Dinh dưỡng & Sữa mẹ", emoji: "🥛" },
];

const RULES: { key: PinCategory; words: string[] }[] = [
  {
    key: "yte",
    words: ["vết mổ", "vết khâu", "khâu", "sản dịch", "sốt", "bác sĩ", "khám", "chườm", "tắc", "sưng", "đau", "hồi phục", "chảy máu"],
  },
  { key: "dinhduong", words: ["sữa", "bú", "dinh dưỡng", "ăn ", "uống", "vắt", "ti bình", "ngực"] },
  { key: "be", words: ["dỗ", "quấy", "khóc", "ngủ", "kén", "tã", "bế", "bé "] },
];

/** First matching rule wins (medical first), otherwise emotional comfort. A label only: never a diagnosis. */
export function categorize(text: string): PinCategory {
  const t = ` ${text.toLowerCase()} `;
  for (const r of RULES) if (r.words.some((w) => t.includes(w))) return r.key;
  return "vove";
}

export const pinCategory = (key: PinCategory) => PIN_CATEGORIES.find((c) => c.key === key)!;

/* ---------- health diary ---------- */

export type RangeFilter = "all" | "7" | "30";
export type MoodFilter = "any" | "tired" | "ok";

export const groupOf = (label: string): MoodGroup | undefined => MOODS.find((m) => m.label === moodOf(label)?.label)?.group;

/** A day counts as tired if any mood is tired; "ok" only when there is an ok mood and no tired one. */
export function dayGroup(c: CheckinRecord): MoodGroup {
  const groups = c.moods.map(groupOf);
  if (groups.includes("tired")) return "tired";
  if (groups.includes("ok")) return "ok";
  return "mixed";
}

export function filterCheckins(
  list: CheckinRecord[],
  range: RangeFilter,
  mood: MoodFilter,
  now: Date = new Date(),
): CheckinRecord[] {
  return list
    .filter((c) => range === "all" || daysSince(c.key, now) < Number(range))
    .filter((c) => mood === "any" || dayGroup(c) === mood)
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

export interface Insight {
  title: string;
  emoji: string;
  tiredDays: number;
  okDays: number;
  sleep: { label: string; hint: string } | null;
  bodies: string[];
}

const POSITIVE_BODY = "Cơ thể nhẹ nhõm, dễ chịu";

/** Summary of the last 7 days. Describes what the mother reported; it never concludes anything medical. */
export function insight(list: CheckinRecord[], now: Date = new Date()): Insight | null {
  const week = list.filter((c) => daysSince(c.key, now) < 7).sort((a, b) => (a.key < b.key ? 1 : -1));
  if (week.length === 0) return null;
  const tiredDays = week.filter((c) => dayGroup(c) === "tired").length;
  const okDays = week.filter((c) => dayGroup(c) === "ok").length;
  let title = "Còn bấp bênh";
  let emoji = "⛅";
  if (tiredDays > 0 && tiredDays >= okDays) {
    title = "Cần nghỉ ngơi";
    emoji = "🌧️";
  } else if (okDays > 0) {
    title = "Khá ổn định";
    emoji = "🌤️";
  }
  const latestSleep = week.find((c) => c.sleep)?.sleep ?? null;
  const sleepOpt = sleepOf(latestSleep);
  const counts = new Map<string, number>();
  for (const c of week) for (const b of c.bodies) if (b !== POSITIVE_BODY) counts.set(b, (counts.get(b) ?? 0) + 1);
  const bodies = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([b]) => b);
  return {
    title,
    emoji,
    tiredDays,
    okDays,
    sleep: sleepOpt && latestSleep ? { label: sleepOpt.label, hint: sleepOpt.hint ?? "" } : latestSleep ? { label: latestSleep, hint: "" } : null,
    bodies,
  };
}
