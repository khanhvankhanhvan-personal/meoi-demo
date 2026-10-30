// Product copy and constants ported from prototype V28 (docs/claude_MeOi-build-spec.md section 4).

export interface Option {
  label: string;
  emoji: string;
  tint: string;
}

export const MOODS: Option[] = [
  { label: "Ổn", emoji: "🌤️", tint: "#E7EEF1" },
  { label: "Mệt", emoji: "😴", tint: "#EDEAE6" },
  { label: "Quá tải", emoji: "🌊", tint: "#E9D9E3" },
  { label: "Buồn", emoji: "🌧️", tint: "#DCE7ED" },
  { label: "Cáu gắt", emoji: "🔥", tint: "#F6D9D9" },
];

export const SLEEPS: Option[] = [
  { label: "Ngủ đủ", emoji: "🌕", tint: "#FBEEF2" },
  { label: "Ngủ ít", emoji: "🌗", tint: "#F6D2E0" },
  { label: "Gần như không ngủ", emoji: "🌑", tint: "#EFA9C2" },
];

export const BODIES: Option[] = [
  { label: "Cơ thể mình đang hồi phục ổn", emoji: "🌱", tint: "#E7EEF1" },
  { label: "Có chỗ đau hoặc khó chịu", emoji: "🩹", tint: "#FCE4EC" },
  { label: "Mình muốn được ai đó để ý đến mình", emoji: "💛", tint: "#F3E8DE" },
];

export const STRESSORS: Option[] = [
  { label: "Con quấy khóc, mất ngủ", emoji: "👶", tint: "#E7EEF1" },
  { label: "Không còn là mình", emoji: "🪞", tint: "#F6D2E0" },
  { label: "Cô đơn, không ai hỏi han", emoji: "🤍", tint: "#E7EEF1" },
  { label: "Cho con bú", emoji: "🍼", tint: "#FCE4EC" },
  { label: "Quá tải, không muốn ai chạm vào", emoji: "✋", tint: "#E9D9E3" },
  { label: "Cơ thể chưa hồi phục", emoji: "🩹", tint: "#F4F7F9" },
  { label: "Căng thẳng với chồng/gia đình", emoji: "🌪️", tint: "#FBEEF2" },
  { label: "Áp lực tiền bạc, khó đi làm lại", emoji: "💸", tint: "#EDEAE6" },
];

export interface Tip {
  text: string;
  tag: "EMOTIONAL" | "Y_TE";
  source?: string;
}

export const TIPS: Record<string, Tip> = {
  "Con quấy khóc, mất ngủ": {
    text: "Việc bé khóc nhiều, đặc biệt vào buổi tối, là điều rất phổ biến ở trẻ sơ sinh — không phải lỗi của mẹ.",
    tag: "EMOTIONAL",
  },
  "Không còn là mình": {
    text: 'Cảm giác "không còn là mình" sau sinh có tên gọi: matrescence. Đó là một giai đoạn chuyển tiếp thật, không phải vấn đề.',
    tag: "EMOTIONAL",
  },
  "Cô đơn, không ai hỏi han": {
    text: "Cô đơn dù nhà đầy người là một nghịch lý rất thật của giai đoạn hậu sản — không phải mẹ vô ơn hay yếu đuối.",
    tag: "EMOTIONAL",
  },
  "Cho con bú": {
    text: 'Cảm giác sữa "không đủ" rất phổ biến. Nếu bé đủ tã ướt và tăng cân đều theo lịch khám, đây thường là dấu hiệu ổn.',
    tag: "Y_TE",
    source: "WHO, UNICEF",
  },
  "Quá tải, không muốn ai chạm vào": {
    text: 'Muốn "thoát" khỏi việc bị chạm vào liên tục là phản ứng thần kinh thật khi cơ thể quá tải — không phải mẹ không yêu con.',
    tag: "EMOTIONAL",
  },
  "Cơ thể chưa hồi phục": {
    text: "Cơ thể mẹ cần khoảng 6-8 tuần để hồi phục cơ bản, lâu hơn nếu sinh mổ. Đây là một quá trình, không phải deadline.",
    tag: "Y_TE",
    source: "ACOG, Mayo Clinic",
  },
  "Căng thẳng với chồng/gia đình": {
    text: "Mâu thuẫn tăng sau khi có con thường là một giai đoạn sẽ dịu lại, không phải dấu hiệu mối quan hệ tan vỡ.",
    tag: "EMOTIONAL",
  },
  "Áp lực tiền bạc, khó đi làm lại": {
    text: "Áp lực tiền bạc sau sinh là một gánh nặng có thật — chi phí tăng đúng lúc thu nhập giảm hoặc mất hẳn. Đây không phải điều mẹ tưởng tượng ra.",
    tag: "EMOTIONAL",
  },
};

export const DEFAULT_TIP: Tip = {
  text: "Mất ngủ kéo dài thực sự thay đổi cách não xử lý cảm xúc — nếu mẹ thấy mình dễ khóc hơn, đó là sinh lý, không phải tính cách.",
  tag: "EMOTIONAL",
};

export const ONBOARDING = [
  {
    title: "Gỡ rối cùng mẹ",
    body: "Mình giúp mẹ tự chăm sóc chính mình và em bé với những chỉ dẫn rõ ràng, dựa trên nguồn y khoa đáng tin cậy.",
  },
  {
    title: "Luôn lắng nghe mẹ",
    body: "Mỗi ngày chỉ cần vài chạm để chia sẻ cảm xúc. Ứng dụng sẽ gợi ý điều phù hợp, hỏi thăm khi mẹ mệt vài ngày liền và lưu lại để mẹ có nhật ký cảm xúc tổng quan.",
  },
  {
    title: "Kết nối đúng nơi cần",
    body: "Mình là nguồn kết nối mẹ với nguồn hỗ trợ chính thống khi có vấn đề cấp thiết.",
    sources: [
      { n: "Đặt lịch hẹn với bác sĩ", d: "Khi mẹ hoặc bé cần được khám." },
      { n: "HOPE", d: "Có người lắng nghe khi mẹ quá tải (16:30–20:30)." },
      { n: "CSAGA", d: "Hỗ trợ kín đáo khi mẹ bị đe dọa hay bạo lực." },
      { n: "Ngôi nhà Bình yên", d: "Đồng hành cùng mẹ tìm lại cảm giác an toàn." },
    ],
  },
];

/** stressor / body / sleep / mood -> a question the mother can tap on the home screen and in the opener */
export const CHIP_Q: Record<string, string> = {
  "Con quấy khóc, mất ngủ": "Con khóc suốt chiều tối",
  "Cho con bú": "Mình không chắc sữa có đủ",
  "Quá tải, không muốn ai chạm vào": "Bé đòi bế cả ngày, mỏi tay",
  "Không còn là mình": "Mình thấy không còn là mình nữa",
  "Cô đơn, không ai hỏi han": "Mình thấy cô đơn, chẳng ai hỏi han",
  "Cơ thể chưa hồi phục": "Bao lâu thì cơ thể mình hồi phục?",
  "Căng thẳng với chồng/gia đình": "Mình căng thẳng với chồng và gia đình",
  "Áp lực tiền bạc, khó đi làm lại": "Mình lo chuyện tiền bạc và đi làm lại",
  "Có chỗ đau hoặc khó chịu": "Mình có chỗ đau, có bình thường không?",
  "Mình muốn được ai đó để ý đến mình": "Mình muốn được ai đó để ý đến mình",
  "Gần như không ngủ": "Mình gần như không ngủ được, phải làm sao?",
  "Ngủ ít": "Mình ngủ rất ít, phải làm sao?",
  "Quá tải": "Hôm nay mình thấy quá tải",
  Buồn: "Hôm nay mình thấy buồn",
  Mệt: "Hôm nay mình mệt quá",
};

export const FEED_FORMULA: { key: "mom" | "only" | "mix"; label: string }[] = [
  { key: "mom", label: "Sữa mẹ hoàn toàn" },
  { key: "only", label: "Sữa công thức hoàn toàn" },
  { key: "mix", label: "Kết hợp" },
];

export const FEED_METHOD: { key: "direct" | "pump" | "both"; label: string }[] = [
  { key: "direct", label: "Bú trực tiếp" },
  { key: "pump", label: "Ti bình" },
  { key: "both", label: "Song song cả hai cách" },
];

/** Shown when the quick-reply strip is empty (never after a Tier 3 reply). */
export const DEFAULT_SUGGESTIONS: Record<"1" | "2", string[]> = {
  "1": ["Mình muốn kể thêm", "Mình cần một mẹo nhỏ"],
  "2": ["Mình nên hỏi bác sĩ điều gì?", "Mình muốn kể thêm"],
};
