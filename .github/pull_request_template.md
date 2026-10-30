## Thay đổi gì và vì sao
<!-- 1-3 dòng. Nếu từ phiếu phản hồi, ghi số: #12 -->

## Làn
- [ ] **A. Giao diện** (chữ, màu, bố cục; không đổi dữ liệu hay nội dung y tế)
- [ ] **B. Hành vi** (dữ liệu, endpoint, tính năng mới)
- [ ] **C. An toàn và nội dung** (từ khoá Tier 3, kịch bản, prompt, model, số điện thoại, nội dung y tế) — **chỉ Vân merge**

## Cách kiểm tra
<!-- Ảnh trước/sau cho Làn A; tiêu chí chấp nhận đã duyệt cho Làn B; báo cáo evals cho Làn C -->

## Danh sách kiểm tra
- [ ] CI xanh
- [ ] Có test mới hoặc test đã cập nhật cho thay đổi này
- [ ] Không ghi nội dung tin nhắn vào log; không lưu hội thoại ở server
- [ ] Tier 3 không qua LLM, không ghim được, nút Hỗ trợ vẫn có ở mọi màn hình
- [ ] Không có bí mật (khoá API, mật khẩu) trong thay đổi

### Chỉ cho Làn C
- [ ] Đã thêm câu vào `backend/tests/data/safety_golden.json` **trước** khi sửa code
- [ ] Đã chạy 7 evals ở cả hai chế độ và Vân đã chấm tất cả "đạt"
- [ ] Đã có ADR ghi quyết định và đánh đổi
