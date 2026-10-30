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

describe("History", () => {
  it("shows pinned notes and lets the mother delete one", async () => {
    render(
      <App
        api={mockApi()}
        initial={inApp({
          screen: "history",
          notes: [{ key: "k", text: "Không phải lỗi của mẹ.", topic: "Con khóc suốt", date: "2/11/2026", dkey: "2026-11-02" }],
        })}
      />,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Ghi chú" }));
    expect(screen.getByText("Không phải lỗi của mẹ.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xoá ghi chú" }));
    expect(screen.getByText(/Chưa có ghi chú nào/)).toBeInTheDocument();
  });

  it("shows the check-in of a selected day on the calendar", async () => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    render(
      <App
        api={mockApi()}
        initial={inApp({
          screen: "history",
          checkins: [{ key, date: "x", moods: ["Mệt"], sleep: "Ngủ ít", bodies: [], stressors: ["Cho con bú"] }],
        })}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`^Ngày ${now.getDate()}, đã check-in Mệt`) }));
    const detail = screen.getByLabelText("Chi tiết ngày");
    expect(within(detail).getByText("Tâm trạng: Mệt")).toBeInTheDocument();
    expect(within(detail).getByText("Giấc ngủ: Ngủ ít")).toBeInTheDocument();
    expect(within(detail).getByText("Nặng lòng: Cho con bú")).toBeInTheDocument();
  });
});
