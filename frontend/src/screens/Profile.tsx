import { Choice } from "../components/Chips";
import { SupportList } from "../components/SupportList";
import { FEED_FORMULA, FEED_METHOD } from "../content";
import { birthDateError, kf, weeksOld } from "../lib/dates";
import { emptyBaby, useStore } from "../store";
import type { Baby } from "../types";

export function Profile() {
  const { state, dispatch } = useStore();
  const p = state.profile;
  const err = p ? birthDateError(p.birth) : null;

  return (
    <div className="page">
      <h1 className="serif">Hồ sơ của mẹ</h1>
      {p && (
        <section className="card">
          <h3>Cách sinh</h3>
          <Choice
            legend="Cách sinh"
            options={[
              { key: "normal", label: "Sinh thường" },
              { key: "csection", label: "Sinh mổ" },
            ]}
            value={p.birthType}
            onChange={(v) => v && dispatch({ type: "setProfile", profile: { birthType: v } })}
          />
          <label className="field">
            <span className="small muted">Ngày sinh của bé</span>
            <input
              type="date"
              value={p.birth}
              max={kf(new Date())}
              onChange={(e) => e.target.value && dispatch({ type: "setProfile", profile: { birth: e.target.value } })}
            />
          </label>
          {err ? <p className="error">{err}</p> : <p className="muted small">Con khoảng {weeksOld(p.birth)} tuần tuổi.</p>}
          <h3>Lần sinh</h3>
          <Choice
            legend="Lần sinh"
            options={[
              { key: "first", label: "Em bé đầu tiên" },
              { key: "other", label: "Mình còn có bé khác" },
            ]}
            value={p.firstTime ? "first" : "other"}
            onChange={(v) => v && dispatch({ type: "setProfile", profile: { firstTime: v === "first" } })}
          />
        </section>
      )}

      <section className="card">
        <h3>Người thân tin cậy</h3>
        <p className="muted small">
          Không bắt buộc — nhưng sẽ giúp mình hiểu và đồng hành cùng mẹ tốt hơn. Mẹ có thể thêm, sửa hoặc xoá bất cứ lúc nào.
        </p>
        <label className="field">
          <span className="small muted">Tên</span>
          <input value={state.trusted.name} onChange={(e) => dispatch({ type: "setTrusted", trusted: { name: e.target.value } })} />
        </label>
        <label className="field">
          <span className="small muted">Số điện thoại</span>
          <input
            type="tel"
            inputMode="tel"
            value={state.trusted.phone}
            onChange={(e) => dispatch({ type: "setTrusted", trusted: { phone: e.target.value } })}
          />
        </label>
        <label className="field">
          <span className="small muted">Ghi chú</span>
          <input value={state.trusted.notes} onChange={(e) => dispatch({ type: "setTrusted", trusted: { notes: e.target.value } })} />
        </label>
      </section>

      <section className="card">
        <h3>Hỗ trợ khi mẹ cần</h3>
        <SupportList />
      </section>
    </div>
  );
}

export function BabyProfile() {
  const { state, dispatch } = useStore();
  const babies = state.babies;
  const set = (next: Baby[]) => dispatch({ type: "setBabies", babies: next });
  const patch = (k: number, b: Partial<Baby>) => set(babies.map((x, j) => (j === k ? { ...x, ...b } : x)));

  return (
    <div className="page">
      <h1 className="serif">Hồ sơ con</h1>
      {state.profile && <p className="muted">Bé khoảng {weeksOld(state.profile.birth)} tuần tuổi.</p>}
      <div className="stepper">
        <button aria-label="Bớt một bé" disabled={babies.length <= 1} onClick={() => set(babies.slice(0, -1))}>
          −
        </button>
        <span aria-live="polite">{babies.length} bé</span>
        <button aria-label="Thêm một bé" disabled={babies.length >= 4} onClick={() => set([...babies, emptyBaby()])}>
          +
        </button>
      </div>
      {babies.map((b, k) => (
        <section key={k} className="card">
          <h3>{babies.length > 1 ? `Bé ${k + 1}` : "Bé"}</h3>
          <label className="field">
            <span className="small muted">Tên gọi của bé</span>
            <input value={b.label} maxLength={40} onChange={(e) => patch(k, { label: e.target.value })} />
          </label>
          <Choice
            legend={`Cách nuôi bé ${k + 1}`}
            options={FEED_FORMULA}
            value={b.formula}
            onChange={(f) => patch(k, { formula: f, method: f === "only" ? null : b.method })}
          />
          {(b.formula === "mom" || b.formula === "mix") && (
            <Choice legend={`Cách cho bú bé ${k + 1}`} options={FEED_METHOD} value={b.method} onChange={(m) => patch(k, { method: m })} />
          )}
        </section>
      ))}
    </div>
  );
}
