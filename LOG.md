# Nhật ký thực hiện đồ án — MeOi! ("Mẹ ơi!")

*Quy ước: mỗi mục ghi ngày, owner (Vân / Claude Code / Claude Cowork / Claude Design), việc đã làm, quyết định + lý do, vướng mắc. Ô **[Vân điền]** là phần mình không có dữ liệu thật (ngày, số giờ) — cần bạn bổ sung trước khi nộp; không ước đoán thay bạn.*

## Mốc đã được GVHD duyệt

5/7/2026 duyệt tên đề tài; 10/7/2026 duyệt plan; 22/8/2026 đổi hướng và duyệt plan mới; 4/11/2026 bảo vệ. Nhật ký chính thức theo mẫu của khoa: NHAT-KY-THUC-HIEN.docx (file này là nhật ký chi tiết bổ sung).

## Giai đoạn 1 — Định hình sản phẩm (ngày: [Vân điền, nằm giữa 22/8 và 25/10/2026])

| Việc | Owner | Quyết định và lý do |
|---|---|---|
| Viết scope-doc v1 → v2 | Vân + Claude | Chỉ làm giai đoạn **postpartum** (khả thi trong ~10 giờ/tuần); chưa quyết prenatal (để ngỏ). **Không** làm monetization (chưa có user để biết mô hình nào hợp). **Không** làm multi-caregiver (rủi ro partner kiểm soát/giám sát trong đúng các tình huống Entry #27 bảo vệ mẹ). Thêm "xem lại lịch sử check-in" dạng phản chiếu nhẹ, không dashboard. |
| Phát hiện "cửa vào" thực tế | Vân | Mẹ thường hỏi về bé trước, cảm xúc của mẹ nằm phía sau → cần entry "cửa vào từ câu hỏi về bé" cho từng scenario. |
| content-framework v2 (27 entries) | Vân + Claude | Chia tag EMOTIONAL / Y_TE; nguồn WHO, ACOG, Mayo Clinic, PSI; giữ lập trường non-diagnostic vì chưa có chuyên gia y khoa review. |
| system-prompt v2 | Vân + Claude | Hệ thống **Tier 1/2/3**; Tier 3 chia Physical / Psychiatric / Safety và luôn escalate; thêm nguyên tắc #6 "cầu nối hướng về mẹ"; soạn 7 test case thủ công. |
| Prototype v4 (React, 1 file) | Claude Design / Vân | Dựng onboarding, intake, check-in, home, chat, CrisisBanner. Dùng tag `[TIER:X]` để UI hiển thị crisis banner (đã đóng to-do "machine-readable tag"). |

## 29–30/10/2026 — Đối chiếu tài liệu và hoàn thiện nội dung

| Việc | Owner | Kết quả / quyết định / lý do |
|---|---|---|
| Đối chiếu scope-doc, content-framework, system-prompt, prototype | Claude, Vân duyệt | Phát hiện 4 điểm: (1) prototype đã thêm stressor "Áp lực tiền bạc" ngoài 7 scenario gốc; (2) giờ hoạt động hotline Ngày Mai ghi mơ hồ; (3) system-prompt viện dẫn "yêu cầu bắt buộc" review y khoa không có trong scope-doc; (4) 2 to-do đã xong nhưng chưa cập nhật. Ngoài ra số liệu "14 EMOTIONAL" trong v2 sai (thực tế 20 EMOTIONAL + 7 Y_TE). |
| Verify hotline (web search) | Claude | Ngày Mai: **Thứ 4–CN, 13:00–20:30** (nghỉ Thứ 2, Thứ 3), nguồn findahelpline.com do chính hotline xác nhận. HOPE 0865 044 400, 16:30–20:30 hằng ngày: khớp. Chưa verify: số điện thoại Ngày Mai, 111, CSAGA, Ngôi nhà Bình yên. |
| **Quyết định: giữ** Áp lực tiền bạc làm **Scenario 8** | Vân | Tận dụng code đã có, khớp insight "cộng dồn yếu tố". Đổi lại phải sửa scope-doc từ 7 → 8 và soạn nội dung có nguồn. |
| Quyết định thứ tự ưu tiên | Vân | 1) "Gỡ rối cùng mẹ" hoàn thiện tối đa; 2) hồ sơ đồ án (code, nhật ký, báo cáo); 3) mở rộng suite. |
| Soạn Entry #28–32 (cửa vào từ câu hỏi về bé) và #33–35 (Scenario 8) | Claude soạn, **Vân chưa duyệt** | Nguồn Scenario 8: tổng quan hệ thống "Economic burden of postpartum depression among mothers" (13 bài), mới đọc abstract. Entry #33 có quy tắc: nếu nói về tiền kèm tuyệt vọng/ý nghĩ tự hại → chuyển Tier 3-Psychiatric. |
| Cập nhật content-framework v2.1; đồng bộ system-prompt, prototype, scope-doc | Claude | 35 entries (28 EMOTIONAL + 7 Y_TE), 8 scenario. Hiện 3 nơi khớp nhau. |
| Đóng gói repo, README, báo cáo, nhật ký | Claude | Chốt hồ sơ do giới hạn quota tuần. |
| **Quyết định nền tảng: nộp bản prototype chạy trong Claude Artifact**; web app thật là hướng phát triển | Vân (do giới hạn thời gian) | Đổi lại: không phải app độc lập, chưa đủ điều kiện beta ngoài Claude.ai. Ghi rõ là giới hạn trong báo cáo. **[Vân xác nhận]** |

## 30/10/2026 — Xây bản production (M0–M4) và chạy tier evals

*Số giờ thực tế: **[Vân điền]**. Các số liệu dưới đây lấy từ mã nguồn, CI và kiểm tra trên bản công khai ngày 30/10/2026.*

| Việc | Owner | Kết quả / quyết định / lý do |
|---|---|---|
| M0: tái cấu trúc repo (`backend/`, `frontend/`, `docs/`, `docs/adr/`), docker compose, `.env.example` | Claude Code, Vân duyệt | `docker compose up` chạy 3 dịch vụ (db, api, web). ADR-001 ghi lại stack. |
| Đối chiếu tài liệu v2/v3 | Claude, Vân quyết | CLAUDE.md nhắc bản v2 (35 entries) nhưng file `content-framework-v2-vi.md` mẹ thêm giống hệt v3 (33 entries); bản 35 entries của content framework **không tồn tại**, chỉ có trong system-prompt v2.1. **Vân quyết: dùng system-prompt v2 làm nền**. System prompt của backend = nguyên văn V28 (có hướng dẫn tag `[TIER]`, mà v2 thiếu) + 3 entry tiền bạc từ v2. |
| M1: backend FastAPI | Claude Code | `POST /chat/send`: so khớp từ khoá an toàn ở server **trước** LLM; Tier 3 dùng kịch bản cố định, banner khủng hoảng do server dựng, không cho ghim; parse tag Tier, thiếu tag thì mặc định Tier 2; giờ HOPE tính theo giờ Việt Nam; `GET /support`. Log chỉ ghi tier, không ghi nội dung tin nhắn. |
| Mở rộng danh sách từ khoá Tier 3 | Claude đề xuất, **Vân duyệt** | Prototype bỏ sót "muốn chết", "tự vẫn", "chảy máu", "làm đau con"... Danh sách nháp được bật cả hai, ưu tiên bắt thừa hơn bỏ sót (ADR-002). |
| Chọn LLM và chi phí | Vân quyết | Dùng `claude-haiku-5-5`. Đo thật: ~6.000 token vào mỗi lượt, ước tính ~$0,001–0,002/lượt. Đã cân nhắc chuyển sang OpenAI: chi phí ngang nhau nên **giữ Anthropic**. |
| Chạy 7 tier evals (2 chế độ) | Claude chạy, **Vân chấm** | Tier gắn đúng ở mọi case; drift bắt được ở lượt 5. **Vân đã chấm: đạt cả 7 case** (một lần chạy mỗi chế độ, nên chưa nói được về độ ổn định giữa các lần chạy). **Lỗi phát hiện và sửa:** lần chạy đầu có câu bị cắt giữa chừng và một phản hồi rỗng, do phần "suy nghĩ" của mô hình ăn vào giới hạn 1.000 token; đã nâng giới hạn, hạ mức suy nghĩ, xử lý tag dở dang. Chế độ chỉ-LLM cho thấy mô hình tự thêm hướng dẫn xử trí ở Tier 3 (xem BÁO CÁO mục Đánh giá). |
| M2: giao diện React + TypeScript | Claude Code | Port V28: onboarding, intake, home, check-in, chat (banner khủng hoảng, ghim, gợi ý nhanh), lịch sử, hồ sơ. Nút "Hỗ trợ" luôn có ở mọi màn hình. Cắt có chủ đích: Telex, khung điện thoại, hoạt ảnh demo, đăng ký (ADR-003). Dữ liệu chỉ ở bộ nhớ trình duyệt. |
| M3: CI | Claude Code | GitHub Actions: backend (ruff, mypy, pytest), frontend (eslint, vitest, build), dựng image và chạy thử compose. Evals là workflow thủ công, không chặn CI. Repo GitHub nối vào lịch sử cũ, 2 PR, **CI xanh** (Vân xác nhận). |
| M4: triển khai công khai | Vân quyết hosting, Claude cấu hình | **Render gói miễn phí, vùng Singapore** (Vân không có thẻ quốc tế). Gộp web và API thành một container để vừa 750 giờ/tháng. Chỉ deploy khi CI xanh. Kiểm tra từ bên ngoài: bản chạy trùng commit `main`, HTTPS, một vòng chat thật qua Claude, câu Tier 3 trả bằng kịch bản (ADR-005). URL: https://meoi.onrender.com |
| Quy trình cải tiến và bộ câu an toàn vàng | Claude đề xuất, Vân duyệt | `docs/process/quy-trinh-cai-tien.md`: 3 làn theo rủi ro (giao diện / hành vi / an toàn và nội dung), nhịp làm việc theo tuần, cổng tự động. Bộ câu an toàn vàng (50 câu bắt buộc + 15 lỗ hổng đã biết) chạy trong CI. **Phát hiện: 15 cách nói nguy hiểm mà lớp từ khoá chưa bắt** (ví dụ "chán sống", "bóp cổ", "vết mổ chảy mủ"); chưa thêm từ khoá nào vì đó là quyết định an toàn của Vân. |
| Hoàn thiện báo cáo | Claude soạn (tracked changes), Vân duyệt | Điền mục Đánh giá kết quả, cập nhật phần đã lỗi thời, sửa năm bìa 2025 → 2026. |

**Điều chỉnh so với quyết định ngày 29–30/10:** khi đó chốt "nộp prototype chạy trong Claude Artifact, web app thật là hướng phát triển". Nay bản web app thật đã chạy công khai; Artifact V28 vẫn là **phương án dự phòng** khi bảo vệ.

## Việc chưa làm (ghi trung thực)

- 7 test case Tier đã chạy **một lần** mỗi chế độ (30/10, Haiku 5.5) và Vân chấm đạt; case 7b (cầu nối) nên chạy lặp để chắc. Chưa chạy beta với 3–5 mẹ; chưa có chuyên gia y khoa/tâm lý review (kể cả kịch bản Tier 3 và danh sách từ khoá).
- Chưa có đăng nhập và database (M5); dữ liệu của mẹ mất khi tải lại trang. Chưa kiểm tra pháp lý khi lưu dữ liệu sức khoẻ.
- Gói hosting miễn phí có thể "ngủ" (~1 phút để thức) khi khởi động lại hoặc đang deploy.
- Chưa khảo sát chi tiết sản phẩm hiện có (cần cho câu hỏi cốt lõi #1 của báo cáo).
- Chưa verify lại 4 số điện thoại; chưa quyết định phạm vi prenatal.

## Bài học (dùng cho phần "năng lực đạt được")

1. Tài liệu spec và code lệch nhau rất nhanh → cần một nguồn chuẩn duy nhất và đối chiếu định kỳ.
2. Scope drift xuất hiện ngay trong prototyping; câu "không phải v1" trong scope-doc giúp phát hiện được.
3. Với sản phẩm an toàn sức khỏe, dữ liệu như số hotline phải verify theo nguồn, kèm cột trạng thái.
4. Mọi con số tự thống kê (số entry, tỉ lệ tag) phải đếm lại, không tin ghi chú cũ.
5. Kịch bản cố định chạy trước LLM có thể che mất LLM khi đánh giá: ở đường đầy đủ chỉ 5/12 lượt thật sự gọi mô hình, nên phải đo thêm chế độ chỉ-LLM.
6. Phần "suy nghĩ" của mô hình tính vào giới hạn token; đặt giới hạn thấp có thể làm cụt câu trả lời và mất tag an toàn. Phải chạy đánh giá thật, không chỉ test với mô hình giả.
7. Một dòng cấu hình có thể quyết định rủi ro an toàn (gói hosting "ngủ"): ghi rõ đánh đổi và biện pháp giảm thiểu khi chọn.
