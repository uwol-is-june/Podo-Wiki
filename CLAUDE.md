@docs/AGENTS.md

# Podo Wiki

공연단체들끼리 인수인계 문서를 공유하는 위키 플랫폼.
나무위키 형태이나, 수정은 회원가입된 사용자만 가능.

- 배포: https://podo-wiki.vercel.app
- 할 일: [docs/TASK.md](docs/TASK.md)
- 아키텍처: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (구조가 바뀔 때만 업데이트)

## 코딩 규칙

- 언어: TypeScript (Node.js 24)
- 프레임워크: Next.js 16 (App Router), Tailwind CSS v4
- DB/Auth: Supabase
- 커밋: feat / fix / docs / refactor / chore 타입 prefix

## 태스크 관리 (docs/TASK.md 하나로 관리 — BACKLOG.md는 폐지됨)

- 작업 시작 전 반드시 docs/TASK.md를 먼저 읽어
- 모든 태스크에는 권장 모델을 표기해:
  - **(O)** = Opus — 설계 판단, 여러 파일에 걸친 구조 변경, 까다로운 디버깅
  - **(S)** = Sonnet — 구현 방법이 명확한 단순 구현/수정
- 새 아이디어가 생기면 docs/TASK.md에 추가해:
  - 구현 방법이 명확하면 → **대기 중**에 추가 (모델 표기 (O|S) 포함)
  - 불명확하거나 결정이 필요하면 → **구체화 필요**에 추가하고 필요한 질문을 → 로 함께 작성해
  - 구체화 필요 항목의 모든 질문에 답변이 달리면 → 답변을 배경에 반영하고 모델 표기를 부여해서 **대기 중**으로 이동해
- 태스크 완료 시 docs/TASK.md에서 삭제하고 docs/CHANGELOG.md Unreleased 섹션으로 이동해
