import { Icon } from "../components/Icons";
import { Progress, Screen, StepBar } from "../components/OnboardingParts";
import { WELCOME } from "../content";
import { useStore } from "../store";

/** Step 1 of 5: a warm welcome. Steps 2-5 are in Intake. */
export function Onboarding() {
  const { dispatch } = useStore();
  const next = () => dispatch({ type: "go", screen: "intake" });
  // "Bỏ qua" leaves onboarding; the mother can fill her details later from the home screen.
  const skip = () => dispatch({ type: "go", screen: "home" });

  return (
    <Screen>
      <Progress step={1} onSkip={skip} />
      <div className="ob-body">
        <span className="ob-tile big" aria-hidden="true">
          <Icon name="heart" size={30} filled />
        </span>
        <h1 className="serif">
          Chào mẹ, mình là Mẹ Ơi<span className="bang">!</span>
        </h1>
        <p className="lead">{WELCOME.lead}</p>
        <section className="card welcome-card">
          <div className="welcome-title">
            <span className="avatar-sm" aria-hidden="true">
              <Icon name="sparkle" size={16} />
            </span>
            <strong>{WELCOME.cardTitle}</strong>
          </div>
          <p className="muted">{WELCOME.cardBody}</p>
          <ul className="bullets">
            {WELCOME.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
        <button className="link" onClick={() => dispatch({ type: "go", screen: "auth" })}>
          Mình đã có tài khoản
        </button>
      </div>
      <StepBar onNext={next} nextLabel="Làm quen cùng Mẹ Ơi!" />
    </Screen>
  );
}
