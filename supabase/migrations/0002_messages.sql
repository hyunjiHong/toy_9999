-- 채팅 메시지. 저장 + Realtime(Postgres Changes) 전달을 한 테이블로.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  sender_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_room_created_idx
  on public.messages (room_id, created_at);

alter table public.messages enable row level security;

-- 계정이 없으므로(링크=비밀번호) anon 읽기/쓰기를 허용한다.
-- room_id(UUID)를 아는 클라이언트만 해당 방을 조회/전송한다(클라이언트에서 room_id로 필터).
-- 주: 세션이 없어 서버 측 방-범위 제한은 불가 → 링크 비공개가 사실상의 경계. (plan 리스크 참조)
drop policy if exists "messages readable by anyone" on public.messages;
create policy "messages readable by anyone"
  on public.messages for select
  to anon, authenticated
  using (true);

drop policy if exists "messages insertable by anyone" on public.messages;
create policy "messages insertable by anyone"
  on public.messages for insert
  to anon, authenticated
  with check (char_length(content) between 1 and 500 and char_length(sender_name) between 1 and 40);

-- Postgres Changes 구독을 위해 realtime publication에 추가
alter publication supabase_realtime add table public.messages;
