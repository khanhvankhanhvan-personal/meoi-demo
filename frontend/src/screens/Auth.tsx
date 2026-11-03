import { useState, type FormEvent } from "react";
import { ApiError } from "../lib/api";
import { useStore } from "../store";

type Mode = "login" | "register" | "reset";

const TITLES: Record<Mode, string> = {
  login: "Đăng nhập",
  register: "Tạo tài khoản",
  reset: "Đặt lại mã PIN",
};

const SUBMIT: Record<Mode, string> = {
  login: "Đăng nhập",
  register: "Tạo tài khoản",
  reset: "Đặt mã PIN mới",
};

const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

/** Anonymous account: a nickname and a 6-digit PIN. No email, no phone. */
export function Auth() {
  const { state, api, signIn, dispatch } = useStore();
  const [mode, setMode] = useState<Mode>("login");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    nickname.trim().length >= 3 && /^\d{6}$/.test(pin) && (mode !== "reset" || code.trim().length >= 8);

  const switchTo = (m: Mode) => {
    setMode(m);
    setError(null);
    setPin("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const name = nickname.trim();
      const session =
        mode === "register"
          ? await api.register(name, pin)
          : mode === "login"
            ? await api.login(name, pin)
            : await api.resetPin(name, code, pin);
      await signIn(session);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Mình chưa kết nối được. Mẹ thử lại sau một chút nhé.",
      );
    } finally {
      setBusy(false);
    }
  };

  const back = () => dispatch({ type: "go", screen: state.profile ? "profile" : "onboarding" });

  return (
    <div className="page onboarding">
      <button className="link skip" onClick={back}>
        Quay lại
      </button>
      <div className="brand big">
        Mẹ Ơi<span>!</span>
      </div>
      <h1 className="serif">{TITLES[mode]}</h1>
      <p className="lead">
        {mode === "register"
          ? "Không cần email hay số điện thoại. Mẹ chỉ cần một biệt danh và mã PIN 6 số."
          : mode === "login"
            ? "Nhập biệt danh và mã PIN 6 số của mẹ."
            : "Nhập biệt danh, mã khôi phục mẹ đã lưu lúc tạo tài khoản và mã PIN mới."}
      </p>

      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="small muted">Biệt danh</span>
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            maxLength={24}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        {mode === "reset" && (
          <label className="field">
            <span className="small muted">Mã khôi phục</span>
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              maxLength={24}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
        )}
        <label className="field">
          <span className="small muted">{mode === "reset" ? "Mã PIN mới (6 số)" : "Mã PIN (6 số)"}</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(digits(e.target.value))}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button className="btn primary" type="submit" disabled={!valid || busy}>
            {busy ? "Đang xử lý…" : SUBMIT[mode]}
          </button>
        </div>
      </form>

      <div className="auth-links">
        {mode === "login" && (
          <>
            <button className="link" onClick={() => switchTo("register")}>
              Mình chưa có tài khoản
            </button>
            <button className="link" onClick={() => switchTo("reset")}>
              Mình quên mã PIN
            </button>
          </>
        )}
        {mode !== "login" && (
          <button className="link" onClick={() => switchTo("login")}>
            Mình đã có tài khoản
          </button>
        )}
      </div>
      <p className="muted small">
        Mình chỉ lưu hồ sơ, check-in và những ghi chú mẹ ghim. Tin nhắn trò chuyện không được lưu.
      </p>
    </div>
  );
}
