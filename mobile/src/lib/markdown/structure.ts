// Ported from src/components/wiki/MarkdownContent.tsx (processFootnotes/splitH3/splitBlocks)
// — keep the parsing rules in sync with the web renderer
import { slugify } from '@/lib/wiki/headings'

export type FootnoteDef = { label: string; content: string; num: number }

export function processFootnotes(markdown: string): { processed: string; defs: FootnoteDef[] } {
  const defMap = new Map<string, string>()
  const cleanedLines: string[] = []

  for (const line of markdown.split('\n')) {
    const m = line.match(/^\[\^([^\]]+)\]:\s*(.+)$/)
    if (m) {
      if (!defMap.has(m[1])) defMap.set(m[1], m[2])
    } else {
      cleanedLines.push(line)
    }
  }

  if (defMap.size === 0) return { processed: markdown, defs: [] }

  const labelOrder: string[] = []
  const labelToNum = new Map<string, number>()
  for (const line of cleanedLines) {
    for (const m of line.matchAll(/\[\^([^\]]+)\]/g)) {
      if (!labelToNum.has(m[1])) {
        labelOrder.push(m[1])
        labelToNum.set(m[1], labelOrder.length)
      }
    }
  }

  const processed = cleanedLines.join('\n').replace(/\[\^([^\]]+)\]/g, (_, label) => {
    const num = labelToNum.get(label)
    if (!num) return `[^${label}]`
    return `<sup><a id="fnref-${label}" href="#fn-${label}" class="footnote-ref">[${num}]</a></sup>`
  })

  const defs = labelOrder
    .filter(label => defMap.has(label))
    .map((label, i) => ({ label, content: defMap.get(label)!, num: i + 1 }))

  return { processed, defs }
}

export type H3Item = { heading: string; id: string; number: string; body: string }
export type H2Section = { heading: string; id: string; number: string; intro: string; h3s: H3Item[] }

export type Block =
  | { type: 'intro'; body: string; h3s: H3Item[] }
  | { type: 'h1'; heading: string; id: string; number: string; intro: string; h3s: H3Item[]; h2s: H2Section[] }
  | { type: 'h2'; heading: string; id: string; number: string; intro: string; h3s: H3Item[] }

// h3(###) 줄을 기준으로 본문을 분리한다. h1/h2 헤딩 줄은 이미 걸러진 상태로 들어온다.
function splitH3(text: string): { intro: string; h3s: Omit<H3Item, 'number'>[] } {
  const introLines: string[] = []
  const h3s: Omit<H3Item, 'number'>[] = []
  let cur: { heading: string; id: string; buf: string[] } | null = null

  const flush = () => {
    if (cur) h3s.push({ heading: cur.heading, id: cur.id, body: cur.buf.join('\n').trim() })
    cur = null
  }

  for (const line of text.split('\n')) {
    const h3m = line.match(/^### (.+)/)
    if (h3m) {
      flush()
      const heading = h3m[1].trim()
      cur = { heading, id: slugify(heading), buf: [] }
    } else if (cur) {
      cur.buf.push(line)
    } else {
      introLines.push(line)
    }
  }
  flush()

  return { intro: introLines.join('\n').trim(), h3s }
}

function numberH3s(h3s: Omit<H3Item, 'number'>[], parentNumber: string): H3Item[] {
  return h3s.map((h, i) => ({ ...h, number: parentNumber ? `${parentNumber}.${i + 1}` : `${i + 1}` }))
}

export function splitBlocks(markdown: string): Block[] {
  type RawSeg =
    | { level: 'intro'; body: string }
    | { level: 1 | 2; heading: string; id: string; body: string }

  const segs: RawSeg[] = []
  const buf: string[] = []
  let cur: { level: 1 | 2; heading: string; id: string } | null = null

  const flush = () => {
    const body = buf.join('\n').trim()
    buf.length = 0
    if (!cur) {
      if (body) segs.push({ level: 'intro', body })
    } else {
      segs.push({ level: cur.level, heading: cur.heading, id: cur.id, body })
    }
  }

  for (const line of markdown.split('\n')) {
    const h2m = line.match(/^## (.+)/)
    const h1m = !h2m && line.match(/^# (.+)/)
    if (h1m) {
      flush()
      const heading = h1m[1].trim()
      cur = { level: 1, heading, id: slugify(heading) }
    } else if (h2m) {
      flush()
      const heading = h2m[1].trim()
      cur = { level: 2, heading, id: slugify(heading) }
    } else {
      buf.push(line)
    }
  }
  flush()

  // 나무위키 스타일 계층 번호(1 / 1.1 / 1.1.1)를 매기며 h1 > h2 > h3 트리로 조립한다.
  // 상위 섹션의 intro에 h2/h3보다 먼저 나온 h3가 있으면, 그 h3가 형제 순번 한 칸을
  // 이미 차지한 것으로 보고 다음 카운터를 그만큼 이어받는다 (번호 중복 방지).
  let c1 = 0
  const blocks: Block[] = []
  let i = 0
  while (i < segs.length) {
    const seg = segs[i]
    if (seg.level === 'intro') {
      const { intro, h3s } = splitH3(seg.body)
      blocks.push({ type: 'intro', body: intro, h3s: numberH3s(h3s, '') })
      c1 = h3s.length
      i++
    } else if (seg.level === 1) {
      c1++
      const number = `${c1}`
      const { intro, h3s } = splitH3(seg.body)
      const h1Block: Block & { type: 'h1' } = {
        type: 'h1', heading: seg.heading, id: seg.id, number, intro, h3s: numberH3s(h3s, number), h2s: [],
      }
      i++
      let c2 = h3s.length
      while (i < segs.length && segs[i].level === 2) {
        const s = segs[i] as { level: 2; heading: string; id: string; body: string }
        c2++
        const h2Number = `${number}.${c2}`
        const sub = splitH3(s.body)
        h1Block.h2s.push({ heading: s.heading, id: s.id, number: h2Number, intro: sub.intro, h3s: numberH3s(sub.h3s, h2Number) })
        i++
      }
      blocks.push(h1Block)
    } else {
      c1++
      const number = `${c1}`
      const { intro, h3s } = splitH3(seg.body)
      blocks.push({ type: 'h2', heading: seg.heading, id: seg.id, number, intro, h3s: numberH3s(h3s, number) })
      i++
    }
  }
  return blocks
}
