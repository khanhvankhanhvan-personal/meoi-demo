# Hồ Sơ Mẹ & Bé — Spec v2

*Thay thế profile-spec-v1-vi.md. Redesign để hỗ trợ sinh đa con (song/đa thai) — kiến trúc dùng chung cho 1 hay nhiều bé, không cần nhánh logic riêng.*

---

## 0. Thay Đổi So Với V1 (Changelog)

- **Phát hiện:** chưa tính trường hợp sinh đa con (song thai, đa thai) khi thiết kế v1.
- **Thay đổi kiến trúc:** field "Tình trạng cho con bú" chuyển từ mức MẸ sang mức TỪNG BÉ. Lý do: sinh đôi/sinh ba có thể có tình trạng bú khác nhau giữa các bé (vd: 1 bé bú mẹ tốt, 1 bé dùng công thức vì nằm lồng ấp). Đây là thông tin Tier-logic thật sự cần phân biệt, không gộp chung được.
- **Đảo ngược quyết định trước đó:** lượt thảo luận trước chọn "Path C" (chỉ thêm nguyên tắc tone, không cần field) cho trường hợp đa con. Phát hiện ở trên cho thấy cần field cấu trúc thật, không chỉ tone — vì vậy đảo ngược sang thiết kế field.
- **Phạm vi cố ý giữ hẹp:** chỉ track **lần sinh gần nhất** (dù 1 hay N bé). Không track các lần sinh khác nhau trong quá khứ (vd: con lớn 3 tuổi + con mới sinh) — nếu mẹ nhắc tới trong chat, AI xử lý qua hội thoại, không qua structured profile.
- **⚠️ Mâu thuẫn cần xác nhận:** scope-doc-v2-vi.md, mục "Ngoài Scope", có dòng *"Tài khoản nhiều con, nhiều người chăm sóc, hoặc tài khoản gia đình"* bị liệt kê chung với lý do "rủi ro giám sát" (thêm người khác truy cập dữ liệu mẹ). Lý do đó không áp dụng cho "Baby Profile" (vẫn 1 mẹ, 1 tài khoản). Giả định: đây là 2 khái niệm bị gộp nhầm lúc viết v2 — "tài khoản nhiều người chăm sóc/gia đình" vẫn out-of-scope, "Baby Profile" (feature này) là mới, trong scope. Patch sửa câu ở mục 6 — cần bạn xác nhận.

---

## 1. Kiến Trúc Dữ Liệu

Nguyên tắc: **1 "lần sinh gần nhất" → N hồ sơ bé** (N≥1), không phải N tài khoản hay N lịch sử thai kỳ.

```
Mẹ (motherProfile)
├── Lần sinh gần nhất (birthEvent)
│   ├── Tuần tuổi (tính từ ngày sinh — dùng chung cho mọi bé trong lần sinh này)
│   ├── Phương thức sinh (sinh thường / sinh mổ — dùng chung, vì mẹ chỉ trải qua 1 ca sinh)
│   └── Hồ sơ từng bé — babies[], N ≥ 1
│         ├── Nhãn/tên gọi (optional — "bé lớn"/"bé nhỏ" hoặc tên mẹ tự đặt, để phân biệt khi chat)
│         └── Tình trạng cho bú (bú mẹ / công thức / kết hợp) — MỖI BÉ RIÊNG
├── Số lần sinh (lần đầu làm mẹ / đã từng sinh con trước đó) — mức mẹ, không đổi theo N
├── Liên hệ tin cậy khẩn cấp (optional) — mức mẹ
└── Thông tin khác (optional, free text) — mức mẹ
```

**Edge case cố ý đơn giản hóa:** nếu 1 bé trong cặp sinh đôi sinh thường, bé kia phải mổ cấp cứu (hiếm nhưng có thật về mặt y khoa) — v1 chỉ lưu 1 giá trị phương thức sinh chung. Chấp nhận sai số nhỏ này để tránh phức tạp hóa model; mẹ có thể ghi chú thêm vào "Thông tin khác" nếu cần.

**Cố ý KHÔNG làm:** không build lịch sử nhiều lần sinh khác nhau (con lớn tuổi khác lần sinh này). Giữ đúng nguyên tắc content-framework: *"không biến nội dung về bé thành một baby-care encyclopedia"*, và khớp với watch-item scenario-8 (sibling rivalry) — chờ tín hiệu thật từ beta, không build trước.

---

## 2. Screen Flow (progressive disclosure)

| Step | Nội dung | Khi nào hiển thị |
|---|---|---|
| 1 | Tuần tuổi (slider, như v1) | Luôn |
| 1.5 *(mới)* | "Lần sinh này mẹ có mấy bé?" — stepper số (mặc định 1, +/−) | Luôn hiện, nhưng chọn "1" thì mọi step sau giữ nguyên y hệt v1 |
| 2 | Phương thức sinh (chip, như v1) | Luôn, 1 lần dù N bé |
| 3 | Tình trạng cho bú | N=1: 1 chip, y hệt v1. N>1: lặp cho từng bé (nhãn optional + chip), nên dùng carousel/swipe thay vì scroll dài |
| 4 | Số lần sinh (toggle, như v1) | Luôn |

**Trade-off:** ca đơn thai (dự kiến đa số trong beta 3-5 mẹ) — **0 friction tăng thêm** so với v1. Ca đa thai — thêm đúng N−1 bước nhỏ, chấp nhận được vì đây chính là nhóm cần chi tiết hơn.

Field 5 (liên hệ khẩn cấp) + field 6 (thông tin khác) — giữ nguyên vị trí, logic, copy như v1 (soft-prompt optional sau intake + sửa lại bất cứ lúc nào trong Hồ sơ).

---

## 3. System Prompt — Nguyên Tắc #8 (mới)

> Khi hồ sơ mẹ có nhiều hơn 1 bé, nếu mẹ nhắc đến "bé"/"con" mà không rõ là bé nào, hỏi lại ngắn gọn để xác nhận trước khi áp dụng thông tin Tier 1/2 riêng cho 1 bé cụ thể (vd: tình trạng bú). **Ngoại lệ bắt buộc: không bao giờ để việc chưa rõ "bé nào" trì hoãn hoặc làm nhẹ đi một phản hồi Tier 3** — nếu mẹ mô tả dấu hiệu nghiêm trọng mà không rõ bé nào, vẫn escalate ngay như bình thường; hỏi rõ bé nào có thể làm SAU khi đã đưa thông tin khẩn cấp, không phải trước.

---

## 4. Lưu Ý Kỹ Thuật — Context Injection

Format nối vào system prompt (động, mỗi lần gọi API — tiếp nối kiến trúc đã nêu ở profile-spec-v1):

```
## Hồ sơ: Lần sinh gần nhất {X} tuần trước ({sinh thường|sinh mổ}).
Bé 1{nhãn nếu có}: tình trạng bú {Y}.
Bé 2{nhãn nếu có}: tình trạng bú {Z}.
[... lặp cho N bé]
Số lần sinh: {lần đầu làm mẹ|đã từng sinh con trước đó}.
```

---

## 5. Việc Cần Sửa Lại So Với V1 (nếu đã bắt đầu build)

- Field "Tình trạng cho bú" ở Intake Step cũ (mức mẹ) → tách thành field cấp bé, lặp theo N.
- Thêm Step 1.5 (chọn N bé).
- Profile Settings screen: thêm khả năng xem/sửa N hồ sơ bé riêng lẻ, không chỉ 1 field cho bú duy nhất.

---

## 6. Patch Cho scope-doc-v2-vi.md

### Sửa dòng "Ngoài Scope" để tách 2 ý đã bị gộp nhầm:

Thay:
> "Tài khoản nhiều con, nhiều người chăm sóc, hoặc tài khoản gia đình — đã cân nhắc lại (v2): rủi ro giám sát trong các mối quan hệ không an toàn là lý do chính, không chỉ độ phức tạp kỹ thuật"

Bằng:
> "Tài khoản nhiều người chăm sóc hoặc tài khoản gia đình (nhiều NGƯỜI cùng truy cập 1 tài khoản mẹ) — đã cân nhắc lại (v2): rủi ro giám sát trong các mối quan hệ không an toàn là lý do chính, không chỉ độ phức tạp kỹ thuật. *(Lưu ý: khác với Baby Profile — 1 mẹ, 1 tài khoản, nhiều hồ sơ BÉ — đã được đưa vào scope, xem profile-spec-v2-vi.md.)*"

### Bổ sung vào Đối Tượng Hướng Đến (nối tiếp câu đã duyệt trước đó):
> "...sản phẩm không loại trừ mẹ sinh con lần 2, 3... hay mẹ sinh đôi/đa thai, và không mặc định rằng những trường hợp này ít cần hỗ trợ hơn..."

---

*File này thay thế hoàn toàn profile-spec-v1-vi.md làm nguồn upload GitHub cho Claude Design.*
