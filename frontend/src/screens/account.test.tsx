import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import { ApiError } from "../lib/api";
import { initialState, type State } from "../store";
import { emptyAccount, inApp, mockApi } from "../test/helpers";

const signedIn = (over: Partial<State> = {}): State =>
  inApp({ screen: "home", user: { id: "u1", nickname: "mebong" }, ...over });

async function fillAuth(user: ReturnType<typeof userEvent.setup>, nickname: string, pin: string) {
  await user.type(screen.getByLabelText("Biệt danh"), nickname);
  await user.type(screen.getByLabelText("Mã PIN (6 số)"), pin);
}

describe("sign in", () => {
  it("logs in, loads the saved account and opens the home screen", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.loadAccount.mockResolvedValue({
      ...emptyAccount,
      profile: { birth: "2026-09-21", birthType: "normal", firstTime: true },
    });
    render(<App api={api} initial={{ ...initialState, screen: "onboarding" }} />);
    await user.click(screen.getByRole("button", { name: "Mình đã có tài khoản" }));
    await fillAuth(user, "mebong", "123456");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(api.login).toHaveBeenCalledWith("mebong", "123456");
    expect(await screen.findByText(/ngày bên con/)).toBeInTheDocument();
  });

  it("shows the server's message when the PIN is wrong, and stays on the form", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.login.mockRejectedValue(new ApiError(401, "Biệt danh hoặc mã PIN chưa đúng."));
    render(<App api={api} initial={{ ...initialState, screen: "auth" }} />);
    await fillAuth(user, "mebong", "000000");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Biệt danh hoặc mã PIN chưa đúng.");
  });

  it("only accepts six digits and keeps the button disabled until the form is valid", async () => {
    const user = userEvent.setup();
    render(<App api={mockApi()} initial={{ ...initialState, screen: "auth" }} />);
    const submit = screen.getByRole("button", { name: "Đăng nhập" });
    await user.type(screen.getByLabelText("Biệt danh"), "mebong");
    await user.type(screen.getByLabelText("Mã PIN (6 số)"), "12ab34");
    expect(screen.getByLabelText("Mã PIN (6 số)")).toHaveValue("1234");
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Mã PIN (6 số)"), "56");
    expect(submit).toBeEnabled();
  });

  it("sign-up shows the recovery code once and blocks continuing until it is saved", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    render(<App api={api} initial={{ ...initialState, screen: "auth" }} />);
    await user.click(screen.getByRole("button", { name: "Mình chưa có tài khoản" }));
    await fillAuth(user, "mebong", "123456");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    expect(await screen.findByLabelText("Mã khôi phục")).toHaveTextContent("ABCD-EFGH-JKLM-NPQR");
    const go = screen.getByRole("button", { name: "Tiếp tục" });
    expect(go).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "Mẹ đã lưu mã này" }));
    await user.click(go);
    expect(screen.getByText("Cuộc sinh của mẹ")).toBeInTheDocument(); // new account -> onboarding questions
    expect(screen.queryByText("ABCD-EFGH-JKLM-NPQR")).not.toBeInTheDocument();
  });

  it("forgot PIN: the recovery code resets it and issues a new code", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    render(<App api={api} initial={{ ...initialState, screen: "auth" }} />);
    await user.click(screen.getByRole("button", { name: "Mình quên mã PIN" }));
    await user.type(screen.getByLabelText("Biệt danh"), "mebong");
    await user.type(screen.getByLabelText("Mã khôi phục"), "ABCD-EFGH-JKLM-NPQR");
    await user.type(screen.getByLabelText("Mã PIN mới (6 số)"), "654321");
    await user.click(screen.getByRole("button", { name: "Đặt mã PIN mới" }));
    expect(api.resetPin).toHaveBeenCalledWith("mebong", "ABCD-EFGH-JKLM-NPQR", "654321");
    expect(await screen.findByLabelText("Mã khôi phục")).toHaveTextContent("WXYZ-2345-6789-ABCD");
  });
});

describe("restoring a session", () => {
  it("opens straight to the home screen when a saved session exists", async () => {
    const api = mockApi();
    api.me.mockResolvedValue({ id: "u1", nickname: "mebong" });
    api.loadAccount.mockResolvedValue({
      ...emptyAccount,
      profile: { birth: "2026-09-21", birthType: "normal", firstTime: true },
    });
    render(<App api={api} restoreSession />);
    expect(await screen.findByText(/ngày bên con/)).toBeInTheDocument();
  });

  it("falls back to the guest welcome screen when there is no session", async () => {
    render(<App api={mockApi()} restoreSession />);
    expect(await screen.findByRole("button", { name: "Bỏ qua" })).toBeInTheDocument();
  });
});

describe("saving to the account", () => {
  it("saves a check-in for a signed-in mother", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    render(<App api={api} initial={signedIn()} />);
    await user.click(screen.getByRole("button", { name: "Check-in cảm xúc của mẹ hiện tại" }));
    await user.click(screen.getByRole("button", { name: /Kiệt sức/ }));
    await user.click(screen.getByRole("button", { name: "Lưu check-in này" }));
    await waitFor(() => expect(api.saveCheckin).toHaveBeenCalledTimes(1));
    expect(api.saveCheckin.mock.calls[0][0].moods).toEqual(["Kiệt sức"]);
  });

  it("saves a pinned note, and removes it from the account when un-pinned", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    const chat = signedIn({
      screen: "chat",
      messages: [
        { role: "user", content: "Mệt quá" },
        { role: "assistant", content: "Mẹ nghỉ khi bé ngủ nhé.", tier: "1", pinnable: true },
      ],
    });
    render(<App api={api} initial={chat} />);
    await user.click(screen.getByRole("button", { name: "Ghim câu trả lời này" }));
    await waitFor(() => expect(api.addNote).toHaveBeenCalledWith(expect.objectContaining({ text: "Mẹ nghỉ khi bé ngủ nhé." })));
    await user.click(screen.getByRole("button", { name: "Bỏ ghim câu trả lời" }));
    await waitFor(() => expect(api.deleteNote).toHaveBeenCalledWith("note-1"));
  });

  it("uploads what a guest already entered when they create an account", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    const guest = inApp({
      screen: "auth",
      checkins: [{ key: "2026-11-02", date: "2/11/2026", moods: ["Mệt"], sleep: null, bodies: [], stressors: [] }],
    });
    render(<App api={api} initial={guest} />);
    await user.click(screen.getByRole("button", { name: "Mình chưa có tài khoản" }));
    await fillAuth(user, "mebong", "123456");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));
    await waitFor(() => expect(api.saveProfile).toHaveBeenCalled());
    await waitFor(() => expect(api.saveCheckin).toHaveBeenCalledWith(expect.objectContaining({ key: "2026-11-02" })));
  });

  it("guests are never sent to the server", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    render(<App api={api} initial={inApp({ screen: "home" })} />);
    await user.click(screen.getByRole("button", { name: "Check-in cảm xúc của mẹ hiện tại" }));
    await user.click(screen.getByRole("button", { name: /Kiệt sức/ }));
    await user.click(screen.getByRole("button", { name: "Lưu check-in này" }));
    await new Promise((r) => setTimeout(r, 700));
    expect(api.saveCheckin).not.toHaveBeenCalled();
    expect(api.saveProfile).not.toHaveBeenCalled();
  });
});

describe("account controls", () => {
  it("signs out and returns to the welcome screen", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    render(<App api={api} initial={signedIn({ screen: "profile" })} />);
    expect(screen.getByText("mebong")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(api.logout).toHaveBeenCalled();
    expect(await screen.findByRole("button", { name: "Bỏ qua" })).toBeInTheDocument();
  });

  it("deleting the account needs the PIN, and a wrong PIN shows an error", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.deleteAccount.mockRejectedValueOnce(new ApiError(401, "Mã PIN chưa đúng."));
    render(<App api={api} initial={signedIn({ screen: "profile" })} />);
    await user.click(screen.getByRole("button", { name: "Xoá tài khoản và toàn bộ dữ liệu" }));
    const confirm = screen.getByRole("button", { name: "Xoá tất cả" });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Mã PIN"), "000000");
    await user.click(confirm);
    expect(await screen.findByRole("alert")).toHaveTextContent("Mã PIN chưa đúng.");
    await user.clear(screen.getByPlaceholderText("Mã PIN"));
    await user.type(screen.getByPlaceholderText("Mã PIN"), "123456");
    await user.click(screen.getByRole("button", { name: "Xoá tất cả" }));
    expect(api.deleteAccount).toHaveBeenLastCalledWith("123456");
    expect(await screen.findByRole("button", { name: "Bỏ qua" })).toBeInTheDocument();
  });

  it("a guest sees how to create an account", async () => {
    render(<App api={mockApi()} initial={inApp({ screen: "profile" })} />);
    expect(screen.getByRole("button", { name: "Tạo tài khoản hoặc đăng nhập" })).toBeInTheDocument();
  });

  it("nudges a guest after two messages, never a signed-in mother, and can be dismissed", async () => {
    const user = userEvent.setup();
    const msgs = [
      { role: "user" as const, content: "a" },
      { role: "assistant" as const, content: "b" },
      { role: "user" as const, content: "c" },
    ];
    const { unmount } = render(<App api={mockApi()} initial={inApp({ screen: "home", messages: msgs })} />);
    expect(screen.getByText("Mẹ muốn mình nhớ giúp mẹ?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Để sau" }));
    expect(screen.queryByText("Mẹ muốn mình nhớ giúp mẹ?")).not.toBeInTheDocument();
    unmount();
    render(<App api={mockApi()} initial={signedIn({ messages: msgs })} />);
    expect(screen.queryByText("Mẹ muốn mình nhớ giúp mẹ?")).not.toBeInTheDocument();
  });
});
