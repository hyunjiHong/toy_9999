"use client";

import { useState } from "react";
import { EntryForm } from "./entry-form";
import { KutaZone } from "./kuta-zone";
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

  // 나가기(Scenario D): me를 비우면 다시 입장 화면 → 재입장 가능.
  return <KutaZone roomId={roomId} me={me} onLeave={() => setMe(null)} />;
}
