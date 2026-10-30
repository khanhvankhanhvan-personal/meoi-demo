import { describe, expect, it } from "vitest";
import { initialState, reducer, type State } from "./store";
import type { ChatReply, CheckinRecord, Message } from "./types";

const reply = (over: Partial<ChatReply> = {}): ChatReply => ({
  segments: ["Mình nghe mẹ."],
  suggestions: [],
  tier: "1",
  source: "llm",
  pinnable: true,
  hope_open: true,
  crisis: null,
  ...over,
});

const crisis = {
  kind: "PSYCHIATRIC" as const,
  label: "Mẹ không cần tự xử lý một mình",
  body: "x",
  contacts: [{ name: "Cấp cứu 115", phone: "115" }],
};

const withMessages = (messages: Message[]): State => ({ ...initialState, messages });
const NOW = new Date(2026, 10, 2);

describe("check-ins", () => {
  const base: CheckinRecord = { key: "2026-11-02", date: "2/11/2026", moods: ["Mệt"], sleep: null, bodies: [], stressors: [] };

  it("keeps one record per day, the latest wins, and opens the chat with an opener", () => {
    let s = reducer(initialState, { type: "saveCheckin", record: base, openChat: true });
    s = reducer(s, { type: "saveCheckin", record: { ...base, moods: ["Ổn"] }, openChat: true });
    expect(s.checkins).toHaveLength(1);
    expect(s.checkins[0].moods).toEqual(["Ổn"]);
    expect(s.screen).toBe("chat");
    expect(s.messages.filter((m) => m.role === "assistant")).toHaveLength(2);
  });
});

describe("crisis banner state", () => {
  it("latches on a Tier 3 reply and stays through a later normal reply", () => {
    let s = reducer(initialState, { type: "replied", reply: reply({ tier: "3-PSYCHIATRIC", pinnable: false, crisis }) });
    expect(s.crisis).toEqual(crisis);
    s = reducer(s, { type: "replied", reply: reply() });
    expect(s.crisis).toEqual(crisis);
  });

  it("is cleared only when the mother dismisses it", () => {
    let s = reducer(initialState, { type: "replied", reply: reply({ tier: "3-SAFETY", crisis }) });
    s = reducer(s, { type: "dismissCrisis" });
    expect(s.crisis).toBeNull();
  });
});

describe("pinning", () => {
  const convo: Message[] = [
    { role: "user", content: "Con khóc suốt" },
    { role: "assistant", content: "Không phải lỗi của mẹ.", tier: "1", pinnable: true },
    { role: "user", content: "Em muốn chết" },
    { role: "assistant", content: "Mẹ gọi 115.", tier: "3-PSYCHIATRIC", pinnable: true },
  ];

  it("pins an assistant reply with the preceding user message as topic, and toggles it off", () => {
    let s = reducer(withMessages(convo), { type: "togglePin", index: 1, now: NOW });
    expect(s.notes).toHaveLength(1);
    expect(s.notes[0]).toMatchObject({ topic: "Con khóc suốt", date: "2/11/2026", dkey: "2026-11-02" });
    s = reducer(s, { type: "togglePin", index: 1, now: NOW });
    expect(s.notes).toHaveLength(0);
  });

  it("never pins a Tier 3 reply, even if the message claims to be pinnable", () => {
    const s = reducer(withMessages(convo), { type: "togglePin", index: 3, now: NOW });
    expect(s.notes).toHaveLength(0);
  });

  it("never pins user messages or error bubbles", () => {
    const s0 = withMessages([...convo, { role: "assistant", content: "lỗi", error: true }]);
    expect(reducer(s0, { type: "togglePin", index: 0, now: NOW }).notes).toHaveLength(0);
    expect(reducer(s0, { type: "togglePin", index: 4, now: NOW }).notes).toHaveLength(0);
  });

  it("marks Tier 3 replies as not pinnable when they arrive", () => {
    const s = reducer(initialState, { type: "replied", reply: reply({ tier: "3-PHYSICAL", pinnable: true }) });
    expect(s.messages[0].pinnable).toBe(false);
  });
});

describe("sending", () => {
  it("adds an error bubble when the request fails and re-enables sending", () => {
    let s = reducer(initialState, { type: "userSent", text: "xin chào" });
    expect(s.sending).toBe(true);
    s = reducer(s, { type: "failed" });
    expect(s.sending).toBe(false);
    expect(s.messages[1]).toMatchObject({ role: "assistant", error: true });
  });
});
