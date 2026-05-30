# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
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
