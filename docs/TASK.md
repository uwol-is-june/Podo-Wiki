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

- [ ] [TASK-056] (S) **(긴급)** 안드로이드 크래시 픽스 1.0.1 스토어 제출 → 갤럭시 제보(2026-07-18) "뭐든 누르면 튕김". **원인 확정**(에뮬레이터 재현 + logcat): `wiki-webview.tsx`의 `decelerationRate="normal"` — Android 신아키텍처 codegen이 Double 강제 캐스팅하며 `ClassCastException`으로 WebView 생성 즉시 크래시(문서·FAQ 화면 전부 WebView라 모든 콘텐츠 터치에서 튕김, 탭 바는 정상. iOS는 문자열 허용이라 무관). **코드 수정 완료 + Android 16 에뮬레이터 릴리스 빌드로 전 화면(문서·목차·역사·FAQ·최근 변경·검색·더보기) 검증 완료**. 남은 일: `app.json` version 1.0.1로 올리고 `eas build -p android --profile production` → `eas submit -p android` (versionCode는 autoIncrement). iOS는 영향 없어 제출 불필요. TASK-053(서울 리전 이전)과 묶어 한 번에 낼지 판단 — 단 크래시가 전면 장애 수준이므로 단독 선제출 권장.

- [ ] [TASK-053] (O) Supabase 서울 리전 이전 → 현재 ap-southeast-1(싱가포르)이라 느림. **착수 조건: 양대 스토어 심사 통과 후** (심사 중인 앱 바이너리가 싱가포르 URL을 사용하므로 옛 프로젝트를 먼저 건드리면 안 됨). 절차: ① 사용자가 서울(ap-northeast-2) 새 프로젝트 생성 ② 전체 덤프·복원(스키마+데이터+RLS+함수+auth 사용자 — 비밀번호 해시 보존) ③ 데이터 검증(문서·리비전·profiles 수 대조) ④ env 교체(Vercel·.env.local·mobile/.env·EAS env 3개 환경) ⑤ **새 프로젝트 Auth 설정 복제** (DB 덤프로 안 옮겨짐) — ⑤-1 URL Configuration: Site URL `https://podo-wiki.vercel.app`, Redirect URLs `https://podo-wiki.vercel.app/**`·`http://localhost:3000/**` (localhost 폴백 사고 재발 방지) ⑤-2 커스텀 SMTP: Gmail(podostore1111) 앱 비밀번호로 smtp.gmail.com:587 연결 + Rate Limits 이메일 시간당 30 (내장 메일 시간당 2~4통 제한 사고 재발 방지) ⑥ 웹 재배포 ⑦ 앱 1.0.1 빌드·스토어 업데이트 제출 ⑧ 1.0.1 확산 후(1~2주) 옛 프로젝트 정리. 이사 중 웹 편집 일시 중지 필요.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
