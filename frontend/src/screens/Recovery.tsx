import { useState } from "react";
import { useStore } from "../store";

/** Shown once after sign-up or a PIN reset. The server keeps only a hash, so it cannot show it again. */
export function Recovery() {
  const { state, dispatch } = useStore();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const code = state.recoveryCode ?? "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      /* some browsers block the clipboard; the code is on screen */
    }
  };

  return (
    <div className="page onboarding">
      <div className="brand big">
        Mẹ Ơi<span>!</span>
      </div>
      <h1 className="serif">Mã khôi phục của mẹ</h1>
      <p className="lead">
        Nếu mẹ quên mã PIN, mã này là cách duy nhất để vào lại tài khoản. Vì mình không lưu email hay số điện
        thoại, mình sẽ không thể gửi lại mã này.
      </p>
      <div className="recovery-code" aria-label="Mã khôi phục">
        {code}
      </div>
      <div className="actions">
        <button className="btn" onClick={copy}>
          {copied ? "Đã sao chép" : "Sao chép mã"}
        </button>
      </div>
      <p className="muted small">Mẹ hãy chụp màn hình hoặc chép ra giấy, rồi cất ở nơi an toàn.</p>
      <label className="check">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        <span>Mẹ đã lưu mã này</span>
      </label>
      <div className="actions">
        <button className="btn primary" disabled={!saved} onClick={() => dispatch({ type: "ackRecovery" })}>
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
