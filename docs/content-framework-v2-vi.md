# Khung Nội Dung (Content Curation Framework) — v2

*Tài liệu này là bước 2 trong roadmap: dùng để curate entries cho AI companion.*

---

## Thay Đổi So Với V1 (Changelog)

- **Xưng hô trong nội dung tương lai:** dùng "mẹ" thay vì "chị" khi viết entry mới (27 entries hiện có đã dùng "mẹ" ở dạng mô tả/tường thuật, không cần sửa).
- **Xác nhận kiến trúc Bubble:** 27 entries hiện tại **không** trở thành một Data Type sống trong Bubble — nhúng trực tiếp làm static text trong system prompt gửi qua API Connector (không đổi so với v1, chỉ làm rõ để tránh làm dư việc khi build).
- **Cửa vào từ câu hỏi về bé — đã hoàn thành (v2.1):** 5 scenario còn thiếu (2, 3, 5, 6, 7) nay đã có entry dùng câu hỏi về tình trạng bé làm điểm vào — Entry #28–#32, soạn bởi Claude (Cowork), Vân đã duyệt. Bảng theo dõi bên dưới đã cập nhật.
- **Xác nhận không mở rộng:** không biến nội dung về bé thành một baby-care encyclopedia (lịch ăn ngủ tổng quát, mốc phát triển toàn diện) — giữ nguyên nguyên tắc nội dung về bé chỉ tồn tại trong phạm vi 7 scenarios hiện có.

### TODO — Cửa Vào Từ Câu Hỏi Về Bé (theo dõi tiến độ)

| Scenario | Có entry dùng câu hỏi về bé làm cửa vào chưa? | Ghi chú |
|---|---|---|
| 1. Cơn khủng hoảng 2 giờ sáng | ✅ Có (Entry #1, #3) | |
| 2. Matrescence | ✅ Có (Entry #28) | Cửa vào: nhịp bú/ngủ của con cuốn trọn ngày mẹ → dẫn tới "không còn là mình" |
| 3. Gánh nặng vô hình / cô lập | ✅ Có (Entry #29) | Cửa vào: mọi người hỏi han con, không ai hỏi mẹ → dẫn tới cảm giác bị bỏ quên |
| 4. Áp lực cho con bú | ✅ Có (Entry #15, #16, #18) | |
| 5. Quá tải giác quan ("touched out") | ✅ Có (Entry #30) | Cửa vào: "con không chịu ai bế ngoài mẹ" → dẫn tới touched-out |
| 6. Cơ thể hồi phục bị lãng quên | ✅ Có (Entry #31) | Cửa vào: lịch khám/tiêm của con được nhắc, lịch tái khám của mẹ thì không |
| 7. Căng thẳng mối quan hệ | ✅ Có (Entry #32) | Cửa vào: "con quấy khi bố đi làm về" → dẫn tới căng thẳng vợ chồng |

Cả 7/7 scenario nay đều có cửa vào từ câu hỏi về bé.

---

## 1. Nguồn Tham Khảo Uy Tín (Trusted Reference Sources)

Dùng để **adapt** (không dịch nguyên văn) sang tiếng Việt, với giọng văn gần gũi thay vì "clinical":

- **WHO** — hướng dẫn chăm sóc hậu sản (postpartum care guidelines)
- **ACOG** (American College of Obstetricians and Gynecologists) — phục hồi thể chất sau sinh
- **Mayo Clinic** — các mốc hồi phục sau sinh, dấu hiệu cảnh báo
- **Postpartum Support International (PSI)** — trầm cảm và lo âu sau sinh, matrescence
- Nghiên cứu học thuật về PPD tại Việt Nam (BMC Women's Health, 2023) — cho context địa phương: ~20% mẹ Việt gặp PPD, và nhiều mẹ tìm đến "thầy bói" hoặc truyền miệng thay vì y học hiện đại — đây chính là insight xác nhận lý do sản phẩm này cần tồn tại

**Lưu ý quan trọng:** chưa có ai có chuyên môn y khoa review nội dung. Vì vậy, mọi entry liên quan thể chất/y tế phải giữ lập trường **non-diagnostic** — mô tả điều gì là phổ biến/bình thường, sau đó luôn redirect đến bác sĩ thật cho bất kỳ điều gì cụ thể.

## 2. Tài Nguyên An Toàn Khẩn Cấp (Verified — cần double-check lại trước khi launch)

| Dịch vụ | Số điện thoại | Giờ hoạt động | Dùng khi nào |
|---|---|---|---|
| Cấp cứu y tế quốc gia | **115** | 24/7 | Bất kỳ tình huống khẩn cấp nào, kể cả ngoài giờ các hotline khác |
| Đường dây nóng Ngày Mai (hỗ trợ tâm lý) | **0963 061 414** | Chiều-tối, không phải mỗi ngày (verify lại lịch cụ thể tại duongdaynongngaymai.vn) | Cảm xúc quá tải, cần người lắng nghe |
| Đường dây nóng HOPE (suicide prevention) | **0865 044 400** | Hằng ngày 16:30–20:30 | Ý nghĩ tự làm hại bản thân |
| Tổng đài Bảo vệ Trẻ em Quốc gia | **111** | 24/7 | Nếu có lo ngại về an toàn của em bé |
| CSAGA (bạo lực giới) | **024 3333 5599** | Giờ hành chính | Nếu "relationship friction" leo thang thành bạo lực |
| Ngôi nhà Bình yên (Peace House Shelter) | **1900 969 680** | 24/7 (điện thoại/SMS) | Phụ nữ cần nơi trú ẩn an toàn |

**Design rule cho red-flag/crisis:** nếu phát hiện ngôn ngữ nguy hiểm (ý nghĩ tự hại, hại em bé, triệu chứng nghiêm trọng) **ngoài giờ hoạt động** của Ngày Mai/HOPE, app phải hiển thị rõ: gọi 115 ngay, hoặc liên hệ người thân/người tin cậy gần nhất — không được giả vờ có hỗ trợ 24/7 khi thực tế không có.

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
| 3. Gánh nặng vô hình / cô lập | "Kiêng cữ truyền thống và lời khuyên hiện đại — dung hòa thế nào" | EMOTIONAL |
| | "Cảm giác cô đơn dù xung quanh đầy người" | EMOTIONAL |
| 4. Áp lực cho con bú | "Sữa mẹ không đủ — bình thường hơn mẹ nghĩ" | EMOTIONAL |
| | "Dấu hiệu tắc tia sữa / viêm vú cần đi khám" | Y_TE |
| 5. Quá tải giác quan ("touched out") | "Vì sao mẹ muốn 'trốn' khỏi chính cơ thể mình — đây là phản ứng bình thường" | EMOTIONAL |
| 6. Cơ thể hồi phục bị lãng quên | "Các mốc hồi phục bình thường sau sinh (theo tuần)" | EMOTIONAL |
| | "Dấu hiệu cảnh báo cần gọi bác sĩ ngay (ra máu nhiều, sốt, nhiễm trùng vết khâu)" | Y_TE |
| 7. Căng thẳng mối quan hệ | "Vì sao mâu thuẫn tăng sau khi có con — đây là giai đoạn, không phải dấu chấm hết" | EMOTIONAL |
| | "Khi căng thẳng trở thành bạo lực — cần tìm ai" | Y_TE (redirect CSAGA/Peace House) |

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

## 5. Các Entries Còn Lại (Entry #3 – #32)

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

**Entry #28** — Tag: EMOTIONAL *(cửa vào từ câu hỏi về bé)*
Con bú 2–3 tiếng một lần, ngủ không theo giờ giấc nào cố định — nhịp sinh học của con đang cuốn trọn lấy cả ngày của mẹ, và điều đó hoàn toàn bình thường ở giai đoạn sơ sinh. Nhưng nếu mẹ chợt nhận ra mình không còn nhớ lần cuối làm điều gì "chỉ cho riêng mình" là khi nào, đó không phải vì mẹ đánh mất bản thân — đó là matrescence, quá trình chuyển đổi thành mẹ đang diễn ra, và nó cần thời gian để mẹ tìm lại nhịp của chính mình bên cạnh nhịp của con.
*Nguồn: PSI, nghiên cứu của Aurélie Athan về matrescence (adapted)*

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

**Entry #29** — Tag: EMOTIONAL *(cửa vào từ câu hỏi về bé)*
Mọi người xúm vào hỏi con bú được bao nhiêu, ngủ có ngon không, tăng cân thế nào — đó là những câu hỏi quan tâm thật lòng đến con. Nhưng nếu mẹ nhận ra gần như không ai hỏi mẹ có ngủ được không, có mệt không, cảm giác bị bỏ quên giữa những người quan tâm là một nghịch lý rất thật của giai đoạn hậu sản, không phải vì mẹ nhạy cảm quá mức.
*Nguồn: PSI (adapted)*

### Nhóm 4 — Áp lực cho con bú

**Entry #15** — Tag: EMOTIONAL
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

**Entry #30** — Tag: EMOTIONAL *(cửa vào từ câu hỏi về bé)*
Con không chịu ai bế ngoài mẹ, kể cả khi mẹ đã rất mệt và chỉ muốn được nghỉ tay một chút — đây là điều rất phổ biến ở trẻ sơ sinh, vì con tìm thấy sự an toàn quen thuộc nhất ở mẹ. Nhưng nếu cảm giác được bế, được chạm vào liên tục cả ngày khiến mẹ chỉ muốn "thoát" ra một lúc, đó không có nghĩa là mẹ không yêu con — đó là dấu hiệu cơ thể mẹ đang quá tải giác quan và cần một khoảng nghỉ thật sự, dù chỉ vài phút.
*Nguồn: PSI (adapted)*

### Nhóm 6 — Cơ thể hồi phục bị lãng quên

**Entry #21** — Tag: EMOTIONAL
Cơ thể mẹ cần khoảng 6-8 tuần để hồi phục cơ bản sau sinh thường, và lâu hơn nếu sinh mổ — nhưng nhiều chức năng như nội tiết tố, sàn chậu, hay vóc dáng có thể mất nhiều tháng để ổn định hoàn toàn. Đây là một quá trình, không phải một deadline mẹ cần chạy đua.
*Nguồn: ACOG, Mayo Clinic (adapted)*

**Entry #22** — Tag: EMOTIONAL
Việc gần như mọi cuộc hỏi thăm đều xoay quanh em bé, trong khi không ai hỏi vết khâu của mẹ đã đỡ chưa, là một trải nghiệm rất phổ biến — dù không công bằng. Mẹ hoàn toàn có quyền chủ động chia sẻ về quá trình hồi phục của mình, không cần chờ ai hỏi trước.
*Nguồn: adapted, local context*

**Entry #23** — Tag: EMOTIONAL
Đau hoặc khó chịu khi quan hệ trở lại sau sinh là điều rất phổ biến, đặc biệt trong vài tháng đầu, và thường liên quan đến thay đổi nội tiết tố hoặc mô chưa hồi phục hoàn toàn. Không cần vội — dùng gel bôi trơn, giao tiếp cởi mở với bạn đời, và cho cơ thể thêm thời gian đều là những cách tiếp cận hợp lý.
*Nguồn: ACOG (adapted)*

**Entry #24** — Tag: Y_TE
Nếu mẹ bị rò rỉ nước tiểu khi ho/cười/vận động, cảm giác nặng/sa vùng chậu, hoặc đau vùng chậu kéo dài sau nhiều tuần, đây là những dấu hiệu nên được kiểm tra bởi bác sĩ hoặc chuyên gia phục hồi chức năng sàn chậu (pelvic floor therapist) — đây là tình trạng phổ biến và có thể điều trị được, không phải điều mẹ phải sống chung suốt đời.
*Nguồn: ACOG, Mayo Clinic (adapted)*

**Entry #31** — Tag: EMOTIONAL *(cửa vào từ câu hỏi về bé)*
Lịch khám, tiêm phòng, theo dõi cân nặng của con được nhắc đến từng tuần — nhưng giữa tất cả những mốc đó, mẹ có để ý mình đã có lịch tái khám sau sinh nào cho bản thân chưa? Cơ thể mẹ cũng cần được theo dõi định kỳ như con, chỉ là thường bị quên đi vì mọi sự chú ý đã dồn hết vào em bé — mẹ hoàn toàn có quyền tự đặt lịch cho mình, không cần chờ ai nhắc.
*Nguồn: ACOG, Mayo Clinic (adapted)*

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

**Entry #32** — Tag: EMOTIONAL *(cửa vào từ câu hỏi về bé)*
Con quấy khóc đúng lúc bố vừa đi làm về, khiến cả hai không kịp nói với nhau một câu trọn vẹn trước khi xử lý con — những khoảnh khắc nhỏ như vậy lặp lại mỗi ngày dễ khiến hai vợ chồng cảm thấy xa cách dù vẫn ở cạnh nhau. Đây không phải dấu hiệu mối quan hệ có vấn đề, mà là một giai đoạn cần thêm sự thông cảm — đôi khi chỉ cần nói rõ với nhau "mình cùng mệt, mình cùng cố" là đủ để giảm bớt căng thẳng.
*Nguồn: adapted, local context*

---

**Tổng cộng: 32 entries hiện có** (25 EMOTIONAL, 7 Y_TE, phủ đều 7/7 scenarios — mỗi scenario nay đều có cửa vào từ câu hỏi về bé). ⚠️ *Ghi chú: con số "14 EMOTIONAL" ở bản 27-entry trước đây là đếm sai so với tag thực tế trong tài liệu (phải là 20 EMOTIONAL / 7 Y_TE) — con số trên đã tính lại cho đúng, không phải lỗi mới từ đợt cập nhật này.* Đủ để nạp trực tiếp vào context của AI companion — chưa cần vector database.

*Bước tiếp theo: dán Entry #28–#32 (bản rút gọn 1 dòng, xem system-prompt-v2-vi.md) vào khối "Cơ sở kiến thức" của system prompt và vào `SYSTEM_PROMPT` trong meoi-prototype.jsx — đã thực hiện trong cùng đợt cập nhật này.*
