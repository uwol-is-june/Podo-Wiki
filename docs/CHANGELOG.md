# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- [TASK-004] 각주(footnote) 기능 추가
  - `src/components/wiki/FootnoteInsertModal.tsx` — 각주 내용 입력 모달 신규 생성
  - `src/components/wiki/WikiEditor.tsx` — 툴바에 `[^]` 각주 버튼 추가. 모달 확인 시 커서 위치에 `[^N]` 삽입, 문서 맨 끝에 `[^N]: 내용` 정의 자동 추가. N은 기존 정의 수+1 자동 부여
  - `src/app/edit/[...slug]/page.tsx` — `[^` 패턴을 `&#91;^`로 이스케이프한 뒤 `marked.parse()` 적용. marked v18이 단어 1개짜리 정의를 reference-style 링크로 잘못 파싱하는 문제 방지
  - `src/components/wiki/MarkdownContent.tsx` — `processFootnotes()` 함수 추가: 정의부 추출 → 인라인 `[^N]`을 `<sup>` HTML로 치환(cross-section 지원) → 문서 맨 끝 구분선 아래 번호 목록 렌더링 + `↩` 역참조 링크

### Fixed
- [TASK-003] 본문 목차 스크롤바 크기 축소
  - `src/app/globals.css` — `.scrollbar-thin` 유틸리티 추가 (width 4px, Firefox `scrollbar-width: thin`)
  - `src/components/wiki/TableOfContents.tsx` — 스크롤 컨테이너에 `scrollbar-thin` 적용
- [TASK-002] 에디터 드래그 중 색 변경 즉시 반영
  - `src/app/globals.css` — `.ProseMirror ::selection` 배경을 반투명(`rgba(106,57,192,0.25)`)으로 지정. 기존엔 불투명한 selection 하이라이트가 텍스트 색을 가려 드래그 해제 후에야 색상이 보이던 문제 수정

### Changed
- [TASK-001] 에디터 툴바 주황색 색상값 교체
  - `src/components/wiki/WikiEditor.tsx` — 주황색 스와치를 `#dd6b20` → `#f59e0b`(amber)로 변경해 빨강(`#e53e3e`)과의 색상 계열 분리

### Added
- [TASK-003] 탭바 삭제 신청 버튼 오른쪽 끝 배치
  - `src/app/w/[...slug]/page.tsx` — `<DeletionRequestButton>`을 `<div className="ml-auto">`로 감싸 보기/수정/역사 탭과 시각적으로 분리
- [TASK-002] 테이블 서브 툴바 배경 불투명 처리
  - `src/components/wiki/WikiEditor.tsx` — 표 편집 서브 툴바 배경을 `bg-wiki-accent/5` → `bg-wiki-surface`로 변경해 뒤 배경이 비치는 문제 해결
- [TASK-001] 에디터 텍스트 색상 변경 기능 (5색)
  - `@tiptap/extension-color@3.23.6` + `@tiptap/extension-text-style@3.23.6` 패키지 추가
  - `src/components/wiki/WikiEditor.tsx` — `TextStyle`, `Color` 익스텐션 등록. 툴바에 빨강/파랑/초록/주황/보라 5색 팔레트 + 초기화 버튼 추가. color span을 Markdown 내 HTML로 보존하는 Turndown 커스텀 규칙(`color-span`) 추가
  - 읽기 모드(`MarkdownContent.tsx`)는 기존 `rehype-raw`로 HTML span을 그대로 렌더링하므로 별도 변경 없음
- [TASK-001] 문서 삭제 신청 및 관리자 승인 기능
  - `supabase/migrations/20260624000000_deletion_requests.sql` — `deletion_requests` 테이블 생성. 문서 삭제 시 CASCADE로 자동 삭제. 승인된 사용자만 INSERT 가능한 RLS 정책 적용
  - `src/lib/supabase/types.ts` — `DeletionRequest` 타입 추가
  - `src/lib/wiki/actions.ts` — `requestDocumentDeletion(slug, reason)` 서버 액션 추가. 이미 대기 중인 신청이 있으면 중복 신청 차단
  - `src/lib/admin/actions.ts` — `getDeletionRequests()`, `approveDeletion(documentSlug)`, `rejectDeletion(requestId)` 추가. 승인 시 문서 삭제(CASCADE), 거부 시 신청 상태를 rejected로 변경. 역링크 수(ILIKE 검색) 포함 반환
  - `src/components/wiki/DeletionRequestButton.tsx` — 신규 클라이언트 컴포넌트. 모달에서 사유 입력 후 신청
  - `src/app/w/[...slug]/page.tsx` — 승인된 사용자에게 탭바에 "삭제 신청" 버튼 표시
  - `src/app/admin/AdminDeletionTable.tsx` — 삭제 신청 목록 테이블. 역링크 수 경고 포함. 승인 시 confirm 다이얼로그에서 역링크 수 안내
  - `src/app/admin/page.tsx` — "회원 관리" / "삭제 신청" 섹션 탭 추가. 대기 중인 삭제 신청 수 뱃지 표시
- [TASK-029] 어드민 전체 사용자 목록 조회
  - `src/lib/admin/actions.ts` — `getAllProfiles()` 서버 액션 추가. 전체 사용자를 가입일 내림차순으로 조회
  - `src/app/admin/page.tsx` — URL searchParams(`?filter=`) 기반 탭 필터(전체/대기/승인/거절) 추가. 대기 탭에 미처리 건수 뱃지 표시
  - `src/app/admin/AdminUserTable.tsx` — 상태 컬럼 추가 및 색상 뱃지(대기/승인/거절) 표시. 이미 승인된 사용자는 승인 버튼 숨김, 이미 거절된 사용자는 거부 버튼 숨김
- [TASK-028] 열람 페이지 상위 페이지 브레드크럼
  - `src/components/wiki/Breadcrumb.tsx` — 신규 컴포넌트. 브레드크럼 항목 배열을 받아 `›` 구분자로 링크 렌더링
  - `src/app/w/[...slug]/page.tsx` — `fetchExistingSlugs()` 추가. 슬러그를 `/` 기준 분리해 상위 슬러그 목록 추출, DB에서 실제 존재하는 것만 필터링해 `<Breadcrumb>` 표시. 최상위 페이지(분리 결과 없음)는 브레드크럼 미표시

### Fixed
- 링크 삽입 모달 내부 문서 검색 복원
  - `src/lib/wiki/search-actions.ts` — `searchDocuments` 서버 액션 재도입. 클라이언트 Supabase에서 documents SELECT가 동작하지 않는 문제 우회
  - `src/components/wiki/LinkInsertModal.tsx` — 브라우저 Supabase 클라이언트 제거, `searchDocuments` 서버 액션 사용. debounce 제거하고 stale `cancelled` 플래그만 유지해 딜레이 없이 실시간 검색

### Changed
- [TASK-012] 나무위키 방식 URL 라우팅 리팩토링
  - `src/app/w/[...slug]/` — `[slug]` → `[...slug]` catch-all 라우트로 교체. 슬러그에 `/`가 포함된 문서(예: `광운극예술연구회/무대감독`)를 `%2F` 인코딩 없이 실제 슬래시 URL로 접근 가능
  - `src/app/edit/[...slug]/` — 편집 페이지를 최상위 `/edit/` 경로로 분리. `params.slug: string[]` + `.map(decodeURIComponent).join('/')` 패턴
  - `src/app/history/[...slug]/` — 역사 목록도 동일하게 최상위 `/history/` 경로로 분리
  - `src/app/revision/[id]/` — 특정 리비전 조회. slug를 URL에서 제거하고 DB의 `revisions.document_slug`에서 획득
  - `src/app/diff/` — 버전 비교 페이지. slug를 URL에서 제거하고 revision row에서 획득
  - `src/components/wiki/RevisionList.tsx` — `slug` prop 제거, 리비전 링크 `/revision/${id}`, diff 링크 `/diff?from=...&to=...`로 변경
  - `src/lib/wiki/actions.ts` — 로그인 리다이렉트를 `slugToEditHref(slug)` 사용으로 변경
  - 구 라우트(`src/app/w/[slug]/`) 전체 삭제

### Fixed
- [TASK-011] URL 한글 디코딩 표시 개선
  - `src/lib/wiki/slugToHref` — `encodeURIComponent` 전체 인코딩 제거, URL 구조를 깨는 문자(`%`, `?`, `#`, ` `)만 선택적 인코딩. 브라우저 주소창에 한글이 그대로 표시
- [TASK-010] 문서별 편집 잠금(Pessimistic Locking) 기능 추가
  - `supabase/migrations/20260606000000_edit_locks.sql` — `edit_locks` 테이블 생성. PK는 `document_slug`, `expires_at` 30분. RLS: 만료된 잠금은 다른 사용자도 update/delete 가능
  - `src/lib/wiki/lock-actions.ts` — `releaseLock`, `refreshLock` Server Action 추가
  - `src/app/w/[slug]/edit/page.tsx` — 편집 진입 시 잠금 확인, 다른 사용자가 편집 중이면 잠금 안내 표시 후 수정 불가
  - `src/components/wiki/WikiEditor.tsx` — 저장·취소 시 `releaseLock` 호출. 10분 주기로 `refreshLock` 하트비트. 언마운트 시 잠금 해제
- [TASK-009] 모바일 문서 본문 카드 박스 제거
  - `src/app/w/[slug]/page.tsx` — `article` 태그에서 카드 스타일(`bg-wiki-surface border rounded-lg p-6`)을 `sm:` 조건부로 변경. 모바일에서는 나무위키처럼 배경·테두리 없이 풀 너비 표시
  - `src/app/w/[slug]/loading.tsx` — 스켈레톤도 동일하게 `sm:` 조건부 적용
- [TASK-008] 홈 상단 환영 배너 완전 삭제
  - `src/app/page.tsx` — "포도위키" 제목·설명 텍스트를 담은 환영 배너 블록 전체 제거
- [TASK-007] Footer CC 라이선스 링크 줄바꿈 방지
  - `src/components/layout/Footer.tsx` — CC 라이선스 `<a>` 태그에 `whitespace-nowrap` 추가. 모바일에서 "KR"만 줄바꿈되던 현상 방지
- [TASK-006] 공연단체명 모바일 줄바꿈 개선
  - `src/app/page.tsx` — 단체명 `<span>`에 `break-keep` 추가. `word-break: keep-all`로 CJK 글자 단위 break point 방지, "광운극예술연구회"처럼 마지막 한 글자만 줄바꿈되던 현상 해결
- [TASK-005] 에디터 툴바 가로 스크롤 방식으로 전환
  - `src/components/wiki/WikiEditor.tsx` — 메인 툴바·표 편집 툴바 모두 `flex-nowrap overflow-x-auto sm:flex-wrap`으로 변경. 모바일에서 모든 버튼을 한 줄 가로 스크롤로 유지, 데스크탑에서는 기존 wrap 동작 유지
- [TASK-004] 에디터 모바일 min-h 축소
  - `src/components/wiki/WikiEditor.tsx` — 에디터 본문 영역 `min-h-[400px]` → `min-h-[200px] sm:min-h-[400px]`으로 변경해 모바일 뷰포트에서 키보드 올라와도 편집 공간 확보
- [TASK-003] Header 모바일 터치 타겟 확대
  - `src/components/layout/Header.tsx` — 모바일 검색·메뉴 버튼 `w-9 h-9`(36px) → `w-11 h-11`(44px)으로 확대, 권장 최소 터치 타겟 44px 충족
- [TASK-002] MarkdownContent 반응형 타이포그래피·여백
  - `src/components/wiki/MarkdownContent.tsx` — PROSE 상수에 sm: 반응형 클래스 추가. 모바일 기본값: h1 text-xl/mt-5, h2 text-lg/mt-4, h3 text-base/mt-3, p my-2. sm+ 에서 기존 크기(h1 text-2xl/mt-8 등) 복원
- [TASK-001] RevisionList 모바일 2행 레이아웃
  - `src/components/wiki/RevisionList.tsx` — 모바일에서 1행(r번호+날짜+최신뱃지) / 2행(편집자+바이트차이+요약) 2행 구성으로 변경. sm+ 에서는 기존 단일 행 유지. `display: contents` 트릭으로 데스크탑 flex row 레이아웃 손상 없이 구현
- [TASK-027] 회원가입·비밀번호 재설정 이메일 한글 템플릿 작성
  - `supabase/templates/confirmation.html` — 포도위키 브랜딩 적용된 한글 이메일 인증 템플릿 신규 작성
  - `supabase/templates/reset_password.html` — 비밀번호 재설정 한글 템플릿 신규 작성
  - Supabase 대시보드 Authentication > Email Templates에 수동 적용 필요 (아래 안내 참고)
- [TASK-026] 에디터 툴바 화면 상단 고정(sticky)
  - `src/components/wiki/WikiEditor.tsx` — 외부 컨테이너 `overflow-hidden` → `overflow-clip`으로 교체해 sticky 동작 허용. 툴바(+표 편집 툴바) 를 `sticky top-[50px] z-20` 래퍼로 묶어 스크롤해도 헤더 바로 아래 고정되도록 처리. 배경색 `bg-wiki-bg/50` → `bg-wiki-surface`(불투명)으로 변경
- [TASK-025] 에디터 저장 중 로딩 오버레이 위치를 뷰포트 중앙으로 수정
  - `src/components/wiki/WikiEditor.tsx` — `absolute inset-0` → `fixed inset-0 z-50`으로 변경. 배경 딤처리 + 카드형 로딩 UI로 스크롤 위치와 무관하게 화면 중앙에 표시
- [TASK-015] 로그인 후 헤더 인증 상태 미갱신 버그
  - `src/app/layout.tsx` — async 서버 컴포넌트로 변경. `getUser()` + profiles 쿼리로 user/profileStatus를 읽어 Header에 초기값으로 전달
  - `src/components/layout/Header.tsx` — `initialUser`, `initialProfileStatus` prop 추가. `useState(null)` → `useState(initialUser/initialProfileStatus)`로 변경해 첫 렌더부터 올바른 인증 상태 표시

### Added
- [TASK-024] 비밀번호 찾기(재설정) 기능 추가
  - `src/lib/auth/actions.ts` — `requestPasswordReset`, `updatePassword` Server Action 추가
  - `src/app/auth/callback/route.ts` — `next` 쿼리 파라미터 지원 추가 (복구 흐름에서 `/reset-password`로 리다이렉트)
  - `src/app/login/LoginForm.tsx` — 로그인 폼 하단에 "비밀번호를 잊으셨나요?" 링크 추가
  - `src/app/forgot-password/` — 이메일 입력 후 재설정 링크 발송 페이지 신규 생성
  - `src/app/reset-password/` — 새 비밀번호 입력 및 변경 페이지 신규 생성
- [TASK-001] 에디터에 표(Table) 삽입·편집 기능 추가
  - `@tiptap/extension-table` / table-row / table-header / table-cell 패키지 설치
  - `turndown-plugin-gfm` 적용으로 표를 GFM 마크다운으로 저장
  - `src/components/wiki/WikiEditor.tsx` — 툴바에 "표" 삽입 버튼 추가 (3×3, 헤더 행 포함). 커서가 표 안에 있을 때 행·열 추가/삭제 컨텍스트 툴바 표시. 에디터 내 표 스타일 및 선택 셀 하이라이트 적용
  - `src/types/turndown-plugin-gfm.d.ts` — 타입 선언 파일 신규 추가
- [TASK-023] 임의 문서 버튼에 셔플 아이콘 추가
  - `src/components/layout/Header.tsx` — 데스크탑 nav, 모바일 메뉴 "임의문서" 링크에 셔플 아이콘(SVG) 추가. 텍스트만으로 기능을 파악하기 어렵다는 피드백 반영
- [TASK-018] 편집기 이미지 크기 조절 (드래그 리사이즈 핸들)
  - `src/components/wiki/WikiEditor.tsx` — Tiptap v3 내장 `resize` 옵션 활성화 (`alwaysPreserveAspectRatio: true, minWidth: 50`). 이미지 선택/호버 시 4방향 모서리 핸들 표시. TurndownService 커스텀 룰 추가 — width 있는 이미지를 `![alt](src "w=200")` 형태로 저장
  - `src/components/wiki/MarkdownContent.tsx` — 커스텀 `img` 렌더러 추가. title 필드의 `"w=숫자"` 파싱해 `style.width` 적용
  - `src/app/globals.css` — `[data-resize-handle]` 핸들 스타일 (hover/선택 시 표시, 방향별 커서)
- [TASK-022] 역사 페이지 — 두 리비전 diff 비교
  - `diff` 패키지 추가
  - `src/components/wiki/RevisionList.tsx` — 신규 Client 컴포넌트. 체크박스로 최대 2개 선택, 2개 선택 시 "선택한 버전 비교" 버튼 노출
  - `src/app/w/[slug]/history/page.tsx` — RevisionList 컴포넌트 사용으로 교체
  - `src/app/w/[slug]/history/diff/page.tsx` — 신규. `?from=id&to=id` 쿼리로 두 리비전 fetch, `diffLines`로 줄 단위 비교. 추가(초록)·삭제(빨강) 강조 렌더링. 이전/새 버전 요약 배너 포함.
- [TASK-021] 역사 페이지 — 리비전 내용 보기
  - `src/app/w/[slug]/history/page.tsx` — 각 행을 `<Link>`로 변경, `/w/{slug}/history/{id}` 로 이동
  - `src/app/w/[slug]/history/[id]/page.tsx` — 신규 생성. `revisions.content`로 그 시점 본문 렌더링. 과거 버전 배너(작성일시·작성자) + "최신 버전 보기" 링크 표시. TOC 포함.
- [TASK-020] 날짜 표시 한국 시간(KST) 통일
  - `timeZone: 'Asia/Seoul'` 옵션 추가: `src/app/page.tsx`, `src/app/recent/page.tsx`, `src/app/w/[slug]/page.tsx`, `src/app/w/[slug]/history/page.tsx`, `src/app/admin/AdminUserTable.tsx`, `src/app/mypage/page.tsx`
- [TASK-019] 소제목 접기/펼치기 토글 UI 개선 (h1·h2 계층 지원)
  - `src/components/wiki/MarkdownContent.tsx` — `splitBlocks` 함수로 h1 > h2 계층 구조 파싱. h1 접으면 하위 h2 전체 함께 숨음. 텍스트 버튼 → 캐럿(▶) 아이콘으로 교체, 헤딩 전체 클릭 가능, 아이콘 회전 CSS transition 적용.
- [TASK-017] 문서 본문 소제목 접기/펼치기 토글
  - `src/components/wiki/MarkdownContent.tsx` — 마크다운을 H2 기준으로 섹션 분리, 각 H2 소제목 옆에 [접기/펼치기] 버튼 추가. H2 없는 문서는 기존 렌더링 유지.
- [TASK-016] 편집기 이미지 삽입 기능
  - `@tiptap/extension-image@3.23.6` 패키지 추가
  - `src/components/wiki/WikiEditor.tsx` — Image 익스텐션 추가, 툴바에 이미지 버튼 추가. 클릭 시 파일 선택 → Supabase Storage `wiki-images` 버킷 업로드 → 반환 URL을 에디터에 삽입. 업로드 중 저장 버튼 비활성화 및 상태 표시.
  - `src/components/wiki/MarkdownContent.tsx` — 이미지 스타일 (`max-w-full rounded my-3`) 추가
- [TASK-014] 데이터 패칭 페이지 로딩 스켈레톤
  - `src/app/loading.tsx` — 홈 페이지 스켈레톤 (배너·단체 그리드·2컬럼 레이아웃)
  - `src/app/w/[slug]/loading.tsx` — 문서 열람 스켈레톤 (제목·탭·본문·TOC 사이드바)
  - `src/app/w/[slug]/edit/loading.tsx` — 편집 에디터 스켈레톤 (제목 입력·툴바·본문 영역)
  - `src/app/recent/loading.tsx` — 최근 변경 스켈레톤 (테이블 행 10줄)
  - `src/app/search/loading.tsx` — 검색 결과 스켈레톤 (결과 카드 5개)
  - `src/app/mypage/loading.tsx` — 마이페이지 스켈레톤 (정보 카드 행)
  - `src/app/random/loading.tsx` — 랜덤 문서 로딩 안내 텍스트
- [TASK-013] 대문 공연단체 바로가기
  - `src/data/troupes.ts` — 단체 목록 데이터 파일 (name, slug, logo?). 추가 요청 시 이 파일에 하드코딩.
  - `src/app/page.tsx` — 환영 배너 아래 공연단체 카드 그리드 섹션 추가. 단체 없으면 섹션 미표시. 로고 있으면 이미지, 없으면 이니셜 플레이스홀더.
- [TASK-012] 로그아웃 로딩 UI
  - `src/components/auth/LogoutButton.tsx` — `useTransition` 기반 로그아웃 버튼 공용 컴포넌트 (로그아웃 중… 텍스트 + disabled)
  - Header, MyPage, Pending 페이지의 `<form action={logout}>` 버튼을 `LogoutButton`으로 교체
- [TASK-011] 마이페이지
  - `src/app/mypage/page.tsx` — 로그인한 사용자의 이름·소속·이메일·가입일·승인 상태 표시 (Server Component)
  - `src/components/layout/Header.tsx` — 로그인 시 이메일 텍스트를 "내 정보" 링크(`/mypage`)로 교체
- [TASK-010] 대문 페이지 개편 + 초기 위키 문서 시드
  - `src/app/page.tsx` — 나무위키 스타일 2컬럼 다단 레이아웃 (환영 배너, 공지사항, 최근 변경, 통계, 빠른 링크)
  - `supabase/migrations/20260530000002_seed_documents.sql` — 포도위키:규칙, 포도위키:편집방침, 포도위키:도움말 초기 문서 삽입
- [TASK-009] 회원 권한 체계 구현
  - `supabase/migrations/20260530000001_profiles.sql` — profiles 테이블, `is_approved()` DB 함수, documents/revisions 쓰기 RLS를 approved 전용으로 교체
  - `src/lib/supabase/types.ts` — profiles 타입 + `Profile`, `ProfileStatus` export
  - `src/lib/supabase/admin.ts` — service_role key 기반 admin Supabase client (서버 전용)
  - `src/lib/auth/actions.ts` — `signup()`에 이름·소속 단체 필드 + profile INSERT(pending 상태) 추가
  - `src/app/signup/SignupForm.tsx` — 이름·소속 단체 입력 필드 추가
  - `src/app/auth/callback/route.ts` — 이메일 인증 완료 콜백 Route Handler
  - `src/lib/admin/actions.ts` — passcode 검증, pending 목록 조회, 승인/거부 Server Actions
  - `src/app/admin/login/` — 관리자 passcode 입력 페이지 (`podo0607`)
  - `src/app/admin/page.tsx` + `AdminUserTable.tsx` — 가입 신청 승인/거부 관리 대시보드
  - `src/app/pending/page.tsx` — 로그인 됐으나 승인 대기 상태인 사용자 안내 페이지
  - `src/app/w/[slug]/edit/page.tsx` + `src/lib/wiki/actions.ts` — approved 상태 아닌 사용자는 `/pending`으로 redirect
  - `src/components/layout/Header.tsx` — 승인 대기 상태 시 "승인 대기" 배지 표시
  - `middleware.ts` — Supabase 세션 토큰 자동 갱신 미들웨어 추가
- 프로젝트 초기 세팅 (Next.js 16, TypeScript, Tailwind CSS v4)
- Supabase 클라이언트 설정 (`src/lib/supabase/`)
- Vercel 배포 연결
- 나무위키 스타일 전체 레이아웃 구현 (Header, Footer, 홈 페이지)
- 키 컬러 `#6a39c0` 기반 디자인 시스템 (CSS 토큰, 라이트/다크 테마)
- localStorage 기반 라이트/다크 테마 토글 (`ThemeProvider`)
- [TASK-008] 로그인/회원가입 페이지
  - `src/lib/auth/actions.ts` — `login`, `signup`, `logout` Server Actions
  - `src/app/login/page.tsx` + `LoginForm.tsx` — 이메일+비밀번호 로그인, `useActionState` 오류 피드백
  - `src/app/signup/page.tsx` + `SignupForm.tsx` — 회원가입, 성공 시 이메일 확인 안내
  - 로그인 성공 시 `?next=` 파라미터 경로로 redirect (미지정 시 홈)
  - 편집 페이지 인증 체크: `/login?next=/w/[slug]/edit` redirect
  - 헤더: 로그인 상태에 따라 "로그인" 버튼 ↔ 이메일+로그아웃 버튼 전환 (`onAuthStateChange`)
- [TASK-007] 문서 편집 에디터
  - `src/lib/wiki/actions.ts` — `saveDocument` Server Action (upsert + revision insert + revalidate + redirect)
  - `src/app/w/[slug]/edit/page.tsx` — Server Component: 인증 체크 후 기존 문서 로드, Markdown→HTML 변환(`marked`)
  - `src/components/wiki/WikiEditor.tsx` — Client Component: tiptap + StarterKit + Link 확장, 툴바(굵게/기울임/취소선/제목/목록/코드블록/인용/링크/구분선), 저장 시 HTML→Markdown 변환(`turndown`)
  - 미인증 사용자 `/login` redirect
  - `src/lib/supabase/types.ts` — `Relationships`, `Enums`, `CompositeTypes` 필드 추가 (Supabase 제네릭 호환)
- [TASK-006] 문서 목차(TOC) 컴포넌트
  - `src/lib/wiki/headings.ts` — `extractHeadings`, `slugify` 공유 유틸리티
  - `src/components/wiki/TableOfContents.tsx` — Client Component, IntersectionObserver 스크롤 하이라이트
  - 데스크탑: 우측 sticky 사이드바 (`variant="desktop"`)
  - 모바일: 본문 위 접을 수 있는 패널 (`variant="mobile"`, `lg:hidden`)
  - `MarkdownContent` 헤딩에 `id` 속성 추가 (TOC 앵커 링크 연동)
- [TASK-005] 검색 기능
  - Header 검색창에 `<form action="/search" method="GET">` 적용 (`name="q"`)
  - `src/app/search/page.tsx` — Supabase `ilike`로 제목+내용 동시 검색 (최대 30건)
  - 결과 카드: 문서 제목(링크), 매칭 위치 중심 snippet 미리보기
  - 결과 없을 때 "문서 만들기" 링크 제공
- [TASK-004] 임의 문서 페이지 `/random`
  - `documents` 테이블 전체 수 조회 후 랜덤 offset으로 slug 1개 선택
  - `redirect()`로 `/w/[slug]`에 즉시 이동, 문서 없으면 홈으로 fallback
- [TASK-003] 최근 변경 페이지 `/recent`
  - Server Component, `revisions` + `documents` 조인으로 최근 수정 순 조회
  - 문서 제목(링크), 수정 시각, 편집자 표시
  - 20개 단위 서버사이드 페이지네이션 (`?page=N`)
- [TASK-002] 문서 조회 페이지 `/w/[slug]`
  - Server Component SSR — Supabase에서 slug로 문서 조회
  - `react-markdown` + `remark-gfm` 기반 Markdown 렌더링 (`MarkdownContent` Client Component)
  - 문서 없을 시 "이 문서는 아직 없습니다" 안내 + 새 문서 만들기 링크
  - 페이지 상단 보기/수정/역사 탭 (나무위키 스타일)
  - 우측 TOC 사이드바 자리 확보 (TASK-006 연결)
  - `generateMetadata`로 문서 제목 기반 SEO 메타 설정
- [TASK-001] Supabase DB 스키마 설계 및 생성
  - `documents` 테이블 (slug PK, title, content, author_id, created_at, updated_at)
  - `revisions` 테이블 (id, document_slug FK, content, editor_id, edited_at)
  - RLS 정책: 읽기 전체 공개, 쓰기 인증 사용자 한정
  - `src/lib/supabase/types.ts` — TypeScript DB 타입 정의
  - 마이그레이션 파일: `supabase/migrations/20260530000000_initial_schema.sql`

---

## [0.1.0] - 2026-05-30

### Added
- 프로젝트 초기 세팅
