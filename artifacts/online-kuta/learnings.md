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
**판단**: 계정/세션이 없어(spec §8 "계정 없음, 링크=비밀번호") RLS가 "이 클라이언트가 이 방 소속"임을 식별할 수 없다. Postgres Changes 실시간 수신도 구독자가 row를 SELECT할 수 있어야 동작하므로, anon SELECT를 막으면 실시간 자체가 죽는다. 즉 익명+실시간+방별 프라이버시는 RLS만으로 완전 달성 불가 → 진짜 해결은 auth 도입(MVP 밖). 코스메틱 수정 대신 **한계를 문서화(마이그레이션 주석)하고 사용자에게 accept/defer 결정을 에스컬레이션**하기로. insert엔 char_length 제약을 둬 최소 방어. → **사용자 결정(Step 5): MVP 이대로 수용.** 완전 프라이버시가 필요해지면 Supabase Auth를 별도 feature로 도입.
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

---
category: spec-ambiguity
applied: not-yet
---
## 채팅 수명: 영구 저장 → 커타 세션 단위 (배포 후 사용자 피드백)

**상황**: Step 5/배포 후, 사용자가 "다 나가면 채팅이 삭제돼야 하는 거 아닌가" 지적. 현 구현은 messages 영구 저장이라 다음 방문 시 옛 대화가 그대로 노출 — "잠깐 모였다 흩어지는" 커타 컨셉(idea.md)과 어긋남. spec §6은 "저장"만 정의했고 수명은 미정의였음.
**판단**: 옵션 3개 제시(세션 기준 초기화 / 완전 휘발 broadcast / 아무도 없으면 삭제). 사용자 선택=세션 기준. "다 나가면 삭제"의 직역(presence 0→삭제)은 마지막 사람 탭 닫힘에 안 걸려 신뢰성 낮음 → 결정론적 경계인 "새 커타 시작"에 정리. 구현: useMessages를 session.started_at으로 필터(전원 뷰 수렴) + 시작 클라이언트가 started_at 이전 메시지 삭제(실데이터 제거). FR-10으로 spec에 추가.
**다시 마주칠 가능성**: 중간 — "저장 vs 휘발" 수명은 spec에서 빠지기 쉬운 축. write-spec에서 데이터 엔티티마다 수명(retention)을 함께 물으면 예방됨.

---
category: spec-ambiguity
applied: not-yet
---
## 채팅을 휘발성 떠오르는 오버레이로 (세션 저장 모델 대체)

**상황**: 배포 후 사용자가 "메시지가 아래서 위로 올라가 5초 보이고 사라지게, 커피 주변 불특정 위치에서" 요청. 직전엔 "세션 기준 초기화(저장+필터)"로 갔었음.
**판단**: 휘발성 floating이면 화면에 지속 표시 자체가 없어 "옛 대화 계속 보임" 문제가 근본 해소됨 → 히스토리 로드/`sinceIso` 필터 제거하고 useMessages는 "구독 이후 도착분"만 다루게 단순화. 처음엔 mount 시각(client Date.now())과 created_at(server) 비교로 히스토리를 걸렀는데, **클라이언트/서버 시계 오차 시 채팅이 통째로 안 뜨는 버그**가 될 수 있어 폐기 → "구독 이후 실시간 도착 = 새 메시지" 기준으로 전환(시계 비교 없음). 저장분 정리(deleteMessagesBefore)는 프라이버시용으로 유지. FR-10을 휘발성으로 갱신.
**다시 마주칠 가능성**: 높음 — 실시간 UI에서 "클라이언트 시각으로 서버 타임스탬프 필터링"은 흔한 함정. 순서/도착 기준으로 잡아야 안전.
