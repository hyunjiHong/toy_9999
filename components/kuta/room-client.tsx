"use client";

import { useState } from "react";
import { EntryForm } from "./entry-form";
import type { Participant } from "@/types/kuta";

// 방 화면의 상태 머신: 입장 전엔 EntryForm, 입장 후엔 커타 존.
// 커타 존의 실시간 아바타(T3)·채팅(T4)·타이머(T5)는 이후 Task에서 이 셸에 붙는다.
export function RoomClient({
  roomId,
  roomName,
}: {
  roomId: string;
  roomName?: string;
}) {
  const [me, setMe] = useState<Participant | null>(null);

  if (!me) {
    return <EntryForm roomName={roomName} onJoin={setMe} />;
  }

  return (
    <div className="mx-auto max-w-5xl" data-room-id={roomId}>
      <h1 className="text-lg font-bold">커타 존</h1>
      <p className="text-sm text-muted-foreground">
        {me.name} 님, 커타에 오신 걸 환영해요.
      </p>
      {/* T3: presence 아바타 · T4: 채팅 오버레이 · T5: 타이머/질문 */}
    </div>
  );
}
