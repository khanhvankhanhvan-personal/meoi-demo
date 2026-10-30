# MeOi! — Build Spec cho Claude Code

> **Mục đích:** Tài liệu kỹ thuật đầy đủ để Claude Code (hoặc bất kỳ developer nào) xây dựng chính xác ứng dụng MeOi! từ prototype. Viết bằng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật tiếng Anh.
>
> **Nguồn gốc:** Trích xuất 100% từ prototype `meoi.html` (Version 28, artifact URL `claude.ai/code/artifact/72deb10e-…`). Mỗi kết luận kèm trích đoạn nguồn và vị trí dòng.  
> **Quy ước:** `[NGUỒN: dòng X]` = dòng X trong `decoded_template.txt`. `[SUY LUẬN]` = phần suy luận từ prototype, chưa có code nguồn tường minh.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Data Model — State Shape](#2-data-model--state-shape)
3. [Màn hình & Luồng chuyển đổi](#3-màn-hình--luồng-chuyển-đổi)
4. [Feature chi tiết](#4-feature-chi-tiết)
5. [Hệ thống Chat & AI](#5-hệ-thống-chat--ai)
6. [Hệ thống an toàn — Tier System](#6-hệ-thống-an-toàn--tier-system)
7. [Design System](#7-design-system)
8. [Tương quan giữa các Feature](#8-tương-quan-giữa-các-feature)
9. [Backend & API — Thiết kế cần xây](#9-backend--api--thiết-kế-cần-xây)
10. [Bằng chứng còn thiếu & Quyết định mở](#10-bằng-chứng-còn-thiếu--quyết-định-mở)

---

## 1. Tổng quan kiến trúc

### 1.1 Prototype hiện tại

Prototype là **single-page HTML** chạy hoàn toàn client-side:
- Runtime: `x-dc` bundler với `DCLogic` class component (`state`, `renderVals()`, `setState`)
- Không có backend, database, hay authentication thật
- Chat AI gọi `window.claude.complete` (chỉ hoạt động trong artifact runtime)
- Mọi dữ liệu lưu in-memory, mất khi refresh

```
[NGUỒN: dòng 779]  class Component extends DCLogic {
[NGUỒN: dòng 914]  state = this.mk("first");
```

### 1.2 Kiến trúc production cần xây

```
┌─────────────────────────────────────────────┐
│              Mobile App (React Native)       │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Screens  │ │ Check-in │ │ Chat Engine  │ │
│  │ + Nav    │ │ + Calendar│ │ + Safety     │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │              │         │
│  ┌────┴─────────────┴──────────────┴───────┐ │
│  │         Local State + Persistence       │ │
│  └────────────────┬────────────────────────┘ │
└───────────────────┼──────────────────────────┘
                    │ API
┌───────────────────┼──────────────────────────┐
│              Backend Server                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Auth     │ │ Profile  │ │ LLM Proxy    │ │
│  │ Service  │ │ + Data   │ │ + Safety     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │              Database                     │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

> `[SUY LUẬN]` Kiến trúc production hoàn toàn suy luận — prototype không có backend. Mọi thứ ở phần 9 là đề xuất thiết kế.

---

## 2. Data Model — State Shape

### 2.1 State đầy đủ (từ `mk("first")`)

```javascript
// [NGUỒN: dòng 1035-1048]
{
  // === UI & Navigation ===
  narrow: boolean,           // window.innerWidth < 820
  screen: string,            // "onboarding"|"signup"|"intake"|"home"|"checkin"|"thanks"|"chat"|"history"|"profile"|"babyprofile"
  ob: number,                // onboarding slide index (0-2)
  focus: string|null,        // active input field ID
  
  // === Account ===
  account: null | { name: string, email: string },
  
  // === Profile ===
  profile: null | {
    week: number,            // tuần tuổi (legacy, overridden bởi birth)
    birth: string,           // "YYYY-MM-DD" ngày sinh của bé
    birthType: string,       // "Sinh thường" | "Sinh mổ"
    parity: string,          // "Đúng rồi, đây là em bé đầu tiên của mình" | "Không phải, mình còn có bé khác"
  },
  
  // === Babies (đa thai) ===
  babies: Array<{
    label: string,           // tên gọi bé (optional)
    method: string|null,     // "Bú trực tiếp"|"Ti bình"|"Song song cả hai cách"|null
    formula: string|null,    // "mom"|"only"|"mix"|null
  }>,
  bbTab: number,             // tab bé đang xem (multi-baby)
  
  // === Check-in ===
  checkins: Array<CheckinRecord>,
  mood: string[]|null,       // multi-select mood đang chọn
  sleep: string|null,        // single-select giấc ngủ đang chọn
  body: string[]|null,       // multi-select cơ thể
  stressor: string[]|null,   // multi-select áp lực
  selDay: string|null,       // ngày đang chọn trên calendar (key format)
  
  // === Chat ===
  messages: Array<Message>,
  input: string,
  sending: boolean,
  drift: number,             // drift demo counter (0-5)
  crisis: string|null,       // "PHYSICAL"|"PSYCHIATRIC"|"SAFETY"|null
  
  // === Engagement & Nudge ===
  eng: number,               // engagement counter
  nudgeShown: boolean,
  showNudge: boolean,
  
  // === Notes (pin) ===
  notes: Array<NoteRecord>,
  histTab: "diary"|"notes",
  
  // === Intake ===
  intakeBirth: string|null,  // "YYYY-MM-DD" nhập trong intake
  intakeStep: number,        // 0|1|2
  branch: string|null,       // "one"|"multi"
  bstep: number,             // bước trong multi-baby intake
  ibt: string|null,          // birth type (intake)
  ifeed: string|null,        // [legacy, không dùng]
  ipar: string|null,         // parity (intake)
  
  // === Date Picker ===
  dp: string|null,           // "intake"|"profile"|null
  dpSD: number, dpSM: number, dpSY: number,
  dobInTxt: string|null,
  dobPrTxt: string|null,
  calY: number, calM: number,  // calendar view
  
  // === Signup ===
  suName: string,
  suEmail: string,
  signupFrom: string|null,   // screen to return to
  
  // === Trusted Contact ===
  ctName: string,
  ctPhone: string,
  ctNotes: string,
  
  // === HOPE Hours ===
  hopeIn: boolean,           // true = trong giờ 16:30-20:30
  
  // === Home Display ===
  tipOverride: string|null,    // override tip key (thay thế top_stressor cho hero tip)
  
  // === UI Overlays ===
  showFeedback: boolean,
  showPrompt: boolean,         // hiển thị prompt overlay sau intake finish
  fbText: string,
  showAcct: boolean,
  
  // === Onboarding Demo ===
  demoStep: number,
}
```

### 2.2 CheckinRecord

```javascript
// [NGUỒN: dòng 1644-1646]
{
  key: string,           // "YYYY-MM-DD" — unique per day, latest wins
  date: string,          // "D/M/YYYY" display format
  mood: string,          // first mood (legacy compat)
  moods: string[],       // multi-select moods
  sleep: string|null,
  body_status: string|null,    // first body (legacy)
  bodies: string[],            // multi-select bodies
  top_stressor: string|null,   // first stressor (legacy)
  stressors: string[],         // multi-select stressors
}
```

> **Ghi chú quan trọng:** `key` dùng format `kf()` → `"YYYY-MM-DD"`. Mỗi ngày chỉ giữ 1 record, record mới thay record cũ: `checkins.filter(c => c.key !== newKey).concat(newRecord)` [NGUỒN: dòng 1646].

### 2.3 Message

```javascript
// [NGUỒN: dòng 1213-1215]
{
  role: "user" | "assistant",
  content: string,              // full text
  segments: string[],           // paragraphs (assistant only)
  suggestions: string[],        // chip suggestions (assistant only)
  tier: string|null,            // "1"|"2"|"3-PHYSICAL"|"3-PSYCHIATRIC"|"3-SAFETY"
}
```

### 2.4 NoteRecord (pin)

```javascript
// [NGUỒN: dòng 1365-1370]
{
  key: string,          // message content (dùng làm unique key)
  text: string,         // segments joined
  topic: string,        // user message gần nhất trước đó, hoặc "Check-in hôm nay"
  date: string,         // "D/M/YYYY"
  dkey: string,         // "YYYY-MM-DD"
}
```

### 2.5 Date Format Functions

```javascript
// [NGUỒN: dòng 981-982]
kf(d) → "YYYY-MM-DD"    // key format, dùng cho storage/lookup
vf(d) → "D/M/YYYY"      // view format, dùng cho display
```

---

## 3. Màn hình & Luồng chuyển đổi

### 3.1 Danh sách màn hình

| Screen ID | Tên hiển thị | Điều kiện hiển thị |
|---|---|---|
| `onboarding` | Giới thiệu (3 slides) | Mặc định khi mở lần đầu |
| `signup` | Tạo tài khoản | Từ nudge hoặc menu |
| `intake` | Nhập thông tin (3 bước) | Sau onboarding hoặc sau signup mới |
| `home` | Trang chủ | `profile !== null` |
| `checkin` | Check-in | Từ home/nav |
| `thanks` | Cảm ơn | Tự chuyển sang home sau 1.3s |
| `chat` | Trò chuyện | Từ check-in submit hoặc nav |
| `history` | Lịch sử (diary/notes) | Từ nav |
| `profile` | Hồ sơ của mẹ | Từ nav |
| `babyprofile` | Hồ sơ con | Từ nav |

```
[NGUỒN: dòng 1329]
const inApp = ["home","checkin","thanks","chat","history","support","profile","babyprofile"].includes(scr);
```

### 3.2 Flow diagram

```
┌─────────────┐
│ onboarding  │──(3 slides, "Bỏ qua" hoặc cuối)──┐
└─────────────┘                                     │
                                                    ▼
                                              ┌──────────┐
                        ┌─────────────────────│  intake   │
                        │                     │ step 0→1→2│
                        │                     └─────┬─────┘
                        │                           │ finish
                        │                           ▼
  ┌────────┐     ┌──────┴──┐     ┌──────────┐   ┌──────┐
  │ signup │◄────│  nudge  │     │ checkin   │◄──│ home │
  └───┬────┘     └─────────┘     └────┬──────┘   └──┬───┘
      │                               │             │
      │ submitSignup                   │submit       │
      │ → signupFrom screen           ▼             │
      │                          ┌─────────┐        │
      └──────────────────────────│  thanks  │        │
                                 └────┬─────┘        │
                                      │ 1.3s         │
                                      ▼              │
                                 ┌─────────┐         │
                                 │  chat   │◄────────┘
                                 └─────────┘
                                      ▲
                                      │ quickSave / submitCheckin
                                      │ → chat with mkOpener
```

### 3.3 Onboarding (3 slides)

```javascript
// [NGUỒN: dòng 819-823]
OB = [
  { title: "Gỡ rối cùng mẹ", body: "Mình giúp mẹ tự chăm sóc..." },
  { title: "Luôn lắng nghe mẹ", body: "Mỗi ngày chỉ cần vài chạm..." },
  { title: "Kết nối đúng nơi cần", body: "Mình là nguồn kết nối...",
    sources: [HOPE, CSAGA, Ngôi nhà Bình yên, Đặt lịch hẹn] },
];
```

Mỗi slide có animated demo (d1, d2, d3) với `demoStep` tự tăng mỗi 700ms:

```javascript
// [NGUỒN: dòng 1072]
this.demoTk = setInterval(() => {
  if (this.state.screen === "onboarding") this.setState((st) => {
    const n = st.demoStep + 1;
    if (n < 12) return { demoStep: n };
    return st.ob < this.OB.length - 1 ? { ob: st.ob + 1, demoStep: 0 } : { demoStep: 0 };
  });
}, 700);
```

- Slide 0: Demo chip → bubble → typing → answer (chat flow)
- Slide 1: Demo check-in form (mood → sleep → submit → reflection)
- Slide 2: Demo Tier 3 (user types → crisis banner appears)

Chuyển tiếp: "Tiếp tục" (mũi tên) hoặc "Bỏ qua" → nhảy thẳng sang `intake`.  
Slide cuối: nút CTA "Bắt đầu" thay cho mũi tên.

### 3.4 Intake (3 bước)

**Bước 0 — Số bé:**
- Chọn "1 bé" (`branch: "one"`) hoặc "Đa thai" (`branch: "multi"`)
- Nếu đa thai: stepper +/- cho số bé (min 2, max 4)
- Nút "Tiếp tục" disabled khi chưa chọn branch

```javascript
// [NGUỒN: dòng 1593]
intake0Disabled: !s.branch
```

**Bước 1 — Ngày sinh:**
- Date picker wheel (ngày/tháng/năm) hoặc text input `DD/MM/YYYY`
- Validation: ngày phải hợp lệ, không quá 3 năm trước, không tương lai
- Sau khi chọn: hiển thị tuổi bé ("Như vậy, con đã được khoảng X tuần tuổi")
- Auto-advance sau 5 giây nếu đã chọn xong

```javascript
// [NGUỒN: dòng 1075-1081]
armAutoNext() {
  this._autoNextT = setTimeout(() => {
    if (st.screen === "intake" && st.intakeStep === 1 && st.intakeBirth && st.branch && !st.dp)
      this.setState({ intakeStep: 2, bstep: 0, autoNext: false });
  }, 5000);
}
```

**Bước 2 — Hồ sơ:**
- Phương thức sinh: "Sinh thường" / "Sinh mổ" (single-select, mutually exclusive)
- Phương thức nuôi con bằng sữa (per baby nếu đa thai):
  - Main: "Sữa mẹ hoàn toàn" / "Sữa công thức hoàn toàn" / "Kết hợp"
  - Sub (nếu có sữa mẹ): "Bú trực tiếp" / "Ti bình" / "Song song cả hai cách"
- Parity: "Đây là em bé đầu tiên" / "Không phải, mình còn có bé khác"
- Multi-baby mode: tab per baby với progress dots, step through từng bé
- Finish → `screen: "home", showPrompt: true`

```javascript
// [NGUỒN: dòng 1561]
const finishFn = () => set({
  profile: { week: 0, birth: s.intakeBirth, birthType: s.ibt, parity: s.ipar },
  screen: "home", showPrompt: true, intakeStep: 0, bstep: 0
});
```

### 3.5 Signup

```javascript
// [NGUỒN: dòng 1626]
submitSignup: () => set({
  account: { name: s.suName.trim(), email: s.suEmail.trim() },
  profile: s.profile || { week: 4 },
  showNudge: false,
  screen: ["home","checkin","chat","history","profile","babyprofile"]
    .includes(s.signupFrom) ? s.signupFrom : "home",
  signupFrom: null
})
```

- Fields: tên + email (cả hai bắt buộc)
- Trả về screen gốc (nơi user đến signup từ đó)
- Nếu chưa có profile: tạo default `{ week: 4 }`

### 3.6 Thanks

Hiển thị "💛 Cảm ơn mẹ đã dành chút thời gian cho mình." rồi tự chuyển sang `home` sau 1.3 giây:

```javascript
// [NGUỒN: dòng 1092-1094]
if (s.screen === "thanks" && ps.screen !== "thanks") {
  this.tt = setTimeout(() => { if (this.state.screen === "thanks") this.setState({ screen: "home" }); }, 1300);
}
```

---

## 4. Feature chi tiết

### 4.1 Check-in

#### 4.1.1 Constants

```javascript
// [NGUỒN: dòng 780-818]
MOODS = [
  { label: "Ổn", emoji: "🌤️", tint: "#E7EEF1" },
  { label: "Mệt", emoji: "😴", tint: "#EDEAE6" },
  { label: "Quá tải", emoji: "🌊", tint: "#E9D9E3" },
  { label: "Buồn", emoji: "🌧️", tint: "#DCE7ED" },
  { label: "Cáu gắt", emoji: "🔥", tint: "#F6D9D9" },
];

SLEEPS = [
  { label: "Ngủ đủ", emoji: "🌕", tint: "#FBEEF2" },
  { label: "Ngủ ít", emoji: "🌗", tint: "#F6D2E0" },
  { label: "Gần như không ngủ", emoji: "🌑", tint: "#EFA9C2" },
];

BODIES = [
  { label: "Cơ thể mình đang hồi phục ổn", emoji: "🌱", tint: "#E7EEF1" },
  { label: "Có chỗ đau hoặc khó chịu", emoji: "🩹", tint: "#FCE4EC" },
  { label: "Mình muốn được ai đó để ý đến mình", emoji: "💛", tint: "#F3E8DE" },
];

STRESSORS = [
  { label: "Con quấy khóc, mất ngủ", emoji: "👶", tint: "#E7EEF1" },
  { label: "Không còn là mình", emoji: "🪞", tint: "#F6D2E0" },
  { label: "Cô đơn, không ai hỏi han", emoji: "🤍", tint: "#E7EEF1" },
  { label: "Cho con bú", emoji: "🍼", tint: "#FCE4EC" },
  { label: "Quá tải, không muốn ai chạm vào", emoji: "✋", tint: "#E9D9E3" },
  { label: "Cơ thể chưa hồi phục", emoji: "🩹", tint: "#F4F7F9" },
  { label: "Căng thẳng với chồng/gia đình", emoji: "🌪️", tint: "#FBEEF2" },
  { label: "Áp lực tiền bạc, khó đi làm lại", emoji: "💸", tint: "#EDEAE6" },
];
```

#### 4.1.2 Selection logic

- **Mood:** multi-select (chọn 1+ mood, chạm lại để bỏ). **Bắt buộc** để submit.
- **Sleep:** single-select (chọn 1, chạm lại để bỏ). Optional.
- **Body:** multi-select. Optional.
- **Stressor:** multi-select. Optional.

```javascript
// [NGUỒN: dòng 1642]
ckDisabled: !(s.mood || []).length   // nút "Lưu check-in" disabled nếu chưa chọn mood
```

#### 4.1.3 Hai cách lưu check-in

**Quick save (từ home):**
```javascript
// [NGUỒN: dòng 1278]
const quickSave = () => this.setState((st) => {
  const qe = {
    key: this.kf(new Date()), date: this.vf(new Date()),
    mood: st.mood[0], moods: st.mood,
    sleep: null, body_status: null, bodies: [],
    top_stressor: null, stressors: []
  };
  return Object.assign({
    checkins: [...st.checkins.filter((c) => c.key !== qe.key), qe],
    screen: "chat",
    messages: [...st.messages, mkOpener(qe)],
    mood: null, sleep: null, body: null, stressor: null, selDay: null
  }, this.bump(st));
});
```

- Chỉ lưu mood (các field khác null/[])
- Chuyển thẳng sang chat với mkOpener

**Full submit (từ checkin screen):**
```javascript
// [NGUỒN: dòng 1644-1646]
submitCheckin: () => this.setState((st) => {
  const e = {
    key: this.kf(new Date()), date: this.vf(new Date()),
    mood: st.mood[0], moods: st.mood,
    sleep: st.sleep || null,
    body_status: (st.body || [])[0] || null, bodies: st.body || [],
    top_stressor: (st.stressor || [])[0] || null, stressors: st.stressor || []
  };
  return Object.assign({
    checkins: [...st.checkins.filter((c) => c.key !== e.key), e],
    screen: "chat",
    messages: [...st.messages, mkOpener(e)],
    mood: null, sleep: null, body: null, stressor: null, selDay: null
  }, this.bump(st));
})
```

- Lưu tất cả fields đã chọn
- Cả hai đều: filter cùng ngày (latest wins) → push record → chuyển sang chat với mkOpener → bump engagement

#### 4.1.4 Edit check-in

Từ home khi đã check-in hôm nay: nút "Cập nhật" → chuyển sang checkin screen với mood pre-filled.

### 4.2 Home Screen

#### 4.2.1 Hero Card (tuần tuổi & mốc)

```javascript
// [NGUỒN: dòng 1245-1260]
let daysOld = week * 7;
if (bdStr) { /* tính từ DOB */ daysOld = Math.max(0, Math.round((t0 - new Date(bp[0], bp[1]-1, bp[2])) / 864e5)); }
const wkIdx = Math.floor(daysOld / 7);

// Hero content theo tuần
const heroKey = wkIdx <= 2 ? null
  : wkIdx <= 6 ? "Cơ thể chưa hồi phục"
  : wkIdx <= 12 ? "Không còn là mình"
  : "Cô đơn, không ai hỏi han";

const hero = {
  title: "Tuần " + (wkIdx + 1),
  sub: daysOld + " ngày bên con",
  pct: Math.min(100, Math.round(daysOld / 56 * 100)) + "%",   // thanh hồi phục 56 ngày
  barLabel: daysOld >= 56
    ? "Đã qua mốc 8 tuần..."
    : "Hồi phục cơ bản thường mất 6–8 tuần · ngày " + daysOld + "/56",
};
```

**Quy tắc hero content theo tuần:**

| Tuần | heroKey | Nội dung mốc |
|---|---|---|
| 0–2 | `null` | Không hiển thị hero |
| 3–6 | `"Cơ thể chưa hồi phục"` | Mốc thể chất |
| 7–12 | `"Không còn là mình"` | Mốc cảm xúc |
| 13+ | `"Cô đơn, không ai hỏi han"` | Mốc xã hội |

> **Quan trọng — Thì hiện tại:** Hero dùng TIPS content. Content trên hero PHẢI ở thì hiện tại (present tense), tập trung vào "điều bình thường lúc này", KHÔNG dùng thì tương lai hay dự đoán. [SUY LUẬN từ scope doc, mục "Lưu ý chung"]

**Thanh hồi phục 56 ngày:** Progress bar tuyến tính `daysOld / 56 * 100%`, cap ở 100%.

#### 4.2.2 TIPS (mẹo ngày)

```javascript
// [NGUỒN: dòng 808-818]
TIPS = {
  "Con quấy khóc, mất ngủ": { text: "...", tag: "EMOTIONAL" },
  "Không còn là mình": { text: "...", tag: "EMOTIONAL" },
  "Cô đơn, không ai hỏi han": { text: "...", tag: "EMOTIONAL" },
  "Cho con bú": { text: "...", tag: "Y_TE", source: "WHO, UNICEF" },
  "Quá tải, không muốn ai chạm vào": { text: "...", tag: "EMOTIONAL" },
  "Cơ thể chưa hồi phục": { text: "...", tag: "Y_TE", source: "ACOG, Mayo Clinic" },
  "Căng thẳng với chồng/gia đình": { text: "...", tag: "EMOTIONAL" },
  "Áp lực tiền bạc, khó đi làm lại": { text: "...", tag: "EMOTIONAL" },
};
DEFAULT_TIP = { text: "Mất ngủ kéo dài thực sự thay đổi cách não xử lý cảm xúc...", tag: "EMOTIONAL" };
```

Logic chọn tip: `tipOverride || lastCheckin.top_stressor` → lookup TIPS → fallback DEFAULT_TIP.

Tag `Y_TE` nhận badge y tế (nền xanh `#0B6E99`); tag `EMOTIONAL` nhận branding "Mẹ Ơi!".

#### 4.2.3 Quick Mood Strip (home)

Dãy 5 nút emoji mood trên home. Chọn 1+ mood → hiện nút "Lưu check-in" (quickSave) + link "Check-in chi tiết hơn →".

#### 4.2.4 Chat Chips (home)

```javascript
// [NGUỒN: dòng 1285-1301]
const CHIP_Q = {
  "Con quấy khóc, mất ngủ": ["Con khóc suốt chiều tối", "cry"],
  "Cho con bú": ["Mình không chắc sữa có đủ", "milk"],
  "Quá tải, không muốn ai chạm vào": ["Bé đòi bế cả ngày, mỏi tay", "hold"],
  "Không còn là mình": ["Mình thấy không còn là mình nữa", null],
  "Cô đơn, không ai hỏi han": ["Mình thấy cô đơn, chẳng ai hỏi han", null],
  "Cơ thể chưa hồi phục": ["Bao lâu thì cơ thể mình hồi phục?", null],
  "Căng thẳng với chồng/gia đình": ["Mình căng thẳng với chồng và gia đình", null],
  "Áp lực tiền bạc, khó đi làm lại": ["Mình lo chuyện tiền bạc và đi làm lại", null],
  "Có chỗ đau hoặc khó chịu": ["Mình có chỗ đau, có bình thường không?", null],
  "Mình muốn được ai đó để ý đến mình": ["Mình muốn được ai đó để ý đến mình", null],
  "Gần như không ngủ": ["Mình gần như không ngủ được, phải làm sao?", null],
  "Ngủ ít": ["Mình ngủ rất ít, phải làm sao?", null],
  "Quá tải": ["Hôm nay mình thấy quá tải", null],
  "Buồn": ["Hôm nay mình thấy buồn", null],
  "Mệt": ["Hôm nay mình mệt quá", null],
};
```

Hiển thị chip dựa trên check-in gần nhất: matching keys (stressors, bodies, sleep, moods) → CHIP_Q lookup → lấy text. Nếu CHIP_Q entry có script ID (phần tử thứ 2), gửi với forced ID; nếu null, gửi như free text cho LLM.

Title: "Mình muốn hỏi gì hôm nay?" nếu có check-in; "Mẹ muốn bắt đầu từ đâu?" nếu không.

#### 4.2.5 Intro Cards (khi chưa có data)

```javascript
// [NGUỒN: dòng 1312-1316]
const introCards = [
  { emoji: "🌤️", title: "Check-in 1 phút", onClick: () => set({ screen: "checkin" }) },
  { emoji: "💬", title: "Nói chuyện với mình", onClick: () => set({ screen: "chat" }) },
  { emoji: "📅", title: "Những ngày của mẹ", onClick: () => set({ screen: "history" }) },
  { emoji: "👶", title: "Xem hồ sơ con", onClick: () => set({ screen: "babyprofile" }) },
];
```

Grid 2x2, chỉ hiển thị khi `checkins.length === 0`.

#### 4.2.6 Recent Check-ins (home)

Hiển thị vài ngày check-in gần nhất (emoji + date + stressor) khi có data.

#### 4.2.7 Reflect (insight nhỏ)

```javascript
// [NGUỒN: dòng 1027-1032]
reflect(cks) {
  if (!cks.length) return null;
  const rec = cks.slice(-4);
  const tired = rec.filter((c) =>
    (c.moods || [c.mood]).some((x) => x === "Mệt" || x === "Quá tải")
    || c.sleep === "Gần như không ngủ");
  if (tired.length >= 3)
    return "mình thấy mẹ đã mệt vài ngày liền — mẹ có muốn nói chuyện một chút không?";
  return rec.length + " lần check-in gần đây — cảm ơn mẹ đã dành chút thời gian cho chính mình.";
}
```

Xét 4 check-in gần nhất: nếu ≥ 3 lần có "Mệt", "Quá tải", hoặc "Gần như không ngủ" → nudge nhẹ. Ngược lại → acknowledge.

### 4.3 History (Nhật ký & Ghi chú)

**Hai tab:** "Nhật ký check-in" (diary) | "Ghi chú" (notes)

#### Diary tab:
- Calendar grid 7 cột (T2–CN)
- Mỗi ô: emoji mood nếu có check-in, chọn để xem chi tiết
- Detail card khi chọn ngày: emoji + mood + sleep + body + stressors + note

```javascript
// [NGUỒN: dòng 1648-1651]
weekdays: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
monthLabel: "Tháng " + (s.calM + 1) + ", " + s.calY,
prevMonth / nextMonth  // navigate calendar
```

#### Notes tab:
- Reverse-chronological list of pinned notes
- Mỗi note: date + topic + text + nút xóa
- Empty state: "Chưa có ghi chú nào. Bấm 📌 bên cạnh câu trả lời nào của mình mà mẹ muốn lưu."

### 4.4 Profile (Hồ sơ của mẹ)

Bao gồm:
- Phương thức sinh: chips "Sinh thường" / "Sinh mổ" (editable)
- Ngày sinh bé: text input + date picker wheel (editable)
- Parity: chips (editable)
- **Trusted Contact (Người thân tin cậy):**
  - Tên, số điện thoại, ghi chú
  - Hiển thị trong Support contacts nếu có

```javascript
// [NGUỒN: dòng 1595-1597]
ctName, ctPhone, ctNotes   // state fields
```

- **Support section:** Danh sách liên hệ hỗ trợ (xem 4.7)

### 4.5 Baby Profile (Hồ sơ con)

- Tên gọi bé (editable, per baby)
- Tuổi (tính từ DOB)
- Phương thức nuôi (feed method, per baby, editable)
- Multi-baby: tabs per baby, +/- baby (min 1, max 4)
- Ngày sinh bé (editable, ảnh hưởng hero card)

### 4.6 Engagement Nudge

```javascript
// [NGUỒN: dòng 1101-1105]
bump(st) {
  const e = st.eng + 1;
  const nudge = !st.account && !st.nudgeShown && e >= 2;
  return { eng: e, showNudge: nudge || st.showNudge, nudgeShown: st.nudgeShown || nudge };
}
```

- `eng` tăng mỗi khi check-in (quick hoặc full) hoặc send chat message
- Khi `eng >= 2` VÀ chưa có account VÀ chưa hiển thị nudge → bật popup "Tạo tài khoản"
- Chỉ hiện 1 lần (nudgeShown latch)
- Popup có 2 option: "Tạo tài khoản" (→ signup) hoặc dismiss

### 4.7 Support Contacts

```javascript
// [NGUỒN: dòng 1318-1328]
const supportContacts = [
  mkC("Cấp cứu 115", "24/7", ..., "115", { btnBg: "#B3261E", bc: "#F2C9C5" }),
  mkC("HOPE · hỗ trợ tâm lý", "Hằng ngày 16:30–20:30", ..., "0865044400",
    { hasStatus: true, status: hopeIn ? "Đang mở" : "Ngoài giờ", ... }),
  // Nếu có trusted contact:
  mkC("Người thân tin cậy" + (ctName ? " · " + ctName : ""), ...),
  mkC("Tổng đài Bảo vệ Trẻ em", "24/7", ..., "111"),
  mkC("CSAGA", "Giờ hành chính", ..., "02433335599"),
  mkC("Ngôi nhà Bình yên", "24/7 · điện thoại hoặc SMS", ..., "1900969680"),
];
```

**HOPE hours:** Trong giờ 16:30–20:30 → badge "Đang mở" (xanh); ngoài giờ → "Ngoài giờ" (xám). Ảnh hưởng Tier 3 psychiatric response (xem phần 6).

### 4.8 Feedback Overlay

- Overlay "Góp ý cho mình" với textarea
- Submit disabled khi trống
- `[SUY LUẬN]` Production cần endpoint gửi feedback

### 4.9 Account Menu

- Hiển thị initial + name + email
- "Hồ sơ của mẹ" → profile screen
- Guest: link "Tạo tài khoản"
- Logged in: (Đăng xuất logic có nhưng entry point bị ẩn)

```javascript
// [NGUỒN: dòng 1617]
logout: () => set({
  showAcct: false, account: null, profile: null, checkins: [],
  eng: 0, nudgeShown: false, screen: "intake", intakeStep: 0,
  intakeBirth: null, dobInTxt: null, ibt: null, ifeed: null, ipar: null,
  ctName: "", ctPhone: "", ctNotes: "",
  babies: [{ label: "", method: null, formula: null }], bbTab: 0, branch: null, bstep: 0
})
```

> **Bằng chứng mâu thuẫn:** Logout code tồn tại [NGUỒN: dòng 1617] nhưng không có UI button rõ ràng để trigger nó trong flow chính. Đây là quyết định thiết kế mở.

---

## 5. Hệ thống Chat & AI

### 5.1 Message Flow

```
User gửi text
      │
      ▼
  match(text)  ─── có match? ──► script(id) → scripted response
      │                                │
      │ null                           │
      ▼                                ▼
  chatMode === "live"?         { segments, suggestions, tier }
      │                                │
   yes │   no                          │
      ▼    ▼                           │
  claude.   script("generic")          │
  complete                             │
      │                                │
      ▼                                │
  parseReply(raw)                      │
      │                                │
      ▼────────────────────────────────┘
  setState({ messages, crisis?, ... })
  bump(st)
```

### 5.2 Keyword Matching — `match(raw)`

```javascript
// [NGUỒN: dòng 1111-1122]
match(raw) {
  const t = raw.toLowerCase();
  if (/ra máu|thấm (hết|đẫm)/.test(t)) return "phys";       // T3-PHYSICAL
  if (/làm hại|biến mất|không muốn sống|tự tử/.test(t)) return "psy";  // T3-PSYCHIATRIC
  if (/đe dọa|bạo lực|đánh em|kiểm soát em/.test(t)) return "safe";   // T3-SAFETY
  if (/ít đi tiểu|ít tã|không tăng cân|vàng da|sốt|bú kém|bỏ bú/.test(t)) return "baby3"; // T3-PHYSICAL (baby)
  if (/tăng cân đều|đủ tã/.test(t)) return "milkok";         // T2
  if (/sữa/.test(t) && /đủ/.test(t)) return "milk";          // T2
  if (/2 tuổi|biếng ăn/.test(t)) return "oos";               // Out of scope
  if (/bế/.test(t) && /(mỏi|cả ngày|đòi)/.test(t)) return "hold";    // T1
  if (/khóc/.test(t) && /(chiều|tối|suốt|kiệt)/.test(t)) return "cry"; // T1
  return null;  // → gửi cho LLM
}
```

**Thứ tự ưu tiên rất quan trọng:** T3 luôn match trước T2, T2 trước T1. Safety trước tiện lợi.

### 5.3 Scripted Responses — `script(id)`

Mỗi script trả về `{ segments: string[], suggestions: string[], tier: string }`:

| ID | Tier | Mô tả | Suggestions |
|---|---|---|---|
| `cry` | 1 | Bé khóc chiều tối | ["Con hơi sốt", "Con bú kém"] |
| `milk` | 2 | Sữa không đủ | ["Bé ít đi tiểu hơn", "Bé vẫn tăng cân đều"] |
| `milkok` | 2 | Sữa đủ (reassurance) | [] |
| `phys` | 3-PHYSICAL | Ra máu nhiều → CẤP CỨU | [] (crisis banner) |
| `baby3` | 3-PHYSICAL | Dấu hiệu bé cần bác sĩ | [] (crisis banner) |
| `psy` | 3-PSYCHIATRIC | Ý nghĩ tự hại → HOPE/115 | [] (crisis banner) |
| `safe` | 3-SAFETY | Bạo lực gia đình → CSAGA | [] (crisis banner) |
| `oos` | 2 | Ngoài phạm vi (bé 2 tuổi) | ["Mình muốn hỏi thêm"] |
| `hold` | 1 | Bé đòi bế | ["Mình cũng mệt lắm", "Có phải con đang bệnh không?"] |
| `generic` | 1 | Fallback | ["Mình muốn kể thêm", "Mình cần một mẹo nhỏ"] |
| `drift0-4` | 1→1→1→1→3-PSYCH | 5-turn escalation | varies |

**Drift sequence chi tiết:**

Drift là test-case cho "progressive disclosure" — mẹ than phiền nhẹ dần, lượt cuối lộ dấu hiệu T3:

```javascript
// [NGUỒN: dòng 832-838]
DRIFT_USER = [
  "Hôm nay em mệt quá.",                                           // drift0 → T1
  "Con thức dậy 5 lần đêm qua...",                                // drift1 → T1
  "Chồng em đi làm cả ngày...",                                   // drift2 → T1
  "Mẹ chồng thì suốt ngày chê em chăm con sai.",                 // drift3 → T1
  "Có lúc em nghĩ nếu em biến mất thì mọi thứ sẽ dễ hơn...",    // drift4 → T3-PSYCHIATRIC
];
```

### 5.4 LLM Integration — `send()`

```javascript
// [NGUỒN: dòng 1206-1210]
if ((this.props.chatMode || "live") === "live") {
  const out = await window.claude.complete({
    system: this.SYSTEM + this.profileBlock(),
    max_tokens: 1000,
    messages: hist.map((m) => ({ role: m.role, content: m.content }))
  });
  reply = this.parseReply(out || "");
}
```

- System prompt: `SYSTEM` (embedded, ~73 lines) + `profileBlock()` (dynamic profile context)
- Messages: full history
- Max tokens: 1000

### 5.5 `profileBlock()` — Dynamic Context

```javascript
// [NGUỒN: dòng 985-992]
profileBlock() {
  const s = this.state, p = s.profile;
  if (!p || !p.birthType) return "";
  let wk = null;
  if (p.birth) { wk = Math.floor(daysOld / 7); }
  let out = "\n\n## Hồ sơ: Lần sinh gần nhất" + (wk !== null ? " " + wk + " tuần trước" : "")
    + " (" + p.birthType.toLowerCase() + ").";
  s.babies.forEach((bb, i) => {
    out += "\nBé " + (i+1) + (bb.label ? " (" + bb.label + ")" : "")
      + ": tình trạng bú " + this.feedText(bb) + ".";
  });
  if (p.parity) out += "\nSố lần sinh: " + (firstTime ? "lần đầu làm mẹ" : "đã từng sinh con trước đó") + ".";
  return out;
}
```

Cung cấp cho LLM: tuần tuổi, phương thức sinh, thông tin bú per baby, parity.

### 5.6 `parseReply(raw)` — Response Parsing

```javascript
// [NGUỒN: dòng 1187-1195]
parseReply(raw) {
  // 1. Extract [TIER:X] tag from end
  const tm = text.match(/\n?\[TIER:(1|2|3-PHYSICAL|3-PSYCHIATRIC|3-SAFETY)\]\s*$/i);
  // 2. Extract [GỢI_Ý: a|b|c] tag from end
  const sm = text.match(/\n?\[GỢI_Ý:\s*([^\]]+)\]\s*$/i);
  // 3. Split remaining text by double newline → segments
  const segs = text.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  return { segments, suggestions, tier };
}
```

System prompt hướng dẫn LLM output `[TIER:X]` và `[GỢI_Ý: a|b|c]` ở cuối response.

### 5.7 Suggestion Strip (trong chat)

```javascript
// [NGUỒN: dòng 1348-1354]
if (lastMsg && lastMsg.role === "assistant" && !s.sending
    && !(lastMsg.tier && String(lastMsg.tier).indexOf("3") === 0)) {
  stripTexts = (lastMsg.suggestions || []).slice(0, 4);
  if (!stripTexts.length)
    stripTexts = lastMsg.tier === "2"
      ? ["Mình nên hỏi bác sĩ điều gì?", "Mình muốn kể thêm"]
      : ["Mình muốn kể thêm", "Mình cần một mẹo nhỏ"];
}
```

**Quy tắc quan trọng:**
- **KHÔNG BAO GIỜ** hiển thị suggestion strip sau Tier 3 response (kiểm tra `tier.indexOf("3") === 0`)
- Tier 2: default suggestions liên quan bác sĩ
- Tier 1: default suggestions "kể thêm" / "mẹo nhỏ"

### 5.8 Pin/Notes (📌)

```javascript
// [NGUỒN: dòng 1365-1370]
onSave: () => this.setState((st) => {
  const ns = st.notes || [];
  // Toggle: nếu đã pin → unpin; nếu chưa → pin
  if (ns.some((n) => n.key === m.content)) return { notes: ns.filter(n => n.key !== m.content) };
  // Tìm user message gần nhất trước đó làm topic
  let topic = null;
  for (let k = i - 1; k >= 0; k--) {
    if (st.messages[k].role === "user") { topic = st.messages[k].content; break; }
  }
  return { notes: ns.concat({
    key: m.content, text: m.segments.join("\n\n"),
    topic: topic || "Check-in hôm nay",
    date: this.vf(new Date()), dkey: this.kf(new Date())
  }) };
})
```

**Quy tắc:**
- Pin icon chỉ hiển thị trên assistant messages
- **KHÔNG hiển thị** trên Tier 3 messages (kiểm tra `canSave: !(m.tier && String(m.tier).indexOf("3") === 0)`)
- Toggle behavior: chạm lần 2 = unpin
- Topic = user message gần nhất phía trên trong thread

### 5.9 mkOpener — Check-in → Chat Bridge

```javascript
// [NGUỒN: dòng 1263-1276]
const mkOpener = (c) => {
  // Ghép moods thành text: "mệt và quá tải"
  const moodTxt = ms.length > 1 ? ms.slice(0,-1).join(", ") + " và " + ms[ms.length-1] : ms[0];
  // Ghép stressors (max 2): "nặng lòng vì con quấy khóc và cho con bú"
  const segs = ["Mình đây, mẹ ạ. Hôm nay mẹ " + mt
    + (st2.length ? " và đang nặng lòng vì " + st2.join(" và ") : "")
    + " — mẹ muốn kể mình nghe thêm không?"];
  // Suggestions từ CHIP_Q matching
  const keys = [].concat(c.stressors, c.bodies, [c.sleep], c.moods);
  keys.forEach(k => { const q = CHIP_Q[k]; if (q && sugs.indexOf(q[0]) < 0) sugs.push(q[0]); });
  // Fallback suggestions
  return { role: "assistant", content: segs.join("\n\n"),
    segments: segs,
    suggestions: (sugs.length ? sugs : ["Mình muốn kể một chút", "Mình muốn hỏi về bé"]).slice(0,3),
    tier: "1" };
};
```

Tạo câu mở đầu chat dựa trên check-in data: tóm tắt mood + stressor, gợi ý chips liên quan.

### 5.10 Telex Input Method

```javascript
// [NGUỒN: dòng 916-978]
telex(text, ch) { ... }
```

Bàn phím Telex built-in cho phép nhập tiếng Việt có dấu:
- Tone marks: `s`→sắc, `f`→huyền, `r`→hỏi, `x`→ngã, `j`→nặng, `z`→xóa dấu
- Modifiers: `aa`→â, `ee`→ê, `oo`→ô, `aw`→ă, `ow`→ơ, `uw`→ư, `dd`→đ, `uw` cũng xử lý `ươ`
- NFC normalization output
- Chỉ áp dụng cho input tiếng Việt (không áp dụng cho email field)

```javascript
// [NGUỒN: dòng 1484]
// Email field: KHÔNG dùng telex
return { [k]: ch === "back" ? cur.slice(0,-1)
  : (st.focus !== "suEmail" && /^[a-z]$/i.test(ch) ? this.telex(cur, ch) : cur + ch) };
```

> `[SUY LUẬN]` Trên mobile app thật, telex sẽ do OS keyboard (Gboard/Laban Key) xử lý. Telex code này chỉ cần cho web prototype. Production app chỉ cần đảm bảo NFC normalization cho text storage.

---

## 6. Hệ thống an toàn — Tier System

> ⚠️ **ĐÂY LÀ SAFETY PROTOCOL, KHÔNG PHẢI FEATURE.** Toàn bộ sản phẩm phụ thuộc vào hệ thống này. Mọi quyết định thiết kế PHẢI bảo toàn các quy tắc sau.

### 6.1 Tier Definitions

| Tier | Mô tả | Xử lý |
|---|---|---|
| **T1** | Emotional support, daily life | Trả lời bình thường, suggestion strip, pin OK |
| **T2** | Medical scope / needs doctor | Frame lại phạm vi, gợi ý hỏi bác sĩ, suggestion strip, pin OK |
| **T3-PHYSICAL** | Emergency physical (ra máu, bé sốt) | **Crisis banner + hotline 115. KHÔNG suggestion strip. KHÔNG pin.** |
| **T3-PSYCHIATRIC** | Self-harm / harm to baby | **Crisis banner + HOPE (trong giờ) hoặc 115 (ngoài giờ). KHÔNG strip. KHÔNG pin.** |
| **T3-SAFETY** | Domestic violence / abuse | **Crisis banner + CSAGA + Ngôi nhà Bình yên. KHÔNG strip. KHÔNG pin.** |

### 6.2 Crisis Banner

```javascript
// [NGUỒN: dòng 1401-1409]
const CR = {
  PHYSICAL: {
    label: "Cần bác sĩ kiểm tra ngay",
    body: "Đây là điều nên được bác sĩ kiểm tra ngay, mẹ nhé.",
    contacts: [["Cấp cứu 115", "115"]]
  },
  PSYCHIATRIC: hopeIn
    ? { label: "Mẹ không cần tự xử lý một mình",
        body: "Điều này cần một người thật lắng nghe mẹ ngay bây giờ.",
        contacts: [["HOPE (16:30–20:30)", "0865044400"], ["Cấp cứu 115", "115"]] }
    : { label: "Mẹ không cần tự xử lý một mình",
        body: "HOPE hiện đã ngoài giờ. Mẹ gọi 115 ngay...",
        contacts: [["Gọi 115 ngay", "115"]] },
  SAFETY: {
    label: "Đây không còn là căng thẳng bình thường",
    body: "Mẹ xứng đáng được an toàn. Có người sẵn sàng hỗ trợ mẹ kín đáo.",
    contacts: [["CSAGA", "0243333599"], ["Ngôi nhà Bình yên", "1900969680"]]
  },
};
```

- Banner dính (sticky) ở đầu chat, **KHÔNG tự ẩn**
- User có thể dismiss thủ công (nút X)
- `crisis` state latch: một khi set, chỉ user dismiss hoặc clear chat mới xóa

### 6.3 HOPE Hours Logic

```javascript
// [NGUỒN: dòng 1126-1129]
const psyTail = h  // h = this.state.hopeIn
  ? "Mẹ gọi HOPE ngay bây giờ nhé (0865 044 400, mở 16:30–20:30). Nếu mẹ thấy không an toàn, gọi 115."
  : "HOPE đã hết giờ hôm nay (16:30–20:30), nên mẹ gọi 115 hoặc đến bệnh viện gần nhất ngay...";
```

**Production cần:** Tự động xác định HOPE hours (16:30–20:30 giờ Việt Nam, UTC+7) thay vì toggle thủ công.

### 6.4 Safety Rules — Build Constraints

1. **T3 entries KHÔNG BAO GIỜ xuất hiện trên intro cards, suggestion strip, hay pin/notes**
2. **Suggestion strip bị ẩn hoàn toàn sau T3 response** [NGUỒN: dòng 1348]
3. **Pin button bị ẩn trên T3 messages** (kiểm tra `canSave`)
4. **KHÔNG hứa hẹn 24/7 support** ngoài giờ HOPE [NGUỒN: scope doc]
5. **KHÔNG chẩn đoán** — chỉ "mẹ nên hỏi bác sĩ" cho T2
6. **match() ưu tiên T3 trước T2, T2 trước T1** — safety-first ordering
7. **Crisis banner KHÔNG tự ẩn** — user phải chủ động dismiss

---

## 7. Design System

### 7.1 Colors

| Token | Hex | Sử dụng |
|---|---|---|
| Brand Pink | `#C81E5C` | CTA, nav active, accent, hero title |
| Brand Pink Hover | `#AD1A50` | Button hover |
| Text Primary | `#2D2A2E` | Body text |
| Text Secondary | `rgba(45,42,46,.55-.75)` | Labels, subtitles |
| Surface Background | `#FFFFFF` | Main background |
| Surface Card | `#F4F7F9` | Card background, input fields |
| Surface Pink Light | `#FCE4EC` | Active/selected states, chip highlights |
| Surface Warm | `#FBEEF2` | Alternate warm surface |
| Medical Badge | `#0B6E99` | Y_TE badge background |
| Error/Emergency | `#B3261E` | 115 button, validation errors |
| Error Surface | `#F2C9C5` | 115 card background |

### 7.2 Typography

| Element | Font | Style |
|---|---|---|
| Headings | `Fraunces` | italic, 500-600 weight |
| Body text | `Be Vietnam Pro` | normal, 400/500/600 weights |
| Size range | 11px – 32px | Theo hierarchy |

```css
/* [NGUỒN: dòng 10-111] — Font faces */
font-family: 'Be Vietnam Pro', sans-serif;  /* Body */
font-family: 'Fraunces', serif;             /* Headings */
```

### 7.3 Spacing & Radius

| Element | Value |
|---|---|
| Page padding | `12px 22px 22px` |
| Card radius | `14px – 20px` |
| Button radius (pill) | `999px` |
| Chip radius | `14px` |
| Input radius | `12px – 999px` |
| Shadow (card) | `0 1px 3px rgba(45,42,46,.06)` |
| Shadow (nav) | `drop-shadow(0 2px 10px rgba(45,42,46,.12))` |

### 7.4 Bottom Navigation Bar

```
┌─────────┬───────────┐    ┌───────────┬─────────┐
│ Lịch sử │ Trò chuyện│    │ Hồ sơ con │ Hồ sơ   │
│  📅     │   💬      │    │   👶      │   👤    │
└─────────┴─────┬─────┘    └─────┬─────┴─────────┘
                │    ╭─────╮    │
                │    │  🏠  │    │
                │    │ Home │    │
                │    ╰─────╯    │
                └───────────────┘
```

- **Floating notched bar** với SVG cutout cho nút Home tròn
- Home button: `58x58px`, `#C81E5C`, `box-shadow: 0 4px 12px rgba(200,30,92,.4)`, raised `top: -24px`
- Active tab: color `#C81E5C`; inactive: `rgba(45,42,46,.55)`
- Active home: white ring border `3px solid rgba(255,255,255,.9)`
- Bar visible khi: `inApp && profile !== null && !kbOn`

```javascript
// [NGUỒN: dòng 1658]
tabbed: ["home","chat","history","support","profile","babyprofile"].includes(scr) && !!s.profile && !kbOn
```

### 7.5 Animations

| Name | Duration | Easing |
|---|---|---|
| `meoiFade` | 350ms | ease | Screen transitions |
| `meoiRise` | 280ms | ease | Keyboard rise |
| `meoiFill` | 5000ms | linear | Auto-advance progress bar |
| Hover transforms | 150ms | ease | Button lift/scale |

### 7.6 Phone Frame (desktop only)

```javascript
// [NGUỒN: dòng 1605-1609]
phoneW: framed ? "410px" : "100%",
phoneH: framed ? "min(840px, calc(100vh - 48px))" : "100vh",
phoneBorder: framed ? "9px solid #1B1A1D" : "0px solid transparent",
phoneRadius: framed ? "54px" : "0px",
phoneShadow: framed ? "0 0 0 2px #3A383C, 0 24px 60px rgba(45,42,46,.28)" : "none",
```

Desktop (width ≥ 820): phone-frame mockup + demo panel bên phải.  
Mobile (width < 820): full-screen, no frame.

> `[SUY LUẬN]` Phone frame là cho prototype demo. Production mobile app sẽ full-screen.

---

## 8. Tương quan giữa các Feature

### 8.1 Data Flow Map

```
                        ┌──────────────┐
                        │   PROFILE    │
                        │ birth, type, │
                        │ parity, babies│
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ HERO CARD│    │profileBlock│   │ AGE CALC │
        │ weekBand │    │ → LLM     │   │ ageFromBirth│
        │ recovery │    │ context   │   │ babyAge   │
        └──────────┘    └──────────┘    └──────────┘

                        ┌──────────────┐
                        │  CHECK-IN    │
                        │ mood, sleep, │
                        │ body, stress │
                        └──────┬───────┘
                               │
     ┌─────────────┬───────────┼───────────┬──────────────┐
     │             │           │           │              │
     ▼             ▼           ▼           ▼              ▼
┌─────────┐  ┌─────────┐ ┌─────────┐ ┌─────────┐  ┌──────────┐
│ CALENDAR│  │ REFLECT │ │mkOpener │ │  TIPS   │  │CHIP_Q    │
│ diary   │  │ insight │ │ chat    │ │ home    │  │suggestions│
│ history │  │ 4-day   │ │ bridge  │ │ dayTip  │  │ home+chat│
└─────────┘  └─────────┘ └────┬────┘ └─────────┘  └─────┬────┘
                               │                         │
                               ▼                         ▼
                         ┌──────────┐              ┌──────────┐
                         │  CHAT    │◄─────────────│ SUGGEST  │
                         │ messages │              │  STRIP   │
                         └────┬─────┘              └──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ PIN/NOTES│   │  CRISIS  │   │ENGAGEMENT│
        │ save msg │   │  banner  │   │  nudge   │
        │ to diary │   │  T3 only │   │ signup   │
        └──────────┘   └──────────┘   └──────────┘
```

### 8.2 Feature Correlation Matrix

| Feature A | Feature B | Loại tương quan | Mô tả |
|---|---|---|---|
| Check-in | Hero card | Data → Display | `top_stressor` → `tipOverride` → hero tip |
| Check-in | mkOpener | Data → Logic | Check-in record → personalized opener |
| Check-in | Calendar | Data → Display | `checkins[]` → calendar cells |
| Check-in | Reflect | Data → Logic | Last 4 checkins → fatigue detection |
| Check-in | CHIP_Q | Data → Suggestions | Stressor/mood → matching chips |
| Check-in | Engagement | Data → Trigger | Each save → `bump()` → nudge check |
| Chat (match) | Crisis | Logic → UI | T3 match → crisis banner |
| Chat (match) | Suggestions | Logic → UI | Tier → strip content; T3 → no strip |
| Chat (LLM) | profileBlock | Data → Context | Profile → LLM system message |
| Crisis | HOPE hours | State → Content | `hopeIn` → psychiatric response variation |
| Crisis | Pin | State → UI | T3 → hide pin button |
| Signup | SignupFrom | State → Navigation | Return to originating screen |
| Engagement | Signup | Counter → Trigger | `eng >= 2 && !account` → nudge |
| Profile | Hero | Data → Calculation | `birth` → `daysOld` → `wkIdx` → hero content |
| Profile | Age display | Data → Display | `birth` → `ageFromBirth()` → "X tuần tuổi" |
| Babies | Feed info | Data → Data | Per-baby feed method → profileBlock |
| Pin | History notes | Data → Display | `notes[]` → notes tab |
| Intake | Profile | Flow → Data | Intake completion → initial profile |
| Intake | showPrompt | Flow → UI | Finish intake → prompt overlay |

### 8.3 State Dependencies (which feature changes what)

| State field | Written by | Read by |
|---|---|---|
| `screen` | Navigation, submit handlers, intake | Tất cả screen renders, nav |
| `profile` | Intake finish, signup, profile edit | Hero, age, profileBlock, nav visibility |
| `checkins[]` | quickSave, submitCheckin | Calendar, reflect, tips, recent, CHIP_Q |
| `messages[]` | send(), mkOpener, quickSave, submit | Chat render, suggestion strip, pin |
| `crisis` | send() (T3 detection) | Crisis banner, dismiss |
| `eng` | bump() | Engagement nudge |
| `account` | submitSignup | Nudge logic, account menu |
| `notes[]` | Pin toggle | History notes tab |
| `hopeIn` | Toggle (prototype) / auto (production) | T3-PSYCHIATRIC response, HOPE badge |
| `babies[]` | Intake, profile edit, baby profile edit | profileBlock, feed display, baby tabs |

---

## 9. Backend & API — Thiết kế cần xây

> ⚠️ **TOÀN BỘ PHẦN NÀY LÀ SUY LUẬN.** Prototype không có backend. Đây là thiết kế đề xuất dựa trên prototype behavior.

### 9.1 Authentication

| Endpoint | Method | Mô tả |
|---|---|---|
| `POST /auth/register` | POST | Tạo account (name, email) |
| `POST /auth/login` | POST | Đăng nhập |
| `POST /auth/logout` | POST | Đăng xuất |
| `GET /auth/me` | GET | Lấy thông tin user hiện tại |

> `[SUY LUẬN]` Prototype chỉ lưu `{ name, email }` in-memory. Production cần password hoặc OTP/magic link.

### 9.2 Profile & Babies

| Endpoint | Method | Mô tả |
|---|---|---|
| `GET /profile` | GET | Lấy profile (birth, birthType, parity) |
| `PUT /profile` | PUT | Cập nhật profile |
| `GET /babies` | GET | Danh sách babies |
| `PUT /babies/:id` | PUT | Cập nhật baby (label, feed method) |
| `POST /babies` | POST | Thêm baby |
| `DELETE /babies/:id` | DELETE | Xóa baby |

### 9.3 Check-ins

| Endpoint | Method | Mô tả |
|---|---|---|
| `POST /checkins` | POST | Tạo/cập nhật check-in (upsert by date key) |
| `GET /checkins?from=&to=` | GET | Lấy check-ins theo date range |
| `GET /checkins/today` | GET | Check-in hôm nay (nếu có) |

### 9.4 Chat & AI

| Endpoint | Method | Mô tả |
|---|---|---|
| `POST /chat/send` | POST | Gửi message, nhận response |

**Server-side flow:**
1. Nhận user message
2. Chạy `match()` server-side (keyword matching)
3. Nếu match → trả scripted response (KHÔNG gọi LLM)
4. Nếu không match → gọi LLM API với system prompt + profileBlock + history
5. Parse response (`parseReply`)
6. Trả `{ segments, suggestions, tier }`
7. **Server-side safety check:** nếu tier bắt đầu bằng "3" → log incident, KHÔNG filter response

> **Quan trọng:** `match()` và `script()` PHẢI chạy server-side để đảm bảo safety keywords luôn được catch, ngay cả khi client bị modified.

### 9.5 Notes

| Endpoint | Method | Mô tả |
|---|---|---|
| `POST /notes` | POST | Pin message |
| `DELETE /notes/:id` | DELETE | Unpin |
| `GET /notes` | GET | Lấy tất cả notes |

### 9.6 Trusted Contact

| Endpoint | Method | Mô tả |
|---|---|---|
| `PUT /profile/trusted-contact` | PUT | Lưu/cập nhật trusted contact |

### 9.7 Feedback

| Endpoint | Method | Mô tả |
|---|---|---|
| `POST /feedback` | POST | Gửi feedback text |

### 9.8 HOPE Hours

`[SUY LUẬN]` Production cần tự động xác định giờ HOPE:

```javascript
function isHopeOpen() {
  const now = new Date();
  // Convert to Vietnam time (UTC+7)
  const vnHour = (now.getUTCHours() + 7) % 24;
  const vnMin = now.getUTCMinutes();
  const timeInMin = vnHour * 60 + vnMin;
  return timeInMin >= 990 && timeInMin <= 1230;  // 16:30 - 20:30
}
```

### 9.9 Database Schema (đề xuất)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  birth_date DATE,
  birth_type TEXT,          -- 'normal' | 'csection'
  parity TEXT,              -- 'first' | 'not_first'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Babies
CREATE TABLE babies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  label TEXT DEFAULT '',
  feed_formula TEXT,        -- 'mom' | 'only' | 'mix'
  feed_method TEXT,         -- 'direct' | 'pump' | 'both'
  sort_order INTEGER DEFAULT 0
);

-- Check-ins (upsert by user_id + date_key)
CREATE TABLE checkins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date_key DATE NOT NULL,
  moods TEXT[] NOT NULL,
  sleep TEXT,
  bodies TEXT[],
  stressors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date_key)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,        -- 'user' | 'assistant'
  content TEXT NOT NULL,
  segments TEXT[],
  suggestions TEXT[],
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes (pinned messages)
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message_key TEXT NOT NULL,
  text TEXT NOT NULL,
  topic TEXT NOT NULL,
  date_key DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trusted contacts
CREATE TABLE trusted_contacts (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  name TEXT,
  phone TEXT,
  notes TEXT
);
```

---

## 10. Bằng chứng còn thiếu & Quyết định mở

### 10.1 Thiếu trong prototype

| Item | Tình trạng | Tác động |
|---|---|---|
| Backend / API | Hoàn toàn thiếu | Cần xây từ đầu (xem phần 9) |
| Authentication thật | Chỉ có name+email in-memory | Cần auth flow thật (OTP/magic link/password) |
| Data persistence | In-memory, mất khi refresh | Cần database |
| HOPE hours auto-detect | Manual toggle trong prototype | Cần tính toán dựa trên UTC+7 |
| Push notifications | Rõ ràng OUT OF SCOPE | Chưa quyết định cho tương lai |
| Offline support | Không đề cập | Cần quyết định |
| Content entries #28+ | TODO trong content-framework-v2-vi.md | Baby-as-entry-point entries cho scenarios 2/3/5/6/7 |

### 10.2 Quyết định mở (cần founder quyết)

| Quyết định | Context | Đã có bằng chứng |
|---|---|---|
| Logout UI entry point | Code logout tồn tại [dòng 1617] nhưng không có nút rõ ràng | **Mâu thuẫn:** logic có, UI không |
| Prenatal scope | Scope doc: "Có nên mở rộng ra trước sinh?" | Không |
| Guest vs account flow | Prototype cho phép dùng mà không cần account | `[NGUỒN: dòng 1103]` nudge sau 10 interactions |
| Outbound messaging / push | Scope doc: "deliberately separate, undecided" | **Rõ ràng chưa quyết** |
| "Cần giúp ngay" shortcut | Có thể thêm nút nhanh trên home cho T3 | Không cần |
| Conversation persistence | Prototype: messages mất khi refresh/logout | Quyết định: persistent |

### 10.3 Bằng chứng mâu thuẫn

1. **`week` vs `birth` trong profile:** Profile có cả `week: number` và `birth: "YYYY-MM-DD"`. Khi có `birth`, `week` bị override bởi tính toán từ DOB. `week: 4` được dùng làm default fallback khi chưa có DOB [NGUỒN: dòng 1626, `profile: s.profile || { week: 4 }`]. **→ Production nên bỏ `week`, chỉ dùng `birth`.**

2. **`ifeed` state field:** Tồn tại trong `mk()` [NGUỒN: dòng 1042] nhưng không thấy đọc ở đâu. Legacy field, có thể xóa.

3. **`support` screen:** Xuất hiện trong `inApp` check [NGUỒN: dòng 1329] nhưng không có `isSupport` render block rõ ràng. Support contacts hiển thị trong profile screen. **→ Có thể support không phải screen riêng mà là section trong profile.**

---

## Phụ lục A: System Prompt (tham chiếu)

System prompt đầy đủ nằm trong project doc `system-prompt-v2-vi.md`. Nó được nhúng trong prototype tại [NGUỒN: dòng 839-912] và inject vào LLM call qua `this.SYSTEM + this.profileBlock()`.

Cấu trúc system prompt:
1. Persona definition (MeOi, Vietnamese, warm)
2. Tier system rules (1/2/3-PHYSICAL/3-PSYCHIATRIC/3-SAFETY)
3. 27+ knowledge base entries (embedded inline, no vector DB)
4. Output format: `[TIER:X]` và `[GỢI_Ý: a|b|c]` tags
5. HOPE hours awareness
6. Test cases (7 scenarios)

## Phụ lục B: Content Framework (tham chiếu)

Content framework đầy đủ nằm trong project doc `content-framework-v2-vi.md`. 28 entries (27 + 1 TODO placeholder) across:
- 7 scenarios gốc (scope doc)
- Tags: EMOTIONAL, Y_TE
- Sources: WHO, UNICEF, ACOG, Mayo Clinic, etc.

## Phụ lục C: Demo States

Prototype hỗ trợ 5 demo states cho testing:

```javascript
// [NGUỒN: dòng 1440-1444]
"first"        → Lần đầu dùng (onboarding)
"empty"        → Home trống (guest, no checkins)
"seededGuest"  → Lan, guest, 9 ngày check-in data
"seededIn"     → Lan, đã đăng nhập, 9 ngày data
"seededTwins"  → Lan, sinh đôi, 2 bé với feed methods khác nhau
```

`[SUY LUẬN]` Demo states không cần trong production nhưng hữu ích cho testing. Có thể chuyển thành test fixtures.

---

*Tài liệu này được trích xuất từ MeOi! prototype Version 28. Mọi `[NGUỒN: dòng X]` tham chiếu đến `decoded_template.txt` (decoded từ `meoi.html`). Mọi `[SUY LUẬN]` là phần inference không có code nguồn tường minh.*
