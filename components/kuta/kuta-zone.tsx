"use client";

import { Coffee, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_PARTICIPANTS } from "@/config/room";
import { pickQuestion } from "@/config/questions";
import { usePresence } from "@/hooks/use-presence";
import { useMessages } from "@/hooks/use-messages";
import { useKutaTimer } from "@/hooks/use-kuta-timer";
import type { Participant } from "@/types/kuta";
import { Avatar } from "./avatar";
import { ChatInput } from "./chat-input";
import { ChatOverlay } from "./chat-overlay";
import { EndScreen } from "./end-screen";
import { KutaTimer } from "./kuta-timer";
import { QuestionBanner } from "./question-banner";

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
  const { session, remaining, phase, start } = useKutaTimer(roomId);

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

  // FR-7 / SC5 — 0초 도달 시 종료 화면. "다시 참여하기" → 입장 화면(onLeave).
  if (phase === "ended") {
    return <EndScreen participants={people} onRestart={onLeave} />;
  }

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

      {/* FR-7 — 종료 30초 전 예고 (모달 대신 비침투 배너) */}
      {phase === "ending-soon" && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive"
        >
          곧 커타가 끝나요 ☕
        </div>
      )}

      {/* 상단 바: 타이머/커타 시작 · 인원 · 나가기 (질문 배너는 T6에서 추가) */}
      <div className="mb-4 flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
        <KutaTimer
          remaining={remaining}
          phase={phase}
          onStart={() => start(pickQuestion())}
        />
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-4" aria-hidden /> {people.length} / {MAX_PARTICIPANTS}
        </span>
        <Button variant="outline" size="sm" onClick={onLeave}>
          <LogOut className="size-4" aria-hidden /> 나가기
        </Button>
      </div>

      {/* 오늘의 커타 질문 (FR-8) — 세션에 저장된 질문을 방 전원이 봄 */}
      <QuestionBanner question={session?.question ?? null} />

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
