import { useState } from "react";
import { ONBOARDING } from "../content";
import { useStore } from "../store";

export function Onboarding() {
  const { dispatch } = useStore();
  const [i, setI] = useState(0);
  const slide = ONBOARDING[i];
  const last = i === ONBOARDING.length - 1;
  const start = () => dispatch({ type: "go", screen: "intake" });

  return (
    <div className="page onboarding">
      <button className="link skip" onClick={start}>
        Bỏ qua
      </button>
      <div className="brand big">
        Mẹ Ơi<span>!</span>
      </div>
      <h1 className="serif">{slide.title}</h1>
      <p className="lead">{slide.body}</p>
      {"sources" in slide && slide.sources && (
        <ul className="sources">
          {slide.sources.map((s) => (
            <li key={s.n}>
              <strong>{s.n}</strong>
              <span className="muted small">{s.d}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="dots" aria-hidden="true">
        {ONBOARDING.map((_, k) => (
          <span key={k} className={k === i ? "dot on" : "dot"} />
        ))}
      </div>
      <button className="btn primary" onClick={last ? start : () => setI(i + 1)}>
        {last ? "Bắt đầu" : "Tiếp tục"}
      </button>
      <button className="link" onClick={() => dispatch({ type: "go", screen: "auth" })}>
        Mình đã có tài khoản
      </button>
    </div>
  );
}
