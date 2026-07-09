import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/kuta";

export const RECENT_MESSAGE_LIMIT = 50;

// 입장 시 최근 메시지 로드 (맥락 유지)
export async function fetchRecentMessages(roomId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(RECENT_MESSAGE_LIMIT);
  if (error) throw error;
  return (data ?? []) as Message[];
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
