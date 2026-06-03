'use client'

import { useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugify } from '@/lib/wiki/headings'

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node)
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children)
  return ''
}

function H1({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return <h1 id={slugify(extractText(children))} {...props}>{children}</h1>
}
function H3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
  return <h3 id={slugify(extractText(children))} {...props}>{children}</h3>
}

const bodyComponents = { h1: H1, h3: H3 }

type Section =
  | { type: 'intro'; body: string }
  | { type: 'h2'; heading: string; id: string; body: string }

function splitSections(markdown: string): Section[] {
  const result: Section[] = []
  const buffer: string[] = []
  let current: { heading: string; id: string } | null = null

  const flush = () => {
    const body = buffer.join('\n').trim()
    if (current === null) {
      if (body) result.push({ type: 'intro', body })
    } else {
      result.push({ type: 'h2', heading: current.heading, id: current.id, body })
    }
    buffer.length = 0
  }

  for (const line of markdown.split('\n')) {
    const m = line.match(/^## (.+)/)
    if (m) {
      flush()
      const heading = m[1].trim()
      current = { heading, id: slugify(heading) }
    } else {
      buffer.push(line)
    }
  }
  flush()
  return result
}

function CollapsibleSection({ heading, id, body }: { heading: string; id: string; body: string }) {
  const [open, setOpen] = useState(true)
  return (
    <section>
      <h2 id={id}>
        <span className="flex-1">{heading}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-normal text-wiki-text-muted px-1.5 py-0.5 rounded border border-wiki-border/50 hover:border-wiki-accent hover:text-wiki-accent transition-colors shrink-0"
        >
          {open ? '접기' : '펼치기'}
        </button>
      </h2>
      {open && (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={bodyComponents}>
          {body}
        </ReactMarkdown>
      )}
    </section>
  )
}

const PROSE = `prose max-w-none text-wiki-text
  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-wiki-border [&_h1]:pb-2
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
  const sections = splitSections(content)
  const hasSections = sections.some((s) => s.type === 'h2')

  return (
    <div className={PROSE}>
      {hasSections ? (
        sections.map((section, i) =>
          section.type === 'intro' ? (
            <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={bodyComponents}>
              {section.body}
            </ReactMarkdown>
          ) : (
            <CollapsibleSection
              key={section.id}
              heading={section.heading}
              id={section.id}
              body={section.body}
            />
          )
        )
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: H1, h3: H3 }}>
          {content}
        </ReactMarkdown>
      )}
    </div>
  )
}
