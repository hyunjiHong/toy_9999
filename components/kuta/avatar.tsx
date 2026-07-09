import { cn } from "@/lib/utils";
import { drinkLabel } from "@/config/drinks";
import type { DrinkId } from "@/types/kuta";

// 이름을 시드로 머리/피부/옷 색을 골라 아바타에 변화를 준다 (같은 이름 = 같은 모습).
const SKINS = ["#F1C9A5", "#E8B48C", "#F5D9BE", "#D9A87F"];
const HAIRS = ["#3A2E28", "#5A3A22", "#2A2A2A", "#6B4A2A", "#A65E3B"];
const SHIRTS = ["#C0554A", "#4E7CB5", "#3F9E6E", "#7F77DD", "#D9902E", "#D85A30"];

// 음료 → 컵 안 색 (spec §2 음료 종류)
const DRINK_COLOR: Record<DrinkId, string> = {
  latte: "#E8D3B0",
  americano: "#5A3A22",
  cappuccino: "#C7A17A",
  iced: "#BFE3F0",
  tea: "#8FBF6A",
};

function hashName(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

// 참여자 픽셀 아바타 — 이름별 색 변화 + 든 음료 컵 + relax "-_-" 표정.
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
  const h = hashName(name);
  const skin = pick(SKINS, h);
  const hair = pick(HAIRS, h >> 3);
  const shirt = pick(SHIRTS, h >> 6);
  const cup = DRINK_COLOR[drink];

  return (
    <div
      className="flex w-16 flex-col items-center gap-1"
      aria-label={`${displayName}, ${drinkLabel(drink)}`}
    >
      <div className={cn("rounded-md p-0.5", isMe && "ring-2 ring-foreground")}>
        <svg
          width="44"
          height="52"
          viewBox="0 0 44 52"
          shapeRendering="crispEdges"
          role="img"
          aria-hidden
        >
          <rect x="11" y="6" width="22" height="8" rx="2" fill={hair} />
          <rect x="12" y="9" width="20" height="17" rx="3" fill={skin} />
          <rect x="15" y="17" width="5" height="2" rx="1" fill="#2A2A2A" />
          <rect x="24" y="17" width="5" height="2" rx="1" fill="#2A2A2A" />
          <rect x="19" y="22" width="6" height="2" rx="1" fill="#B5836A" />
          <rect x="9" y="26" width="26" height="21" rx="4" fill={shirt} />
          <rect
            x="28"
            y="31"
            width="12"
            height="12"
            rx="2"
            fill="#FFFFFF"
            stroke="#D8CFC0"
          />
          <rect x="30" y="33" width="8" height="4" fill={cup} />
          <path
            d="M40 34 h2 a2 2 0 0 1 0 5 h-2"
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
