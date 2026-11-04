import { vi } from "vitest";
import type { Account, Api } from "../lib/api";
import { OFFLINE_SUPPORT } from "../lib/api";
import { initialState, type State } from "../store";
import type {
  ChatReply,
  CheckinRecord,
  Memory,
  MemoryCategory,
  MemorySettings,
  MemorySuggestion,
  Message,
  User,
} from "../types";

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
    listMemories: vi.fn(async (): Promise<Memory[]> => []),
    addMemory: vi.fn(
      async (text: string, category: MemoryCategory): Promise<Memory> => ({ id: "m1", text, category, created_at: "2026-11-04T00:00:00Z" }),
    ),
    editMemory: vi.fn(
      async (id: string, text: string): Promise<Memory> => ({ id, text, category: "life", created_at: "2026-11-04T00:00:00Z" }),
    ),
    deleteMemory: vi.fn(async (...args: [string]) => void args),
    deleteAllMemories: vi.fn(async () => undefined),
    getMemorySettings: vi.fn(
      async (): Promise<MemorySettings> => ({ enabled: true, topics: ["life", "family", "feelings", "work_money"] }),
    ),
    saveMemorySettings: vi.fn(async (s: MemorySettings) => s),
    suggestMemories: vi.fn(async (...args: [Message[]]): Promise<MemorySuggestion[]> => (void args, [])),
  } satisfies Api;
  return api;
}

export const inApp = (over: Partial<State> = {}): State => ({
  ...initialState,
  screen: "chat",
  profile: { birth: "2026-09-21", birthType: "csection", firstTime: true },
  ...over,
});
