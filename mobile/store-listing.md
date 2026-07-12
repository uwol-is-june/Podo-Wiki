# 포도위키 스토어 리스팅 자료 (TASK-050)

양대 스토어 등록 화면에 그대로 붙여 넣는 자료. 수정 시 양쪽 일관성 유지.

## 공통

- 앱 이름: **포도위키** (선점 시: 포도위키 - 공연단체 인수인계 위키)
- 번들/패키지 ID: `com.podowiki.app`
- 개인정보처리방침 URL: https://podo-wiki.vercel.app/privacy
- 지원 연락처: podostore1111@gmail.com
- 웹사이트: https://podo-wiki.vercel.app

## 짧은 설명 (Play 80자 제한 / iOS 부제 30자)

- Play 짧은 설명: `공연단체 인수인계 문서를 언제든 열람하는 위키 — 로그인 없이 바로 읽기`
- iOS 부제(Subtitle): `공연단체 인수인계 위키 뷰어`

## 전체 설명 (양쪽 공용)

```
포도위키는 공연단체들이 기수를 넘어 쌓아온 인수인계 문서를 한곳에 모은 위키입니다.
이 앱으로 언제 어디서든 문서를 열람하세요 — 회원가입도 로그인도 필요 없습니다.

주요 기능
• 문서 열람: 단체별 인수인계 문서를 원본 그대로 (표, 각주, 목차 지원)
• 검색: 문서 제목과 본문 전체에서 빠르게 찾기
• 최근 변경: 어떤 문서가 새로 수정됐는지 한눈에
• 문서 역사: 버전별 기록과 두 버전 비교(변경점 표시)
• 자주 묻는 질문: 공연단체 운영에서 자주 나오는 질문 모음
• 다크 모드 지원

문서 작성·편집은 포도위키 웹사이트에서 관리자 승인을 받은 단체 회원만 할 수 있어,
검증된 내용만 공유됩니다. 앱은 어떤 개인정보도 수집하지 않습니다.
```

## iOS 전용

- 키워드(100자): `위키,공연,연극,극회,동아리,인수인계,대학연극,공연단체,문서,아카이브`
- 카테고리: 참고 (Reference) / 보조: 교육 (Education)
- 연령 등급 설문: 전부 "없음" → 4+ 예상
- App Privacy: **"데이터 수집 안 함" (Data Not Collected)** — 로그인·분석·광고·추적 전무
- 심사 노트 (App Review Information → Notes):

```
Podo Wiki is a READ-ONLY viewer for podo-wiki.vercel.app, a Korean wiki where
university performing-arts clubs share handover documents between generations.

- No login or account exists in this app. All content is publicly readable.
- Content is NOT loaded as a remote website: the app renders documents natively
  from a database (Supabase), with native tabs, search, history and diff screens.
  Only the article body is displayed in a WebView using locally generated HTML.
- User-generated content is moderated: documents can only be written/edited on
  the website by members individually approved by administrators. The app
  includes a "Report document" contact option in the More tab.
- No demo account is needed (no login).
```

## Android 전용 (Play Console)

- 카테고리: 도서/참고자료 (Books & Reference)
- 짧은 설명: 위 80자 문구
- 앱 액세스 권한: **"모든 기능이 특별한 액세스 없이 사용 가능"** (로그인 없음)
- 광고: 없음
- 콘텐츠 등급(IARC 설문): 폭력·선정성·도박 등 전부 "아니요" → 전체이용가 예상
- 타겟층: 만 13세 이상 (아동 대상 아님)
- 데이터 보안 양식: **수집하는 데이터 없음, 공유하는 데이터 없음, 암호화 해당 없음(수집 자체가 없음), 삭제 요청 해당 없음**
- 뉴스 앱 아님, 코로나 추적 앱 아님, 정부 앱 아님

## 에셋 체크리스트

| 에셋 | 규격 | 상태 |
| --- | --- | --- |
| iOS 스크린샷 | 6.9" 1320×2868 (또는 2868×1320), 3~10장 | 폰 스크린샷 → 리사이즈 예정 |
| Play 스크린샷 | 최소 2장, 320~3840px, 16:9~9:16 | 동일 원본 사용 |
| Play 앱 아이콘 | 512×512 PNG (32bit) | icon.png에서 생성 |
| Play 피처 그래픽 | 1024×500 PNG/JPG | 생성 예정 |

스크린샷 추천 구성(5장): ① 홈 ② 문서 본문(표·각주 보이는 문서) ③ 목차 시트 ④ 검색 결과 ⑤ 버전 비교(diff) — 라이트 모드 기준, +다크 모드 1장 선택.
