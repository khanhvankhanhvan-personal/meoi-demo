import { useState } from "react";
import { Icon } from "../components/Icons";
import { canon, moodOf, sleepOf } from "../content";
import { ageLabel } from "../lib/dates";
import {
  PIN_CATEGORIES,
  categorize,
  filterCheckins,
  insight,
  pinCategory,
  type MoodFilter,
  type PinCategory,
  type RangeFilter,
} from "../lib/diary";
import { useStore } from "../store";
import type { CheckinRecord, Note } from "../types";

/** "Nhật ký & Đã lưu": the health diary and the tips the mother pinned in chat. */
export function History() {
  const { state, dispatch } = useStore();
  const tab = state.diaryTab;

  return (
    <div className="page diary">
      <div className="section-head">
        <div>
          <h1 className="serif">Nhật ký & Đã lưu</h1>
          <p className="muted small">Hành trình sức khỏe của mẹ và những điều cần nhớ</p>
        </div>
        <button className="btn soft-btn" onClick={() => dispatch({ type: "go", screen: "checkin" })}>
          <Icon name="plus" size={18} /> Ghi nhận
        </button>
      </div>

      <div className="tabsbar" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "log"}
          className={tab === "log" ? "on" : ""}
          onClick={() => dispatch({ type: "openDiary", tab: "log" })}
        >
          <Icon name="pulse" size={18} /> Lịch sử sức khỏe <span className="count">{state.checkins.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "pins"}
          className={tab === "pins" ? "on" : ""}
          onClick={() => dispatch({ type: "openDiary", tab: "pins" })}
        >
          <Icon name="bookmark" size={18} /> Thông tin đã ghim <span className="count">{state.notes.length}</span>
        </button>
      </div>

      {tab === "log" ? <HealthLog /> : <PinnedHub />}
    </div>
  );
}

/* ---------------- health history ---------------- */

const RANGES: { key: RangeFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "7", label: "7 ngày qua" },
  { key: "30", label: "30 ngày qua" },
];
const MOOD_FILTERS: { key: MoodFilter; label: string }[] = [
  { key: "tired", label: "Lúc mệt mỏi" },
  { key: "ok", label: "Lúc ổn định" },
];

function HealthLog() {
  const { state, dispatch } = useStore();
  const [range, setRange] = useState<RangeFilter>("all");
  const [mood, setMood] = useState<MoodFilter>("any");
  const sum = insight(state.checkins);
  const rows = filterCheckins(state.checkins, range, mood);
  const baby = state.babies[0]?.label || "Bé";

  if (state.checkins.length === 0) {
    return (
      <section className="card soft">
        Chưa có check-in nào. Mẹ bấm “Ghi nhận” để bắt đầu một ngày nhé — chỉ mất 1 phút.
      </section>
    );
  }

  return (
    <>
      {sum && (
        <section className="card insight" aria-label="Nhìn lại 7 ngày vừa qua">
          <div className="section-head tight">
            <h2 className="serif">
              <span className="dot-title" aria-hidden="true" /> Nhìn lại 7 ngày vừa qua
            </h2>
            {state.profile && (
              <span className="muted small">
                {baby} • {ageLabel(state.profile.birth)}
              </span>
            )}
          </div>
          <div className="mini-grid">
            <div className="mini">
              <span className="muted small">Cảm xúc chủ đạo</span>
              <strong>
                <span aria-hidden="true">{sum.emoji}</span> {sum.title}
              </strong>
              <span className="muted small">
                {sum.tiredDays} ngày mệt • {sum.okDays} ngày êm
              </span>
            </div>
            <div className="mini">
              <span className="muted small">Giấc ngủ gần nhất</span>
              <strong>{sum.sleep?.label ?? "Chưa ghi"}</strong>
              <span className="muted small">{sum.sleep?.hint}</span>
            </div>
          </div>
          {sum.bodies.length > 0 && (
            <p className="small signs">
              Dấu hiệu cơ thể thường gặp: <strong>{sum.bodies.join(", ")}</strong>
            </p>
          )}
          <div className="medical-cue">
            <Icon name="info" size={20} />
            <p>
              <strong>Lưu ý sức khỏe:</strong> Nếu mẹ gặp sốt cao trên 38.5°C, vết mổ sưng đỏ lan rộng hoặc sản
              dịch có mùi lạ, hãy thăm khám bác sĩ sản khoa ngay nhé.
            </p>
          </div>
        </section>
      )}

      <div className="filters">
        <div className="muted small filter-title">
          <Icon name="filter" size={16} /> Bộ lọc thời gian:
        </div>
        <div className="chips scroll-row">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`chip pill${range === r.key ? " on" : ""}`}
              aria-pressed={range === r.key}
              onClick={() => setRange(r.key)}
            >
              {r.label}
              {r.key === "all" ? ` (${state.checkins.length})` : ""}
            </button>
          ))}
          {MOOD_FILTERS.map((m) => (
            <button
              key={m.key}
              className={`chip pill${mood === m.key ? " on" : ""}`}
              aria-pressed={mood === m.key}
              onClick={() => setMood(mood === m.key ? "any" : m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="muted small">Hiển thị {rows.length} lượt ghi</div>
      </div>

      {rows.length === 0 && <section className="card soft">Không có lượt ghi nào khớp bộ lọc này.</section>}
      <ul className="day-list">
        {rows.map((c) => (
          <DayCard
            key={c.key}
            c={c}
            open={state.selDay === c.key}
            notes={state.notes.filter((n) => n.dkey === c.key)}
            onToggle={() => dispatch({ type: "selectDay", key: state.selDay === c.key ? null : c.key })}
            onTalk={() => dispatch({ type: "chatAbout", record: c })}
          />
        ))}
      </ul>
    </>
  );
}

function DayCard({
  c,
  open,
  notes,
  onToggle,
  onTalk,
}: {
  c: CheckinRecord;
  open: boolean;
  notes: Note[];
  onToggle: () => void;
  onTalk: () => void;
}) {
  const m = moodOf(c.moods[0] ?? "");
  const sleep = sleepOf(c.sleep);
  return (
    <li className="card day">
      <div className="day-head">
        <span className="day-emoji" aria-hidden="true">
          {m?.emoji}
        </span>
        <div className="day-title">
          <strong>{c.moods.map(canon).join(", ")}</strong>
          <span className="muted small">Ngày {c.key.slice(8)}/{c.key.slice(5, 7)}</span>
        </div>
        <button className="link" aria-expanded={open} onClick={onToggle} aria-label={`Chi tiết ngày ${c.date}`}>
          {open ? "Thu gọn" : "Chi tiết"}
        </button>
      </div>
      {c.stressors.length > 0 && <p className="day-worries">{c.stressors.join(", ")}</p>}
      <div className="pills small-pills">
        {sleep && (
          <span className="mini-pill">
            <span aria-hidden="true">{sleep.emoji}</span> {sleep.label}
          </span>
        )}
        {c.bodies.length > 0 && <span className="mini-pill">{c.bodies.join(", ")}</span>}
      </div>
      {open && (
        <div className="day-detail" aria-label="Chi tiết ngày">
          {c.note && (
            <blockquote>
              <span className="muted small">Ghi chú riêng của mẹ</span>
              <br />
              {c.note}
            </blockquote>
          )}
          {notes.map((n) => (
            <blockquote key={n.key}>{n.text}</blockquote>
          ))}
          <button className="btn soft-btn" onClick={onTalk}>
            <Icon name="chat" size={18} /> Tâm sự về ngày này
          </button>
        </div>
      )}
    </li>
  );
}

/* ---------------- pinned tips ---------------- */

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

function PinnedHub() {
  const { state, dispatch, send } = useStore();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<PinCategory | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);

  const all = [...state.notes].reverse().map((n) => ({ n, cat: categorize(n.text) }));
  const shown = all
    .filter((x) => cat === "all" || x.cat === cat)
    .filter((x) => !query.trim() || fold(`${x.n.text} ${x.n.topic}`).includes(fold(query.trim())));

  const copy = async (n: Note) => {
    try {
      await navigator.clipboard.writeText(n.text);
      setCopied(n.key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const askMore = (n: Note) => {
    dispatch({ type: "go", screen: "chat" });
    void send(`Mẹ muốn hỏi thêm về lời khuyên này: ${n.text.slice(0, 300)}`);
  };

  if (state.notes.length === 0) {
    return (
      <section className="card soft">
        Chưa có gì được ghim. Trong phần Tâm sự, mẹ bấm biểu tượng đánh dấu cạnh câu trả lời nào mẹ muốn giữ lại.
      </section>
    );
  }

  return (
    <>
      <label className="search">
        <Icon name="search" size={18} />
        <input
          type="search"
          aria-label="Tìm trong thông tin đã ghim"
          placeholder="Tìm kiếm lời khuyên, mẹo dỗ bé, dinh dưỡng..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="chips scroll-row" role="group" aria-label="Danh mục">
        <button className={`chip pill${cat === "all" ? " on" : ""}`} aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          Tất cả ({all.length})
        </button>
        {PIN_CATEGORIES.map((c) => (
          <button
            key={c.key}
            className={`chip pill${cat === c.key ? " on" : ""}`}
            aria-pressed={cat === c.key}
            onClick={() => setCat(c.key)}
          >
            <span aria-hidden="true">{c.emoji}</span> {c.label.split(" & ")[0]}
          </button>
        ))}
      </div>

      {shown.length === 0 && <section className="card soft">Không tìm thấy mục nào phù hợp.</section>}
      <ul className="pin-list">
        {shown.map(({ n, cat: key }) => {
          const meta = pinCategory(key);
          return (
            <li key={n.key} className="card pin-card">
              <div className="pin-top">
                <span className={`cat-pill cat-${key}`}>{meta.label}</span>
                <div className="pin-tools">
                  <button className="icon-btn" aria-label="Sao chép" onClick={() => void copy(n)}>
                    {copied === n.key ? <span className="small">Đã chép</span> : <Icon name="copy" size={18} />}
                  </button>
                  <button
                    className="icon-btn"
                    aria-label="Xoá khỏi mục đã ghim"
                    onClick={() => dispatch({ type: "deleteNote", key: n.key })}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
              <p className="pin-text">{n.text}</p>
              {n.topic && n.topic !== "Check-in hôm nay" && (
                <div className="asked">
                  <strong>Mẹ hỏi:</strong> {n.topic}
                </div>
              )}
              <div className="pin-foot">
                <span className="muted small">{n.date}</span>
                <button className="link" onClick={() => askMore(n)}>
                  <Icon name="chat" size={16} /> Hỏi thêm về lời khuyên này
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
