# Khung Nội Dung (Content Curation Framework) — v3

*Tài liệu này là bước 2 trong roadmap: dùng để curate entries cho AI companion "Mẹ Ơi!". Cập nhật 30/10/2026 để khớp prototype v28.*

**Quy ước nhãn:** `[NGUỒN: …]` = trích từ file gốc, có vị trí. `[SUY LUẬN]` = suy luận của người soạn. `[MÂU THUẪN]` = hai nguồn không khớp. `[THIẾU]` = chưa có bằng chứng. *"dòng N" = số dòng trong template đã decode của prototype v28 (`decoded_template.txt`, trích từ `meoi.html`).*

---

## Thay Đổi So Với V2 (Changelog v3)

| # | Thay đổi | Bằng chứng (trích đoạn → vị trí) |
|---|---|---|
| 1 | **Đã có 5 entries "cửa vào từ câu hỏi về bé" (#28–#32)** cho scenario 2, 3, 5, 6, 7 — TODO của v2 hoàn thành ở mức nội dung trong prototype. **Chưa có nguồn tham khảo và chưa được review.** | v2 TODO: *"Entries mới chưa được soạn"*; prototype `SYSTEM`: *"Con quấy đúng lúc bố vừa đi làm về khiến hai vợ chồng không kịp nói chuyện…"* → dòng 896 (và 876, 881, 888, 893) |
| 2 | **Thêm Entry #33 (T3-PSYCHIATRIC — ý nghĩ làm hại bản thân/em bé)** vào framework. Entry này đã có trong prompt nhưng v2 không có. Scope-doc yêu cầu hard-coded safety rule cho đúng tình huống này. | *"Ý nghĩ muốn làm hại bản thân hoặc em bé — dù chỉ thoáng qua — cần hỗ trợ ngay…"* → dòng 898; scope-doc-v2, mục Trong Scope: *"ý nghĩ tự làm hại bản thân hoặc em bé … lập tức hiển thị thông tin liên hệ khẩn cấp"* |
| 3 | **Thêm trục "Tier" song song với "Tag"** (mục 3.1): framework chỉ có EMOTIONAL/Y_TE, prompt dùng T1/T2/T3-*. Bảng ánh xạ 33 entries ở mục 3.1. | Prototype dùng `[T1]`, `[T2]`, `[T3-Physical]`… ở dòng 867–898; framework v2 chỉ dùng `Tag: EMOTIONAL/Y_TE` |
| 4 | **Sửa số đếm sai ở cuối v2:** v2 ghi *"27 entries hiện có (14 EMOTIONAL…)"*; đếm lại: 27 entries gốc = **20 EMOTIONAL + 7 Y_TE** (Y_TE: #2, 3, 6, 16, 18, 24, 27). Sau v3: **33 entries = 25 EMOTIONAL + 8 Y_TE**. | v2, dòng cuối mục 5. Đếm bằng tay theo thẻ `Tag:` của từng entry. |
| 5 | **Phát hiện 3 chỗ framework và prompt lệch nhau** (mục 3.1): Entry #2 (ra máu) không có trong prompt; #15/#21/#23 là EMOTIONAL ở framework nhưng T2 ở prompt; #15 và #21 là Y_TE ở `TIPS` của prototype. | Mục 3.1 và mục 6 |
| 6 | **Thêm mục 6 — nội dung "ngoài entries" đang sống trong prototype** (TIPS, kịch bản cố định, hero theo tuần, câu phản chiếu…) vì chúng cũng là nội dung người dùng đọc nên cần cùng chuẩn review. | Mục 6 |
| 7 | **Đối chiếu bảng liên hệ khẩn cấp với prototype** (mục 2): số CSAGA trong crisis banner sai; Ngày Mai chưa có trong prototype. | Dòng 1407 vs 1326/864 |

## Thay Đổi So Với V1 (giữ từ v2)

- **Xưng hô trong nội dung tương lai:** dùng "mẹ" thay vì "chị" khi viết entry mới.
- **Xác nhận kiến trúc:** entries **không** là Data Type sống; nhúng static text trong system prompt. *(v3: vẫn đúng — prototype nhúng thẳng vào biến `SYSTEM`, dòng 866–898. Ghi nhớ của Vân nói bản production dùng React + FastAPI, `[THIẾU]` chưa có quyết định cách lưu KB ở backend: file tĩnh hay bảng DB.)*
- **Xác nhận không mở rộng:** không biến nội dung về bé thành baby-care encyclopedia.

### TODO — Cửa Vào Từ Câu Hỏi Về Bé (cập nhật v3)

| Scenario | Có entry dùng câu hỏi về bé làm cửa vào? | Ghi chú |
|---|---|---|
| 1. Cơn khủng hoảng 2 giờ sáng | ✅ (#1, #3) | |
| 2. Matrescence | ✅ **#28 (mới)** | Nhịp bú/ngủ của con cuốn trọn ngày mẹ → matrescence |
| 3. Gánh nặng vô hình / cô lập | ✅ **#29 (mới)** | Mọi người hỏi con, không ai hỏi mẹ |
| 4. Áp lực cho con bú | ✅ (#15, #16, #18) | |
| 5. Quá tải giác quan | ✅ **#30 (mới)** | "Con chỉ chịu mẹ bế" → nghỉ giác quan |
| 6. Cơ thể hồi phục bị lãng quên | ✅ **#31 (mới)** | Lịch tiêm của con được nhắc, lịch tái khám của mẹ bị quên |
| 7. Căng thẳng mối quan hệ | ✅ **#32 (mới)** | "Con quấy khi bố đi làm về" |

*Cả 5 entry mới: **chưa có nguồn** (mục 5 ghi `[THIẾU — cần nguồn]`) và **chưa được chuyên gia review**. Đây là điều kiện cần trước beta, không chỉ trước launch, vì #31 có nội dung y tế gián tiếp (tái khám sau sinh).*

---

## 1. Nguồn Tham Khảo Uy Tín (Trusted Reference Sources)

Dùng để **adapt** (không dịch nguyên văn) sang tiếng Việt, với giọng văn gần gũi thay vì "clinical":

- **WHO** — hướng dẫn chăm sóc hậu sản (postpartum care guidelines)
- **ACOG** (American College of Obstetricians and Gynecologists) — phục hồi thể chất sau sinh
- **Mayo Clinic** — các mốc hồi phục sau sinh, dấu hiệu cảnh báo
- **Postpartum Support International (PSI)** — trầm cảm và lo âu sau sinh, matrescence
- Nghiên cứu học thuật về PPD tại Việt Nam (BMC Women's Health, 2023) — context địa phương: ~20% mẹ Việt gặp PPD, và nhiều mẹ tìm đến "thầy bói" hoặc truyền miệng thay vì y học hiện đại — insight xác nhận lý do sản phẩm này cần tồn tại

**Lưu ý quan trọng:** chưa có ai có chuyên môn y khoa review nội dung. Vì vậy, mọi entry liên quan thể chất/y tế phải giữ lập trường **non-diagnostic** — mô tả điều gì là phổ biến/bình thường, sau đó luôn redirect đến bác sĩ thật cho bất kỳ điều gì cụ thể. *(v3: vẫn đúng — `[THIẾU]` không thấy bằng chứng nào về việc đã tìm được reviewer.)*

## 2. Tài Nguyên An Toàn Khẩn Cấp (Verified — cần double-check lại trước khi launch)

| Dịch vụ | Số điện thoại | Giờ hoạt động | Dùng khi nào | Có trong prototype v28? |
|---|---|---|---|---|
| Cấp cứu y tế quốc gia | **115** | 24/7 | Mọi tình huống khẩn cấp | ✅ (banner + mục Hỗ trợ) |
| Đường dây nóng Ngày Mai (hỗ trợ tâm lý) | **0963 061 414** | Chiều-tối, không phải mỗi ngày (verify lại lịch tại duongdaynongngaymai.vn) | Cảm xúc quá tải, cần người lắng nghe | ❌ **Không thấy** trong prototype `[THIẾU]` — tìm không có trong dòng 1318–1330 |
| Đường dây nóng HOPE | **0865 044 400** | Hằng ngày 16:30–20:30 | Ý nghĩ tự làm hại bản thân | ✅ (kèm trạng thái "Đang mở"/"Ngoài giờ") |
| Tổng đài Bảo vệ Trẻ em Quốc gia | **111** | 24/7 | Lo ngại về an toàn của em bé | ✅ (mục Hỗ trợ) |
| CSAGA (bạo lực giới) | **024 3333 5599** | Giờ hành chính | "Relationship friction" leo thang thành bạo lực | ⚠️ **Banner Tier 3-SAFETY dùng `0243333599` (sai — thiếu 1 chữ số)**; mục Hỗ trợ dùng `02433335599` (đúng). dòng 1407 vs 1326 |
| Ngôi nhà Bình yên (Peace House Shelter) | **1900 969 680** | 24/7 (điện thoại/SMS) | Phụ nữ cần nơi trú ẩn an toàn | ✅ |
| *Người thân tin cậy* | do mẹ tự nhập | — | Người mẹ muốn ở cạnh khi cần | ✅ **Mới v3** — mẹ nhập tên/số trong Hồ sơ; hiện ở mục Hỗ trợ khi có số (dòng 1324) |

**Design rule cho red-flag/crisis:** nếu phát hiện ngôn ngữ nguy hiểm **ngoài giờ hoạt động** của HOPE, app phải hiển thị rõ: gọi 115 ngay, hoặc liên hệ người thân/người tin cậy — không được giả vờ có hỗ trợ 24/7. *(v3: đã được thực thi trong prototype — trong giờ: HOPE + 115; ngoài giờ: chỉ nút "Gọi 115 ngay" và câu "báo cho người thân tin cậy gần nhất", dòng 1403–1409.)*

`[THIẾU]` Prototype dùng nút bật/tắt `hopeIn` thủ công để xác định "trong giờ". Production cần tự tính theo giờ Việt Nam (UTC+7), 16:30–20:30. `[SUY LUẬN]` — nên tính ở server để không phụ thuộc đồng hồ thiết bị.

**Việc cần làm (carry-over từ v2):** xác minh lại tất cả số trên trước launch; sửa số CSAGA trong banner; quyết định có thêm Ngày Mai hay không (đánh đổi: thêm một lựa chọn cho mẹ cần được lắng nghe nhưng lịch hoạt động không đều → có nguy cơ mẹ gọi mà không ai nghe, trái với design rule ở trên).

## 3. Content Taxonomy — 7 Scenarios → Topics → Tag

**Tag EMOTIONAL** = AI có thể trả lời ấm áp, xác nhận cảm xúc, trực tiếp.
**Tag Y_TE (medical)** = AI mô tả điều gì phổ biến, sau đó luôn redirect đến bác sĩ — không chẩn đoán.

| Scenario | Content Topics | Tag |
|---|---|---|
| 1. Cơn khủng hoảng 2 giờ sáng | "Bé khóc dạ đề (colic) là gì" | EMOTIONAL |
| | "Khi nào tiếng khóc của bé là dấu hiệu cần đi khám" | Y_TE |
| | "Làm sao để trụ qua một đêm mất ngủ" | EMOTIONAL |
| 2. Sự sụp đổ bản dạng (matrescence) | "Matrescence là gì — vì sao mẹ thấy mình 'không còn là mình'" | EMOTIONAL |
| | "Tiếc nuối cuộc sống cũ có phải là mẹ tệ không" | EMOTIONAL |
| | *(v3)* "Nhịp bú/ngủ của con cuốn trọn ngày mẹ" (#28) | EMOTIONAL |
| 3. Gánh nặng vô hình / cô lập | "Kiêng cữ truyền thống và lời khuyên hiện đại — dung hòa thế nào" | EMOTIONAL |
| | "Cảm giác cô đơn dù xung quanh đầy người" | EMOTIONAL |
| | *(v3)* "Mọi người hỏi con, không ai hỏi mẹ" (#29) | EMOTIONAL |
| 4. Áp lực cho con bú | "Sữa mẹ không đủ — bình thường hơn mẹ nghĩ" | EMOTIONAL |
| | "Dấu hiệu tắc tia sữa / viêm vú cần đi khám" | Y_TE |
| 5. Quá tải giác quan ("touched out") | "Vì sao mẹ muốn 'trốn' khỏi chính cơ thể mình" | EMOTIONAL |
| | *(v3)* "Con chỉ chịu mẹ bế" (#30) | EMOTIONAL |
| 6. Cơ thể hồi phục bị lãng quên | "Các mốc hồi phục bình thường sau sinh (theo tuần)" | EMOTIONAL |
| | "Dấu hiệu cảnh báo cần gọi bác sĩ ngay (ra máu nhiều, sốt, nhiễm trùng vết khâu)" | Y_TE |
| | *(v3)* "Lịch khám của con được nhắc, lịch tái khám của mẹ dễ bị quên" (#31) | EMOTIONAL |
| 7. Căng thẳng mối quan hệ | "Vì sao mâu thuẫn tăng sau khi có con" | EMOTIONAL |
| | "Khi căng thẳng trở thành bạo lực — cần tìm ai" | Y_TE (redirect CSAGA/Peace House) |
| | *(v3)* "Con quấy khi bố đi làm về" (#32) | EMOTIONAL |
| *Ngoài 7 scenario* | *(v3)* "Ý nghĩ làm hại bản thân/em bé" (#33) | Y_TE (T3-PSYCHIATRIC) |

`[MÂU THUẪN]` **Áp lực tiền bạc:** check-in có lựa chọn *"Áp lực tiền bạc, khó đi làm lại"* và `TIPS` có một mẹo cho nó (dòng 806, 816), nhưng **không có entry nào** trong 33 entries và không thuộc 7 scenarios. Chi tiết và các phương án: scope-doc v3, mục "Khoảng trống".

### 3.1 Hai trục: Tag (nội dung) × Tier (cách xử lý)

`[SUY LUẬN]` Hai nhãn đang tồn tại song song nhưng **không trùng nhau**, và nên được coi là hai trục khác nhau:

- **Tag** (EMOTIONAL / Y_TE) = *bản chất nội dung* — dùng cho người review chuyên môn: "entry nào đụng tới y tế?".
- **Tier** (T1 / T2 / T3-*) = *cách app phản ứng* — dùng cho kỹ thuật: có hiện banner không, có hiện nút ghim không.

Đánh đổi nếu gộp thành một trường Tier duy nhất: đơn giản cho dev, nhưng mất thông tin "entry này cần reviewer y khoa nhìn" (ví dụ #21 là EMOTIONAL nhưng chứa con số 6–8 tuần). Khuyến nghị: **giữ cả hai cột**.

Bảng ánh xạ (Tier lấy từ prompt, dòng 867–898; "Thứ tự trong prompt" = vị trí trong khối Cơ sở kiến thức):

| Entry | Scenario | Tag (framework) | Tier (prompt) | Trong KB prompt? | Ghi chú |
|---|---|---|---|---|---|
| #1 | 1 | EMOTIONAL | T1 | ✅ (1) | |
| #2 | 6 | Y_TE | — | ❌ | `[MÂU THUẪN]` có trong framework (ra máu/sốt/vết khâu), **không có** trong prompt; chỉ có regex `ra máu` + quy tắc Tier 3 chung |
| #3 | 1 | Y_TE | T3-PHYSICAL | ✅ (2) | |
| #4 | 1 | EMOTIONAL | T1 | ✅ (3) | |
| #5 | 1 | EMOTIONAL | T1 | ✅ (4) | |
| #6 | 1 | Y_TE | T3-PSYCHIATRIC | ✅ (5) | |
| #7 | 2 | EMOTIONAL | T1 | ✅ (6) | |
| #8 | 2 | EMOTIONAL | T1 | ✅ (7) | |
| #9 | 2 | EMOTIONAL | T1 | ✅ (8) | |
| #10 | 2 | EMOTIONAL | T1 | ✅ (9) | |
| #11 | 3 | EMOTIONAL | T1 | ✅ (11) | |
| #12 | 3 | EMOTIONAL | T1 | ✅ (12) | |
| #13 | 3 | EMOTIONAL | T1 | ✅ (13) | |
| #14 | 3 | EMOTIONAL | T1 | ✅ (14) | |
| #15 | 4 | EMOTIONAL | **T2** | ✅ (16) | `[MÂU THUẪN]` Tag ≠ Tier; và `TIPS` đánh Y_TE (dòng 812) |
| #16 | 4 | Y_TE | T3-PHYSICAL | ✅ (17) | |
| #17 | 4 | EMOTIONAL | T1 | ✅ (18) | |
| #18 | 4 | Y_TE | T3-PHYSICAL | ✅ (19) | |
| #19 | 5 | EMOTIONAL | T1 | ✅ (20) | |
| #20 | 5 | EMOTIONAL | T1 | ✅ (21) | |
| #21 | 6 | EMOTIONAL | **T2** | ✅ (23) | `[MÂU THUẪN]` Tag ≠ Tier; `TIPS` đánh Y_TE (dòng 814) |
| #22 | 6 | EMOTIONAL | T1 | ✅ (24) | |
| #23 | 6 | EMOTIONAL | **T2** | ✅ (25) | `[MÂU THUẪN]` Tag ≠ Tier |
| #24 | 6 | Y_TE | T3-PHYSICAL | ✅ (26) | |
| #25 | 7 | EMOTIONAL | T1 | ✅ (28) | |
| #26 | 7 | EMOTIONAL | T1 | ✅ (29) | |
| #27 | 7 | Y_TE | T3-SAFETY | ✅ (31) | |
| #28 | 2 | EMOTIONAL | T1 | ✅ (10) | **Mới v3** |
| #29 | 3 | EMOTIONAL | T1 | ✅ (15) | **Mới v3** |
| #30 | 5 | EMOTIONAL | T1 | ✅ (22) | **Mới v3** |
| #31 | 6 | EMOTIONAL | T1 | ✅ (27) | **Mới v3** |
| #32 | 7 | EMOTIONAL | T1 | ✅ (30) | **Mới v3** |
| #33 | — | Y_TE | T3-PSYCHIATRIC | ✅ (32) | **Mới v3** (đã có trong prompt, nay bổ sung vào framework) |

*Kiểm tra: 33 entries trong framework; 32 trong prompt (thiếu #2). Quy ước "Tag ≠ Tier ở #15/#21/#23" là hợp lý (nội dung cảm xúc nhưng có phạm vi cá nhân → T2 "inform with caveat"); điều cần tránh là **TIPS** gắn nhãn Y_TE khác với framework — xem mục 6.*

## 4. Ví Dụ Entry Đã Hoàn Thiện (Draft Mẫu)

**Entry #1**
- Scenario: 1 — Cơn khủng hoảng 2 giờ sáng
- Tag: EMOTIONAL
- Nội dung: "Việc bé khóc nhiều, đặc biệt vào buổi tối hoặc ban đêm, là điều rất phổ biến ở trẻ sơ sinh — nhiều người gọi đây là 'khóc dạ đề.' Đây không phải lỗi của mẹ, và không có nghĩa là mẹ đang làm gì sai. Nếu bé vẫn bú tốt, tăng cân đều, không sốt và không có dấu hiệu bất thường khác, đây thường chỉ là một giai đoạn sẽ qua đi."
- Nguồn: Mayo Clinic, PSI (adapted)

**Entry #2**
- Scenario: 6 — Cơ thể hồi phục bị lãng quên
- Tag: Y_TE
- Nội dung: "Ra máu nhẹ và giảm dần trong vài tuần đầu sau sinh là bình thường. Nhưng nếu mẹ thấm đẫm một băng vệ sinh trong vòng 1 giờ, sốt trên 38°C, hoặc thấy vết khâu sưng đỏ/chảy mủ — đây là lúc cần gọi bác sĩ hoặc đến cơ sở y tế ngay, hoặc gọi 115 nếu tình huống khẩn cấp. Đừng ngại vì sợ 'làm quá' — an toàn của mẹ luôn đáng để kiểm tra."
- Nguồn: ACOG, WHO (adapted)
- *(v3) Lưu ý: entry này chưa có trong prompt của prototype — xem mục 3.1.*

## 5. Các Entries Còn Lại (Entry #3 – #33)

### Nhóm 1 — Cơn khủng hoảng 2 giờ sáng (giấc ngủ & tiếng khóc)

**Entry #3** — Tag: Y_TE
Nếu bé khóc kèm sốt trên 38°C (với bé dưới 3 tháng), bú kém hoặc bỏ bú, có máu trong phân, thở nhanh/khó thở, hoặc ngủ li bì bất thường — đây là những dấu hiệu cần đưa bé đi khám ngay, không nên chờ đến sáng. Nếu nghi ngờ khẩn cấp, gọi 115.
*Nguồn: WHO, Mayo Clinic (adapted)*

**Entry #4** — Tag: EMOTIONAL
Không có cách nào để "giỏi" việc thức đêm — mẹ chỉ đang sống sót qua một giai đoạn cực kỳ khắc nghiệt. Nếu có thể, hãy chia ca với chồng hoặc người thân, chợp mắt bất cứ khi nào bé ngủ thay vì cố làm việc nhà, và đừng tự trách nếu mẹ thấy mình cáu gắt hơn bình thường — đó là sinh lý, không phải tính cách của mẹ.
*Nguồn: PSI (adapted)*

**Entry #5** — Tag: EMOTIONAL
Mất ngủ kéo dài không chỉ khiến mẹ mệt — nó thực sự làm thay đổi cách não bộ xử lý cảm xúc, khiến những chuyện nhỏ cũng dễ trở thành giọt nước tràn ly. Nếu mẹ thấy mình dễ khóc, dễ nổi giận hoặc mất kiên nhẫn hơn hẳn ngày thường, đó là phản ứng sinh lý bình thường trước tình trạng thiếu ngủ nghiêm trọng, không phải dấu hiệu mẹ là người mẹ tệ.
*Nguồn: Mayo Clinic, PSI (adapted)*

**Entry #6** — Tag: Y_TE
Nếu mẹ bắt đầu có những suy nghĩ hoặc cảm giác kỳ lạ, mất phương hướng nghiêm trọng, hoang mang cực độ, hoặc nghe/thấy điều mà người khác không thấy — đây có thể là dấu hiệu của một tình trạng hiếm gặp nhưng nghiêm trọng gọi là rối loạn tâm thần sau sinh (postpartum psychosis). Đây là một cấp cứu y tế thật sự. Hãy gọi 115 hoặc đến bệnh viện gần nhất ngay lập tức, đừng chờ đợi.
*Nguồn: ACOG, PSI (adapted)*

### Nhóm 2 — Matrescence (sự chuyển đổi bản dạng)

**Entry #7** — Tag: EMOTIONAL
Matrescence là thuật ngữ chỉ quá trình chuyển đổi thành mẹ — về mặt thể chất, cảm xúc, và cả bản dạng — tương tự như tuổi dậy thì nhưng ít được nói đến. Cảm giác "mình không còn là mình" không phải là mẹ đang có vấn đề; đó là một giai đoạn chuyển tiếp thực sự mà cơ thể và tâm trí mẹ đang trải qua.
*Nguồn: PSI, nghiên cứu của Aurélie Athan về matrescence (adapted)*

**Entry #8** — Tag: EMOTIONAL
Tiếc nuối sự tự do, công việc, hay con người mẹ từng là trước khi có con — không có nghĩa là mẹ không yêu con. Hai cảm xúc này hoàn toàn có thể tồn tại cùng lúc. Cho phép bản thân buồn về những gì đã mất, trong khi vẫn yêu thương những gì mới có, là một phần bình thường của hành trình làm mẹ.
*Nguồn: PSI (adapted)*

**Entry #9** — Tag: EMOTIONAL
Nhiều mẹ chia sẻ cảm giác không nhận ra cơ thể hay khuôn mặt mình trong gương sau khi sinh — đây là phản ứng phổ biến trước những thay đổi nhanh và lớn về thể chất lẫn vai trò sống. Cảm giác này thường sẽ dịu lại theo thời gian khi mẹ dần quen với "phiên bản mới" của chính mình.
*Nguồn: PSI (adapted)*

**Entry #10** — Tag: EMOTIONAL
Không có gì sai khi mẹ vừa yêu con vô cùng, vừa nhớ cuộc sống trước đây. Việc dán nhãn bản thân là "ích kỷ" vì có cảm xúc này thường khiến mọi thứ nặng nề hơn. Hãy thử viết ra hoặc nói với ai đó mà không phán xét mình trước.
*Nguồn: PSI (adapted)*

**Entry #28** — Tag: EMOTIONAL — *Mới v3 · cửa vào từ bé*
Nhịp bú/ngủ của con cuốn trọn ngày mẹ — nếu mẹ không nhớ nổi lần cuối làm gì cho riêng mình, đó là matrescence, không phải đánh mất bản thân.
*Nguồn: `[THIẾU — cần nguồn]` (văn bản trích từ prompt, dòng 876; có thể dùng lại nguồn của #7: PSI/Athan, cần xác nhận)*

### Nhóm 3 — Gánh nặng vô hình & cô lập

**Entry #11** — Tag: EMOTIONAL
Kiêng cữ mang nhiều giá trị văn hóa và sự quan tâm từ thế hệ trước, nhưng không phải mọi quan niệm đều có cơ sở y khoa hiện đại. Mẹ có quyền lắng nghe truyền thống với sự trân trọng, đồng thời ưu tiên những gì bác sĩ khuyến nghị cho tình trạng cụ thể của mình — hai điều này không nhất thiết mâu thuẫn.
*Nguồn: adapted, local context*

**Entry #12** — Tag: EMOTIONAL
Cảm giác cô đơn dù nhà đầy người là một nghịch lý rất thật của giai đoạn hậu sản — vì mọi sự chú ý dồn vào em bé, còn cảm xúc của mẹ thường vô hình. Cảm giác này không có nghĩa là mẹ vô ơn hay yếu đuối; đó là một trải nghiệm phổ biến cần được gọi tên.
*Nguồn: PSI (adapted)*

**Entry #13** — Tag: EMOTIONAL
Khi mẹ chồng hoặc mẹ ruột chăm cháu theo cách khác với mong muốn của mẹ, cảm giác bất lực hoặc bị gạt ra ngoài là hoàn toàn dễ hiểu. Việc nói rõ, nhẹ nhàng nhưng kiên định về điều gì thực sự quan trọng với mẹ — thay vì im lặng chịu đựng hay bùng nổ — thường là cách bền vững hơn để giữ mối quan hệ và giữ ranh giới của mình.
*Nguồn: adapted, local context*

**Entry #14** — Tag: EMOTIONAL
Nếu không ai hỏi mẹ có khỏe không, mẹ có thể là người chủ động nói ra: "Hôm nay mẹ hơi mệt, mẹ cần được lắng nghe." Điều này không phải làm phiền người khác — nhu cầu được quan tâm của mẹ cũng quan trọng như của em bé.
*Nguồn: PSI (adapted)*

**Entry #29** — Tag: EMOTIONAL — *Mới v3 · cửa vào từ bé*
Mọi người hỏi han con bú/ngủ/tăng cân nhưng không ai hỏi mẹ có ngủ được không — cảm giác bị bỏ quên là nghịch lý thật của hậu sản, không phải mẹ nhạy cảm quá mức.
*Nguồn: `[THIẾU — cần nguồn]` (dòng 881; gần với #12, nguồn PSI — cần xác nhận)*

### Nhóm 4 — Áp lực cho con bú

**Entry #15** — Tag: EMOTIONAL *(Tier trong prompt: T2)*
Cảm giác sữa "không đủ" rất phổ biến và đôi khi không phản ánh đúng thực tế — cơ thể mẹ thường tự điều chỉnh theo nhu cầu bú của bé. Nếu bé vẫn có đủ tã ướt/tã bẩn và tăng cân đều theo lịch khám, đây thường là dấu hiệu ổn, dù mẹ có thể không cảm nhận được điều đó.
*Nguồn: WHO, UNICEF (adapted)*

**Entry #16** — Tag: Y_TE
Nếu ngực mẹ sưng đỏ, đau nhức kèm sốt, hoặc có vùng cứng bất thường không giảm sau khi cho bú/hút sữa — đây có thể là dấu hiệu tắc tia sữa hoặc viêm vú, cần được bác sĩ hoặc chuyên gia tư vấn sữa mẹ (lactation consultant) kiểm tra sớm.
*Nguồn: ACOG, Mayo Clinic (adapted)*

**Entry #17** — Tag: EMOTIONAL
Nếu mẹ cần hoặc chọn dùng sữa công thức — vì bất kỳ lý do gì — điều đó không làm mẹ trở thành người mẹ kém hơn. Một em bé được nuôi dưỡng đầy đủ và một người mẹ ổn định về tinh thần quan trọng hơn nhiều so với việc tuân theo một tiêu chuẩn duy nhất.
*Nguồn: PSI (adapted)*

**Entry #18** — Tag: Y_TE
Nếu bé bú thường xuyên nhưng vẫn không tăng cân đủ theo các mốc khám định kỳ, đi tiểu rất ít, hoặc có dấu hiệu vàng da kéo dài — đây là lúc cần đưa bé đi khám bác sĩ nhi để kiểm tra, thay vì tự điều chỉnh cách cho bú tại nhà.
*Nguồn: WHO, Mayo Clinic (adapted)*

### Nhóm 5 — Quá tải giác quan ("touched out")

**Entry #19** — Tag: EMOTIONAL
Cảm giác muốn "thoát" khỏi việc bị chạm vào liên tục — dù là bởi em bé hay bạn đời — là một phản ứng thần kinh rất thật khi cơ thể mẹ bị "sử dụng" quá mức cả ngày. Đây không có nghĩa là mẹ không yêu con hay không yêu bạn đời; đó là dấu hiệu cơ thể mẹ cần một khoảng nghỉ giác quan.
*Nguồn: PSI (adapted)*

**Entry #20** — Tag: EMOTIONAL
Xin 10-15 phút không ai chạm vào mình mỗi ngày — dù là để tắm một mình hay ngồi yên lặng — không phải là ích kỷ. Đây là một nhu cầu hợp lý, và việc nói rõ với bạn đời hoặc người thân rằng mẹ cần điều này có thể giúp giảm cảm giác quá tải đáng kể.
*Nguồn: PSI (adapted)*

**Entry #30** — Tag: EMOTIONAL — *Mới v3 · cửa vào từ bé*
Con chỉ chịu mẹ bế dù mẹ đã rất mệt — phổ biến vì con tìm an toàn quen thuộc ở mẹ; muốn "thoát" một lúc không có nghĩa là không yêu con, mà là dấu hiệu cơ thể cần nghỉ giác quan.
*Nguồn: `[THIẾU — cần nguồn]` (dòng 888; phần "muốn thoát" trùng #19, nguồn PSI; phần "con tìm an toàn quen thuộc ở mẹ" là nhận định về hành vi của bé — cần nguồn riêng)*

### Nhóm 6 — Cơ thể hồi phục bị lãng quên

**Entry #21** — Tag: EMOTIONAL *(Tier trong prompt: T2)*
Cơ thể mẹ cần khoảng 6-8 tuần để hồi phục cơ bản sau sinh thường, và lâu hơn nếu sinh mổ — nhưng nhiều chức năng như nội tiết tố, sàn chậu, hay vóc dáng có thể mất nhiều tháng để ổn định hoàn toàn. Đây là một quá trình, không phải một deadline mẹ cần chạy đua.
*Nguồn: ACOG, Mayo Clinic (adapted)*

**Entry #22** — Tag: EMOTIONAL
Việc gần như mọi cuộc hỏi thăm đều xoay quanh em bé, trong khi không ai hỏi vết khâu của mẹ đã đỡ chưa, là một trải nghiệm rất phổ biến — dù không công bằng. Mẹ hoàn toàn có quyền chủ động chia sẻ về quá trình hồi phục của mình, không cần chờ ai hỏi trước.
*Nguồn: adapted, local context*

**Entry #23** — Tag: EMOTIONAL *(Tier trong prompt: T2)*
Đau hoặc khó chịu khi quan hệ trở lại sau sinh là điều rất phổ biến, đặc biệt trong vài tháng đầu, và thường liên quan đến thay đổi nội tiết tố hoặc mô chưa hồi phục hoàn toàn. Không cần vội — dùng gel bôi trơn, giao tiếp cởi mở với bạn đời, và cho cơ thể thêm thời gian đều là những cách tiếp cận hợp lý.
*Nguồn: ACOG (adapted)*

**Entry #24** — Tag: Y_TE
Nếu mẹ bị rò rỉ nước tiểu khi ho/cười/vận động, cảm giác nặng/sa vùng chậu, hoặc đau vùng chậu kéo dài sau nhiều tuần, đây là những dấu hiệu nên được kiểm tra bởi bác sĩ hoặc chuyên gia phục hồi chức năng sàn chậu (pelvic floor therapist) — đây là tình trạng phổ biến và có thể điều trị được, không phải điều mẹ phải sống chung suốt đời.
*Nguồn: ACOG, Mayo Clinic (adapted)*

**Entry #31** — Tag: EMOTIONAL — *Mới v3 · cửa vào từ bé*
Lịch khám/tiêm của con được nhắc từng tuần nhưng lịch tái khám sau sinh của mẹ dễ bị quên — mẹ có quyền tự đặt lịch cho mình, không cần chờ ai nhắc.
*Nguồn: `[THIẾU — cần nguồn]` (dòng 893). Lưu ý: ngầm khẳng định có "lịch tái khám sau sinh" — nên đối chiếu với khuyến nghị của WHO/ACOG và thực tế khám hậu sản tại Việt Nam trước khi giữ nguyên.*

### Nhóm 7 — Căng thẳng mối quan hệ

**Entry #25** — Tag: EMOTIONAL
Hầu hết các cặp đôi đều trải qua căng thẳng gia tăng trong năm đầu sau khi có con — do thiếu ngủ, thay đổi vai trò, và ít thời gian cho nhau hơn. Đây thường là một giai đoạn sẽ dịu lại, không phải dấu hiệu cho thấy mối quan hệ đang tan vỡ.
*Nguồn: adapted, general relationship research*

**Entry #26** — Tag: EMOTIONAL
Cảm thấy một mình trong hôn nhân dù bạn đời vẫn ở đó — vì cả hai đều kiệt sức và ít giao tiếp hơn — là điều nhiều mẹ trải qua. Một câu nói ngắn, cụ thể về điều mẹ cần (ví dụ: "30 phút anh bế con để em nghỉ") thường hiệu quả hơn là chờ đối phương tự hiểu.
*Nguồn: adapted, local context*

**Entry #27** — Tag: Y_TE
Nếu mâu thuẫn đi kèm với việc bị đe dọa, kiểm soát, hoặc bạo lực dưới bất kỳ hình thức nào — đây không còn là "căng thẳng bình thường sau sinh" mà là một tình huống cần hỗ trợ chuyên môn. Có thể liên hệ CSAGA (024 3333 5599) hoặc Ngôi nhà Bình yên (1900 969 680) để được hỗ trợ an toàn và bảo mật.
*Nguồn: CSAGA, Ngôi nhà Bình yên (verified contacts)*

**Entry #32** — Tag: EMOTIONAL — *Mới v3 · cửa vào từ bé*
Con quấy đúng lúc bố vừa đi làm về khiến hai vợ chồng không kịp nói chuyện — lặp lại mỗi ngày dễ thấy xa cách dù vẫn ở cạnh nhau; đây là giai đoạn cần thêm thông cảm, không phải dấu hiệu mối quan hệ có vấn đề.
*Nguồn: `[THIẾU — cần nguồn]` (dòng 896; cùng tinh thần #25/#26 — nguồn "general relationship research", cần cụ thể hóa)*

### Nhóm đặc biệt — An toàn tâm thần (không thuộc 7 scenarios)

**Entry #33** — Tag: Y_TE (T3-PSYCHIATRIC) — *Mới v3 trong framework (đã có trong prompt)*
Ý nghĩ muốn làm hại bản thân hoặc em bé — dù chỉ thoáng qua — cần hỗ trợ ngay, không phải điều mẹ nên tự xử lý một mình. Trong giờ: HOPE (0865 044 400). Ngoài giờ/khẩn cấp: 115 hoặc bệnh viện gần nhất ngay.
*Nguồn: `[THIẾU — cần nguồn]` (dòng 898). Số HOPE đã verified ở mục 2; giờ hoạt động 16:30–20:30. Nội dung nên được chuyên gia tâm thần/tâm lý review đầu tiên.*

---

## 6. Nội Dung "Ngoài Entries" Đang Sống Trong Prototype

Các nội dung dưới đây mẹ đọc trực tiếp nhưng **không** nằm trong 33 entries, nên dễ bị bỏ sót khi review. `[SUY LUẬN]` nên cùng áp chuẩn: nguồn, tag, và một lượt review chuyên môn.

| Nội dung | Vị trí | Cách liên hệ với entries | Vấn đề phát hiện |
|---|---|---|---|
| **TIPS — mẹo ngày** (8 mẹo theo stressor + 1 mẹo mặc định) | dòng 808–818 | Mỗi mẹo là bản rút gọn của một entry (vd: "Cho con bú" ≈ #15; "Cơ thể chưa hồi phục" ≈ #21) | `[MÂU THUẪN]` Tag: "Cho con bú" và "Cơ thể chưa hồi phục" là **Y_TE** trong TIPS (kèm nguồn WHO/UNICEF, ACOG/Mayo) nhưng **EMOTIONAL** ở #15 và #21. Mẹo "Áp lực tiền bạc" **không có entry gốc**. |
| **Hero theo tuần** — chọn mẹo theo số tuần sau sinh (0–2: ẩn; 3–6: "Cơ thể chưa hồi phục"; 7–12: "Không còn là mình"; 13+: "Cô đơn, không ai hỏi han") | build spec §4.2.1 (`wkIdx`) | Dùng lại TIPS | `[SUY LUẬN]` Quyết định "tuần nào → chủ đề nào" là quyết định nội dung, chưa có nguồn y khoa/tâm lý nào ghi lại cho các mốc 3/7/13. `[THIẾU]` |
| **Kịch bản cố định** (`cry`, `milk`, `milkok`, `phys`, `baby3`, `psy`, `safe`, `oos`, `hold`, `generic`, `drift0–4`) | dòng 1130–1182 | `cry` ≈ #1, `milk` ≈ #15, `phys` ≈ #2, `hold` ≈ #30… | Văn bản viết lại, không phải trích nguyên entry → có nguy cơ lệch nghĩa so với entry. `[THIẾU]` chưa có bảng đối chiếu từng câu |
| **Tin mở đầu từ check-in** (`mkOpener`) | build spec §5.9 | Chuyển check-in thành câu mở đầu + chip gợi ý | Chưa review |
| **Câu phản chiếu** (`reflect()`): *"mình thấy mẹ đã mệt vài ngày liền — mẹ có muốn nói chuyện một chút không?"* | build spec §4.2.7 | Hiện thực "mình thấy mẹ đã mệt vài ngày liền" của scope-doc | Chưa review |
| **Chip gợi ý** (`CHIP_Q`, 15 cặp stressor/mood → câu hỏi mẫu) | build spec §4.2.4 | — | Chip "Mình lo chuyện tiền bạc và đi làm lại" dẫn tới LLM nhưng KB **không có** entry → LLM dễ suy diễn |
| **Trạng thái "Đang mở/Ngoài giờ" của HOPE** | dòng 1318–1328 | Thuộc mục 2 | Prototype dùng nút bật/tắt tay |

## 7. Việc Cần Làm Tiếp

1. **Thêm nguồn cho 6 entry mới (#28–#33)** hoặc hạ cấp/loại bỏ nếu không tìm được nguồn đáng tin. Đánh đổi: tìm nguồn mất thời gian ≈ 1 work-session ngắn nhưng giữ được nguyên tắc "adapt từ nguồn uy tín" của framework; giữ nguyên không nguồn thì nhanh nhưng vi phạm nguyên tắc mục 1.
2. **Quyết định cho entry thiếu / lệch** (bảng 3.1): thêm #2 vào prompt; thống nhất tag cho TIPS (#15, #21).
3. **Quyết định cho khoảng trống "áp lực tiền bạc"** (scope-doc v3).
4. **Sửa số CSAGA trong banner** (mục 2).
5. **Tìm reviewer chuyên môn** (carry-over từ v2): ưu tiên #6, #33, #27, #2, #3 (Tier 3) rồi tới #21, #31.
6. Cập nhật `system-prompt` khi thêm/sửa entry (hiện hai tài liệu đã đồng bộ tại thời điểm 30/10/2026).

---

**Tổng cộng: 33 entries** — 25 EMOTIONAL + 8 Y_TE (*thay cho "27 entries … 14 EMOTIONAL" của v2, xem changelog #4*). Trong đó 32 entries đang được nhúng trong system prompt của prototype (thiếu #2). Đủ để nạp trực tiếp vào context của AI companion — chưa cần vector database.