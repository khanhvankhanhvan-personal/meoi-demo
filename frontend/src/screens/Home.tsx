import { useState } from "react";
import { ChipGroup } from "../components/Chips";
import { DEFAULT_TIP, MOODS, TIPS } from "../content";
import { daysSince, kf, vf } from "../lib/dates";
import { chipsFor, reflect } from "../lib/opener";
import { useStore } from "../store";

/** Week band -> which stressor tip the hero shows (spec 4.2.1). null = hide for the first 3 weeks. */
function heroKey(weekIdx: number): string | null {
  if (weekIdx <= 2) return null;
  if (weekIdx <= 6) return "Cơ thể chưa hồi phục";
  if (weekIdx <= 12) return "Không còn là mình";
  return "Cô đơn, không ai hỏi han";
}

export function Home() {
  const { state, dispatch, send } = useStore();
  const [quick, setQuick] = useState<string[]>([]);
  const last = state.checkins[state.checkins.length - 1];

  const days = state.profile ? daysSince(state.profile.birth) : 0;
  const weekIdx = Math.floor(days / 7);
  const hKey = heroKey(weekIdx);
  const pct = Math.min(100, Math.round((days / 56) * 100));
  const tip = (last?.stressors[0] && TIPS[last.stressors[0]]) || DEFAULT_TIP;
  const chips = last ? chipsFor(last) : [];
  const note = reflect(state.checkins);

  const ask = (q: string) => {
    dispatch({ type: "go", screen: "chat" });
    void send(q);
  };

  const quickSave = () => {
    const now = new Date();
    dispatch({
      type: "saveCheckin",
      record: { key: kf(now), date: vf(now), moods: quick, sleep: null, bodies: [], stressors: [] },
      openChat: true,
    });
    setQuick([]);
  };

  return (
    <div className="page">
      {state.profile && (
        <section className="card hero">
          <div className="serif hero-title">Tuần {weekIdx + 1}</div>
          <div className="muted">{days} ngày bên con</div>
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: `${pct}%` }} />
          </div>
          <div className="muted small">
            {days >= 56
              ? "Đã qua mốc 8 tuần. Cơ thể mỗi mẹ hồi phục theo nhịp riêng."
              : `Hồi phục cơ bản thường mất 6–8 tuần · ngày ${days}/56`}
          </div>
          {hKey && <p className="hero-tip">{TIPS[hKey].text}</p>}
        </section>
      )}

      <section className="card">
        <h3>Hôm nay mẹ thấy thế nào?</h3>
        <ChipGroup
          legend="Tâm trạng nhanh"
          options={MOODS}
          selected={quick}
          onToggle={(v) => setQuick(quick.includes(v) ? quick.filter((x) => x !== v) : [...quick, v])}
        />
        {quick.length > 0 && (
          <div className="row">
            <button className="btn primary" onClick={quickSave}>
              Lưu check-in
            </button>
            <button className="link" onClick={() => dispatch({ type: "go", screen: "checkin" })}>
              Check-in chi tiết hơn →
            </button>
          </div>
        )}
        {quick.length === 0 && (
          <button className="link" onClick={() => dispatch({ type: "go", screen: "checkin" })}>
            {last?.key === kf(new Date()) ? "Cập nhật check-in hôm nay →" : "Check-in 1 phút →"}
          </button>
        )}
      </section>

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

      {note && <section className="card soft">{note}</section>}

      {state.checkins.length === 0 && (
        <section className="grid">
          {(
            [
              ["🌤️", "Check-in 1 phút", "checkin"],
              ["💬", "Nói chuyện với mình", "chat"],
              ["📅", "Những ngày của mẹ", "history"],
              ["👶", "Xem hồ sơ con", "babyprofile"],
            ] as const
          ).map(([emoji, title, screen]) => (
            <button key={title} className="card intro" onClick={() => dispatch({ type: "go", screen })}>
              <span aria-hidden="true">{emoji}</span>
              {title}
            </button>
          ))}
        </section>
      )}

      {state.checkins.length > 0 && (
        <section>
          <h3>Những ngày gần đây</h3>
          <ul className="recent">
            {state.checkins
              .slice(-3)
              .reverse()
              .map((c) => (
                <li key={c.key}>
                  <span aria-hidden="true">{MOODS.find((m) => m.label === c.moods[0])?.emoji}</span> {c.date}
                  {c.stressors[0] ? ` · ${c.stressors[0]}` : ""}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
