# Hồ Sơ Mẹ (Profile) — Spec v1

*Nguồn: quyết định từ phiên làm việc thiết kế profile mẹ (2026-10-20), nối tiếp content-framework-v2-vi.md / system-prompt-v2-vi.md / scope-doc-v2-vi.md. File này để upload lên GitHub cho Claude Design đọc và build/update mockup "Hồ sơ của mẹ".*

---

## 1. Bối Cảnh

Mở rộng phạm vi đối tượng: sản phẩm không còn giới hạn ở "mẹ lần đầu sinh con" — xem patch cho scope-doc-v2-vi.md ở mục 6. Hệ quả trực tiếp: thêm field "Số lần sinh" vào profile để AI chat điều chỉnh tone, **không dùng để lọc nội dung** (7 scenarios giữ nguyên, chưa mở rộng scenario thứ 8 — chờ tín hiệu thật từ beta).

## 2. Field Spec — Profile Mẹ

| # | Field | UI | Options | Bắt buộc | Mục đích |
|---|---|---|---|---|---|
| 1 | Tuần tuổi bé *(đã có)* | Slider | 0–52 tuần | Có | Tailor giai đoạn hậu sản |
| 2 | Phương thức sinh | Chip (chọn 1/2) | Sinh thường 🌿 / Sinh mổ 🩹 | Có | Timeline hồi phục (Entry #21), độ nhạy Tier-3 Physical liên quan vết khâu |
| 3 | Tình trạng cho con bú | Chip (chọn 1/3) | Bú mẹ hoàn toàn 🤱 / Kết hợp 🤝 / Sữa công thức 🍼 | Có | Lọc relevance scenario 4 (breastfeeding) |
| 4 | Số lần sinh | Toggle nhị phân | Lần đầu làm mẹ 🌱 / Đã từng sinh con trước đó 🤍 | Có | Tone-adjustment (Nguyên tắc #7, mục 6) — KHÔNG dùng để lọc content |
| 5 | Liên hệ tin cậy khẩn cấp | 2 input text | Tên, Số điện thoại | Optional | Fallback Tier-3 ngoài giờ HOPE/Ngày Mai (content-framework mục 2, design rule crisis) |
| 6 | Thông tin khác | Textarea | Free text, placeholder: "VD: dị ứng thuốc, biến chứng khi sinh, đang điều trị..." | Optional | Context bổ sung mẹ tự cung cấp |

## 3. Copy — Note Cho Field Optional

Hiển thị ngay dưới field 5 và field 6, style italic/muted:

> *"Không bắt buộc — nhưng sẽ giúp mình hiểu và đồng hành cùng mẹ tốt hơn. Mẹ có thể thêm, sửa hoặc bỏ bất cứ lúc nào trong Hồ sơ của mình."*

## 4. Screen Flow

- **Intake (bắt buộc, giữ nguyên guest-first)**: Step 1 hiện có (tuần tuổi bé) → thêm **Step 2 mới**: field 2, 3, 4 — mỗi field 1 tap, không scroll.
- **Sau Step 2, 1 soft-prompt optional** (tái dùng pattern signup-nudge hiện có): mời điền field 5 + 6, có nút "Bỏ qua, thêm sau".
- **Hồ sơ của mẹ** (màn hình mới, vào từ account menu — cho cả guest lẫn đã tạo tài khoản): xem/sửa lại bất kỳ field nào trong 6 field, bất cứ lúc nào.

## 5. Lưu Ý Kỹ Thuật

AI chat system prompt hiện là 1 string tĩnh gửi cố định mỗi lần gọi API. Để field profile ảnh hưởng tới câu trả lời của AI, cần nối thêm 1 đoạn `## Hồ sơ mẹ: [field 2–6]` vào system prompt **động, mỗi lần gọi API** — đây là thay đổi kiến trúc (API payload), không chỉ UI/mockup.

Field 4 (Số lần sinh) hiện **chưa có entry nào trong content bank dùng tới** — chỉ nên dùng để chỉnh tone (bớt giải thích cơ bản nếu mẹ đã quen), không suy diễn mức độ cần hỗ trợ.

## 6. Patch Cho Các Doc Khác (paste trực tiếp vào file tương ứng)

### scope-doc-v2-vi.md — thay đoạn "Mẹ lần đầu sinh con" trong mục Đối Tượng Hướng Đến:

> Ưu tiên thiết kế cho mẹ lần đầu sinh con — vì đây là nhóm giả định đối mặt nhiều điều xa lạ nhất, cần đồng hành nhiều nhất. Đây là giả định thiết kế ban đầu, không phải giới hạn đối tượng: sản phẩm không loại trừ mẹ sinh con lần 2, 3... và không mặc định rằng nhóm này ít cần hỗ trợ hơn — mỗi lần sinh, mỗi em bé là một trải nghiệm hậu sản riêng. Phạm vi thực tế: bất kỳ người mẹ nào trong giai đoạn hậu sản cần một AI companion.

### system-prompt-v2-vi.md — thêm vào mục "Nguyên tắc bắt buộc", Nguyên tắc #7:

> Khi biết mẹ không phải lần đầu sinh con, không mặc định trải nghiệm hiện tại nhẹ nhàng hơn hay mẹ "đã biết hết rồi" — không suy diễn mức độ cần hỗ trợ dựa trên số lần sinh. Có thể bớt giải thích khái niệm cơ bản nếu ngữ cảnh cho thấy mẹ đã quen, nhưng chỉ phản hồi các yếu tố đặc thù của mẹ nhiều con (chia sẻ sự chú ý, áp lực với con lớn, so sánh giữa các lần sinh) nếu mẹ chủ động nhắc tới — không hỏi dồn, không giả định.

### content-framework-v2-vi.md — thêm watch-item (không phải entry mới, chỉ ghi chú theo dõi):

> Theo dõi trong beta: nếu mẹ nhiều con chủ động hỏi về sibling rivalry / chia sẻ sự chú ý / so sánh giữa các lần sinh → đây là tín hiệu cân nhắc scenario thứ 8, không đoán trước khi chưa có behavior thật.

---

*Bước tiếp theo sau khi upload: Claude Design build Step 2 intake + màn hình Hồ sơ theo field spec mục 2–4; dev cần xử lý riêng phần "Lưu Ý Kỹ Thuật" mục 5 (không phải việc của mockup).*
