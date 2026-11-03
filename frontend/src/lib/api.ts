import type {
  ApiProfile,
  Baby,
  ChatReply,
  CheckinRecord,
  Message,
  Note,
  Profile,
  SupportList,
  TrustedContact,
  User,
} from "../types";
import { vf, parseKey } from "./dates";

/** What the server keeps for a signed-in mother. */
export interface Account {
  profile: Profile | null;
  babies: Baby[];
  trusted: TrustedContact;
  checkins: CheckinRecord[];
  notes: Note[];
}

export interface Session {
  user: User;
  /** Only present right after sign-up or a PIN reset: shown once. */
  recovery_code?: string | null;
}

export interface Api {
  sendChat(messages: Message[], profile: ApiProfile | null): Promise<ChatReply>;
  getSupport(): Promise<SupportList>;
  me(): Promise<User | null>;
  register(nickname: string, pin: string): Promise<Session>;
  login(nickname: string, pin: string): Promise<Session>;
  resetPin(nickname: string, recoveryCode: string, newPin: string): Promise<Session>;
  logout(): Promise<void>;
  deleteAccount(pin: string): Promise<void>;
  loadAccount(): Promise<Account>;
  saveProfile(profile: Profile, babies: Baby[], trusted: TrustedContact): Promise<void>;
  saveCheckin(record: CheckinRecord): Promise<void>;
  addNote(note: Note): Promise<string>;
  deleteNote(id: string): Promise<void>;
}

export const MAX_HISTORY = 20;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function toApiProfile(profile: Profile | null, babies: Baby[]): ApiProfile | null {
  if (!profile) return null;
  return {
    birth_date: profile.birth,
    birth_type: profile.birthType,
    first_time: profile.firstTime,
    babies: babies.map((b) => ({ label: b.label, formula: b.formula, method: b.method })),
  };
}

const GENERIC = "Mình chưa kết nối được. Mẹ thử lại sau một chút nhé.";

async function failure(res: Response): Promise<ApiError> {
  let message = GENERIC;
  try {
    const body = (await res.json()) as { detail?: unknown };
    // Our own errors carry a Vietnamese string; validation errors (422) are lists: use the generic text.
    if (typeof body.detail === "string") message = body.detail;
  } catch {
    /* not JSON */
  }
  return new ApiError(res.status, message);
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw await failure(res);
  return (await res.json()) as T;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/** Sessions live in httpOnly cookies. An expired access token is renewed once, silently. */
async function call(path: string, init: RequestInit = {}): Promise<Response> {
  const run = () => fetch(`/api${path}`, { credentials: "same-origin", ...init });
  const res = await run();
  if (res.status !== 401 || path.startsWith("/auth/")) return res;
  const renewed = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
  return renewed.ok ? run() : res;
}

const post = (path: string, body: unknown) =>
  call(path, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) });

interface ServerNote {
  id: string;
  day: string;
  text: string;
  topic: string;
}
interface ServerCheckin {
  day: string;
  moods: string[];
  sleep: string | null;
  bodies: string[];
  stressors: string[];
}
interface ServerProfile {
  profile: { birth_date: string; birth_type: "normal" | "csection"; first_time: boolean } | null;
  babies: Baby[];
  trusted: TrustedContact;
}

/** The backend never stores chat. It receives only the last 20 messages, as plain role/content. */
export const httpApi: Api = {
  async sendChat(messages, profile) {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        messages: messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content })),
        profile,
      }),
    });
    return json<ChatReply>(res);
  },
  async getSupport() {
    return json<SupportList>(await fetch("/api/support"));
  },

  async me() {
    let res = await call("/auth/me");
    if (res.status === 401) {
      const renewed = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin" });
      if (!renewed.ok) return null;
      res = await call("/auth/me");
    }
    return res.ok ? ((await res.json()) as User) : null;
  },
  async register(nickname, pin) {
    return json<Session>(await post("/auth/register", { nickname, pin }));
  },
  async login(nickname, pin) {
    return json<Session>(await post("/auth/login", { nickname, pin }));
  },
  async resetPin(nickname, recoveryCode, newPin) {
    return json<Session>(
      await post("/auth/reset-pin", { nickname, recovery_code: recoveryCode, new_pin: newPin }),
    );
  },
  async logout() {
    await call("/auth/logout", { method: "POST" });
  },
  async deleteAccount(pin) {
    const res = await call("/account", { method: "DELETE", headers: JSON_HEADERS, body: JSON.stringify({ pin }) });
    if (!res.ok) throw await failure(res);
  },

  async loadAccount() {
    const [p, c, n] = await Promise.all([call("/profile"), call("/checkins"), call("/notes")]);
    const doc = await json<ServerProfile>(p);
    const checkins = (await json<ServerCheckin[]>(c)).map<CheckinRecord>((r) => ({
      key: r.day,
      date: vf(parseKey(r.day)),
      moods: r.moods,
      sleep: r.sleep,
      bodies: r.bodies,
      stressors: r.stressors,
    }));
    const notes = (await json<ServerNote[]>(n)).map<Note>((r) => ({
      id: r.id,
      key: r.text,
      text: r.text,
      topic: r.topic,
      date: vf(parseKey(r.day)),
      dkey: r.day,
    }));
    return {
      profile: doc.profile
        ? { birth: doc.profile.birth_date, birthType: doc.profile.birth_type, firstTime: doc.profile.first_time }
        : null,
      babies: doc.babies,
      trusted: doc.trusted,
      checkins,
      notes,
    };
  },
  async saveProfile(profile, babies, trusted) {
    const res = await call("/profile", {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        profile: { birth_date: profile.birth, birth_type: profile.birthType, first_time: profile.firstTime },
        babies: babies.map((b) => ({ label: b.label, formula: b.formula, method: b.method })),
        trusted,
      }),
    });
    if (!res.ok) throw await failure(res);
  },
  async saveCheckin(r) {
    const res = await call(`/checkins/${r.key}`, {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ moods: r.moods, sleep: r.sleep, bodies: r.bodies, stressors: r.stressors }),
    });
    if (!res.ok) throw await failure(res);
  },
  async addNote(note) {
    const saved = await json<ServerNote>(
      await post("/notes", { day: note.dkey, text: note.text, topic: note.topic }),
    );
    return saved.id;
  },
  async deleteNote(id) {
    const res = await call(`/notes/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) throw await failure(res);
  },
};

/** Always available, even offline. No opening status: only the server knows the Vietnam time. */
export const OFFLINE_SUPPORT: SupportList = {
  hope_open: null,
  contacts: [
    { key: "emergency", name: "Cấp cứu 115", phone: "115", hours: "24/7", status: null, urgent: true },
    { key: "hope", name: "HOPE · hỗ trợ tâm lý", phone: "0865044400", hours: "Hằng ngày 16:30–20:30", status: null },
    { key: "child", name: "Tổng đài Bảo vệ Trẻ em", phone: "111", hours: "24/7", status: null },
    { key: "csaga", name: "CSAGA", phone: "02433335599", hours: "Giờ hành chính", status: null },
    { key: "peace", name: "Ngôi nhà Bình yên", phone: "1900969680", hours: "24/7 · điện thoại hoặc SMS", status: null },
  ],
};
