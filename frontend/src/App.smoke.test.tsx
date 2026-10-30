import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { kf } from "./lib/dates";
import { initialState } from "./store";
import { mockApi } from "./test/helpers";

/** One smoke path: intake -> check-in -> chat, with a mocked backend. */
describe("smoke: intake -> check-in -> chat", () => {
  it("works end to end and shows the crisis banner on a Tier 3 reply", async () => {
    const user = userEvent.setup();
    const api = mockApi({
      segments: ["Cảm ơn mẹ đã nói ra với mình.", "Mẹ gọi HOPE ngay bây giờ nhé."],
      suggestions: [],
      tier: "3-PSYCHIATRIC",
      source: "script",
      pinnable: false,
      crisis: {
        kind: "PSYCHIATRIC",
        label: "Mẹ không cần tự xử lý một mình",
        body: "Điều này cần một người thật lắng nghe mẹ ngay bây giờ.",
        contacts: [
          { name: "HOPE (16:30–20:30)", phone: "0865044400" },
          { name: "Cấp cứu 115", phone: "115" },
        ],
      },
    });
    render(<App api={api} initial={{ ...initialState, screen: "onboarding" }} />);

    // onboarding
    await user.click(screen.getByRole("button", { name: "Bỏ qua" }));

    // intake step 1: one baby
    await user.click(screen.getByRole("button", { name: "1 bé" }));
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));

    // step 2: birth date six weeks ago
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
    fireEvent.change(screen.getByLabelText("Ngày sinh của con"), { target: { value: kf(sixWeeksAgo) } });
    expect(screen.getByText(/khoảng 6 tuần tuổi/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));

    // step 3: profile
    await user.click(screen.getByRole("button", { name: "Sinh mổ" }));
    await user.click(screen.getByRole("button", { name: "Sữa mẹ hoàn toàn" }));
    await user.click(screen.getByRole("button", { name: "Bú trực tiếp" }));
    await user.click(screen.getByRole("button", { name: "Đúng rồi, đây là em bé đầu tiên của mình" }));
    await user.click(screen.getByRole("button", { name: "Xong" }));

    // home: hero for week 7, then a detailed check-in
    expect(screen.getByText("Tuần 7")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check-in 1 phút →" }));
    expect(screen.getByRole("button", { name: "Lưu check-in" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Mệt" }));
    await user.click(screen.getByRole("button", { name: "Cho con bú" }));
    await user.click(screen.getByRole("button", { name: "Lưu check-in" }));

    // chat opens with the opener and no banner
    expect(screen.getByText(/Hôm nay mẹ mệt và đang nặng lòng vì cho con bú/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // the mother writes something that the server classifies as Tier 3
    await user.type(screen.getByLabelText("Tin nhắn"), "Em muốn chết");
    await user.click(screen.getByRole("button", { name: "Gửi" }));

    const banner = await screen.findByRole("alert");
    expect(within(banner).getByText("Mẹ không cần tự xử lý một mình")).toBeInTheDocument();
    expect(within(banner).getByRole("link", { name: "Cấp cứu 115" })).toHaveAttribute("href", "tel:115");
    expect(screen.getByText("Mẹ gọi HOPE ngay bây giờ nhé.")).toBeInTheDocument();
    // only the Tier 1 opener can be pinned; the Tier 3 reply has no pin
    expect(screen.getAllByRole("button", { name: /ghim/i })).toHaveLength(1);

    // what was sent: opener + user message (assistant first), and the mapped profile
    expect(api.sendChat).toHaveBeenCalledOnce();
    const [messages, profile] = api.sendChat.mock.calls[0] as unknown as [
      { role: string; content: string }[],
      Record<string, unknown>,
    ];
    expect(messages.map((m) => m.role)).toEqual(["assistant", "user"]);
    expect(messages[1].content).toBe("Em muốn chết");
    expect(profile).toMatchObject({
      birth_type: "csection",
      first_time: true,
      babies: [{ label: "", formula: "mom", method: "direct" }],
    });
  });

  it("shows an error bubble that points to the support numbers when the request fails", async () => {
    const user = userEvent.setup();
    const api = mockApi();
    api.sendChat.mockRejectedValueOnce(new Error("network"));
    render(
      <App
        api={api}
        initial={{
          ...initialState,
          screen: "chat",
          profile: { birth: kf(new Date()), birthType: "normal", firstTime: true },
        }}
      />,
    );
    await user.type(screen.getByLabelText("Tin nhắn"), "Hôm nay em mệt");
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(await screen.findByText(/Mình chưa trả lời được lúc này/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ghim/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hỗ trợ" }));
    expect(await screen.findByRole("link", { name: /Cấp cứu 115/ })).toBeInTheDocument();
  });
});
