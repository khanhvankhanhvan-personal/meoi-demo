import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from "react";
import { httpApi, toApiProfile, type Api } from "./lib/api";
import { kf, vf } from "./lib/dates";
import { mkOpener } from "./lib/opener";
import type {
  Baby,
  ChatReply,
  CheckinRecord,
  Crisis,
  Message,
  Note,
  Profile,
  Screen,
  TrustedContact,
} from "./types";

/**
 * Guest state lives only in memory: the server stores nothing for guests, and chat history is never
 * persisted (CLAUDE.md). Refreshing the page starts over.
 */
export interface State {
  screen: Screen;
  profile: Profile | null;
  babies: Baby[];
  checkins: CheckinRecord[];
  messages: Message[];
  sending: boolean;
  crisis: Crisis | null; // latched until the mother dismisses it
  notes: Note[];
  trusted: TrustedContact;
  selDay: string | null;
}

export const emptyBaby = (): Baby => ({ label: "", formula: null, method: null });

export const initialState: State = {
  screen: "onboarding",
  profile: null,
  babies: [emptyBaby()],
  checkins: [],
  messages: [],
  sending: false,
  crisis: null,
  notes: [],
  trusted: { name: "", phone: "", notes: "" },
  selDay: null,
};

export const isTier3 = (tier?: string | null): boolean => !!tier && tier.startsWith("3");

export type Action =
  | { type: "go"; screen: Screen }
  | { type: "finishIntake"; profile: Profile; babies: Baby[] }
  | { type: "setProfile"; profile: Partial<Profile> }
  | { type: "setBabies"; babies: Baby[] }
  | { type: "setTrusted"; trusted: Partial<TrustedContact> }
  | { type: "saveCheckin"; record: CheckinRecord; openChat: boolean }
  | { type: "selectDay"; key: string | null }
  | { type: "userSent"; text: string }
  | { type: "replied"; reply: ChatReply }
  | { type: "failed" }
  | { type: "dismissCrisis" }
  | { type: "togglePin"; index: number; now: Date }
  | { type: "deleteNote"; key: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "go":
      return { ...state, screen: action.screen };
    case "finishIntake":
      return { ...state, profile: action.profile, babies: action.babies, screen: "home" };
    case "setProfile":
      return state.profile ? { ...state, profile: { ...state.profile, ...action.profile } } : state;
    case "setBabies":
      return { ...state, babies: action.babies };
    case "setTrusted":
      return { ...state, trusted: { ...state.trusted, ...action.trusted } };
    case "saveCheckin": {
      const checkins = [...state.checkins.filter((c) => c.key !== action.record.key), action.record];
      return {
        ...state,
        checkins,
        selDay: null,
        screen: action.openChat ? "chat" : state.screen,
        messages: action.openChat ? [...state.messages, mkOpener(action.record)] : state.messages,
      };
    }
    case "selectDay":
      return { ...state, selDay: action.key };
    case "userSent":
      return {
        ...state,
        sending: true,
        messages: [...state.messages, { role: "user", content: action.text }],
      };
    case "replied": {
      const r = action.reply;
      const msg: Message = {
        role: "assistant",
        content: r.segments.join("\n\n"),
        segments: r.segments,
        suggestions: r.suggestions,
        tier: r.tier,
        pinnable: r.pinnable && !isTier3(r.tier),
      };
      return {
        ...state,
        sending: false,
        messages: [...state.messages, msg],
        crisis: r.crisis ?? state.crisis,
      };
    }
    case "failed":
      return {
        ...state,
        sending: false,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            error: true,
            pinnable: false,
            content:
              "Mình chưa trả lời được lúc này. Mẹ thử lại sau một chút nhé. Nếu mẹ cần giúp ngay, mẹ bấm nút “Hỗ trợ” phía trên để xem các số điện thoại.",
          },
        ],
      };
    case "dismissCrisis":
      return { ...state, crisis: null };
    case "togglePin": {
      const m = state.messages[action.index];
      // Tier 3 is never pinned: the server rejects it too (M6); this mirrors the rule in the client.
      if (!m || m.role !== "assistant" || m.error || m.pinnable === false || isTier3(m.tier)) return state;
      if (state.notes.some((n) => n.key === m.content)) {
        return { ...state, notes: state.notes.filter((n) => n.key !== m.content) };
      }
      let topic = "Check-in hôm nay";
      for (let k = action.index - 1; k >= 0; k--) {
        if (state.messages[k].role === "user") {
          topic = state.messages[k].content;
          break;
        }
      }
      const note: Note = {
        key: m.content,
        text: m.content,
        topic,
        date: vf(action.now),
        dkey: kf(action.now),
      };
      return { ...state, notes: [...state.notes, note] };
    }
    case "deleteNote":
      return { ...state, notes: state.notes.filter((n) => n.key !== action.key) };
  }
}

interface Store {
  state: State;
  dispatch: (a: Action) => void;
  send: (text: string) => Promise<void>;
  api: Api;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({
  api = httpApi,
  initial = initialState,
  children,
}: {
  api?: Api;
  initial?: State;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initial);
  const ref = useRef(state);
  ref.current = state;

  const send = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || ref.current.sending) return;
      const history: Message[] = [...ref.current.messages, { role: "user", content: t }];
      const profile = toApiProfile(ref.current.profile, ref.current.babies);
      dispatch({ type: "userSent", text: t });
      try {
        dispatch({ type: "replied", reply: await api.sendChat(history, profile) });
      } catch {
        dispatch({ type: "failed" });
      }
    },
    [api],
  );

  const value = useMemo(() => ({ state, dispatch, send, api }), [state, send, api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
