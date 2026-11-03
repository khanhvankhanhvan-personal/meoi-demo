import { AppShell } from "./components/AppShell";
import { StatusBar } from "./components/StatusBar";
import { Auth } from "./screens/Auth";
import { Recovery } from "./screens/Recovery";
import { Checkin } from "./screens/Checkin";
import { Chat } from "./screens/Chat";
import { History } from "./screens/History";
import { Home } from "./screens/Home";
import { Intake } from "./screens/Intake";
import { Onboarding } from "./screens/Onboarding";
import { BabyProfile, Profile } from "./screens/Profile";
import { StoreProvider, useStore, type State } from "./store";
import type { Api } from "./lib/api";

function Screens() {
  const { state } = useStore();
  if (state.booting) return <div className="page muted">Đang mở…</div>;
  switch (state.screen) {
    case "onboarding":
      return <Onboarding />;
    case "intake":
      return <Intake />;
    case "auth":
      return <Auth />;
    case "recovery":
      return <Recovery />;
    default:
      break;
  }
  return (
    <AppShell>
      {(state.screen === "home" || state.screen === "checkin") && <Home />}
      {state.screen === "checkin" && <Checkin />}
      {state.screen === "chat" && <Chat />}
      {state.screen === "history" && <History />}
      {state.screen === "profile" && <Profile />}
      {state.screen === "babyprofile" && <BabyProfile />}
    </AppShell>
  );
}

export default function App({
  api,
  initial,
  restoreSession,
}: {
  api?: Api;
  initial?: State;
  restoreSession?: boolean;
}) {
  return (
    <StoreProvider api={api} initial={initial} restoreSession={restoreSession}>
      {/* On wide screens the app is drawn inside a phone-shaped frame; on phones it is full-bleed. */}
      <div className="stage">
        <div className="device">
          <StatusBar />
          <div className="screen">
            <Screens />
          </div>
        </div>
      </div>
    </StoreProvider>
  );
}
