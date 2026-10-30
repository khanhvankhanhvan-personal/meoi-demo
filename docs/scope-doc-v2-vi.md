# Ứng Dụng Đồng Hành Hậu Sản Cho Mẹ Việt — Scope Document (v2)

*Chỉ là tên tạm thời — tên làm việc: MeOi*

---

## Thay Đổi So Với V1 (Changelog)

- **Xưng hô:** chuyển mặc định từ "chị" sang "mẹ" — gần gũi hơn, tránh cảm giác formal/dịch vụ.
- **Xác nhận lại, không xây (đã cân nhắc kỹ và quyết định):**
  - *SaaS/monetization* — chưa có user nào để biết mô hình nào hợp lý; để beta định hình hướng đi, không đoán trước khi core bet (insight cốt lõi) chưa được xác nhận.
  - *Tài khoản multi-caregiver cho partner* — rủi ro giám sát: nếu partner có quyền xem check-in/chat của mẹ, tính năng này có thể trở thành công cụ kiểm soát trong đúng những trường hợp Entry #27 (CSAGA/Ngôi nhà Bình yên) được tạo ra để bảo vệ mẹ khỏi. Ý tưởng thay thế — kênh nội dung một chiều riêng cho partner ("làm sao để hỗ trợ vợ," không truy cập dữ liệu của mẹ) — được ghi nhận là ý tưởng tương lai, hoàn toàn tách biệt khỏi "tài khoản gia đình" đã loại bỏ, chưa scope.
- **Thêm vào Trong Scope — V1:** mẹ có thể xem lại lịch sử check-in của chính mình — dạng phản chiếu nhẹ nhàng, không phải biểu đồ/dashboard.
- **Làm rõ ranh giới nội dung về bé:** trả lời câu hỏi phản ứng ("điều này có bình thường với bé không, ngay lúc này") vẫn trong scope — đây là mở rộng của nội dung hiện có, không phải trụ nội dung mới (không trở thành baby-care encyclopedia). Dự đoán/gợi ý về phát triển tương lai của bé (developmental hints) thì KHÔNG trong scope — đòi hỏi ML personalization đã loại khỏi scope từ v1, và đủ specific để vượt qua lập trường non-diagnostic.
- **Insight bổ sung:** câu hỏi về tình trạng của bé thường chính là "cửa vào" thật sự khi mẹ mở app — không phải câu hỏi phụ tách biệt khỏi nhu cầu cảm xúc của mẹ. Xem mục bổ sung ngay dưới Insight Cốt Lõi.

---

## Vấn Đề Cốt Lõi (Problem Statement)

Một AI companion bằng tiếng Việt, giúp các bà mẹ lần đầu sinh con tại Việt Nam — trong những khoảnh khắc bị choáng ngợp bởi tất cả mọi thứ cùng lúc — hiểu được chuyện gì đang xảy ra với mình, biết rằng điều đó là bình thường, và nhìn ra bước tiếp theo nhỏ bé cần làm — mà không phải "dịch" sự thấu hiểu đó qua một ngôn ngữ nước ngoài, hay lọc nó qua hàng loạt lời khuyên mâu thuẫn và đầy phán xét.

## Đối Tượng Hướng Đến, Và Lý Do

- **Tiếng Việt** — tiếng mẹ đẻ giúp giảm cognitive load khi phải đối mặt với một lĩnh vực hoàn toàn mới. Các sản phẩm tốt hiện có không hỗ trợ tiếng Việt; các sản phẩm tiếng Việt hiện có thì không được thiết kế và xây dựng với sự chăm chút thật sự.
- **Mẹ lần đầu sinh con** — ít kinh nghiệm nhất, cảm giác liên tục đối mặt với những điều xa lạ mãnh liệt nhất, và mức độ dễ tổn thương tâm lý cao nhất trong các giai đoạn làm mẹ.
- **Tại Việt Nam** — v1 nhắm đến các mẹ đang sống trong nước, không phải cộng đồng diaspora. Đây có thể là thị trường tương lai, không phải mối quan tâm của v1.
- **Giai đoạn postpartum, cụ thể** — không phải giai đoạn mang thai, không phải giai đoạn nuôi con lớn hơn. *(Đây là quyết định còn để ngỏ, nêu rõ ở cuối tài liệu.)*
- **Vì sao là bây giờ** — áp lực thời hiện đại càng làm trầm trọng thêm sự dễ tổn thương này: ông bà ngày càng bận rộn hoặc không thể hỗ trợ nhiều, áp lực sự nghiệp chồng lên vai trò làm mẹ mới, chi phí sinh hoạt tăng trong khi thu nhập không theo kịp, và mạng xã hội tràn ngập những lời khuyên "phải thế này, phải thế kia" mâu thuẫn nhau cùng thông tin phản khoa học.

## Insight Cốt Lõi

Breaking point của một bà mẹ postpartum gần như không bao giờ đến từ một vấn đề duy nhất. Đó là sự **cộng dồn** của các yếu tố sinh học, thể chất và tâm lý ập đến cùng lúc. Điều này có nghĩa là nhiệm vụ của v1 không phải là trả lời đúng một câu hỏi — mà là giúp người mẹ gỡ rối xem chuyện gì đang xảy ra với mình *ngay lúc này*, xác nhận rằng điều đó là bình thường, và chỉ ra bước tiếp theo nhỏ nhất cần làm. Về bản chất, đây là một sản phẩm giảm tải cognitive và emotional load, không phải một công cụ tra cứu triệu chứng.

### Insight Bổ Sung — Cửa Vào Thực Tế (v2)

Trong phần lớn trường hợp, mẹ sẽ không mở app và gõ thẳng "em thấy mình không còn là mình" hay "em thấy cô đơn quá." Mẹ sẽ gõ một câu hỏi về bé — "con khóc suốt có sao không," "con không chịu ai bế ngoài mẹ," "con quấy khi bố đi làm về." Câu hỏi về bé thường là cửa vào thật sự; insight cốt lõi (cộng dồn các yếu tố, gỡ rối + xác nhận + bước nhỏ tiếp theo) vẫn là đích đến — chỉ là con đường dẫn vào thường bắt đầu từ bé, không phải từ mẹ trực tiếp. Hệ quả: nội dung cần nhiều "cửa vào" hơn dùng câu hỏi về bé để dẫn tới các insight về mẹ, không chỉ ở 2/7 scenarios hiện có (chi tiết trong content-framework-v2-vi.md).

## Các Tình Huống Thực Tế V1 Phải Giải Quyết

1. **Cơn khủng hoảng lúc 2 giờ sáng** — Em bé không chịu ngủ, mẹ đã nhiều ngày không được ngủ trọn giấc, và không biết đây là hành vi bình thường của trẻ sơ sinh hay có gì bất ổn. Các nhóm Facebook đưa ra mười câu trả lời mâu thuẫn nhau; các app tiếng Anh không nắm được ngữ cảnh hay bản năng của mẹ.
2. **Sự sụp đổ bản dạng (matrescence)** — Mẹ không còn nhận ra chính mình — cơ thể, vai trò, cảm xúc đều thay đổi. Mẹ cảm thấy tội lỗi khi tiếc nuối cuộc sống cũ trong khi vẫn yêu thương con, và không ai xung quanh gọi tên cảm giác này như một transition thực sự.
3. **Gánh nặng vô hình và sự cô lập** — Mọi người hỏi về em bé, không ai hỏi về mẹ. Chồng đã đi làm lại; mẹ ruột hoặc mẹ chồng áp đặt quan niệm "kiêng cữ" truyền thống mâu thuẫn với những gì mẹ đọc được. Xung quanh đầy người nhưng mẹ vẫn hoàn toàn cô đơn với những nghi hoặc của mình.
4. **Khủng hoảng áp lực cho con bú** — Việc cho con bú không diễn ra "tự nhiên" như những gì mẹ từng được nghe. Các kỹ thuật mâu thuẫn nhau và áp lực "sữa mẹ là tốt nhất" biến một vấn đề phổ biến, có thể giải quyết được, thành một thất bại cá nhân trong đầu mẹ.
5. **Quá tải giác quan / "touched out"** — Sau một ngày dài liên tục bị chạm vào và cần đến, mẹ chỉ muốn thoát khỏi chính cơ thể mình, mà không có ngôn từ nào để diễn tả cảm giác đó ngoài việc nghĩ "chắc mình có vấn đề gì đó mới cảm thấy thế này."
6. **Cơ thể đang hồi phục bị lãng quên** — Mẹ vẫn đang hồi phục thể chất (vết khâu tầng sinh môn hoặc sinh mổ, ra máu, v.v.) nhưng mọi cuộc trò chuyện đều xoay quanh em bé. Mẹ không chắc đâu là dấu hiệu hồi phục bình thường, đâu là dấu hiệu cảnh báo, và không muốn hỏi vì sợ bị cho là làm quá.
7. **Căng thẳng trong mối quan hệ** — Thiếu ngủ và kiệt sức, những bất đồng nhỏ với bạn đời leo thang nhanh chóng, và mẹ không biết đây là căng thẳng bình thường của giai đoạn này hay là dấu hiệu của vấn đề thực sự.
8. **Áp lực tiền bạc và quay lại công việc** *(thêm ở v2.1)* — Chi phí nuôi con tăng đúng lúc thu nhập của mẹ giảm hoặc mất hẳn. Mẹ thót tim trước giá sữa, tã, viện phí, lo vị trí công việc của mình đã thay đổi khi vắng mặt, rồi tự trách mình. Mẹ dễ giấu nỗi lo này vì thấy nó "không phải chuyện cảm xúc". v1 chỉ xác nhận gánh nặng này là có thật, không đưa lời khuyên tài chính cụ thể, và khuyến khích mẹ nói ra với người thân tin cậy.

*Bất cứ điều gì v1 xây dựng đều phải bắt nguồn từ một trong tám tình huống này. Nếu không, đó không phải là v1.*

## Trong Scope — V1

- Giao diện và nội dung hoàn toàn bằng tiếng Việt (chưa cần hỗ trợ tiếng Anh)
- Một bước intake ngắn để guidance phù hợp với giai đoạn của mẹ (ví dụ: tuần thứ mấy sau sinh)
- Một check-in định kỳ nhanh: tâm trạng, giấc ngủ, hồi phục thể chất, yếu tố gây căng thẳng lớn nhất
- **Mẹ có thể xem lại lịch sử check-in của chính mình** — dạng phản chiếu nhẹ nhàng (ví dụ: "mình thấy mẹ đã mệt vài ngày liền"), không phải biểu đồ/dashboard clinical *(mới, v2)*
- Một AI chat companion theo yêu cầu — ấm áp, xác nhận cảm xúc, dựa trên nội dung đã được curate
- AI được xây dựng trên một LLM có sẵn với system prompt tiếng Việt mạnh + nội dung đã curate được nhúng trực tiếp (không cần train custom model, không cần vector database ở quy mô này)
- Một yếu tố "đồng cảm nhẹ" (peer-normalization): các đoạn nội dung **được viết sẵn, ẩn danh** kiểu "nhiều mẹ khác cũng từng cảm thấy vậy," gắn với chủ đề check-in
- Một hard-coded safety rule: ngôn ngữ red-flag / khủng hoảng (ý nghĩ tự làm hại bản thân hoặc em bé, triệu chứng nghiêm trọng) lập tức hiển thị thông tin liên hệ khẩn cấp/hotline thật, không có ngoại lệ
- Lập trường rõ ràng non-diagnostic với bất cứ điều gì liên quan y tế thể chất — companion sẽ hướng mẹ đến bác sĩ thật thay vì trả lời dứt khoát
- Beta trực tiếp quy mô nhỏ: 3-5 mẹ đáng tin cậy mà bạn quen biết, có kênh feedback trực tiếp với bạn

## Ngoài Scope — Có Chủ Đích, Tạm Thời

- Nhắn tin peer trực tiếp, forum, hoặc bất kỳ nội dung do user tạo ra (gánh nặng moderation và an toàn mà bạn chưa cần đến lúc này)
- Câu trả lời y tế mang tính chẩn đoán hoặc dứt khoát dưới bất kỳ hình thức nào
- **Dự đoán/gợi ý về phát triển tương lai của bé** (developmental hints) — khác với trả lời "điều này có bình thường không ngay lúc này," cái này đòi hỏi ML personalization và đủ specific để vượt qua lập trường non-diagnostic *(làm rõ, v2)*
- Tài khoản nhiều con, nhiều người chăm sóc, hoặc tài khoản gia đình — *đã cân nhắc lại (v2): rủi ro giám sát trong các mối quan hệ không an toàn là lý do chính, không chỉ độ phức tạp kỹ thuật*
- Payment hoặc monetization — *đã cân nhắc lại (v2): nên để beta xác nhận core bet trước khi định hình mô hình*
- Đặt lịch telehealth hoặc kết nối với chuyên gia thật
- Cá nhân hóa sâu bằng ML ngoài phạm vi LLM + nội dung đã curate
- Hỗ trợ tiếng Anh hoặc thị trường diaspora
- Growth mechanics: push notification, streak, gamification

## Điều Kiện Thành Công Cho V1 (Win Condition)

Một beta trực tiếp quy mô nhỏ với signup thật (3-5 mẹ đáng tin cậy), không chỉ là một bản demo — sử dụng đủ nhiều để bạn thấy được điều gì khiến họ bối rối, hoặc họ hỏi điều gì mà nội dung hiện tại chưa đề cập.

## Một Quyết Định Còn Để Ngỏ — Cần Bạn Xác Nhận

Toàn bộ nội dung trên giả định **chỉ tập trung vào giai đoạn postpartum**, dựa trên hướng đi mà cuộc trò chuyện của chúng ta đã hội tụ về. Định hướng ban đầu của bạn rộng hơn ("mang thai, sinh nở, nuôi dạy một con người"). Thu hẹp phạm vi về postpartum giúp v1 khả thi trong 10 giờ/tuần — nhưng nếu hỗ trợ giai đoạn prenatal thực sự là cốt lõi trong tầm nhìn của bạn, đây là lúc cần quyết định, trước khi bắt đầu curate nội dung, chứ không phải giữa chừng quá trình xây dựng.

*(Chưa được nhắc lại/quyết định trong v2 — vẫn còn để ngỏ.)*
