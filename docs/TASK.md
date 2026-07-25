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

- [ ] [TASK-061] (S) Vercel Preview 환경변수 2개 대시보드 추가 → CLI 플러그인 버그(all-preview-branches 비대화형)로 Preview 환경에만 미반영된 것 정리. Production은 정상. **Preview 배포를 쓸 때만 필요** (안 쓰면 무시 가능). Vercel 대시보드 → podo-wiki → Settings → Environment Variables → Preview에 추가: `NEXT_PUBLIC_SITE_URL` = `https://wiki.podo-store.com`, `SUPABASE_SERVICE_ROLE_KEY` = Production과 동일 값.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
