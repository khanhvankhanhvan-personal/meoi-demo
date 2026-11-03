/** A gentle opening line that follows the mother's day and night. Device time, no server needed. */
export function momentLine(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Đêm khuya rồi mẹ ơi, cữ đêm này có làm mẹ mệt không?";
  if (h < 11) return "Buổi sáng dịu nhẹ nhé mẹ, mình ở đây cùng mẹ.";
  if (h < 14) return "Trưa rồi mẹ ơi, mẹ đã kịp ăn chút gì chưa?";
  if (h < 18) return "Buổi chiều của mẹ thế nào rồi?";
  if (h < 22) return "Tối rồi mẹ ơi, mẹ nhớ nghỉ ngơi một chút nhé.";
  return "Khuya rồi mẹ ơi, mẹ vẫn đang thức cùng bé à?";
}
