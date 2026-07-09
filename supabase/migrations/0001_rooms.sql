-- 방(room) = 초대 링크. 상시 존재.
create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

-- 링크(=방 id)를 아는 익명 사용자는 방을 조회할 수 있다. 방 생성/수정은 클라이언트에서 막는다(seed로만 생성).
drop policy if exists "rooms readable by anyone" on public.rooms;
create policy "rooms readable by anyone"
  on public.rooms for select
  to anon, authenticated
  using (true);

-- 누구나 새 방(링크)을 만들 수 있다 — "링크=방, 아는 사람끼리" 컨셉의 멀티룸 확장 대비
-- (plan 미결정: 멀티룸 UI는 후속). e2e가 테스트별 격리 방을 만드는 데도 쓰인다.
drop policy if exists "rooms insertable by anyone" on public.rooms;
create policy "rooms insertable by anyone"
  on public.rooms for insert
  to anon, authenticated
  with check (true);
