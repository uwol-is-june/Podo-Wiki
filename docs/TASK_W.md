# Tasks — 웹 전용 (Next.js / `src/`)

## 진행 중

- [ ] [TASK-073] (S) 회원가입 인증 메일이 스팸메일처럼 보이는 문제
  → **배경**: 사용자 제보 "인증 메일이 너무 스팸 같다". **스팸함에 들어간다는 뜻이 아니라 메일 생김새·내용이 스팸처럼 보인다는 뜻**(최초 조사 때 배달 문제로 오독해 범위를 넓게 잡았음 → 아래 진단 ④가 실제 과제, ①~③은 부수적으로 발견한 별건)
  → 진단 ④: 템플릿이 보라색 풀블리드 배너 + 🍇 이모지 + 큰 CTA = 마케팅 뉴스레터 레이아웃. 트랜잭션 메일은 담백할수록 신뢰감이 큼. **← 이게 사용자가 말한 문제**
  → 진단 ①: 커스텀 SMTP가 개인 Gmail 계정(`podosangjeom@gmail.com`) — `From:`이 `gmail.com`이라 브랜드 도메인과 정렬(alignment)이 아예 없음
  → 진단 ②: 발신 도메인(`gmail.com`)과 본문 링크 도메인이 전부 다름. 인증 버튼이 `ywuoaxfqujtazfaidxex.supabase.co`(랜덤 서브도메인) → `podo-wiki.vercel.app` → 308 → `wiki.podo-store.com`으로 3단 이동. 필터 입장에서는 피싱 패턴
  → 진단 ③: `podo-store.com`은 Zoho 메일 + SPF(`include:zohomail.com`) + DKIM(`zmail` 셀렉터)이 이미 살아있는데 발송에 안 쓰고 있었음. **DMARC 레코드만 없음**
  → **완료분**: 템플릿 2종 톤다운·원문 URL 병기·푸터 도메인 정정(`supabase/templates/`) / Supabase Site URL·Redirect URLs 새 도메인 반영 / 로컬·Vercel 프로덕션 `NEXT_PUBLIC_SITE_URL`을 `https://wiki.podo-store.com`으로 교체 후 재배포(2026-08-04) — 인증 링크의 `vercel.app` 경유 단계 제거
  → **2026-08-04 실측**: 톤다운 템플릿 적용 후 테스트 발송했더니 지메일이 자동 스팸 처리. 사유 배너는 "This message is similar to messages that were identified as spam in the past" — **인증 실패가 아니라 내용·평판 기반 분류**(인증 실패면 "발신자를 확인할 수 없습니다"로 나옴). 즉 진단 ①②가 실제 원인으로 확정되어 보류 해제
  → **대응(코드, 완료)**: `src/app/auth/confirm/route.ts` 신규 — 템플릿에서 `{{ .ConfirmationURL }}`(→`<ref>.supabase.co`) 대신 `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}`로 링크를 직접 만들어 **메일 본문에 우리 도메인만 남김**. `verifyOtp`는 code_verifier 쿠키가 필요 없어서 메일을 다른 기기에서 열어도 인증됨(PKCE `code` 방식의 제약 해소). 기존 `/auth/callback`은 발송 완료된 옛 메일 때문에 존치
  → **남은 것**: ⓐ 배포(라우트가 라이브여야 링크가 살아남 — 템플릿 교체보다 **먼저**) ⓑ 대시보드에 새 템플릿 재붙여넣기 + 제목 한글화 + Sender name `포도위키` ⓒ SMTP를 `noreply@podo-store.com`(Zoho) 또는 Resend로 이전 — 개인 gmail 발신이 남은 최대 신호 ⓓ `_dmarc.podo-store.com` TXT 추가 ⓔ 새 계정으로 재테스트(이미 스팸 처리된 주소는 "스팸 아님" 학습이 섞이므로 사용 금지)
  → 참고: `supabase config push`는 로컬 config.toml 전체를 원격에 덮어써서 현재 원격의 Rate Limit 30 같은 값이 CLI 기본값으로 리셋됨. 이 태스크에서는 쓰지 말 것
  → 앱(`mobile/`)에는 회원가입·인증 흐름이 없어(익명 열람 전용) 웹 전용
  → **권장 모델**: Sonnet — 남은 것이 대시보드 붙여넣기와 눈으로 하는 확인뿐이라 판단 요소가 없음

## 대기 중

_없음_

## 구체화 필요

_없음_
