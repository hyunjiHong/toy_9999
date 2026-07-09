"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  fetchActiveSession,
  formatRemaining,
  remainingSeconds,
  startOrJoinSession,
  timerPhase,
} from "@/services/session";
import type { KutaSession, TimerPhase } from "@/types/kuta";

export interface KutaTimerResult {
  session: KutaSession | null;
  remaining: number | null;
  label: string | null; // "MM:SS" — 컴포넌트가 포맷 로직을 몰라도 되게 hook이 내려준다
  phase: TimerPhase | null;
  start: (question?: string | null) => Promise<void>;
}

// 커타 세션 구독 + started_at 기반 남은 시간 계산.
// 세션 변경 시 payload를 그대로 믿지 않고 정본(fetchActiveSession)을 재조회해 전원이 수렴한다(FR-6).
export function useKutaTimer(roomId: string): KutaTimerResult {
  const [session, setSession] = useState<KutaSession | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    const refresh = () =>
      fetchActiveSession(roomId)
        .then((s) => active && setSession(s))
        .catch(() => {});

    refresh();

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
        () => refresh(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 세션이 있을 때만 1초마다 갱신
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  const remaining = session ? remainingSeconds(session, now) : null;
  const phase = remaining === null ? null : timerPhase(remaining);
  const label = remaining === null ? null : formatRemaining(remaining);

  const start = useCallback(
    async (question: string | null = null) => {
      if (!isSupabaseConfigured) return;
      await startOrJoinSession(roomId, question);
      const canonical = await fetchActiveSession(roomId);
      setSession(canonical);
    },
    [roomId],
  );

  return { session, remaining, label, phase, start };
}
