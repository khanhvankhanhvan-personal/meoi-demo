import { useEffect, useRef, useState, type FormEvent } from "react";
import { CrisisBanner } from "../components/CrisisBanner";
import { Icon } from "../components/Icons";
import { DEFAULT_SUGGESTIONS } from "../content";
import { isTier3, useStore } from "../store";
import type { Message } from "../types";

/** The pin is offered only on assistant replies that are not Tier 3 (the server enforces it too). */
export function canPin(m: Message): boolean {
  return m.role === "assistant" && !m.error && m.pinnable !== false && !isTier3(m.tier);
}

/** Quick replies for the last assistant message. Never shown after Tier 3. */
export function suggestionsFor(messages: Message[], sending: boolean): string[] {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant" || sending || last.error || isTier3(last.tier)) return [];
  const own = (last.suggestions ?? []).slice(0, 4);
  if (own.length) return own;
  return DEFAULT_SUGGESTIONS[last.tier === "2" ? "2" : "1"];
}

export function Chat() {
  const { state, dispatch, send } = useStore();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [state.messages.length, state.sending, state.crisis]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text;
    setText("");
    void send(t);
  };

  const strip = suggestionsFor(state.messages, state.sending);
  const pinned = (s: string) => state.notes.some((n) => n.key === s);

  return (
    <div className="chat">
      <div className="chat-head">
        <span className="avatar" aria-hidden="true">
          M!
        </span>
        <div className="chat-title">
          <strong className="serif">Tâm sự cùng Mẹ Ơi!</strong>
          <span className="muted small">Luôn ở đây cùng mẹ • Không phán xét</span>
        </div>
        <button
          className="icon-btn badge-host"
          aria-label="Xem mục đã lưu"
          onClick={() => dispatch({ type: "openDiary", tab: "pins" })}
        >
          <Icon name="bookmark" />
          {state.notes.length > 0 && <span className="badge dot-badge" aria-hidden="true" />}
        </button>
        <button className="icon-btn" aria-label="Bắt đầu cuộc trò chuyện mới" onClick={() => dispatch({ type: "newChat" })}>
          <Icon name="refresh" />
        </button>
      </div>

      {state.crisis && (
        <CrisisBanner crisis={state.crisis} onDismiss={() => dispatch({ type: "dismissCrisis" })} />
      )}

      <div className="messages" aria-live="polite">
        {state.messages.length === 0 && (
          <p className="muted empty">
            Mẹ muốn nói gì cũng được — về bé, về mẹ, hay chỉ đơn giản là một ngày dài.
          </p>
        )}
        {state.messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="bubble user">
              {m.content}
            </div>
          ) : (
            <div key={i} className="assistant-group">
              {(m.segments ?? [m.content]).map((s, k) => {
                const on = pinned(s);
                return (
                  <div key={k} className={`bubble assistant${m.error ? " error" : ""}`}>
                    <span>{s}</span>
                    {canPin(m) && (
                      <button
                        className={`pin${on ? " on" : ""}`}
                        aria-pressed={on}
                        aria-label={on ? "Bỏ ghim câu trả lời" : "Ghim câu trả lời này"}
                        title={on ? "Bỏ ghim lời khuyên này" : "Ghim lời khuyên này"}
                        onClick={() => dispatch({ type: "togglePin", index: i, seg: k, now: new Date() })}
                      >
                        <Icon name="bookmark" filled={on} size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ),
        )}
        {state.sending && <div className="bubble assistant typing">Mình đang nghĩ…</div>}
        <div ref={endRef} />
      </div>

      {strip.length > 0 && (
        <div className="strip" aria-label="Gợi ý trả lời nhanh">
          {strip.map((s) => (
            <button key={s} className="chip quick" onClick={() => void send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="composer" onSubmit={submit}>
        <input
          aria-label="Tin nhắn"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhắn cho mình…"
          maxLength={4000}
        />
        <button className="send" type="submit" aria-label="Gửi" disabled={state.sending || !text.trim()}>
          <Icon name="send" size={20} />
        </button>
      </form>
    </div>
  );
}
