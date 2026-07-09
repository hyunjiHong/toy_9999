import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KutaTimer } from "./kuta-timer";

describe("KutaTimer", () => {
  it("진행 중인 커타가 없으면 '커타 시작' 버튼을 보여준다", () => {
    render(<KutaTimer remaining={null} phase={null} onStart={() => {}} />);
    expect(screen.getByRole("button", { name: /커타 시작/ })).toBeInTheDocument();
  });

  it("세션이 있으면 남은 시간을 MM:SS로 보여준다", () => {
    render(<KutaTimer remaining={572} phase="active" onStart={() => {}} />);
    expect(screen.getByRole("timer")).toHaveTextContent("09:32");
  });
});
