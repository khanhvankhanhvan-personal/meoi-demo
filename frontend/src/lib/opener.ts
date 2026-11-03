import { CHIP_Q, canon } from "../content";
import { dayGroup } from "./diary";
import type { CheckinRecord, Message } from "../types";

const joinVi = (items: string[]): string =>
  items.length > 1 ? `${items.slice(0, -1).join(", ")} và ${items[items.length - 1]}` : (items[0] ?? "");

/** Chips for the home screen / opener, derived from the latest check-in. */
export function chipsFor(c: CheckinRecord): string[] {
  const keys = [...c.stressors, ...c.bodies, ...(c.sleep ? [c.sleep] : []), ...c.moods];
  const out: string[] = [];
  for (const k of keys) {
    const q = CHIP_Q[k];
    if (q && !out.includes(q)) out.push(q);
  }
  return out;
}

/** The assistant's first message after a check-in (prototype mkOpener). Always Tier 1. */
export function mkOpener(c: CheckinRecord): Message {
  const moods = joinVi(c.moods.map((m) => canon(m).toLowerCase()));
  const stress = c.stressors.slice(0, 2).map((s) => s.toLowerCase());
  const text =
    `Mình đây, mẹ ạ. Hôm nay mẹ thấy ${moods}` +
    (stress.length ? ` và đang nặng lòng vì ${stress.join(" và ")}` : "") +
    " — mẹ muốn kể mình nghe thêm không?";
  const chips = chipsFor(c).slice(0, 3);
  return {
    role: "assistant",
    content: text,
    segments: [text],
    suggestions: chips.length ? chips : ["Mình muốn kể một chút", "Mình muốn hỏi về bé"],
    tier: "1",
    pinnable: true,
  };
}

/** Gentle reflection on the last four check-ins (prototype reflect()). */
export function reflect(checkins: CheckinRecord[]): string | null {
  if (!checkins.length) return null;
  const recent = checkins.slice(-4);
  const tired = recent.filter((c) => dayGroup(c) === "tired" || canon(c.sleep ?? "") === "Thức trắng");
  if (tired.length >= 3) {
    return "Mình thấy mẹ đã mệt vài ngày liền — mẹ có muốn nói chuyện một chút không?";
  }
  return `${recent.length} lần check-in gần đây — cảm ơn mẹ đã dành chút thời gian cho chính mình.`;
}
