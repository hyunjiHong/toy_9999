import { test, expect, type Page } from "@playwright/test";

// 커타 세션 & 타이머 (FR-6, FR-7 / SC5). 실제 Supabase로 검증.
// 실행 전제: NEXT_PUBLIC_SUPABASE_* 설정 + 마이그레이션 적용.

const ROOM = "/room/00000000-0000-0000-0000-000000000001";
const HAS_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

function toSeconds(mmss: string): number {
  const [m, s] = mmss.trim().split(":").map(Number);
  return m * 60 + s;
}

async function join(page: Page, name: string, drinkLabel: string) {
  await page.goto(ROOM);
  await page.getByLabel("이름").fill(name);
  await page.getByRole("radio", { name: drinkLabel }).click();
  await page.getByRole("button", { name: "커타 참여" }).click();
}

test.describe("커타 타이머", () => {
  test.skip(!HAS_SUPABASE, "NEXT_PUBLIC_SUPABASE_URL 미설정 — 호스티드 Supabase 준비 후 실행");

  // T5a — FR-6: 두 컨텍스트가 같은 남은 시간을 본다
  test("한 명이 커타를 시작하면 두 화면에 같은 남은 시간이 뜬다", async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const a = await ctxA.newPage();
    const b = await ctxB.newPage();

    await join(a, "민지", "라떼");
    await join(b, "지훈", "아메리카노");

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
});
