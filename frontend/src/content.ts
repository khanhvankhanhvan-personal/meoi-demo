// Product copy and constants ported from prototype V28 (docs/claude_MeOi-build-spec.md section 4).

export interface Option {
  label: string;
  emoji: string;
  tint: string;
  sub?: string; // second line on the check-in cards
  hint?: string; // shown on the diary summary
}

/** Redesign (2026-11-03): weather icons for moods, sleep cards with a second line. */
export type MoodGroup = "tired" | "mixed" | "ok";

export const MOODS: (Option & { group: MoodGroup })[] = [
  { label: "Kiệt sức", emoji: "🌧️", tint: "#E9E5F4", group: "tired" },
  { label: "Quá tải", emoji: "⛈️", tint: "#DCD6EC", group: "tired" },
  { label: "Bấp bênh", emoji: "⛅", tint: "#EEF0F3", group: "mixed" },
  { label: "Ổn định", emoji: "🌤️", tint: "#FBF0DC", group: "ok" },
  { label: "Bình yên", emoji: "☀️", tint: "#FBE6C8", group: "ok" },
];

/** Names used before the redesign still appear in check-ins that were already saved. */
export const LEGACY: Record<string, string> = {
  Mệt: "Kiệt sức",
  "Cáu gắt": "Quá tải",
  Buồn: "Bấp bênh",
  Ổn: "Ổn định",
  "Gần như không ngủ": "Thức trắng",
  "Ngủ ít": "Tạm ổn",
  "Ngủ đủ": "Hồi sức",
};

export const canon = (label: string): string => LEGACY[label] ?? label;
export const moodOf = (label: string) => MOODS.find((m) => m.label === canon(label));

export const SLEEPS: Option[] = [
  { label: "Thức trắng", emoji: "🥱", tint: "#F4F7F9", sub: "< 2h / chập chờn", hint: "Mẹ cố nghỉ ngơi khi bé ngủ nếu được" },
  { label: "Đứt quãng", emoji: "💤", tint: "#F4F7F9", sub: "Dậy nhiều cữ", hint: "Tranh thủ chợp mắt khi bé ngủ" },
  { label: "Tạm ổn", emoji: "🛏️", tint: "#F4F7F9", sub: "Chợp mắt 4-5h", hint: "Mẹ đang giữ được nhịp nghỉ" },
  { label: "Hồi sức", emoji: "✨", tint: "#F4F7F9", sub: "Ngủ sâu giấc hơn", hint: "Giấc ngủ đang giúp mẹ hồi sức" },
];

export const sleepOf = (label: string | null) => (label ? SLEEPS.find((o) => o.label === canon(label)) : undefined);

const plain = (label: string): Option => ({ label, emoji: "", tint: "#F4F7F9" });

export const BODIES: Option[] = [
  "Mỏi cổ vai gáy",
  "Đau lưng & hông",
  "Căng tức ngực",
  "Đau vết mổ / khâu",
  "Đau đầu, chóng mặt",
  "Mệt rã rời, uể oải",
  "Cơ thể nhẹ nhõm, dễ chịu",
].map(plain);

export const STRESSORS: Option[] = [
  "Cho con bú",
  "Mất ngủ kéo dài",
  "Con khóc nhiều",
  "Vết khâu & hồi phục",
  "Cảm giác một mình",
  "Áp lực người thân",
  "Cơ thể thay đổi",
  "Lo lắng công việc",
].map(plain);

/** Check-in worries -> the tip (kept in TIPS under its original name) shown for them. */
export const TIP_KEY: Record<string, string> = {
  "Con khóc nhiều": "Con quấy khóc, mất ngủ",
  "Cơ thể thay đổi": "Không còn là mình",
  "Cảm giác một mình": "Cô đơn, không ai hỏi han",
  "Vết khâu & hồi phục": "Cơ thể chưa hồi phục",
  "Áp lực người thân": "Căng thẳng với chồng/gia đình",
  "Lo lắng công việc": "Áp lực tiền bạc, khó đi làm lại",
};

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
  "Kiệt sức": "Hôm nay mình kiệt sức quá",
  "Bấp bênh": "Hôm nay mình thấy bấp bênh",
  "Mất ngủ kéo dài": "Mình mất ngủ nhiều ngày rồi, phải làm sao?",
  "Con khóc nhiều": "Con khóc suốt chiều tối",
  "Vết khâu & hồi phục": "Bao lâu thì cơ thể mình hồi phục?",
  "Cảm giác một mình": "Mình thấy cô đơn, chẳng ai hỏi han",
  "Áp lực người thân": "Mình căng thẳng với chồng và gia đình",
  "Cơ thể thay đổi": "Mình thấy không còn là mình nữa",
  "Lo lắng công việc": "Mình lo chuyện tiền bạc và đi làm lại",
  "Căng tức ngực": "Ngực mình căng tức, mình nên làm gì?",
  "Đau vết mổ / khâu": "Vết mổ của mình đau, có bình thường không?",
  "Đau đầu, chóng mặt": "Mình hay đau đầu, chóng mặt, có bình thường không?",
  "Thức trắng": "Mình gần như không ngủ được, phải làm sao?",
  "Đứt quãng": "Mình ngủ rất ít, phải làm sao?",
};

export interface Card<T extends string = string> {
  key: T;
  label: string;
  sub?: string;
}

export const FEED_FORMULA: Card<"mom" | "only" | "mix">[] = [
  { key: "mom", label: "Bú mẹ hoàn toàn", sub: "Không dùng sữa công thức, chỉ dùng sữa mẹ" },
  { key: "mix", label: "Dặm thêm sữa công thức", sub: "Bổ sung thêm cữ đêm hoặc dặm khi mẹ chưa kịp về đủ sữa" },
  { key: "only", label: "Dùng sữa công thức hoàn toàn", sub: "Bé hấp thu hoàn toàn từ sữa công thức phù hợp" },
];

export const FEED_METHOD: Card<"direct" | "pump" | "both" | "latch" | "bottle">[] = [
  { key: "direct", label: "Ti mẹ trực tiếp", sub: "Bé ngậm bú mẹ trực tiếp qua bầu ngực" },
  { key: "pump", label: "Hút sữa ra bình", sub: "Mẹ hút cữ đều đặn và cho con bú bình sữa mẹ" },
  { key: "both", label: "Kết hợp ti mẹ & ti bình", sub: "Bé vừa bú mẹ trực tiếp vừa ti bình khi cần" },
  { key: "latch", label: "Đang tập khớp ngậm / Đau rát", sub: "Con ngậm nông, nứt cổ gà hoặc mẹ đang chịu đau khi cho bú" },
  { key: "bottle", label: "Ti bình sữa công thức", sub: "Bé dùng bình với sữa công thức" },
];

/** Onboarding answers (redesign 2026-11-03). */
export const BABY_COUNTS: Card<"1" | "2" | "3">[] = [
  { key: "1", label: "1 bé", sub: "Bé đơn" },
  { key: "2", label: "2 bé", sub: "Sinh đôi" },
  { key: "3", label: "3 bé", sub: "Sinh ba" },
];

export const PARITY: Card<"first" | "other">[] = [
  { key: "first", label: "Lần đầu làm mẹ", sub: "Con đầu lòng, mọi thứ đều bỡ ngỡ mới mẻ" },
  { key: "other", label: "Đã từng sinh con", sub: "Bé thứ 2 trở lên, mỗi lần sinh là một trải nghiệm riêng" },
];

export const BIRTH_KINDS: Card<"normal" | "planned" | "emergency">[] = [
  { key: "normal", label: "Sinh thường", sub: "Theo dõi vết khâu tầng sinh môn và sự co hồi tử cung" },
  { key: "planned", label: "Sinh mổ chủ động (theo lịch)", sub: "Mổ chỉ định trước ngày dự sinh, cần chăm sóc vết mổ thành bụng" },
  { key: "emergency", label: "Sinh mổ cấp cứu (chuyển dạ rồi mổ)", sub: "Trải qua cả đau chuyển dạ và vết mổ, cơ thể thường mất nhiều sức hơn" },
];

export const RECOVERY_FEELS: Card<"wound_pain" | "ok" | "exhausted" | "need_help">[] = [
  { key: "wound_pain", label: "Còn đau nhức vết mổ/khâu" },
  { key: "ok", label: "Hồi phục tương đối êm" },
  { key: "exhausted", label: "Mệt mỏi rã rời toàn thân" },
  { key: "need_help", label: "Cần nhiều người hỗ trợ" },
];

export const SUPPORT_NEEDS: Card<"night_listen" | "breastfeeding" | "exhaustion">[] = [
  { key: "night_listen", label: "Lắng nghe lúc 2h sáng" },
  { key: "breastfeeding", label: "Sữa mẹ & cữ bú" },
  { key: "exhaustion", label: "Kiệt sức & thiếu ngủ" },
];

export const WELCOME = {
  title: "Chào mẹ, mình là Mẹ Ơi!",
  lead: "Hành trình sau sinh là một giai đoạn kỳ diệu, nhưng cũng đầy những đêm dài mệt nhoài, những lúc con khóc ngặt nghèo và cảm giác bối rối không biết tỏ cùng ai.",
  cardTitle: "Một góc an yên dành riêng cho mẹ",
  cardBody: "Mẹ không cần gồng mình để luôn hoàn hảo. Mọi bối rối, mệt mỏi hay cảm xúc tủi thân đều có thể trút ra ở đây.",
  bullets: [
    "Lắng nghe để hiểu rõ tình hình của mẹ nhất",
    "Đồng hành giúp mẹ xác định giải pháp cho mọi vấn đề làm mẹ bận tâm",
    "Luôn có mặt bất kể khi nào",
  ],
};

/**
 * One sentence about the phase the baby and the mother are in, shown under the age on the date step.
 * DRAFT wording (2026-11-03): general, non-diagnostic, no numbers beyond the 6-8 week recovery already
 * in TIPS. Needs review by a medical reviewer before beta (CLAUDE.md, open decision 5).
 */
export const AGE_NOTES: { maxDays: number; text: string }[] = [
  { maxDays: 14, text: "Những ngày đầu, bé ngủ phần lớn thời gian và bú rất nhiều; cơ thể mẹ cũng đang hồi phục, nên mẹ nghỉ khi bé ngủ nếu có thể." },
  { maxDays: 42, text: "Bé thường quấy nhiều vào chiều tối và bú dày; đây là giai đoạn phổ biến, mẹ cũng cần ăn, uống và ngủ đủ để hồi phục." },
  { maxDays: 91, text: "Bé bắt đầu mỉm cười và nhìn theo mẹ; cơ thể mẹ thường hồi phục cơ bản sau khoảng 6-8 tuần, lâu hơn nếu sinh mổ." },
  { maxDays: 183, text: "Bé thường ngủ đêm dài hơn và hóng chuyện nhiều; nhiều mẹ vẫn thấy mệt và cảm xúc lên xuống vẫn là điều thường gặp." },
  { maxDays: 365, text: "Bé có thể bắt đầu ăn dặm và tập bò; mẹ có thể cần thêm thời gian cho bản thân và sự hỗ trợ từ người thân." },
  { maxDays: 99999, text: "Bé đang tập đi và nói; hành trình làm mẹ vẫn tiếp tục, mẹ đừng quên chăm sóc chính mình." },
];

export const ageNote = (days: number): string => (AGE_NOTES.find((n) => days <= n.maxDays) ?? AGE_NOTES[AGE_NOTES.length - 1]).text;

/** Shown when the quick-reply strip is empty (never after a Tier 3 reply). */
export const DEFAULT_SUGGESTIONS: Record<"1" | "2", string[]> = {
  "1": ["Mình muốn kể thêm", "Mình cần một mẹo nhỏ"],
  "2": ["Mình nên hỏi bác sĩ điều gì?", "Mình muốn kể thêm"],
};

export const MEMORY_CATEGORIES: { key: import("./types").MemoryCategory; label: string; hint: string; emoji: string }[] = [
  { key: "life", label: "Cuộc sống & thói quen", hint: "Nhịp sinh hoạt, sở thích, điều mẹ hay làm", emoji: "🌿" },
  { key: "family", label: "Gia đình", hint: "Người thân, ai đang giúp mẹ", emoji: "🏠" },
  { key: "feelings", label: "Cảm xúc", hint: "Điều mẹ đang cảm thấy, lo lắng", emoji: "💭" },
  { key: "body", label: "Sức khỏe cơ thể", hint: "Điều mẹ kể về cơ thể mình", emoji: "🩺" },
  { key: "work_money", label: "Công việc & tài chính", hint: "Đi làm lại, chi tiêu, tiền bạc", emoji: "💼" },
];
