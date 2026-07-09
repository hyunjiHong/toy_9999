# 온라인 커타 — plan.md

> spec을 실행 가능한 vertical-slice Task로 쪼갬 (draft-plan 단계)
> 근거 문서: [spec.md](./spec.md) · [idea.md](./idea.md) · [wireframe.html](./wireframe.html)
> 상태: 초안 (plan-reviewer 검토 대기) · 최종 수정: 2026-07-09

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 방 모델 | 동적 라우트 `/room/[roomId]`, 방 1건 seed | spec §8은 방 하나로 충분하나 "링크=방" 컨셉 유지 + 멀티룸 확장 대비. roomId를 코드 전반에 파라미터로 흘림 |
| 실시간 참여자 | Supabase Realtime **Presence** | 접속/이탈은 ephemeral → DB 불필요. spec §6이 participant를 (presence)로 명시 |
| 채팅 저장·전달 | `messages` 테이블 + **Postgres Changes** 구독 | 저장 + 실시간 + 히스토리 로드를 한 메커니즘으로. spec §6이 message를 저장 엔티티로 명시 |
| 채팅 UI | 커피 장면 위로 **떠오르는 오버레이**(투명 배경·글자만) + 하단 입력 바 | 사용자 피드백: 별도 패널 아님. 게임 채팅처럼 친 글자가 장면 위에 뜨고 오래된 건 옅어짐 |
| 타이머 동기화 | 세션 `started_at`(서버 시각) 기반, 각 클라이언트가 남은 시간 **계산** | FR-6 오차 최소 — 로컬 타이머를 따로 돌리지 않고 시작 시각 하나를 공유 |
| 세션 종료 | 클라이언트가 0 도달 감지 → 종료 화면 (서버 cron 없음) | MVP 규모(방 1개, 2~8명)에 충분 |
| 인증 | 없음. anon key 공개 + RLS로 접근 범위 제한 | spec: 계정 없음, 링크가 곧 비밀번호 |
| 실시간 수용 기준 검증 | **호스티드 Supabase + Playwright 2-context** (당초 로컬 Docker였으나 실행 환경에 Docker 부재 → 전환. learnings.md 참조) | CLAUDE.md 테스트 원칙: 기준을 가리는 mock 회피, 가장 낮은 증명 경계(실제 두 클라이언트) 선택. 호스티드 프로젝트는 T7 배포 백엔드로 재사용 |
| Next.js 16 | 동적 라우트 `params`는 async(Promise) | `next-best-practices` 스킬로 확인. (구 훈련데이터의 sync params와 다름. `node_modules/next/dist/docs`·`AGENTS.md`는 이 repo에 없음 → 참조 안 함) |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| 로컬 Supabase (테스트/개발) | Local service (Docker) | `supabase/config.toml` | T1 |
| 호스티드 Supabase (prod) | Managed Postgres + Realtime | Supabase 대시보드 | T7 |
| DB 스키마 마이그레이션 | SQL migration | `supabase/migrations/*.sql` | T1(rooms), T4(messages), T5(kuta_sessions) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Env var | `.env.local`(로컬) / Vercel 환경변수(prod) | T1, T7 |
| Vercel 프로젝트 | Deploy target | Vercel 대시보드 + `git push` | T7 |

## 데이터 모델

### Room
- id (uuid, pk)
- name (text, optional)
- created_at

### KutaSession
- id (uuid, pk)
- room_id → Room (required)
- started_at (timestamptz, required) — 남은 시간 계산 기준
- duration_seconds (int, required, 기본 600)
- question (text, required) — 오늘의 질문(세션당 하나 고정)
- ended_at (timestamptz, nullable)

### Participant (presence — DB 아님, Realtime Presence payload)
- name (required)
- drink (enum: americano | latte | cappuccino | iced | tea)
- joined_at

### Message
- id (uuid, pk)
- room_id → Room (required)
- sender_name (text, required)
- content (text, required)
- created_at (timestamptz, required)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | T2, T4, T5 | 입장 폼(input/label/button/card), **음료 단일선택기 ToggleGroup(또는 RadioGroup — 프로젝트에 없으면 레지스트리 설치)**, 채팅 입력 바, 30초 예고·종료 dialog/alert-dialog. `components/ui/*` 직접 수정 금지 규칙 준수 |
| next-best-practices | T2, T3 | App Router 동적 라우트 규약, Next 16 async `params`, RSC/Client 경계 (실시간은 Client) |
| vercel-react-best-practices | T3, T4, T5 | Realtime 구독 effect의 정리(cleanup)·중복 구독 방지·리렌더 최소화 |
| vercel-composition-patterns | T3, T4 | 방 컨텍스트(roomId·me) provider, presence/chat 상태 합성 |
| web-design-guidelines | T2, T4 | 폼 라벨·비활성 안내 접근성, 채팅 오버레이 `aria-live`(스크린리더가 새 메시지 인지) |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `package.json` (@supabase/supabase-js 추가) | Modify | T1 |
| `supabase/config.toml`, `supabase/seed.sql` | New | T1 |
| `supabase/migrations/0001_rooms.sql` | New | T1 |
| `supabase/migrations/0002_messages.sql` | New | T4 |
| `supabase/migrations/0003_kuta_sessions.sql` | New | T5 |
| `.env.local` / `.env.example` | New | T1 |
| `types/kuta.ts` (Drink, Participant, Message, KutaSession) | New | T2 |
| `config/drinks.ts` (음료 상수 + 컵 매핑), `config/questions.ts` | New | T2, T6 |
| `lib/supabase.ts` (브라우저 클라이언트) | New | T1 |
| `services/presence.ts`, `services/messages.ts`, `services/session.ts` | New | T3, T4, T5 |
| `hooks/use-presence.ts`, `hooks/use-messages.ts`, `hooks/use-kuta-timer.ts` | New | T3, T4, T5 |
| `components/kuta/entry-form.tsx` (+ `.test.tsx`) | New | T2 |
| `components/kuta/kuta-zone.tsx` (통합 컨테이너 — 아바타·오버레이·타이머·질문·입력바 조립) | New(T3) → **Modify(T4, T5a, T5b, T6)** | T3~T6 |
| `components/kuta/avatar.tsx` (인원 카운터 포함), `chat-overlay.tsx`, `chat-input.tsx` | New | T3, T4 |
| `components/kuta/kuta-timer.tsx`, `question-banner.tsx`, `end-screen.tsx` | New | T5a, T5b, T6 |
| `app/room/[roomId]/page.tsx` | New | T2 |
| `app/page.tsx` (starter 예제 → seed 방으로 리다이렉트/링크) | Modify | T2 |
| `e2e/*.spec.ts` (presence, chat, timer) | New | T3, T4, T5 |

---

## Tasks

### Task 1: Supabase 연결 + 로컬 검증 하네스 (기반)

- **담당 시나리오**: 없음 (인프라 — 이후 모든 실시간 Task의 최고위험 enabler를 fail-fast로 선검증)
- **크기**: M
- **의존성**: None
- **참조**:
  - (supabase 로컬 개발 — `supabase init`, `supabase start`, migrations, anon key)
  - (next-best-practices 스킬 — 환경변수 `NEXT_PUBLIC_` 노출 규약)
- **구현 대상**:
  - `package.json` — `@supabase/supabase-js` 추가
  - `lib/supabase.ts` — env 기반 브라우저 클라이언트
  - `supabase/config.toml`, `supabase/migrations/0001_rooms.sql`(rooms + RLS: anon select 허용), `supabase/seed.sql`(room 1건)
  - `.env.local`, `.env.example`
  - `e2e/health.spec.ts` — 로컬 Supabase 상대 연결 확인
- **수용 기준**:
  - [ ] `supabase start` + `supabase db reset` 후 seed된 room 1건이 존재한다 (SQL 조회)
  - [ ] 브라우저 클라이언트가 anon key로 그 room 1건을 읽어 화면(또는 임시 라우트)에 표시한다
- **검증**:
  - `supabase db reset` 후 `psql`/`supabase` CLI로 room count = 1 확인
  - Playwright: 앱에서 seed room id로 접근 시 200 + room 데이터 렌더 — `bun run test:e2e -- health`

---

### Task 2: 링크로 입장 — 이름 + 음료 선택 후 커타 존 진입

- **담당 시나리오**: Scenario A (앞부분 — 입장 폼 제출까지)
- **크기**: M
- **의존성**: T1 (Supabase 클라이언트·seed room·라우팅 기반)
- **참조**:
  - (shadcn 스킬 — input, label, button, card, **음료 단일선택 ToggleGroup/RadioGroup: 없으면 레지스트리에서 설치** / `components/ui` 직접수정 금지)
  - (next-best-practices 스킬 — 동적 라우트 `app/room/[roomId]`, async `params`)
  - `artifacts/online-kuta/wireframe.html` (입장 화면)
- **구현 대상**:
  - `types/kuta.ts`, `config/drinks.ts`
  - 음료 선택기: shadcn ToggleGroup(단일 선택) — 미설치 시 레지스트리 설치 후 사용
  - `components/kuta/entry-form.tsx` + `components/kuta/entry-form.test.tsx`
  - `app/room/[roomId]/page.tsx`, `app/page.tsx`(seed 방 링크로 안내)
- **수용 기준**:
  - [ ] 이름이 빈 값이면 "커타 참여" 버튼이 비활성이다 (FR-1 / SC1)
  - [ ] 음료로 "라떼"를 고르면 내 아바타 미리보기 컵이 라떼로 바뀐다 (FR-2 / SC2)
  - [ ] 이름 "민지" 입력 + 음료 선택 후 "커타 참여"를 누르면 커타 존이 나타난다 (SC1)
- **검증**: (실시간 아님 → jsdom 경계로 충분)
  - Vitest + testing-library: 비활성 상태 / 컵 미리보기 교체 / 제출 후 커타 존 표시 — `bun run test -- entry-form`

---

### Task 3: 실시간 참여자 — 입장·이탈이 모두에게 보임

- **담당 시나리오**: Scenario A (뒷부분) + Scenario D (나가기·이탈 부분 — 재입장 왕복은 T7에서 검증)
- **크기**: M
- **의존성**: T2 (커타 존 진입·me 정보), T1 (Realtime)
- **참조**:
  - (vercel-react-best-practices 스킬 — effect cleanup, 구독 중복 방지)
  - (vercel-composition-patterns 스킬 — roomId/me context provider)
  - `artifacts/online-kuta/wireframe.html` (커타 존 아바타 배치)
- **구현 대상**:
  - `services/presence.ts`, `hooks/use-presence.ts`
  - `components/kuta/kuta-zone.tsx`(New — 통합 컨테이너), `components/kuta/avatar.tsx`(음료 컵 반영), 상단 인원 카운터(N/8)·나가기 버튼
  - `e2e/presence.spec.ts`
- **수용 기준**:
  - [ ] 두 컨텍스트(=두 명)가 같은 방에 들어오면 서로의 아바타가 2초 이내 나타난다 (FR-3 / SC3)
  - [ ] 각 아바타가 그 사람이 고른 음료 컵을 단다 (FR-2 / SC3)
  - [ ] 한 컨텍스트가 "나가기" 또는 탭 종료 시 다른 컨텍스트에서 그 아바타가 사라진다 (FR-5 / SC3)
  - [ ] 방에 8명이 있으면 9번째 입장이 막히고 안내가 뜬다 (FR-9)
- **검증**: Playwright 2-context (로컬 Supabase) — 두 브라우저 컨텍스트 입장/이탈 단언, 8명+1 제한. `bun run test:e2e -- presence`. 증거 스크린샷 `artifacts/online-kuta/evidence/task-3.png`

---

### Checkpoint: Tasks 1-3 이후
- [ ] 모든 테스트 통과: `bun run test` + `bun run test:e2e`
- [ ] 빌드 성공: `bun run build`
- [ ] end-to-end: 두 탭으로 seed 방 입장 → 이름·음료 → 서로의 아바타가 실시간으로 모이고, 한 쪽이 나가면 사라진다

---

### Task 4: 실시간 채팅 — 친 글자가 장면 위로 떠오름

- **담당 시나리오**: Scenario B (채팅 부분)
- **크기**: M
- **의존성**: T3 (커타 존·me·roomId)
- **참조**:
  - (shadcn 스킬 — input/button 입력 바)
  - (web-design-guidelines 스킬 — 채팅 오버레이 `aria-live="polite"`)
  - (vercel-react-best-practices 스킬 — postgres_changes 구독 정리)
  - `artifacts/online-kuta/wireframe.html` (커타 존 — 떠오르는 채팅 오버레이 + 하단 입력 바)
- **구현 대상**:
  - `supabase/migrations/0002_messages.sql` (messages + RLS: anon select/insert)
  - `services/messages.ts`, `hooks/use-messages.ts`
  - `components/kuta/chat-input.tsx`, `components/kuta/chat-overlay.tsx` (투명 배경·글자만·오래된 건 옅어짐)
  - `components/kuta/kuta-zone.tsx` (Modify — 오버레이+입력바 조립)
  - `e2e/chat.spec.ts`
- **수용 기준**:
  - [ ] 한 컨텍스트에서 "점심 뭐 먹음?"을 보내면 다른 컨텍스트 장면 위에 2초 이내로 그 글자가 뜬다 (FR-4 / SC4)
  - [ ] 뜬 메시지에 보낸 사람 이름("서연")이 함께 표시된다 (FR-4)
- **검증**: Playwright 2-context (로컬 Supabase) — A가 전송 → B에 2초 내 이름+내용 등장 단언. `bun run test:e2e -- chat`. 증거 `artifacts/online-kuta/evidence/task-4.png`

---

### Checkpoint: Task 4 이후
- [ ] `bun run test` + `bun run test:e2e` 통과, `bun run build` 성공
- [ ] end-to-end: 두 탭이 모여 실시간으로 수다(2초 내 전달)가 오간다

---

### Task 5a: 커타 세션 시작/합류 + 타이머 표시

- **담당 시나리오**: Scenario C (앞부분 — 세션 진행·남은 시간 동기화)
- **크기**: M
- **의존성**: T3 (커타 존), T1 (DB)
- **참조**:
  - (shadcn 스킬 — button "커타 시작", badge/타이머 표시)
  - `artifacts/online-kuta/wireframe.html` (상단 타이머)
- **구현 대상**:
  - `supabase/migrations/0003_kuta_sessions.sql` (kuta_sessions + RLS)
  - `services/session.ts`(시작/합류 — 진행 중 있으면 합류, 없으면 생성), `hooks/use-kuta-timer.ts`(`started_at` 기반 남은 시간 계산 + 세션 객체 반환)
  - `components/kuta/kuta-timer.tsx`, "커타 시작" 버튼, `components/kuta/kuta-zone.tsx` (Modify — 타이머 조립)
  - `e2e/timer.spec.ts` (남은시간 동기화 파트) — seed에 짧은 duration 세션(예: 40초)
- **수용 기준**:
  - [ ] 진행 중 세션이 없으면 "커타 시작" 후, 있으면 자동 합류 후 커타 존에 남은 시간이 표시된다 (§8 / SC5)
  - [ ] 두 컨텍스트에서 같은 남은 시간이 보인다(오차 ≤1초 — FR-6 "오차 최소"를 구체화한 값, 사용자 확인 필요) (FR-6 / SC5)
- **검증**: Playwright 2-context (로컬 Supabase, 짧은 duration seed) — 두 컨텍스트 남은시간 일치 단언. `bun run test:e2e -- timer`

---

### Task 5b: 30초 종료 예고 + 0초 종료 화면

- **담당 시나리오**: Scenario C (뒷부분 — 마무리)
- **크기**: S
- **의존성**: T5a (타이머·세션)
- **참조**:
  - (shadcn 스킬 — dialog/alert-dialog 예고, button "다시 참여하기")
  - `artifacts/online-kuta/wireframe.html` (종료 화면 — 함께한 사람 목록, "다시 참여하기")
- **구현 대상**:
  - `components/kuta/end-screen.tsx` (함께한 사람 목록 + "다시 참여하기"), `use-kuta-timer.ts`에 예고/종료 상태 추가
  - `components/kuta/kuta-zone.tsx` (Modify — 예고 dialog·종료 화면 전환 조립)
  - `e2e/timer.spec.ts` (예고·종료 파트)
- **수용 기준**:
  - [ ] 남은 시간 30초에 "곧 커타가 끝나요 ☕" 예고가 두 컨텍스트에 뜬다 (FR-7)
  - [ ] 0초에 종료 화면이 두 컨텍스트 모두에 뜨고 "함께한 사람" 목록이 보인다 (FR-7 / SC5)
  - [ ] 종료 화면에서 "다시 참여하기"를 누르면 입장 화면으로 이동한다 (wireframe 종료 화면 전환)
- **검증**: Playwright 2-context (짧은 duration seed) — 30초 예고·0초 종료·목록 단언 + "다시 참여하기" → 입장 화면. `bun run test:e2e -- timer`

---

### Task 6: 오늘의 커타 질문

- **담당 시나리오**: Scenario B (보조 — 질문 표시)
- **크기**: S
- **의존성**: T5a (질문은 세션에 고정 — 세션 생성/합류 로직 필요)
- **참조**:
  - `artifacts/online-kuta/wireframe.html` (질문 배너)
- **구현 대상**:
  - `config/questions.ts` (질문 수십 개)
  - `services/session.ts` (세션 생성 시 질문 하나 선택·저장) — 데이터 흐름: `use-kuta-timer` 훅이 반환하는 세션 객체의 `question`을 `question-banner`에 **prop으로 전달**(components→services 직접 참조 없음, 레이어 준수)
  - `components/kuta/question-banner.tsx`, `components/kuta/kuta-zone.tsx` (Modify — 배너 조립)
  - `e2e/question.spec.ts`
- **수용 기준**:
  - [ ] 방의 두 컨텍스트가 동일한 "오늘의 질문" 텍스트를 본다 (FR-8 / SC6)
- **검증**: Playwright 2-context — 두 컨텍스트 배너 텍스트 동일 단언. `bun run test:e2e -- question`

---

### Checkpoint: Tasks 5a-6 이후
- [ ] `bun run test` + `bun run test:e2e` 통과, `bun run build` 성공
- [ ] end-to-end: 커타 시작 → 같은 질문·같은 타이머 → 30초 예고 → 종료가 두 탭에 동시에 인지된다

---

### Task 7: 배포 & 성공 기준 검증

- **담당 시나리오**: 전체 (Scenario A~D를 배포본에서 한 바퀴 — Scenario D 재입장 왕복 포함)
- **크기**: S
- **의존성**: T1~T6 전부 (T5a·T5b 포함)
- **참조**:
  - (supabase 스킬 — 호스티드 프로젝트에 migrations 적용)
- **구현 대상**:
  - 호스티드 Supabase에 `supabase/migrations/*` 적용 + seed room
  - Vercel 프로젝트 연결, `NEXT_PUBLIC_SUPABASE_*` 환경변수 설정, `git push` 배포
  - `README.md` 실행/배포법 정리
- **수용 기준**:
  - [ ] 배포 URL에서 링크 입장 → 음료 → 모임 → 채팅 → 타이머 종료가 손으로 한 바퀴 매끄럽게 된다 (SC7 + 전체)
  - [ ] 나갔다가 같은 링크로 다시 들어오면 이름·음료를 다시 고르고 재입장된다 (Scenario D 왕복 / FR-5 역방향)
  - [ ] spec §7 성공 기준 체크리스트가 전부 통과한다
- **검증**: Human review — 리뷰어=사용자, 배포 URL을 두 브라우저(또는 두 기기)로 열어 시나리오 A~D 수행. 증거(스크린샷/짧은 녹화) `artifacts/online-kuta/evidence/task-7/`

---

## 리스크 / plan-reviewer 검토 포인트
- **Presence 유령 아바타:** 탭 강제 종료 시 leave가 늦을 수 있음 → Supabase presence 타임아웃/재동기화 확인. (T3, FR-5)
- **RLS 범위:** anon이 다른 방 메시지를 못 읽게 room_id 범위로 정책 제한. anon key 공개는 OK지만 권한 위임은 금지. (T1/T4, 보안)
- **타이머 오차:** 반드시 `started_at`(서버 시각) 하나만 공유하고 클라이언트가 계산. 로컬 타이머 독립 구동 금지. (T5, FR-6)
- **로컬 Supabase 의존:** e2e가 Docker 로컬 Supabase를 요구 → 실행 전 `supabase start` 필요. CI에 Docker 셋업 문서화. (T1)
- **테스트용 짧은 세션:** 10분을 기다리지 않도록 timer e2e는 짧은 duration seed 사용. prod 기본은 600초 유지. (T5)
- **Realtime 한도:** Supabase 무료 티어 동시 연결·메시지 한도 — MVP(2~8명, 방 1개)면 충분할 전망. (T7)

## 진행 순서 요약
T1(기반·최고위험 선검증) → T2(입장) → T3(참여자 실시간) → [CP] → T4(채팅) → [CP] → T5a(세션·타이머) → T5b(예고·종료) → T6(질문) → [CP] → T7(배포).

## 미결정 / 후속 (MVP 밖)
- **픽셀 아바타 에셋(Kenney CC0):** wireframe·MVP는 lucide user 아이콘 placeholder로 충분(SC는 픽셀아트 요구 안 함). 원하면 T3에 에셋 교체를 선택적 서브스텝으로 추가. 라이선스 CC0 확인 후.
- **세션 종료 서버 강제:** 지금은 클라이언트 계산. 신뢰가 필요해지면 Edge Function/cron으로 `ended_at` 확정. (spec out of scope)
- **멀티룸 UI:** 라우트는 `/room/[roomId]`로 준비돼 있으나 방 생성/목록 UI는 후속.
