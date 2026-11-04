import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import type { Memory } from "../types";
import { inApp, mockApi } from "../test/helpers";

const signedIn = (screen: "chat" | "profile") => inApp({ screen, user: { id: "u1", nickname: "mebong" } });

const mem = (id: string, text: string, category: Memory["category"] = "work_money"): Memory => ({
  id,
  text,
  category,
  created_at: "2026-11-04T00:00:00Z",
});

async function sendThree(user: ReturnType<typeof userEvent.setup>) {
  for (const t of ["Mình mệt", "Mình sắp đi làm lại", "Mình lo chuyện tiền"]) {
    await user.type(screen.getByLabelText("Tin nhắn"), t);
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    await screen.findAllByText("Mình nghe mẹ.");
  }
}

describe("Bộ nhớ của mẹ (settings)", () => {
  it("asks a guest to sign up first", async () => {
    const user = userEvent.setup();
    render(<App api={mockApi()} initial={inApp({ screen: "profile" })} />);
    await user.click(screen.getByRole("tab", { name: /Bộ nhớ/ }));
    expect(screen.getByText(/Bộ nhớ chỉ dành cho tài khoản/)).toBeInTheDocument();
  });

  it("lists what is remembered, and lets her edit and delete an item", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.listMemories.mockResolvedValue([mem("a", "Mẹ kể rằng mẹ sắp đi làm lại."), mem("b", "Mẹ kể rằng bà ngoại đang giúp mẹ.", "family")]);
    render(<App api={api} initial={signedIn("profile")} />);
    await user.click(screen.getByRole("tab", { name: /Bộ nhớ/ }));
    expect(await screen.findByText("Mẹ kể rằng mẹ sắp đi làm lại.")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Sửa/ })[0]);
    const box = screen.getByLabelText("Sửa điều được nhớ");
    await user.clear(box);
    await user.type(box, "Mẹ kể rằng mẹ đi làm lại vào tháng sau.");
    await user.click(screen.getByRole("button", { name: /Lưu/ }));
    expect(api.editMemory).toHaveBeenCalledWith("a", "Mẹ kể rằng mẹ đi làm lại vào tháng sau.");
    expect(await screen.findByText("Mẹ kể rằng mẹ đi làm lại vào tháng sau.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Xoá: Mẹ kể rằng bà ngoại/ }));
    expect(api.deleteMemory).toHaveBeenCalledWith("b");
    await waitFor(() => expect(screen.queryByText("Mẹ kể rằng bà ngoại đang giúp mẹ.")).not.toBeInTheDocument());
  });

  it("switches memory and topics on or off, and can delete everything after a confirmation", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.listMemories.mockResolvedValue([mem("a", "Mẹ kể rằng mẹ sắp đi làm lại.")]);
    render(<App api={api} initial={signedIn("profile")} />);
    await user.click(screen.getByRole("tab", { name: /Bộ nhớ/ }));
    await screen.findByText("Mẹ kể rằng mẹ sắp đi làm lại.");

    await user.click(screen.getByRole("switch", { name: "Sức khỏe cơ thể" }));
    expect(api.saveMemorySettings).toHaveBeenLastCalledWith({
      enabled: true,
      topics: ["life", "family", "child_dev", "feelings", "work_money", "body"],
    });
    await user.click(screen.getByRole("switch", { name: "Cho phép Mẹ Ơi! nhớ" }));
    expect(api.saveMemorySettings).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));

    await user.click(screen.getByRole("button", { name: "Xoá tất cả bộ nhớ" }));
    expect(api.deleteAllMemories).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Xoá tất cả" }));
    expect(api.deleteAllMemories).toHaveBeenCalled();
    expect(await screen.findByText(/Chưa có gì được nhớ/)).toBeInTheDocument();
  });
});

describe("Bộ nhớ: suggest and confirm in chat", () => {
  it("suggests after three of her messages, and stores only when she says yes", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.suggestMemories.mockResolvedValue([{ text: "Mẹ kể rằng mẹ sắp đi làm lại và đang lo chuyện tiền bạc.", category: "work_money" }]);
    render(<App api={api} initial={signedIn("chat")} />);
    await sendThree(user);
    expect(await screen.findByText("Mình nhớ điều này nhé?")).toBeInTheDocument();
    expect(api.suggestMemories).toHaveBeenCalledTimes(1);
    expect(api.addMemory).not.toHaveBeenCalled(); // nothing is stored before she agrees

    await user.click(screen.getByRole("button", { name: "Nhớ nhé" }));
    expect(api.addMemory).toHaveBeenCalledWith("Mẹ kể rằng mẹ sắp đi làm lại và đang lo chuyện tiền bạc.", "work_money");
    expect(await screen.findByRole("status")).toHaveTextContent("Mình đã nhớ điều này");
    expect(screen.queryByText("Mình nhớ điều này nhé?")).not.toBeInTheDocument();
  });

  it("'Không' stores nothing", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.suggestMemories.mockResolvedValue([{ text: "Mẹ kể rằng mẹ thích đi dạo.", category: "life" }]);
    render(<App api={api} initial={signedIn("chat")} />);
    await sendThree(user);
    await user.click(await screen.findByRole("button", { name: "Không" }));
    expect(api.addMemory).not.toHaveBeenCalled();
    expect(screen.queryByText("Mình nhớ điều này nhé?")).not.toBeInTheDocument();
  });

  it("never asks a guest, and never after a Tier 3 reply", async () => {
    const user = userEvent.setup();
    const guest = mockApi();
    guest.suggestMemories.mockResolvedValue([{ text: "Mẹ kể rằng x.", category: "life" }]);
    const { unmount } = render(<App api={guest} initial={inApp({ screen: "chat" })} />);
    await sendThree(user);
    expect(guest.suggestMemories).not.toHaveBeenCalled();
    unmount();

    const crisis = mockApi({ tier: "3-PSYCHIATRIC", pinnable: false });
    render(<App api={crisis} initial={signedIn("chat")} />);
    for (const t of ["a", "b", "c"]) {
      await user.type(screen.getByLabelText("Tin nhắn"), t);
      await user.click(screen.getByRole("button", { name: "Gửi" }));
      await waitFor(() => expect(crisis.sendChat).toHaveBeenCalledTimes(["a", "b", "c"].indexOf(t) + 1));
    }
    expect(crisis.suggestMemories).not.toHaveBeenCalled();
  });
});
