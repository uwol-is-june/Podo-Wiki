# 앱 배포 · 버전 관리

> 스토어에 새 버전을 제출할 때마다
> **① 지금 버전 ② 릴리스 이력** 두 표를 갱신할 것.


## ① 지금 버전

| 플랫폼  | 스토어 버전 | 상태             |
| ------- | ----------- | ---------------- |
| iOS     | 1.1.1       | ✅ 출시됨 (8/7) · 1.1.2 빌드 완료, **제출 전** |
| Android | 1.1.1       | ✅ 출시됨 (8/7) · 1.1.2 빌드 완료, **제출 전** |

- **1.1.2 (2026-08-08 빌드, 아직 제출 안 함)**: 한글 어절 줄바꿈(T-080) + 흰 배경 로고 받침(T-081·082)
  - iOS build 7 / Android vc 9. [Android AAB](https://expo.dev/artifacts/eas/23-1nuODY1Yibulqj95xayoUdSaa9TjgZ1MwX_FxnfQ.aab) · [빌드 목록][builds]
  - 에뮬레이터(Android 16) 릴리스 APK 검증 완료 — 홈 단체명 `극예술연구회 / 시네씨아` 어절 단위 줄바꿈, 로고 받침 정상, 문서 WebView·목차·FAQ·검색·북마크 정상, `FATAL EXCEPTION` 0건
  - **남은 일**: iOS `npx eas-cli submit -p ios --latest` → ASC 심사 제출 / Android AAB 수동 업로드 → 프로덕션 출시

- **1.1.1 내용**: 1.1.0 출시 뒤 쌓인 앱 변경을 반영하는 유지보수 릴리스. 8/5 제출 → 8/7 양대 통과. iOS build 6 / Android vc 8
  - **T-075·076 단체 목록을 DB에서 읽기** — 1.1.0 앱에는 `mobile/src/data/troupes.ts`에 광운극예술연구회 하나만 하드코딩돼 있어, `/admin`으로 추가한 시네씨아가 앱에 안 보였음. **이번 출시 이후로는 단체 추가가 앱 재배포 없이 반영됨** (이 전환에 걸린 마지막 출시)
  - T-069 북마크 저장 실패·경합 처리 — 1.1.0에 못 실었던 그 건. 이번에 들어감
  - T-068 북마크 아이콘 리본 통일(`@expo/vector-icons` 신규 네이티브 의존성) / T-070 목차 이동 무반응 / T-071 맨 위로 FAB 깜빡임
  - 에뮬레이터(Android 16) 릴리스 빌드 검증 완료 — `FATAL EXCEPTION` 0건. 홈 단체 2개 표시, 문서 WebView(이미지·표·각주), 목차 펼침·이동, 북마크 저장→재시작 유지, 검색·더보기 전부 정상. 새 네이티브 의존성이 있어 특히 중점 확인
  - ⚠️ **미해결**: 시네씨아 문서가 아직 `content: ""` (2026-08-07 확인). 앱·웹 홈에 카드는 뜨는데 누르면 빈 화면이 열리는 상태. 코드 문제가 아니라 문서 작성이 안 된 것
- **1.1.0 내용**: 다크모드 대비 개선(T-062·T-063) + 북마크 탭·문서 화면 개편(T-065) + 본문·표 크기 조정(T-067). 8/2 제출 → 8/3 양대 통과
  - iOS build 5 / Android vc 7. AAB에 `proguard.map` 포함 확인 — "가독화 파일 없음" 경고 없었음
  - 에뮬레이터 릴리스 빌드로 라이트/다크 양쪽 검증 완료 (북마크 저장·재시작 유지·삭제, 접이식 목차, 맨 위로 FAB, 최근 변경 진입, 본문·표 크기)
  - 웹은 8/2 같이 배포 완료 — 웹 북마크(T-066) 포함
  - ⚠️ **출시 뒤에 고친 것이 있음**: 코드리뷰에서 나온 북마크 저장 실패·경합 처리(T-069)는 **1.1.0에 안 들어감**. 읽기 실패 시 저장된 북마크가 지워질 수 있는 경로라 다음 버전에 반드시 실을 것
- 1.0.3 내용: 커스텀 도메인 `wiki.podo-store.com`로 앱 SITE_URL 전환 + 문서 헤더 목차/역사 칩(TASK-058) + 더보기 기능 추가 요청 폼(TASK-059)
  - 에뮬레이터 검증에서 **기능요청 폼 Android 키보드 가림 버그 발견·수정** 후 재검증(폼 제출→접수 성공)
  - iOS build 4 / Android vc 6, AAB에 `proguard.map` 포함 확인
- 참고: 옛 싱가포르 Supabase 프로젝트는 2026-07-21 삭제됨. 커스텀 도메인 전환 후 구버전 앱은 옛 도메인 → 308 리다이렉트로 정상 작동


## ② 릴리스 이력

| 버전  | 플랫폼  | 제출일     | 내용                                       |
| ----- | ------- | ---------- | ------------------------------------------ |
| 1.1.1 | 양대    | 2026-08-05 | 단체 목록 DB 전환(T-075·076) + 북마크 저장 경합(T-069) + 아이콘 통일(T-068) + 목차 이동(T-070) + FAB 깜빡임(T-071). iOS build 6 / Android vc 8, 8/7 통과 |
| 1.1.0 | 양대    | 2026-08-02 | 다크모드 대비 개선(T-062·063) + 북마크 탭·문서 화면 개편(T-065) + 본문·표 크기 조정(T-067). iOS build 5 / Android vc 7, 8/3 통과 |
| 1.0.3 | 양대    | 2026-07-25 | 커스텀 도메인(wiki.podo-store.com) + 헤더 칩(T-058) + 기능요청 폼(T-059). iOS build 4 / Android vc 6 |
| 1.0.2 | 양대    | 2026-07-21 | 서울 리전 전환(T-053) + R8 mapping 포함(T-057) + 새 이메일. iOS build 3 / Android vc 5 |
| 1.0.1 | Android | 2026-07-19 | 문서 열면 앱 종료되던 크래시 수정 (T-056), 7/19 통과 |
| 1.0.0 | 양대    | 2026-07-12 | 최초 출시, 7/13 통과 (Android 크래시 결함) |


---


# 배포하는 법


## 1단계 · 제출 전 준비

1. `mobile/app.json`의 `version` 올리기 — **여기 한 곳만 고치면 됨**
   - versionCode 등 빌드 번호는 EAS가 자동으로 올림. 건드리지 말 것
2. `mobile/`에서 `npx tsc --noEmit` 통과 확인
3. **에뮬레이터 릴리스 빌드로 직접 눌러보기** (명령어: 맨 아래 부록)
   - 문서 · 목차 · 역사 · FAQ · 최근 변경 · 검색 · 더보기 전부 터치
   - 1.0.0을 검증 없이 냈다가 전면 크래시 사고 난 적 있음


## 2단계-A · Android 제출

1. 빌드
   ```bash
   cd mobile && npx eas-cli build -p android --profile production
   ```
2. 끝나면 [expo.dev 빌드 페이지][builds]에서 **AAB 다운로드**
3. [Play Console][play] → 포도위키
   → 테스트 및 출시 → 프로덕션 → **새 버전 만들기**
4. AAB 업로드 → 출시 노트 작성 → 검토 → **프로덕션 출시 시작**
   - 1.0.2부터 "가독화 파일 없음" 경고가 안 떠야 정상 (TASK-057에서 R8 mapping
     자동 포함 설정함). 경고가 여전히 뜨면 업로드 중단하고 원인 확인할 것
5. 심사 대기: 보통 몇 시간 ~ 2일


## 2단계-B · iOS 제출

1. 빌드 + 업로드 (자동)
   ```bash
   cd mobile && npx eas-cli build -p ios --profile production
   npx eas-cli submit -p ios --latest
   ```
2. [App Store Connect][asc] → 새 버전 생성 → 빌드 선택
   → "새로운 기능" 작성 → 심사 제출
3. 심사 대기: 보통 1 ~ 2일


## 3단계 · 제출 후

- 이 문서 맨 위 **두 표 갱신**
- `docs/TASK_M.md` 완료 처리 → `docs/CHANGELOG.md`에 기록
- 심사 통과하면 상태를 "심사 중" → "출시됨"으로 변경


---


# 알아두기

- **스토어**: [App Store][appstore] · [Google Play][googleplay]
  패키지명 `com.podowiki.app`
- **EAS 프로젝트**: `@uwol-is-june/podo-wiki`
- **버전 이름 규칙**
  | 변경 크기   | 예시      |
  | ----------- | --------- |
  | 버그 수정   | 1.0.**2** |
  | 기능 추가   | 1.**1**.0 |
  | 대규모 개편 | **2**.0.0 |
  iOS·Android가 버전 이름을 공유함.
  한쪽만 제출해도 다음 제출 땐 그 시점 버전 이름으로 나감.
- **빌드 번호에 빈 숫자가 있어도 정상**
  EAS가 빌드마다 올리므로 제출 안 한 빌드 번호는 건너뜀 (예: versionCode 3)
- **Android 자동 제출은 아직 불가**
  Google 서비스 계정 키(JSON) 미생성. 만들면 `--auto-submit` 한 줄로 끝남
  (Play Console → 설정 → API 액세스)
- **iOS 심사 방어 논리** (반려 대비)
  읽기 전용 앱 · 로그인 없음 · 편집은 웹에서 승인 회원만


# 부록 · 에뮬레이터 검증 명령어

이 Mac에 구축된 환경:
AVD `galaxy-repro` (Android 16 arm64) · JDK 17(brew) ·
SDK `/opt/homebrew/share/android-commandlinetools`

```bash
# 1. 에뮬레이터 켜기
/opt/homebrew/share/android-commandlinetools/emulator/emulator \
  -avd galaxy-repro &

# 2. 릴리스 빌드
#    ⚠️ 8GB RAM: 단일 아키텍처 + 워커 제한 필수, 에뮬레이터와 동시 실행 금지
cd mobile && npx expo prebuild -p android --no-install
# ⚠️ prebuild가 android/를 재생성하면서 SDK 경로가 담긴 local.properties를 지운다.
#    그래서 ANDROID_HOME을 함께 넘겨야 한다 (없으면 "SDK location not found"로 실패)
cd android && ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
  JAVA_HOME=/opt/homebrew/opt/openjdk@17 ./gradlew :app:assembleRelease \
  -PreactNativeArchitectures=arm64-v8a --max-workers=3

# 3. 설치하고 눌러보기
adb install -r app/build/outputs/apk/release/app-release.apk
```


<!-- 링크 모음 -->
[builds]: https://expo.dev/accounts/uwol-is-june/projects/podo-wiki/builds
[play]: https://play.google.com/console
[asc]: https://appstoreconnect.apple.com
[appstore]: https://apps.apple.com/kr/app/id6790099095
[googleplay]: https://play.google.com/store/apps/details?id=com.podowiki.app
