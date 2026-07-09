import { test, expect } from "@playwright/test";
import { createTestRoom, HAS_SUPABASE, join } from "./helpers";

// 오늘의 커타 질문 (FR-8 / SC6). 세션에 저장된 질문을 방 전원이 동일하게 본다.

test.describe("오늘의 질문", () => {
  test.skip(!HAS_SUPABASE, "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행");

  test("방의 두 사람이 동일한 오늘의 질문을 본다", async ({ browser }) => {
    const roomId = await createTestRoom();
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, roomId, "민지", "라떼");
    await join(b, roomId, "지훈", "아메리카노");

    await a.getByRole("button", { name: /커타 시작/ }).click();

    const bannerA = a.getByText(/오늘의 커타 질문/);
    const bannerB = b.getByText(/오늘의 커타 질문/);
    await expect(bannerA).toBeVisible({ timeout: 2000 });
    await expect(bannerB).toBeVisible({ timeout: 2000 });

    // 두 화면의 질문 텍스트가 같다
    expect(await bannerA.textContent()).toBe(await bannerB.textContent());

    await ctxA.close();
    await ctxB.close();
  });
});
