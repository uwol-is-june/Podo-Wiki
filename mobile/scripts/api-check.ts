// 개발용: api.ts의 모든 쿼리를 프로덕션 Supabase(anon key)에 실행해 결과 형태를 확인한다.
//   npx tsx scripts/api-check.ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

for (const line of readFileSync(join(__dirname, '../.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

async function main() {
  const api = await import('../src/lib/api')

  const home = await api.getHomeData()
  console.log(`getHomeData: docCount=${home.docCount} recent=${home.recent.length} faqPreview=${home.faqPreview.length}`)
  console.log(`  recent[0]: ${home.recent[0]?.documents?.title} / ${api.editorLabel(home.recent[0]?.editor_id ?? null)} / ${api.formatDateTime(home.recent[0]?.edited_at ?? new Date().toISOString())}`)

  const doc = await api.getDocument('포도위키:도움말')
  console.log(`getDocument(도움말): title=${doc?.title} protected=${doc?.protected} contentLen=${doc?.content.length}`)
  const missing = await api.getDocument('존재하지-않는-문서-xyz')
  console.log(`getDocument(없는 문서): ${missing === null ? 'null OK' : 'UNEXPECTED'}`)

  const suggestions = await api.suggestDocuments('포도')
  console.log(`suggestDocuments(포도): ${suggestions.length}개 — ${suggestions.map(s => s.title).join(', ')}`)

  const results = await api.searchDocuments('위키')
  console.log(`searchDocuments(위키): ${results.length}개, 첫 스니펫="${results[0]?.snippet.slice(0, 40)}…"`)

  const recent = await api.getRecentRevisions(1)
  console.log(`getRecentRevisions(1): rows=${recent.rows.length} count=${recent.count}`)

  const random = await api.getRandomSlug()
  console.log(`getRandomSlug: ${random}`)

  const history = await api.getHistory('포도위키:도움말')
  console.log(`getHistory(도움말): title=${history.title} revisions=${history.revisions.length}`)
  const h0 = history.revisions[0]
  if (h0) {
    console.log(`  rev[0]: bytes=${h0.contentBytes} diff=${h0.bytesDiff >= 0 ? '+' : ''}${h0.bytesDiff} comment="${h0.comment}"`)
    const rev = await api.getRevision(h0.id)
    console.log(`getRevision: id=${rev?.id.slice(0, 8)} title=${rev?.documents?.title} contentLen=${rev?.content.length}`)
    const h1 = history.revisions[1]
    if (h1) {
      const pair = await api.getRevisionPair(h0.id, h1.id)
      console.log(`getRevisionPair: older=${pair?.[0].edited_at} newer=${pair?.[1].edited_at} (정렬 ${pair && pair[0].edited_at <= pair[1].edited_at ? 'OK' : 'FAIL'})`)
    }
  }

  const faq = await api.getFaqItems()
  console.log(`getFaqItems: ${faq.length}개 — 첫 질문 "${faq[0]?.question}"`)

  const slugs = await api.getExistingSlugs(['포도위키:도움말', '없는-슬러그'])
  console.log(`getExistingSlugs: ${[...slugs].join(', ')} (1개면 OK)`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
