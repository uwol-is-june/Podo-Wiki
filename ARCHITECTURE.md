# Architecture

## 1. 시스템 개요

공연단체 인수인계 위키 플랫폼. 나무위키 형태의 문서 시스템으로,
회원가입된 사용자만 문서를 생성·수정할 수 있다.

---

## 2. 컴포넌트 구조

```
Podo-Wiki/
├── src/
│   ├── app/          # Next.js App Router 페이지
│   └── lib/
│       └── supabase/ # Supabase 클라이언트 (client.ts / server.ts)
├── public/           # 정적 파일
└── ...
```

| 컴포넌트 | 역할 | 위치 |
|----------|------|------|
| Next.js App Router | 페이지 라우팅, SSR/SSG | `src/app/` |
| Supabase Client | 브라우저 환경 DB/Auth 접근 | `src/lib/supabase/client.ts` |
| Supabase Server | 서버 환경 DB/Auth 접근 | `src/lib/supabase/server.ts` |

---

## 3. 데이터 흐름

```
사용자 → Next.js (Vercel) → Supabase (DB + Auth)
```

- 인증: Supabase Auth (미정: 이메일 / 소셜 로그인)
- 문서 저장: Supabase PostgreSQL
- 파일/이미지: Supabase Storage (필요 시)

---

## 4. 주요 설계 결정 (ADR)

### ADR-001: 회원제 편집 모델
- **결정**: 로그인한 회원만 문서 생성·수정 가능, 비회원은 읽기만 가능
- **이유**: 공연단체 내부 인수인계 문서이므로 품질 관리 필요
- **트레이드오프**: 진입 장벽이 생기지만 스팸·훼손 방지

---

## 5. 외부 연동

| 서비스 | 용도 | 인증 방식 |
|--------|------|-----------|
| Supabase | DB, Auth, Storage | NEXT_PUBLIC_SUPABASE_URL + ANON_KEY |
| Vercel | 호스팅/배포 | GitHub 연동 |
