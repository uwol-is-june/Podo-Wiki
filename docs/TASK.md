# Tasks

> 포맷: `- [ ] [TASK-NNN] (O|S) 태스크 이름 → 배경/이유`
> - **(O)** = Opus 권장 — 설계 판단, 여러 파일에 걸친 구조 변경, 까다로운 디버깅
> - **(S)** = Sonnet 권장 — 구현 방법이 명확한 단순 구현/수정
>
> 완료된 태스크는 여기서 삭제하고 CHANGELOG.md Unreleased 섹션으로 이동

---

## 진행 중

_없음_

---

## 대기 중

- [ ] [TASK-003] (S) profiles에 role 컬럼 추가 + admin 페이지에서 관리자 권한 부여/해제
  → 배경: 관리자 전용 문서(FAQ·도움말·포도상점) 편집 권한의 기반. /admin 접근 자체는 기존 passcode 방식 유지.
  → 마이그레이션: `profiles.role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin'))` + `is_admin()` SECURITY DEFINER 함수 (기존 `is_approved()` 패턴 참고, 20260530000001_profiles.sql).
  → /admin 회원 관리 탭(AdminUserTable.tsx)에 role 표시 + "관리자 지정/해제" 버튼. 서버 액션은 src/lib/admin/actions.ts에 `setProfileRole(userId, role)` 추가 (createAdminClient 사용, approveProfile 패턴 동일).

- [ ] [TASK-004] (O) 보호 문서 메커니즘 — protected 문서는 admin만 편집 가능
  → 배경: FAQ·도움말·포도상점은 일반 회원 열람만 가능, 편집은 role='admin'만. TASK-003 선행 필요.
  → 마이그레이션: `documents.protected BOOLEAN NOT NULL DEFAULT false` + documents/revisions의 UPDATE·DELETE·INSERT RLS 정책을 "protected면 is_admin() 필요"로 교체. 기존 문서 중 `포도위키:도움말`, `포도상점`(존재 시)을 protected=true로 UPDATE.
  → 앱 레벨: edit/[...slug]/page.tsx에서 protected && !admin이면 안내 화면(편집 불가), saveDocument·requestDocumentDeletion(src/lib/wiki/actions.ts)에 동일 체크, 문서 보기 페이지(w/[...slug]/page.tsx)에서 편집 버튼 대신 잠금 표시.
  → 사용자의 admin 여부 판정: profiles에서 본인 role 조회 (approved 체크와 같은 자리).

- [ ] [TASK-005] (S) FAQ 문서 시드 — `포도위키:FAQ` 생성 (protected)
  → 배경: FAQ 내용의 원본 저장소. 관리자가 일반 에디터로 수정하는 구조. TASK-004 선행 필요.
  → 마이그레이션으로 시드 (20260530000002_seed_documents.sql 패턴): `## 질문` 헤딩 + 답변 본문 형식, protected=true. 초기 항목: 공연권 허락은 어떻게 받나요? / 회원가입·승인은 어떻게 되나요? / 문서는 누구나 수정할 수 있나요? / 인수인계 문서는 어떻게 만드나요? 등 4~6개.
  → 포도상점 문서가 DB에 없으면 함께 시드(protected=true).

- [ ] [TASK-006] (S) 메인 페이지 FAQ 섹션 — 질문 링크 리스트
  → 배경: 메인에서 FAQ 접근성 확보. TASK-005 선행 필요.
  → src/app/page.tsx에서 `포도위키:FAQ` 문서 content를 조회해 `## ` 헤딩만 파싱 → 질문 링크 리스트 렌더. 각 질문 클릭 시 `/w/포도위키:FAQ#<헤딩앵커>` 이동 (문서 페이지 TOC가 쓰는 헤딩 id 규칙 재사용).
  → 배치: 좌측 컬럼에서 공지사항과 최근 변경 사이에 "자주 묻는 질문" 카드 + "FAQ 전체 보기 →" 링크. 우측 "빠른 링크"에도 FAQ 추가.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
