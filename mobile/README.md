# 포도위키 모바일 (읽기 전용 v1)

포도위키(https://podo-wiki.vercel.app)의 iOS/Android 앱. Expo(React Native) + expo-router.

## 개발

```bash
npm install
cp .env.example .env   # Supabase URL/anon key 입력 (웹 .env.local과 동일 값)
npx expo start         # Expo Go로 실기기에서 확인
```

## 구조

- `src/app/` — expo-router 라우트 (하단 탭: 홈/검색/최근 변경/더보기 + 문서 스택)
- `src/lib/` — Supabase 쿼리, 웹에서 복사한 위키 헬퍼(slug/headings/faq — 헤더 주석 참조)
- `src/lib/markdown/` — 마크다운 → HTML 파이프라인 (WebView 렌더링용)
- `src/theme/colors.ts` — 웹 globals.css의 --wiki-* 토큰 복사본

빌드/배포는 EAS 사용 (`eas.json`). 읽기 전용이라 로그인 없음 — Supabase anon key만 사용.
