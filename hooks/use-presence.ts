"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { MAX_PARTICIPANTS } from "@/config/room";
import { flattenPresence } from "@/services/presence";
import type { Participant } from "@/types/kuta";

export interface PresenceResult {
  participants: Participant[];
  isFull: boolean;
}

// 방의 실시간 참여자를 구독한다 (Supabase Presence).
// 입장 시 나를 track → 다른 사람 화면에 등장(FR-3). 언마운트/나가기 시 untrack → 사라짐(FR-5).
// 방이 이미 가득 차 있으면(FR-9) track하지 않고 isFull을 세운다.
export function usePresence(
  roomId: string,
  me: Participant | null,
): PresenceResult {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    // 설정이 없으면(테스트/미구성) 실시간 연결을 열지 않는다.
    if (!me || !isSupabaseConfigured) return;

    const joinedAt = new Date().toISOString();
    const channel = supabase.channel(`kuta:${roomId}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel.on("presence", { event: "sync" }, () => {
      setParticipants(flattenPresence(channel.presenceState()));
    });

    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      const current = flattenPresence(channel.presenceState());
      if (current.length >= MAX_PARTICIPANTS) {
        setIsFull(true);
        return;
      }
      channel.track({ name: me.name, drink: me.drink, joined_at: joinedAt });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, me]);

  return { participants, isFull };
}
