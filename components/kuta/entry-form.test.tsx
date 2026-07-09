import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EntryForm } from "./entry-form";

describe("EntryForm", () => {
  // FR-1 / SC1
  it("이름이 비어 있으면 '커타 참여' 버튼이 비활성이다", () => {
    render(<EntryForm onJoin={() => {}} />);
    expect(screen.getByRole("button", { name: "커타 참여" })).toBeDisabled();
  });

  it("이름을 입력하면 '커타 참여' 버튼이 활성화된다", async () => {
    const user = userEvent.setup();
    render(<EntryForm onJoin={() => {}} />);
    await user.type(screen.getByLabelText("이름"), "민지");
    expect(screen.getByRole("button", { name: "커타 참여" })).toBeEnabled();
  });

  it("공백만 입력하면 버튼이 비활성으로 남는다", async () => {
    const user = userEvent.setup();
    render(<EntryForm onJoin={() => {}} />);
    await user.type(screen.getByLabelText("이름"), "   ");
    expect(screen.getByRole("button", { name: "커타 참여" })).toBeDisabled();
  });

  // FR-2 / SC2
  it("음료로 '카푸치노'를 고르면 미리보기 컵이 카푸치노로 바뀐다", async () => {
    const user = userEvent.setup();
    render(<EntryForm onJoin={() => {}} />);
    // 기본값 라떼
    expect(screen.getByText(/라떼 컵을 들고 있어요/)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "카푸치노" }));
    expect(screen.getByText(/카푸치노 컵을 들고 있어요/)).toBeInTheDocument();
  });

  // SC1 — 제출 시 고른 이름/음료가 전달된다
  it("이름 입력 후 제출하면 onJoin이 이름과 음료로 호출된다", async () => {
    const user = userEvent.setup();
    const onJoin = vi.fn();
    render(<EntryForm onJoin={onJoin} />);
    await user.type(screen.getByLabelText("이름"), "민지");
    await user.click(screen.getByRole("button", { name: "커타 참여" }));
    expect(onJoin).toHaveBeenCalledWith({ name: "민지", drink: "latte" });
  });
});
