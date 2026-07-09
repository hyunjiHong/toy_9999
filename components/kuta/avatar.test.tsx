import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("이름과 고른 음료 라벨을 보여준다 (FR-2)", () => {
    render(<Avatar name="지훈" drink="americano" />);
    expect(screen.getByText("지훈")).toBeInTheDocument();
    // 음료 라벨이 컵으로 노출된다 (aria-label + 텍스트)
    expect(
      screen.getByLabelText("지훈, 아메리카노"),
    ).toBeInTheDocument();
  });

  it("본인 아바타는 이름에 '(나)'가 붙는다", () => {
    render(<Avatar name="민지" drink="latte" isMe />);
    expect(screen.getByText("민지 (나)")).toBeInTheDocument();
  });
});
