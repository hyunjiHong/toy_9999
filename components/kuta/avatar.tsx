import { cn } from "@/lib/utils";
import { drinkLabel } from "@/config/drinks";
import { alienSrc, DRINK_COLOR } from "@/lib/avatar-style";
import type { DrinkId } from "@/types/kuta";

// 참여자 아바타 (Kenney CC0 외계인) — 이름별 캐릭터 + 음료색 점. 종료 화면 등 단독 표시용.
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

  return (
    <div
      className="flex w-16 flex-col items-center gap-1"
      aria-label={`${displayName}, ${drinkLabel(drink)}`}
    >
      <div className={cn("rounded-md p-1", isMe && "ring-2 ring-foreground")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={alienSrc(name)}
          alt=""
          width={30}
          height={49}
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <span className="flex items-center gap-1 text-xs leading-tight">
        <span
          className="size-2 rounded-full border border-black/10"
          style={{ backgroundColor: DRINK_COLOR[drink] }}
          aria-hidden
        />
        <span>{displayName}</span>
      </span>
    </div>
  );
}
