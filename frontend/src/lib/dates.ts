const pad = (n: number) => String(n).padStart(2, "0");

/** Storage key "YYYY-MM-DD" in the device's local time. */
export const kf = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Display format "D/M/YYYY". */
export const vf = (d: Date): string => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days between a "YYYY-MM-DD" birth date and now (never negative). */
export function daysSince(birthKey: string, now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today.getTime() - parseKey(birthKey).getTime()) / 864e5));
}

/** Why a birth date is not acceptable, or null: not in the future, not older than 3 years. */
export function birthDateError(key: string, now: Date = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return "Mẹ chọn ngày sinh của con nhé.";
  const d = parseKey(key);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d.getTime() > today.getTime()) return "Ngày này chưa tới, mẹ kiểm tra lại giúp mình nhé.";
  const limit = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
  if (d.getTime() < limit.getTime()) return "Mình hiện chỉ đồng hành trong 3 năm đầu sau sinh.";
  return null;
}

export const weeksOld = (birthKey: string, now: Date = new Date()): number =>
  Math.floor(daysSince(birthKey, now) / 7);

export const daysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

/** Whole calendar months since a "YYYY-MM-DD" birth date (never negative). */
export function monthsOld(birthKey: string, now: Date = new Date()): number {
  const b = parseKey(birthKey);
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

/** Baby's age the way mothers say it: days under a month, months up to 2 years, then years + months. */
export function ageLabel(birthKey: string, now: Date = new Date()): string {
  const months = monthsOld(birthKey, now);
  if (months < 1) return `${daysSince(birthKey, now)} ngày tuổi`;
  if (months < 24) return `${months} tháng tuổi`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} tuổi ${rest} tháng` : `${years} tuổi`;
}
