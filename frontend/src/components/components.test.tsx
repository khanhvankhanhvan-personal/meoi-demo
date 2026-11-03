import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { mockApi, inApp } from "../test/helpers";
import { CrisisBanner } from "./CrisisBanner";
import type { Crisis } from "../types";

const crisis: Crisis = {
  kind: "PSYCHIATRIC",
  label: "Mẹ không cần tự xử lý một mình",
  body: "Điều này cần một người thật lắng nghe mẹ ngay bây giờ.",
  contacts: [
    { name: "HOPE (16:30–20:30)", phone: "0865044400" },
    { name: "Cấp cứu 115", phone: "115" },
  ],
};

describe("CrisisBanner", () => {
  it("shows the label, body and a tap-to-call link per contact", () => {
    render(<CrisisBanner crisis={crisis} onDismiss={() => {}} />);
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText(crisis.label)).toBeInTheDocument();
    expect(within(alert).getByRole("link", { name: "Cấp cứu 115" })).toHaveAttribute("href", "tel:115");
    expect(within(alert).getByRole("link", { name: /HOPE/ })).toHaveAttribute("href", "tel:0865044400");
  });

  it("does not hide itself; only the dismiss button calls back", async () => {
    const onDismiss = vi.fn();
    render(<CrisisBanner crisis={crisis} onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Ẩn thông báo" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

describe("Chat: pin and quick replies", () => {
  it("offers the pin on a Tier 1 reply and the quick-reply strip", () => {
    render(
      <App
        api={mockApi()}
        initial={inApp({
          messages: [
            { role: "user", content: "Con khóc suốt" },
            { role: "assistant", content: "Không phải lỗi của mẹ.", segments: ["Không phải lỗi của mẹ."], suggestions: ["Con hơi sốt"], tier: "1", pinnable: true },
          ],
        })}
      />,
    );
    expect(screen.getByRole("button", { name: "Ghim câu trả lời này" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Con hơi sốt" })).toBeInTheDocument();
  });

  it.each(["3-PHYSICAL", "3-PSYCHIATRIC", "3-SAFETY"])(
    "shows no pin and no quick replies after a %s reply",
    (tier) => {
      render(
        <App
          api={mockApi()}
          initial={inApp({
            messages: [
              { role: "user", content: "x" },
              { role: "assistant", content: "Mẹ gọi 115.", segments: ["Mẹ gọi 115."], suggestions: ["Không nên hiện"], tier, pinnable: true },
            ],
          })}
        />,
      );
      expect(screen.queryByRole("button", { name: /ghim/i })).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Gợi ý trả lời nhanh")).not.toBeInTheDocument();
    },
  );

  it("falls back to doctor-oriented suggestions after a Tier 2 reply", () => {
    render(
      <App
        api={mockApi()}
        initial={inApp({
          messages: [{ role: "assistant", content: "Mỗi bé mỗi khác.", segments: ["Mỗi bé mỗi khác."], tier: "2", pinnable: true }],
        })}
      />,
    );
    expect(screen.getByRole("button", { name: "Mình nên hỏi bác sĩ điều gì?" })).toBeInTheDocument();
  });
});

describe("Support access", () => {
  it("is one tap away from every in-app screen", async () => {
    render(<App api={mockApi()} initial={inApp({ screen: "home" })} />);
    await userEvent.click(screen.getByRole("button", { name: "Hỗ trợ" }));
    const dialog = await screen.findByRole("dialog", { name: "Hỗ trợ khi mẹ cần" });
    expect(within(dialog).getByRole("link", { name: /Cấp cứu 115/ })).toHaveAttribute("href", "tel:115");
  });
});

describe("Nhật ký & Đã lưu", () => {
  const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  it("shows pinned tips with a category, search, and lets the mother delete one", async () => {
    const user = userEvent.setup();
    render(
      <App
        api={mockApi()}
        initial={inApp({
          screen: "history",
          diaryTab: "pins",
          notes: [
            { key: "k1", text: "Chườm ấm nhẹ nhàng trước khi cho bú.", topic: "Ngực căng", date: "2/11/2026", dkey: "2026-11-02" },
            { key: "k2", text: "Mẹ đừng tự trách mình nhé.", topic: "Mệt quá", date: "2/11/2026", dkey: "2026-11-02" },
          ],
        })}
      />,
    );
    expect(screen.getByText("Y tế & Phục hồi sau sinh")).toBeInTheDocument(); // auto category on the card
    expect(screen.getAllByText("Vỗ về tinh thần").length).toBeGreaterThan(1); // the pill on the card and the filter chip
    await user.type(screen.getByLabelText("Tìm trong thông tin đã ghim"), "chuom am");
    expect(screen.queryByText("Mẹ đừng tự trách mình nhé.")).not.toBeInTheDocument();
    expect(screen.getByText("Chườm ấm nhẹ nhàng trước khi cho bú.")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Tìm trong thông tin đã ghim"));
    const del = screen.getAllByRole("button", { name: "Xoá khỏi mục đã ghim" });
    await user.click(del[0]);
    await user.click(screen.getByRole("button", { name: "Xoá khỏi mục đã ghim" }));
    expect(screen.getByText(/Chưa có gì được ghim/)).toBeInTheDocument();
  });

  it("shows the 7-day summary, the medical cue, and a day card that opens a chat about that day", async () => {
    const user = userEvent.setup();
    render(
      <App
        api={mockApi()}
        initial={inApp({
          screen: "history",
          checkins: [
            {
              key: today(),
              date: "x",
              moods: ["Mệt"], // saved before the redesign
              sleep: "Ngủ ít",
              bodies: ["Mỏi cổ vai gáy"],
              stressors: ["Cho con bú"],
              note: "Bé thức 4 lần",
            },
          ],
        })}
      />,
    );
    expect(screen.getByText("Cần nghỉ ngơi")).toBeInTheDocument();
    expect(screen.getByText(/1 ngày mệt • 0 ngày êm/)).toBeInTheDocument();
    expect(screen.getByText(/sốt cao trên 38.5°C/)).toBeInTheDocument();
    expect(screen.getAllByText(/Kiệt sức/).length).toBeGreaterThan(0); // old name shown as the new one
    await user.click(screen.getByRole("button", { name: /Chi tiết ngày/ }));
    expect(screen.getByText("Bé thức 4 lần")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tâm sự về ngày này" }));
    expect(screen.getByText(/Hôm nay mẹ thấy kiệt sức/)).toBeInTheDocument();
  });

  it("filters the diary by mood", async () => {
    const user = userEvent.setup();
    const mk = (key: string, moods: string[]) => ({ key, date: key, moods, sleep: null, bodies: [], stressors: [] });
    render(
      <App
        api={mockApi()}
        initial={inApp({ screen: "history", checkins: [mk(today(), ["Bình yên"]), mk("2020-01-01", ["Kiệt sức"])] })}
      />,
    );
    expect(screen.getByText("Hiển thị 2 lượt ghi")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Lúc mệt mỏi" }));
    expect(screen.getByText("Hiển thị 1 lượt ghi")).toBeInTheDocument();
  });
});

describe("Chat header and pins", () => {
  it("pins a single bubble, shows the toast, and the tab badge counts it", async () => {
    const user = userEvent.setup();
    render(
      <App
        api={mockApi()}
        initial={inApp({
          messages: [
            { role: "user", content: "Mệt quá" },
            { role: "assistant", content: "A\n\nB", segments: ["A", "B"], tier: "1", pinnable: true },
          ],
        })}
      />,
    );
    await user.click(screen.getAllByRole("button", { name: "Ghim câu trả lời này" })[1]);
    expect(await screen.findByRole("status")).toHaveTextContent("Đã lưu vào Thông tin đã ghim");
    expect(screen.getByRole("button", { name: "Bỏ ghim câu trả lời" })).toBeInTheDocument();
    expect(screen.getByLabelText("1 mục đã ghim")).toBeInTheDocument();
  });
});
