import { vi } from "vitest";
import type { Account, Api } from "../lib/api";
import { OFFLINE_SUPPORT } from "../lib/api";
import { initialState, type State } from "../store";
import type { ChatReply, CheckinRecord, User } from "../types";

export const emptyAccount: Account = {
  profile: null,
  babies: [{ label: "", formula: null, method: null }],
  trusted: { name: "", phone: "", notes: "" },
  checkins: [],
  notes: [],
};

export function mockApi(reply?: Partial<ChatReply>) {
  const full: ChatReply = {
    segments: ["Mình nghe mẹ."],
    suggestions: ["Mình muốn kể thêm"],
    tier: "1",
    source: "llm",
    pinnable: true,
    hope_open: true,
    crisis: null,
    ...reply,
  };
  const api = {
    sendChat: vi.fn(async () => full),
    getSupport: vi.fn(async () => OFFLINE_SUPPORT),
    me: vi.fn(async (): Promise<User | null> => null),
    register: vi.fn(async (nickname: string) => ({
      user: { id: "u1", nickname },
      recovery_code: "ABCD-EFGH-JKLM-NPQR",
    })),
    login: vi.fn(async (nickname: string) => ({ user: { id: "u1", nickname } })),
    resetPin: vi.fn(async (nickname: string) => ({
      user: { id: "u1", nickname },
      recovery_code: "WXYZ-2345-6789-ABCD",
    })),
    logout: vi.fn(async () => undefined),
    deleteAccount: vi.fn(async () => undefined),
    loadAccount: vi.fn(async (): Promise<Account> => ({ ...emptyAccount })),
    saveProfile: vi.fn(async () => undefined),
    saveCheckin: vi.fn(async (...args: [CheckinRecord]) => void args),
    addNote: vi.fn(async () => "note-1"),
    deleteNote: vi.fn(async () => undefined),
  } satisfies Api;
  return api;
}

export const inApp = (over: Partial<State> = {}): State => ({
  ...initialState,
  screen: "chat",
  profile: { birth: "2026-09-21", birthType: "csection", firstTime: true },
  ...over,
});
