"use client";

import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Participant } from "@/types/kuta";
import { Avatar } from "./avatar";

// 타이머가 0에 도달하면 뜨는 마무리 화면. 억지로 붙잡지 않고 자연스럽게 끝낸다.
export function EndScreen({
  participants,
  onRestart,
}: {
  participants: Participant[];
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
      <div className="flex size-24 items-center justify-center rounded-full border-2 border-dashed bg-muted opacity-60">
        <Coffee className="size-9 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <h1 className="text-lg font-bold">커타가 끝났어요 ☕</h1>
        <p className="text-sm text-muted-foreground">
          {participants.length}명이 함께했어요
        </p>
      </div>

      {participants.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-3" aria-label="함께한 사람">
          {participants.map((p, i) => (
            <li key={`${p.name}-${i}`}>
              <Avatar name={p.name} drink={p.drink} />
            </li>
          ))}
        </ul>
      )}

      <Button onClick={onRestart}>다시 참여하기</Button>
      <p className="text-xs text-muted-foreground">이제 다시 일하러 가볼까요 👋</p>
    </div>
  );
}
