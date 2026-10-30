import { useState, type ReactNode } from "react";
import { useStore } from "../store";
import type { Screen } from "../types";
import { SupportList } from "./SupportList";

const TABS: { screen: Screen; label: string; icon: string }[] = [
  { screen: "history", label: "Lịch sử", icon: "📅" },
  { screen: "chat", label: "Trò chuyện", icon: "💬" },
  { screen: "home", label: "Trang chủ", icon: "🏠" },
  { screen: "babyprofile", label: "Hồ sơ con", icon: "👶" },
  { screen: "profile", label: "Hồ sơ", icon: "👤" },
];

/** Header with an always-available "Hỗ trợ" button, plus the bottom navigation. */
export function AppShell({ children }: { children: ReactNode }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          Mẹ Ơi<span>!</span>
        </div>
        <button className="support-btn" onClick={() => setOpen(true)}>
          Hỗ trợ
        </button>
      </header>

      <main className="content">{children}</main>

      <nav className="tabs" aria-label="Điều hướng">
        {TABS.map((t) => (
          <button
            key={t.screen}
            className={`tab${t.screen === "home" ? " tab-home" : ""}${state.screen === t.screen ? " active" : ""}`}
            aria-current={state.screen === t.screen ? "page" : undefined}
            onClick={() => dispatch({ type: "go", screen: t.screen })}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
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
