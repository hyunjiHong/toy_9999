# 온라인 커타 — learnings.md

> `/execute-plan` 중 내린 판단·발견 기록. 예상과 달랐던 것·우회한 것만 남긴다.

---
category: task-ordering
applied: discarded
---
## Task 실행 순서 = plan 순서 그대로

**상황**: Step 2, 의존성 식별. T1→T2→T3→T4, T5a→T5b, T6(←T5a), T7(전부).
**판단**: plan.md가 이미 의존성 우선 + 고위험(T1 실시간 기반) 선검증으로 정렬돼 있어 재정렬 불필요. 순차 실행.
**다시 마주칠 가능성**: 낮음 — 이 feature 특유.

---
category: escalation
applied: not-yet
---
## 실시간 검증 환경: 로컬 Docker 부재 → 호스티드 Supabase로 전환

**상황**: Step 1, 전제 확인 중 `docker` 데몬 부재 확인. plan은 "로컬 Supabase(Docker) + Playwright 2-context"로 정했으나 Docker가 없어 `supabase start` 불가. supabase CLI·bun·Playwright 브라우저는 존재.
**판단**: 사용자에게 escalation → 호스티드 Supabase 프로젝트로 전환 결정. 코드는 환경과 무관하게 동일(URL/anon key만 env 차이). 호스티드 프로젝트는 T7 배포 백엔드로도 재사용 → 한 번 셋업으로 검증+배포 동시 해결. 실시간 e2e는 사용자가 URL/anon key 제공 + 마이그레이션 적용 후 실행.
**다시 마주칠 가능성**: 높음 — 실시간/외부 인프라 의존 feature는 로컬 하네스 가용성을 plan 단계(draft-plan Step 3)에서 먼저 확인해야 함. Docker 가정이 plan에 암묵적으로 깔렸음.

---
category: code-review
applied: not-yet
---
## 익명+실시간 구조의 RLS 한계 = 링크가 사실상 유일한 경계

**상황**: Step 4, code-reviewer가 rooms/messages/kuta_sessions의 `select using(true)`를 Critical(무필터 조회 → 방 열거·전체 읽기 가능)로 지적.
**판단**: 계정/세션이 없어(spec §8 "계정 없음, 링크=비밀번호") RLS가 "이 클라이언트가 이 방 소속"임을 식별할 수 없다. Postgres Changes 실시간 수신도 구독자가 row를 SELECT할 수 있어야 동작하므로, anon SELECT를 막으면 실시간 자체가 죽는다. 즉 익명+실시간+방별 프라이버시는 RLS만으로 완전 달성 불가 → 진짜 해결은 auth 도입(MVP 밖). 코스메틱 수정 대신 **한계를 문서화(마이그레이션 주석)하고 사용자에게 accept/defer 결정을 에스컬레이션**하기로. insert엔 char_length 제약을 둬 최소 방어.
**다시 마주칠 가능성**: 높음 — "실시간 + 로그인 없음" 조합은 흔함. draft-plan 단계에서 프라이버시 요구가 있으면 auth 필요를 먼저 못박아야 함.

---
category: code-review
applied: not-yet
---
## 동시 "커타 시작" 경합 → 세션 정본(canonical) 규칙으로 수렴

**상황**: Step 4, startOrJoinSession이 check-then-insert라 두 명이 동시에 시작 시 세션 2개 생성 가능(FR-6/FR-8 "모두 동일" 위협) 지적.
**판단**: unique index + ended_at UPDATE 정책은 "만료됐지만 ended_at=null"인 세션과 충돌해 새 커타를 못 열게 만든다. 대신 fetchActiveSession을 "가장 먼저 시작된 미만료 세션 = 정본"으로 바꾸고, 구독 이벤트에서 payload를 믿지 않고 정본을 재조회하도록 수렴. 중복 행은 남지만 전원이 같은 세션을 본다. 유일성 강제보다 읽기 수렴이 이 도메인엔 단순·견고.
**다시 마주칠 가능성**: 중간 — 서버리스+무인증에서 "리더 없는 생성 경합"은 재발.

---
category: code-review
applied: not-yet
---
## 레이어 위반은 타입 위치로 해결 (components→services 금지)

**상황**: Step 4, kuta-timer가 `@/services/session`에서 TimerPhase/formatRemaining을 import(레이어 위반). 같은 브랜치 question-banner는 이미 회피 주석을 달아 일관성 없음.
**판단**: 공용 타입(TimerPhase, RosterEntry)을 types/kuta.ts로 올리고, 포맷 문자열(label)은 hook이 내려주게 변경. 컴포넌트는 types만 참조. presence "나" 식별도 name+drink(중복 이름 취약) → presence key 기반으로 교체하며 같이 정리.
**다시 마주칠 가능성**: 높음 — 편의상 services의 헬퍼/타입을 컴포넌트가 당겨쓰기 쉬움. "공용 타입은 types 레이어" 습관 필요.
