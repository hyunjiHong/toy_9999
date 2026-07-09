import { cn } from "@/lib/utils";
import {
  avatarColors,
  DRINK_COLOR,
  hashName,
  type AvatarColors,
} from "@/lib/avatar-style";
import type { RosterEntry } from "@/types/kuta";

// 표정 4종 (이름 시드로 선택) — 커피에 녹아드는 다양한 relax 표정.
function Face({ cx, wy, variant }: { cx: number; wy: number; variant: number }) {
  const eye = "#3A2A22";
  if (variant === 1) {
    // 나른 — 눈 감고 입 벌리고 "아~" (+ zzz)
    return (
      <>
        <path d={`M${cx - 9} ${wy - 16} q2.5 2.5 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
        <path d={`M${cx + 4} ${wy - 16} q2.5 2.5 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx={cx} cy={wy - 9} rx="2" ry="2.4" fill="#B5556A" />
        <text x={cx + 13} y={wy - 24} fontSize="7" fill="#8A7A66" fontWeight="600">z</text>
      </>
    );
  }
  if (variant === 2) {
    // 말똥 — 동그란 눈 + 방긋 (귀여움 담당)
    return (
      <>
        <circle cx={cx - 6.5} cy={wy - 15} r="2.1" fill={eye} />
        <circle cx={cx + 6.5} cy={wy - 15} r="2.1" fill={eye} />
        <circle cx={cx - 5.8} cy={wy - 15.6} r="0.7" fill="#FFFFFF" />
        <circle cx={cx + 7.2} cy={wy - 15.6} r="0.7" fill="#FFFFFF" />
        <path d={`M${cx - 3} ${wy - 10} q3 3.5 6 0`} fill="none" stroke="#C86B7A" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
  }
  if (variant === 3) {
    // 실눈 — 일자 눈 + 작은 입 (-_- 무념무상)
    return (
      <>
        <rect x={cx - 9.5} y={wy - 16} width="6" height="1.8" rx="0.9" fill={eye} />
        <rect x={cx + 3.5} y={wy - 16} width="6" height="1.8" rx="0.9" fill={eye} />
        <rect x={cx - 2} y={wy - 10.5} width="4" height="1.6" rx="0.8" fill="#C86B7A" />
      </>
    );
  }
  // variant 0 — 방긋 감은 눈 ‿‿ + 미소 (기본)
  return (
    <>
      <path d={`M${cx - 9} ${wy - 16} q2.5 2.5 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx + 4} ${wy - 16} q2.5 2.5 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx - 2.5} ${wy - 11} q2.5 2.5 5 0`} fill="none" stroke="#C86B7A" strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

// 커피 속에 몸을 담근 한 명 (머리만 수면 위로) — 물방울 튀김 + 표정.
function Soaker({
  cx,
  waterY,
  colors,
  variant,
  isMe,
}: {
  cx: number;
  waterY: number;
  colors: AvatarColors;
  variant: number;
  isMe: boolean;
}) {
  const { skin, hair } = colors;
  return (
    <g>
      {/* 물방울 튀김 */}
      <circle cx={cx - 16} cy={waterY - 5} r="1.6" fill="#6F4E37" opacity="0.8" />
      <circle cx={cx + 17} cy={waterY - 7} r="2" fill="#6F4E37" opacity="0.8" />
      <circle cx={cx + 13} cy={waterY - 12} r="1.2" fill="#7C5A42" opacity="0.7" />
      <ellipse cx={cx} cy={waterY} rx="17" ry="4" fill="#5A3E2A" />
      <rect x={cx - 19} y={waterY - 6} width="6" height="4" rx="1" fill={skin} />
      <rect x={cx + 13} y={waterY - 6} width="6" height="4" rx="1" fill={skin} />
      <rect x={cx - 15} y={waterY - 32} width="30" height="9" fill={hair} />
      <rect x={cx - 15} y={waterY - 29} width="5" height="13" fill={hair} />
      <rect x={cx + 10} y={waterY - 29} width="5" height="13" fill={hair} />
      <rect x={cx - 14} y={waterY - 29} width="28" height="25" rx="2" fill={skin} />
      <rect x={cx - 14} y={waterY - 29} width="28" height="6" fill={hair} />
      <circle cx={cx - 8} cy={waterY - 11} r="2.4" fill="#F4A6B0" opacity="0.85" />
      <circle cx={cx + 8} cy={waterY - 11} r="2.4" fill="#F4A6B0" opacity="0.85" />
      <Face cx={cx} wy={waterY} variant={variant} />
      {isMe && (
        <>
          <rect x={cx - 9} y={waterY - 46} width="18" height="13" rx="6" fill="#3A2E28" />
          <text x={cx} y={waterY - 37} textAnchor="middle" fontSize="9" fontWeight="600" fill="#FFFFFF">
            나
          </text>
        </>
      )}
    </g>
  );
}

// 커타 존 메인 장면 — 큰 커피에 참여자들이 몸을 담그고 함께 쉰다.
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

  const placed = roster
    .map((p, i) => ({
      p,
      cx: left + ((i + 0.5) / n) * spread,
      waterY: 118 + (i % 2 === 0 ? -4 : 8),
      colors: avatarColors(p.name),
      variant: hashName(p.name) % 4,
    }))
    .sort((a, b) => a.waterY - b.waterY);

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
        <ellipse cx="170" cy="118" rx="122" ry="24" fill="#6F4E37" />
        <ellipse cx="170" cy="118" rx="122" ry="24" fill="none" stroke="#7C5A42" strokeWidth="3" />

        {/* 진한 김 — 여러 겹 모락모락 */}
        <g stroke="#CBBBA0" strokeLinecap="round" fill="none">
          <path d="M92 100 q -7 -13 0 -26 q 7 -13 0 -26" strokeWidth="4" opacity="0.55" />
          <path d="M150 96 q -7 -14 0 -28 q 7 -14 0 -28" strokeWidth="4.5" opacity="0.6" />
          <path d="M206 98 q -7 -13 0 -26 q 7 -13 0 -26" strokeWidth="4" opacity="0.5" />
          <path d="M252 100 q -7 -12 0 -24 q 7 -12 0 -24" strokeWidth="3.5" opacity="0.45" />
        </g>

        {placed.map(({ p, cx, waterY, colors, variant }) => (
          <Soaker
            key={p.key}
            cx={cx}
            waterY={waterY}
            colors={colors}
            variant={variant}
            isMe={p.key === meKey}
          />
        ))}
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
