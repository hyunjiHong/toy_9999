import { test, expect, type Page } from "@playwright/test";

// 실시간 참여자 (FR-3, FR-5 / SC3). 두 브라우저 컨텍스트 = 두 명.
// 실제 Supabase Presence로 검증한다 (mock 없음 — CLAUDE.md 테스트 원칙).
// 실행 전제: NEXT_PUBLIC_SUPABASE_* 설정 + rooms seed 적용.

const ROOM = "/room/00000000-0000-0000-0000-000000000001";
const HAS_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

test.describe("실시간 참여자", () => {
  test.skip(
    !HAS_SUPABASE,
    "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행",
  );

  async function join(page: Page, name: string, drinkLabel: string) {
    await page.goto(ROOM);
    await page.getByLabel("이름").fill(name);
    await page.getByRole("radio", { name: drinkLabel }).click();
    await page.getByRole("button", { name: "커타 참여" }).click();
  }

  test("두 명이 들어오면 서로의 아바타가 2초 내 나타나고, 나가면 사라진다", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, "민지", "라떼");
    await join(b, "지훈", "아메리카노");

    // A 화면에 B가 2초 내 등장 (FR-3)
    await expect(a.getByText("지훈")).toBeVisible({ timeout: 2000 });
    // B 화면에 A가 등장
    await expect(b.getByText("민지")).toBeVisible({ timeout: 2000 });
    // 각 아바타가 고른 음료 컵을 단다 (FR-2)
    await expect(a.getByLabel("지훈, 아메리카노")).toBeVisible();

    // B가 나가면 A 화면에서 지훈 아바타가 사라진다 (FR-5)
    await b.getByRole("button", { name: "나가기" }).click();
    await expect(a.getByText("지훈")).toBeHidden({ timeout: 3000 });

    await ctxA.close();
    await ctxB.close();
  });
});
