import { useEffect, useState } from "react";
import { OFFLINE_SUPPORT } from "../lib/api";
import { useStore } from "../store";
import type { SupportList as Support } from "../types";

/** Support numbers. Opening status comes from the server (Vietnam time); offline we still show every number. */
export function SupportList() {
  const { api, state } = useStore();
  const [support, setSupport] = useState<Support>(OFFLINE_SUPPORT);

  useEffect(() => {
    let alive = true;
    api
      .getSupport()
      .then((s) => alive && setSupport(s))
      .catch(() => alive && setSupport(OFFLINE_SUPPORT));
    return () => {
      alive = false;
    };
  }, [api]);

  return (
    <div className="support">
      <p className="muted">
        Mình không thay thế bác sĩ hay một người thật lắng nghe. Khi cần, mẹ gọi các số dưới đây.
      </p>
      {support.contacts.map((c) => (
        <a key={c.key} href={`tel:${c.phone}`} className={`support-row${c.urgent ? " urgent" : ""}`}>
          <div>
            <div className="support-name">{c.name}</div>
            <div className="muted small">{c.hours}</div>
          </div>
          {c.status && (
            <span className={`pill ${c.status}`}>{c.status === "open" ? "Đang mở" : "Ngoài giờ"}</span>
          )}
          <span className="support-phone">{c.phone}</span>
        </a>
      ))}
      {support.hope_open === false && (
        <p className="muted small">HOPE đang ngoài giờ. Nếu cần giúp ngay, mẹ gọi 115.</p>
      )}
      {state.trusted.phone && (
        <a href={`tel:${state.trusted.phone}`} className="support-row">
          <div>
            <div className="support-name">
              Người thân tin cậy{state.trusted.name ? ` · ${state.trusted.name}` : ""}
            </div>
            <div className="muted small">{state.trusted.notes || "Do mẹ thêm trong hồ sơ"}</div>
          </div>
          <span className="support-phone">{state.trusted.phone}</span>
        </a>
      )}
      <p className="muted small">
        Gặp dấu hiệu nguy hiểm, mẹ đi khám ngay hoặc gọi 115 nếu khẩn cấp. Mình không chẩn đoán.
      </p>
    </div>
  );
}
