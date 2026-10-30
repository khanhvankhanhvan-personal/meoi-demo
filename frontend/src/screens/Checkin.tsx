import { useState } from "react";
import { ChipGroup } from "../components/Chips";
import { BODIES, MOODS, SLEEPS, STRESSORS } from "../content";
import { kf, vf } from "../lib/dates";
import { useStore } from "../store";
import type { CheckinRecord } from "../types";

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function Checkin() {
  const { state, dispatch } = useStore();
  const existing = state.checkins.find((c) => c.key === kf(new Date()));
  const [moods, setMoods] = useState<string[]>(existing?.moods ?? []);
  const [sleep, setSleep] = useState<string | null>(existing?.sleep ?? null);
  const [bodies, setBodies] = useState<string[]>(existing?.bodies ?? []);
  const [stressors, setStressors] = useState<string[]>(existing?.stressors ?? []);

  const submit = () => {
    const now = new Date();
    const record: CheckinRecord = { key: kf(now), date: vf(now), moods, sleep, bodies, stressors };
    dispatch({ type: "saveCheckin", record, openChat: true });
  };

  return (
    <div className="page">
      <h1 className="serif">Hôm nay của mẹ thế nào?</h1>
      <h3>Tâm trạng</h3>
      <ChipGroup legend="Tâm trạng" options={MOODS} selected={moods} onToggle={(v) => setMoods(toggle(moods, v))} />
      <h3>Giấc ngủ</h3>
      <ChipGroup
        legend="Giấc ngủ"
        options={SLEEPS}
        selected={sleep ? [sleep] : []}
        onToggle={(v) => setSleep(sleep === v ? null : v)}
      />
      <h3>Cơ thể</h3>
      <ChipGroup legend="Cơ thể" options={BODIES} selected={bodies} onToggle={(v) => setBodies(toggle(bodies, v))} />
      <h3>Điều đang nặng lòng</h3>
      <ChipGroup
        legend="Điều đang nặng lòng"
        options={STRESSORS}
        selected={stressors}
        onToggle={(v) => setStressors(toggle(stressors, v))}
      />
      <button className="btn primary" disabled={moods.length === 0} onClick={submit}>
        Lưu check-in
      </button>
    </div>
  );
}
