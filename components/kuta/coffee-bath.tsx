import Image from "next/image";
import { cn } from "@/lib/utils";
import { avatarColors, DRINK_COLOR, hashName, type AvatarColors } from "@/lib/avatar-style";
import type { RosterEntry } from "@/types/kuta";

// 표정 6종 (이름 시드로 선택)
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
    // 말똥 — 동그란 눈 + 방긋
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
    // 실눈 — 일자 눈 (-_-)
    return (
      <>
        <rect x={cx - 9.5} y={wy - 16} width="6" height="1.8" rx="0.9" fill={eye} />
        <rect x={cx + 3.5} y={wy - 16} width="6" height="1.8" rx="0.9" fill={eye} />
        <rect x={cx - 2} y={wy - 10.5} width="4" height="1.6" rx="0.8" fill="#C86B7A" />
      </>
    );
  }
  if (variant === 4) {
    // 윙크 — 한쪽 눈 찡긋 + 작은 미소
    return (
      <>
        <path d={`M${cx - 9} ${wy - 16} q2.5 2 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx + 6.5} cy={wy - 15} r="2.1" fill={eye} />
        <circle cx={cx + 7.2} cy={wy - 15.6} r="0.7" fill="#FFFFFF" />
        <path d={`M${cx - 2.5} ${wy - 10.5} q3 2.5 6 0`} fill="none" stroke="#C86B7A" strokeWidth="1.4" strokeLinecap="round" />
      </>
    );
  }
  if (variant === 5) {
    // 포근 — 작은 점눈 + 말랑한 입
    return (
      <>
        <circle cx={cx - 6.5} cy={wy - 15} r="1.6" fill={eye} />
        <circle cx={cx + 6.5} cy={wy - 15} r="1.6" fill={eye} />
        <path d={`M${cx - 4} ${wy - 10} q4 4 8 0`} fill="none" stroke="#C86B7A" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
  }
  // 방긋 감은 눈 ‿‿ + 미소
  return (
    <>
      <path d={`M${cx - 9} ${wy - 16} q2.5 2.5 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx + 4} ${wy - 16} q2.5 2.5 5 0`} fill="none" stroke={eye} strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx - 2.5} ${wy - 11} q2.5 2.5 5 0`} fill="none" stroke="#C86B7A" strokeWidth="1.4" strokeLinecap="round" />
    </>
  );
}

// 픽셀 커피잔 위에 작은 얼굴 아바타를 올린다.
function CoffeeBuddy({
  left,
  top,
  colors,
  variant,
  isMe,
}: {
  left: number;
  top: number;
  colors: AvatarColors;
  variant: number;
  isMe: boolean;
}) {
  const { skin, hair } = colors;
  return (
    <div
      className="absolute z-20 w-[13%] min-w-10 max-w-20 -translate-x-1/2"
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden
    >
      {isMe && (
        <span className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#33241B] px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white">
          나
        </span>
      )}
      <svg viewBox="0 0 52 46" className="h-auto w-full drop-shadow-sm">
        <rect x="11" y="6" width="30" height="9" fill={hair} />
        <rect x="9" y="14" width="5" height="15" fill={hair} />
        <rect x="38" y="14" width="5" height="15" fill={hair} />
        <rect x="12" y="12" width="28" height="28" rx="3" fill={skin} />
        <rect x="12" y="12" width="28" height="7" fill={hair} />
        <circle cx="18" cy="31" r="2.5" fill="#F4A6B0" opacity="0.85" />
        <circle cx="34" cy="31" r="2.5" fill="#F4A6B0" opacity="0.85" />
        <Face cx={26} wy={42} variant={variant} />
      </svg>
    </div>
  );
}

// 커타 존 — 픽셀 커피잔 안에서 참여자들이 같이 쉬는 분위기.
export function CoffeeBath({ roster, meKey }: { roster: RosterEntry[]; meKey: string }) {
  const n = Math.max(roster.length, 1);
  const spread = 38;
  const topPattern = [28, 30, 29, 31];

  const placed = roster
    .map((p, i) => ({
      p,
      left: 50 + (((i + 0.5) / n) - 0.5) * spread,
      top: topPattern[i % topPattern.length],
      colors: avatarColors(p.name),
      variant: hashName(p.name) % 6,
    }))
    .sort((a, b) => a.top - b.top);

  const me = placed.find((x) => x.p.key === meKey);

  return (
    <div>
      <div
        role="img"
        aria-label={`${roster.length}명이 커피에 몸을 담그고 쉬는 중`}
        className="relative mx-auto aspect-square w-full max-w-2xl overflow-visible"
      >
        <Image
          src="/assets/kuta/coffee-cup-pixel.png"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 42rem"
          className="z-0 object-contain select-none [image-rendering:pixelated]"
          aria-hidden
          priority
        />

        {placed.map(({ p, left, top, colors, variant }) => (
          <CoffeeBuddy
            key={p.key}
            left={left}
            top={top}
            colors={colors}
            variant={variant}
            isMe={p.key === meKey}
          />
        ))}

        {me && (
          <span className="sr-only">
            {me.p.name}님이 내 아바타입니다.
          </span>
        )}
      </div>

      <ul aria-label="함께한 사람" className="mt-3 flex flex-wrap justify-center gap-1.5">
        {roster.map((p) => {
          const mine = p.key === meKey;
          return (
            <li key={p.key}>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", mine ? "border-foreground font-medium" : "border-border bg-muted/50")}>
                <span className="size-2.5 rounded-full border border-black/10" style={{ backgroundColor: DRINK_COLOR[p.drink] }} aria-hidden />
                {mine ? `${p.name} (나)` : p.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
