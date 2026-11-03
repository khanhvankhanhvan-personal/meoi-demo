# Quy trình cải tiến sản phẩm MeOi!

Mục tiêu: mỗi thay đổi đi từ ý kiến của mẹ đến bản chạy công khai **nhanh, an toàn, và tốn ít thời gian nhất của mẹ**
(~10 giờ/tuần). Thời gian của mẹ là thứ đắt nhất, nên quy trình tối ưu cho **số phút mẹ phải đọc và quyết**, không phải cho số việc mình làm.

## 1. Chuỗi mẹ đề xuất, và hai chỗ nên chỉnh

Chuỗi hiện tại: **chỉnh frontend + yêu cầu → chỉnh backend → test → deploy.** Chuỗi này đúng hướng. Mình đề nghị chỉnh hai chỗ:

1. **Phân làn theo rủi ro trước khi làm.** Đổi màu nút và đổi từ khoá Tier 3 không thể đi cùng một quy trình: cái đầu sai thì sửa lại 5 phút, cái sau sai thì một mẹ đang khủng hoảng không nhận được giúp đỡ.
2. **Test đi trước code, và chính là "tiêu chí chấp nhận" mẹ đọc được.** Mẹ duyệt 3–6 dòng "Khi... thì..." (không phải code); mình biến nó thành test chạy tự động; code chỉ xong khi test xanh. Frontend và backend không bao giờ lệch nhau vì cùng một tiêu chí.

```
Mẹ dùng app thật ─► Phiếu phản hồi ─► Phân làn (A/B/C) ─► Tiêu chí chấp nhận ─► Test đỏ ─► Code ─► Test xanh
                                                             (mẹ duyệt)                        │
                                      Mẹ xem ảnh/bản chạy thử ◄── CI xanh ◄── Pull Request ◄──┘
                                                │
                                          Mẹ bấm Merge ─► Render tự deploy ─► kiểm tra tự động bản công khai
```

## 2. Ba làn

| Làn | Thay đổi thuộc loại | Ví dụ | Mẹ phải làm gì | Cổng bắt buộc |
|---|---|---|---|---|
| **A. Giao diện** | Chữ, màu, bố cục, thứ tự màn hình; **không** đổi dữ liệu hay nội dung y tế | Đổi chữ nút, chỉnh khoảng cách, đổi icon | Xem ảnh trước/sau (≤5 phút) | CI xanh + mẹ duyệt ảnh |
| **B. Hành vi** | Dữ liệu mới, endpoint mới, tính năng mới | Hộp góp ý, đăng nhập, giới hạn tần suất | Duyệt tiêu chí chấp nhận; trả lời câu hỏi quyết định (nếu có) | Test viết trước + CI xanh + không phá bất biến (mục 5) |
| **C. An toàn và nội dung** | Từ khoá Tier 3, kịch bản cố định, prompt, đổi model, số điện thoại, **mọi nội dung y tế** (kể cả `TIPS` trong `frontend/src/content.ts`) | Thêm từ khoá "chán sống", sửa câu trả lời Tier 3 | **Quyết định + chấm kết quả** | Bộ câu an toàn vàng + 7 evals + mẹ chấm "đạt" + ADR. **Chỉ mẹ merge.** |

**Cách xác định làn:** nhìn tệp bị sửa. `frontend/src/screens|components|styles` → A. `backend/app/chat|support|main` hoặc thêm API → B.
`backend/app/safety|scripts|replies|hours`, `backend/app/prompts/`, `render.yaml` (tên model), `frontend/src/content.ts` → **C**. Một PR trộn nhiều làn
thì tính theo làn **cao nhất**; nên tách PR.

## 3. Nhịp làm việc mỗi tuần (khoảng 2–4 giờ của mẹ)

| Khi nào | Mẹ làm (phút) | Mình làm |
|---|---|---|
| **Nhịp 1: phản hồi** | Dùng app thật trên điện thoại 20–30 phút; điền 3–5 phiếu phản hồi (mỗi phiếu ~3 phút) | Phân làn từng phiếu, đề xuất thứ tự, nêu rõ phiếu nào cần mẹ **quyết định** |
| | Duyệt phạm vi tuần này + trả lời các quyết định mở (10–20 phút) | Viết tiêu chí chấp nhận, test, code, chạy local |
| **Nhịp 2: duyệt** | Xem ảnh/bản chạy thử, chấm tiêu chí (10–20 phút); với Làn C chấm báo cáo evals | Mở Pull Request, chờ CI, gửi mẹ ảnh trước/sau |
| | Bấm Merge, xác nhận sau deploy (5 phút) | Kiểm tra bản công khai bằng bộ smoke test, báo kết quả |

**Xem bản chạy thử:** mình chạy sẵn app trên máy mẹ (`http://localhost:8080` qua `docker compose`) và chụp ảnh; không cần môi trường xem trước riêng
(gói Render miễn phí không dành cho việc này).

## 4. Chi tiết từng làn

**Làn A (giao diện).** Phiếu phản hồi → mình sửa `frontend/` + cập nhật test component → chạy local, chụp ảnh trước/sau → mẹ duyệt → PR → CI → Merge. Thường **xong trong một phiên**.

**Làn B (hành vi).**
1. Mình viết **tiêu chí chấp nhận** (ví dụ: *Khi mẹ bấm "Gửi góp ý" với nội dung rỗng, thì nút bị khoá; Khi gửi được, thì thấy lời cảm ơn và server không ghi nội dung vào log*). Mẹ duyệt.
2. Mình đề xuất hợp đồng API (mẹ không cần đọc) và viết test (đỏ) cho backend và frontend.
3. Backend → xanh. Frontend → xanh. Mở rộng smoke test nếu cần.
4. PR → CI → Merge → deploy tự động → kiểm tra bản công khai.

**Làn C (an toàn và nội dung).**
1. Mình nêu rủi ro và đánh đổi ngắn gọn (đúng CLAUDE.md); mẹ **quyết** (đây là các "quyết định mở").
2. Mình ghi ADR.
3. Thêm câu vào **bộ câu an toàn vàng** trước (mục 6), rồi mới sửa code/prompt.
4. Chạy 7 evals ở cả hai chế độ (`python -m evals.run_tier_evals` và `--llm-only`), hoặc để workflow `Tier evals on sensitive PRs` tự chạy khi đã có secret.
5. Mẹ chấm từng case; chỉ khi **tất cả đạt** mới merge. **Không bao giờ auto-merge Làn C.**

## 5. Bất biến an toàn (kiểm tra tự động, không ai được phá)
Đã có test cho: từ khoá chạy trước LLM; Tier 3 không qua LLM và không ghim được; giờ HOPE tính ở server; log không chứa nội dung tin nhắn; thiếu tag thì mặc định thận trọng; hồi đáp rỗng không gửi bong bóng trống; nút Hỗ trợ có ở mọi màn hình.
Không thêm tính năng nào mà **chẩn đoán**, **lưu hội thoại** ở server, hay ghi **nội dung tin nhắn** vào log.

## 6. Bộ câu an toàn vàng (mới)
`backend/tests/data/safety_golden.json`: danh sách câu → luật Tier mà `match()` phải trả về (cả câu nguy hiểm lẫn câu vô hại không được báo động nhầm).
- **Mẹ chỉ cần gửi mình câu**, mình thêm vào (mẹ không cần biết code). Câu càng giống lời mẹ bỉm thật càng tốt, nhất là từ các buổi beta.
- Phần `known_gaps` là những cách nói **đáng ra phải bắt nhưng hiện chưa bắt** (15 câu, ví dụ "em chán sống quá rồi", "chồng em bóp cổ em", "vết mổ của em chảy mủ"). Mỗi câu được ghi là lỗi dự kiến; khi sửa xong, test sẽ báo để chuyển sang nhóm bắt buộc.
  **Mẹ cần duyệt danh sách này**, vì thêm từ khoá là quyết định an toàn của mẹ.

## 7. Cổng tự động
| Đã có | Nên thêm (theo ưu tiên) |
|---|---|
| ruff, mypy, pytest (150 test + 15 lỗ hổng đã biết), eslint, vitest (29), build, thử `docker compose`, thử image production, kiểm tra bản công khai sau deploy | 1. Tự chạy evals khi PR đụng Làn C (workflow đã thêm, cần secret `ANTHROPIC_API_KEY`) 2. Kiểm tra lệch hợp đồng API (OpenAPI ↔ kiểu TypeScript) 3. Dependabot cập nhật thư viện 4. Quét bí mật tự động trong CI |

## 8. Phát hành và quay lui
- **Mỗi Pull Request nhỏ, một mục đích.** Merge xong, Render tự deploy khi CI xanh; workflow *Verify deployment* tự kiểm tra bản công khai (cần biến `PUBLIC_URL`).
- **Quay lui:** trên GitHub, mở PR vừa merge → **Revert** → merge bản revert → deploy tự động. Đây là cách chắc chắn nhất.
- **Đóng băng trước bảo vệ:** từ **21:00 ngày 3/11** đến hết buổi bảo vệ chỉ sửa lỗi nghiêm trọng. Sau khi merge PR hồ sơ hiện tại, đặt thẻ phiên bản `v1.0-defense` để luôn biết bản nào đã đem đi bảo vệ.

## 9. Việc nên làm tiếp (theo thứ tự đề nghị, Làn và cái mẹ cần quyết)

| # | Việc | Làn | Mẹ cần quyết | Ước tính |
|---|---|---|---|---|
| 1 | Duyệt 15 câu "lỗ hổng đã biết" → thêm từ khoá được duyệt | C | Chọn câu nào được thêm | 1–2h |
| 2 | Chỉnh prompt cho các điểm quan sát ở evals (Tier 3 chế độ chỉ-LLM tự thêm hướng dẫn; case 7b đổi xưng "em") | C | Có cần không (mẹ đã chấm đạt) | 1–2h |
| 3 | Tự host font chữ (không gửi địa chỉ IP người dùng tới Google) | A | Đồng ý | 0,5h |
| 4 | Giới hạn tần suất gọi LLM theo IP/ngày để bảo vệ ví; Tier 3 không bao giờ bị giới hạn | B | Mức giới hạn (vd. 30 lượt/ngày) | 1–2h |
| 5 | Hộp góp ý (`/feedback`), chuẩn bị cho beta | B | Gửi về đâu (email, GitHub issue) | 2h |
| 6 | M5: đăng nhập ẩn danh + database | B | **Open decision #1** (khôi phục PIN) và nơi lưu database (không có thẻ quốc tế) | 5–7h |
| 7 | M6: ghim → lịch sử + bộ nhớ | B/C | **Open decision #2, #3, #6** | 5–8h |
| 8 | Reviewer y tế/tâm lý + kiểm tra pháp lý dữ liệu sức khoẻ (**Open decision #5**) | ngoài code | Tìm ai | không tính giờ code |
| 9 | Beta 3–5 mẹ, thu phản hồi bằng phiếu | vòng lặp | Chọn mẹ tham gia | — |

Mục 8 và 9 mới quyết định sản phẩm có hữu ích thật hay không; mục 1–7 chỉ làm sản phẩm ổn hơn.

## 10. Phiếu phản hồi nhanh
Mở repo trên GitHub → **Issues → New issue → "Yêu cầu thay đổi"** và điền biểu mẫu (màn hình, điều mẹ thấy, điều mẹ muốn, ảnh, có liên quan an toàn/nội dung y tế không).
Nếu mẹ không chắc, cứ chọn "Không chắc": mình sẽ phân làn giúp mẹ.

## 11. Đường nhanh: gõ `/ship` (ít công sức nhất cho mẹ)
Mẹ chỉ cần **mô tả ngắn + dán ảnh chụp màn hình** trong phiên Claude Code (ví dụ: `/ship [ảnh] đổi ô chọn ngày thành bánh xe, nút căn lại cho đều`). Mình tự làm phần còn lại:

| Bước | Ai làm | Mẹ tốn |
|---|---|---|
| Hiểu yêu cầu, xác định Làn, hỏi tối đa **một** câu nếu thật sự cần | Claude | 0-1 phút |
| Sửa code + test, chạy lint/kiểu/test/build, chụp ảnh sau khi sửa | Claude | 0 |
| Xem ảnh, nói "ok" | Mẹ | ~1 phút |
| **Làn A:** đẩy nhánh `ui/<tên>` -> workflow *Ship UI change (Lane A)* tự mở PR, chạy CI, **tự merge khi CI xanh** -> Render tự deploy -> *Verify deployment* tự kiểm tra bản công khai | Tự động | 0 |
| **Làn B/C:** mở PR, mẹ bấm Merge (Làn C kèm evals + mẹ chấm) | Mẹ | như mục 3-4 |
| Báo "đã lên chưa" (đối chiếu `/health` với commit) | Claude | 0 |

**Làn A tự merge có rào chắn:** chỉ nhánh `ui/*`; chỉ tệp giao diện thuần (`scripts/lane-check.sh`; **không** gồm `Chat.tsx`, `CrisisBanner`, `SupportList`, `content.ts`, `opener.ts`, `api.ts`, `store`); CI phải xanh; chỉ merge đúng commit mẹ đã duyệt (đẩy thêm commit thì PR cũ không merge); không merge trong **thời gian đóng băng** (21:00 ngày 3/11 đến hết 4/11); **công tắc tắt:** đặt biến repo `AUTO_SHIP` = `off`.
Nếu nhánh `ui/*` có tệp ngoài Làn A, workflow vẫn mở PR nhưng **không** tự merge.
**Quay lui:** mở PR đã merge -> Revert -> (đây là Làn A nên có thể gửi lại qua `/ship`: "hoàn tác thay đổi vừa rồi").

**Cài đặt một lần (2 phút):** GitHub -> Settings -> Actions -> General -> bật *Allow GitHub Actions to create and approve pull requests*; Settings -> Variables -> thêm `PUBLIC_URL` = `https://meoi.onrender.com` (để bước kiểm tra sau deploy chạy). Cần để workflow này nằm trên nhánh `main` thì mới chạy.
**Chưa kiểm chứng:** workflow chưa chạy thật lần nào; lần `/ship` Làn A đầu tiên là lần chạy thử, mình sẽ theo dõi.
