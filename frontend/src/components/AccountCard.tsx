import { useState } from "react";
import { ApiError } from "../lib/api";
import { useStore } from "../store";

/** Sign in / out and delete-account controls (profile screen). */
export function AccountCard() {
  const { state, dispatch, signOut, removeAccount } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!state.user) {
    return (
      <section className="card soft">
        <h3>Lưu lại những gì mẹ chia sẻ</h3>
        <p className="muted small">
          Tạo tài khoản ẩn danh (chỉ cần biệt danh và mã PIN) để giữ lại hồ sơ, check-in và ghi chú đã ghim khi
          mẹ quay lại. Không cần email hay số điện thoại.
        </p>
        <button className="btn primary" onClick={() => dispatch({ type: "go", screen: "auth" })}>
          Tạo tài khoản hoặc đăng nhập
        </button>
      </section>
    );
  }

  const cancel = () => {
    setConfirming(false);
    setPin("");
    setError(null);
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await removeAccount(pin);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Mình chưa xoá được. Mẹ thử lại sau nhé.");
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <h3>Tài khoản</h3>
      <p>
        Mẹ đang đăng nhập với biệt danh <strong>{state.user.nickname}</strong>.
      </p>
      <p className="muted small">
        Mình lưu hồ sơ, check-in và ghi chú mẹ ghim. Tin nhắn trò chuyện không được lưu.
      </p>
      {state.syncError && (
        <p className="error" role="status">
          Chưa lưu được lên tài khoản. Mẹ kiểm tra mạng nhé, mình sẽ thử lại khi mẹ thay đổi gì đó.
        </p>
      )}
      <div className="actions">
        <button className="btn" onClick={() => void signOut()}>
          Đăng xuất
        </button>
      </div>
      {!confirming ? (
        <button className="link danger-link" onClick={() => setConfirming(true)}>
          Xoá tài khoản và toàn bộ dữ liệu
        </button>
      ) : (
        <div className="danger-box">
          <p className="small">
            Mọi thứ đã lưu (hồ sơ, check-in, ghi chú) sẽ bị xoá và không khôi phục được. Mẹ nhập mã PIN để xác
            nhận.
          </p>
          <label className="field">
            <span className="sr-only">Mã PIN để xác nhận</span>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Mã PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button className="btn" onClick={cancel}>
              Thôi
            </button>
            <button className="btn danger" disabled={pin.length !== 6 || busy} onClick={() => void remove()}>
              Xoá tất cả
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
