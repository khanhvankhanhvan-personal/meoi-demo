import { describe, expect, it } from "vitest";
import { ageLabel, birthDateError, daysSince, kf, monthsOld, vf, weeksOld } from "./dates";
import { mkOpener, reflect, chipsFor } from "./opener";
import { canon } from "../content";
import { momentLine } from "./greeting";
import { categorize, filterCheckins, insight } from "./diary";
import type { CheckinRecord } from "../types";

const rec = (over: Partial<CheckinRecord> = {}): CheckinRecord => ({
  key: "2026-11-02",
  date: "2/11/2026",
  moods: ["Mệt"],
  sleep: null,
  bodies: [],
  stressors: [],
  ...over,
});

describe("dates", () => {
  it("formats keys and display dates", () => {
    const d = new Date(2026, 10, 2);
    expect(kf(d)).toBe("2026-11-02");
    expect(vf(d)).toBe("2/11/2026");
  });

  it("counts days and weeks since birth", () => {
    const now = new Date(2026, 10, 2, 15, 30);
    expect(daysSince("2026-09-21", now)).toBe(42);
    expect(weeksOld("2026-09-21", now)).toBe(6);
    expect(daysSince("2026-12-01", now)).toBe(0);
  });

  it("describes baby's age in days, months, then years", () => {
    const now = new Date(2026, 10, 3);
    expect(ageLabel("2026-10-30", now)).toBe("4 ngày tuổi");
    expect(ageLabel("2026-10-25", now)).toBe("1 tuần tuổi");
    expect(ageLabel("2026-10-03", now)).toBe("1 tháng tuổi");
    expect(ageLabel("2026-10-04", now)).toBe("4 tuần tuổi");
    expect(ageLabel("2025-07-31", now)).toBe("15 tháng tuổi");
    expect(ageLabel("2024-11-03", now)).toBe("2 tuổi");
    expect(ageLabel("2024-06-03", now)).toBe("2 tuổi 5 tháng");
    expect(monthsOld("2026-11-30", now)).toBe(0);
  });

  it("rejects future dates and dates older than 3 years", () => {
    const now = new Date(2026, 10, 2);
    expect(birthDateError("2026-11-03", now)).toMatch(/chưa tới/);
    expect(birthDateError("2023-10-01", now)).toMatch(/3 năm/);
    expect(birthDateError("2026-09-21", now)).toBeNull();
    expect(birthDateError("", now)).not.toBeNull();
  });
});

describe("mkOpener", () => {
  it("summarises moods and at most two stressors, and is always Tier 1", () => {
    const m = mkOpener(
      rec({ moods: ["Mệt", "Quá tải"], stressors: ["Con quấy khóc, mất ngủ", "Cho con bú", "Cô đơn, không ai hỏi han"] }),
    );
    expect(m.content).toBe(
      "Mình đây, mẹ ạ. Hôm nay mẹ thấy kiệt sức và quá tải và đang nặng lòng vì con quấy khóc, mất ngủ và cho con bú — mẹ muốn kể mình nghe thêm không?",
    );
    expect(m.tier).toBe("1");
    expect(m.suggestions).toHaveLength(3);
  });

  it("falls back to generic suggestions when no chip matches", () => {
    const m = mkOpener(rec({ moods: ["Ổn"] }));
    expect(m.suggestions).toEqual(["Mình muốn kể một chút", "Mình muốn hỏi về bé"]);
  });

  it("builds chips without duplicates", () => {
    expect(chipsFor(rec({ moods: ["Mệt"], stressors: ["Cho con bú"] }))).toEqual([
      "Mình không chắc sữa có đủ",
      "Hôm nay mình mệt quá",
    ]);
  });
});

describe("reflect", () => {
  it("returns null with no check-ins", () => {
    expect(reflect([])).toBeNull();
  });

  it("nudges after three tired days out of the last four", () => {
    const tired = rec({ moods: ["Quá tải"] });
    expect(reflect([rec({ moods: ["Ổn"] }), tired, tired, tired])).toMatch(/mệt vài ngày liền/);
    expect(reflect([rec({ sleep: "Gần như không ngủ" }), tired, tired])).toMatch(/mệt vài ngày liền/);
  });

  it("otherwise just thanks the mother", () => {
    expect(reflect([rec({ moods: ["Ổn"] })])).toMatch(/1 lần check-in gần đây/);
  });
});

describe("diary helpers", () => {
  const now = new Date(2026, 10, 3, 12);
  const day = (key: string, moods: string[], over: Partial<CheckinRecord> = {}) => rec({ key, moods, ...over });

  it("maps pre-redesign names to the new ones", () => {
    expect(canon("Mệt")).toBe("Kiệt sức");
    expect(canon("Ngủ ít")).toBe("Tạm ổn");
    expect(canon("Bình yên")).toBe("Bình yên");
  });

  it("categorises pinned tips, medical first, comfort by default", () => {
    expect(categorize("Chườm ấm nhẹ nhàng trước khi cho bú")).toBe("yte");
    expect(categorize("Sữa mẹ thường biến thiên nhiều")).toBe("dinhduong");
    expect(categorize("Khi bé gắt ngủ lúc đêm muộn, mẹ thử quấn kén")).toBe("be");
    expect(categorize("Mẹ đừng tự trách mình nhé")).toBe("vove");
  });

  it("summarises the last 7 days without concluding anything medical", () => {
    const list = [
      day("2026-11-03", ["Kiệt sức"], { sleep: "Đứt quãng", bodies: ["Mỏi cổ vai gáy", "Mệt rã rời, uể oải"] }),
      day("2026-11-02", ["Bình yên"], { bodies: ["Mỏi cổ vai gáy"] }),
      day("2026-10-01", ["Quá tải"]), // outside the window
    ];
    const s = insight(list, now);
    expect(s).toMatchObject({ title: "Cần nghỉ ngơi", tiredDays: 1, okDays: 1 });
    expect(s?.sleep?.label).toBe("Đứt quãng");
    expect(s?.bodies[0]).toBe("Mỏi cổ vai gáy");
    expect(insight([day("2026-10-01", ["Quá tải"])], now)).toBeNull();
  });

  it("filters by time and mood, newest first", () => {
    const list = [day("2026-10-20", ["Bình yên"]), day("2026-11-02", ["Kiệt sức"]), day("2026-09-01", ["Ổn"])];
    expect(filterCheckins(list, "all", "any", now).map((c) => c.key)).toEqual(["2026-11-02", "2026-10-20", "2026-09-01"]);
    expect(filterCheckins(list, "30", "any", now)).toHaveLength(2);
    expect(filterCheckins(list, "7", "ok", now)).toHaveLength(0);
    expect(filterCheckins(list, "all", "ok", now).map((c) => c.key)).toEqual(["2026-10-20", "2026-09-01"]);
  });
});

describe("momentLine", () => {
  const at = (h: number) => momentLine(new Date(2026, 10, 4, h, 0));
  it("greets the 2am feed differently from the morning", () => {
    expect(at(2)).toContain("cữ đêm");
    expect(at(8)).toContain("Buổi sáng");
    expect(at(23)).toContain("Khuya rồi");
  });
  it("always returns a line, for every hour", () => {
    for (let h = 0; h < 24; h++) expect(at(h).length).toBeGreaterThan(10);
  });
});
