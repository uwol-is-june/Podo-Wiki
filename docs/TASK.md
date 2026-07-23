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

- [ ] [TASK-053] (O) Supabase 서울 리전 이전 — **DB·웹·앱 전환 완료, 옛 프로젝트 정리(⑧)만 남음**. 완료분(①~⑦, CHANGELOG 참조): 서울 새 프로젝트 `ywuoaxfqujtazfaidxex` 생성, 전체 덤프·복원(데이터·auth 해시·storage·RLS·함수 전부 수 대조 일치), 이미지 URL 새 도메인 치환, env 교체(.env.local·mobile/.env·Vercel·EAS 3환경), Auth 설정(Site URL·Redirect URLs·커스텀 SMTP[[podosangjeom@gmail.com 계정]]·Rate Limit 30) 복제·SMTP 발송 테스트 통과, 웹 프로덕션 서울 전환·검증, **앱 1.0.2 양대 스토어 출시(2026-07-21, iOS build 3 / Android vc 5, R8 검증·mapping 포함 확인)**. **남은 것 — ⑧ 옛 프로젝트 정리**: 1.0.2 출시(7/21)로부터 **사용자 확산 대기(1~2주, 옛 프로젝트 API 사용량이 0에 수렴하는지로 판단)** → 옛 싱가포르 프로젝트 `rskzwzvudshirfyczxtw` 삭제 → devtier_ `damqewznmusjshxfeotd` 재개(슬롯 확보 위해 일시정지 중, 무료 플랜 활성 2개 제한). 주의: 구버전 앱(iOS 1.0.0/Android 1.0.1)은 OTA 미사용이라 URL이 빌드에 박혀 있어, 확산 전 싱가포르 삭제 시 구버전 앱 전면 먹통. 참고: Vercel Preview 환경의 `SUPABASE_SERVICE_ROLE_KEY`는 CLI 플러그인 버그로 미반영 → 대시보드에서 수동 추가 필요(Preview 배포 쓸 경우).

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
