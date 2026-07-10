// 개발용: 마크다운 → HTML 파이프라인을 Node에서 실행해 결과를 눈으로 확인한다.
//   npx tsx scripts/render-sample.ts <출력디렉토리> [슬러그...]
// .env의 Supabase anon key로 실제 문서를 가져오고, 기능 총망라 픽스처도 함께 렌더링한다.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { renderWikiBodyHtml } from '../src/lib/markdown/renderHtml'
import { wikiHtmlDocument } from '../src/lib/markdown/template'
import { WikiColors } from '../src/theme/colors'

const FIXTURE = `문서 서두입니다. **'따옴표'**와 한글 조사가 붙은 강조[^first]도 됩니다.

### 서두의 h3
h1보다 먼저 나온 h3 섹션.

# 첫 대단원
대단원 소개문. [내부 링크](/w/포도상점)와 [외부 링크](https://example.com), 각주[^second]도 있어요.

## 소단원 하나
| 항목 | 설명 |
| --- | --- |
| 표 | GFM 표 렌더링 |
| ~~취소선~~ | CJK ~~취소선'테스트'~~ |

### 깊은 항목
- 목록
  - 중첩 목록
1. 번호 목록

## 소단원 둘
> 인용문 블록

\`인라인 코드\`와 코드 블록:

\`\`\`
코드 블록 내용
줄바꿈 유지
\`\`\`

이미지 폭 지정: ![로고](/wiki_logo.png "w=120")

인라인 HTML: 위첨자<sup>2</sup>와 <b>굵게</b>.

# 둘째 대단원
마지막 문단.

[^first]: 첫 번째 각주 정의입니다.
[^second]: **마크다운** 포함 각주.
`

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  for (const line of readFileSync(join(__dirname, '../.env'), 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

async function fetchDocument(slug: string): Promise<string | null> {
  const env = loadEnv()
  const res = await fetch(
    `${env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/documents?slug=eq.${encodeURIComponent(slug)}&select=title,content`,
    { headers: { apikey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY } }
  )
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  const rows = (await res.json()) as { title: string; content: string }[]
  return rows[0]?.content ?? null
}

async function render(name: string, content: string, outDir: string) {
  const body = await renderWikiBodyHtml(content)
  for (const [mode, theme] of [['light', WikiColors.light], ['dark', WikiColors.dark]] as const) {
    writeFileSync(join(outDir, `${name}.${mode}.html`), wikiHtmlDocument(body, theme))
  }
  const stat = (re: RegExp) => (body.match(re) ?? []).length
  console.log(
    `${name}: sections=${stat(/<section>/g)} h1=${stat(/<h1 /g)} h2=${stat(/<h2 /g)} h3=${stat(/<h3 /g)}` +
      ` tables=${stat(/<table>/g)} imgs=${stat(/<img /g)} footnote-refs=${stat(/footnote-ref/g)}` +
      ` fn-items=${stat(/fn-item/g)} rawHtml-sup=${stat(/<sup>2<\/sup>/g)}`
  )
}

async function main() {
  const [outDir, ...slugs] = process.argv.slice(2)
  if (!outDir) throw new Error('usage: tsx scripts/render-sample.ts <outDir> [slugs...]')
  await render('fixture', FIXTURE, outDir)
  for (const slug of slugs) {
    const content = await fetchDocument(slug)
    if (content === null) {
      console.log(`${slug}: NOT FOUND`)
      continue
    }
    await render(slug.replace(/[/:]/g, '_'), content, outDir)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
