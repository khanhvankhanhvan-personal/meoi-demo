import { useState } from "react";
import { AccountCard } from "../components/AccountCard";
import { Icon } from "../components/Icons";
import { CardChoice } from "../components/OnboardingParts";
import { WheelDatePicker } from "../components/WheelDatePicker";
import {
  BABY_COUNTS,
  BIRTH_KINDS,
  FEED_FORMULA,
  FEED_METHOD,
  PARITY,
  RECOVERY_FEELS,
} from "../content";
import { ageLabel, birthDateError, parseKey } from "../lib/dates";
import { emptyBaby, useStore } from "../store";
import { MemoryTab } from "./MemoryTab";
import type { Baby, Profile as ProfileData, RecoveryFeel } from "../types";

type Tab = "feeding" | "birth" | "memory";
type Kind = "normal" | "planned" | "emergency";

const kindOf = (p: ProfileData): Kind | null => (p.birthType === "normal" ? "normal" : (p.csectionKind ?? null));
const shortKind = (k: Kind | null) => BIRTH_KINDS.find((b) => b.key === k)?.label.replace(/ \(.*\)/, "") ?? "Chưa chọn";
const dmy = (key: string) => {
  const d = parseKey(key);
  return [d.getDate(), d.getMonth() + 1].map((x) => String(x).padStart(2, "0")).join("/") + `/${d.getFullYear()}`;
};

/** "Cài đặt & Hồ sơ": feeding settings, the birth profile (locked unless she asks to correct it), account. */
export function Profile({ initialTab = "birth" }: { initialTab?: Tab }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="page settings">
      <h1 className="serif">Cài đặt & Hồ sơ</h1>
      <p className="muted small">Cập nhật phương pháp ti & hồ sơ sinh sản của mẹ</p>

      <div className="tabsbar" role="tablist">
        <button role="tab" aria-selected={tab === "feeding"} className={tab === "feeding" ? "on" : ""} onClick={() => setTab("feeding")}>
          Cách ti & Sữa
        </button>
        <button role="tab" aria-selected={tab === "birth"} className={tab === "birth" ? "on" : ""} onClick={() => setTab("birth")}>
          <Icon name="lock" size={16} /> Hồ sơ sinh sản
        </button>
        <button role="tab" aria-selected={tab === "memory"} className={tab === "memory" ? "on" : ""} onClick={() => setTab("memory")}>
          <Icon name="heart" size={16} /> Bộ nhớ
        </button>
      </div>

      {tab === "feeding" ? <Feeding /> : tab === "memory" ? <MemoryTab /> : <BirthProfile />}

      <h3 className="section-label">Trải nghiệm & Dữ liệu</h3>
      <button className="btn soft-btn wide" onClick={() => dispatch({ type: "go", screen: "onboarding" })}>
        <Icon name="sparkle" size={18} /> Xem lại phần chào đón (Onboarding)
      </button>

      <h3 className="section-label">Tài khoản của mẹ</h3>
      <AccountCard />

      <section className="card">
        <h3>Người thân tin cậy</h3>
        <p className="muted small">
          Không bắt buộc — nhưng sẽ giúp mình hiểu và đồng hành cùng mẹ tốt hơn. Mẹ có thể thêm, sửa hoặc xoá bất cứ
          lúc nào.
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

      <section className="card soft about">
        <h3>
          <Icon name="info" size={18} /> Về Mẹ Ơi!
        </h3>
        <p className="small">
          Mẹ Ơi! là người bạn đồng hành AI bằng tiếng Việt dành riêng cho mẹ lần đầu sinh con. Ấm áp, không phán xét,
          không giáo điều, sẵn sàng lắng nghe mẹ trong những khoảnh khắc kiệt sức lúc 2h sáng.
        </p>
      </section>
    </div>
  );
}

/* ---------------- birth profile: locked, with an explicit "correct a mistake" mode ---------------- */

function BirthProfile() {
  const { state, dispatch } = useStore();
  const p = state.profile;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [count, setCount] = useState<"1" | "2" | "3">("1");

  if (!p) {
    return (
      <section className="card soft">
        <h3>Mình chưa có hồ sơ sinh sản của mẹ</h3>
        <p className="muted small">Mẹ trả lời vài câu hỏi (khoảng 1 phút) để mình đồng hành sát hơn nhé.</p>
        <div className="actions">
          <button className="btn primary" onClick={() => dispatch({ type: "go", screen: "intake" })}>
            Điền thông tin
          </button>
        </div>
      </section>
    );
  }

  const start = () => {
    setDraft({ ...p });
    setNames(state.babies.map((b) => b.label));
    setCount(String(Math.min(3, Math.max(1, state.babies.length))) as "1" | "2" | "3");
    setEditing(true);
  };

  const save = () => {
    if (!draft || birthDateError(draft.birth)) return;
    const n = Number(count);
    const babies: Baby[] = Array.from({ length: n }, (_, k) => ({
      ...(state.babies[k] ?? emptyBaby()),
      label: (names[k] ?? "").trim(),
    }));
    dispatch({ type: "setProfile", profile: draft });
    dispatch({ type: "setBabies", babies });
    setEditing(false);
  };

  const babyCount = state.babies.length;
  const countLabel = BABY_COUNTS.find((c) => c.key === String(babyCount));

  if (!editing || !draft) {
    return (
      <>
        <section className="card locked">
          <div className="locked-head">
            <strong>
              <Icon name="pulse" size={18} /> Hồ sơ sinh sản của mẹ & bé
            </strong>
            <span className="lock-pill">
              <Icon name="lock" size={14} /> Cố định
            </span>
          </div>
          <h4>Thông tin của con</h4>
          <div className="info-grid">
            <div className="info">
              <span className="muted small">Tên của bé</span>
              <strong>{state.babies.map((b) => b.label).filter(Boolean).join(", ") || "Chưa đặt tên"}</strong>
            </div>
            <div className="info">
              <span className="muted small">Số lượng bé</span>
              <strong>{countLabel ? `${countLabel.label} (${countLabel.sub})` : `${babyCount} bé`}</strong>
            </div>
            <div className="info">
              <span className="muted small">Ngày sinh</span>
              <strong>
                <Icon name="calendar" size={14} /> {dmy(p.birth)}
              </strong>
            </div>
            <div className="info">
              <span className="muted small">Tuổi hiện tại</span>
              <strong className="pink">{ageLabel(p.birth)}</strong>
            </div>
          </div>
          <h4>Quá trình sinh của mẹ</h4>
          <div className="rows">
            <div className="row-line">
              <span className="muted small">Kinh nghiệm sinh</span>
              <strong>{p.firstTime ? "Lần đầu sinh con (Bé đầu lòng)" : "Đã từng sinh con"}</strong>
            </div>
            <div className="row-line">
              <span className="muted small">Phương pháp sinh</span>
              <strong className="blue">{shortKind(kindOf(p))}</strong>
            </div>
            <div className="row-line">
              <span className="muted small">Hồi phục ghi nhận</span>
              <strong>{RECOVERY_FEELS.find((r) => r.key === p.recoveryFeel)?.label ?? "Chưa chọn"}</strong>
            </div>
          </div>
          <p className="muted small note">
            Hồ sơ sinh sản là thông tin gốc cố định sau khi vượt cạn. Mẹ Ơi! dựa vào đây để đồng hành đúng tuần tuổi và
            phù hợp với thể trạng hồi phục của mẹ.
          </p>
        </section>
        <button className="dashed-btn" onClick={start}>
          <Icon name="pencil" size={16} /> Chỉnh sửa hồ sơ sinh sản nếu có sai sót
        </button>
      </>
    );
  }

  const err = birthDateError(draft.birth);
  return (
    <section className="card">
      <h3>Chỉnh sửa hồ sơ sinh sản</h3>
      <h4>Thông tin của con</h4>
      <CardChoice
        legend="Số bé"
        options={BABY_COUNTS}
        value={count}
        columns={3}
        centered
        onChange={(v) => {
          const next = v ?? "1";
          setCount(next);
          setNames((prev) => Array.from({ length: Number(next) }, (_, k) => prev[k] ?? ""));
        }}
      />
      {Array.from({ length: Number(count) }, (_, k) => (
        <label key={k} className="field">
          <span className="small muted">{Number(count) > 1 ? `Tên của bé ${k + 1}` : "Tên của bé"}</span>
          <input
            maxLength={40}
            value={names[k] ?? ""}
            onChange={(e) => setNames((prev) => prev.map((x, j) => (j === k ? e.target.value : x)))}
          />
        </label>
      ))}
      <div className="field">
        <span className="small muted">Ngày sinh của bé</span>
        <WheelDatePicker label="Ngày sinh của bé" value={draft.birth} onChange={(birth) => setDraft({ ...draft, birth })} />
      </div>
      {err ? <p className="error">{err}</p> : <p className="muted small">Con khoảng {ageLabel(draft.birth)}.</p>}
      <h4>Quá trình sinh của mẹ</h4>
      <CardChoice
        legend="Lần sinh"
        options={PARITY}
        value={draft.firstTime ? "first" : "other"}
        onChange={(v) => v && setDraft({ ...draft, firstTime: v === "first" })}
      />
      <CardChoice
        legend="Cách sinh"
        options={BIRTH_KINDS}
        value={kindOf(draft)}
        onChange={(v) =>
          v && setDraft({ ...draft, birthType: v === "normal" ? "normal" : "csection", csectionKind: v === "normal" ? null : v })
        }
      />
      <CardChoice
        legend="Cảm nhận hồi phục"
        options={RECOVERY_FEELS}
        value={draft.recoveryFeel ?? null}
        onChange={(v: RecoveryFeel | null) => setDraft({ ...draft, recoveryFeel: v })}
      />
      <div className="actions">
        <button className="btn" onClick={() => setEditing(false)}>
          Huỷ
        </button>
        <button className="btn primary" disabled={!!err} onClick={save}>
          <Icon name="save" size={18} /> Lưu thay đổi hồ sơ
        </button>
      </div>
    </section>
  );
}

/* ---------------- feeding ---------------- */

function Feeding() {
  const { state, dispatch } = useStore();
  const babies = state.babies;
  const set = (next: Baby[]) => dispatch({ type: "setBabies", babies: next });
  const patch = (k: number, b: Partial<Baby>) => set(babies.map((x, j) => (j === k ? { ...x, ...b } : x)));

  return (
    <>
      {babies.map((b, k) => {
        const name = b.label.trim() || (babies.length > 1 ? `Bé ${k + 1}` : "Bé");
        return (
          <section key={k} className="card">
            <h3 className="card-title">
              <span className="num">{k + 1}</span> Cách ti của {name}
            </h3>
            <CardChoice
              legend={`Cách ti của ${name}`}
              options={FEED_METHOD}
              value={b.method}
              onChange={(m) => patch(k, { method: m, formula: m === "bottle" && !b.formula ? "only" : b.formula })}
            />
            <h3>Tình hình sử dụng sữa công thức:</h3>
            <CardChoice legend={`Sữa của ${name}`} options={FEED_FORMULA} value={b.formula} onChange={(f) => patch(k, { formula: f })} />
          </section>
        );
      })}
    </>
  );
}

/** Kept so the old route keeps working: opens the settings on the feeding tab. */
export function BabyProfile() {
  return <Profile initialTab="feeding" />;
}
