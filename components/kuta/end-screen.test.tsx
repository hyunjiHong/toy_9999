import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EndScreen } from "./end-screen";
import type { Participant } from "@/types/kuta";

const people: Participant[] = [
  { name: "민지", drink: "latte" },
  { name: "지훈", drink: "americano" },
];

describe("EndScreen", () => {
  it("종료 안내와 함께한 사람 목록을 보여준다", () => {
    render(<EndScreen participants={people} onRestart={() => {}} />);
    expect(screen.getByText(/커타가 끝났어요/)).toBeInTheDocument();
    const roster = screen.getByRole("list", { name: "함께한 사람" });
    expect(roster).toHaveTextContent("민지");
    expect(roster).toHaveTextContent("지훈");
  });

  it("'다시 참여하기'를 누르면 onRestart가 호출된다", async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();
    render(<EndScreen participants={people} onRestart={onRestart} />);
    await user.click(screen.getByRole("button", { name: "다시 참여하기" }));
    expect(onRestart).toHaveBeenCalledOnce();
  });
});
