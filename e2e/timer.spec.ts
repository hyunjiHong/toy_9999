import { test, expect } from "@playwright/test";
import {
  createTestRoom,
  HAS_SUPABASE,
  join,
  seedEndingSession,
} from "./helpers";

// 커타 세션 & 타이머 (FR-6, FR-7 / SC5). 실제 Supabase.
// 실행 전제: NEXT_PUBLIC_SUPABASE_* 설정 + 마이그레이션 적용.

function toSeconds(mmss: string): number {
  const [m, s] = mmss.trim().split(":").map(Number);
  return m * 60 + s;
}

test.describe("커타 타이머", () => {
  test.skip(!HAS_SUPABASE, "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행");

  // T5a — FR-6: 두 컨텍스트가 같은 남은 시간을 본다
  test("한 명이 커타를 시작하면 두 화면에 같은 남은 시간이 뜬다", async ({
    browser,
  }) => {
    const roomId = await createTestRoom();
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, roomId, "민지", "라떼");
    await join(b, roomId, "지훈", "아메리카노");

    await a.getByRole("button", { name: /커타 시작/ }).click();

    const ta = a.getByRole("timer");
    const tb = b.getByRole("timer");
    await expect(ta).toBeVisible({ timeout: 2000 });
    await expect(tb).toBeVisible({ timeout: 2000 });

    const va = toSeconds((await ta.textContent()) ?? "");
    const vb = toSeconds((await tb.textContent()) ?? "");
    expect(Math.abs(va - vb)).toBeLessThanOrEqual(1); // 오차 ≤1초 (FR-6)

    await ctxA.close();
    await ctxB.close();
  });

  // T5b — FR-7 / SC5: 30초 예고 후 0초에 두 화면 모두 종료, 다시 참여하기 → 입장
  test("종료 예고 후 두 화면이 동시에 종료되고, 다시 참여하기로 입장 화면으로 돌아간다", async ({
    browser,
  }) => {
    const roomId = await createTestRoom();
    await seedEndingSession(roomId, 6); // remaining ≈ 6초 → 즉시 예고, 곧 종료

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, roomId, "민지", "라떼");
    await join(b, roomId, "지훈", "아메리카노");

    // 종료 30초 전 예고 (FR-7)
    await expect(a.getByRole("alert")).toHaveText(/곧 커타가 끝나요/, {
      timeout: 3000,
    });

    // 0초 → 두 화면 모두 종료 (FR-7 / SC5)
    await expect(a.getByText(/커타가 끝났어요/)).toBeVisible({ timeout: 12000 });
    await expect(b.getByText(/커타가 끝났어요/)).toBeVisible({ timeout: 12000 });

    // 다시 참여하기 → 입장 화면
    await a.getByRole("button", { name: "다시 참여하기" }).click();
    await expect(a.getByRole("button", { name: "커타 참여" })).toBeVisible();

    await ctxA.close();
    await ctxB.close();
  });
});
