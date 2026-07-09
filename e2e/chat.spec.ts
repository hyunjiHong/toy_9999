import { test, expect } from "@playwright/test";
import { createTestRoom, HAS_SUPABASE, join } from "./helpers";

// 실시간 채팅 (FR-4 / SC4). 실제 Supabase Postgres Changes.
// 실행 전제: NEXT_PUBLIC_SUPABASE_* 설정 + 마이그레이션 적용.

test.describe("실시간 채팅", () => {
  test.skip(!HAS_SUPABASE, "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행");

  test("한 명이 보낸 메시지가 다른 사람 화면에 이름과 함께 2초 내 뜬다", async ({
    browser,
  }) => {
    const roomId = await createTestRoom();
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, roomId, "민지", "라떼");
    await join(b, roomId, "서연", "아이스");

    await a.getByLabel("채팅 입력").fill("점심 뭐 먹음?");
    await a.getByRole("button", { name: "보내기" }).click();

    // B의 채팅 오버레이에 2초 내 이름+내용 도착 (FR-4)
    const overlayB = b.getByLabel("채팅");
    await expect(overlayB.getByText(/점심 뭐 먹음\?/)).toBeVisible({ timeout: 2000 });
    await expect(overlayB.getByText("서연")).toBeVisible();

    await ctxA.close();
    await ctxB.close();
  });

  // 휘발성 — 보낸 메시지는 떠오른 뒤 약 5초 후 화면에서 사라진다 (FR-10)
  test("보낸 메시지는 잠깐 떠올랐다 사라진다", async ({ browser }) => {
    const roomId = await createTestRoom();
    const ctx = await browser.newContext();
    const a = await ctx.newPage();
    await join(a, roomId, "민지", "라떼");

    await a.getByLabel("채팅 입력").fill("잠깐 떠오르는 메시지");
    await a.getByRole("button", { name: "보내기" }).click();

    const overlay = a.getByLabel("채팅");
    await expect(overlay.getByText(/잠깐 떠오르는 메시지/)).toBeVisible({ timeout: 2000 });
    // 약 5초 뒤 사라짐
    await expect(overlay.getByText(/잠깐 떠오르는 메시지/)).toBeHidden({ timeout: 7000 });

    await ctx.close();
  });
});
