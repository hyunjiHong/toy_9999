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
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !disabled;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText("");
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
