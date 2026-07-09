import { supabase } from "@/lib/supabase";
import type { KutaSession, TimerPhase } from "@/types/kuta";

export const DEFAULT_DURATION_SECONDS = 600; // 10분 고정 (spec §8)
export const ENDING_SOON_SECONDS = 30; // 종료 30초 전 예고 (FR-7)

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

// 진행 중인 커타 = 방에서 "가장 먼저 시작된, 아직 안 끝난" 세션(canonical).
// 두 사람이 거의 동시에 "커타 시작"을 눌러 세션이 두 개 생겨도, 전원이 이 정본 하나로
// 수렴하므로 같은 시작시각·같은 질문을 본다 (FR-6/FR-8). 유일성 제약 대신 이 규칙으로 해결.
export async function fetchActiveSession(
  roomId: string,
  nowMs: number = Date.now(),
): Promise<KutaSession | null> {
  const { data, error } = await supabase
    .from("kuta_sessions")
    .select("*")
    .eq("room_id", roomId)
    .order("started_at", { ascending: true })
    .limit(20);
  if (error) throw error;
  const sessions = (data ?? []) as KutaSession[];
  return sessions.find((s) => remainingSeconds(s, nowMs) > 0) ?? null;
}

// 커타 시작: 이미 진행 중이면 그것을 반환(합류), 없으면 생성.
// (동시 생성 시 중복 행이 남을 수 있으나 fetchActiveSession의 정본 규칙이 이를 흡수한다.)
export async function startOrJoinSession(
  roomId: string,
  question: string | null = null,
  durationSeconds: number = DEFAULT_DURATION_SECONDS,
): Promise<KutaSession> {
  const active = await fetchActiveSession(roomId);
  if (active) return active;

  const { error } = await supabase.from("kuta_sessions").insert({
    room_id: roomId,
    duration_seconds: durationSeconds,
    question,
  });
  if (error) throw error;

  // insert 후 정본을 다시 조회해 반환 → 경합으로 남이 먼저 만든 세션이 있으면 그걸 쓴다.
  const canonical = await fetchActiveSession(roomId);
  if (!canonical) throw new Error("세션 생성 직후 활성 세션을 찾지 못했습니다.");
  return canonical;
}
