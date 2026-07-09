import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

// 실시간 e2e는 실제 Supabase가 있어야 한다 (mock 없음 — CLAUDE.md 테스트 원칙).
export const HAS_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// 테스트별 격리 방을 만든다 → 병렬 실행 시 세션/presence 상태가 서로 오염되지 않는다.
export async function createTestRoom(name = "e2e room"): Promise<string> {
  const { data, error } = await db()
    .from("rooms")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

// 곧 끝나는 세션을 심는다 (짧은 커타를 UI만으로 만들 수 없으므로). remaining ≈ leadSeconds.
export async function seedEndingSession(
  roomId: string,
  leadSeconds = 6,
  durationSeconds = 600,
): Promise<void> {
  const startedAt = new Date(
    Date.now() - (durationSeconds - leadSeconds) * 1000,
  ).toISOString();
  const { error } = await db().from("kuta_sessions").insert({
    room_id: roomId,
    duration_seconds: durationSeconds,
    started_at: startedAt,
    question: "테스트 질문",
  });
  if (error) throw error;
}

// 과거 메시지를 심는다 (세션 단위 수명 테스트용)
export async function seedMessage(
  roomId: string,
  senderName: string,
  content: string,
  createdAtIso?: string,
): Promise<void> {
  const row: Record<string, unknown> = {
    room_id: roomId,
    sender_name: senderName,
    content,
  };
  if (createdAtIso) row.created_at = createdAtIso;
  const { error } = await db().from("messages").insert(row);
  if (error) throw error;
}

export async function join(
  page: Page,
  roomId: string,
  name: string,
  drinkLabel: string,
) {
  await page.goto(`/room/${roomId}`);
  await page.getByLabel("이름").fill(name);
  await page.getByRole("radio", { name: drinkLabel }).click();
  await page.getByRole("button", { name: "커타 참여" }).click();
}
