import { vi } from "vitest";
import type { Api } from "../lib/api";
import { OFFLINE_SUPPORT } from "../lib/api";
import { initialState, type State } from "../store";
import type { ChatReply } from "../types";

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
  } satisfies Api;
  return api;
}

export const inApp = (over: Partial<State> = {}): State => ({
  ...initialState,
  screen: "chat",
  profile: { birth: "2026-09-21", birthType: "csection", firstTime: true },
  ...over,
});
