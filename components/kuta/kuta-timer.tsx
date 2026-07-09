"use client";

import { Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimerPhase } from "@/types/kuta";

// 진행 중인 커타가 없으면 "커타 시작", 있으면 남은 시간(MM:SS)을 보여준다.
export function KutaTimer({
  label,
  phase,
  onStart,
}: {
  label: string | null;
  phase: TimerPhase | null;
  onStart: () => void;
}) {
  if (label === null) {
    return (
      <Button size="sm" onClick={onStart}>
        <Play className="size-4" aria-hidden /> 커타 시작
      </Button>
    );
  }

  return (
    <span
      role="timer"
      aria-label="남은 시간"
      className={cn(
        "flex items-center gap-1 text-sm font-bold tabular-nums",
        phase === "ending-soon" && "text-destructive",
      )}
    >
      <Clock className="size-4" aria-hidden /> {label}
    </span>
  );
}
