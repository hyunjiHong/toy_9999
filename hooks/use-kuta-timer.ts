"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  fetchActiveSession,
  remainingSeconds,
  startOrJoinSession,
  timerPhase,
  type TimerPhase,
} from "@/services/session";
import type { KutaSession } from "@/types/kuta";

export interface KutaTimerResult {
  session: KutaSession | null;
  remaining: number | null;
  phase: TimerPhase | null;
  start: (question?: string | null) => Promise<void>;
}

// 커타 세션 구독 + started_at 기반 남은 시간 계산.
// 세션 시작/종료는 postgres_changes로 방 전원에게 동시에 전파 → 같은 남은 시간(FR-6).
export function useKutaTimer(roomId: string): KutaTimerResult {
  const [session, setSession] = useState<KutaSession | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    fetchActiveSession(roomId)
      .then((s) => active && setSession(s))
      .catch(() => {});

    const channel = supabase
      .channel(`session:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kuta_sessions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new && "id" in payload.new) {
            setSession(payload.new as KutaSession);
          }
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 세션이 있을 때만 1초마다 갱신 (설정 없거나 대기 중엔 타이머 불필요)
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  const remaining = session ? remainingSeconds(session, now) : null;
  const phase = remaining === null ? null : timerPhase(remaining);

  const start = useCallback(
    async (question: string | null = null) => {
      const s = await startOrJoinSession(roomId, question);
      setSession(s);
    },
    [roomId],
  );

  return { session, remaining, phase, start };
}
