# Kịch bản demo và chuẩn bị bảo vệ (4/11/2026)

Địa chỉ app: **https://meoi.onrender.com** (gói miễn phí, có thể "ngủ"). Mã nguồn: repo GitHub `meoi-demo`.
Thời lượng demo gợi ý: **5–7 phút**. Mẹ chỉnh theo thời gian hội đồng cho.

## 1. Trước giờ bảo vệ

**Từ tối 3/11**
- [ ] Mở https://meoi.onrender.com/health, thấy `{"status":"ok",...}`.
- [ ] Vào console.anthropic.com kiểm tra còn credit (một buổi demo tốn vài xu) và đã đặt hạn mức chi tiêu.
- [ ] Trên GitHub, tab Actions: lần chạy CI gần nhất của `main` đang xanh (để chiếu nếu hội đồng hỏi).
- [ ] Chạy thử toàn bộ kịch bản dưới đây một lần trên **chính chiếc máy sẽ dùng khi bảo vệ**.
- [ ] Sạc đầy máy, tải sẵn: báo cáo PDF, ảnh chụp màn hình trong `docs/defense/screenshots/`.

**Sáng 4/11, 10 phút trước khi vào**
- [ ] Mở https://meoi.onrender.com và **đợi nó tải xong** (nếu app đang ngủ sẽ mất ~1 phút). Làm một lượt chat để chắc chắn đã thức.
- [ ] Để sẵn 3 tab: app, trang CI trên GitHub, báo cáo. Tắt thông báo.
- [ ] Mở sẵn bản Artifact V28 (phương án dự phòng).

## 2. Kịch bản (làm theo thứ tự)

| # | Thao tác | Nói gì |
|---|---|---|
| 1 | Chiếu màn hình giới thiệu | "MeOi! là bạn đồng hành tiếng Việt cho mẹ lần đầu sinh con. Điểm gãy của một mẹ hiếm khi là một vấn đề riêng lẻ mà là sự cộng dồn: thiếu ngủ, cô lập, áp lực cho con bú, tiền bạc." |
| 2 | Bấm "Bỏ qua" → intake: **1 bé**, ngày sinh cách đây ~6 tuần, **Sinh mổ**, sữa mẹ, lần đầu | "Hồ sơ này đi vào ngữ cảnh của chatbot, nên câu trả lời hợp với giai đoạn của mẹ." |
| 3 | Trang chủ: chỉ vào thẻ "Tuần 7" và mẹo | "Nội dung theo tuần sau sinh, ở thì hiện tại, không dự đoán tương lai." |
| 4 | Check-in: chọn **Mệt** + **Cho con bú** → "Lưu check-in" | "Chỉ vài chạm là xong. Bước này sinh ra câu mở đầu cá nhân hoá." |
| 5 | Chat, gõ: **"Con em hay thức đêm, em kiệt sức quá"** | "Câu này đi qua LLM. Chú ý ngắn gọn, xưng 'mình - mẹ', và nó biết mẹ vừa sinh mổ 6 tuần." |
| 6 | Bấm 📌 trên một câu trả lời → vào tab Lịch sử → Ghi chú | "Mẹ tự quyết lưu điều gì. Hệ thống không lưu hội thoại." |
| 7 | Chat, gõ: **"Có lúc em nghĩ nếu em biến mất thì mọi thứ sẽ dễ hơn"** | "Đây là phần quan trọng nhất. Câu này **không** tới LLM: server so khớp từ khoá trước, trả kịch bản cố định và banner khủng hoảng. Banner không tự tắt, **không có nút ghim, không có gợi ý nhanh**." |
| 8 | Bấm nút **Hỗ trợ** ở đầu màn hình | "Số điện thoại luôn cách một chạm, kể cả khi mất mạng. Trạng thái 'Đang mở/Ngoài giờ' của HOPE tính ở server theo giờ Việt Nam, và ngoài giờ app nói rõ gọi 115, không hứa hỗ trợ 24/7." |
| 9 | Chuyển sang trang GitHub Actions | "Mỗi thay đổi đều qua kiểm tra tự động: 98 test backend, 29 test frontend, dựng image, chạy thử cả hệ thống, rồi mới tự triển khai." |
| 10 | Mở báo cáo, mục Đánh giá kết quả | "Em chạy 7 kịch bản kiểm thử thật và ghi lại cả lỗi: lần đầu có câu bị cắt cụt do mô hình dùng hết giới hạn token khi 'suy nghĩ', em đã sửa và thêm test." |

**Đừng làm khi demo:** đăng nhập/đăng ký (chưa có), tải lại trang (mất hết dữ liệu hiện có), nhập thông tin thật của ai.

## 3. Nếu có sự cố

| Sự cố | Cách xử lý |
|---|---|
| App chậm, quay mãi (đang ngủ) | Nói thẳng: "Đây là gói hosting miễn phí, em đã chuẩn bị trước." Chuyển sang ảnh chụp trong `docs/defense/screenshots/` trong lúc chờ, rồi quay lại. |
| Chat báo "Mình chưa trả lời được lúc này" | Đó là phản hồi lỗi có chủ đích (kèm hướng dẫn bấm nút Hỗ trợ). Hết credit hoặc mạng yếu. Vẫn demo được bước 7 (Tier 3 không cần LLM) và bước 8. |
| Mất mạng hoàn toàn | Dùng bản Artifact V28 và ảnh chụp màn hình. Nói rõ đó là prototype, bản thật nằm trên GitHub. |
| Hội đồng muốn xem code | Mở GitHub: `backend/app/safety.py`, `backend/app/scripts.py`, `docs/adr/`. |

## 4. Câu hỏi hội đồng có thể hỏi (trả lời trung thực)

1. **Vì sao không để AI trả lời mọi thứ, kể cả khủng hoảng?** Vì với tình huống nguy hiểm, phản hồi sai hoặc chậm gây hại nghiêm trọng. Nên tầng an toàn nằm ở server, chạy trước LLM và không phụ thuộc vào việc mô hình "nhớ" làm đúng. Khi đánh giá chế độ chỉ-LLM, mô hình tự thêm hướng dẫn xử trí ở Tier 3, trái nguyên tắc "không tự trả lời nội dung"; đó là lý do cần tầng kịch bản.
2. **Từ khoá có bắt hết không?** Không. Danh sách đã mở rộng (và được duyệt) nhưng chưa đo độ phủ trên dữ liệu thật. Nếu từ khoá bỏ sót, mô hình vẫn gắn tag Tier 3 (đã thử ở case drift), nhưng đó là lớp thứ hai, không phải bảo đảm.
3. **Sản phẩm có chẩn đoán không?** Không, đó là ràng buộc thiết kế. Với y tế chỉ mô tả điều phổ biến rồi hướng tới bác sĩ.
4. **Dữ liệu của mẹ được lưu thế nào, có an toàn không?** Hiện không lưu gì ở server: hội thoại chỉ ở trình duyệt, log chỉ ghi tier và giờ, không ghi nội dung. Tin nhắn vẫn được gửi tới nhà cung cấp LLM. **Em chưa nghiên cứu quy định pháp lý** về dữ liệu sức khoẻ của người dùng Việt Nam nên không khẳng định tuân thủ.
5. **Đã có người dùng thật dùng chưa? Hiệu quả thế nào?** Chưa chạy beta, nên **chưa thể kết luận về hiệu quả thực tế**. Điều kiện thành công của v1 là beta 3–5 mẹ, là bước tiếp theo.
6. **Nội dung có chuyên gia y tế kiểm duyệt không?** Chưa. Nội dung dựa trên nguồn WHO, ACOG, Mayo Clinic, PSI nhưng chưa có reviewer; 3 entry về tiền bạc/đi làm lại là bản nháp. Em xếp việc này là điều kiện trước beta.
7. **Vì sao chọn Haiku? Chi phí bao nhiêu?** Rẻ nhất, đã đo ~6.000 token vào mỗi lượt, khoảng 0,001–0,002 USD/lượt (ước tính từ bảng giá). Em đánh giá bằng 7 kịch bản và chuyển lên mô hình lớn hơn nếu trượt. Mỗi lần đổi mô hình phải chạy lại evals.
8. **Em đã dùng AI như thế nào khi làm?** Claude Design cho prototype, Claude Code cho backend, giao diện, CI và triển khai; em quyết định phạm vi, duyệt danh sách từ khoá, chọn hosting, và đọc/chấm kết quả đánh giá. Mọi quyết định kỹ thuật được ghi trong 5 ADR.
9. **Điểm yếu lớn nhất hiện tại?** (a) Chưa có chuyên gia review. (b) Chưa beta. (c) Chưa có đăng nhập và database: dữ liệu mất khi tải lại. (d) Hosting miễn phí có thể ngủ ~1 phút.
10. **Mở rộng thế nào?** Nội dung đang nhúng thẳng vào prompt (35 entries), đủ cho quy mô này nhưng không mở rộng được khi kho nội dung lớn; sẽ cần retrieval. Đăng nhập ẩn danh (nickname + PIN) và database là M5.

## 5. Những điều **không** nên nói
- Không nói "đã được kiểm chứng lâm sàng", "đã có người dùng", "tuân thủ pháp luật" hay "an toàn tuyệt đối".
- Không nói "24/7": HOPE chỉ mở 16:30–20:30, ngoài giờ app hướng tới 115.
- Không khẳng định hiệu quả của mô hình quá phạm vi 7 kịch bản đã chạy (mỗi kịch bản một lần).
