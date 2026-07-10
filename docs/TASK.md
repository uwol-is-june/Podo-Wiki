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

> 모바일 앱(읽기 전용 v1, Expo) 출시 트랙 — TASK-040부터 순서대로 진행. 상세 계획은 승인된 플랜 참조.

- [ ] [TASK-042] (O) 마크다운 렌더러 스파이크 (최대 리스크 우선) → `MarkdownContent.tsx`의 각주 전처리·섹션 분할·넘버링을 `mobile/src/lib/markdown/structure.ts`로 포팅, unified→HTML 파이프라인(`renderHtml.ts`) + CSS/인라인 JS 템플릿(접기·각주 탭 툴팁·링크 postMessage 가로채기) + `WikiWebView` 컴포넌트. 표·각주·`w=` 이미지·인라인 HTML 포함 실문서를 웹과 나란히 비교해 파리티 검증. 실패 시 접근 재검토.
- [ ] [TASK-043] (S) 모바일 데이터 레이어 → `supabase.ts`(anon key, `persistSession:false`), `types.ts`·`slug.ts`·`headings.ts`·`faq.ts` 복사(`// Copied from ...` 헤더), `api.ts`에 getDocument/suggestDocuments/searchDocuments(ilike 2회 병합)/getRecentRevisions/getRandomSlug/getHistory/getRevision(Pair)/getFaqItems/getHomeData, react-query 프로바이더. 주의: 리비전 코멘트 컬럼은 `comment`, 편집자 이름은 profiles RLS로 불가 → `editor_id.slice(0,8)+'…'` 익명 표기.
- [ ] [TASK-044] (S) 탭 화면 3종: 홈·검색·최근 변경 → 홈(단체 바로가기 그리드는 웹 절대 URL 로고, 총 문서 수, 최근 변경 5건, FAQ 프리뷰 4건 — 승인 회원 수는 service role 필요라 제외), 검색(디바운스 서제스트 + 결과 + 스니펫), 최근 변경(useInfiniteQuery 무한 스크롤, PAGE_SIZE 20, pull-to-refresh).
- [ ] [TASK-045] (S) 문서 보기 화면 `app/w/[slug].tsx` → WikiWebView 통합, 네이티브 TOC 바텀시트(`extractHeadings` + `injectJavaScript` 스크롤), 브레드크럼(getExistingSlugs), 내부 링크 → 네이티브 push / 외부 링크 → 브라우저, `포도위키:FAQ` → `/faq` 리다이렉트, not-found 상태. 슬러그 이동은 반드시 `router.push({pathname, params})` 객체 형태(한글·`/`·`:` 인코딩).
- [ ] [TASK-046] (S) 히스토리·리비전·diff 화면 → 히스토리(바이트 수·증감, 2개 선택 → 비교), 리비전 보기(WikiWebView 재사용), diff(`diff@9` `diffLines`, edited_at 기준 older/newer 정렬, 네이티브 +/− 행 렌더).
- [ ] [TASK-047] (S) FAQ + 더보기 탭 → FAQ 아코디언(parseFaqItems), 랜덤 문서 액션, 문서 신고/문의(mailto: podostore1111@gmail.com — 애플 UGC 1.2 대비), 앱 버전·개인정보처리방침 링크.
- [ ] [TASK-048] (S) 앱 아이덴티티·폴리시 → 아이콘 1024×1024(투명도 제거 — 애플 알파 거절), adaptive-icon, 스플래시(라이트 `#f7f5fc`/다크 `#130d1f`), 전 화면 로딩·빈·에러 상태, 날짜 Asia/Seoul 포맷, 다크모드 점검.
- [ ] [TASK-049] (S) EAS 빌드 설정 + 실기기 검증 → `eas init`, `eas.json`(preview: internal·android apk / production: autoIncrement), EAS 관리형 인증서로 양대 preview 빌드, 실기기 확인.
- [ ] [TASK-050] (S) 스토어 리스팅 준비 → iOS: ASC 앱 생성("포도위키", 카테고리 참고), 6.9" 스크린샷 3~5장, App Privacy "데이터 수집 안 함", 심사 노트(읽기 전용·로그인 없음·편집은 웹 승인 회원만) / Android: Play Console 앱 생성, 512 아이콘 + 1024×500 피처 그래픽 + 스크린샷 2장+, 데이터 보안 "수집 없음", IARC 등급, 카테고리 도서/참고자료.
- [ ] [TASK-051] (S) 제출 및 심사 대응 → iOS: `eas submit -p ios` → TestFlight → 심사. Android: 첫 AAB 수동 업로드 → 내부 테스트 → (개인 계정이면 비공개 12명×14일) → 프로덕션 심사. 애플 4.2 반려 시 "네이티브 화면 + 본문만 로컬 생성 HTML" 소명. ⚠️ 사용자 확인: Play 계정 유형(2023-11 이후 개인 계정이면 14일 규정), App Store "포도위키" 이름 선점 여부.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
