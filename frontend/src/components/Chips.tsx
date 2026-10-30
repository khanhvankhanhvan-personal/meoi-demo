import type { Option } from "../content";

/** Selectable chips. `multi` toggles items in an array; otherwise a single value that can be cleared. */
export function ChipGroup({
  options,
  selected,
  onToggle,
  legend,
}: {
  options: Option[];
  selected: string[];
  onToggle: (label: string) => void;
  legend: string;
}) {
  return (
    <div role="group" aria-label={legend} className="chips">
      {options.map((o) => {
        const on = selected.includes(o.label);
        return (
          <button
            key={o.label}
            type="button"
            className={`chip${on ? " on" : ""}`}
            style={{ background: on ? undefined : o.tint }}
            aria-pressed={on}
            onClick={() => onToggle(o.label)}
          >
            <span aria-hidden="true">{o.emoji}</span> {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Choice<T extends string>({
  options,
  value,
  onChange,
  legend,
}: {
  options: { key: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
  legend: string;
}) {
  return (
    <div role="group" aria-label={legend} className="choices">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`choice${value === o.key ? " on" : ""}`}
          aria-pressed={value === o.key}
          onClick={() => onChange(value === o.key ? null : o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
