'use client'

import { useState, useMemo } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { slugify } from '@/lib/wiki/headings'

type MarkdownComponents = React.ComponentProps<typeof ReactMarkdown>['components']

function Img({ src, alt, title, ...props }: ComponentPropsWithoutRef<'img'>) {
  let width: string | undefined
  let displayTitle = title
  if (title?.startsWith('w=')) {
    width = title.slice(2)
    displayTitle = undefined
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={displayTitle}
      style={width ? { width: `${width}px`, height: 'auto', maxWidth: '100%' } : undefined}
      {...props}
    />
  )
}

// ── Footnote tooltip ─────────────────────────────────────────────────

function FootnoteTooltip({ label, num, content, href }: {
  label: string; num: number; content: string; href: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <sup className="relative inline-block">
      <a
        id={`fnref-${label}`}
        href={href}
        className="text-wiki-accent no-underline hover:underline"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        [{num}]
      </a>
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-0 z-50 w-max max-w-[260px] bg-wiki-surface border border-wiki-border rounded shadow-lg px-3 py-2 text-xs text-wiki-text pointer-events-none whitespace-normal leading-relaxed"
        >
          {content}
        </span>
      )}
    </sup>
  )
}

// ── Footnotes ────────────────────────────────────────────────────────

type FootnoteDef = { label: string; content: string; num: number }

function processFootnotes(markdown: string): { processed: string; defs: FootnoteDef[] } {
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

// ── Parsing ──────────────────────────────────────────────────────────

type H3Item = { heading: string; id: string; number: string; body: string }
type H2Section = { heading: string; id: string; number: string; intro: string; h3s: H3Item[] }

type Block =
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

function splitBlocks(markdown: string): Block[] {
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

// ── UI Components ────────────────────────────────────────────────────

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="8"
      height="10"
      viewBox="0 0 8 10"
      className="shrink-0 transition-transform duration-200 text-wiki-text-muted"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
      aria-hidden="true"
    >
      <path d="M1 0.5 L7.5 5 L1 9.5 Z" fill="currentColor" />
    </svg>
  )
}

function HeadingNumber({ number }: { number: string }) {
  return <span className="text-wiki-text-muted mr-1.5">{number}.</span>
}

function H3Block({ heading, id, number, body, components }: H3Item & { components: MarkdownComponents }) {
  return (
    <section>
      <h3 id={id}>
        <HeadingNumber number={number} />
        {heading.replace(/\[(.+?)\]\(.+?\)/g, '$1')}
      </h3>
      {body && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
          {body}
        </ReactMarkdown>
      )}
    </section>
  )
}

function IntroBlock({ body, h3s, components }: { body: string; h3s: H3Item[]; components: MarkdownComponents }) {
  return (
    <>
      {body && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
          {body}
        </ReactMarkdown>
      )}
      {h3s.map((h) => (
        <H3Block key={h.id} {...h} components={components} />
      ))}
    </>
  )
}

function CollapsibleH2({ heading, id, number, intro, h3s, components }: H2Section & { components: MarkdownComponents }) {
  const [open, setOpen] = useState(true)
  return (
    <section>
      <h2
        id={id}
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <Caret open={open} />
        <span className="flex-1">
          <HeadingNumber number={number} />
          {heading.replace(/\[(.+?)\]\(.+?\)/g, '$1')}
        </span>
      </h2>
      {open && (
        <>
          {intro && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
              {intro}
            </ReactMarkdown>
          )}
          {h3s.map((h) => (
            <H3Block key={h.id} {...h} components={components} />
          ))}
        </>
      )}
    </section>
  )
}

function CollapsibleH1({ heading, id, number, intro, h3s, h2s, components }: {
  heading: string; id: string; number: string; intro: string; h3s: H3Item[]; h2s: H2Section[]; components: MarkdownComponents
}) {
  const [open, setOpen] = useState(true)
  return (
    <section>
      <h1
        id={id}
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <Caret open={open} />
        <span className="flex-1">
          <HeadingNumber number={number} />
          {heading.replace(/\[(.+?)\]\(.+?\)/g, '$1')}
        </span>
      </h1>
      {open && (
        <>
          {intro && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
              {intro}
            </ReactMarkdown>
          )}
          {h3s.map((h) => (
            <H3Block key={h.id} {...h} components={components} />
          ))}
          {h2s.map((s) => (
            <CollapsibleH2 key={s.id} {...s} components={components} />
          ))}
        </>
      )}
    </section>
  )
}

const PROSE = `prose max-w-none text-wiki-text
  [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:border-b [&_h1]:border-wiki-border [&_h1]:pb-2 [&_h1]:flex [&_h1]:items-center [&_h1]:gap-2
  sm:[&_h1]:text-2xl sm:[&_h1]:mt-8 sm:[&_h1]:mb-4
  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-wiki-border/50 [&_h2]:pb-1 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2
  sm:[&_h2]:text-xl sm:[&_h2]:mt-6 sm:[&_h2]:mb-3
  [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
  sm:[&_h3]:text-lg sm:[&_h3]:mt-5 sm:[&_h3]:mb-2
  [&_p]:my-2 [&_p]:leading-relaxed
  sm:[&_p]:my-3
  [&_a]:text-wiki-accent [&_a]:hover:underline
  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
  [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square] [&_ul_ul_ul_ul]:list-disc
  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
  [&_ol_ol]:list-[lower-alpha] [&_ol_ol_ol]:list-[lower-roman] [&_ol_ol_ol_ol]:list-decimal
  [&_li]:my-1
  [&_code]:bg-wiki-border/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
  [&_pre]:bg-wiki-surface [&_pre]:border [&_pre]:border-wiki-border [&_pre]:rounded [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
  [&_pre_code]:bg-transparent [&_pre_code]:p-0
  [&_blockquote]:border-l-4 [&_blockquote]:border-wiki-accent [&_blockquote]:pl-4 [&_blockquote]:text-wiki-text-muted [&_blockquote]:my-4
  [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
  [&_th]:border [&_th]:border-wiki-border [&_th]:bg-wiki-border/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
  [&_td]:border [&_td]:border-wiki-border [&_td]:px-3 [&_td]:py-2
  [&_hr]:border-wiki-border [&_hr]:my-6
  [&_img]:max-w-full [&_img]:rounded [&_img]:my-3
  [&_sup]:text-xs [&_sup]:leading-none [&_.footnote-ref]:text-wiki-accent [&_.footnote-ref]:no-underline [&_.footnote-ref]:hover:underline`

export default function MarkdownContent({ content }: { content: string }) {
  const { processed, defs } = useMemo(() => processFootnotes(content), [content])
  const fnMap = useMemo(() => new Map(defs.map(d => [d.label, d])), [defs])

  const components: MarkdownComponents = useMemo(() => ({
    img: Img,
    a: ({ href, children, className, ...props }: ComponentPropsWithoutRef<'a'>) => {
      if (className === 'footnote-ref') {
        const label = href?.replace('#fn-', '') ?? ''
        const fn = fnMap.get(label)
        if (fn) return <FootnoteTooltip label={label} num={fn.num} content={fn.content} href={href ?? ''} />
      }
      const isExternal = !!href && /^[a-z][a-z\d+\-.]*:/i.test(href)
      if (isExternal) {
        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
      }
      return <a href={href} {...props}>{children}</a>
    },
  }), [fnMap])

  const blocks = splitBlocks(processed)

  return (
    <div className={PROSE}>
      {blocks.map((block, i) => {
        if (block.type === 'intro') {
          return <IntroBlock key={i} body={block.body} h3s={block.h3s} components={components} />
        }
        if (block.type === 'h1') {
          return (
            <CollapsibleH1
              key={block.id}
              heading={block.heading}
              id={block.id}
              number={block.number}
              intro={block.intro}
              h3s={block.h3s}
              h2s={block.h2s}
              components={components}
            />
          )
        }
        return (
          <CollapsibleH2
            key={block.id}
            heading={block.heading}
            id={block.id}
            number={block.number}
            intro={block.intro}
            h3s={block.h3s}
            components={components}
          />
        )
      })}
      {defs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-wiki-border">
          <ol className="list-none pl-0 space-y-1 text-sm text-wiki-text-muted">
            {defs.map(({ label, content: fnContent, num }) => (
              <li key={label} id={`fn-${label}`} className="flex gap-1.5">
                <a href={`#fnref-${label}`} className="text-wiki-accent hover:underline shrink-0">
                  [{num}]
                </a>
                <span className="[&_p]:inline [&_p]:m-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
                    {fnContent}
                  </ReactMarkdown>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
