import { Icon } from "../components/Icons";
import { DEFAULT_TIP, TIPS, TIP_KEY, moodOf } from "../content";
import { ageLabel, daysSince, kf } from "../lib/dates";
import { chipsFor, reflect } from "../lib/opener";
import { useStore } from "../store";

const RECENT = 5;

export function Home() {
  const { state, dispatch, send } = useStore();
  const last = state.checkins[state.checkins.length - 1];

  const days = state.profile ? daysSince(state.profile.birth) : 0;
  const pct = Math.min(100, Math.round((days / 56) * 100));
  const worry = last?.stressors[0];
  const tip = (worry && (TIPS[worry] ?? TIPS[TIP_KEY[worry] ?? ""])) || DEFAULT_TIP;
  const chips = last ? chipsFor(last) : [];
  const note = reflect(state.checkins);
  const doneToday = last?.key === kf(new Date());
  const recent = [...state.checkins].slice(-RECENT).reverse();

  const ask = (q: string) => {
    dispatch({ type: "go", screen: "chat" });
    void send(q);
  };

  const guestMessages = state.messages.filter((m) => m.role === "user").length;
  const showNudge = !state.user && !state.nudgeDismissed && guestMessages >= 2;

  return (
    <div className="page home">
      {showNudge && (
        <section className="card soft nudge">
          <h3>Mẹ muốn mình nhớ giúp mẹ?</h3>
          <p className="muted small">
            Tạo tài khoản ẩn danh (chỉ cần biệt danh và mã PIN) để giữ lại hồ sơ, check-in và ghi chú đã ghim.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => dispatch({ type: "dismissNudge" })}>
              Để sau
            </button>
            <button className="btn primary" onClick={() => dispatch({ type: "go", screen: "auth" })}>
              Tạo tài khoản
            </button>
          </div>
        </section>
      )}

      <h1 className="serif greet">Chào mẹ.</h1>
      {state.profile && (
        <p className="lead">
          Tính đến hôm nay, con đã được <strong>{ageLabel(state.profile.birth)}</strong> rồi.
        </p>
      )}
      <p className="lead ask-feel">Mẹ đang cảm thấy như thế nào?</p>

      <button className="cta" onClick={() => dispatch({ type: "go", screen: "checkin" })}>
        <Icon name="sparkle" />
        {doneToday ? "Cập nhật check-in hôm nay" : "Check-in cảm xúc của mẹ hiện tại"}
      </button>

      {note && (
        <section className="card soft message-card">
          <div className="msg-from">
            <span className="avatar-sm" aria-hidden="true">
              <Icon name="heart" size={14} />
            </span>
            Mẹ Ơi! nhắn gửi
          </div>
          <p className="serif quote">{note}</p>
          <div className="actions end">
            <button className="btn primary small-btn" onClick={() => dispatch({ type: "go", screen: "chat" })}>
              Trò chuyện cùng mình
            </button>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="serif">Check-in gần đây</h2>
            <button className="link add" onClick={() => dispatch({ type: "go", screen: "checkin" })}>
              <Icon name="plus" size={18} /> Thêm
            </button>
          </div>
          <ul className="recent-list">
            {recent.map((c) => (
              <li key={c.key}>
                <button
                  className="recent-row"
                  onClick={() => dispatch({ type: "openDiary", tab: "log", day: c.key })}
                  aria-label={`Check-in ngày ${c.date}`}
                >
                  <span className="recent-emoji" aria-hidden="true">
                    {moodOf(c.moods[0] ?? "")?.emoji}
                  </span>
                  <span className="recent-date">{c.key.slice(8)}/{c.key.slice(5, 7)}</span>
                  <span className="recent-text">
                    {(c.stressors.length ? c.stressors : c.moods).join(", ")}
                  </span>
                  {c.note && <span className="dot" aria-label="có ghi chú" />}
                  <Icon name="chevron" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.profile && (
        <section className="card hero">
          <div className="muted">{days} ngày bên con</div>
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${pct}%` }} />
          </div>
          <div className="muted small">
            {days >= 56
              ? "Đã qua mốc 8 tuần. Cơ thể mỗi mẹ hồi phục theo nhịp riêng."
              : `Hồi phục cơ bản thường mất 6–8 tuần · ngày ${days}/56`}
          </div>
        </section>
      )}

      <section className="card tip">
        <div className="tag">
          {tip.tag === "Y_TE" ? `Thông tin y tế${tip.source ? ` · ${tip.source}` : ""}` : "Mẹ Ơi!"}
        </div>
        <p>{tip.text}</p>
      </section>

      <section>
        <h3>{last ? "Mình muốn hỏi gì hôm nay?" : "Mẹ muốn bắt đầu từ đâu?"}</h3>
        <div className="chips">
          {(chips.length ? chips : ["Mình muốn kể một chút", "Mình muốn hỏi về bé"]).map((q) => (
            <button key={q} className="chip" onClick={() => ask(q)}>
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
