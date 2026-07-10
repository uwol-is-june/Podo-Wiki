# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- [TASK-048] 모바일 앱 아이덴티티 + 상태 폴리시
  - 앱 아이콘 세트 — `assets/wiki_logo.png`에서 픽셀아트 포도를 배경 제거(채도/명도 마스크) 후 합성: 스토어 아이콘 1024(라이트 배경, 알파 없음 — 애플 요건), Android adaptive 전경/배경(#f7f5fc)/모노크롬, 스플래시 아이콘(투명, 라이트 `#f7f5fc`/다크 `#130d1f` 배경은 app.json)
  - `error-state.tsx` — 쿼리 실패 공통 컴포넌트("다시 시도"), 홈·검색·최근 변경·문서·역사·리비전·diff·FAQ 전 화면 연결
  - 템플릿 데모 에셋(expo/react 로고, tabIcons 등) 정리. 날짜는 전 화면 `formatDateTime`(Asia/Seoul) 사용, 다크모드는 시스템 테마 추종
  - 검증: tsc + expo export 통과. 실기기 확인(Expo Go)은 TASK-049에서
- [TASK-047] 모바일 FAQ + 더보기 탭
  - `faq.tsx` — FAQ 아코디언을 WebView `<details open>` 카드로 렌더(답변 마크다운 링크·목록 충실도 유지, 웹 /faq와 동일 구조). `renderFaqBodyHtml` 헬퍼 + 템플릿에 faq-card CSS 추가
  - `(tabs)/more.tsx` — FAQ·랜덤 문서·웹사이트 열기·문서 신고/문의(mailto, 애플 UGC 1.2 대응)·개인정보처리방침 목록 + 앱 버전 정보
  - `wiki-webview.tsx`에 bodyHtml prop 추가(사전 렌더링 HTML 지원)
- [TASK-046] 모바일 히스토리·리비전·diff 화면
  - `history/[slug].tsx` — r번호·수정 시각·익명 편집자·바이트 증감(±색상)·코멘트, 웹 RevisionList와 동일한 2개 선택 → "선택한 버전 비교" 흐름, 행 탭 → 리비전 보기
  - `revision/[id].tsx` — 과거 버전 안내 배너(시각·편집자·코멘트 + 현재 문서 링크) + WikiWebView 재사용
  - `diff.tsx` — `diffLines(older, newer)` 웹과 동일 정렬·행 렌더(+/− 부호, 취소선, 가로 스크롤), 라이트/다크 green·red 팔레트, 동일 버전 안내
- [TASK-045] 모바일 문서 보기 화면 완성
  - `mobile/src/app/w/[slug].tsx` — WikiWebView 통합, 동적 헤더 제목(문서 title), 헤더 액션(목차·역사), 브레드크럼(존재하는 상위 문서만, 가로 스크롤), not-found 카드(읽기 전용 안내), `포도위키:FAQ` → `/faq` 리다이렉트(웹과 동일)
  - `mobile/src/components/toc-sheet.tsx` — 목차 바텀시트(레벨 들여쓰기+넘버링), 탭 시 `injectJavaScript`로 해당 헤딩 smooth 스크롤
  - `wiki-webview.tsx`에 footerText prop 추가 — 본문 하단 "최종 수정" 메타 표기
- [TASK-044] 모바일 탭 화면 3종 — 홈·검색·최근 변경
  - `mobile/src/components/tab-screen.tsx` — 탭 공통 셸(안전영역+큰 제목) + 탭 바 하단 여백 상수
  - 홈 — 단체 바로가기 그리드(웹 절대 URL 로고, expo-image) + 랜덤 문서 카드, 총 문서 수, 최근 변경 5건, FAQ 프리뷰 4건, pull-to-refresh. 승인 회원 수는 service role 필요라 제외
  - 검색 — 300ms 디바운스 서제스트(제목/슬러그) → 제출 시 본문 포함 전체 검색(스니펫 카드), 웹 /search와 동일 로직
  - 최근 변경 — useInfiniteQuery 무한 스크롤(PAGE_SIZE 20), pull-to-refresh, 익명 편집자 표기
  - 검증: typed routes 생성 후 tsc 통과, expo export 번들 확인
- [TASK-043] 모바일 데이터 레이어 — Supabase anon key 직접 쿼리 + react-query
  - `mobile/src/lib/supabase.ts` — anon key 클라이언트(persistSession:false, 인증 없음)
  - `mobile/src/lib/api.ts` — 웹 서버 컴포넌트 쿼리 미러링(각 함수에 원본 위치 주석): getDocument/getExistingSlugs/getRandomSlug/suggestDocuments/searchDocuments/getRecentRevisions/getHistory/getRevision(Pair)/getFaqItems/getHomeData + editorLabel(익명 표기)·formatDateTime(Asia/Seoul)·extractSnippet. 검색은 `.or()` 대신 ilike 2회 병합(쉼표·괄호 문법 깨짐 회피)
  - 웹에서 복사: `lib/supabase/types.ts`(documents/revisions만), `lib/wiki/slug.ts`, `lib/wiki/faq.ts`, `data/troupes.ts`
  - `_layout.tsx`에 QueryClientProvider(staleTime 60s) + react-native-url-polyfill
  - 검증: `scripts/api-check.ts`로 전 함수 프로덕션 실행 — 문서 11·리비전 148·FAQ 6 등 웹과 일치, 없는 문서 null 처리·diff 페어 정렬 확인
- [TASK-042] 모바일 마크다운 렌더러 — WebView + 로컬 생성 HTML (스파이크 성공)
  - `mobile/src/lib/markdown/structure.ts` — 웹 MarkdownContent.tsx의 각주 전처리·h1/h2/h3 섹션 분할·나무위키식 넘버링을 순수 함수로 포팅
  - `mobile/src/lib/markdown/renderHtml.ts` — 웹과 동일 플러그인의 unified 파이프라인(remarkGfm+cjkFriendly×2+rehypeRaw)으로 HTML 생성. `w=` 이미지 폭은 rehype visitor로 처리
  - `mobile/src/lib/markdown/template.ts` — PROSE 스타일을 평문 CSS로 번역한 HTML 셸 + 인라인 JS(섹션 접기, 각주 탭 툴팁, 링크 가로채기→postMessage)
  - `mobile/src/components/wiki-webview.tsx` — 로컬 HTML 로딩 WebView. 내부 링크(/w/·/faq·/history·/recent)는 네이티브 push, 그 외는 브라우저로. 원격 URL 로딩 차단(애플 4.2 방어)
  - `mobile/src/lib/wiki/headings.ts` — 웹에서 복사
  - 검증: `scripts/render-sample.ts`(dev 유틸)로 기능 총망라 픽스처 + 실문서(포도위키:도움말 24섹션, FAQ) 렌더링 — 넘버링(1./2./2.1./2.1.1.)·각주·표·raw HTML·`w=` 폭·한글 앵커 웹과 일치 확인, Hermes 번들 포함 확인(expo export)
- [TASK-041] 모바일 앱 `mobile/` Expo 프로젝트 스캐폴드 (읽기 전용 v1 트랙 시작)
  - `create-expo-app` SDK 57 템플릿(TS + expo-router) 기반, 데모 화면 제거 후 재구성. 라우트: 루트 Stack(`src/app/_layout.tsx`, 위키 테마 내비게이션) + `(tabs)` NativeTabs 4개(홈/검색/최근 변경/더보기) + 문서 스택(`w/[slug]`, `history/[slug]`, `revision/[id]`, `diff`, `faq`) — 현재는 플레이스홀더
  - `src/theme/colors.ts` — globals.css `--wiki-*` 라이트/다크 토큰 복사본
  - `app.json` — 이름 포도위키, slug podo-wiki, scheme podowiki, 번들 ID `com.podowiki.app`(양대), `supportsTablet: false`, `ITSAppUsesNonExemptEncryption: false`, 스플래시 라이트/다크 배경
  - 의존성: react-native-webview, @supabase/supabase-js@2, @tanstack/react-query@5, diff@9, unified 파이프라인(웹과 동일 메이저). `.env`(gitignore) + `.env.example`
  - 검증: `tsc --noEmit` 통과, `expo export --platform ios` Hermes 번들 생성 확인
- [TASK-040] 개인정보처리방침 페이지 `/privacy` 신설 (모바일 앱 스토어 등록 요건)
  - `src/app/privacy/page.tsx` — 신규. 정적 서버 컴포넌트(max-w-3xl, faq 페이지와 동일 레이아웃 관례). 앱(수집 없음·익명 열람)과 웹사이트 회원 정보(이메일·이름·소속, 편집자 한정)를 분리 서술, Supabase 위탁 고지, 문의처 podostore1111@gmail.com. App Store "App Privacy: 데이터 수집 안 함" 및 Play "데이터 보안: 수집 없음" 신고와 일치하도록 작성
- [TASK-007] FAQ 전용 페이지 `/faq` 신설 + FAQ 파싱 유틸
  - `src/lib/wiki/faq.ts` — 신규. `parseFaqItems(content)`: `## ` 헤딩=질문, 다음 헤딩 전까지=답변(마크다운)으로 분리. id는 기존 `slugify()` 재사용이라 앵커 규칙이 문서 목차와 동일
  - `src/app/faq/page.tsx` — 신규. force-dynamic 서버 컴포넌트, 위키 탭·목차 없는 전용 UI(max-w-3xl). 질문별 `<details open>` 카드(기본 펼침이라 앵커 딥링크 진입 시 답변 바로 보임, JS 불필요) + `id` 앵커 + `scroll-mt-20`. 답변은 ReactMarkdown을 RSC에서 직접 렌더(remarkGfm+cjk-friendly ×2+rehypeRaw — MarkdownContent의 플러그인 상수는 'use client' 모듈이라 서버 import 불가해 자체 구성), 경량 prose 스타일. 하단에 관리자(status+role 판정)만 "FAQ 문서 수정" 버튼, 그 외에는 문의 안내
- [TASK-008] 메인 FAQ 섹션을 대표 질문 4개 + /faq 앵커 링크로 변경
  - `src/app/page.tsx` — extractHeadings 대신 `parseFaqItems().slice(0, 4)`, 질문 링크를 `/faq#앵커`로, "전체 보기"·빠른 링크도 `/faq`로. 대표 4개 = 문서상 앞 4개 (관리자가 FAQ 문서 내 질문 순서로 노출 제어)
- [TASK-009] `/w/포도위키:FAQ` → `/faq` 리다이렉트
  - `src/app/w/[...slug]/page.tsx` — FAQ UI 단일화. 에디터 저장/취소 후 `/w/포도위키:FAQ`로 복귀하는 기존 흐름도 자동으로 /faq 안착. 편집(/edit)·역사(/history) 라우트는 그대로
  - 검증: `next start`로 메인 앵커 링크 4개·/faq 카드 6개(id 일치)·답변 마크다운 렌더·비로그인 수정 버튼 미노출·리다이렉트(NEXT_REDIRECT 307) 확인, `npm run build` 통과
- [TASK-003] profiles에 role 컬럼 추가 + admin 페이지에서 관리자 권한 부여/해제
  - `supabase/migrations/20260709000000_profiles_role.sql` — 신규. `profiles.role`(`member`|`admin`, 기본 `member`) 컬럼 + RLS용 `is_admin()` SECURITY DEFINER 함수(`is_approved()` 패턴, approved 상태도 함께 요구)
  - `src/lib/admin/actions.ts` — `setProfileRole(userId, role)` 추가. 권한 부여는 민감 작업이라 다른 액션들과 달리 `checkAdminSession()` 통과를 요구
  - `src/app/admin/AdminUserTable.tsx` — 권한 컬럼(관리자 배지) + 승인된 회원에 "관리자 지정/해제" 버튼(confirm 후 실행)
  - `src/lib/supabase/types.ts` — profiles Row/Insert/Update에 role, `ProfileRole` 타입 export
- [TASK-004] 보호 문서 메커니즘 — protected 문서는 관리자(role='admin')만 편집 가능
  - `supabase/migrations/20260709000001_protected_documents.sql` — 신규. `documents.protected`(기본 false) 컬럼. documents INSERT/UPDATE/DELETE·revisions INSERT RLS 정책을 "protected면 `is_admin()` 필요"로 교체. `포도위키:도움말`·`포도상점`을 protected=true로 지정
  - `src/app/edit/[...slug]/page.tsx` — 문서 조회를 락 체크 앞으로 이동, protected && 비관리자면 락을 잡지 않고 잠금 안내 화면 렌더(락 잠김 화면과 동일 스타일)
  - `src/lib/wiki/actions.ts` — `saveDocument`는 보호 문서 저장 거부, `requestDocumentDeletion`은 보호 문서 삭제 신청 거부 (RLS와 이중 방어)
  - `src/app/w/[...slug]/page.tsx` — 보호 문서면 비관리자에게 수정 탭 대신 잠금 아이콘 표시, 삭제 신청 버튼 숨김. 캐시된 문서 select에 protected 포함
- [TASK-005] `포도위키:FAQ` 문서 시드
  - `supabase/migrations/20260709000002_seed_faq.sql` — 신규. `## 질문` 헤딩 형식의 FAQ 6문항(공연권 허락·회원가입/승인·수정 권한·인수인계 작성·편집 되돌리기·기타 문의)을 protected=true로 시드. `포도상점` 문서도 없으면 빈 틀로 시드하고 둘 다 protected 보장(멱등)
- [TASK-006] 메인 페이지 "자주 묻는 질문" 섹션
  - `src/app/page.tsx` — `포도위키:FAQ` content를 조회해 `extractHeadings()`로 h2만 파싱, 공지사항과 최근 변경 사이에 질문 링크 리스트 카드 렌더(문서 없거나 h2 없으면 섹션 자체 숨김). 각 질문은 `/w/포도위키:FAQ#<앵커>`로 이동(문서 목차와 동일한 `slugify` id 규칙). 빠른 링크에 "자주 묻는 질문" 추가
  - 검증: 마이그레이션 3건 원격 적용 후 REST로 protected 3건 확인, `next start`로 메인 질문 6개 앵커 링크·FAQ 문서 페이지 잠금 표시·헤딩 id 일치 확인, `npm run build` 통과

### Fixed
- [TASK-001] 볼드+작은따옴표(`**'000'**`) 렌더링 깨짐 수정
  - **원인**: 코드 버그가 아닌 CommonMark flanking delimiter 규칙 — `**` 안쪽이 문장부호(`'`)이고 바깥쪽이 글자면 강조로 인식 안 됨. 한국어는 조사가 붙어(`**'000'**을`) 대부분 이 조건에 걸림. 읽기 화면(react-markdown/micromark)과 에디터 로드(marked) 모두 실패
  - `src/components/wiki/MarkdownContent.tsx` — remarkPlugins에 `remark-cjk-friendly`(볼드/이탤릭) + `remark-cjk-friendly-gfm-strikethrough`(취소선) 추가, 5곳 반복되던 배열을 공용 상수로 정리. 렌더 측 수정이라 기존 저장 문서도 함께 복구됨
  - `src/app/edit/[...slug]/page.tsx` — 에디터 로드용 md→HTML 변환을 marked에서 unified 파이프라인(remark-parse → remark-gfm → cjk-friendly ×2 → remark-rehype `allowDangerousHtml` → rehype-raw → rehype-stringify)으로 교체. marked에는 CJK 확장이 없고, 방치 시 재편집에서 리터럴 `**`가 turndown에 `\*\*`로 이스케이프돼 문서가 영구 손상되므로 필수. 기존 후처리(`[^`→`&#91;^`, img `title="w=N"`→width)는 유지. `marked` 의존성 제거
  - 검증: 볼드/이탤릭/취소선 + 조사 케이스 렌더링 확인, 빈 줄(`&nbsp;` 단락)·각주 리터럴·raw HTML 표·색상 span·이미지 width 라운드트립 회귀 없음, `npm run build` 통과
- [TASK-039] 에디터 빈 줄(연속 Enter)이 저장 시 유실되는 문제 수정
  - `src/components/wiki/WikiEditor.tsx` — turndown 생성 옵션에 `blankReplacement` 추가. TipTap의 빈 단락(`<p></p>`)은 turndown이 blank 노드로 분류해 일반 규칙(addRule)보다 먼저 `\n\n`으로 치환하는데, 이게 인접 단락 구분과 합쳐지며 빈 줄이 통째로 유실됐음(본문·인용 모두). 마크다운 자체도 연속 빈 줄을 하나로 접기 때문에 빈 `<p>`를 렌더링에서 살아남는 `&nbsp;` 단독 줄로 저장하도록 변경. 검증: 본문/인용/연속 빈 줄 모두 보존, 재편집 라운드트립(마크다운 → marked.parse → TipTap → turndown) 안정(재로드된 `<p>&nbsp;</p>`도 blank 노드로 동일 처리), micromark(react-markdown) 렌더링에서 빈 문단 유지, 리스트·표·이미지 변환 회귀 없음

### Changed
- [TASK-002] 코드블록 가로 스크롤 → 자동 줄바꿈으로 변경
  - `src/components/wiki/WikiEditor.tsx` — 에디터 ProseMirror `pre` 스타일에서 `overflow-x-auto`를 `whitespace-pre-wrap` + `break-words`로 교체. 긴 코드가 좌우 스크롤 대신 컨테이너 너비에 맞춰 자동 줄바꿈됨(공백 없는 긴 토큰도 `overflow-wrap`으로 강제 줄바꿈)
  - `src/components/wiki/MarkdownContent.tsx` — 읽기 화면 `pre` 스타일에도 동일 규칙 적용해 편집/열람 화면 일관성 유지. 검증: 빌드 후 생성 CSS에 `white-space:pre-wrap`·`overflow-wrap:break-word` 규칙 포함 확인, `npm run build` 통과
  - `supabase/migrations/20260704000000_merge_policy_into_help.sql` — 신규. `포도위키:도움말` content를 편집방침 통합본(이용 목적·시작하기·문서 작성 규칙·에디터 사용법·인수인계 예시 구조·위반 시 조치·문의) 기반에 도움말 고유의 "자주 묻는 질문" 섹션을 더한 통합본으로 교체. 도움말의 원시 마크다운 문법 안내 섹션은 툴바 기반 에디터 설명과 충돌하여 제외. 다른 문서에 남은 편집방침 링크(`[포도위키:편집방침]`, `/w/포도위키:편집방침`)는 도움말로 치환하고, 중복되던 `포도위키:편집방침` 문서는 DELETE(revisions/edit_locks/deletion_requests는 ON DELETE CASCADE)
  - `src/app/page.tsx` — 빠른 링크에서 "편집방침" 항목 제거, "도움말" 링크만 유지
- [TASK-037] 목록 깊이별 마커 스타일 구분
  - `src/components/wiki/WikiEditor.tsx` — ProseMirror 목록 스타일에 중첩 깊이별 `list-style-type` 추가. 순서 목록은 1단계 `decimal` → 2단계 `lower-alpha` → 3단계 `lower-roman` → 4단계 이후 `decimal`, 순서 없는 목록은 `disc` → `circle` → `square` → `disc`. 기존에는 모든 깊이가 `1. 2. 3.`(ol) / `•`(ul)로 동일해 Tab으로 만든 하위 목록의 계층 구분이 안 됐음
  - `src/components/wiki/MarkdownContent.tsx` — 뷰어 `PROSE` 스타일에 동일한 깊이별 규칙 적용. 편집 화면과 열람 화면의 마커가 동일하게 표시됨
- [TASK-035] 공유 버튼을 탭 텍스트에서 아이콘 형태로 재배치
  - `src/components/wiki/ShareButton.tsx` — 트리거를 "공유" 텍스트 버튼에서 공유 아이콘(share SVG) 버튼으로 교체. `aria-label`/`title`/`aria-haspopup`/`aria-expanded` 접근성 속성과 hover 배경·포커스 링 추가. 드롭다운(링크 복사/공유하기) 로직은 그대로 유지
  - `src/app/w/[...slug]/page.tsx` — `ShareButton`을 보기/수정/역사 탭 바에서 분리해 문서 제목(h1) 우측 액션 영역으로 이동(`flex items-start justify-between`). 삭제 신청 버튼은 탭 바 우측에 그대로 유지
- [TASK-036] 포도위키:규칙 문서를 편집방침 하나로 통합
  - `supabase/migrations/20260702010000_merge_rules_into_policy.sql` — 신규. `포도위키:편집방침` content를 이용 목적·시작하기(가입/승인)·문서 작성 규칙·에디터 사용법·인수인계 예시 구조·위반 시 조치·문의를 아우르는 통합본으로 교체(기존 규칙 문서의 편집 규칙/편집 방법 + 편집방침의 목적/작성 지침 중복 제거 후 병합). 중복되던 `포도위키:규칙` 문서는 DELETE(revisions/edit_locks/deletion_requests는 ON DELETE CASCADE). 도움말 문서에 남아 있던 `포도위키:규칙` 예시 링크는 편집방침으로 치환
  - `src/app/page.tsx` — 빠른 링크에서 "편집 규칙"(`/w/포도위키:규칙`) 항목 제거, "편집방침" 링크만 유지

### Added
- 표 편집 툴바에 표 전체 삭제 버튼 추가
  - `src/components/wiki/WikiEditor.tsx` — 커서가 표 안에 있을 때 나타나는 표 툴바(행/열 추가·삭제) 끝에 구분선과 "표 ×" 버튼 추가. Tiptap `deleteTable()` 커맨드 연결. 기존에는 표 전체를 지우려면 행을 하나씩 삭제하거나 표 바깥까지 드래그 선택해야 했음
- [TASK-038] 툴바에 목록 들여쓰기/내어쓰기 버튼 추가 (노션 스타일)
  - `src/components/wiki/WikiEditor.tsx` — 번호 목록 버튼 옆에 내어쓰기(⇤)·들여쓰기(⇥) 버튼 추가. Tiptap `liftListItem('listItem')` / `sinkListItem('listItem')` 커맨드를 사용하고, `editor.can()` 판별로 실행 불가능한 상태(목록 밖이거나 더 이동할 수 없는 깊이)에서는 버튼 비활성화. 기존 Tab/Shift+Tab 키보드 조작은 그대로 유지(툴팁에 단축키 안내 병기)
  - `ToolbarBtn` 컴포넌트에 `disabled` prop 추가 — 비활성 시 흐린 색상 + `cursor-not-allowed` 처리, 클릭 무시
- [TASK-004] 스켈레톤 로딩 shimmer 애니메이션
  - `src/components/ui/Skeleton.tsx` — 신규 공용 스켈레톤 컴포넌트. `relative overflow-hidden bg-wiki-border/40 rounded` 위에 `.skeleton` 클래스를 얹어 shimmer 오버레이 적용
  - `src/app/globals.css` — `.skeleton::after`에 좌→우로 흐르는 `linear-gradient` 하이라이트 + `@keyframes shimmer`(translateX -100%→100%) 추가. 하이라이트 색은 `--wiki-shimmer` 변수로 라이트(흰색 0.7)/다크(흰색 0.07) 각각 정의. `prefers-reduced-motion: reduce` 시 애니메이션 비활성
  - `src/app/loading.tsx`, `src/app/search/loading.tsx`, `src/app/mypage/loading.tsx`, `src/app/recent/loading.tsx`, `src/app/edit/[...slug]/loading.tsx`, `src/app/w/[...slug]/loading.tsx` — 각 파일에 중복 정의돼 있던 로컬 `Skeleton`(`animate-pulse`)을 제거하고 공용 컴포넌트 import로 교체
- [TASK-003] 전역 Footer에 문의 이메일 노출
  - `src/components/layout/Footer.tsx` — 기존 저작권·CC 라이선스 줄에 이어 "문의: podostore1111@gmail.com" (mailto: 링크) 추가. Footer는 `src/app/layout.tsx`에서 공통 렌더되므로 대문 포함 전체 페이지 하단에 노출
- [TASK-002] 문서 열람 페이지 공유하기 버튼
  - `src/components/wiki/ShareButton.tsx` — 신규. 툴바 "공유" 버튼 클릭 시 드롭다운 팝오버 표시. "링크 복사"(Clipboard API로 문서 URL 복사 후 "복사됨!" 피드백, 2초 후 원복)와 "공유하기"(`navigator.share()` Web Share API — 모바일 OS 공유 시트에 카카오톡 등 자동 노출) 제공. `navigator.share` 미지원 환경(대부분의 데스크탑)에서는 마운트 후 `canNativeShare` 판별로 "공유하기" 항목을 숨겨 "링크 복사"만 노출. 바깥 클릭 시 팝오버 닫힘(`mousedown` 리스너)
  - `src/app/w/[...slug]/page.tsx` — 툴바 우측(`ml-auto`) 영역에 `ShareButton` 배치, 삭제 신청 버튼과 나란히 정렬. URL은 기존 `ogUrl`(`https://podo-wiki.vercel.app/w/${slug}`) 재사용
- [TASK-034] 문서 제목 자동 넘버링 (나무위키 스타일)
  - `src/lib/wiki/headings.ts` — `extractHeadings()`가 반환하는 각 헤딩에 `number` 필드 추가. 신규 `numberHeadings()`가 레벨을 스택 기반으로 추적해 상위 레벨이 중간에 생략돼도(예: h1 다음 바로 h3) `1.0.1`이 아닌 `1.1`처럼 부모의 실제 자식 순번을 이어받는 번호를 매김
  - `src/components/wiki/TableOfContents.tsx` — 목차 각 항목 앞에 번호 표시
  - `src/components/wiki/MarkdownContent.tsx` — 기존에는 h3만 react-markdown이 본문을 파싱하며 그때그때 렌더링했는데, 번호를 안전하게 매기기 위해 h1/h2처럼 `splitH3()`로 문서 파싱 단계에서 h3도 미리 구조화된 트리(h1 → h2 → h3)로 뽑아낸 뒤 번호를 부여하도록 변경. 렌더 중 상태를 공유하는 카운터 대신 파싱 단계의 순수 함수로 번호를 계산해 React StrictMode의 이중 렌더에도 번호가 어긋나지 않도록 함. 이 과정에서 더 이상 쓰이지 않게 된 범용 `H3`/`extractText` 컴포넌트는 제거
  - 번호 매김 시 h1 섹션의 intro(첫 h2 이전)에 h3가 먼저 나오는 경우, 그 h3가 형제 순번 한 칸을 이미 차지한 것으로 보고 이어지는 h2의 카운터를 그만큼 이어받게 해 번호 중복(예: h3와 h2가 똑같이 "1.1"이 되는 문제)을 방지
  - 문서 최상단 h1 제목(`src/app/w/[...slug]/page.tsx` 문서 타이틀)에는 번호를 붙이지 않고, 본문 내부 제목에만 적용
- [TASK-032] 각주 삭제 확인 모달 + 자동 재넘버링
  - `src/components/wiki/WikiEditor.tsx` — `FootnoteDecorator`에 `filterTransaction`/`appendTransaction`을 추가. `collectFootnotes()`로 문서 내 각주 참조/정의 위치를 스캔하고, `applyFootnoteRenumber()`로 정의 없는 참조·참조 없는 정의를 정리한 뒤 남은 각주를 본문 등장 순서대로 1..n 재넘버링. 정의는 항상 최상위 단락으로만 생성되므로 최상위만 검사하지만, 참조는 목록·표 등 어디에나 있을 수 있어 `doc.descendants`로 문서 전체를 재귀 스캔하도록 함 — 처음엔 참조도 최상위 단락만 검사해서, 목록(`<ul><li>`) 안에 있는 실제 각주 참조(예: 광운극예술연구회 문서의 각주)를 못 찾고 "참조 없는 고아 정의"로 오인해 아무 편집에서나 삭제해버리는 심각한 버그가 있었음 (jsdom + 실제 TipTap Editor로 재현·검증)
  - `src/components/wiki/WikiEditor.tsx` — 본문 참조(`[^N]`)는 그대로인 채 정의만 사라지는 경우는 자동 허용(캐스케이드 삭제), 정의는 남았는데 참조만 사라지려는 트랜잭션(백스페이스/선택 삭제 포함)은 `filterTransaction`이 차단하고 삭제 확인 모달을 띄우도록 분기
  - `src/components/wiki/WikiEditor.tsx` — 본문의 `[^N]` 마커 클릭 시 `handleClick`으로 감지해 내용 미리보기 + 수정/삭제 팝오버(`FootnoteRefPopover`)를 표시. 리액트 state 갱신은 `useMemo`로 만든 안정된 `EventTarget` 인스턴스를 통해 플러그인 → 컴포넌트로 이벤트 전달(React Compiler의 ref 불변성 규칙 때문에 `useRef` 콜백 패턴 대신 채택)
  - `src/components/wiki/FootnoteRefPopover.tsx` — 신규. 각주 클릭 팝오버(내용 보기/수정/삭제)
  - `src/components/wiki/FootnoteDeleteConfirmModal.tsx` — 신규. "이 각주를 삭제할까요?" 확인 모달 — 팝오버의 삭제 버튼과 백스페이스 차단 시 양쪽에서 공용으로 사용
  - `src/components/wiki/WikiEditor.tsx` — `handleFootnoteConfirm`(각주 삽입)을 참조·정의 두 번의 `.run()` 호출에서 하나의 체인으로 합침. 두 트랜잭션으로 나뉘어 있으면 정의가 아직 없는 첫 트랜잭션 직후 재넘버링 로직이 방금 삽입한 참조를 고아로 보고 지워버리는 문제가 있어 수정. 체인 내 순서는 참조(`insertContent`)를 먼저 넣고, 정의는 `.command()` 콜백에서 그 시점의 `tr.doc.content.size`에 직접 `tr.insert`로 추가 — `insertContentAt`은 기본적으로 삽입 후 커서를 삽입된 내용 뒤로 옮기므로(`updateSelection: true`), 정의를 먼저 넣으면 뒤이은 참조 삽입이 원래 커서 위치 대신 정의 문단 안에 들어가버려 각주가 추가되지 않는 것처럼 보이는 문제가 있었음 (ProseMirror 시뮬레이션 스크립트로 재현·검증)

- [TASK-001] 뷰어 각주 호버 툴팁
  - `src/components/wiki/MarkdownContent.tsx` — 각주 번호(`[N]`)에 마우스 오버 시 내용이 팝업 툴팁으로 표시. `FootnoteTooltip` 컴포넌트 추가. `components` 객체를 `MarkdownContent` 내부에서 `useMemo`로 생성해 `fnMap` 기반 접근 가능하도록 구조 개선. `CollapsibleH1/H2`에 `components` prop 전달로 섹션 내 각주도 동작
  - `src/components/wiki/MarkdownContent.tsx` — 섹션이 없는 문서에서 `content` 대신 `processed`를 렌더링하도록 버그 수정 (각주 refs HTML 미적용 문제)

- [TASK-002] 에디터 본문/각주 영역 구분 시각화
  - `src/components/wiki/WikiEditor.tsx` — TipTap `FootnoteDecorator` extension 추가. ProseMirror 플러그인으로 `[^N]:` 패턴 단락에 `fn-def` / `fn-def-first` CSS 클래스를 decoration으로 부여
  - `src/app/globals.css` — `.ProseMirror p.fn-def` (연보라 배경, 작은 글자, muted 색상), `.fn-def-first` (상단 구분선) 스타일 추가

- [TASK-003] 에디터 내 각주 참조 텍스트 강조
  - `src/components/wiki/WikiEditor.tsx` — `FootnoteDecorator`에서 본문 단락 내 `[^N]` 패턴에 `fn-ref` inline decoration 부여
  - `src/app/globals.css` — `.fn-ref` (보라 색상 + 연보라 배경) 스타일 추가

### Changed
- 위키 `포도위키:규칙` 문서를 현재 툴바 기반 WYSIWYG 편집기 구조에 맞게 갱신
  - `supabase/migrations/20260702000000_update_rules_doc.sql` — 신규. 이미 시드가 적용된 DB에도 반영되도록 `포도위키:규칙` 문서 content를 UPDATE. 기존 콘텐츠 정책(사실 기반·비하 금지·개인정보·저작권)은 유지하고, 실제 툴바 기능(글자 서식·글자색, 제목/목차 자동 번호, 목록·인용·코드블록·구분선, 링크·이미지 업로드·표, 각주 자동 넘버링, 편집 요약·편집 잠금·역사 되돌리기)을 반영한 "편집 방법" 섹션 추가. 마크다운 직접 입력을 전제하던 서술을 걷어냄
  - `supabase/migrations/20260530000002_seed_documents.sql` — 신규 설치 DB에도 동일 내용이 시드되도록 `포도위키:규칙` 시드 본문 동기화
- [TASK-033] 에디터 각주 정의 단락을 본문에서 숨김
  - `src/app/globals.css` — `.ProseMirror p.fn-def`를 배경색 강조 스타일에서 `display: none`으로 변경. `[^N]` 참조 클릭 시 뜨는 팝오버로 보기/수정/삭제가 모두 가능해져, 본문 하단에 `[^N]: 내용` 원본 텍스트를 그대로 노출할 필요가 없어짐(TASK-002가 추가했던 시각 강조 스타일을 대체). 문서 데이터·저장·뷰어 렌더링에는 영향 없음
  - `src/components/wiki/WikiEditor.tsx` — 더 이상 의미 없어진 `fn-def-first`(연속 정의 단락 중 첫 번째 구분) 클래스 부여 로직 제거
- [TASK-031] 에디터 본문 내 각주 참조 마커 배지 스타일로 강화
  - `src/app/globals.css` — `.fn-ref`를 연보라 배경의 텍스트 강조에서 보라색 배경 + 흰 글씨(다크모드는 배경색 유지, 텍스트를 `--wiki-bg`로) 알약형 배지(`border-radius: 9999px`)로 변경, `font-weight: 600` 추가해 본문 텍스트와의 구분을 강화
- [TASK-030] 페이지 하단 각주 목록 클릭 이동 방식 변경
  - `src/components/wiki/MarkdownContent.tsx` — 각주 목록을 `<ol class="list-decimal"><li value>` 네이티브 넘버링 + `↩` 역참조 링크 방식에서, `<ol class="list-none">` 기반으로 각 항목 앞에 `[N]` 텍스트를 `<a href="#fnref-${label}">`로 감싸 렌더링하는 방식으로 변경. `↩` 화살표 제거, `[N]` 클릭 시 해당 각주가 참조된 본문 위치로 스크롤 이동
- [TASK-004] 에디터 툴바 각주 버튼 명확화
  - `src/components/wiki/WikiEditor.tsx` — 각주 삽입 버튼 레이블을 `[^]` → `각주[¹]`로 변경해 기능을 한눈에 인식 가능하도록 개선

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
