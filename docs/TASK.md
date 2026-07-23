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

- [ ] [TASK-058] (S) 앱 문서 화면 상단 목차/역사 버튼 레이아웃 개선 → **환경: iOS에서 확인**. 버튼 크기와 안쪽 글자·레이아웃이 어색하고 서로/제목과 겹침. 위치: [mobile/src/app/w/[slug].tsx](mobile/src/app/w/[slug].tsx) `headerRight`의 목차·역사 버튼 (L70~86), 스타일 `headerActions: { flexDirection: 'row', gap: 18 }` · `headerAction: { fontSize: 15 }` (L155~156). 현재 네이티브 헤더(`Stack.Screen` headerRight)에 **패딩·터치타깃 없는 plain `Text`**만 들어가 있어, 긴 문서 제목(headerTitle)과 우측 액션 텍스트가 iOS 네이티브 헤더에서 충돌·겹침 추정. 개선 방향: ① 버튼에 적절한 터치 영역/패딩(또는 칩 형태) 부여해 정렬 정돈 ② 제목이 길 때 truncation(ellipsize)해서 우측 액션과 안 겹치게, 필요시 `headerTitle` 커스텀 ③ iOS·Android 양쪽 헤더에서 시각 확인. Expo SDK 57 헤더 옵션 문서(https://docs.expo.dev/versions/v57.0.0/) 참고.

---

## 구체화 필요

> 구현 방법이 불명확하거나 결정이 필요한 아이디어.
> 필요한 질문을 → 로 함께 작성하고, 답변이 달리면 배경에 반영해서 **대기 중**으로 이동 (이때 모델 표기 (O|S) 부여).

_없음_
