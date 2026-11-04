# Kịch bản demo và chuẩn bị bảo vệ (cập nhật 4/11/2026)

Địa chỉ app: **https://meoi.onrender.com** (gói miễn phí, có thể "ngủ"). Mã nguồn: repo GitHub `meoi-demo`.
Thời lượng demo gợi ý: **4 phút** trong buổi nói 15 phút. Mẹ chỉnh theo thời gian hội đồng cho.
Ảnh dự phòng mới nhất nằm ở `docs/defense/screenshots-final/` (14 ảnh) và sơ đồ ở `docs/defense/diagrams/`.

## 1. Trước giờ bảo vệ

- [ ] Mở https://meoi.onrender.com/health, thấy `{"status":"ok",...}` và mã commit khớp với `main` trên GitHub.
- [ ] console.anthropic.com: còn credit và đã đặt hạn mức chi tiêu (một buổi demo tốn vài xu).
- [ ] GitHub, tab Actions: lần chạy CI gần nhất của `main` đang xanh.
- [ ] Chạy thử kịch bản dưới đây một lần trên **chính chiếc máy sẽ dùng khi bảo vệ**.
- [ ] Sạc đầy máy; mở sẵn 3 tab: app, trang Actions, file báo cáo PDF; mở sẵn file slide và ảnh dự phòng.
- [ ] **10 phút trước khi vào:** mở app và đợi nó tải xong (nếu đang ngủ mất khoảng 1 phút), làm một lượt chat để chắc đã thức. Tắt thông báo.

## 2. Kịch bản demo (làm theo thứ tự, mỗi bước 20-30 giây)

Dùng chế độ **khách** (không cần tài khoản) cho các bước 1-8; bước 9 là tuỳ chọn.

| # | Thao tác | Nói gì |
|---|---|---|
| 1 | Màn chào mừng → **Làm quen cùng Mẹ Ơi!** | "Mẹ Ơi! là bạn đồng hành tiếng Việt cho mẹ lần đầu sinh con. Mẹ ở trung tâm, bé là chủ đề để hỗ trợ mẹ." |
| 2 | **Trải nghiệm sinh**: 1 bé, Lần đầu làm mẹ, **Sinh mổ chủ động**, **Còn đau nhức vết mổ/khâu** → Tiếp tục | "Mình hỏi về chính cuộc sinh và sự hồi phục của mẹ, không chỉ về bé. Câu trả lời này đi vào ngữ cảnh của AI." |
| 3 | Ngày sinh: bấm **8 tuần trước**, gõ tên **Bắp** → xem thẻ tuổi | "Thẻ này nói giai đoạn của bé và của mẹ bằng một câu. Tuổi hiện bằng tuần và tháng như mẹ vẫn nói." |
| 4 | Cách ti: **Ti mẹ trực tiếp**, **Bú mẹ hoàn toàn** → bước cuối: chọn **Lắng nghe lúc 2h sáng** → **Mẹ hãy ghi nhận trạng thái cơ thể lúc này nhé** | "Năm bước, khoảng một phút." |
| 5 | Cửa sổ **Hôm nay mẹ ổn không?**: **Kiệt sức**, **Đứt quãng**, **Mỏi cổ vai gáy**, **Cho con bú**, gõ một dòng ghi chú → **Lưu check-in này** | "Chỉ vài chạm. Bước này sinh ra câu mở đầu cá nhân hoá." |
| 6 | Trong chat gõ: **"Con em hay thức đêm, em kiệt sức quá"**. Bấm biểu tượng **Lưu lại câu trả lời** trên một bong bóng | "Câu trả lời đi thẳng vào việc, không chào lại. Mẹ tự quyết lưu điều gì; hệ thống không lưu hội thoại." |
| 7 | Gõ: **"Có lúc em nghĩ nếu em biến mất thì mọi thứ sẽ dễ hơn"** | "Phần quan trọng nhất. Câu này **không** tới AI: server so khớp từ khoá trước, trả kịch bản cố định và banner. Banner không tự tắt, không cho lưu, không có gợi ý nhanh." |
| 8 | Bấm nút **Hỗ trợ** ở đầu màn hình | "Số điện thoại luôn cách một chạm. Trạng thái 'Ngoài giờ' của HOPE tính ở server theo giờ Việt Nam, ngoài giờ app nói rõ gọi 115, không hứa 24/7." |
| 9 | *(Tuỳ chọn, 45 giây)* **Nhật ký & Đã lưu** → xem tóm tắt 7 ngày và mục đã lưu. Nếu còn thời gian: Hồ sơ → **Tạo tài khoản** (nickname + PIN) → hiện **mã khôi phục** → Cài đặt → **Bộ nhớ** | "Có tài khoản thì dữ liệu ở lại trong cơ sở dữ liệu. Bộ nhớ chỉ lưu khi mẹ đồng ý, và mẹ xoá được." **Sau demo: Cài đặt → Xoá tài khoản** để không để lại dữ liệu thử. |
| 10 | Chuyển sang trang GitHub Actions | "Mỗi thay đổi qua kiểm tra tự động: 234 test server, 64 test giao diện, dựng ảnh, chạy thử cả hệ thống trên PostgreSQL thật, rồi mới tự triển khai." |

**Đừng làm khi demo:** nhập thông tin thật của ai; tải lại trang khi đang là khách (mất dữ liệu đã nhập); bấm "Đăng xuất" trước khi mẹ ghi lại mã khôi phục nếu đang demo tài khoản.

## 3. Nếu có sự cố

| Sự cố | Cách xử lý |
|---|---|
| App chậm, quay mãi (đang ngủ) | Nói thẳng: "Đây là gói hosting miễn phí, em đã chuẩn bị trước." Chuyển sang ảnh trong `screenshots-final/` hoặc phụ lục slide trong lúc chờ. |
| Chat báo "Mình chưa trả lời được lúc này" | Đó là phản hồi lỗi có chủ đích (kèm hướng dẫn bấm nút Hỗ trợ): hết credit hoặc mạng yếu. Vẫn demo được bước 7 (không cần AI) và bước 8. |
| Mất mạng hoàn toàn | Dùng phụ lục slide và ảnh chụp. Nói rõ đó là ảnh từ bản chạy thật. |
| Hội đồng muốn xem code | Mở GitHub: `backend/app/safety.py`, `backend/app/scripts.py`, `backend/app/chat.py`, `docs/adr/`. |

## 4. Câu hỏi hội đồng có thể hỏi (trả lời trung thực)

1. **Vì sao không để AI trả lời mọi thứ, kể cả khủng hoảng?** Với tình huống nguy hiểm, phản hồi sai hoặc chậm gây hại nghiêm trọng, nên tầng an toàn nằm ở server, chạy trước AI và không phụ thuộc vào việc mô hình "nhớ" làm đúng. Khi đánh giá chế độ chỉ-AI, mô hình tự thêm hướng dẫn xử trí ở Tier 3, trái nguyên tắc "không tự trả lời nội dung"; đó là lý do cần kịch bản cố định.
2. **Từ khoá có bắt hết không?** Không. Danh sách đã mở rộng và được duyệt, nhưng chưa đo độ phủ trên dữ liệu thật; còn 15 cách nói chưa bắt, đang chờ em duyệt. Nếu từ khoá bỏ sót, mô hình vẫn có thể gắn Tier 3, nhưng đó là lớp thứ hai, không phải bảo đảm.
3. **Sản phẩm có chẩn đoán không?** Không, đó là ràng buộc thiết kế. Về y tế chỉ mô tả điều phổ biến rồi hướng mẹ tới bác sĩ.
4. **Dữ liệu của mẹ được lưu thế nào, có an toàn không?** Hội thoại không bao giờ lưu ở server; log chỉ ghi sự kiện và mã người dùng ẩn danh, không ghi nội dung. Mẹ có tài khoản thì hồ sơ, ghi nhận, ghi chú đã lưu và bộ nhớ nằm trong PostgreSQL; PIN và mã khôi phục chỉ lưu dạng băm argon2id; mẹ xoá được từng mục hoặc cả tài khoản. Tin nhắn vẫn được gửi tới nhà cung cấp mô hình. **Em chưa nghiên cứu quy định pháp lý** về dữ liệu sức khoẻ của người dùng Việt Nam nên không khẳng định tuân thủ.
5. **Đã có người dùng thật dùng chưa? Hiệu quả thế nào?** Chưa chạy thử với mẹ thật, nên **chưa thể kết luận về hiệu quả**. Beta 3-5 mẹ là bước tiếp theo.
6. **Nội dung có chuyên gia y tế kiểm duyệt không?** Chưa. Nội dung dựa trên nguồn WHO, ACOG, Mayo Clinic nhưng chưa có người duyệt; câu mô tả giai đoạn của bé, khung cảnh báo y tế và vài mục về tiền bạc/đi làm lại là bản nháp. Em xếp việc này là điều kiện trước beta.
7. **Vì sao chọn Haiku? Chi phí bao nhiêu?** Rẻ nhất, đã đo khoảng 6.000 token vào mỗi lượt, tức khoảng 0,001-0,002 USD mỗi lượt (ước tính từ bảng giá, chưa đối chiếu hoá đơn). Mỗi lần đổi mô hình hoặc prompt phải chạy lại bài kiểm tra Tier.
8. **Em đã dùng AI như thế nào khi làm?** Claude Design cho prototype, Claude Code cho phần còn lại; em quyết định phạm vi, duyệt từ khoá, chọn hosting, và đọc, chấm kết quả đánh giá. Mỗi thay đổi đi qua pull request và kiểm tra tự động; quyết định kỹ thuật ghi trong 7 ADR; thay đổi về an toàn và nội dung cần em duyệt.
9. **Điểm yếu lớn nhất hiện tại?** (a) Chưa có chuyên gia duyệt nội dung. (b) Chưa thử với mẹ thật. (c) Lần thay đổi prompt gần nhất (trả lời thẳng, ngữ cảnh hồ sơ, bộ nhớ) chưa được em chấm lại. (d) Hosting và cơ sở dữ liệu miễn phí: có thể ngủ khoảng 1 phút, cơ sở dữ liệu miễn phí bị xoá sau 30 ngày kể từ lúc tạo.
10. **Mở rộng thế nào?** Kiến thức đang nhúng thẳng vào prompt (35 mục), đủ cho quy mô này nhưng sẽ cần truy xuất theo giai đoạn khi kho nội dung lớn. Hướng tiếp theo: chọn kiến thức theo giai đoạn của bé và của mẹ, và bộ nhớ cho cả hành trình của mẹ (đi làm lại, con đi học, việc nhà, tài chính).

## 5. Những điều **không** nên nói
- Không nói "đã được kiểm chứng lâm sàng", "đã có người dùng", "tuân thủ pháp luật" hay "an toàn tuyệt đối".
- Không nói "24/7" về đường dây hỗ trợ: HOPE chỉ mở 16:30-20:30, ngoài giờ app hướng tới 115.
- Không khẳng định hiệu quả của mô hình quá phạm vi 7 kịch bản đã chạy (mỗi kịch bản một lần mỗi chế độ).
- Không nói bộ nhớ hay phần "mẹ ở trung tâm" đã được mẹ thật đánh giá: đó là thiết kế, chưa phải kết quả.
