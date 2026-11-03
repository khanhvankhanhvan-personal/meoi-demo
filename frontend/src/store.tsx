import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { ApiError, httpApi, toApiProfile, type Account, type Api, type Session } from "./lib/api";
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
  User,
} from "./types";

/**
 * Guests keep everything in memory only: the server stores nothing for them, and chat history is never
 * persisted (CLAUDE.md). A signed-in mother's profile, check-ins and pinned notes are saved to her
 * account (see the sync effect in StoreProvider); chat messages are not.
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
  user: User | null;
  booting: boolean; // true while a saved session is being restored
  recoveryCode: string | null; // shown once after sign-up / PIN reset
  syncError: boolean;
  nudgeDismissed: boolean;
  diaryTab: "log" | "pins"; // which part of "Nhật ký & Đã lưu" is open
  toast: string | null;
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
  user: null,
  booting: false,
  recoveryCode: null,
  syncError: false,
  nudgeDismissed: false,
  diaryTab: "log",
  toast: null,
};

export const isTier3 = (tier?: string | null): boolean => !!tier && tier.startsWith("3");

export type Action =
  | { type: "go"; screen: Screen }
  | { type: "finishIntake"; profile: Profile; babies: Baby[]; then?: "home" | "checkin" | "chat" }
  | { type: "setProfile"; profile: Partial<Profile> }
  | { type: "setBabies"; babies: Baby[] }
  | { type: "setTrusted"; trusted: Partial<TrustedContact> }
  | { type: "saveCheckin"; record: CheckinRecord; openChat: boolean }
  | { type: "selectDay"; key: string | null }
  | { type: "userSent"; text: string }
  | { type: "replied"; reply: ChatReply }
  | { type: "failed" }
  | { type: "dismissCrisis" }
  | { type: "togglePin"; index: number; seg?: number; now: Date }
  | { type: "openDiary"; tab: "log" | "pins"; day?: string | null }
  | { type: "chatAbout"; record: CheckinRecord }
  | { type: "newChat" }
  | { type: "clearToast" }
  | { type: "deleteNote"; key: string }
  | { type: "booted" }
  | { type: "signedIn"; user: User; account: Account | null; recoveryCode: string | null }
  | { type: "signedOut" }
  | { type: "ackRecovery" }
  | { type: "syncResult"; failed: boolean }
  | { type: "dismissNudge" };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "go":
      return { ...state, screen: action.screen };
    case "finishIntake":
      return { ...state, profile: action.profile, babies: action.babies, screen: action.then ?? "home" };
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
      // Tier 3 is never pinned: the server rejects it too; this mirrors the rule in the client.
      if (!m || m.role !== "assistant" || m.error || m.pinnable === false || isTier3(m.tier)) return state;
      const text = action.seg !== undefined && m.segments ? (m.segments[action.seg] ?? m.content) : m.content;
      if (state.notes.some((n) => n.key === text)) {
        return { ...state, notes: state.notes.filter((n) => n.key !== text), toast: "Đã bỏ ghim" };
      }
      let topic = "Check-in hôm nay";
      for (let k = action.index - 1; k >= 0; k--) {
        if (state.messages[k].role === "user") {
          topic = state.messages[k].content;
          break;
        }
      }
      const note: Note = {
        key: text,
        text,
        topic,
        date: vf(action.now),
        dkey: kf(action.now),
      };
      return { ...state, notes: [...state.notes, note], toast: "Đã lưu vào Thông tin đã ghim" };
    }
    case "openDiary":
      return { ...state, screen: "history", diaryTab: action.tab, selDay: action.day ?? null };
    case "chatAbout":
      return { ...state, screen: "chat", messages: [...state.messages, mkOpener(action.record)] };
    case "newChat":
      return { ...state, messages: [], crisis: null };
    case "clearToast":
      return state.toast ? { ...state, toast: null } : state;
    case "deleteNote":
      return { ...state, notes: state.notes.filter((n) => n.key !== action.key) };
    case "booted":
      return { ...state, booting: false };
    case "signedIn": {
      const a = action.account;
      // Whatever is already saved on the account wins; a brand-new account keeps what the guest entered.
      const hasSaved = !!a && (!!a.profile || a.checkins.length > 0 || a.notes.length > 0);
      const next: State = {
        ...state,
        user: action.user,
        booting: false,
        recoveryCode: action.recoveryCode,
        ...(hasSaved && a
          ? { profile: a.profile, babies: a.babies, trusted: a.trusted, checkins: a.checkins, notes: a.notes }
          : {}),
      };
      return {
        ...next,
        screen: action.recoveryCode ? "recovery" : next.profile ? "home" : "intake",
      };
    }
    case "signedOut":
      return { ...initialState };
    case "ackRecovery":
      return { ...state, recoveryCode: null, screen: state.profile ? "home" : "intake" };
    case "syncResult":
      return state.syncError === action.failed ? state : { ...state, syncError: action.failed };
    case "dismissNudge":
      return { ...state, nudgeDismissed: true };
  }
}

interface Store {
  state: State;
  dispatch: (a: Action) => void;
  send: (text: string) => Promise<void>;
  api: Api;
  /** Call after a successful register / login / PIN reset: loads the account and moves on. */
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  /** Deletes the account and everything saved for it (needs the PIN; throws ApiError if it is wrong). */
  removeAccount: (pin: string) => Promise<void>;
}

/** What the server already has, so the sync effect only sends what changed. */
interface Synced {
  profile: string | null;
  checkins: Map<string, string>;
  notes: Map<string, string>; // note text -> server id ("" = refused, never retried)
}
const emptySynced = (): Synced => ({ profile: null, checkins: new Map(), notes: new Map() });
const profileDoc = (s: State) => JSON.stringify([s.profile, s.babies, s.trusted]);

const Ctx = createContext<Store | null>(null);

export function StoreProvider({
  api = httpApi,
  initial = initialState,
  restoreSession = false,
  children,
}: {
  api?: Api;
  initial?: State;
  restoreSession?: boolean;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, restoreSession ? { ...initial, booting: true } : initial);
  const ref = useRef(state);
  ref.current = state;
  const synced = useRef<Synced>(emptySynced());
  const busy = useRef(false);
  const again = useRef(false);

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

  const prime = useCallback((account: Account) => {
    synced.current = {
      profile: account.profile ? JSON.stringify([account.profile, account.babies, account.trusted]) : null,
      checkins: new Map(account.checkins.map((c) => [c.key, JSON.stringify(c)])),
      notes: new Map(account.notes.map((n) => [n.key, n.id ?? ""])),
    };
  }, []);

  const signIn = useCallback(
    async (session: Session) => {
      const account = await api.loadAccount();
      prime(account);
      dispatch({ type: "signedIn", user: session.user, account, recoveryCode: session.recovery_code ?? null });
    },
    [api, prime],
  );

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* the cookie expires on its own; leave the screen regardless */
    }
    synced.current = emptySynced();
    dispatch({ type: "signedOut" });
  }, [api]);

  const removeAccount = useCallback(
    async (pin: string) => {
      await api.deleteAccount(pin);
      synced.current = emptySynced();
      dispatch({ type: "signedOut" });
    },
    [api],
  );

  // Restore a saved session on first load.
  useEffect(() => {
    if (!restoreSession) return;
    let alive = true;
    (async () => {
      try {
        const user = await api.me();
        if (!user) return;
        const account = await api.loadAccount();
        prime(account);
        if (alive) dispatch({ type: "signedIn", user, account, recoveryCode: null });
      } catch {
        /* stay a guest */
      } finally {
        if (alive) dispatch({ type: "booted" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, prime, restoreSession]);

  // Save what changed to the account, shortly after the last edit. Chat is never saved.
  const syncOnce = useCallback(async () => {
    const s = ref.current;
    if (!s.user) return;
    const known = synced.current;
    let failed = false;
    if (s.profile) {
      const doc = profileDoc(s);
      if (doc !== known.profile) {
        try {
          await api.saveProfile(s.profile, s.babies, s.trusted);
          known.profile = doc;
        } catch {
          failed = true;
        }
      }
    }
    for (const c of s.checkins) {
      const doc = JSON.stringify(c);
      if (known.checkins.get(c.key) === doc) continue;
      try {
        await api.saveCheckin(c);
        known.checkins.set(c.key, doc);
      } catch {
        failed = true;
      }
    }
    const local = new Set(s.notes.map((n) => n.key));
    for (const [text, id] of [...known.notes]) {
      if (local.has(text)) continue;
      try {
        if (id) await api.deleteNote(id);
        known.notes.delete(text);
      } catch {
        failed = true;
      }
    }
    for (const n of s.notes) {
      if (known.notes.has(n.key)) continue;
      try {
        known.notes.set(n.key, await api.addNote(n));
      } catch (e) {
        if (e instanceof ApiError && e.status === 400) known.notes.set(n.key, "");
        else failed = true;
      }
    }
    dispatch({ type: "syncResult", failed });
  }, [api]);

  const flush = useCallback(async () => {
    if (busy.current) {
      again.current = true;
      return;
    }
    busy.current = true;
    try {
      do {
        again.current = false;
        await syncOnce();
      } while (again.current);
    } finally {
      busy.current = false;
    }
  }, [syncOnce]);

  useEffect(() => {
    if (!state.user) return;
    const t = setTimeout(() => void flush(), 400);
    return () => clearTimeout(t);
  }, [state.user, state.profile, state.babies, state.trusted, state.checkins, state.notes, flush]);

  const value = useMemo(
    () => ({ state, dispatch, send, api, signIn, signOut, removeAccount }),
    [state, send, api, signIn, signOut, removeAccount],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
