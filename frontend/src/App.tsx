import { AppShell } from "./components/AppShell";
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
  switch (state.screen) {
    case "onboarding":
      return <Onboarding />;
    case "intake":
      return <Intake />;
    default:
      break;
  }
  return (
    <AppShell>
      {state.screen === "home" && <Home />}
      {state.screen === "checkin" && <Checkin />}
      {state.screen === "chat" && <Chat />}
      {state.screen === "history" && <History />}
      {state.screen === "profile" && <Profile />}
      {state.screen === "babyprofile" && <BabyProfile />}
    </AppShell>
  );
}

export default function App({ api, initial }: { api?: Api; initial?: State }) {
  return (
    <StoreProvider api={api} initial={initial}>
      <Screens />
    </StoreProvider>
  );
}
