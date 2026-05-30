@docs/AGENTS.md

# Podo Wiki

## 프로젝트 핵심 요약
공연단체들끼리 인수인계 문서를 공유하는 위키 플랫폼.
나무위키 형태이나, 수정은 회원가입된 사용자만 가능.

## 배포 URL
https://podo-wiki.vercel.app

## 지금 할 일
→ [TASK.md](docs/TASK.md) 참조

## 아키텍처
→ [ARCHITECTURE.md](docs/ARCHITECTURE.md) 참조

## 코딩 규칙
- 언어: TypeScript (Node.js 24)
- 프레임워크: Next.js 16 (App Router), Tailwind CSS v4
- 커밋: feat / fix / docs / refactor / chore 타입 prefix
- DB/Auth: Supabase

---
<!-- 아래는 Claude Code에게 주는 행동 지침 → 프로젝트마다 유지 -->

## Claude에게

- 작업 시작 전 반드시 docs/TASK.md를 먼저 읽어
- 새 기능 구현 완료 시 docs/CHANGELOG.md Unreleased 섹션에 추가해
- 태스크 완료 시 docs/TASK.md에서 해당 항목 삭제하고 docs/CHANGELOG.md로 이동해
- 아이디어가 생기면 docs/BACKLOG.md에 추가해:
  - 구현 방법이 명확하면 → **High-fi**에 추가
  - 불명확하거나 결정이 필요한 것 있으면 → **Low-fi**에 추가하고 필요한 질문을 → 로 함께 작성해
  - Low-fi 항목의 모든 질문의 답변이 달리면 → 답변 내용을 배경에 반영해서 **High-fi**로 이동해
- docs/ARCHITECTURE.md는 구조가 바뀔 때만 업데이트해
