import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatOverlay } from "./chat-overlay";
import type { Message } from "@/types/kuta";

function msg(id: string, sender_name: string, content: string): Message {
  return {
    id,
    room_id: "r1",
    sender_name,
    content,
    created_at: "2026-07-09T03:00:00Z",
  };
}

describe("ChatOverlay", () => {
  it("메시지를 보낸 사람 이름과 함께 보여준다 (FR-4)", () => {
    render(<ChatOverlay messages={[msg("1", "서연", "점심 뭐 먹음?")]} />);
    expect(screen.getByText("서연")).toBeInTheDocument();
    expect(screen.getByText(/점심 뭐 먹음\?/)).toBeInTheDocument();
  });

  it("최근 4개까지만 떠 있는다", () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      msg(String(i), "민지", `메시지${i}`),
    );
    render(<ChatOverlay messages={many} />);
    // 가장 오래된 2개는 화면에서 빠진다
    expect(screen.queryByText("메시지0")).not.toBeInTheDocument();
    expect(screen.queryByText("메시지1")).not.toBeInTheDocument();
    expect(screen.getByText("메시지5")).toBeInTheDocument();
  });
});
