# Việc chỉ Vân làm được trước 4/11

Đánh dấu khi xong. Việc nào mình (Claude) đã làm xong thì không có trong danh sách này.

## A. Chấm và duyệt (quan trọng nhất)
- [ ] **Chấm 7 tier evals.** Hai file trong `backend/evals/out/` trên máy mẹ (không nằm trên GitHub vì có thể chứa nội dung thử nghiệm):
  `evals-full-pipeline-20261030-112253.md` và `evals-llm-only-20261030-112314.md`. Mỗi case có ô "Vân đánh giá: đạt / không đạt". Đọc kỹ 3 điểm:
  1. Case 3 và 4 chế độ chỉ-LLM: mô hình tự thêm hướng dẫn xử trí và đặt câu hỏi, trái nguyên tắc "Tier 3 không tự trả lời nội dung".
  2. Case 7b: đổi xưng hô sang "em" và chèn lời hướng về mẹ dù không có tín hiệu mệt (mới chạy một lần).
  3. Case 6 chế độ chỉ-LLM: nêu một số dấu hiệu cần khám dù ngoài phạm vi.
  Sau khi chấm, báo mình kết quả để mình cập nhật báo cáo (và chỉnh prompt nếu mẹ muốn).
- [ ] **Duyệt giao diện trên điện thoại thật** (mở https://meoi.onrender.com): chữ, nút bấm, màu có ổn không; có chỗ nào mẹ muốn đổi so với bản V28.
- [ ] **Duyệt danh sách từ khoá Tier 3 một lần nữa** nếu mẹ có thêm cách nói của mẹ bỉm thật (mẹ đã duyệt ngày 30/10; thêm từ cần ý kiến của mẹ).

## B. Báo cáo (file `docs/report/Van_work-report-completed.docx` trên máy mẹ)
Mọi chỗ mình sửa đều là **tracked changes** (tác giả "Claude"): mở bằng Word → tab Review → Accept/Reject từng chỗ.
- [ ] Xác nhận **"Đề tài:"** trên trang bìa: bản Downloads để trống, mình đã điền (tracked change) tên lấy từ `BAO-CAO.md` trong repo: *MeOi! ("Mẹ ơi!") — Ứng dụng AI đồng hành bằng tiếng Việt cho các bà mẹ lần đầu sinh con trong giai đoạn hậu sản*. Nếu tên được duyệt khác thì sửa.
- [ ] Sửa số liệu content framework trong báo cáo: hiện ghi "35 entries (28 EMOTIONAL + 7 Y_TE)" nhưng file framework v3 ghi **33 entries (25 EMOTIONAL + 8 Y_TE)**; 35 entries chỉ có trong system prompt. Mẹ chọn con số đúng để dùng nhất quán.
- [ ] Sửa câu "Prototype (v28): React một file ... `src/meoi-prototype.jsx`": file `.jsx` là bản **v5**, còn V28 là file HTML `docs/prototype/Meoi_v28.html`.
- [ ] Kiểm tra tháng ghi trên bìa ("tháng 10") và **cập nhật Mục lục** (chuột phải → Update field).
- [ ] Chọn **một** báo cáo chính thức. Repo có `BAO-CAO.md`/`BAO-CAO.docx` (đầy đủ hơn: có mục 2.4 khảo sát sản phẩm hiện có, 5.3 beta, 5.4 giới hạn) khác với bản `Van_work-report` trong Downloads. Mình chỉ cập nhật bản Downloads; nếu mẹ nộp bản trong repo thì báo mình để áp dụng cùng các cập nhật (đánh giá evals, bản production, triển khai) cho bản đó.
- [ ] Điền **số giờ và ngày** vào `LOG.md` (các chỗ "[Vân điền]") và vào `NHAT-KY-THUC-HIEN.docx` theo mẫu của khoa. Mình không ước đoán thay mẹ.
- [ ] Xuất PDF và in một bản dự phòng.

## C. Tài khoản của mẹ (mình không có quyền)
- [ ] GitHub: đặt biến `PUBLIC_URL` = `https://meoi.onrender.com` (Settings → Secrets and variables → Actions → Variables) để mỗi lần deploy được tự kiểm tra.
- [ ] Dịch vụ giám sát (UptimeRobot hoặc tương tự) gọi `https://meoi.onrender.com/health` mỗi 5 phút, để app không ngủ.
- [ ] console.anthropic.com: còn credit và đã đặt **hạn mức chi tiêu hằng tháng**.
- [ ] (Tuỳ chọn) GitHub: secret `ANTHROPIC_API_KEY` và variable `ANTHROPIC_MODEL=claude-haiku-5-5` nếu muốn chạy evals trên GitHub.

## D. Diễn tập
- [ ] Chạy trọn kịch bản trong `kich-ban-demo.md` **hai lần** trên máy sẽ dùng để bảo vệ, bấm giờ.
- [ ] Thử phương án dự phòng: mở bản Artifact V28 và bộ ảnh `screenshots/`.
- [ ] Đọc phần "Câu hỏi hội đồng có thể hỏi" và sửa câu trả lời cho đúng giọng của mẹ.

## E. Điều mẹ nên cân nhắc nói với giảng viên hướng dẫn
- Nội dung y tế/tâm lý (kể cả kịch bản Tier 3 và danh sách từ khoá) **chưa có chuyên gia review**. Nếu thầy/cô có người quen phù hợp, đây là điều đáng hỏi.
- Quy định pháp lý khi lưu dữ liệu sức khoẻ của người dùng Việt Nam chưa được nghiên cứu (Open decision #5); báo cáo không khẳng định tuân thủ.

## Mốc quyết định (CLAUDE.md)
M4 đã xanh từ 30/10, nên không còn rủi ro phải bảo vệ bằng Artifact vì chưa deploy. Nếu tối 3/11 app công khai bị hỏng và không sửa kịp, dùng Artifact V28 và ảnh chụp, và trình bày repo như bản đang phát triển.
