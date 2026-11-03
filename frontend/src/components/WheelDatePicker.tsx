import { useEffect, useRef } from "react";
import { daysInMonth, kf, parseKey } from "../lib/dates";

const ITEM = 40; // px, must match .wheel-item in styles.css
const SETTLE_MS = 90;

type Item = { value: number; label: string };

function Wheel({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: Item[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const index = Math.max(0, items.findIndex((i) => i.value === selected));

  // Keep the scroll position in step with the selection (initial value, clicks, clamping).
  useEffect(() => {
    const el = ref.current;
    if (el && Math.abs(el.scrollTop - index * ITEM) > 1) el.scrollTop = index * ITEM;
  }, [index, items.length]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const settle = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const k = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)));
      if (items[k].value !== selected) onSelect(items[k].value);
    }, SETTLE_MS);
  };

  const step = (delta: number) => {
    const k = Math.min(items.length - 1, Math.max(0, index + delta));
    onSelect(items[k].value);
  };

  return (
    <div
      ref={ref}
      className="wheel"
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={settle}
      onKeyDown={(e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        step(e.key === "ArrowDown" ? 1 : -1);
      }}
    >
      {items.map((item) => (
        <div
          key={item.value}
          role="option"
          aria-selected={item.value === selected}
          className={`wheel-item${item.value === selected ? " on" : ""}`}
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

/**
 * iOS-style date wheel (day / month / year). Value is a "YYYY-MM-DD" key.
 * Always holds a valid date between three years ago and today, so there is no way to type a bad one.
 */
export function WheelDatePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (key: string) => void;
  label: string;
}) {
  const now = new Date();
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const min = new Date(max.getFullYear() - 3, max.getMonth(), max.getDate());
  const cur = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseKey(value) : max;
  const y = cur.getFullYear();
  const m = cur.getMonth() + 1;
  const d = cur.getDate();

  const commit = (ny: number, nm: number, nd: number) => {
    let next = new Date(ny, nm - 1, Math.min(nd, daysInMonth(ny, nm)));
    if (next > max) next = max;
    if (next < min) next = min;
    onChange(kf(next));
  };

  const years: Item[] = [];
  for (let yy = min.getFullYear(); yy <= max.getFullYear(); yy++) years.push({ value: yy, label: String(yy) });
  const months: Item[] = Array.from({ length: 12 }, (_, k) => ({ value: k + 1, label: `Tháng ${k + 1}` }));
  const days: Item[] = Array.from({ length: daysInMonth(y, m) }, (_, k) => ({ value: k + 1, label: `Ngày ${k + 1}` }));

  return (
    <div className="wheel-picker" role="group" aria-label={label}>
      <div className="wheel-band" aria-hidden="true" />
      <Wheel label="Ngày" items={days} selected={d} onSelect={(v) => commit(y, m, v)} />
      <Wheel label="Tháng" items={months} selected={m} onSelect={(v) => commit(y, v, d)} />
      <Wheel label="Năm" items={years} selected={y} onSelect={(v) => commit(v, m, d)} />
    </div>
  );
}
