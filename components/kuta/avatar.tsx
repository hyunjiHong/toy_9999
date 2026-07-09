import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { drinkLabel } from "@/config/drinks";
import type { DrinkId } from "@/types/kuta";
import { DrinkIcon } from "./drink-icon";

// 참여자 픽셀 아바타 placeholder + 든 음료 컵. (Kenney CC0 스프라이트 교체는 후속 — plan 미결정)
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
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded border bg-muted",
          isMe && "border-2 border-foreground",
        )}
      >
        <User className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <span className="text-center text-xs leading-tight">{displayName}</span>
      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
        <DrinkIcon drink={drink} className="size-2.5" />
        {drinkLabel(drink)}
      </span>
    </div>
  );
}
