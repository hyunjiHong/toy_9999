"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { fetchRecentMessages, sendMessage } from "@/services/messages";
import type { Message } from "@/types/kuta";

export interface MessagesResult {
  messages: Message[];
  send: (senderName: string, content: string) => Promise<void>;
}

// 방의 채팅을 구독한다. insert(전송) → Postgres Changes로 방 전원에게 2초 내 도착(FR-4).
// sinceIso(현재 커타 세션 시작 시각)가 바뀌면 목록을 초기화하고 그 이후 메시지만 보인다
// → 새 커타가 시작되면 이전 세션 대화가 사라진다(세션 단위 수명).
export function useMessages(
  roomId: string,
  sinceIso: string | null = null,
): MessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    fetchRecentMessages(roomId, sinceIso)
      .then((recent) => {
        if (active) setMessages(recent);
      })
      .catch(() => {
        /* 로드 실패해도 실시간 수신은 계속 */
      });

    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const next = payload.new as Message;
          if (sinceIso && next.created_at < sinceIso) return; // 이전 세션 메시지는 무시
          setMessages((prev) =>
            prev.some((m) => m.id === next.id) ? prev : [...prev, next],
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [roomId, sinceIso]);

  const send = useCallback(
    async (senderName: string, content: string) => {
      if (!isSupabaseConfigured) return;
      await sendMessage(roomId, senderName, content);
    },
    [roomId],
  );

  return { messages, send };
}
