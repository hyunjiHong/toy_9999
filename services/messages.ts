import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/kuta";

export const RECENT_MESSAGE_LIMIT = 50;

// 입장 시 최근 메시지 로드 (맥락 유지).
// sinceIso가 주어지면 그 시각 이후 메시지만 → 채팅을 현재 커타 세션으로 한정(세션 단위 수명).
export async function fetchRecentMessages(
  roomId: string,
  sinceIso?: string | null,
): Promise<Message[]> {
  let query = supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(RECENT_MESSAGE_LIMIT);
  if (sinceIso) query = query.gte("created_at", sinceIso);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Message[];
}

// 특정 시각 이전 메시지 삭제 (새 커타 시작 시 이전 세션 대화 정리)
export async function deleteMessagesBefore(
  roomId: string,
  beforeIso: string,
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("room_id", roomId)
    .lt("created_at", beforeIso);
  if (error) throw error;
}

// 메시지 전송 (DB insert → Postgres Changes로 방 전원에게 브로드캐스트)
export async function sendMessage(
  roomId: string,
  senderName: string,
  content: string,
): Promise<void> {
  const text = content.trim();
  if (!text) return;
  const { error } = await supabase
    .from("messages")
    .insert({ room_id: roomId, sender_name: senderName, content: text });
  if (error) throw error;
}
