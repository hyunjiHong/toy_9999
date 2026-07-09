import { cn } from "@/lib/utils";
import { drinkLabel } from "@/config/drinks";
import { avatarColors, DRINK_COLOR } from "@/lib/avatar-style";
import type { DrinkId } from "@/types/kuta";

// 참여자 픽셀 아바타 (귀여운 버전) — 이름별 색 + 든 음료 컵. 종료 화면 등 단독 표시용.
export function Avatar({
  name,
  drink,
  isMe = false,
}: {
  name: string;
  drink: DrinkId;
  isMe?: boolean;
}) {
  const displayName = isMe ? `${name} (나)` : name;
  const { skin, hair, shirt } = avatarColors(name);
  const cup = DRINK_COLOR[drink];

  return (
    <div
      className="flex w-16 flex-col items-center gap-1"
      aria-label={`${displayName}, ${drinkLabel(drink)}`}
    >
      <div className={cn("rounded-md p-0.5", isMe && "ring-2 ring-foreground")}>
        <svg width="48" height="56" viewBox="0 0 48 56" role="img" aria-hidden>
          <rect x="13" y="6" width="22" height="8" fill={hair} />
          <rect x="11" y="13" width="5" height="13" fill={hair} />
          <rect x="32" y="13" width="5" height="13" fill={hair} />
          <rect x="14" y="11" width="20" height="20" rx="2" fill={skin} />
          <rect x="14" y="11" width="20" height="6" fill={hair} />
          <path
            d="M18 21 q2.5 2.5 5 0"
            fill="none"
            stroke="#3A2A22"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M25 21 q2.5 2.5 5 0"
            fill="none"
            stroke="#3A2A22"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="17" cy="25" r="2.4" fill="#F4A6B0" opacity="0.8" />
          <circle cx="31" cy="25" r="2.4" fill="#F4A6B0" opacity="0.8" />
          <path
            d="M21.5 26.5 q2.5 2.5 5 0"
            fill="none"
            stroke="#C86B7A"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <rect x="12" y="31" width="24" height="20" rx="5" fill={shirt} />
          <rect x="7" y="35" width="6" height="13" rx="3" fill={shirt} />
          <rect x="35" y="35" width="6" height="13" rx="3" fill={shirt} />
          <rect
            x="27"
            y="38"
            width="13"
            height="13"
            rx="2"
            fill="#FFFFFF"
            stroke="#D8CFC0"
          />
          <rect x="29" y="40" width="9" height="4" fill={cup} />
          <path
            d="M40 41 h2 a2 2 0 0 1 0 6 h-2"
            fill="none"
            stroke="#D8CFC0"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <span className="text-center text-xs leading-tight">{displayName}</span>
    </div>
  );
}
