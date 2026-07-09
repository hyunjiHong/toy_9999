"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

// 하단 채팅 입력 바. 전송하면 글자가 커피 장면 위로 떠오른다(ChatOverlay).
export function ChatInput({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const canSend = text.trim().length > 0 && !disabled && !sending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    const value = text.trim();
    setSending(true);
    try {
      await onSend(value);
      setText(""); // 전송 성공 후에만 비운다 (실패 시 입력 유지)
    } catch {
      /* 전송 실패 — 입력을 유지해 재시도할 수 있게 둔다 */
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <InputGroup>
        <InputGroupInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="채팅 입력…"
          aria-label="채팅 입력"
          disabled={disabled}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            variant="default"
            aria-label="보내기"
            disabled={!canSend}
          >
            <Send data-icon="inline-start" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
