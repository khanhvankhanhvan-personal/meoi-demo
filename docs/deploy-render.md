# Hướng dẫn đưa MeOi! lên mạng (Render, gói miễn phí)

Phần việc của mẹ khoảng 15 phút. Mọi thứ còn lại (build, kiểm tra, tự deploy mỗi khi code mới qua CI) đã được cấu hình sẵn
trong `Dockerfile`, `render.yaml` và `.github/workflows/`.

> **Dừng lại và báo mình** nếu ở bất kỳ bước nào Render đòi nhập **thẻ thanh toán**. Đừng nhập thẻ nếu mẹ không muốn.

## Bước 1. Gộp Pull Request
Mở Pull Request của nhánh `m4-deploy`, đợi CI xanh rồi bấm Merge. (Liên kết nằm trong tin nhắn của mình.)

## Bước 2. Tạo tài khoản Render
1. Vào https://render.com và chọn đăng nhập bằng **GitHub** (cho Render quyền đọc repo `meoi-demo`).
2. Không cần chọn gói trả phí; mọi thứ dưới đây dùng gói **Free**.

## Bước 3. Tạo dịch vụ từ Blueprint
1. Trong Render bấm **New +** → **Blueprint**.
2. Chọn repo `khanhvankhanhvan-personal/meoi-demo`, nhánh `main`. Render đọc file `render.yaml` và đề xuất dịch vụ `meoi`
   (Docker, Free, vùng **Singapore**).
3. Render hỏi giá trị cho `ANTHROPIC_API_KEY`: dán API key của mẹ vào đây. **Đây là nơi duy nhất mẹ nhập key**;
   key không nằm trong GitHub.
4. Bấm **Apply**. Lần build đầu mất khoảng 5–10 phút.
5. Khi xong, Render cho một địa chỉ dạng `https://meoi-xxxx.onrender.com`. Mở thử, mẹ sẽ thấy màn hình giới thiệu.

## Bước 4. Báo địa chỉ cho GitHub (để mỗi lần deploy được tự kiểm tra)
Trên GitHub: repo → **Settings → Secrets and variables → Actions → tab Variables → New repository variable**
- Name: `PUBLIC_URL`
- Value: địa chỉ Render của mẹ, **không có dấu `/` ở cuối**.

Từ giờ, sau mỗi lần merge vào `main` và CI xanh, Render tự deploy, rồi workflow *Verify deployment* tự chờ phiên bản mới
và chạy kiểm tra trên địa chỉ công khai.

## Bước 5. Giữ cho dịch vụ không "ngủ"
Gói miễn phí tự **ngủ sau 15 phút không có ai truy cập**; người vào sau đó phải chờ khoảng 1 phút. Điều này nguy hiểm với một
mẹ đang cần giúp, nên mình khuyên dùng một dịch vụ giám sát gọi vào app mỗi vài phút (cũng báo mẹ khi app hỏng):
1. Đăng ký một dịch vụ giám sát miễn phí (ví dụ UptimeRobot hoặc cron-job.org; mình chưa kiểm tra giới hạn hiện tại của họ).
2. Tạo một monitor kiểu HTTP(s), địa chỉ `https://meoi-xxxx.onrender.com/health`, khoảng cách **5 phút**.

Gói Free có 750 giờ/tháng cho cả tài khoản, vừa đủ để **một** dịch vụ chạy liên tục (31 ngày × 24 giờ = 744 giờ).
Vì vậy MeOi! được gộp thành **một** dịch vụ. Đừng thêm dịch vụ miễn phí khác vào cùng tài khoản Render.

## Bước 6. Báo mình
Gửi mình địa chỉ công khai. Mình sẽ chạy kiểm tra từ bên ngoài (health, danh sách số hỗ trợ, một câu Tier 3 và một vòng chat).

## Lưu ý quan trọng
- **Ngủ vẫn có thể xảy ra** khi Render khởi động lại hoặc đang deploy. Trước buổi bảo vệ (4/11), mẹ mở địa chỉ trước ~5 phút
  để chắc chắn app đã thức. Phương án dự phòng vẫn là bản Artifact của prototype.
- **Chưa có database**: dữ liệu của mẹ chỉ nằm trong trình duyệt, tải lại trang là mất (giống bản local). Cơ sở dữ liệu
  và đăng nhập thuộc M5. Database miễn phí của Render **bị xoá sau 30 ngày**, nên không phù hợp để lưu dữ liệu lâu dài.
- Mỗi lần deploy thành công, bước kiểm tra tự gửi **một** tin nhắn thật tới Claude (chi phí khoảng vài phần trăm xu).
- Nhớ đặt **hạn mức chi tiêu hằng tháng** trong console.anthropic.com.
