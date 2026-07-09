import { cn } from "@/lib/utils";
import { DRINK_COLOR, alienSrc } from "@/lib/avatar-style";
import type { RosterEntry } from "@/types/kuta";

// 커피에 몸을 담근 캐릭터 크기 (Kenney 외계인 40x66 비율 유지)
const AW = 34;
const AH = 56;

// 커타 존 메인 장면 — 하나의 큰 커피에 참여자들이 몸을 담그고 함께 쉰다.
export function CoffeeBath({
  roster,
  meKey,
}: {
  roster: RosterEntry[];
  meKey: string;
}) {
  const n = Math.max(roster.length, 1);
  const spread = 220;
  const left = 170 - spread / 2;

  // 앞줄/뒷줄 지그재그로 배치 → 뒷줄부터 그려 앞줄이 위로 겹친다.
  const placed = roster
    .map((p, i) => ({
      p,
      cx: left + ((i + 0.5) / n) * spread,
      topY: i % 2 === 0 ? 66 : 72,
      src: alienSrc(p.name),
    }))
    .sort((a, b) => a.topY - b.topY);

  const me = placed.find((x) => x.p.key === meKey);

  return (
    <div>
      <svg
        viewBox="0 0 340 210"
        role="img"
        aria-label={`${roster.length}명이 커피에 몸을 담그고 쉬는 중`}
        className="mx-auto w-full max-w-md"
      >
        <ellipse cx="170" cy="186" rx="140" ry="20" fill="#E6D6B8" />
        <rect x="46" y="58" width="248" height="124" rx="24" fill="#FFFFFF" stroke="#DDD3C2" strokeWidth="3" />
        <path d="M294 84 C 330 92 330 152 294 160" fill="none" stroke="#DDD3C2" strokeWidth="12" />

        {/* 진한 김 (캐릭터 뒤에서 모락모락) */}
        <g stroke="#CBBBA0" strokeLinecap="round" fill="none">
          <path d="M118 98 q -7 -13 0 -26 q 7 -13 0 -26" strokeWidth="4" opacity="0.5" />
          <path d="M170 94 q -7 -14 0 -28 q 7 -14 0 -28" strokeWidth="4.5" opacity="0.55" />
          <path d="M222 98 q -7 -13 0 -26 q 7 -13 0 -26" strokeWidth="4" opacity="0.45" />
        </g>

        {/* 캐릭터 — 커피에 몸 담금 (하반신은 아래 커피 레이어가 가려 "잠긴" 것처럼) */}
        {placed.map(({ p, cx, topY, src }) => (
          <image
            key={p.key}
            href={src}
            x={cx - AW / 2}
            y={topY}
            width={AW}
            height={AH}
            preserveAspectRatio="xMidYMid meet"
            style={{ imageRendering: "pixelated" }}
          />
        ))}

        {/* 커피 수면 — 캐릭터 하반신을 덮는다 */}
        <ellipse cx="170" cy="118" rx="122" ry="24" fill="#6F4E37" />
        <ellipse cx="170" cy="118" rx="122" ry="24" fill="none" stroke="#7C5A42" strokeWidth="3" />

        {/* 물방울 튀김 */}
        {placed.map(({ p, cx }) => (
          <g key={`splash-${p.key}`} opacity="0.85">
            <circle cx={cx - 16} cy="112" r="1.6" fill="#7C5A42" />
            <circle cx={cx + 17} cy="108" r="2" fill="#7C5A42" />
            <circle cx={cx + 12} cy="115" r="1.2" fill="#8A6A4E" />
          </g>
        ))}

        {/* 나 표시 */}
        {me && (
          <g>
            <rect x={me.cx - 9} y={me.topY - 16} width="18" height="13" rx="6" fill="#3A2E28" />
            <text x={me.cx} y={me.topY - 7} textAnchor="middle" fontSize="9" fontWeight="600" fill="#FFFFFF">
              나
            </text>
          </g>
        )}
      </svg>

      <ul aria-label="함께한 사람" className="mt-3 flex flex-wrap justify-center gap-1.5">
        {roster.map((p) => {
          const mine = p.key === meKey;
          return (
            <li key={p.key}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                  mine ? "border-foreground font-medium" : "border-border bg-muted/50",
                )}
              >
                <span
                  className="size-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: DRINK_COLOR[p.drink] }}
                  aria-hidden
                />
                {mine ? `${p.name} (나)` : p.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
