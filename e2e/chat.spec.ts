import { test, expect } from "@playwright/test";
import { createTestRoom, HAS_SUPABASE, join, seedMessage } from "./helpers";

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

  // 세션 단위 수명 — 새 커타를 시작하면 이전 세션 대화가 사라진다
  test("새 커타를 시작하면 이전 세션 대화가 화면에서 사라진다", async ({
    browser,
  }) => {
    const roomId = await createTestRoom();
    await seedMessage(
      roomId,
      "옛사람",
      "지난 커타 얘기",
      new Date(Date.now() - 3_600_000).toISOString(), // 1시간 전
    );

    const ctx = await browser.newContext();
    const a = await ctx.newPage();
    await join(a, roomId, "민지", "라떼");

    const overlay = a.getByLabel("채팅");
    // 진행 중인 커타가 없을 땐 이전 대화가 보인다
    await expect(overlay.getByText("지난 커타 얘기")).toBeVisible({ timeout: 3000 });

    // 커타 시작 → 채팅이 이 세션 시작 이후로 한정 → 이전 대화 사라짐
    await a.getByRole("button", { name: /커타 시작/ }).click();
    await expect(overlay.getByText("지난 커타 얘기")).toBeHidden({ timeout: 3000 });

    await ctx.close();
  });
});
