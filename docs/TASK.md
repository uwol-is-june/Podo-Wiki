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

- [ ] [TASK-053] (O) Supabase 서울 리전 이전 — **거의 완료, 사용자 대시보드 작업 2개만 남음**. 완료분(CHANGELOG 참조): 서울 `ywuoaxfqujtazfaidxex`로 DB·storage·Auth 전체 이관·검증, env 교체, 웹 프로덕션 서울 전환, 앱 1.0.2 양대 스토어 출시(7/21), **옛 싱가포르 `rskzwzvudshirfyczxtw` 삭제(7/21, 복구불가)·로컬 repo 서울로 재링크**. **남은 것(사용자 대시보드)**: ① devtier_ `damqewznmusjshxfeotd` 재개 — Restore 클릭(싱가포르 삭제로 슬롯 비었음). CLI 재개 명령 없고 Management API 토큰이 보안 분류기로 차단돼 Claude가 못 함. ② Vercel Preview의 `SUPABASE_SERVICE_ROLE_KEY` 수동 추가(CLI 플러그인 버그, Preview 배포 쓸 경우만). 주의: 삭제로 구버전 앱(1.0.0/1.0.1) 사용자는 1.0.2 업데이트 전까지 먹통.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
