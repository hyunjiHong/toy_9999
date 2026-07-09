"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sendMessage } from "@/services/messages";
import type { Message } from "@/types/kuta";

export interface MessagesResult {
  messages: Message[];
  send: (senderName: string, content: string) => Promise<void>;
}

// 채팅 구독. 채팅은 휘발성(커피 위로 떠오르다 ~5초 뒤 사라짐)이라 히스토리를 불러오지 않고,
// 구독 이후 실시간으로 도착하는 메시지만 다룬다 → 늦게 들어온 사람은 이후 대화만 본다(FR-4/FR-10).
// (mount 시각 대신 "구독 이후 도착"을 기준으로 삼아 클라이언트/서버 시계 오차에 영향받지 않는다.)
export function useMessages(roomId: string): MessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

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
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const send = useCallback(
    async (senderName: string, content: string) => {
      if (!isSupabaseConfigured) return;
      await sendMessage(roomId, senderName, content);
    },
    [roomId],
  );

  return { messages, send };
}
