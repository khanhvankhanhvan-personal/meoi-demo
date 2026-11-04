import { useEffect, useState } from "react";
import { Icon } from "../components/Icons";
import { MEMORY_CATEGORIES } from "../content";
import { ApiError } from "../lib/api";
import { useStore } from "../store";
import type { Memory, MemoryCategory, MemorySettings } from "../types";

const label = (c: MemoryCategory) => MEMORY_CATEGORIES.find((x) => x.key === c);
const GENERIC = "Mình chưa làm được lúc này. Mẹ thử lại sau nhé.";

/** "Bộ nhớ của mẹ": everything Mẹ Ơi! remembers about her, with switches, edit and delete. */
export function MemoryTab() {
  const { state, dispatch, api } = useStore();
  const [settings, setSettings] = useState<MemorySettings | null>(null);
  const [items, setItems] = useState<Memory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const signedIn = !!state.user;
  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    Promise.all([api.getMemorySettings(), api.listMemories()])
      .then(([s, list]) => {
        if (!alive) return;
        setSettings(s);
        setItems(list);
      })
      .catch(() => alive && setError(GENERIC));
    return () => {
      alive = false;
    };
  }, [api, signedIn]);

  if (!signedIn) {
    return (
      <section className="card soft">
        <h3>Để Mẹ Ơi! nhớ mẹ qua từng cuộc trò chuyện</h3>
        <p className="muted small">
          Bộ nhớ chỉ dành cho tài khoản. Mình chỉ nhớ điều mẹ đồng ý, mẹ xem, sửa hay xoá được bất cứ lúc nào.
        </p>
        <div className="actions">
          <button className="btn primary" onClick={() => dispatch({ type: "go", screen: "auth" })}>
            Tạo tài khoản hoặc đăng nhập
          </button>
        </div>
      </section>
    );
  }

  const fail = (e: unknown) => setError(e instanceof ApiError ? e.message : GENERIC);

  const saveSettings = async (next: MemorySettings) => {
    const before = settings;
    setSettings(next);
    setError(null);
    try {
      setSettings(await api.saveMemorySettings(next));
    } catch (e) {
      setSettings(before);
      fail(e);
    }
  };

  const toggleTopic = (c: MemoryCategory) => {
    if (!settings) return;
    const topics = settings.topics.includes(c) ? settings.topics.filter((t) => t !== c) : [...settings.topics, c];
    void saveSettings({ ...settings, topics });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setError(null);
    try {
      const updated = await api.editMemory(editing.id, editing.text.trim());
      setItems((prev) => (prev ?? []).map((m) => (m.id === updated.id ? updated : m)));
      setEditing(null);
    } catch (e) {
      fail(e);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await api.deleteMemory(id);
      setItems((prev) => (prev ?? []).filter((m) => m.id !== id));
    } catch (e) {
      fail(e);
    }
  };

  const removeAll = async () => {
    setError(null);
    try {
      await api.deleteAllMemories();
      setItems([]);
      setConfirmAll(false);
    } catch (e) {
      fail(e);
    }
  };

  return (
    <>
      <section className="card">
        <label className="switch-row">
          <span>
            <strong>Cho phép Mẹ Ơi! nhớ</strong>
            <span className="muted small block">
              Mẹ Ơi! sẽ hỏi “Mình nhớ điều này nhé?” và chỉ lưu khi mẹ đồng ý. Không bao giờ lưu nội dung khủng hoảng.
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Cho phép Mẹ Ơi! nhớ"
            checked={settings?.enabled ?? false}
            disabled={!settings}
            onChange={(e) => settings && void saveSettings({ ...settings, enabled: e.target.checked })}
          />
        </label>
        {settings?.enabled && (
          <div className="topics" role="group" aria-label="Chủ đề được nhớ">
            {MEMORY_CATEGORIES.map((c) => (
              <label key={c.key} className="switch-row small-row">
                <span>
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                  <span className="muted small block">{c.hint}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={c.label}
                  checked={settings.topics.includes(c.key)}
                  onChange={() => toggleTopic(c.key)}
                />
              </label>
            ))}
          </div>
        )}
      </section>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <h3 className="section-label">Mẹ Ơi! đang nhớ {items ? `(${items.length})` : ""}</h3>
      {items === null && !error && <p className="muted small">Đang mở…</p>}
      {items?.length === 0 && (
        <section className="card soft">
          Chưa có gì được nhớ. Khi mẹ trò chuyện, mình sẽ hỏi trước khi nhớ bất cứ điều gì.
        </section>
      )}
      <ul className="mem-list">
        {(items ?? []).map((m) => (
          <li key={m.id} className="card mem-card">
            <span className="cat-pill cat-vove">
              {label(m.category)?.emoji} {label(m.category)?.label}
            </span>
            {editing?.id === m.id ? (
              <>
                <textarea
                  aria-label="Sửa điều được nhớ"
                  className="note-input"
                  rows={2}
                  maxLength={200}
                  value={editing.text}
                  onChange={(e) => setEditing({ id: m.id, text: e.target.value })}
                />
                <div className="actions">
                  <button className="btn" onClick={() => setEditing(null)}>
                    Huỷ
                  </button>
                  <button className="btn primary" disabled={editing.text.trim().length < 3} onClick={() => void saveEdit()}>
                    <Icon name="save" size={18} /> Lưu
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mem-text">{m.text}</p>
                <div className="mem-tools">
                  <button className="link" onClick={() => setEditing({ id: m.id, text: m.text })}>
                    <Icon name="pencil" size={14} /> Sửa
                  </button>
                  <button className="link danger-link" aria-label={`Xoá: ${m.text}`} onClick={() => void remove(m.id)}>
                    <Icon name="trash" size={14} /> Xoá
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {(items?.length ?? 0) > 0 &&
        (confirmAll ? (
          <div className="danger-box">
            <p className="small">Xoá tất cả những gì Mẹ Ơi! đang nhớ về mẹ? Không khôi phục được.</p>
            <div className="actions">
              <button className="btn" onClick={() => setConfirmAll(false)}>
                Thôi
              </button>
              <button className="btn danger" onClick={() => void removeAll()}>
                Xoá tất cả
              </button>
            </div>
          </div>
        ) : (
          <button className="link danger-link" onClick={() => setConfirmAll(true)}>
            Xoá tất cả bộ nhớ
          </button>
        ))}
    </>
  );
}
