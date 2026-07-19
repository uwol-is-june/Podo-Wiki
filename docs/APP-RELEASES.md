# 앱 배포 · 버전 관리

포도위키 모바일 앱(iOS · Android)의 버전 현황과 배포 절차를 관리하는 문서.
**새 버전을 스토어에 제출할 때마다 이 문서의 [버전 현황](#버전-현황)과 [릴리스 이력](#릴리스-이력)을 갱신할 것.**

- 스토어: [App Store](https://apps.apple.com/kr/app/id6790099095) · [Google Play](https://play.google.com/store/apps/details?id=com.podowiki.app)
- EAS 프로젝트: `@uwol-is-june/podo-wiki` (ID `ed58a45a-2877-4aff-a765-6a7fd0e915e6`) → [expo.dev 빌드 목록](https://expo.dev/accounts/uwol-is-june/projects/podo-wiki/builds)
- 번들 ID / 패키지명: `com.podowiki.app` (양대 공통)

---

## 버전 현황

| 플랫폼 | 스토어 배포 버전 | 빌드 번호 | 상태 | 최근 제출일 |
|---|---|---|---|---|
| iOS | 1.0.0 | - | 출시됨 | 2026-07-12 |
| Android | 1.0.1 (versionCode 4) | 4 | **심사 중** | 2026-07-19 |

> Android 1.0.0(versionCode 2)은 문서 화면 진입 시 전면 크래시 결함이 있음(TASK-056). 1.0.1 심사 통과 확인 후 이 표를 갱신할 것.

## 버전 규칙

- **버전 이름**(1.0.x): `mobile/app.json`의 `expo.version`이 단일 소스. 제출 전에 여기만 올리면 됨. iOS·Android 공통.
  - 패치(x): 버그 수정 / 마이너: 기능 추가 / 메이저: 대규모 개편
- **빌드 번호**(versionCode·buildNumber): EAS 서버가 자동 관리 (`appVersionSource: remote` + production 프로필 `autoIncrement: true`). 직접 만지지 말 것. 빌드마다 증가하므로 중간에 비는 번호가 생기는 건 정상 (예: versionCode 3은 미제출 빌드).
- 한 플랫폼만 고칠 때는 그 플랫폼만 제출해도 됨 (예: 1.0.1은 Android 전용). 단 버전 이름은 공통이므로, 이후 iOS를 제출하면 그 시점의 버전 이름으로 나감.

## 배포 절차

### 0. 공통 사전 체크리스트

- [ ] `mobile/`에서 `npx tsc --noEmit` 통과
- [ ] `mobile/app.json`의 `expo.version` 올리기
- [ ] **Android 에뮬레이터 릴리스 빌드로 실동작 검증** (1.0.0을 미검증 출시했다가 전면 크래시를 낸 교훈 — TASK-056):
  ```bash
  # 에뮬레이터 (AVD: galaxy-repro, Android 16 arm64 — 이 Mac에 구축됨)
  /opt/homebrew/share/android-commandlinetools/emulator/emulator -avd galaxy-repro &

  # 릴리스 빌드 (8GB RAM 기계라 반드시 단일 아키텍처 + 워커 제한, 에뮬레이터와 빌드 동시 실행 금지)
  cd mobile && npx expo prebuild -p android --no-install
  cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@17 ./gradlew :app:assembleRelease \
    -PreactNativeArchitectures=arm64-v8a --max-workers=3

  # 설치 후 전 화면 터치 순회: 문서 열기·목차·역사·FAQ·최근 변경·검색·더보기
  adb install -r app/build/outputs/apk/release/app-release.apk
  ```
- [ ] iOS 변경이 있으면 실기기(개발자 아이폰)에서도 확인
- [ ] 웹과 공유하는 로직(`// Copied from ...` 헤더 파일들) 동기화 여부 확인

### 1. Android (Google Play)

```bash
cd mobile
npx eas-cli build -p android --profile production
```

1. 빌드 완료 후 [expo.dev 빌드 페이지](https://expo.dev/accounts/uwol-is-june/projects/podo-wiki/builds)에서 **AAB 다운로드**
2. [Play Console](https://play.google.com/console) → 포도위키 → **테스트 및 출시 → 프로덕션 → 새 버전 만들기**
3. AAB 업로드 → 출시명은 자동(또는 버전 이름) → 출시 노트 작성 → 검토 → **프로덕션 출시 시작**
4. "가독화 파일 없음" 경고는 무시 가능 (TASK-057에서 해결 예정)
5. 심사: 보통 몇 시간~2일

> ⚠️ 자동 제출(`--auto-submit`)은 아직 불가 — Google Cloud 서비스 계정 키(JSON)를 만들지 않았음.
> 만들려면: Play Console → 설정 → API 액세스 → 서비스 계정 생성 → JSON 키를 `eas.json` submit 프로필에 연결.

### 2. iOS (App Store)

```bash
cd mobile
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --latest   # ASC API 키 설정돼 있어 자동 업로드됨
```

1. 업로드 후 [App Store Connect](https://appstoreconnect.apple.com)에서 새 버전 생성 → 빌드 선택 → "이 버전의 새로운 기능" 작성 → 심사 제출
2. 심사: 보통 1~2일 (1.0.0은 반려 없이 통과)

### 3. 제출 후

- [ ] 이 문서의 [버전 현황](#버전-현황)·[릴리스 이력](#릴리스-이력) 갱신
- [ ] `docs/TASK.md` 완료 처리 → `docs/CHANGELOG.md` Unreleased에 기록
- [ ] 심사 통과 확인 후 버전 현황의 "심사 중" → "출시됨" 갱신

## 릴리스 이력

| 버전 | 플랫폼 | 빌드 번호 | 제출일 | 내용 |
|---|---|---|---|---|
| 1.0.1 | Android | 4 | 2026-07-19 | 문서를 열 때 앱이 종료되던 전면 크래시 수정 (WebView `decelerationRate` ClassCastException, TASK-056) |
| 1.0.0 | iOS | - | 2026-07-12 | 최초 출시 (2026-07-13 심사 통과) |
| 1.0.0 | Android | 2 | 2026-07-12 | 최초 출시 (2026-07-13 심사 통과) — 문서 화면 전면 크래시 결함 있음 |

## 예정된 릴리스

- **1.0.2** (양대 플랫폼): Supabase 서울 리전 이전에 따른 env 교체(TASK-053) + R8 mapping 파일 포함(TASK-057) + 연락처 이메일 변경(podo@podo-store.com) 반영
