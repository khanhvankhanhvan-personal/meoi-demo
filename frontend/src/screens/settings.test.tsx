import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import { inApp, mockApi } from "../test/helpers";

const profileState = () =>
  inApp({
    screen: "profile",
    profile: { birth: "2026-09-21", birthType: "csection", csectionKind: "emergency", firstTime: true, recoveryFeel: "ok" },
    babies: [{ label: "Bắp", formula: "mom", method: "direct" }],
  });

describe("Cài đặt & Hồ sơ", () => {
  it("shows the birth profile as locked, with the answers from onboarding", () => {
    render(<App api={mockApi()} initial={profileState()} />);
    expect(screen.getByText("Cố định")).toBeInTheDocument();
    expect(screen.getByText("Bắp")).toBeInTheDocument();
    expect(screen.getByText("Sinh mổ cấp cứu")).toBeInTheDocument();
    expect(screen.getByText("Hồi phục tương đối êm")).toBeInTheDocument();
    expect(screen.getByText("Lần đầu sinh con (Bé đầu lòng)")).toBeInTheDocument();
  });

  it("changes need an explicit 'correct a mistake' step and a save", async () => {
    const user = userEvent.setup();
    render(<App api={mockApi()} initial={profileState()} />);
    await user.click(screen.getByRole("button", { name: /Chỉnh sửa hồ sơ sinh sản nếu có sai sót/ }));
    await user.click(within(screen.getByRole("group", { name: "Cách sinh" })).getByRole("button", { name: /Sinh thường/ }));
    await user.click(screen.getByRole("button", { name: /Lưu thay đổi hồ sơ/ }));
    expect(screen.getByText("Sinh thường")).toBeInTheDocument();
    expect(screen.getByText("Cố định")).toBeInTheDocument();
  });

  it("cancel leaves the profile untouched", async () => {
    const user = userEvent.setup();
    render(<App api={mockApi()} initial={profileState()} />);
    await user.click(screen.getByRole("button", { name: /Chỉnh sửa hồ sơ sinh sản nếu có sai sót/ }));
    await user.click(within(screen.getByRole("group", { name: "Cách sinh" })).getByRole("button", { name: /Sinh thường/ }));
    await user.click(screen.getByRole("button", { name: "Huỷ" }));
    expect(screen.getByText("Sinh mổ cấp cứu")).toBeInTheDocument();
  });

  it("feeding tab edits the feeding method, and the onboarding can be replayed", async () => {
    const user = userEvent.setup();
    render(<App api={mockApi()} initial={profileState()} />);
    await user.click(screen.getByRole("tab", { name: "Cách ti & Sữa" }));
    await user.click(screen.getByRole("button", { name: /Hút sữa ra bình/ }));
    expect(screen.getByRole("button", { name: /Hút sữa ra bình/ })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: /Xem lại phần chào đón/ }));
    expect(screen.getByText(/Chào mẹ, mình là Mẹ Ơi/)).toBeInTheDocument();
  });

  it("a signed-in mother sees her nickname and a log-out button", async () => {
    const api = mockApi();
    render(<App api={api} initial={{ ...profileState(), user: { id: "u1", nickname: "mebong" } }} />);
    expect(screen.getByText("mebong")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(api.logout).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: /Làm quen cùng Mẹ Ơi!/ })).toBeInTheDocument();
  });
});
