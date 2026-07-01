'use client'

import { useState, useMemo } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { slugify } from '@/lib/wiki/headings'

type MarkdownComponents = React.ComponentProps<typeof ReactMarkdown>['components']

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node)
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children)
  return ''
}

function H3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
  return <h3 id={slugify(extractText(children))} {...props}>{children}</h3>
}
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

type H2Section = { heading: string; id: string; body: string }

type Block =
  | { type: 'intro'; body: string }
  | { type: 'h1'; heading: string; id: string; intro: string; h2s: H2Section[] }
  | { type: 'h2'; heading: string; id: string; body: string }

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

  const blocks: Block[] = []
  let i = 0
  while (i < segs.length) {
    const seg = segs[i]
    if (seg.level === 'intro') {
      blocks.push({ type: 'intro', body: seg.body })
      i++
    } else if (seg.level === 1) {
      const h1Block: Block & { type: 'h1' } = {
        type: 'h1', heading: seg.heading, id: seg.id, intro: seg.body, h2s: [],
      }
      i++
      while (i < segs.length && segs[i].level === 2) {
        const s = segs[i] as { level: 2; heading: string; id: string; body: string }
        h1Block.h2s.push({ heading: s.heading, id: s.id, body: s.body })
        i++
      }
      blocks.push(h1Block)
    } else {
      blocks.push({ type: 'h2', heading: seg.heading, id: seg.id, body: seg.body })
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

function CollapsibleH2({ heading, id, body, components }: H2Section & { components: MarkdownComponents }) {
  const [open, setOpen] = useState(true)
  return (
    <section>
      <h2
        id={id}
        className="cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <Caret open={open} />
        <span className="flex-1">{heading.replace(/\[(.+?)\]\(.+?\)/g, '$1')}</span>
      </h2>
      {open && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
          {body}
        </ReactMarkdown>
      )}
    </section>
  )
}

function CollapsibleH1({ heading, id, intro, h2s, components }: {
  heading: string; id: string; intro: string; h2s: H2Section[]; components: MarkdownComponents
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
        <span className="flex-1">{heading.replace(/\[(.+?)\]\(.+?\)/g, '$1')}</span>
      </h1>
      {open && (
        <>
          {intro && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
              {intro}
            </ReactMarkdown>
          )}
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
  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
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
    h3: H3,
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
  const hasSections = blocks.some((b) => b.type === 'h1' || b.type === 'h2')

  return (
    <div className={PROSE}>
      {hasSections ? (
        blocks.map((block, i) => {
          if (block.type === 'intro') {
            return (
              <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
                {block.body}
              </ReactMarkdown>
            )
          }
          if (block.type === 'h1') {
            return (
              <CollapsibleH1
                key={block.id}
                heading={block.heading}
                id={block.id}
                intro={block.intro}
                h2s={block.h2s}
                components={components}
              />
            )
          }
          return (
            <CollapsibleH2 key={block.id} heading={block.heading} id={block.id} body={block.body} components={components} />
          )
        })
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
          {processed}
        </ReactMarkdown>
      )}
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
