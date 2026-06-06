'use client'

import { useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { slugify } from '@/lib/wiki/headings'

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

function A({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) {
  const isExternal = !!href && /^[a-z][a-z\d+\-.]*:/i.test(href)
  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  }
  return <a href={href} {...props}>{children}</a>
}

const bodyComponents = { h3: H3, a: A, img: Img }

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

function CollapsibleH2({ heading, id, body }: H2Section) {
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
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={bodyComponents}>
          {body}
        </ReactMarkdown>
      )}
    </section>
  )
}

function CollapsibleH1({ heading, id, intro, h2s }: {
  heading: string; id: string; intro: string; h2s: H2Section[]
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
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={bodyComponents}>
              {intro}
            </ReactMarkdown>
          )}
          {h2s.map((s) => (
            <CollapsibleH2 key={s.id} {...s} />
          ))}
        </>
      )}
    </section>
  )
}

const PROSE = `prose max-w-none text-wiki-text
  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-wiki-border [&_h1]:pb-2 [&_h1]:flex [&_h1]:items-center [&_h1]:gap-2
  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-wiki-border/50 [&_h2]:pb-1 [&_h2]:flex [&_h2]:items-center [&_h2]:gap-2
  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
  [&_p]:my-3 [&_p]:leading-relaxed
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
  [&_img]:max-w-full [&_img]:rounded [&_img]:my-3`

export default function MarkdownContent({ content }: { content: string }) {
  const blocks = splitBlocks(content)
  const hasSections = blocks.some((b) => b.type === 'h1' || b.type === 'h2')

  return (
    <div className={PROSE}>
      {hasSections ? (
        blocks.map((block, i) => {
          if (block.type === 'intro') {
            return (
              <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={bodyComponents}>
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
              />
            )
          }
          return (
            <CollapsibleH2 key={block.id} heading={block.heading} id={block.id} body={block.body} />
          )
        })
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={bodyComponents}>
          {content}
        </ReactMarkdown>
      )}
    </div>
  )
}
