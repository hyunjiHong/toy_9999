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
export function useMessages(roomId: string): MessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    fetchRecentMessages(roomId)
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
  }, [roomId]);

  const send = useCallback(
    (senderName: string, content: string) =>
      sendMessage(roomId, senderName, content),
    [roomId],
  );

  return { messages, send };
}
