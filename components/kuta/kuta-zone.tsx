"use client";

import { Coffee, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_PARTICIPANTS } from "@/config/room";
import { usePresence } from "@/hooks/use-presence";
import { useMessages } from "@/hooks/use-messages";
import type { Participant } from "@/types/kuta";
import { Avatar } from "./avatar";
import { ChatInput } from "./chat-input";
import { ChatOverlay } from "./chat-overlay";

export function KutaZone({
  roomId,
  me,
  onLeave,
}: {
  roomId: string;
  me: Participant;
  onLeave: () => void;
}) {
  const { participants, isFull } = usePresence(roomId, me);
  const { messages, send } = useMessages(roomId);

  // FR-9 — 방이 가득 참
  if (isFull) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-lg font-bold">방이 가득 찼어요 ☕</h1>
        <p className="text-sm text-muted-foreground">
          최대 {MAX_PARTICIPANTS}명까지 함께할 수 있어요. 잠시 후 다시 시도해 주세요.
        </p>
        <Button variant="outline" onClick={onLeave}>
          돌아가기
        </Button>
      </div>
    );
  }

  // presence가 아직 비어도(설정 미구성/동기화 전) 최소한 나 자신은 보인다.
  const people = participants.length > 0 ? participants : [me];
  let meMarked = false;
  const markMe = (p: Participant) => {
    if (!meMarked && p.name === me.name && p.drink === me.drink) {
      meMarked = true;
      return true;
    }
    return false;
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="sr-only">커타 존</h1>

      {/* 상단 바: 인원 / 나가기 (타이머·질문은 T5/T6에서 추가) */}
      <div className="mb-4 flex items-center justify-between rounded-lg border bg-card px-3 py-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-4" aria-hidden /> {people.length} / {MAX_PARTICIPANTS}
        </span>
        <Button variant="outline" size="sm" onClick={onLeave}>
          <LogOut className="size-4" aria-hidden /> 나가기
        </Button>
      </div>

      {/* 커피 존 — 큰 커피 주위에 아바타, 채팅이 이 장면 위로 떠오른다 */}
      <div className="relative min-h-80 overflow-hidden rounded-lg border bg-card p-4">
        <div className="mx-auto mb-4 flex size-28 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed bg-muted">
          <Coffee className="size-9 text-muted-foreground" aria-hidden />
          <span className="text-xs text-muted-foreground">큰 커피</span>
        </div>
        <ul className="flex flex-wrap justify-center gap-4">
          {people.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <Avatar name={p.name} drink={p.drink} isMe={markMe(p)} />
            </li>
          ))}
        </ul>
        <ChatOverlay messages={messages} />
      </div>

      {/* 하단 채팅 입력 바 */}
      <ChatInput onSend={(text) => send(me.name, text)} />
    </div>
  );
}
