import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionBanner } from "./question-banner";

describe("QuestionBanner", () => {
  it("질문을 보여준다", () => {
    render(<QuestionBanner question="요즘 제일 아까운 지출은?" />);
    expect(screen.getByText(/오늘의 커타 질문/)).toBeInTheDocument();
    expect(screen.getByText("요즘 제일 아까운 지출은?")).toBeInTheDocument();
  });

  it("질문이 없으면 아무것도 렌더하지 않는다", () => {
    const { container } = render(<QuestionBanner question={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
