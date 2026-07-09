import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("도착한 메시지가 이름과 함께 떠오르고, 5초 뒤 사라진다 (FR-4/FR-10)", () => {
    const { rerender } = render(<ChatOverlay messages={[]} />);

    act(() => {
      rerender(<ChatOverlay messages={[msg("1", "서연", "점심 뭐 먹음?")]} />);
    });
    expect(screen.getByText("서연")).toBeInTheDocument();
    expect(screen.getByText(/점심 뭐 먹음\?/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText(/점심 뭐 먹음\?/)).not.toBeInTheDocument();
  });

  it("같은 메시지는 리렌더돼도 한 번만 떠오른다", () => {
    const list = [msg("1", "민지", "안녕")];
    const { rerender } = render(<ChatOverlay messages={[]} />);
    act(() => rerender(<ChatOverlay messages={list} />));
    act(() => rerender(<ChatOverlay messages={[...list]} />)); // 동일 id 재전달
    expect(screen.getAllByText("안녕")).toHaveLength(1);
  });
});
