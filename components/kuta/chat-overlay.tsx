import { cn } from "@/lib/utils";
import type { Message } from "@/types/kuta";

const VISIBLE = 4; // 화면에 동시에 떠 있는 최근 메시지 수

// 커피 장면 위로 떠오르는 채팅: 투명 배경 · 글자만 · 최신이 아래, 오래된 건 옅어짐.
// aria-live로 스크린리더가 새 메시지를 읽게 한다.
export function ChatOverlay({ messages }: { messages: Message[] }) {
  const recent = messages.slice(-VISIBLE);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col gap-1 px-4"
      aria-live="polite"
      aria-label="채팅"
    >
      {recent.map((m, i) => (
        <p
          key={m.id}
          className={cn(
            "text-sm [text-shadow:0_0_2px_var(--background),0_0_3px_var(--background)]",
            // 오래된(위쪽) 메시지는 옅어지며 사라지는 느낌
            i < recent.length - 2 && "opacity-45",
          )}
        >
          <span className="text-muted-foreground">{m.sender_name}</span>{" "}
          {m.content}
        </p>
      ))}
    </div>
  );
}
