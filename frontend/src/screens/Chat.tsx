import { useEffect, useRef, useState, type FormEvent } from "react";
import { CrisisBanner } from "../components/CrisisBanner";
import { DEFAULT_SUGGESTIONS } from "../content";
import { isTier3, useStore } from "../store";
import type { Message } from "../types";

/** The pin is offered only on assistant replies that are not Tier 3 (the server enforces it too, M6). */
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
  const pinned = (m: Message) => state.notes.some((n) => n.key === m.content);

  return (
    <div className="chat">
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
              {(m.segments ?? [m.content]).map((s, k) => (
                <div key={k} className={`bubble assistant${m.error ? " error" : ""}`}>
                  {s}
                </div>
              ))}
              {canPin(m) && (
                <button
                  className={`pin${pinned(m) ? " on" : ""}`}
                  aria-pressed={pinned(m)}
                  aria-label={pinned(m) ? "Bỏ ghim câu trả lời" : "Ghim câu trả lời này"}
                  onClick={() => dispatch({ type: "togglePin", index: i, now: new Date() })}
                >
                  📌
                </button>
              )}
            </div>
          ),
        )}
        {state.sending && <div className="bubble assistant typing">Mình đang nghĩ…</div>}
        <div ref={endRef} />
      </div>

      {strip.length > 0 && (
        <div className="strip" aria-label="Gợi ý trả lời nhanh">
          {strip.map((s) => (
            <button key={s} className="chip" onClick={() => void send(s)}>
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
          placeholder="Mẹ nhắn cho mình…"
          maxLength={4000}
        />
        <button className="btn primary" type="submit" disabled={state.sending || !text.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
}
