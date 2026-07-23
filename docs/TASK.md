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

- [ ] [TASK-059] (O) 기능 추가 요청 폼 (앱 더보기 탭 + 웹 빠른 링크) + admin 확인·삭제 → 사용자가 원하는 기능을 제출하는 창구. **결정사항(2026-07-21): 앱·웹 모두 익명 제출(로그인 불필요), 연락처 필드 없이 내용만.** 구현 범위: ① **DB** — 새 테이블 `feature_requests`(id, content, created_at, status 기본 'open', source 'app'|'web'). RLS: **anon INSERT 허용**(단 스팸 방지 — content 빈값 차단·길이 상하한 CHECK, 필요시 간단 rate limit), **anon SELECT 불가**, admin(`is_admin()`)만 SELECT·DELETE. 기존 `deletion_requests` 마이그레이션([supabase/migrations/](supabase/migrations/) 20260624000000_deletion_requests.sql) 패턴 그대로 참고. ② **앱** — [mobile/src/app/(tabs)/more.tsx](mobile/src/app/(tabs)/more.tsx) 더보기 탭에 "기능 추가 요청" 항목 추가 → 내용 입력 폼 → 익명 insert(성공 토스트). ③ **웹** — [src/app/page.tsx](src/app/page.tsx) 빠른 링크에 "기능 추가 요청" **버튼** 추가 → 클릭 시 **모달**로 폼 표시(내용 입력) → 익명 insert → 성공 시 모달 닫고 안내. 별도 페이지 이동 없이 모달 내에서 완결(제출 중 로딩·에러·성공 상태 처리, ESC·바깥 클릭 닫기). ④ **admin** — [src/app/admin/page.tsx](src/app/admin/page.tsx)에 요청 목록(생성일시·source·내용)+삭제. 기존 [src/app/admin/AdminDeletionTable.tsx](src/app/admin/AdminDeletionTable.tsx) 패턴으로 `AdminFeatureRequestTable` 신규. (O 권장: DB·웹·앱·admin 여러 파일 + 익명 insert RLS 보안 판단)

- [ ] [TASK-058] (S) 앱 문서 화면 상단 목차/역사 버튼 레이아웃 개선 → **환경: iOS에서 확인**. 버튼 크기와 안쪽 글자·레이아웃이 어색하고 서로/제목과 겹침. 위치: [mobile/src/app/w/[slug].tsx](mobile/src/app/w/[slug].tsx) `headerRight`의 목차·역사 버튼 (L70~86), 스타일 `headerActions: { flexDirection: 'row', gap: 18 }` · `headerAction: { fontSize: 15 }` (L155~156). 현재 네이티브 헤더(`Stack.Screen` headerRight)에 **패딩·터치타깃 없는 plain `Text`**만 들어가 있어, 긴 문서 제목(headerTitle)과 우측 액션 텍스트가 iOS 네이티브 헤더에서 충돌·겹침 추정. 개선 방향: ① 버튼에 적절한 터치 영역/패딩(또는 칩 형태) 부여해 정렬 정돈 ② 제목이 길 때 truncation(ellipsize)해서 우측 액션과 안 겹치게, 필요시 `headerTitle` 커스텀 ③ iOS·Android 양쪽 헤더에서 시각 확인. Expo SDK 57 헤더 옵션 문서(https://docs.expo.dev/versions/v57.0.0/) 참고.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
