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
}

export type Formula = "mom" | "only" | "mix";
export type FeedMethod = "direct" | "pump" | "both";

export interface Baby {
  label: string;
  formula: Formula | null;
  method: FeedMethod | null;
}

export interface Profile {
  birth: string; // YYYY-MM-DD
  birthType: "normal" | "csection";
  firstTime: boolean;
}

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
  babies: { label: string; formula: Formula | null; method: FeedMethod | null }[];
}
