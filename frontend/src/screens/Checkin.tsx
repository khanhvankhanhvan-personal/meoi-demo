import { useState } from "react";
import { Icon } from "../components/Icons";
import { BODIES, MOODS, SLEEPS, STRESSORS, canon } from "../content";
import { kf, vf } from "../lib/dates";
import { useStore } from "../store";
import type { CheckinRecord } from "../types";

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Slide-up sheet: how the mother feels right now. One check-in per day, the latest wins. */
export function Checkin() {
  const { state, dispatch } = useStore();
  const existing = state.checkins.find((c) => c.key === kf(new Date()));
  // Check-ins saved before the redesign used other names; show them under the new ones.
  const [moods, setMoods] = useState<string[]>((existing?.moods ?? []).map(canon));
  const [sleep, setSleep] = useState<string | null>(existing?.sleep ? canon(existing.sleep) : null);
  const [bodies, setBodies] = useState<string[]>(existing?.bodies ?? []);
  const [stressors, setStressors] = useState<string[]>(existing?.stressors ?? []);
  const [note, setNote] = useState(existing?.note ?? "");

  const close = () => dispatch({ type: "go", screen: "home" });
  const submit = () => {
    const now = new Date();
    const record: CheckinRecord = {
      key: kf(now),
      date: vf(now),
      moods,
      sleep,
      bodies,
      stressors,
      ...(note.trim() ? { note: note.trim() } : {}),
    };
    dispatch({ type: "saveCheckin", record, openChat: true });
  };

  return (
    <div className="sheet-back checkin-back" onClick={close}>
      <div
        className="sheet checkin-sheet"
        role="dialog"
        aria-label="Check-in cảm xúc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checkin-head">
          <div>
            <h2 className="serif">Check-in cảm xúc</h2>
            <p className="muted small">Chỉ mất 1 phút để lắng nghe bản thân</p>
          </div>
          <button className="icon-btn" aria-label="Đóng" onClick={close}>
            <Icon name="close" />
          </button>
        </div>

        <div className="checkin-body">
          <h3>1. Cảm xúc nổi bật nhất lúc này</h3>
          <div role="group" aria-label="Tâm trạng" className="mood-row">
            {MOODS.map((m) => {
              const on = moods.includes(m.label);
              return (
                <button
                  key={m.label}
                  type="button"
                  className={`mood${on ? " on" : ""}`}
                  aria-pressed={on}
                  onClick={() => setMoods(toggle(moods, m.label))}
                >
                  <span className="mood-emoji" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <h3>2. Giấc ngủ của mẹ vừa qua</h3>
          <div role="group" aria-label="Giấc ngủ" className="sleep-grid">
            {SLEEPS.map((o) => {
              const on = sleep === o.label;
              return (
                <button
                  key={o.label}
                  type="button"
                  className={`sleep${on ? " on" : ""}`}
                  aria-pressed={on}
                  onClick={() => setSleep(on ? null : o.label)}
                >
                  <span className="sleep-emoji" aria-hidden="true">
                    {o.emoji}
                  </span>
                  <span>
                    <strong>{o.label}</strong>
                    <small>{o.sub}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="q-head">
            <h3>3. Cơ thể và thể chất mẹ thế nào?</h3>
            <span className="muted small">(Chọn nhiều đáp án)</span>
          </div>
          <div role="group" aria-label="Cơ thể" className="pills">
            {BODIES.map((o) => (
              <button
                key={o.label}
                type="button"
                className={`pill-btn${bodies.includes(o.label) ? " on" : ""}`}
                aria-pressed={bodies.includes(o.label)}
                onClick={() => setBodies(toggle(bodies, o.label))}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="q-head">
            <h3>4. Điều gì đang choán lấy tâm trí mẹ?</h3>
            <span className="muted small">(Chọn nhiều đáp án)</span>
          </div>
          <div role="group" aria-label="Điều đang nặng lòng" className="pills">
            {STRESSORS.map((o) => (
              <button
                key={o.label}
                type="button"
                className={`pill-btn${stressors.includes(o.label) ? " on" : ""}`}
                aria-pressed={stressors.includes(o.label)}
                onClick={() => setStressors(toggle(stressors, o.label))}
              >
                {o.label}
              </button>
            ))}
          </div>

          <h3>5. Vài dòng chia sẻ thêm nếu mẹ muốn (không bắt buộc)</h3>
          <textarea
            aria-label="Vài dòng chia sẻ thêm"
            className="note-input"
            rows={3}
            maxLength={500}
            placeholder="Ví dụ: Bé thức dậy 4 lần đêm nay, vai mình cứng đờ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="checkin-foot">
          <button className="btn primary wide" disabled={moods.length === 0} onClick={submit}>
            Lưu check-in này
          </button>
        </div>
      </div>
    </div>
  );
}
