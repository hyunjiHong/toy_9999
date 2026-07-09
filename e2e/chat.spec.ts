import { test, expect, type Page } from "@playwright/test";

// 실시간 채팅 (FR-4 / SC4). 실제 Supabase Postgres Changes로 검증 (mock 없음).
// 실행 전제: NEXT_PUBLIC_SUPABASE_* 설정 + rooms/messages 마이그레이션 적용.

const ROOM = "/room/00000000-0000-0000-0000-000000000001";
const HAS_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

test.describe("실시간 채팅", () => {
  test.skip(!HAS_SUPABASE, "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행");

  async function join(page: Page, name: string, drinkLabel: string) {
    await page.goto(ROOM);
    await page.getByLabel("이름").fill(name);
    await page.getByRole("radio", { name: drinkLabel }).click();
    await page.getByRole("button", { name: "커타 참여" }).click();
  }

  test("한 명이 보낸 메시지가 다른 사람 화면에 이름과 함께 2초 내 뜬다", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, "민지", "라떼");
    await join(b, "서연", "아이스");

    await a.getByLabel("채팅 입력").fill("점심 뭐 먹음?");
    await a.getByRole("button", { name: "보내기" }).click();

    // B 화면(채팅 오버레이)에 2초 내 이름+내용 도착 (FR-4)
    const overlayB = b.getByLabel("채팅");
    await expect(overlayB.getByText(/점심 뭐 먹음\?/)).toBeVisible({ timeout: 2000 });
    await expect(overlayB.getByText("서연")).toBeVisible();

    await ctxA.close();
    await ctxB.close();
  });
});
