"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { MAX_PARTICIPANTS } from "@/config/room";
import { flattenPresence } from "@/services/presence";
import type { Participant, RosterEntry } from "@/types/kuta";

export interface PresenceResult {
  participants: RosterEntry[];
  isFull: boolean;
  meKey: string;
}

// 방의 실시간 참여자를 구독한다 (Supabase Presence).
// 입장 시 나를 track → 다른 사람 화면에 등장(FR-3). 언마운트/나가기 시 untrack → 사라짐(FR-5).
// 방이 가득 차면(FR-9) track하지 않거나(사전) 넘치면 물러난다(사후) — presence는 원자적 정원을
// 보장하지 못하므로 best-effort. 완전 보장은 서버측 카운터가 필요(MVP 밖).
export function usePresence(
  roomId: string,
  me: Participant | null,
): PresenceResult {
  const [participants, setParticipants] = useState<RosterEntry[]>([]);
  const [isFull, setIsFull] = useState(false);
  const [meKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `me-${Math.random()}`,
  );

  useEffect(() => {
    if (!me || !isSupabaseConfigured) return;

    const joinedAt = new Date().toISOString();
    const channel = supabase.channel(`kuta:${roomId}`, {
      config: { presence: { key: meKey } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const roster = flattenPresence(channel.presenceState());
      setParticipants(roster);
      // 사후 정원 초과 판정: 내가 정원 밖(입장 순서상 8번째 초과)이면 물러난다.
      const myIndex = roster.findIndex((r) => r.key === meKey);
      if (myIndex >= MAX_PARTICIPANTS) {
        setIsFull(true);
        channel.untrack();
      }
    });

    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      // 사전 판정: 이미 정원이면 아예 track하지 않는다.
      if (flattenPresence(channel.presenceState()).length >= MAX_PARTICIPANTS) {
        setIsFull(true);
        return;
      }
      channel.track({ name: me.name, drink: me.drink, joined_at: joinedAt });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, me, meKey]);

  return { participants, isFull, meKey };
}
