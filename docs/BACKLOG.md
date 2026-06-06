# Backlog

> 포맷: `- [ ] [BACK-NNN] 태스크 이름 → 배경/이유`
> TASK.md로 이동할 때 번호를 TASK-NNN으로 재부여

---

## High-fi
> 지금 바로 TASK.md로 옮겨서 구현 가능한 항목

- [ ] [BACK-001] RevisionList 모바일 레이아웃 개선 → 고정 너비 컬럼(r번호 w-7, 날짜 w-36, 바이트 w-16)이 375px 화면에서 가로 스크롤 유발. 모바일에서 2행 구성으로 변경 — 1행: r번호+날짜, 2행: 편집자+바이트차이+요약. `src/components/wiki/RevisionList.tsx`
- [ ] [BACK-002] MarkdownContent 반응형 타이포그래피·여백 → h1 text-2xl, h2 text-xl, mt-8 등이 모바일에서 과도하게 큼. sm: 브레이크포인트로 모바일엔 한 단계 작은 크기 적용, 상하 여백도 축소. `src/components/wiki/MarkdownContent.tsx` (PROSE 상수)
- [ ] [BACK-003] Header 모바일 터치 타겟 확대 → 모바일 아이콘 버튼이 w-9 h-9(36px)로 권장 최소치 44px 미달. w-11 h-11(44px)로 확대. `src/components/layout/Header.tsx`
- [ ] [BACK-004] 에디터 모바일 기본 최적화 → min-h-[400px] 고정으로 모바일 뷰포트 대부분을 차지하고 sticky top-[50px] 툴바가 컨텐츠를 가림. min-h를 모바일에서 [200px]로 축소, 툴바 sticky offset 조정. `src/components/wiki/WikiEditor.tsx`
- [ ] [BACK-005] 에디터 툴바 가로 스크롤 방식으로 전환 → 툴바 버튼이 많아 모바일에서 2~3줄로 wrapping됨. 나무위키 모바일 에디터와 동일하게 가로 스크롤 방식으로 변경 (`flex-nowrap overflow-x-auto`). 버튼을 숨기면 기능이 제한되고 유지보수 부담이 생기므로 모든 버튼을 유지하되 한 줄로 스크롤. `src/components/wiki/WikiEditor.tsx`

---

## Low-fi
> 추가적인 구체화가 필요한 항목
> 아래 질문의 답변이 달리면 High-fi로 이동

_없음_

---

## 우선순위 규칙

| 상황 | 행동 |
|------|------|
| 새 아이디어 | 구현 방법이 명확하면 → High-fi, 불명확하면 → Low-fi (질문 함께 작성) |
| Low-fi 질문 답변 완료 | 해당 항목을 High-fi로 이동, 답변 내용을 배경에 반영 |
| High-fi 항목 착수 | TASK.md로 이동 후 번호를 TASK-NNN으로 재부여 |
