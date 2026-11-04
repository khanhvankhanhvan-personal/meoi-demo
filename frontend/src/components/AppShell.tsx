import { useEffect, useState, type ReactNode } from "react";
import { ageLabel } from "../lib/dates";
import { useStore } from "../store";
import type { Screen } from "../types";
import { Icon, type IconName } from "./Icons";
import { SupportList } from "./SupportList";

const TABS: { screen: Screen; label: string; icon: IconName }[] = [
  { screen: "home", label: "Trang chủ", icon: "home" },
  { screen: "chat", label: "Mẹ Ơi!", icon: "chat" },
  { screen: "history", label: "Nhật ký & Đã lưu", icon: "bookmark" },
];

/** Header with an always-available "Hỗ trợ" button, the profile shortcut, and the bottom navigation. */
export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "clearToast" }), 2200);
    return () => clearTimeout(t);
  }, [state.toast, dispatch]);

  const inProfile = state.screen === "profile" || state.screen === "babyprofile";

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand">
            Mẹ Ơi<span>!</span>
          </div>
          {state.profile && <span className="brand-age">/ {ageLabel(state.profile.birth)}</span>}
        </div>
        <div className="topbar-actions">
          <button
            className={`icon-btn${inProfile ? " on" : ""}`}
            aria-label="Hồ sơ của mẹ"
            onClick={() => dispatch({ type: "go", screen: "profile" })}
          >
            <Icon name="user" />
          </button>
          <button className="support-btn" onClick={() => setOpen(true)}>
            <Icon name="pulse" size={18} /> Hỗ trợ
          </button>
        </div>
      </header>

      <main className="content">{children}</main>

      {state.toast && (
        <div className="toast" role="status">
          <Icon name="bookmark" filled size={16} />
          {state.toast}
        </div>
      )}

      <nav className="tabs" aria-label="Điều hướng">
        {TABS.map((t) => {
          const active = state.screen === t.screen || (t.screen === "home" && state.screen === "checkin");
          return (
            <button
              key={t.screen}
              className={`tab${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={() => dispatch({ type: "go", screen: t.screen })}
            >
              <span className="tab-icon">
                <Icon name={t.icon} filled={active && t.icon === "bookmark"} />
                {t.screen === "history" && state.notes.length > 0 && (
                  <span className="badge" aria-label={`${state.notes.length} mục đã lưu`}>
                    {state.notes.length}
                  </span>
                )}
              </span>
              <span className="tab-label">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {open && (
        <div className="sheet-back" onClick={() => setOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-label="Hỗ trợ khi mẹ cần"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-head">
              <h2>Hỗ trợ khi mẹ cần</h2>
              <button aria-label="Đóng" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <SupportList />
          </div>
        </div>
      )}
    </div>
  );
}
