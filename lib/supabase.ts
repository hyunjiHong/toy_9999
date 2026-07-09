import { createClient } from "@supabase/supabase-js";

// 브라우저가 Supabase에 직접 연결한다 (Realtime/Presence + DB). 계정 없음 → anon key 사용.
// NEXT_PUBLIC_* 는 빌드 타임에 인라인된다. 값이 없어도 빌드는 통과하도록 fallback을 둔다
// (실제 값은 .env.local / Vercel 환경변수에서 주입).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 모듈 싱글턴 — 탭당 하나의 클라이언트만 만들어 중복 Realtime 연결을 막는다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
