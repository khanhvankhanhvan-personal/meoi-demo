import { useState } from "react";
import { Choice } from "../components/Chips";
import { FEED_FORMULA, FEED_METHOD } from "../content";
import { WheelDatePicker } from "../components/WheelDatePicker";
import { ageLabel, birthDateError, kf } from "../lib/dates";
import { emptyBaby, useStore } from "../store";
import type { Baby, Formula } from "../types";

const PARITY = [
  { key: "first", label: "Đúng rồi, đây là em bé đầu tiên của mình" },
  { key: "other", label: "Không phải, mình còn có bé khác" },
] as const;

const BIRTH_TYPES = [
  { key: "normal", label: "Sinh thường" },
  { key: "csection", label: "Sinh mổ" },
] as const;

/** Three steps: how many babies -> birth date -> profile. */
export function Intake() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [multi, setMulti] = useState<boolean | null>(null);
  const [count, setCount] = useState(2);
  const [birth, setBirth] = useState(() => kf(new Date()));
  const [birthType, setBirthType] = useState<"normal" | "csection" | null>(null);
  const [parity, setParity] = useState<"first" | "other" | null>(null);
  const [babies, setBabies] = useState<Baby[]>([emptyBaby()]);

  const dateError = birth ? birthDateError(birth) : null;
  const n = multi ? count : 1;

  const resizeBabies = (size: number) =>
    setBabies((prev) => Array.from({ length: size }, (_, k) => prev[k] ?? emptyBaby()));
  const patchBaby = (k: number, patch: Partial<Baby>) =>
    setBabies((prev) => prev.map((b, j) => (j === k ? { ...b, ...patch } : b)));

  const finish = () => {
    if (!birthType || !parity || !birth) return;
    dispatch({
      type: "finishIntake",
      profile: { birth, birthType, firstTime: parity === "first" },
      babies: babies.slice(0, n),
    });
  };

  return (
    <div className="page intake">
      <div className="muted small">Bước {step + 1}/3</div>

      {step === 0 && (
        <>
          <p className="lead">
            Để mình đồng hành sát với mẹ hơn, mẹ cho mình biết vài điều nhé.
          </p>
          <h2>Lần sinh này mẹ có mấy bé?</h2>
          <div className="choices">
            <button
              className={`choice${multi === false ? " on" : ""}`}
              aria-pressed={multi === false}
              onClick={() => {
                setMulti(false);
                resizeBabies(1);
              }}
            >
              1 bé
            </button>
            <button
              className={`choice${multi === true ? " on" : ""}`}
              aria-pressed={multi === true}
              onClick={() => {
                setMulti(true);
                resizeBabies(count);
              }}
            >
              Đa thai
            </button>
          </div>
          {multi && (
            <div className="stepper">
              <button
                aria-label="Bớt một bé"
                disabled={count <= 2}
                onClick={() => {
                  setCount(count - 1);
                  resizeBabies(count - 1);
                }}
              >
                −
              </button>
              <span aria-live="polite">{count} bé</span>
              <button
                aria-label="Thêm một bé"
                disabled={count >= 4}
                onClick={() => {
                  setCount(count + 1);
                  resizeBabies(count + 1);
                }}
              >
                +
              </button>
            </div>
          )}
          <div className="actions">
            <button className="btn primary" disabled={multi === null} onClick={() => setStep(1)}>
              Tiếp tục
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2>Con sinh ngày nào vậy mẹ ơi?</h2>
          <WheelDatePicker label="Ngày sinh của con" value={birth} onChange={setBirth} />
          {dateError && <p className="error">{dateError}</p>}
          {birth && !dateError && (
            <p className="muted">Như vậy, con đã được khoảng {ageLabel(birth)}.</p>
          )}
          <div className="actions">
            <button className="btn" onClick={() => setStep(0)}>
              Quay lại
            </button>
            <button
              className="btn primary"
              disabled={!birth || !!dateError}
              onClick={() => setStep(2)}
            >
              Tiếp tục
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="serif">Thêm vài điều về mẹ và bé</h2>
          <h3>Mẹ sinh theo cách nào?</h3>
          <Choice legend="Cách sinh" options={[...BIRTH_TYPES]} value={birthType} onChange={setBirthType} />

          {babies.slice(0, n).map((b, k) => (
            <section key={k} className="card">
              <h3>{n > 1 ? `Bé ${k + 1}` : "Bé"}</h3>
              <label className="field">
                <span className="small muted">Tên gọi của bé (không bắt buộc)</span>
                <input
                  type="text"
                  maxLength={40}
                  value={b.label}
                  onChange={(e) => patchBaby(k, { label: e.target.value })}
                />
              </label>
              <Choice
                legend={`Cách nuôi bé ${k + 1}`}
                options={FEED_FORMULA}
                value={b.formula}
                onChange={(f: Formula | null) =>
                  patchBaby(k, { formula: f, method: f === "only" ? null : b.method })
                }
              />
              {(b.formula === "mom" || b.formula === "mix") && (
                <Choice
                  legend={`Cách cho bú bé ${k + 1}`}
                  options={FEED_METHOD}
                  value={b.method}
                  onChange={(m) => patchBaby(k, { method: m })}
                />
              )}
            </section>
          ))}

          <h3>Mẹ sinh con lần đầu?</h3>
          <Choice legend="Lần sinh" options={[...PARITY]} value={parity} onChange={setParity} />
          <p className="muted small">
            Không bắt buộc — nhưng sẽ giúp mình hiểu và đồng hành cùng mẹ tốt hơn. Mẹ có thể thêm, sửa hoặc
            xoá bất cứ lúc nào.
          </p>
          <div className="actions">
            <button className="btn" onClick={() => setStep(1)}>
              Quay lại
            </button>
            <button className="btn primary" disabled={!birthType || !parity} onClick={finish}>
              Xong
            </button>
          </div>
        </>
      )}
    </div>
  );
}
