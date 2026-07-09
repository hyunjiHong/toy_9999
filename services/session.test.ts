import { describe, expect, it } from "vitest";
import { formatRemaining, remainingSeconds, timerPhase } from "./session";

const base = {
  started_at: "2026-07-09T03:00:00.000Z",
  duration_seconds: 600,
  ended_at: null as string | null,
};
const startMs = new Date(base.started_at).getTime();

describe("remainingSeconds", () => {
  it("started_at + duration에서 현재 시각을 뺀 남은 초를 준다", () => {
    // 시작 100초 후 → 500초 남음
    expect(remainingSeconds(base, startMs + 100_000)).toBe(500);
  });

  it("두 클라이언트가 같은 now를 쓰면 같은 값(FR-6)", () => {
    const now = startMs + 123_000;
    expect(remainingSeconds(base, now)).toBe(remainingSeconds({ ...base }, now));
  });

  it("시간이 지나면 0으로 고정", () => {
    expect(remainingSeconds(base, startMs + 700_000)).toBe(0);
  });

  it("ended_at이 있으면 0", () => {
    expect(
      remainingSeconds({ ...base, ended_at: base.started_at }, startMs + 1000),
    ).toBe(0);
  });
});

describe("timerPhase", () => {
  it("30초 초과면 active", () => expect(timerPhase(31)).toBe("active"));
  it("30초 이하면 ending-soon (FR-7)", () => {
    expect(timerPhase(30)).toBe("ending-soon");
    expect(timerPhase(1)).toBe("ending-soon");
  });
  it("0이면 ended", () => expect(timerPhase(0)).toBe("ended"));
});

describe("formatRemaining", () => {
  it("MM:SS 포맷", () => {
    expect(formatRemaining(600)).toBe("10:00");
    expect(formatRemaining(59)).toBe("00:59");
    expect(formatRemaining(0)).toBe("00:00");
  });
});
