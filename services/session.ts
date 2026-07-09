import { supabase } from "@/lib/supabase";
import type { KutaSession } from "@/types/kuta";

export const DEFAULT_DURATION_SECONDS = 600; // 10분 고정 (spec §8)
export const ENDING_SOON_SECONDS = 30; // 종료 30초 전 예고 (FR-7)

export type TimerPhase = "active" | "ending-soon" | "ended";

// 남은 시간(초). started_at(서버 시각) 기준으로 계산 → 모든 클라이언트가 같은 값(FR-6).
export function remainingSeconds(
  session: Pick<KutaSession, "started_at" | "duration_seconds" | "ended_at">,
  nowMs: number,
): number {
  if (session.ended_at) return 0;
  const endMs =
    new Date(session.started_at).getTime() + session.duration_seconds * 1000;
  return Math.max(0, Math.ceil((endMs - nowMs) / 1000));
}

export function timerPhase(remaining: number): TimerPhase {
  if (remaining <= 0) return "ended";
  if (remaining <= ENDING_SOON_SECONDS) return "ending-soon";
  return "active";
}

// 남은 초 → "MM:SS"
export function formatRemaining(remaining: number): string {
  const safe = Math.max(0, remaining);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 진행 중인 커타 조회: 방의 최신 세션이 아직 남아 있으면 그것, 아니면 null.
export async function fetchActiveSession(
  roomId: string,
  nowMs: number = Date.now(),
): Promise<KutaSession | null> {
  const { data, error } = await supabase
    .from("kuta_sessions")
    .select("*")
    .eq("room_id", roomId)
    .order("started_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const latest = (data?.[0] ?? null) as KutaSession | null;
  if (!latest) return null;
  return remainingSeconds(latest, nowMs) > 0 ? latest : null;
}

// 커타 시작: 세션 생성. 이미 진행 중이면 그것을 반환(합류).
export async function startOrJoinSession(
  roomId: string,
  question: string | null = null,
  durationSeconds: number = DEFAULT_DURATION_SECONDS,
): Promise<KutaSession> {
  const active = await fetchActiveSession(roomId);
  if (active) return active;

  const { data, error } = await supabase
    .from("kuta_sessions")
    .insert({
      room_id: roomId,
      duration_seconds: durationSeconds,
      question,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as KutaSession;
}
