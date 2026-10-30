import type { ApiProfile, Baby, ChatReply, Message, Profile, SupportList } from "../types";

export interface Api {
  sendChat(messages: Message[], profile: ApiProfile | null): Promise<ChatReply>;
  getSupport(): Promise<SupportList>;
}

export const MAX_HISTORY = 20;

export function toApiProfile(profile: Profile | null, babies: Baby[]): ApiProfile | null {
  if (!profile) return null;
  return {
    birth_date: profile.birth,
    birth_type: profile.birthType,
    first_time: profile.firstTime,
    babies: babies.map((b) => ({ label: b.label, formula: b.formula, method: b.method })),
  };
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** The backend is stateless: send only the last 20 messages, as plain role/content. */
export const httpApi: Api = {
  async sendChat(messages, profile) {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
