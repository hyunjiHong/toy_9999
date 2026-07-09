import { test, expect } from "@playwright/test";
import { createTestRoom, HAS_SUPABASE, join } from "./helpers";

// 실시간 참여자 (FR-3, FR-5 / SC3). 두 브라우저 컨텍스트 = 두 명. 실제 Supabase Presence.
// 실행 전제: NEXT_PUBLIC_SUPABASE_* 설정 + 마이그레이션 적용.

test.describe("실시간 참여자", () => {
  test.skip(!HAS_SUPABASE, "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행");

  test("두 명이 들어오면 서로의 아바타가 2초 내 나타나고, 나가면 사라진다", async ({
    browser,
  }) => {
    const roomId = await createTestRoom();
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, roomId, "민지", "라떼");
    await join(b, roomId, "지훈", "아메리카노");

    // 서로 2초 내 등장 (FR-3)
    await expect(a.getByText("지훈")).toBeVisible({ timeout: 2000 });
    await expect(b.getByText("민지")).toBeVisible({ timeout: 2000 });
    // 각 아바타가 고른 음료 컵을 단다 (FR-2)
    await expect(a.getByLabel("지훈, 아메리카노")).toBeVisible();

    // B가 나가면 A 화면에서 사라진다 (FR-5)
    await b.getByRole("button", { name: "나가기" }).click();
    await expect(a.getByText("지훈")).toBeHidden({ timeout: 3000 });

    await ctxA.close();
    await ctxB.close();
  });
});
