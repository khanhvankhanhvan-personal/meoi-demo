export type Screen =
  | "onboarding"
  | "intake"
  | "home"
  | "checkin"
  | "chat"
  | "history"
  | "profile"
  | "babyprofile"
  | "auth"
  | "recovery";

export interface Contact {
  name: string;
  phone: string;
}

export interface Crisis {
  kind: "PHYSICAL" | "PSYCHIATRIC" | "SAFETY";
  label: string;
  body: string;
  contacts: Contact[];
}

/** Response of POST /chat/send */
export interface ChatReply {
  segments: string[];
  suggestions: string[];
  tier: string;
  source: "script" | "llm";
  pinnable: boolean;
  hope_open: boolean;
  crisis: Crisis | null;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  segments?: string[];
  suggestions?: string[];
  tier?: string;
  pinnable?: boolean;
  error?: boolean;
}

export interface CheckinRecord {
  key: string; // YYYY-MM-DD, one record per day, latest wins
  date: string; // D/M/YYYY
  moods: string[];
  sleep: string | null;
  bodies: string[];
  stressors: string[];
  note?: string; // private free text from the check-in sheet
}

export type Formula = "mom" | "only" | "mix";
export type FeedMethod = "direct" | "pump" | "both" | "latch" | "bottle";

export interface Baby {
  label: string;
  formula: Formula | null;
  method: FeedMethod | null;
}

export interface Profile {
  birth: string; // YYYY-MM-DD
  birthType: "normal" | "csection";
  csectionKind?: "planned" | "emergency" | null;
  firstTime: boolean;
  recoveryFeel?: RecoveryFeel | null;
  supportNeeds?: SupportNeed[];
}

export type RecoveryFeel = "wound_pain" | "ok" | "exhausted" | "need_help";
export type SupportNeed = "night_listen" | "breastfeeding" | "exhaustion";

export interface User {
  id: string;
  nickname: string;
}

export interface Note {
  id?: string; // set once the note is saved on the server
  key: string; // message content, used as unique key
  text: string;
  topic: string;
  date: string;
  dkey: string;
}

export interface TrustedContact {
  name: string;
  phone: string;
  notes: string;
}

export interface SupportContact {
  key: string;
  name: string;
  phone: string;
  hours: string;
  status: "open" | "closed" | null;
  urgent?: boolean;
}

export interface SupportList {
  hope_open: boolean | null;
  contacts: SupportContact[];
}

export interface ApiProfile {
  birth_date: string;
  birth_type: "normal" | "csection";
  first_time: boolean;
  csection_kind?: "planned" | "emergency" | null;
  recovery_feel?: RecoveryFeel | null;
  support_needs?: SupportNeed[];
  babies: { label: string; formula: Formula | null; method: FeedMethod | null }[];
}

/** "Bộ nhớ của mẹ": short facts about the mother, kept only after she confirms them. */
export type MemoryCategory = "life" | "family" | "child_dev" | "feelings" | "body" | "work_money";

export interface Memory {
  id: string;
  text: string;
  category: MemoryCategory;
  created_at: string;
}

export interface MemorySettings {
  enabled: boolean;
  topics: MemoryCategory[];
}

export interface MemorySuggestion {
  text: string;
  category: MemoryCategory;
}
