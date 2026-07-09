"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types/kuta";

const LIFETIME_MS = 5000; // 5초 보이고 사라짐

interface Floater {
  id: string;
  sender: string;
  content: string;
  left: number; // % — 커피 주변 불특정 가로 위치
}

// 커피 장면 위로 떠오르는 채팅: 새 메시지가 아무 위치에서 나타나 위로 떠오르다 5초 뒤 사라진다.
// useMessages가 구독 이후 도착분만 넘겨주므로, 아직 안 띄운 id면 곧 도착한 새 메시지다.
export function ChatOverlay({ messages }: { messages: Message[] }) {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const fresh = messages.filter((m) => !seen.current.has(m.id));
    if (fresh.length === 0) return;

    const spawned: Floater[] = fresh.map((m) => {
      seen.current.add(m.id);
      return {
        id: m.id,
        sender: m.sender_name,
        content: m.content,
        left: 8 + Math.random() * 54, // 8%~62%
      };
    });
    setFloaters((prev) => [...prev, ...spawned]);

    for (const f of spawned) {
      const t = setTimeout(() => {
        setFloaters((prev) => prev.filter((x) => x.id !== f.id));
      }, LIFETIME_MS);
      timers.current.push(t);
    }
  }, [messages]);

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-live="polite"
      aria-label="채팅"
    >
      {floaters.map((f) => (
        <p
          key={f.id}
          style={{ left: `${f.left}%` }}
          className="absolute bottom-6 max-w-[42%] text-sm [text-shadow:0_0_2px_var(--background),0_0_3px_var(--background)] [animation:kuta-float_5s_ease-out_forwards]"
        >
          <span className="text-muted-foreground">{f.sender}</span> {f.content}
        </p>
      ))}
    </div>
  );
}
