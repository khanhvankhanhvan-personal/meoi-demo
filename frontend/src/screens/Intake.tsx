import { useState } from "react";
import { Icon } from "../components/Icons";
import { CardChoice, MultiChoice, Progress, Screen, StepBar, StepHead } from "../components/OnboardingParts";
import { WheelDatePicker } from "../components/WheelDatePicker";
import {
  BABY_COUNTS,
  BIRTH_KINDS,
  FEED_FORMULA,
  FEED_METHOD,
  PARITY,
  RECOVERY_FEELS,
  SUPPORT_NEEDS,
  ageNote,
} from "../content";
import { ageLabel, birthDateError, daysSince, kf, parseKey } from "../lib/dates";
import { emptyBaby, useStore } from "../store";
import type { Baby, Formula, RecoveryFeel, SupportNeed } from "../types";

type Kind = "normal" | "planned" | "emergency";

const QUICK_DATES = [
  { label: "Hôm nay", days: 0 },
  { label: "2 tuần trước", days: 14 },
  { label: "4 tuần trước (1 tháng)", days: 28 },
  { label: "8 tuần trước", days: 56 },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return kf(d);
};

const dd = (key: string) => {
  const d = parseKey(key);
  return [d.getDate(), d.getMonth() + 1].map((x) => String(x).padStart(2, "0")).join("/") + `/${d.getFullYear()}`;
};

/** Steps 2-5 of 5: the birth, the baby's date, feeding, and a summary. Step 1 is Onboarding. */
export function Intake() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(2);
  const [count, setCount] = useState<"1" | "2" | "3">("1");
  const [parity, setParity] = useState<"first" | "other" | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [recovery, setRecovery] = useState<RecoveryFeel | null>(null);
  const [birth, setBirth] = useState(() => kf(new Date()));
  const [babies, setBabies] = useState<Baby[]>([emptyBaby()]);
  const [needs, setNeeds] = useState<SupportNeed[]>([]);

  const n = Number(count);
  const skip = () => dispatch({ type: "go", screen: "home" });
  const resize = (size: number) => setBabies((prev) => Array.from({ length: size }, (_, k) => prev[k] ?? emptyBaby()));
  const patchBaby = (k: number, patch: Partial<Baby>) =>
    setBabies((prev) => prev.map((b, j) => (j === k ? { ...b, ...patch } : b)));

  const finish = (then: "checkin" | "chat") => {
    if (!kind || !parity) return;
    dispatch({
      type: "finishIntake",
      profile: {
        birth,
        birthType: kind === "normal" ? "normal" : "csection",
        csectionKind: kind === "normal" ? null : kind,
        firstTime: parity === "first",
        recoveryFeel: recovery,
        supportNeeds: needs,
      },
      babies: babies.slice(0, n),
      then,
    });
  };

  const dateError = birthDateError(birth);
  const days = daysSince(birth);
  const name = (k: number) => babies[k]?.label.trim() || (n > 1 ? `Bé ${k + 1}` : "Bé");

  /* ---------- step 2: the birth ---------- */
  if (step === 2) {
    return (
      <Screen>
        <Progress step={2} onSkip={skip} />
        <div className="ob-body">
          <StepHead
            icon="pulse"
            title="Trải nghiệm sinh"
            lead="Hiểu được lần sinh này giúp Mẹ Ơi! đồng hành sát sao và chăm sóc thể chất của mẹ đúng cách hơn."
          />
          <h3>1. Lần này mẹ sinh bao nhiêu bé?</h3>
          <CardChoice
            legend="Số bé"
            options={BABY_COUNTS}
            value={count}
            columns={3}
            centered
            onChange={(v) => {
              const next = v ?? "1";
              setCount(next);
              resize(Number(next));
            }}
          />
          <h3>2. Đây có phải lần đầu mẹ sinh con không?</h3>
          <CardChoice legend="Lần sinh" options={PARITY} value={parity} onChange={setParity} />
          <h3>3. Cách thức sinh:</h3>
          <CardChoice legend="Cách sinh" options={BIRTH_KINDS} value={kind} onChange={setKind} />
          <h3>4. Cảm nhận hồi phục hiện tại của mẹ:</h3>
          <CardChoice
            legend="Cảm nhận hồi phục"
            options={RECOVERY_FEELS}
            value={recovery}
            onChange={setRecovery}
          />
        </div>
        <StepBar
          onBack={() => dispatch({ type: "go", screen: "onboarding" })}
          onNext={() => setStep(3)}
          disabled={!parity || !kind}
        />
      </Screen>
    );
  }

  /* ---------- step 3: the baby's date ---------- */
  if (step === 3) {
    return (
      <Screen>
        <Progress step={3} onSkip={skip} />
        <div className="ob-body">
          <StepHead icon="calendar" title="Con sinh vào ngày nào?" lead="Mẹ chọn ngày để mình tính tuổi của bé nhé." />
          <div className="date-line">
            <span className="muted small">
              <Icon name="calendar" size={16} /> Ngày sinh của con:
            </span>
            <span className="date-chip">{dd(birth)}</span>
          </div>
          <WheelDatePicker label="Ngày sinh của con" value={birth} onChange={setBirth} />
          <div className="muted small">Chọn nhanh:</div>
          <div className="chips quick-dates">
            {QUICK_DATES.map((q) => (
              <button key={q.label} type="button" className="chip pill" onClick={() => setBirth(daysAgo(q.days))}>
                {q.label}
              </button>
            ))}
          </div>
          {babies.slice(0, n).map((b, k) => (
            <label key={k} className="field">
              <span className="small muted">
                {n > 1 ? `Tên gọi của bé ${k + 1}` : "Tên gọi của bé"} (không bắt buộc)
              </span>
              <input
                type="text"
                maxLength={40}
                value={b.label}
                onChange={(e) => patchBaby(k, { label: e.target.value })}
              />
            </label>
          ))}
          {dateError ? (
            <p className="error">{dateError}</p>
          ) : (
            <section className="card soft age-card">
              <div className="age-title">
                <Icon name="sparkle" size={18} />
                <strong>Con hiện được {ageLabel(birth)}</strong>
              </div>
              <p>{ageNote(days)}</p>
            </section>
          )}
        </div>
        <StepBar onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={!!dateError} />
      </Screen>
    );
  }

  /* ---------- step 4: feeding ---------- */
  if (step === 4) {
    return (
      <Screen>
        <Progress step={4} onSkip={skip} />
        <div className="ob-body">
          <StepHead icon="heart" title="Cách con ti & sữa cho bé" lead="Phương thức ngậm ti và cữ sữa hiện tại của bé cưng:" />
          {babies.slice(0, n).map((b, k) => (
            <section key={k} className="card">
              <h3 className="card-title">
                <span className="num">{k + 1}</span> Cách ti của {name(k)}
              </h3>
              <CardChoice
                legend={`Cách ti của ${name(k)}`}
                options={FEED_METHOD}
                value={b.method}
                onChange={(m) =>
                  patchBaby(k, { method: m, formula: m === "bottle" && !b.formula ? "only" : b.formula })
                }
              />
              <h3>Tình hình sử dụng sữa công thức:</h3>
              <CardChoice
                legend={`Sữa của ${name(k)}`}
                options={FEED_FORMULA}
                value={b.formula}
                onChange={(f: Formula | null) => patchBaby(k, { formula: f })}
              />
            </section>
          ))}
        </div>
        <StepBar onBack={() => setStep(3)} onNext={() => setStep(5)} />
      </Screen>
    );
  }

  /* ---------- step 5: summary ---------- */
  const formulaLabel = FEED_FORMULA.find((f) => f.key === babies[0]?.formula)?.label;
  const kindLabel = BIRTH_KINDS.find((b) => b.key === kind)?.label.replace(/ \(.*\)/, "");
  const parityLabel = PARITY.find((p) => p.key === parity)?.label;
  return (
    <Screen>
      <Progress step={5} onSkip={skip} />
      <div className="ob-body center-body">
        <span className="ob-tile big round" aria-hidden="true">
          <Icon name="heart" size={30} filled />
        </span>
        <h1 className="serif">Mẹ đã làm rất tuyệt vời rồi.</h1>
        <p className="lead">
          Hành trình nuôi dạy bé con luôn có những bước chập chững. Mẹ không cần phải gồng mình để luôn hoàn hảo.
        </p>
        <section className="card recap">
          <strong>Hồ sơ đã ghi nhận:</strong>
          <ul>
            <li>
              Bé:{" "}
              <span className="pink">
                {babies
                  .slice(0, n)
                  .map((_, k) => name(k))
                  .join(", ")}
              </span>{" "}
              ({ageLabel(birth)})
            </li>
            <li>
              Lần sinh: <strong>{parityLabel}</strong> — {kindLabel}
            </li>
            {formulaLabel && <li>Sữa & cữ bú: {formulaLabel}</li>}
          </ul>
        </section>
        <h3 className="left">Mẹ đang cần hỗ trợ nhiều nhất về điều gì?</h3>
        <MultiChoice legend="Cần hỗ trợ" options={SUPPORT_NEEDS} values={needs} onChange={setNeeds} />
        <div className="end-actions">
          <button className="btn primary wide" onClick={() => finish("checkin")}>
            Mẹ hãy ghi nhận trạng thái cơ thể lúc này nhé →
          </button>
          <button className="btn soft-btn wide" onClick={() => finish("chat")}>
            <Icon name="chat" size={18} /> Tâm sự cùng Mẹ Ơi! ngay bây giờ
          </button>
          <button className="link" onClick={() => setStep(4)}>
            ← Quay lại
          </button>
        </div>
      </div>
    </Screen>
  );
}
