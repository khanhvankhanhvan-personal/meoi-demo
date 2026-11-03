import { useEffect, useState } from "react";

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** Phone status bar with the real time. Only drawn inside the desktop phone frame (CSS hides it on phones). */
export function StatusBar() {
  const [time, setTime] = useState(() => hhmm(new Date()));
  useEffect(() => {
    const t = setInterval(() => setTime(hhmm(new Date())), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="statusbar" aria-hidden="true">
      <span className="sb-time">{time}</span>
      <span className="sb-island" />
      <span className="sb-icons">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.6" y="5" width="3" height="6" rx="1" />
          <rect x="9.2" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.8" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M1.5 4a9.5 9.5 0 0 1 13 0M4 6.6a6 6 0 0 1 8 0" />
          <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.45" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
          <rect x="22.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.45" />
        </svg>
      </span>
    </div>
  );
}
