import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatInput } from "./chat-input";

describe("ChatInput", () => {
  it("빈 입력이면 보내기 버튼이 비활성", () => {
    render(<ChatInput onSend={() => {}} />);
    expect(screen.getByRole("button", { name: "보내기" })).toBeDisabled();
  });

  it("입력 후 전송하면 onSend가 호출되고 입력이 비워진다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByLabelText("채팅 입력");
    await user.type(input, "점심 뭐 먹음?");
    await user.click(screen.getByRole("button", { name: "보내기" }));

    expect(onSend).toHaveBeenCalledWith("점심 뭐 먹음?");
    await waitFor(() => expect(input).toHaveValue(""));
  });
});
