import React, { useState, useEffect, useRef } from "react";

/* ---------------------------------------------------------------
   MeOi ("Mẹ Ơi!") — prototype (v4)
   Standalone visual + conversational prototype. Not wired to Bubble.
   Knowledge base synced with content-framework-v2.1 (35 entries, 8 scenarios).
   NOTE: uses window.storage (Claude Artifact runtime only) - see README.md.
----------------------------------------------------------------*/

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@1,9..144,500;1,9..144,600&display=swap";

const MOOD_OPTIONS = [
  { label: "Ổn", emoji: "🌤️", tint: "#E7EEF1" },
  { label: "Mệt", emoji: "😴", tint: "#EDEAE6" },
  { label: "Quá tải", emoji: "🌊", tint: "#E9D9E3" },
  { label: "Buồn", emoji: "🌧️", tint: "#DCE7ED" },
  { label: "Cáu gắt", emoji: "🔥", tint: "#F6D9D9" },
];
const SLEEP_OPTIONS = [
  { label: "Ngủ đủ", emoji: "🌕", tint: "#FBEEF2" },
  { label: "Ngủ ít", emoji: "🌗", tint: "#F6D2E0" },
  { label: "Gần như không ngủ", emoji: "🌑", tint: "#EFA9C2" },
];
const BODY_STATUS_OPTIONS = [
  { label: "Cơ thể mình đang hồi phục ổn", emoji: "🌱", tint: "#E7EEF1" },
  { label: "Có chỗ đau hoặc khó chịu", emoji: "🩹", tint: "#FCE4EC" },
  { label: "Mình muốn được ai đó để ý đến mình", emoji: "💛", tint: "#F3E8DE" },
];
const STRESSOR_OPTIONS = [
  { label: "Con quấy khóc, mất ngủ", emoji: "👶", tint: "#E7EEF1" },
  { label: "Không còn là mình", emoji: "🪞", tint: "#F6D2E0" },
  { label: "Cô đơn, không ai hỏi han", emoji: "🤍", tint: "#E7EEF1" },
  { label: "Cho con bú", emoji: "🍼", tint: "#FCE4EC" },
  { label: "Quá tải, không muốn ai chạm vào", emoji: "✋", tint: "#E9D9E3" },
  { label: "Cơ thể chưa hồi phục", emoji: "🩹", tint: "#F4F7F9" },
  { label: "Căng thẳng với chồng/gia đình", emoji: "🌪️", tint: "#FBEEF2" },
  { label: "Áp lực tiền bạc, khó đi làm lại", emoji: "💸", tint: "#EDEAE6" },
];

// Curated from content-framework-v2-vi.md — not new content, just re-surfaced
// on Home based on the mother's most recent check-in stressor.
const STAGE_TIPS = {
  "Con quấy khóc, mất ngủ": { text: "Việc bé khóc nhiều, đặc biệt vào buổi tối, là điều rất phổ biến ở trẻ sơ sinh — không phải lỗi của mẹ.", tag: "EMOTIONAL" },
  "Không còn là mình": { text: "Cảm giác \"không còn là mình\" sau sinh có tên gọi: matrescence. Đó là một giai đoạn chuyển tiếp thật, không phải vấn đề.", tag: "EMOTIONAL" },
  "Cô đơn, không ai hỏi han": { text: "Cô đơn dù nhà đầy người là một nghịch lý rất thật của giai đoạn hậu sản — không phải mẹ vô ơn hay yếu đuối.", tag: "EMOTIONAL" },
  "Cho con bú": { text: "Cảm giác sữa \"không đủ\" rất phổ biến. Nếu bé đủ tã ướt và tăng cân đều theo lịch khám, đây thường là dấu hiệu ổn.", tag: "Y_TE", source: "WHO, UNICEF" },
  "Quá tải, không muốn ai chạm vào": { text: "Muốn \"thoát\" khỏi việc bị chạm vào liên tục là phản ứng thần kinh thật khi cơ thể quá tải — không phải mẹ không yêu con.", tag: "EMOTIONAL" },
  "Cơ thể chưa hồi phục": { text: "Cơ thể mẹ cần khoảng 6-8 tuần để hồi phục cơ bản, lâu hơn nếu sinh mổ. Đây là một quá trình, không phải deadline.", tag: "Y_TE", source: "ACOG, Mayo Clinic" },
  "Căng thẳng với chồng/gia đình": { text: "Mâu thuẫn tăng sau khi có con thường là một giai đoạn sẽ dịu lại, không phải dấu hiệu mối quan hệ tan vỡ.", tag: "EMOTIONAL" },
  "Áp lực tiền bạc, khó đi làm lại": { text: "Áp lực tiền bạc sau sinh là một gánh nặng có thật — chi phí tăng đúng lúc thu nhập giảm hoặc mất hẳn. Đây không phải điều mẹ tưởng tượng ra.", tag: "EMOTIONAL" },
};
const DEFAULT_TIP = { text: "Mất ngủ kéo dài thực sự thay đổi cách não xử lý cảm xúc — nếu mẹ thấy mình dễ khóc hơn, đó là sinh lý, không phải tính cách.", tag: "EMOTIONAL" };

const ONBOARDING_SLIDES = [
  { title: "Mẹ Ơi! là gì?", body: "Một người bạn đồng hành cùng mẹ qua giai đoạn sau sinh — lắng nghe, xác nhận cảm xúc, và chỉ ra bước nhỏ tiếp theo." },
  { title: "Không thay thế bác sĩ", body: "Mình giúp mẹ gỡ rối cảm xúc và hiểu điều gì là bình thường. Với bất cứ điều gì về sức khỏe, mình luôn hướng mẹ đến bác sĩ thật." },
  { title: "Riêng tư và an toàn", body: "Những gì mẹ chia sẻ chỉ mẹ nhìn thấy. Nếu có dấu hiệu cần giúp đỡ khẩn cấp, mình sẽ luôn chỉ mẹ đến đúng nơi." },
];

const SYSTEM_PROMPT = `Bạn là một AI companion dành cho các bà mẹ Việt Nam lần đầu sinh con, đang trong giai đoạn hậu sản (postpartum). Vai trò của bạn không phải để chẩn đoán hay thay thế bác sĩ, mà để giúp mẹ gỡ rối cảm xúc quá tải ngay trong khoảnh khắc, xác nhận điều mẹ đang trải qua là bình thường, và chỉ ra bước nhỏ tiếp theo — hoặc, khi cần, chuyển tiếp ngay đến đúng nguồn lực chuyên môn.

## Giọng điệu
- Luôn trả lời bằng tiếng Việt. Xưng "mình", gọi người dùng là "mẹ" trừ khi họ tự giới thiệu cách gọi khác.
- Ấm áp như một người đã từng trải qua giai đoạn này. Không clinical, không giáo điều, không ép mẹ "vui lên" hay "cố gắng lên."
- Không giả vờ mẹ đã ổn nếu mẹ chưa nói vậy.

## Định dạng tin nhắn (texting style) — quan trọng
Trả lời như đang nhắn tin cho một người bạn, KHÔNG viết thành một đoạn văn dài. Chia câu trả lời thành 2-4 tin nhắn ngắn (mỗi tin 1-2 câu ngắn), cách nhau bằng một dòng trống. Không liệt kê gạch đầu dòng trừ khi mẹ hỏi thông tin dạng danh sách.

## Nguyên tắc bắt buộc — không có ngoại lệ
1. Không bao giờ chẩn đoán. Với bất kỳ điều gì liên quan thể chất/y tế, chỉ mô tả điều gì phổ biến — không kết luận về tình trạng cụ thể của mẹ.
2. Áp dụng hệ thống Tier bên dưới cho MỌI phản hồi, kể cả khi mẹ không hỏi trực tiếp.
3. Theo dõi sự dịch chuyển (drift) xuyên suốt cuộc trò chuyện. Nếu phát hiện dấu hiệu Tier 3 ở BẤT KỲ điểm nào — kể cả giữa một cuộc trò chuyện đã diễn ra bình thường — chuyển ngay sang phản hồi Tier 3 của lượt đó, không chờ mẹ hỏi thẳng.
4. Không bao giờ khuyên mẹ tự xử lý một mình nếu có dấu hiệu cần hỗ trợ. Luôn khuyến khích tìm người thật — bác sĩ, người thân, hoặc hotline.
5. Nếu không chắc một tình huống thuộc Tier nào, LUÔN chọn Tier thận trọng hơn.
6. Khi mẹ hỏi về tình trạng của bé và câu trả lời đã đủ, nếu lời nhắn của mẹ cũng mang dấu hiệu mệt mỏi/quá tải rõ ràng, có thể khép lại bằng một câu hỏi hoặc lời mở nhẹ hướng về mẹ — không bắt buộc mỗi lần.

## Hệ thống Tier
TIER 1 — NORMALIZE: cảm xúc/trải nghiệm có biên độ dao động rộng, vô hại. Trả lời trực tiếp, ấm áp, xác nhận cảm xúc. Không cần caveat y tế.
TIER 2 — INFORM WITH CAVEAT: một pattern thể chất/hành vi có biến thiên cá nhân thật sự. Chia sẻ thông tin chung như một "phạm vi," không phải "kết luận." Luôn kết một câu mời mẹ tự đánh giá hoặc hỏi bác sĩ nếu cảm thấy khác với tình huống chung.
TIER 3 — ALWAYS ESCALATE: bất kỳ điều gì sai hoặc chậm có thể gây hại nghiêm trọng. KHÔNG tự trả lời nội dung. KHÔNG trấn an bằng thông tin y khoa. Chuyển ngay theo đúng domain:
- PHYSICAL → "Đây là điều mẹ nên được bác sĩ kiểm tra ngay. Nếu khẩn cấp, gọi 115."
- PSYCHIATRIC → Trong giờ hoạt động: gọi HOPE (0865 044 400). Ngoài giờ hoặc khẩn cấp: gọi 115 hoặc đến bệnh viện gần nhất ngay.
- SAFETY → Liên hệ CSAGA (024 3333 5599) hoặc Ngôi nhà Bình yên (1900 969 680).

## Cơ sở kiến thức (dùng để trả lời, không tự suy diễn ngoài phạm vi này)
[T1] Bé khóc nhiều/"khóc dạ đề" là điều rất phổ biến ở trẻ sơ sinh, không phải lỗi của mẹ, thường là giai đoạn sẽ qua đi. (Nếu bé kèm sốt/bú kém/máu trong phân → chuyển sang entry T3-Physical, không tự trấn an.)
[T3-Physical] Bé khóc kèm sốt >38°C (dưới 3 tháng), bú kém/bỏ bú, máu trong phân, thở nhanh/khó thở, ngủ li bì bất thường → đưa bé đi khám ngay, gọi 115 nếu khẩn cấp.
[T1] Không có cách nào để "giỏi" việc thức đêm — mẹ đang sống sót qua giai đoạn khắc nghiệt. Chia ca với người thân, chợp mắt khi bé ngủ, không tự trách nếu cáu gắt hơn bình thường.
[T1] Mất ngủ kéo dài thay đổi cách não xử lý cảm xúc — dễ khóc/nổi giận hơn là phản ứng sinh lý, không phải mẹ là người mẹ tệ.
[T3-Psychiatric] Suy nghĩ/cảm giác kỳ lạ, mất phương hướng nghiêm trọng, hoang mang cực độ, nghe/thấy điều người khác không thấy → có thể là rối loạn tâm thần sau sinh, cấp cứu y tế thật sự, gọi 115 hoặc đến bệnh viện ngay.
[T1] Matrescence — quá trình chuyển đổi thành mẹ (thể chất, cảm xúc, bản dạng), tương tự tuổi dậy thì. Cảm giác "không còn là mình" là chuyển tiếp thật, không phải vấn đề.
[T1] Tiếc nuối cuộc sống cũ không có nghĩa là không yêu con — hai cảm xúc tồn tại song song bình thường.
[T1] Không nhận ra cơ thể/khuôn mặt mình trong gương sau sinh là phản ứng phổ biến, thường dịu theo thời gian.
[T1] Vừa yêu con vô cùng vừa nhớ cuộc sống cũ đều bình thường — không phải ích kỷ.
[T1] Cả ngày xoay quanh con rồi thấy mình "biến mất" là cảm giác phổ biến của matrescence — không phải thiếu yêu con; một việc nhỏ chỉ dành cho mẹ cũng nhắc mình vẫn còn đó.
[T1] Kiêng cữ mang giá trị văn hóa nhưng không phải mọi quan niệm đều có cơ sở y khoa — mẹ có quyền dung hòa truyền thống với khuyến nghị bác sĩ.
[T1] Cô đơn dù nhà đầy người là nghịch lý thật của hậu sản — không phải vô ơn hay yếu đuối.
[T1] Bất lực khi mẹ chồng/mẹ ruột chăm cháu khác ý mình — nói rõ, nhẹ nhàng, kiên định thường bền vững hơn im lặng chịu đựng hoặc bùng nổ.
[T1] Mẹ có quyền chủ động nói ra nhu cầu được quan tâm của mình, không cần chờ ai hỏi.
[T1] Khách chỉ bế/khen con, mẹ thấy vô hình và tủi là điều dễ hiểu, không phải ích kỷ — mẹ có thể nói với người thân tin cậy rằng mẹ cũng cần được hỏi thăm.
[T2] Cảm giác sữa "không đủ" thường không phản ánh đúng thực tế — nếu bé đủ tã ướt và tăng cân đều theo lịch khám, đây thường là dấu hiệu ổn.
[T3-Physical] Ngực sưng đỏ, đau kèm sốt, vùng cứng không giảm sau khi cho bú/hút sữa → có thể tắc tia sữa/viêm vú, cần bác sĩ hoặc lactation consultant kiểm tra sớm.
[T1] Dùng sữa công thức vì bất kỳ lý do gì không làm mẹ kém hơn — bé được nuôi đủ và mẹ ổn định tinh thần quan trọng hơn một tiêu chuẩn duy nhất.
[T3-Physical] Bé bú thường xuyên nhưng không tăng cân đủ, đi tiểu ít, vàng da kéo dài → đưa bé khám bác sĩ nhi ngay, không tự điều chỉnh tại nhà.
[T1] Muốn "thoát" khỏi việc bị chạm vào liên tục (kể cả bởi bạn đời) là phản ứng thần kinh thật khi cơ thể quá tải — không phải không yêu con/chồng.
[T1] Xin 10-15 phút không ai chạm vào mỗi ngày là nhu cầu hợp lý, không ích kỷ.
[T1] Bé chỉ chịu mẹ bế khiến cơ thể mẹ không còn thuộc về mình; muốn "trốn" cái chạm là phản ứng quá tải bình thường — xin người thân đỡ vài phút là nhu cầu chính đáng, không phải bỏ rơi con.
[T2] Cơ thể cần 6-8 tuần hồi phục cơ bản (lâu hơn nếu sinh mổ), một số chức năng mất nhiều tháng — đây là quá trình, không phải deadline.
[T1] Không ai hỏi vết khâu của mẹ đã đỡ chưa là trải nghiệm phổ biến dù không công bằng — mẹ có quyền chủ động chia sẻ.
[T2] Đau khi quan hệ trở lại sau sinh rất phổ biến, thường do thay đổi nội tiết/mô chưa hồi phục — dùng gel bôi trơn, giao tiếp cởi mở, cho cơ thể thêm thời gian.
[T3-Physical] Rò rỉ nước tiểu khi ho/cười, nặng/sa vùng chậu, đau vùng chậu kéo dài → cần bác sĩ hoặc chuyên gia phục hồi sàn chậu, tình trạng phổ biến và điều trị được.
[T2] Con ngủ mà mẹ vẫn đau vết khâu/vết mổ, rã rời — cơ thể vẫn đang hồi phục, nghỉ ngơi là một phần của quá trình; mức đau và tốc độ khác nhau mỗi người, nếu đau tăng dần hoặc khác hẳn lời dặn thì hỏi bác sĩ.
[T1] Mâu thuẫn tăng sau khi có con (thiếu ngủ, đổi vai trò, ít thời gian cho nhau) thường là giai đoạn sẽ dịu lại, không phải dấu hiệu tan vỡ.
[T1] Cảm thấy một mình trong hôn nhân dù bạn đời vẫn ở đó — nói cụ thể điều mình cần thường hiệu quả hơn chờ đối phương tự hiểu.
[T1] Bé quấy đúng lúc bố đi làm về dễ khiến cả hai căng — thường trùng lúc mẹ cạn sức, không phải lỗi ai; một câu cụ thể về điều mẹ cần hiệu quả hơn để hai người tự đoán ý nhau.
[T1] Áp lực tiền bạc sau sinh là gánh nặng có thật — chi phí tăng đúng lúc thu nhập giảm hoặc mất hẳn, không phải mẹ tưởng tượng hay phóng đại; áp lực tài chính cũng là yếu tố được ghi nhận làm hậu sản nặng nề hơn. (Nếu kèm tuyệt vọng/ý nghĩ tự hại → chuyển T3-Psychiatric, không tự trấn an.)
[T1] Lo về việc quay lại công việc, sợ vị trí của mình đã thay đổi khi vắng mặt, là nỗi lo rất phổ biến — không có nghĩa mẹ kém cỏi hay bị bỏ lại phía sau.
[T1] Thót tim vì chi phí nuôi con rồi tự trách là cảm giác nhiều mẹ có, không nói lên mẹ thiếu sót; không đưa lời khuyên tài chính cụ thể, nhưng nói ra gánh nặng với bạn đời/người thân tin cậy thay vì tự gánh trong im lặng thường nhẹ nhõm hơn.
[T3-Safety] Mâu thuẫn kèm đe dọa/kiểm soát/bạo lực dưới bất kỳ hình thức nào → không còn là căng thẳng bình thường, liên hệ CSAGA (024 3333 5599) hoặc Ngôi nhà Bình yên (1900 969 680).
[T3-Psychiatric] Ý nghĩ muốn làm hại bản thân hoặc em bé — dù chỉ thoáng qua — cần hỗ trợ ngay, không phải điều mẹ nên tự xử lý một mình. Trong giờ: HOPE (0865 044 400). Ngoài giờ/khẩn cấp: 115 hoặc bệnh viện gần nhất ngay.

## Gợi ý trả lời nhanh (tùy chọn)
Nếu mẹ có thể trả lời nhanh bằng một lựa chọn ngắn thay vì phải gõ, thêm một dòng gợi ý ngay TRƯỚC tag TIER, định dạng:
[GỢI_Ý: lựa chọn 1 | lựa chọn 2 | lựa chọn 3]
Tối đa 3 lựa chọn, mỗi lựa chọn dưới 6 từ. Chỉ thêm khi thực sự có một câu hỏi ngắn cần trả lời nhanh.

## Định dạng phản hồi
- Không mở đầu bằng "Là một AI, tôi không thể..." — trả lời tự nhiên theo hướng dẫn ở trên.
- Nếu mẹ hỏi điều ngoài phạm vi các entries và ngoài giai đoạn hậu sản, thành thật nói chưa có đủ thông tin đáng tin cậy, gợi ý hỏi bác sĩ — không suy diễn hay bịa thông tin y tế.

## QUAN TRỌNG — tag hệ thống (bắt buộc, mẹ sẽ không nhìn thấy các dòng này)
Tag TIER LUÔN LUÔN là dòng cuối cùng tuyệt đối của câu trả lời, đúng định dạng:
[TIER:1] hoặc [TIER:2] hoặc [TIER:3-PHYSICAL] hoặc [TIER:3-PSYCHIATRIC] hoặc [TIER:3-SAFETY]
Nếu có dòng gợi ý nhanh, nó nằm ngay TRƯỚC dòng tag TIER. Luôn luôn có tag TIER, không được quên.`;

const TIER_TAG_RE = /\n?\[TIER:(1|2|3-PHYSICAL|3-PSYCHIATRIC|3-SAFETY)\]\s*$/i;
const SUGGEST_RE = /\n?\[GỢI_Ý:\s*([^\]]+)\]\s*$/i;

const CRISIS_CONTENT = {
  PHYSICAL: { label: "Cần bác sĩ kiểm tra ngay", body: "Đây là điều nên được bác sĩ kiểm tra ngay, mẹ nhé.", contacts: [{ name: "Cấp cứu 115", tel: "115" }] },
  PSYCHIATRIC: { label: "Mẹ không cần tự xử lý một mình", body: "Điều này cần một người thật lắng nghe mẹ ngay bây giờ.", contacts: [{ name: "HOPE — hỗ trợ tâm lý (16:30–20:30)", tel: "0865044400" }, { name: "Cấp cứu 115 (ngoài giờ / khẩn cấp)", tel: "115" }] },
  SAFETY: { label: "Đây không còn là căng thẳng bình thường", body: "Mẹ xứng đáng được an toàn. Có người sẵn sàng hỗ trợ mẹ kín đáo.", contacts: [{ name: "CSAGA", tel: "0243333599" }, { name: "Ngôi nhà Bình yên", tel: "1900969680" }] },
};

function formatBabyAge(weeks) {
  if (weeks <= 12) return `${weeks} tuần tuổi`;
  const months = Math.max(1, Math.round(weeks / 4.345));
  return `${months} tháng tuổi`;
}
function moodEmojiFor(label) {
  const found = MOOD_OPTIONS.find((m) => m.label === label);
  return found ? found.emoji : "•";
}

async function storageGet(key) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : null;
  } catch (e) { return null; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), false); } catch (e) {}
}

function parseAssistantReply(raw) {
  let text = raw;
  let tier = null;
  const tierMatch = text.match(TIER_TAG_RE);
  if (tierMatch) { tier = tierMatch[1]; text = text.replace(TIER_TAG_RE, "").trim(); }
  let suggestions = [];
  const suggestMatch = text.match(SUGGEST_RE);
  if (suggestMatch) {
    suggestions = suggestMatch[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3);
    text = text.replace(SUGGEST_RE, "").trim();
  }
  const segments = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return { text, tier, suggestions, segments: segments.length ? segments : [text] };
}

async function callClaude(history) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  const data = await response.json();
  const block = (data.content || []).find((b) => b.type === "text");
  return block ? block.text : "";
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("meoi-fonts")) return;
    const link = document.createElement("link");
    link.id = "meoi-fonts";
    link.rel = "stylesheet";
    link.href = FONT_LINK;
    document.head.appendChild(link);
  }, []);
}

const Styles = () => (
  <style>{`
    .meoi-root {
      --pink: #C81E5C;
      --white: #FFFFFF;
      --blue: #0B6E99;
      --bg-blue-gray: #F4F7F9;
      --card-pink: #FCE4EC;
      --ink: #2D2A2E;
      --alert: #B3261E;
      font-family: 'Be Vietnam Pro', sans-serif;
      background: var(--white);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      justify-content: center;
    }
    .meoi-phone { width: 100%; max-width: 460px; min-height: 100vh; display: flex; flex-direction: column; }
    .meoi-serif { font-family: 'Fraunces', serif; font-style: italic; }
    .meoi-topbar { padding: 20px 22px 4px; }
    .meoi-wordmark { font-family: 'Fraunces', serif; font-style: italic; font-weight: 500; }
    .meoi-wordmark .main { color: var(--ink); }
    .meoi-wordmark .bang { color: var(--pink); }
    .meoi-surface { flex: 1; display: flex; flex-direction: column; padding: 12px 22px 22px; }
    .meoi-card-pink { background: var(--card-pink); border-radius: 16px; padding: 18px; }
    .meoi-card-blue { background: var(--bg-blue-gray); border-radius: 16px; padding: 16px 18px; }
    .meoi-badge {
      display: inline-flex; align-items: center; background: var(--blue); color: var(--white);
      border-radius: 999px; padding: 4px 12px; font-size: 11.5px; font-weight: 600;
      font-family: 'Be Vietnam Pro', sans-serif; margin-bottom: 10px;
    }
    .meoi-btn-primary {
      background: var(--pink); color: var(--white); border: none; border-radius: 999px;
      padding: 13px 22px; font-family: 'Be Vietnam Pro', sans-serif; font-weight: 600;
      font-size: 15px; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease;
    }
    .meoi-btn-primary:hover { background: #AD1A50; transform: translateY(-1px); }
    .meoi-btn-primary:disabled { opacity: 0.45; cursor: default; transform: none; }
    .meoi-btn-ghost {
      background: transparent; border: 1px solid var(--ink); color: var(--ink);
      border-radius: 999px; padding: 12px 20px; font-family: 'Be Vietnam Pro', sans-serif;
      font-weight: 500; font-size: 14px; cursor: pointer; opacity: 0.75;
    }
    .meoi-link-quiet {
      background: none; border: none; color: var(--ink); opacity: 0.55; font-size: 13px;
      cursor: pointer; padding: 6px 0; text-align: left; font-family: 'Be Vietnam Pro', sans-serif;
    }
    .meoi-chip {
      display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
      border: 1.5px solid transparent; border-radius: 14px; padding: 12px 16px;
      font-family: 'Be Vietnam Pro', sans-serif; font-size: 14.5px; color: var(--ink);
      cursor: pointer; margin-bottom: 9px;
    }
    .meoi-chip .emoji { font-size: 19px; line-height: 1; }
    .meoi-chip.selected { border-color: var(--pink); box-shadow: inset 0 0 0 1px var(--pink); }
    .meoi-bubble-user { background: var(--bg-blue-gray); color: var(--ink); border-radius: 16px 16px 4px 16px; padding: 11px 15px; max-width: 82%; align-self: flex-end; font-size: 14.5px; line-height: 1.5; }
    .meoi-bubble-ai { background: transparent; border-left: 3px solid var(--pink); color: var(--ink); padding: 4px 0 4px 14px; max-width: 88%; align-self: flex-start; font-size: 14.5px; line-height: 1.55; }
    .meoi-bubble-ai.trust { border-left-color: var(--blue); }
    .meoi-crisis-banner { background: var(--alert); color: #FCEAE8; padding: 16px 18px; font-family: 'Be Vietnam Pro', sans-serif; }
    .meoi-tel { display: inline-block; color: #FCEAE8; text-decoration: underline; font-weight: 600; margin-right: 14px; }
    .meoi-fade-in { animation: meoiFadeIn 0.35s ease both; }
    @keyframes meoiFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .meoi-typing { display: inline-flex; gap: 4px; padding: 6px 0; }
    .meoi-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--ink); opacity: 0.35; animation: meoiDot 1.2s infinite ease-in-out; }
    .meoi-typing span:nth-child(2) { animation-delay: 0.15s; }
    .meoi-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes meoiDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.35; } 30% { transform: translateY(-4px); opacity: 0.9; } }
    .meoi-suggest-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; align-self: flex-start; padding-left: 14px; }
    .meoi-suggest-chip { background: var(--white); border: 1.5px solid var(--pink); color: var(--ink); border-radius: 999px; padding: 7px 14px; font-size: 13px; font-family: 'Be Vietnam Pro', sans-serif; cursor: pointer; }
    .meoi-suggest-chip:hover { background: var(--card-pink); }
    input[type="range"] { accent-color: var(--pink); }
    button:focus-visible, input:focus-visible, textarea:focus-visible, .meoi-chip:focus-visible, .meoi-suggest-chip:focus-visible {
      outline: 2px solid var(--blue); outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .meoi-fade-in { animation: none; }
      .meoi-typing span { animation: none; opacity: 0.6; }
      .meoi-btn-primary:hover { transform: none; }
    }
    .meoi-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--bg-blue-gray); }
    .meoi-dot.active { background: var(--pink); }
    .meoi-account-btn {
      width: 30px; height: 30px; border-radius: 50%; background: var(--bg-blue-gray);
      border: none; display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 13px; color: var(--ink); font-family: 'Be Vietnam Pro', sans-serif;
    }
    .meoi-account-sheet {
      position: absolute; top: 58px; right: 22px; background: var(--white); border: 1px solid var(--bg-blue-gray);
      border-radius: 14px; padding: 14px; box-shadow: 0 8px 24px rgba(45,42,46,0.12); z-index: 30; min-width: 190px;
    }
  `}</style>
);

function Wordmark({ size = 20 }) {
  return (
    <span className="meoi-wordmark" style={{ fontSize: size }}>
      <span className="main">Mẹ Ơi</span><span className="bang">!</span>
    </span>
  );
}

function OnboardingScreen({ onDone }) {
  const [i, setI] = useState(0);
  const slide = ONBOARDING_SLIDES[i];
  const isLast = i === ONBOARDING_SLIDES.length - 1;
  return (
    <div className="meoi-surface meoi-fade-in">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="meoi-serif" style={{ fontSize: 24, marginBottom: 14, lineHeight: 1.3 }}>{slide.title}</div>
        <div style={{ fontSize: 14.5, opacity: 0.75, lineHeight: 1.65, marginBottom: 36 }}>{slide.body}</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {ONBOARDING_SLIDES.map((_, idx) => <span key={idx} className={`meoi-dot ${idx === i ? "active" : ""}`} />)}
        </div>
        <button className="meoi-btn-primary" style={{ marginBottom: 12 }} onClick={() => (isLast ? onDone() : setI(i + 1))}>
          {isLast ? "Bắt đầu" : "Tiếp tục"}
        </button>
        {!isLast && <button className="meoi-link-quiet" onClick={onDone}>Bỏ qua</button>}
      </div>
    </div>
  );
}

function SignupScreen({ onComplete }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const canSubmit = name.trim() && email.trim();
  const fieldStyle = { width: "100%", border: "1px solid var(--bg-blue-gray)", background: "var(--bg-blue-gray)", borderRadius: 12, padding: "12px 14px", fontSize: 14.5, fontFamily: "'Be Vietnam Pro', sans-serif", color: "var(--ink)", outline: "none", marginBottom: 14, boxSizing: "border-box" };
  return (
    <div className="meoi-surface meoi-fade-in">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="meoi-serif" style={{ fontSize: 22, marginBottom: 8 }}>Tạo tài khoản của mẹ</div>
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 26, lineHeight: 1.5 }}>Để mình nhớ mẹ ở lần ghé sau.</div>
        <input placeholder="Tên mẹ muốn mình gọi" value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...fieldStyle, marginBottom: 28 }} />
        <button className="meoi-btn-primary" disabled={!canSubmit} onClick={() => onComplete({ name: name.trim(), email: email.trim() })}>Tạo tài khoản</button>
      </div>
    </div>
  );
}

function AccountMenu({ account, onLogout, onClose }) {
  return (
    <div className="meoi-account-sheet meoi-fade-in">
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{account.name}</div>
      <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 12 }}>{account.email}</div>
      <button className="meoi-link-quiet" style={{ opacity: 0.8, marginBottom: 6 }} onClick={onClose}>Đóng</button>
      <button className="meoi-link-quiet" style={{ color: "var(--alert)", opacity: 0.85 }} onClick={onLogout}>Đăng xuất</button>
    </div>
  );
}

function SignupNudge({ onCreate, onDismiss }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(45,42,46,0.45)", display: "flex", alignItems: "flex-end", zIndex: 25 }}>
      <div className="meoi-surface meoi-fade-in" style={{ background: "var(--white)", borderRadius: "22px 22px 0 0" }}>
        <div className="meoi-serif" style={{ fontSize: 18, marginBottom: 8 }}>Mẹ có muốn mình nhớ không?</div>
        <div style={{ fontSize: 13.5, opacity: 0.7, marginBottom: 22, lineHeight: 1.6 }}>
          Tạo tài khoản để mình nhớ mẹ, nhớ bé, và những gì mẹ đã chia sẻ ở lần ghé sau.
        </div>
        <button className="meoi-btn-primary" style={{ marginBottom: 10 }} onClick={onCreate}>Tạo tài khoản</button>
        <button className="meoi-link-quiet" onClick={onDismiss}>Để sau</button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ fontSize: 14, opacity: 0.55, textAlign: "center" }}>Đang chuẩn bị không gian riêng của mẹ...</div>
    </div>
  );
}

function CrisisBanner({ crisis, onDismiss }) {
  if (!crisis) return null;
  const c = CRISIS_CONTENT[crisis];
  return (
    <div className="meoi-crisis-banner meoi-fade-in">
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
      <div style={{ fontSize: 13.5, opacity: 0.92, marginBottom: 10 }}>{c.body}</div>
      <div style={{ marginBottom: 10 }}>
        {c.contacts.map((ct) => <a key={ct.tel} className="meoi-tel" href={`tel:${ct.tel}`}>{ct.name}</a>)}
      </div>
      <button onClick={onDismiss} style={{ background: "transparent", border: "1px solid #FCEAE8", color: "#FCEAE8", borderRadius: 999, padding: "7px 16px", fontSize: 13, cursor: "pointer" }}>Đã xem</button>
    </div>
  );
}

function IntakeScreen({ onComplete }) {
  const [week, setWeek] = useState(4);
  return (
    <div className="meoi-surface meoi-fade-in">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="meoi-serif" style={{ fontSize: 26, fontWeight: 500, marginBottom: 10, lineHeight: 1.35 }}>Chào mẹ.</div>
        <div style={{ fontSize: 14.5, opacity: 0.75, marginBottom: 32, lineHeight: 1.6 }}>Mình ở đây để cùng mẹ đi qua những khoảnh khắc quá tải — không cần mẹ phải ổn trước khi nói chuyện với mình.</div>
        <div style={{ fontSize: 13.5, marginBottom: 14, opacity: 0.8 }}>Con được mấy tuần tuổi rồi mẹ?</div>
        <div className="meoi-serif" style={{ fontSize: 36, marginBottom: 8, color: "var(--pink)" }}>{formatBabyAge(week)}</div>
        <input type="range" min="0" max="52" value={week} onChange={(e) => setWeek(Number(e.target.value))} style={{ width: "100%", marginBottom: 36 }} />
        <button className="meoi-btn-primary" onClick={() => onComplete(week)}>Bắt đầu</button>
      </div>
    </div>
  );
}

function reflectOnCheckins(checkins) {
  if (checkins.length === 0) return null;
  const recent = checkins.slice(-4);
  const tiredSignals = recent.filter((c) => c.mood === "Mệt" || c.mood === "Quá tải" || c.sleep === "Gần như không ngủ");
  if (tiredSignals.length >= 3) return "mình thấy mẹ đã mệt vài ngày liền — mẹ có muốn nói chuyện một chút không?";
  return `${recent.length} lần check-in gần đây — cảm ơn mẹ đã dành chút thời gian cho chính mình.`;
}

function HomeScreen({ profile, checkins, onStartCheckin, onOpenChat, onOpenFeedback }) {
  const reflection = reflectOnCheckins(checkins);
  const todayStr = new Date().toLocaleDateString("vi-VN");
  const checkedInToday = checkins.some((c) => c.date === todayStr);
  const lastStressor = checkins.length ? checkins[checkins.length - 1].top_stressor : null;
  const tip = (lastStressor && STAGE_TIPS[lastStressor]) || DEFAULT_TIP;

  return (
    <div className="meoi-surface meoi-fade-in">
      <div className="meoi-serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Chào mẹ.</div>
      <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 22 }}>Con được {formatBabyAge(profile.week)}</div>

      {!checkedInToday ? (
        <>
          <button className="meoi-btn-primary" style={{ marginBottom: 10 }} onClick={onStartCheckin}>Check-in hôm nay</button>
          <button className="meoi-btn-ghost" style={{ marginBottom: 22, alignSelf: "flex-start" }} onClick={onOpenChat}>Nói chuyện với mình</button>
        </>
      ) : (
        <>
          <button className="meoi-btn-primary" style={{ marginBottom: 10 }} onClick={onOpenChat}>Nói chuyện với mình</button>
          <button className="meoi-link-quiet" style={{ marginBottom: 18 }} onClick={onStartCheckin}>Đã check-in hôm nay ✓ · cập nhật lại</button>
        </>
      )}

      <div className="meoi-card-pink" style={{ marginBottom: 14 }}>
        {tip.tag === "Y_TE" && <div className="meoi-badge">Theo nguồn y khoa</div>}
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{tip.text}</div>
      </div>

      {reflection && (
        <div className="meoi-card-blue" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{reflection}</div>
        </div>
      )}
      {!reflection && checkins.length === 0 && (
        <div className="meoi-card-blue" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>Chưa có check-in nào — một phút mỗi ngày cũng đủ để mình hiểu mẹ hơn.</div>
        </div>
      )}

      {checkins.length > 0 && (
        <div>
          <div style={{ fontSize: 12.5, opacity: 0.55, marginBottom: 10 }}>Vài ngày gần đây</div>
          {checkins.slice(-5).reverse().map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", fontSize: 13, padding: "9px 0", borderBottom: "1px solid var(--bg-blue-gray)" }}>
              <span style={{ fontSize: 16, marginRight: 8 }}>{moodEmojiFor(c.mood)}</span>
              <span style={{ opacity: 0.5, marginRight: 8, minWidth: 64 }}>{c.date}</span>
              <span style={{ opacity: 0.85 }}>{c.top_stressor}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }} />
      <button onClick={onOpenFeedback} className="meoi-link-quiet" style={{ opacity: 0.4 }}>Góp ý cho mình</button>
    </div>
  );
}

function CheckinThanksScreen() {
  return (
    <div className="meoi-surface meoi-fade-in" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>💛</div>
      <div className="meoi-serif" style={{ fontSize: 18 }}>Cảm ơn mẹ đã dành chút thời gian cho mình.</div>
    </div>
  );
}

function Chip({ option, selected, onClick }) {
  return (
    <button className={`meoi-chip ${selected ? "selected" : ""}`} style={{ background: option.tint }} onClick={onClick}>
      <span className="emoji">{option.emoji}</span><span>{option.label}</span>
    </button>
  );
}

function CheckinScreen({ onSubmit, onCancel }) {
  const [mood, setMood] = useState(null);
  const [sleep, setSleep] = useState(null);
  const [body, setBody] = useState(null);
  const [stressor, setStressor] = useState(null);
  const canSubmit = mood && sleep && body && stressor;

  return (
    <div className="meoi-surface meoi-fade-in" style={{ overflowY: "auto" }}>
      <div className="meoi-serif" style={{ fontSize: 20, marginBottom: 20 }}>Hôm nay của mẹ thế nào?</div>
      <div style={{ fontSize: 12.5, opacity: 0.55, marginBottom: 8 }}>Tâm trạng</div>
      {MOOD_OPTIONS.map((o) => <Chip key={o.label} option={o} selected={mood === o.label} onClick={() => setMood(o.label)} />)}
      <div style={{ fontSize: 12.5, opacity: 0.55, margin: "14px 0 8px" }}>Giấc ngủ</div>
      {SLEEP_OPTIONS.map((o) => <Chip key={o.label} option={o} selected={sleep === o.label} onClick={() => setSleep(o.label)} />)}
      <div style={{ fontSize: 12.5, opacity: 0.55, margin: "14px 0 8px" }}>Cơ thể</div>
      {BODY_STATUS_OPTIONS.map((o) => <Chip key={o.label} option={o} selected={body === o.label} onClick={() => setBody(o.label)} />)}
      <div style={{ fontSize: 12.5, opacity: 0.55, margin: "14px 0 8px" }}>Điều khiến mẹ căng thẳng nhất</div>
      {STRESSOR_OPTIONS.map((o) => <Chip key={o.label} option={o} selected={stressor === o.label} onClick={() => setStressor(o.label)} />)}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="meoi-btn-ghost" onClick={onCancel}>Để sau</button>
        <button className="meoi-btn-primary" style={{ flex: 1 }} disabled={!canSubmit} onClick={() => onSubmit({ mood, sleep, body_status: body, top_stressor: stressor })}>Lưu check-in</button>
      </div>
    </div>
  );
}

function ChatScreen({ onCrisis, onBack, onEngage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, sending]);

  async function send(overrideText) {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;
    const nextHistory = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    if (!overrideText) setInput("");
    setSending(true);
    try {
      const raw = await callClaude(nextHistory);
      const parsed = parseAssistantReply(raw);
      setMessages([...nextHistory, { role: "assistant", content: parsed.text, segments: parsed.segments, suggestions: parsed.suggestions, tier: parsed.tier }]);
      onEngage();
      if (parsed.tier && parsed.tier.startsWith("3-")) onCrisis(parsed.tier.split("-")[1], text);
    } catch (e) {
      setMessages([...nextHistory, { role: "assistant", content: "Có lỗi kết nối, mẹ thử gửi lại nhé.", segments: ["Có lỗi kết nối, mẹ thử gửi lại nhé."], suggestions: [], tier: null }]);
    } finally { setSending(false); }
  }

  return (
    <div className="meoi-surface meoi-fade-in" style={{ padding: "8px 0 16px" }}>
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--ink)", marginRight: 10, padding: 0 }}>←</button>
        <div className="meoi-serif" style={{ fontSize: 17 }}>Nói chuyện với mình</div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "0 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 13.5, opacity: 0.55, lineHeight: 1.6, paddingTop: 8 }}>Mẹ muốn nói gì cũng được — về bé, về mẹ, hay chỉ đơn giản là mệt quá không biết nói với ai.</div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="meoi-bubble-user">{m.content}</div>
          ) : (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
              {(m.segments || [m.content]).map((seg, j) => (
                <div key={j} className={`meoi-bubble-ai meoi-fade-in ${m.tier && m.tier !== "1" ? "trust" : ""}`} style={{ animationDelay: `${j * 140}ms` }}>{seg}</div>
              ))}
              {i === messages.length - 1 && m.suggestions && m.suggestions.length > 0 && !sending && (
                <div className="meoi-suggest-row">
                  {m.suggestions.map((s) => <button key={s} className="meoi-suggest-chip" onClick={() => send(s)}>{s}</button>)}
                </div>
              )}
            </div>
          )
        )}
        {sending && <div className="meoi-bubble-ai meoi-fade-in"><span className="meoi-typing"><span></span><span></span><span></span></span></div>}
      </div>
      <div style={{ padding: "14px 22px 0", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Nhắn cho mình..."
          style={{ flex: 1, border: "1px solid var(--bg-blue-gray)", background: "var(--bg-blue-gray)", borderRadius: 999, padding: "11px 16px", fontSize: 14, fontFamily: "'Be Vietnam Pro', sans-serif", color: "var(--ink)", outline: "none" }}
        />
        <button className="meoi-btn-primary" style={{ padding: "0 18px" }} onClick={() => send()} disabled={sending || !input.trim()}>Gửi</button>
      </div>
    </div>
  );
}

function FeedbackModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(45,42,46,0.55)", display: "flex", alignItems: "flex-end", zIndex: 20 }}>
      <div className="meoi-surface meoi-fade-in" style={{ background: "var(--white)", borderRadius: "22px 22px 0 0" }}>
        <div className="meoi-serif" style={{ fontSize: 18, marginBottom: 12 }}>Góp ý cho mình</div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Điều gì khiến mẹ bối rối, hoặc điều gì mình chưa nói tới..." rows={4}
          style={{ width: "100%", border: "1px solid var(--bg-blue-gray)", borderRadius: 12, padding: 12, fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 14, marginBottom: 14, resize: "none", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="meoi-btn-ghost" onClick={onClose}>Hủy</button>
          <button className="meoi-btn-primary" style={{ flex: 1 }} disabled={!text.trim()} onClick={() => { onSubmit(text.trim()); onClose(); }}>Gửi góp ý</button>
        </div>
      </div>
    </div>
  );
}

const SIGNUP_TRIGGER_THRESHOLD = 2;

export default function MeOiPrototype() {
  useFonts();
  const [screen, setScreen] = useState("loading");
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [crisis, setCrisis] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [engagement, setEngagement] = useState(0);
  const [nudgeShown, setNudgeShown] = useState(false);
  const [showSignupNudge, setShowSignupNudge] = useState(false);

  useEffect(() => {
    (async () => {
      const onboarded = await storageGet("meoi:onboarded");
      const a = await storageGet("meoi:account");
      const p = await storageGet("meoi:profile");
      const c = await storageGet("meoi:checkins");
      const e = await storageGet("meoi:engagement");
      const shown = await storageGet("meoi:nudge_shown");
      setAccount(a);
      setProfile(p);
      setCheckins(c || []);
      setEngagement(e || 0);
      setNudgeShown(!!shown);
      // Guest-first: no account required to reach the real app. Only onboarding
      // (once) and baby's age (needed to render Home) gate entry.
      if (!onboarded) setScreen("onboarding");
      else if (!p) setScreen("intake");
      else setScreen("home");
    })();
  }, []);

  useEffect(() => {
    if (screen === "checkin-thanks") {
      const t = setTimeout(() => setScreen("home"), 1300);
      return () => clearTimeout(t);
    }
  }, [screen]);

  async function bumpEngagement() {
    const next = engagement + 1;
    setEngagement(next);
    await storageSet("meoi:engagement", next);
    if (!account && !nudgeShown && next >= SIGNUP_TRIGGER_THRESHOLD) {
      setShowSignupNudge(true);
      setNudgeShown(true);
      await storageSet("meoi:nudge_shown", true);
    }
  }

  async function handleOnboardingDone() {
    await storageSet("meoi:onboarded", true);
    setScreen("intake");
  }
  async function handleSignupComplete(acc) {
    setAccount(acc);
    setShowSignupNudge(false);
    await storageSet("meoi:account", acc);
    setScreen("home");
  }
  async function handleLogout() {
    setShowAccountMenu(false);
    setAccount(null);
    setProfile(null);
    setCheckins([]);
    setEngagement(0);
    setNudgeShown(false);
    await storageSet("meoi:account", null);
    await storageSet("meoi:profile", null);
    await storageSet("meoi:checkins", []);
    await storageSet("meoi:engagement", 0);
    await storageSet("meoi:nudge_shown", false);
    setScreen("intake");
  }
  async function handleIntakeComplete(week) {
    const p = { week };
    setProfile(p);
    await storageSet("meoi:profile", p);
    setScreen("home");
  }
  async function handleCheckinSubmit(entry) {
    const withDate = { ...entry, date: new Date().toLocaleDateString("vi-VN") };
    const next = [...checkins, withDate];
    setCheckins(next);
    await storageSet("meoi:checkins", next);
    await bumpEngagement();
    setScreen("checkin-thanks");
  }
  async function handleCrisis(domain, excerpt) {
    setCrisis(domain);
    const log = (await storageGet("meoi:crisis_events")) || [];
    log.push({ domain, excerpt, at: new Date().toISOString() });
    await storageSet("meoi:crisis_events", log);
  }
  async function handleFeedback(text) {
    const log = (await storageGet("meoi:feedback")) || [];
    log.push({ text, at: new Date().toISOString() });
    await storageSet("meoi:feedback", log);
  }

  const inAppScreen = screen === "home" || screen === "checkin" || screen === "checkin-thanks" || screen === "chat";

  return (
    <div className="meoi-root">
      <Styles />
      <div className="meoi-phone">
        <div className="meoi-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <Wordmark />
          {inAppScreen && account && (
            <button className="meoi-account-btn" onClick={() => setShowAccountMenu((v) => !v)}>{account.name ? account.name[0].toUpperCase() : "M"}</button>
          )}
          {inAppScreen && !account && (
            <button className="meoi-link-quiet" style={{ padding: "6px 4px" }} onClick={() => setScreen("signup")}>Tạo tài khoản</button>
          )}
          {showAccountMenu && account && (
            <AccountMenu account={account} onLogout={handleLogout} onClose={() => setShowAccountMenu(false)} />
          )}
        </div>
        {screen === "loading" && <LoadingScreen />}
        {screen === "onboarding" && <OnboardingScreen onDone={handleOnboardingDone} />}
        {screen === "signup" && <SignupScreen onComplete={handleSignupComplete} />}
        {screen === "intake" && <IntakeScreen onComplete={handleIntakeComplete} />}
        {screen === "home" && profile && (
          <HomeScreen profile={profile} checkins={checkins} onStartCheckin={() => setScreen("checkin")} onOpenChat={() => setScreen("chat")} onOpenFeedback={() => setShowFeedback(true)} />
        )}
        {screen === "checkin" && <CheckinScreen onSubmit={handleCheckinSubmit} onCancel={() => setScreen("home")} />}
        {screen === "checkin-thanks" && <CheckinThanksScreen />}
        {screen === "chat" && <ChatScreen onCrisis={handleCrisis} onBack={() => setScreen("home")} onEngage={bumpEngagement} />}
        <CrisisBanner crisis={crisis} onDismiss={() => setCrisis(null)} />
        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onSubmit={handleFeedback} />}
        {showSignupNudge && (
          <SignupNudge onCreate={() => { setShowSignupNudge(false); setScreen("signup"); }} onDismiss={() => setShowSignupNudge(false)} />
        )}
      </div>
    </div>
  );
}
