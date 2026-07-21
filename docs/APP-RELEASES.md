# 앱 배포 · 버전 관리

> 스토어에 새 버전을 제출할 때마다
> **① 지금 버전 ② 릴리스 이력** 두 표를 갱신할 것.


## ① 지금 버전

| 플랫폼  | 스토어 버전 | 상태                                         |
| ------- | ----------- | -------------------------------------------- |
| iOS     | 1.0.2       | 🔍 ASC 업로드됨 (7/21) — 버전 생성·심사 제출 필요 |
| Android | 1.0.2       | ⏳ AAB 빌드 완료 — Play Console 수동 업로드 대기 |

- 1.0.2 내용: 서울 리전 전환(TASK-053, env 이미 서울) + R8 mapping 포함(TASK-057) + 새 연락처 이메일
  - 에뮬레이터 릴리스 검증(R8 첫 빌드) 통과 — 문서 WebView·이미지·네비게이션 크래시 0건
  - AAB에 `proguard.map` 포함 확인 → Play Console "가독화 파일 없음" 경고 해소
- ⚠️ **1.0.2 스토어 통과·확산(1~2주) 전까지 옛 싱가포르 Supabase 프로젝트 삭제 금지** — 라이브 앱(1.0.0/1.0.1)이 싱가포르 URL을 빌드에 박은 채 돌기 때문 (OTA 미사용)


## ② 릴리스 이력

| 버전  | 플랫폼  | 제출일     | 내용                                       |
| ----- | ------- | ---------- | ------------------------------------------ |
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
- `docs/TASK.md` 완료 처리 → `docs/CHANGELOG.md`에 기록
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
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@17 ./gradlew :app:assembleRelease \
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
