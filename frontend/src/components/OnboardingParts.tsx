import type { ReactNode } from "react";
import type { Card } from "../content";
import { Icon, type IconName } from "./Icons";

export const STEPS = 5;

/** Top of every onboarding step: progress segments, "Bước n/5" and the skip link. */
export function Progress({ step, onSkip }: { step: number; onSkip: () => void }) {
  return (
    <div className="ob-top">
      <div className="ob-segments" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, k) => (
          <span key={k} className={k + 1 < step ? "seg done" : k + 1 === step ? "seg now" : "seg"} />
        ))}
      </div>
      <span className="muted small">
        Bước {step}/{STEPS}
      </span>
      <button className="link skip-link" onClick={onSkip}>
        Bỏ qua
      </button>
    </div>
  );
}

/** Tinted tile with an icon, title and a one-line lead (every step starts with one). */
export function StepHead({ icon, title, lead }: { icon: IconName; title: string; lead?: string }) {
  return (
    <div className="ob-head">
      <span className="ob-tile" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <h1 className="serif">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </div>
  );
}

/** Fixed bottom bar: "Quay lại" on the left, the main action on the right. */
export function StepBar({
  onBack,
  onNext,
  nextLabel = "Tiếp tục",
  disabled = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="ob-bar">
      {onBack ? (
        <button className="link back-link" onClick={onBack}>
          ← Quay lại
        </button>
      ) : (
        <span />
      )}
      <button className="btn primary ob-next" disabled={disabled} onClick={onNext}>
        {nextLabel} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

/** Choice cards with a title and a second line. `columns` lays them out in a row (e.g. 1 bé / 2 bé / 3 bé). */
export function CardChoice<T extends string>({
  legend,
  options,
  value,
  onChange,
  columns = 1,
  centered = false,
}: {
  legend: string;
  options: Card<T>[];
  value: T | null;
  onChange: (v: T | null) => void;
  columns?: number;
  centered?: boolean;
}) {
  return (
    <div role="group" aria-label={legend} className="cards" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            className={`opt${on ? " on" : ""}${centered ? " center" : ""}`}
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.key)}
          >
            <span className="opt-title">
              {o.label}
              {on && !centered && <span aria-hidden="true">✓</span>}
            </span>
            {o.sub && <span className="opt-sub">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select pills (what help does the mother need most). */
export function MultiChoice<T extends string>({
  legend,
  options,
  values,
  onChange,
}: {
  legend: string;
  options: Card<T>[];
  values: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <div role="group" aria-label={legend} className="cards">
      {options.map((o) => {
        const on = values.includes(o.key);
        return (
          <button
            key={o.key}
            type="button"
            className={`opt row-opt${on ? " on" : ""}`}
            aria-pressed={on}
            onClick={() => onChange(on ? values.filter((v) => v !== o.key) : [...values, o.key])}
          >
            <span className="opt-title">
              {o.label}
              {on && <span aria-hidden="true">✓</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="ob-screen">{children}</div>;
}
