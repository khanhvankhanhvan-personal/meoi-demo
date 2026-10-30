# Mẹ Ơi! (MeOi!) — Ứng Dụng Đồng Hành Hậu Sản Cho Mẹ Việt — Scope Document (v3)

*Cập nhật 30/10/2026 để khớp prototype "Mẹ Ơi!" v28 và các quyết định Vân đã ghi nhận. v2 ghi "Chỉ là tên tạm thời — tên làm việc: MeOi"; v3: prototype đang dùng "Mẹ Ơi!" làm tên hiển thị và "MeOi!" làm tên dự án. `[THIẾU]` chưa có ghi nhận chính thức rằng đây là tên cuối cùng.*

**Quy ước nhãn:** `[NGUỒN: …]` = trích từ file gốc, có vị trí. `[SUY LUẬN]` = suy luận của người soạn. `[MÂU THUẪN]` = hai nguồn không khớp. `[THIẾU]` = chưa có bằng chứng. *"dòng N" = số dòng trong template đã decode của prototype v28 (`decoded_template.txt`, trích từ `meoi.html`). "Ghi nhớ của Vân" = thông tin Vân đã nói trong các phiên trước, lưu trong bộ nhớ của Project.*

---

## Thay Đổi So Với V2 (Changelog v3)

| # | Thay đổi | Bằng chứng (trích đoạn → vị trí) |
|---|---|---|
| 1 | **Intake mở rộng:** từ "một bước intake ngắn (tuần thứ mấy sau sinh)" thành 3 bước: số bé (1 hoặc đa thai 2–4) → ngày sinh bé → chi tiết (cách sinh, cách cho bú từng bé, lần đầu/không). | v2: *"Một bước intake ngắn … (ví dụ: tuần thứ mấy sau sinh)"*; prototype: *"Đa thai (sinh đôi / sinh ba…)"* ở màn intake0, nút +/– giới hạn 2–4 bé; *"Con sinh ngày nào?"* ở intake1 (prototype, màn intake0/1/2; mô tả ở build spec §3.4) |
| 2 | **Check-in được định nghĩa cụ thể:** tâm trạng (chọn nhiều, 5 lựa chọn, bắt buộc), giấc ngủ (chọn 1, 3 lựa chọn), cơ thể (chọn nhiều, 3 lựa chọn), áp lực (chọn nhiều, 8 lựa chọn); một bản ghi/ngày, bản mới thay bản cũ. Có "check-in nhanh" chỉ gồm tâm trạng từ Trang chủ. | v2: *"tâm trạng, giấc ngủ, hồi phục thể chất, yếu tố gây căng thẳng lớn nhất"*; prototype `MOODS/SLEEPS/BODIES/STRESSORS` (dòng 780–807) |
| 3 | **Lịch sử check-in = nhật ký dạng lịch + Ghi chú (ghim 📌).** Mẹ ghim một câu trả lời của AI → lưu thành ghi chú kèm câu hỏi trước đó; không ghim được tin Tier 3. | v2: *"xem lại lịch sử check-in … không phải biểu đồ"*; prototype `canSave: !(m.tier … indexOf("3") === 0)` → dòng 1360 |
| 4 | **Trang chủ có "hero" theo tuần sau sinh + thanh hồi phục 56 ngày + mẹo ngày + gợi ý câu hỏi theo check-in.** Thuộc "proactive trong cuộc trò chuyện/trong app", không phải thông báo đẩy. | Build spec §4.2 (hero: `daysOld / 56`); onboarding: *"hỏi thăm khi mẹ mệt vài ngày liền"* → dòng 821 |
| 5 | **Thêm "Người thân tin cậy"** (mẹ tự nhập tên/số, hiện trong mục Hỗ trợ). Không cho người đó xem dữ liệu của mẹ. | *"Người thân tin cậy"* → dòng 616, 1324 |
| 6 | **Chat có 2 lớp:** kịch bản cố định cho một số cụm từ (đặc biệt Tier 3) chạy trước, LLM xử lý phần còn lại. | `const id = forced \|\| this.match(text)` → dòng 1203 (xem system-prompt v3, mục 3) |
| 7 | **Guest-first + nudge tạo tài khoản:** dùng được không cần tài khoản; sau 2 tương tác thì hiện lời mời tạo tài khoản một lần. | `const nudge = !st.account && !st.nudgeShown && e >= 2` (build spec §4.6) |
| 8 | **Khối "Quyết định kỹ thuật & mốc thời gian" mới** (từ ghi nhớ của Vân): React + FastAPI, đăng nhập nickname + PIN, database, bảo vệ đồ án 4/11/2026. | Ghi nhớ của Vân — mục "Quyết định kỹ thuật" bên dưới |
| 9 | **Hai mâu thuẫn mới giữa scope v2 và prototype** (mục "Mâu thuẫn cần xử lý"): đa thai vs "tài khoản nhiều con"; "Đặt lịch hẹn với bác sĩ" vs "telehealth ngoài scope". | Mục "Mâu thuẫn cần xử lý" |
| 10 | **Phát hiện 1 khoảng trống mới:** áp lực tiền bạc không thuộc 7 scenarios nhưng đã có trong check-in và mẹo. | Mục "Khoảng trống" |
| 11 | **Làm rõ "proactive" và push notification** theo hướng dẫn dự án: proactive = *trong* cuộc trò chuyện; outbound/push vẫn là câu hỏi tách rời, chưa quyết. | Hướng dẫn dự án MeOi!: *"NOT proactive outbound messaging/push notifications. Outbound proactivity is a deliberately separate, undecided future question"* |

## Thay Đổi V2 So Với V1 (giữ lại để theo dõi lịch sử)

- **Xưng hô:** chuyển mặc định từ "chị" sang "mẹ" — gần gũi hơn, tránh cảm giác formal/dịch vụ.
- **Xác nhận lại, không xây (đã cân nhắc kỹ và quyết định):**
  - *SaaS/monetization* — chưa có user nào để biết mô hình nào hợp lý; để beta định hình hướng đi, không đoán trước khi core bet chưa được xác nhận.
  - *Tài khoản multi-caregiver cho partner* — rủi ro giám sát: nếu partner có quyền xem check-in/chat của mẹ, tính năng này có thể trở thành công cụ kiểm soát trong đúng những trường hợp Entry #27 (CSAGA/Ngôi nhà Bình yên) được tạo ra để bảo vệ mẹ khỏi. Ý tưởng thay thế — kênh nội dung một chiều riêng cho partner — được ghi nhận là ý tưởng tương lai, hoàn toàn tách biệt khỏi "tài khoản gia đình" đã loại bỏ, chưa scope.
- **Thêm vào Trong Scope — V1:** mẹ có thể xem lại lịch sử check-in của chính mình — dạng phản chiếu nhẹ nhàng, không phải biểu đồ/dashboard.
- **Làm rõ ranh giới nội dung về bé:** trả lời câu hỏi phản ứng ("điều này có bình thường với bé không, ngay lúc này") vẫn trong scope — không trở thành baby-care encyclopedia. Dự đoán/gợi ý về phát triển tương lai của bé thì KHÔNG trong scope.
- **Insight bổ sung:** câu hỏi về tình trạng của bé thường chính là "cửa vào" thật sự khi mẹ mở app.

---

## Vấn Đề Cốt Lõi (Problem Statement)

Một AI companion bằng tiếng Việt, giúp các bà mẹ lần đầu sinh con tại Việt Nam — trong những khoảnh khắc bị choáng ngợp bởi tất cả mọi thứ cùng lúc — hiểu được chuyện gì đang xảy ra với mình, biết rằng điều đó là bình thường, và nhìn ra bước tiếp theo nhỏ bé cần làm — mà không phải "dịch" sự thấu hiểu đó qua một ngôn ngữ nước ngoài, hay lọc nó qua hàng loạt lời khuyên mâu thuẫn và đầy phán xét.

## Đối Tượng Hướng Đến, Và Lý Do

- **Tiếng Việt** — tiếng mẹ đẻ giúp giảm cognitive load khi phải đối mặt với một lĩnh vực hoàn toàn mới. Các sản phẩm tốt hiện có không hỗ trợ tiếng Việt; các sản phẩm tiếng Việt hiện có thì không được thiết kế và xây dựng với sự chăm chút thật sự.
- **Mẹ lần đầu sinh con** — ít kinh nghiệm nhất, cảm giác liên tục đối mặt với những điều xa lạ mãnh liệt nhất, và mức độ dễ tổn thương tâm lý cao nhất trong các giai đoạn làm mẹ. *(v3: prototype vẫn nhận mẹ "không phải lần đầu" — câu hỏi parity có lựa chọn "Không phải, mình còn có bé khác" — và system prompt đổi sang "đã từng sinh con trước đó"; không chặn người dùng. `[SUY LUẬN]` nên ghi rõ: nhắm đến mẹ lần đầu nhưng không loại mẹ khác.)*
- **Tại Việt Nam** — v1 nhắm đến các mẹ đang sống trong nước, không phải cộng đồng diaspora.
- **Giai đoạn postpartum, cụ thể** — không phải giai đoạn mang thai, không phải giai đoạn nuôi con lớn hơn. *(Quyết định còn để ngỏ — xem cuối tài liệu.)*
- **Vì sao là bây giờ** — áp lực thời hiện đại càng làm trầm trọng thêm sự dễ tổn thương này: ông bà ngày càng bận rộn hoặc không thể hỗ trợ nhiều, áp lực sự nghiệp chồng lên vai trò làm mẹ mới, chi phí sinh hoạt tăng trong khi thu nhập không theo kịp, và mạng xã hội tràn ngập những lời khuyên "phải thế này, phải thế kia" mâu thuẫn nhau cùng thông tin phản khoa học.

## Insight Cốt Lõi

Breaking point của một bà mẹ postpartum gần như không bao giờ đến từ một vấn đề duy nhất. Đó là sự **cộng dồn** của các yếu tố sinh học, thể chất và tâm lý ập đến cùng lúc. Điều này có nghĩa là nhiệm vụ của v1 không phải là trả lời đúng một câu hỏi — mà là giúp người mẹ gỡ rối xem chuyện gì đang xảy ra với mình *ngay lúc này*, xác nhận rằng điều đó là bình thường, và chỉ ra bước tiếp theo nhỏ nhất cần làm. Về bản chất, đây là một sản phẩm giảm tải cognitive và emotional load, không phải một công cụ tra cứu triệu chứng.

### Insight Bổ Sung — Cửa Vào Thực Tế (v2, đã được hiện thực ở v3)

Trong phần lớn trường hợp, mẹ sẽ không mở app và gõ thẳng "em thấy mình không còn là mình" hay "em thấy cô đơn quá." Mẹ sẽ gõ một câu hỏi về bé — "con khóc suốt có sao không," "con không chịu ai bế ngoài mẹ," "con quấy khi bố đi làm về." Câu hỏi về bé thường là cửa vào thật sự; insight cốt lõi vẫn là đích đến. *(v3: nội dung "cửa vào từ bé" cho scenario 2/3/5/6/7 đã được soạn — #28–#32 trong content-framework v3 — nhưng chưa có nguồn/review. Trong giao diện, đây còn được thể hiện bằng các câu hỏi gợi ý trên Trang chủ và dải gợi ý trong chat.)*

## Các Tình Huống Thực Tế V1 Phải Giải Quyết

1. **Cơn khủng hoảng lúc 2 giờ sáng** — Em bé không chịu ngủ, mẹ đã nhiều ngày không được ngủ trọn giấc, và không biết đây là hành vi bình thường của trẻ sơ sinh hay có gì bất ổn. Các nhóm Facebook đưa ra mười câu trả lời mâu thuẫn nhau; các app tiếng Anh không nắm được ngữ cảnh hay bản năng của mẹ.
2. **Sự sụp đổ bản dạng (matrescence)** — Mẹ không còn nhận ra chính mình — cơ thể, vai trò, cảm xúc đều thay đổi. Mẹ cảm thấy tội lỗi khi tiếc nuối cuộc sống cũ trong khi vẫn yêu thương con, và không ai xung quanh gọi tên cảm giác này như một transition thực sự.
3. **Gánh nặng vô hình và sự cô lập** — Mọi người hỏi về em bé, không ai hỏi về mẹ. Chồng đã đi làm lại; mẹ ruột hoặc mẹ chồng áp đặt quan niệm "kiêng cữ" truyền thống mâu thuẫn với những gì mẹ đọc được. Xung quanh đầy người nhưng mẹ vẫn hoàn toàn cô đơn với những nghi hoặc của mình.
4. **Khủng hoảng áp lực cho con bú** — Việc cho con bú không diễn ra "tự nhiên" như những gì mẹ từng được nghe. Các kỹ thuật mâu thuẫn nhau và áp lực "sữa mẹ là tốt nhất" biến một vấn đề phổ biến, có thể giải quyết được, thành một thất bại cá nhân trong đầu mẹ.
5. **Quá tải giác quan / "touched out"** — Sau một ngày dài liên tục bị chạm vào và cần đến, mẹ chỉ muốn thoát khỏi chính cơ thể mình, mà không có ngôn từ nào để diễn tả cảm giác đó ngoài việc nghĩ "chắc mình có vấn đề gì đó mới cảm thấy thế này."
6. **Cơ thể đang hồi phục bị lãng quên** — Mẹ vẫn đang hồi phục thể chất (vết khâu tầng sinh môn hoặc sinh mổ, ra máu, v.v.) nhưng mọi cuộc trò chuyện đều xoay quanh em bé. Mẹ không chắc đâu là dấu hiệu hồi phục bình thường, đâu là dấu hiệu cảnh báo, và không muốn hỏi vì sợ bị cho là làm quá.
7. **Căng thẳng trong mối quan hệ** — Thiếu ngủ và kiệt sức, những bất đồng nhỏ với bạn đời leo thang nhanh chóng, và mẹ không biết đây là căng thẳng bình thường của giai đoạn này hay là dấu hiệu của vấn đề thực sự.

*Bất cứ điều gì v1 xây dựng đều phải bắt nguồn từ một trong bảy tình huống này. Nếu không, đó không phải là v1.*

### Khoảng trống: "Áp lực tiền bạc" chưa thuộc tình huống nào `[MÂU THUẪN]`

- **Bằng chứng prototype có:** lựa chọn check-in *"Áp lực tiền bạc, khó đi làm lại"* (dòng 806), mẹo ngày *"Áp lực tiền bạc sau sinh là một gánh nặng có thật…"* (dòng 816), và chip trên Trang chủ *"Mình lo chuyện tiền bạc và đi làm lại"* (CHIP_Q, build spec §4.2.4).
- **Bằng chứng nó không thuộc v1 theo định nghĩa của chính scope:** câu *"Bất cứ điều gì v1 xây dựng đều phải bắt nguồn từ một trong bảy tình huống này"* (ngay phía trên) và không có entry nào về chủ đề này trong 33 entries (content-framework v3, mục 3).
- **Hệ quả:** khi mẹ bấm chip này, tin nhắn đi vào LLM mà Cơ sở kiến thức **không có** entry; theo prompt, LLM phải *"không tự suy diễn ngoài phạm vi này"* (dòng 866).
- **Lưu ý:** chính phần "Vì sao là bây giờ" của scope nêu chi phí sinh hoạt như một áp lực thật, nên chủ đề có cơ sở trong tầm nhìn sản phẩm — chỉ chưa có chỗ trong 7 tình huống.

| Phương án | Ưu | Nhược |
|---|---|---|
| A. Thêm "Tình huống 8 — Áp lực tài chính & đi làm lại" + 1–2 entry | Nhất quán; chip/mẹo hiện có có nội dung đỡ | Mở rộng scope trong lúc 10 giờ/tuần; cần nguồn (nội dung này ít liên quan y khoa → dễ viết, khó tìm nguồn uy tín) |
| B. Gộp vào Tình huống 3 (gánh nặng vô hình) hoặc 7 (căng thẳng) | Không thêm scenario; ít việc | Hơi gượng — tiền bạc không hoàn toàn là "cô lập" hay "quan hệ vợ chồng" |
| C. Bỏ lựa chọn khỏi check-in + mẹo | Giữ đúng 7 tình huống; ít rủi ro nội dung | Mất một tín hiệu thật mà mẹ muốn nói; nếu mẹ tự gõ vẫn rơi vào LLM không KB |

*Đây là quyết định của Vân; chưa chọn.*

## Trong Scope — V1

- Giao diện và nội dung hoàn toàn bằng tiếng Việt (chưa cần hỗ trợ tiếng Anh)
- **Intake 3 bước** để guidance phù hợp với mẹ *(v3, thay cho "một bước intake ngắn")*: số bé (1 hoặc đa thai 2–4) → ngày sinh bé (hiển thị tuần tuổi) → cách sinh, cách cho bú từng bé, lần đầu/không
- **Check-in nhanh** *(v3 — chi tiết)*: tâm trạng (nhiều lựa chọn, bắt buộc), giấc ngủ, cơ thể, áp lực lớn nhất (nhiều lựa chọn); một bản ghi/ngày. Có thể lưu nhanh chỉ tâm trạng từ Trang chủ.
- **Mẹ xem lại lịch sử của chính mình** — dạng nhật ký trên lịch + câu phản chiếu nhẹ nhàng (ví dụ: "mình thấy mẹ đã mệt vài ngày liền") + **Ghi chú** mẹ tự ghim từ câu trả lời của AI; không phải biểu đồ/dashboard clinical *(v3: thêm Ghi chú)*
- **Trang chủ** *(v3, mới)*: tuần sau sinh + mốc hồi phục 6–8 tuần (thanh 56 ngày), mẹo ngày theo bối cảnh check-in, câu hỏi gợi ý dẫn vào chat
- Một AI chat companion theo yêu cầu — ấm áp, xác nhận cảm xúc, dựa trên nội dung đã được curate; trả lời kiểu nhắn tin ngắn *(v3)*
- AI được xây dựng trên một LLM có sẵn với system prompt tiếng Việt mạnh + nội dung đã curate được nhúng trực tiếp (không cần train custom model, không cần vector database ở quy mô này) *(v3: hiện 32 entries nhúng trong prompt)*
- Một yếu tố "đồng cảm nhẹ" (peer-normalization): các đoạn nội dung **được viết sẵn, ẩn danh** kiểu "nhiều mẹ khác cũng từng cảm thấy vậy"
- **Safety protocol (Tier 3 — không phải một tính năng):** ngôn ngữ red-flag / khủng hoảng lập tức hiển thị thông tin liên hệ khẩn cấp/hotline thật, không ngoại lệ. *(v3: thực thi bằng crisis banner dính ở đầu chat — không tự ẩn, mẹ phải tự đóng; ẩn dải gợi ý và nút ghim sau tin Tier 3; hai phiên bản phản hồi cho ý nghĩ tự hại trong/ngoài giờ HOPE.)*
- Lập trường rõ ràng non-diagnostic với bất cứ điều gì liên quan y tế thể chất
- **Mục Hỗ trợ trong Hồ sơ** *(v3, mới)*: danh sách liên hệ khẩn cấp thật (115, HOPE kèm trạng thái "Đang mở", 111, CSAGA, Ngôi nhà Bình yên) + **Người thân tin cậy** do mẹ tự thêm
- **Guest-first**, tạo tài khoản sau 2 tương tác *(v3)*
- **Hộp góp ý "Góp ý cho mình"** *(v3, mới)* — kênh feedback trong app (dòng 749–752)
- Beta trực tiếp quy mô nhỏ: 3-5 mẹ đáng tin cậy mà bạn quen biết, có kênh feedback trực tiếp với bạn

## Ngoài Scope — Có Chủ Đích, Tạm Thời

- Nhắn tin peer trực tiếp, forum, hoặc bất kỳ nội dung do user tạo ra (gánh nặng moderation và an toàn)
- Câu trả lời y tế mang tính chẩn đoán hoặc dứt khoát dưới bất kỳ hình thức nào
- **Dự đoán/gợi ý về phát triển tương lai của bé** (developmental hints)
- **Tài khoản nhiều người chăm sóc hoặc tài khoản gia đình** — *đã cân nhắc lại (v2): rủi ro giám sát trong các mối quan hệ không an toàn là lý do chính.* *(v3: tách ra khỏi "nhiều con" — xem mục Mâu thuẫn #1. "Người thân tin cậy" là một **số điện thoại do mẹ nhập**, người đó không có tài khoản và không xem được dữ liệu của mẹ — nhất quán với lý do giám sát trên.)*
- Payment hoặc monetization — *đã cân nhắc lại (v2)*
- Đặt lịch telehealth hoặc kết nối với chuyên gia thật *(v3: xem Mâu thuẫn #2 về dòng "Đặt lịch hẹn với bác sĩ" trên màn giới thiệu)*
- Cá nhân hóa sâu bằng ML ngoài phạm vi LLM + nội dung đã curate
- Hỗ trợ tiếng Anh hoặc thị trường diaspora
- **Push notification, streak, gamification** — *giữ nguyên.* Lưu ý: "nudge tạo tài khoản sau 2 tương tác" (dòng/hàm `bump()`) là lời nhắc **trong app, hiện một lần**, không phải push/streak → `[SUY LUẬN]` không vi phạm mục này, nhưng nếu muốn tuyệt đối, có thể ghi rõ "không có growth mechanic nào ngoài lời mời tạo tài khoản một lần". Outbound proactivity (nhắn tin chủ động ra ngoài app) là câu hỏi **tách riêng, chưa quyết**.

## Mâu Thuẫn Cần Xử Lý (giữa scope v2 và prototype v28)

**#1 — "Tài khoản nhiều con" vs. đa thai trong intake.**
- v2: *"Tài khoản nhiều con, nhiều người chăm sóc, hoặc tài khoản gia đình — đã cân nhắc lại (v2)"* (ngoài scope).
- Prototype: intake cho 1 đến 4 bé trong một hồ sơ; cách cho bú theo từng bé; nguyên tắc #8 trong prompt xử lý nhiều bé (dòng 856).
- `[SUY LUẬN]` Có thể "nhiều con" ở v2 nghĩa là *nhiều lần sinh/nhiều bé khác thời điểm*; còn đa thai (một lần sinh) là trường hợp riêng. Chưa có ghi nhận rõ ràng.
- Phương án: (A) viết rõ trong scope "đa thai trong **một** lần sinh: có; nhiều lần sinh/bé khác thời điểm: không" — rẻ, khớp prototype; (B) bỏ đa thai khỏi v1 — đơn giản hơn nhưng loại một nhóm mẹ có nhu cầu cao và phải sửa prototype/prompt. Khuyến nghị tạm: A.

**#2 — "Đặt lịch hẹn với bác sĩ" vs. telehealth ngoài scope.**
- v2: *"Đặt lịch telehealth hoặc kết nối với chuyên gia thật"* (ngoài scope).
- Prototype, màn giới thiệu số 3: *"Đặt lịch hẹn với bác sĩ — Khi mẹ hoặc bé cần được khám."* nằm trong danh sách "nguồn kết nối" (dòng 822), nhưng **không thấy chức năng đặt lịch nào** trong code (chỉ xuất hiện đúng một lần).
- Hệ quả: màn giới thiệu hứa một việc mà app không làm → mẹ có thể kỳ vọng sai.
- Phương án: (A) sửa chữ thành "Gợi ý mẹ đặt lịch khám" (đúng với hành vi hiện tại); (B) bỏ dòng; (C) làm tính năng thật (vi phạm scope). Khuyến nghị: A hoặc B.

## Quyết Định Kỹ Thuật & Mốc Thời Gian (từ ghi nhớ của Vân — chưa có trong v2)

> Nguồn: ghi nhớ của Vân trong các phiên trước. Mọi dòng bên dưới là điều Vân đã nói; không phải kết luận của người soạn.

- **Production:** React + FastAPI backend; link công khai bằng Docker + CI/CD; đăng nhập thật (**nickname + PIN, ẩn danh**) và database; test tự động; GitHub Actions; tài liệu kỹ thuật. Mục tiêu: có login + database **trước buổi bảo vệ 4/11**.
- **Cách lưu hội thoại — ý định thiết kế:** mẹ ghim nội dung chat → AI trích thành (1) lịch sử theo ngày cùng check-in, và (2) "trí nhớ người dùng" để dùng lại khi mở lại chat, **thay vì lưu toàn bộ lịch sử chat**.
- **Thứ tự ưu tiên:** (1) hoàn thiện tính năng chat "Gỡ rối cùng mẹ"; (2) hoàn thành sản phẩm cho đồ án (source code, nhật ký thực hiện, báo cáo); (3) rồi mới mở rộng bộ tính năng hỗ trợ mẹ.
- **Mốc đồ án:** đề tài duyệt 5/7/2026; kế hoạch duyệt 10/7/2026; đổi hướng và duyệt lại kế hoạch 22/8/2026; **bảo vệ 4/11/2026** (GVHD: TS. Nguyễn Trùng Lập).
- **Beta:** Vân có danh sách bạn bè đang có con nhỏ để mời thử nghiệm.

**Điểm lệch cần xử lý (`[MÂU THUẪN]`):**

1. **Đăng nhập:** ghi nhớ nói *nickname + PIN, ẩn danh*; prototype v28 đăng ký bằng *tên + email* (`submitSignup` lưu `{ name, email }`, build spec §3.5). Đánh đổi: nickname + PIN giảm dữ liệu nhận dạng (hợp với nhóm người dùng nhạy cảm, và với lo ngại giám sát ở trên) nhưng **không có cách khôi phục** nếu quên PIN, và email là kênh liên lạc duy nhất nếu sau này cần (kể cả cho beta). Cần Vân chọn; prototype cần sửa theo.
2. **Ghim/Ghi chú:** prototype lưu *một câu trả lời của AI + câu hỏi trước đó* thành ghi chú, **không có** bước "AI trích thành trí nhớ người dùng tái dùng khi mở lại chat". Đó là hành vi cần xây mới — và là quyết định về quyền riêng tư (lưu ít dữ liệu hơn = an toàn hơn, nhưng AI "quên" mẹ nhiều hơn). `[THIẾU]` chưa có thiết kế chi tiết cho phần trích xuất.
3. **Lưu hội thoại:** nếu *không* lưu toàn bộ lịch sử chat, màn Chat khi mở lại sẽ trống (prototype hiện cũng mất tin nhắn khi tải lại trang). Điều này trả lời một phần câu hỏi mở "conversation persistence" trong build spec §10.2.

## Điều Kiện Thành Công Cho V1 (Win Condition)

Một beta trực tiếp quy mô nhỏ với signup thật (3-5 mẹ đáng tin cậy), không chỉ là một bản demo — sử dụng đủ nhiều để bạn thấy được điều gì khiến họ bối rối, hoặc họ hỏi điều gì mà nội dung hiện tại chưa đề cập.

*(v3 — lưu ý: buổi bảo vệ đồ án 4/11/2026 là một mốc **riêng** với beta; win condition của sản phẩm không đổi. `[THIẾU]` chưa thấy ngày bắt đầu beta; nếu beta muốn có login + database thật thì phụ thuộc vào việc xong phần kỹ thuật ở trên.)*

## Một Quyết Định Còn Để Ngỏ — Cần Bạn Xác Nhận

Toàn bộ nội dung trên giả định **chỉ tập trung vào giai đoạn postpartum**. Định hướng ban đầu của bạn rộng hơn ("mang thai, sinh nở, nuôi dạy một con người"). Thu hẹp về postpartum giúp v1 khả thi trong 10 giờ/tuần — nhưng nếu hỗ trợ giai đoạn prenatal thực sự là cốt lõi trong tầm nhìn, đây là lúc cần quyết định.

*(Chưa được nhắc lại/quyết định trong v2 hay các tài liệu hiện có — **vẫn còn để ngỏ ở v3**. Lưu ý kỹ thuật: bước intake hiện **yêu cầu ngày sinh của bé** — "Con sinh ngày nào?" — nên không dùng được cho mẹ đang mang thai nếu không làm lại intake. Điều này làm cho việc mở rộng sang prenatal tốn kém hơn khi muộn: nội dung, intake, hero theo tuần đều dựa trên "tuần sau sinh".)*

## Các Quyết Định Mở Khác (từ build spec, chưa quyết)

| Quyết định | Tình trạng |
|---|---|
| Nút/đường vào **Đăng xuất** và **Tạo tài khoản** trên giao diện hiện tại | Code đăng xuất có (`logout`, dòng 1617) nhưng menu tài khoản không còn lối vào rõ ràng — `[MÂU THUẪN]` giữa logic và giao diện (build spec §4.9) |
| Nút **"Cần giúp ngay"** (lối tắt an toàn một chạm trên Trang chủ) | Chưa thiết kế. Trade-off: tăng khả năng tiếp cận Tier 3 mà không cần gõ vs. thêm một yếu tố "khẩn cấp" thường trực trên màn hình có thể làm mẹ lo hơn |
| Outbound proactivity / push | Chưa quyết, cố ý tách riêng |
| Lưu hội thoại | Xem mục "Quyết định kỹ thuật", điểm lệch #3 |