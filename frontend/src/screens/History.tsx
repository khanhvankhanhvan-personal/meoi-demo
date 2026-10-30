import { useState } from "react";
import { MOODS } from "../content";
import { kf, vf } from "../lib/dates";
import { useStore } from "../store";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function History() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<"diary" | "notes">("diary");
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const byKey = new Map(state.checkins.map((c) => [c.key, c]));
  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first grid
  const dim = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: dim }, (_, d) => kf(new Date(cursor.y, cursor.m, d + 1))),
  ];
  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };
  const sel = state.selDay ? byKey.get(state.selDay) : undefined;

  return (
    <div className="page">
      <div className="tabsbar" role="tablist">
        <button role="tab" aria-selected={tab === "diary"} className={tab === "diary" ? "on" : ""} onClick={() => setTab("diary")}>
          Nhật ký check-in
        </button>
        <button role="tab" aria-selected={tab === "notes"} className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>
          Ghi chú
        </button>
      </div>

      {tab === "diary" && (
        <>
          <div className="row between">
            <button aria-label="Tháng trước" onClick={() => move(-1)}>
              ‹
            </button>
            <strong>
              Tháng {cursor.m + 1}, {cursor.y}
            </strong>
            <button aria-label="Tháng sau" onClick={() => move(1)}>
              ›
            </button>
          </div>
          <div className="cal">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-h">
                {w}
              </div>
            ))}
            {cells.map((key, i) => {
              if (!key) return <div key={`e${i}`} />;
              const rec = byKey.get(key);
              const day = Number(key.slice(8));
              return (
                <button
                  key={key}
                  className={`cal-d${state.selDay === key ? " on" : ""}${rec ? " has" : ""}`}
                  aria-label={`Ngày ${day}${rec ? `, đã check-in ${rec.moods.join(", ")}` : ""}`}
                  onClick={() => dispatch({ type: "selectDay", key })}
                >
                  <span className="n">{day}</span>
                  {rec && <span aria-hidden="true">{MOODS.find((m) => m.label === rec.moods[0])?.emoji}</span>}
                </button>
              );
            })}
          </div>

          {state.selDay &&
            (sel ? (
              <section className="card" aria-label="Chi tiết ngày">
                <h3>{sel.date}</h3>
                <p>Tâm trạng: {sel.moods.join(", ")}</p>
                {sel.sleep && <p>Giấc ngủ: {sel.sleep}</p>}
                {sel.bodies.length > 0 && <p>Cơ thể: {sel.bodies.join(", ")}</p>}
                {sel.stressors.length > 0 && <p>Nặng lòng: {sel.stressors.join(", ")}</p>}
                {state.notes
                  .filter((n) => n.dkey === sel.key)
                  .map((n) => (
                    <blockquote key={n.key}>{n.text}</blockquote>
                  ))}
              </section>
            ) : (
              <section className="card soft">
                Ngày {vf(new Date(state.selDay + "T00:00:00"))} mẹ chưa check-in. Không sao cả, mẹ cứ ghé khi nào thấy cần.
              </section>
            ))}
        </>
      )}

      {tab === "notes" && (
        <>
          {state.notes.length === 0 ? (
            <section className="card soft">
              Chưa có ghi chú nào. Bấm 📌 bên cạnh câu trả lời nào của mình mà mẹ muốn lưu.
            </section>
          ) : (
            <ul className="notes">
              {[...state.notes].reverse().map((n) => (
                <li key={n.key} className="card">
                  <div className="muted small">
                    {n.date} · {n.topic}
                  </div>
                  <p>{n.text}</p>
                  <button className="link" onClick={() => dispatch({ type: "deleteNote", key: n.key })}>
                    Xoá ghi chú
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
