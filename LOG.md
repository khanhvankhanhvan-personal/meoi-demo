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

## Việc chưa làm (ghi trung thực)

- Chưa chạy 7 test case Tier; chưa chạy beta với 3–5 mẹ; chưa có chuyên gia y khoa review.
- Chưa khảo sát chi tiết sản phẩm hiện có (cần cho câu hỏi cốt lõi #1 của báo cáo).
- Chưa verify lại 4 số điện thoại; chưa quyết định phạm vi prenatal.

## Bài học (dùng cho phần "năng lực đạt được")

1. Tài liệu spec và code lệch nhau rất nhanh → cần một nguồn chuẩn duy nhất và đối chiếu định kỳ.
2. Scope drift xuất hiện ngay trong prototyping; câu "không phải v1" trong scope-doc giúp phát hiện được.
3. Với sản phẩm an toàn sức khỏe, dữ liệu như số hotline phải verify theo nguồn, kèm cột trạng thái.
4. Mọi con số tự thống kê (số entry, tỉ lệ tag) phải đếm lại, không tin ghi chú cũ.
