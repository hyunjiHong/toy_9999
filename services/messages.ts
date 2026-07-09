import { supabase } from "@/lib/supabase";

// 특정 시각 이전 메시지 삭제 (새 커타 시작 시 이전 세션 대화 정리 — 저장분 정리/프라이버시)
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
