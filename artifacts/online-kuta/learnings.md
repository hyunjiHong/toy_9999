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
